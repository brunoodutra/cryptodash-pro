import { state } from './state.js';
import { ensureAuthReady, getSupabaseClient, isLoggedIn, requireAuthThenNavigate } from './auth.js';
import { showNotification } from './ui.js';
import { CONFIG } from './config.js';

function setAlertBadge(count) {
    const badge = document.getElementById('alert-count');
    if (!badge) return;
    if (!count) {
        badge.style.display = 'none';
        badge.textContent = '0';
        return;
    }
    badge.style.display = 'inline-block';
    badge.textContent = String(count);
}

function formatCondition(alert) {
    const op = alert.operator === 'gte' ? '>=' : alert.operator === 'lte' ? '<=' : alert.operator || '';
    const price = typeof alert.target_price === 'number' ? alert.target_price : Number(alert.target_price);
    const symbol = alert.crypto_symbol || '';
    return `${symbol} ${op} ${price}`;
}

function renderAlerts() {
    const container = document.getElementById('alerts-list');
    if (!container) return;

    if (!state.alerts?.length) {
        container.innerHTML = `<p class="text-gray-400 text-center py-8">Nenhum alerta configurado</p>`;
        setAlertBadge(0);
        return;
    }

    container.innerHTML = state.alerts.map(a => {
        const enabled = a.enabled !== false;
        return `
            <div class="flex items-center justify-between py-3 border-b border-gray-700">
                <div>
                    <div class="font-semibold">${formatCondition(a)}</div>
                    <div class="text-xs text-gray-400">${enabled ? 'Ativo' : 'Pausado'}${a.note ? ` • ${a.note}` : ''}</div>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="nav-btn" data-alert-toggle="${a.id}">${enabled ? 'Pausar' : 'Ativar'}</button>
                    <button class="nav-btn" data-alert-delete="${a.id}">Excluir</button>
                </div>
            </div>
        `;
    }).join('');

    setAlertBadge(state.alerts.length);
}

async function fetchAlerts() {
    await ensureAuthReady();
    if (!isLoggedIn()) return [];
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const userId = state.auth.user.id;
    const { data, error } = await supabase
        .from('alerts')
        .select('id,user_id,crypto_id,crypto_symbol,operator,target_price,enabled,note,created_at,updated_at,last_triggered_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function refreshAlerts() {
    try {
        state.alerts = await fetchAlerts();
        renderAlerts();
    } catch (error) {
        console.error('Falha ao carregar alertas:', error);
        showNotification('Falha ao carregar alertas.', 'error');
    }
}

function openAlertModal() {
    const modal = document.getElementById('alert-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.style.display = 'block';

    const cryptoSel = document.getElementById('alert-crypto');
    if (cryptoSel && !cryptoSel.dataset.ready) {
        cryptoSel.innerHTML = CONFIG.cryptos.map(c => `<option value="${c.id}">${c.name} (${c.symbol})</option>`).join('');
        cryptoSel.dataset.ready = '1';
    }
}

function closeAlertModal() {
    const modal = document.getElementById('alert-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

async function createAlertFromForm() {
    await ensureAuthReady();
    const ok = await requireAuthThenNavigate('alerts');
    if (!ok) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const cryptoId = document.getElementById('alert-crypto')?.value;
    const operator = document.getElementById('alert-operator')?.value;
    const priceStr = document.getElementById('alert-price')?.value;
    const note = document.getElementById('alert-note')?.value?.trim() || null;
    const enabled = Boolean(document.getElementById('alert-enabled')?.checked);

    const crypto = CONFIG.cryptos.find(c => c.id === cryptoId);
    const target_price = Number(priceStr);

    if (!crypto || !operator || !Number.isFinite(target_price)) {
        showNotification('Preencha os dados do alerta.', 'error');
        return;
    }

    const payload = {
        user_id: state.auth.user.id,
        crypto_id: crypto.id,
        crypto_symbol: crypto.symbol,
        operator,
        target_price,
        enabled,
        note,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('alerts').insert(payload);
    if (error) {
        showNotification(error.message || 'Falha ao criar alerta.', 'error');
        return;
    }

    closeAlertModal();
    showNotification('Alerta criado.', 'success');
    await refreshAlerts();
}

async function deleteAlert(id) {
    await ensureAuthReady();
    if (!isLoggedIn()) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase.from('alerts').delete().eq('id', id);
    if (error) {
        showNotification(error.message || 'Falha ao excluir alerta.', 'error');
        return;
    }
    showNotification('Alerta excluído.', 'success');
    await refreshAlerts();
}

async function toggleAlert(id) {
    await ensureAuthReady();
    if (!isLoggedIn()) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const alert = state.alerts.find(a => String(a.id) === String(id));
    if (!alert) return;

    const nextEnabled = !(alert.enabled !== false);
    const { error } = await supabase
        .from('alerts')
        .update({ enabled: nextEnabled, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        showNotification(error.message || 'Falha ao atualizar alerta.', 'error');
        return;
    }

    await refreshAlerts();
}

export function wireAlertsUI() {
    const createBtn = document.getElementById('create-alert-btn');
    const closeBtn = document.getElementById('close-alert-btn');
    const form = document.getElementById('alert-form');
    const list = document.getElementById('alerts-list');

    if (createBtn) createBtn.addEventListener('click', async () => {
        const ok = await requireAuthThenNavigate('alerts');
        if (!ok) return;
        openAlertModal();
    });

    if (closeBtn) closeBtn.addEventListener('click', () => closeAlertModal());

    if (form) form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createAlertFromForm();
    });

    if (list) {
        list.addEventListener('click', async (e) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) return;

            const delId = target.getAttribute('data-alert-delete');
            const toggleId = target.getAttribute('data-alert-toggle');
            if (delId) await deleteAlert(delId);
            if (toggleId) await toggleAlert(toggleId);
        });
    }
}

