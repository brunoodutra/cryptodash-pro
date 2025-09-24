import { CONFIG } from './config.js';
import { state } from './state.js';
import { fetchCryptoData, fetchFearGreedIndex, fetchGlobalData, fetchMarketExitData } from './api.js';
import { renderCryptoCards, showPage, toggleTheme, toggleViewMode, preloadRecommendations, showCryptoDetail } from './ui.js';
import { changeCrypto, changeTimeframe, home_dashboard, loadLightweightChart, openSettings, resetSettings, saveSettings, toggleRuler, showRulerInfo, clearRuler } from './chart.js';
import { renderMarketExitCard, showMarketExitPage } from './marketExit.js';

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Load settings from storage
    loadSettingsFromStorage();
    
    // Initialize data fetching
    fetchGlobalData();
    fetchFearGreedIndex();
    fetchCryptoData();
    fetchMarketExitData();
    
    // Pre-load recommendations in background for better performance
    setTimeout(() => {
        if (typeof preloadRecommendations === 'function') {
            preloadRecommendations();
        }
    }, 2000); // Delay to allow initial render
    
    // Render Market Exit Card
    renderMarketExitCardComponent();
    
    // Set up intervals for data updates
    setDataIntervals();
    
    // Set default active timeframe button
    const defaultTimeframeBtn = document.querySelector(`[data-timeframe="${state.settings.timeframe}"]`);
    if (defaultTimeframeBtn) {
        defaultTimeframeBtn.classList.add('active');
    }
    
    console.log('Dashboard initialized with settings:', state.settings);
    
    // Make functions globally available for HTML onclick handlers
window.home_dashboard = home_dashboard;
window.toggleRuler = toggleRuler;
window.showCryptoDetail = showCryptoDetail;
window.showRulerInfo = showRulerInfo;
window.clearRuler = clearRuler;
window.showMarketExitPage = showMarketExitPage;

// Debug: Verificar se as funções estão disponíveis globalmente
console.log('🚀 Global functions check:', {
    home_dashboard: typeof window.home_dashboard,
    toggleRuler: typeof window.toggleRuler,
    showMarketExitPage: typeof window.showMarketExitPage
});

    // Add event listeners
    document.getElementById('nav-dashboard').addEventListener('click', () => home_dashboard());
    document.getElementById('nav-portfolio').addEventListener('click', () => showPage('portfolio'));
    document.getElementById('nav-alerts').addEventListener('click', () => showPage('alerts'));
    document.getElementById('investmentProfile').addEventListener('change', (e) => updateProfile(e.target.value));
    document.getElementById('open-settings-btn').addEventListener('click', () => openSettings());
    document.getElementById('theme-toggle-btn').addEventListener('click', () => toggleTheme());
    document.getElementById('view-toggle-btn').addEventListener('click', () => toggleViewMode());
    document.getElementById('back-to-dashboard-btn').addEventListener('click', () => showPage('dashboard'));
    document.getElementById('crypto-selector').addEventListener('change', (e) => changeCrypto(e.target.value));
    document.getElementById('ruler-btn').addEventListener('click', () => toggleRuler());
    document.getElementById('timeframe-buttons').addEventListener('click', (e) => {
        if (e.target.dataset.timeframe) {
            changeTimeframe(e.target.dataset.timeframe);
        }
    });
    document.getElementById('close-settings-btn').addEventListener('click', () => closeSettings());
    document.getElementById('save-settings-btn').addEventListener('click', () => saveSettings());
    document.getElementById('reset-settings-btn').addEventListener('click', () => resetSettings());
});

function loadSettingsFromStorage() {
    const saved = localStorage.getItem('cryptoDashboardSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            state.settings = { ...state.settings, ...settings };
            state.investmentProfile = state.settings.profile;
        } catch (error) {
            console.error('Error loading settings from storage:', error);
        }
    }
}

function setDataIntervals() {
    dataIntervals.push(setInterval(fetchCryptoData, state.settings.updateInterval));
    dataIntervals.push(setInterval(fetchFearGreedIndex, CONFIG.updateIntervals.fearGreed));
    dataIntervals.push(setInterval(fetchGlobalData, CONFIG.updateIntervals.global));
    dataIntervals.push(setInterval(fetchMarketExitData, CONFIG.updateIntervals.marketExit || 300000)); // 5 minutos default
}

let dataIntervals = [];

function clearAllIntervals() {
    dataIntervals.forEach(interval => clearInterval(interval));
    dataIntervals = [];
}

function updateProfile(profile) {
    state.investmentProfile = profile;
    
    // Refresh recommendations if on crypto page
    if (state.currentPage === 'crypto' && state.currentCrypto) {
        loadCryptoRecommendation(state.currentCrypto);
        //Load LightweightChart (now default)
        loadLightweightChart(state.currentCrypto);
    }
    
    // Refresh dashboard recommendations
    if (state.currentPage === 'dashboard') {
        fetchCryptoData();
    }
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showCreateAlert() {
    // TODO: Implement this function
}

// Market Exit Card Component
async function renderMarketExitCardComponent() {
    const container = document.getElementById('market-exit-card-container');
    if (!container) return;
    
    // Render initial card
    await renderMarketExitCard(container);
    
    // Add click event listener
    const card = container.querySelector('.market-exit-card');
    if (card) {
        card.addEventListener('click', () => {
            showMarketExitPage();
        });
    }
}