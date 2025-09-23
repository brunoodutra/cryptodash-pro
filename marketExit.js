/**
 * Market Exit Indicator Module
 * Implementa indicadores técnicos para detecção de pico do mercado de criptomoedas
 * Versão 1.0 - Atualizado para correção de imports
 */

import { CONFIG } from './config.js';
import { state } from './state.js';
import { fetchData } from './api.js';
import { formatLargeNumber, formatCurrency } from './utils.js';

// Configuração dos indicadores e seus pesos
const INDICATORS_CONFIG = {
    bitcoinDominance: { weight: 0.15, name: 'Bitcoin Dominance' },
    mvrvZScore: { weight: 0.20, name: 'MVRV Z-Score' },
    fearGreed: { weight: 0.10, name: 'Fear & Greed Index' },
    piCycle: { weight: 0.15, name: 'Pi Cycle Top Indicator' },
    puellMultiple: { weight: 0.10, name: 'Puell Multiple' },
    nupl: { weight: 0.10, name: 'NUPL - Net Unrealized P&L' },
    rsi22: { weight: 0.10, name: 'RSI 22-Day' },
    rainbowChart: { weight: 0.10, name: 'Rainbow Chart' }
};

/**
 * Calcula o score do Market Exit baseado nos indicadores
 * @returns {Object} Objeto com score e dados dos indicadores
 */
export async function calculateMarketExitScore() {
    const indicators = await fetchAllIndicators();
    let weightedScore = 0;
    let totalWeight = 0;

    // Calcula score ponderado
    Object.keys(indicators).forEach(key => {
        const config = INDICATORS_CONFIG[key];
        if (config && indicators[key].score !== null) {
            weightedScore += indicators[key].score * config.weight;
            totalWeight += config.weight;
        }
    });

    // Normaliza para 0-100
    const finalScore = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;

    return {
        score: Math.round(finalScore),
        riskLevel: getRiskLevel(finalScore),
        indicators: indicators,
        timestamp: new Date().toISOString()
    };
}

/**
 * Busca todos os indicadores necessários
 */
async function fetchAllIndicators() {
    const [
        bitcoinDominance,
        mvrvZScore,
        fearGreed,
        piCycle,
        puellMultiple,
        nupl,
        rsi22,
        rainbowChart
    ] = await Promise.all([
        fetchBitcoinDominance(),
        fetchMVRVZScore(),
        fetchFearGreedExtended(),
        fetchPiCycleIndicator(),
        fetchPuellMultiple(),
        fetchNUPL(),
        fetchRSI22(),
        fetchRainbowChart()
    ]);

    return {
        bitcoinDominance,
        mvrvZScore,
        fearGreed,
        piCycle,
        puellMultiple,
        nupl,
        rsi22,
        rainbowChart
    };
}

/**
 * Busca dominância do Bitcoin
 */
async function fetchBitcoinDominance() {
    try {
        const data = await fetchData(
            `${CONFIG.apis.coingecko}/global`,
            'bitcoin_dominance',
            300000
        );

        if (data?.data?.market_cap_percentage?.btc) {
            const dominance = data.data.market_cap_percentage.btc;
            
            // Score: maior dominância = menor risco (invertido)
            // 70%+ = score baixo (0-30), 30%- = score alto (70-100)
            let score;
            if (dominance >= 70) score = 10;
            else if (dominance >= 60) score = 25;
            else if (dominance >= 50) score = 40;
            else if (dominance >= 40) score = 60;
            else if (dominance >= 30) score = 80;
            else score = 95;

            return {
                value: dominance.toFixed(1),
                score: score,
                trend: 'stable',
                description: `Dominância de ${dominance.toFixed(1)}%`
            };
        }
    } catch (error) {
        console.error('Erro ao buscar dominância do Bitcoin:', error);
    }

    return { value: null, score: null, trend: 'unknown', description: 'Dados indisponíveis' };
}

/**
 * Busca MVRV Z-Score (mockado com dados realistas)
 */
async function fetchMVRVZScore() {
    try {
        // Mock baseado em dados históricos realistas
        // MVRV Z-Score típico varia entre -1 (undersvalued) e 7+ (overvalued)
        const mockZScore = 2.3 + (Math.random() - 0.5) * 2; // Variação entre 1.3 e 3.3
        
        let score;
        if (mockZScore >= 7) score = 95; // Muito sobrevalorizado
        else if (mockZScore >= 5) score = 85;
        else if (mockZScore >= 3) score = 70;
        else if (mockZScore >= 1) score = 50;
        else if (mockZScore >= 0) score = 30;
        else score = 15; // Subvalorizado

        const trend = mockZScore > 2.5 ? 'up' : 'down';

        return {
            value: mockZScore.toFixed(2),
            score: score,
            trend: trend,
            description: `Z-Score de ${mockZScore.toFixed(2)}`
        };
    } catch (error) {
        console.error('Erro ao buscar MVRV Z-Score:', error);
        return { value: null, score: null, trend: 'unknown', description: 'Dados indisponíveis' };
    }
}

/**
 * Busca Fear & Greed Index extendido
 */
async function fetchFearGreedExtended() {
    try {
        const data = await fetchData(
            CONFIG.apis.fearGreed,
            'fear_greed_extended',
            300000
        );

        if (data?.data?.[0]) {
            const value = parseInt(data.data[0].value);
            
            // Score: extremos de ganância = alto risco
            let score;
            if (value >= 90) score = 95; // Extrema ganância
            else if (value >= 75) score = 80; // Ganância
            else if (value >= 55) score = 60; // Neutro-alto
            else if (value >= 45) score = 40; // Neutro
            else if (value >= 25) score = 25; // Medo
            else score = 15; // Extremo medo

            return {
                value: value,
                score: score,
                trend: value > 50 ? 'up' : 'down',
                description: data.data[0].value_classification
            };
        }
    } catch (error) {
        console.error('Erro ao buscar Fear & Greed Index:', error);
    }

    return { value: null, score: null, trend: 'unknown', description: 'Dados indisponíveis' };
}

/**
 * Busca Pi Cycle Top Indicator (mockado)
 */
async function fetchPiCycleIndicator() {
    try {
        // Mock baseado na distância entre médias móveis
        // Em condições de pico, 111DMA cruza acima de 350DMA x 2
        const distance = Math.random() * 100 - 20; // -20% a 80% de distância
        
        let score;
        if (distance >= 50) score = 90; // Próximo do topo
        else if (distance >= 20) score = 70;
        else if (distance >= 0) score = 50;
        else if (distance >= -10) score = 30;
        else score = 15; // Longe do topo

        const trend = distance > 10 ? 'up' : 'down';

        return {
            value: distance.toFixed(1) + '%',
            score: score,
            trend: trend,
            description: `Distância de ${distance.toFixed(1)}%`
        };
    } catch (error) {
        console.error('Erro ao buscar Pi Cycle Indicator:', error);
        return { value: null, score: null, trend: 'unknown', description: 'Dados indisponíveis' };
    }
}

/**
 * Busca Puell Multiple (mockado)
 */
async function fetchPuellMultiple() {
    try {
        // Mock baseado em ranges históricos
        // Puell Multiple típico: 0.3-8.0
        const mockPuell = 1.5 + (Math.random() - 0.5) * 3; // 0.0 a 3.0
        
        let score;
        if (mockPuell >= 6) score = 95; // Muito alto (venda)
        else if (mockPuell >= 4) score = 80;
        else if (mockPuell >= 2) score = 60;
        else if (mockPuell >= 1) score = 40;
        else if (mockPuell >= 0.5) score = 25;
        else score = 15; // Baixo (compra)

        const trend = mockPuell > 2 ? 'up' : 'down';

        return {
            value: mockPuell.toFixed(2),
            score: score,
            trend: trend,
            description: `Múltiplo de ${mockPuell.toFixed(2)}`
        };
    } catch (error) {
        console.error('Erro ao buscar Puell Multiple:', error);
        return { value: null, score: null, trend: 'unknown', description: 'Dados indisponíveis' };
    }
}

/**
 * Busca NUPL - Net Unrealized P&L (mockado)
 */
async function fetchNUPL() {
    try {
        // Mock baseado em faixas históricas
        // NUPL varia entre -0.5 e +0.9
        const mockNUPL = 0.1 + (Math.random() - 0.5) * 0.6; // -0.2 a +0.4
        
        let score;
        if (mockNUPL >= 0.7) score = 95; // Euphoria (venda)
        else if (mockNUPL >= 0.5) score = 80; // Belief
        else if (mockNUPL >= 0.25) score = 60; // Optimism
        else if (mockNUPL >= 0) score = 40; // Neutral
        else if (mockNUPL >= -0.15) score = 25; // Anxiety
        else score = 15; // Fear/Capitulation

        const trend = mockNUPL > 0.25 ? 'up' : 'down';

        return {
            value: (mockNUPL * 100).toFixed(1) + '%',
            score: score,
            trend: trend,
            description: `NUPL de ${(mockNUPL * 100).toFixed(1)}%`
        };
    } catch (error) {
        console.error('Erro ao buscar NUPL:', error);
        return { value: null, score: null, trend: 'unknown', description: 'Dados indisponíveis' };
    }
}

/**
 * Busca RSI de 22 dias (dados reais da Binance)
 */
async function fetchRSI22() {
    try {
        // Busca dados de 22 dias para BTC
        const btcConfig = CONFIG.cryptos.find(c => c.id === 'bitcoin');
        if (!btcConfig) return { value: null, score: null, trend: 'unknown', description: 'BTC não configurado' };

        const data = await fetchData(
            `${CONFIG.apis.binance}/klines?symbol=${btcConfig.binanceSymbol}&interval=1d&limit=22`,
            'rsi22_data',
            300000
        );

        if (data && data.length >= 22) {
            // Calcula RSI simples de 14 períodos nos últimos 22 dias
            const closes = data.map(candle => parseFloat(candle[4]));
            const rsi = calculateRSI(closes, 14);
            
            let score;
            if (rsi >= 80) score = 90; // Sobrevendido = alto risco
            else if (rsi >= 70) score = 75;
            else if (rsi >= 60) score = 55;
            else if (rsi >= 40) score = 35;
            else if (rsi >= 30) score = 25;
            else score = 20; // Sobrevendido = baixo risco

            const trend = rsi > 50 ? 'up' : 'down';

            return {
                value: rsi.toFixed(1),
                score: score,
                trend: trend,
                description: `RSI de ${rsi.toFixed(1)}`
            };
        }
    } catch (error) {
        console.error('Erro ao buscar RSI22:', error);
    }

    return { value: null, score: null, trend: 'unknown', description: 'Dados indisponíveis' };
}

/**
 * Busca Rainbow Chart (mockado)
 */
async function fetchRainbowChart() {
    try {
        // Mock baseado em faixas de preço do Bitcoin
        // Simula posição nas bandas logarítmicas (0-100%)
        const position = Math.random() * 100;
        
        let score;
        if (position >= 90) score = 95; // Maximum Bubble Territory
        else if (position >= 75) score = 80; // Sell. Really!
        else if (position >= 60) score = 65; // FOMO intensifies
        else if (position >= 45) score = 45; // Is this a bubble?
        else if (position >= 30) score = 30; // HODL
        else if (position >= 15) score = 20; // Still cheap
        else score = 15; // Basically a Fire Sale

        const trend = position > 50 ? 'up' : 'down';

        return {
            value: position.toFixed(1) + '%',
            score: score,
            trend: trend,
            description: `Posição de ${position.toFixed(1)}%`
        };
    } catch (error) {
        console.error('Erro ao buscar Rainbow Chart:', error);
        return { value: null, score: null, trend: 'unknown', description: 'Dados indisponíveis' };
    }
}

/**
 * Calcula RSI (Relative Strength Index)
 */
function calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50; // RSI neutro se dados insuficientes

    let gains = 0;
    let losses = 0;

    // Calcula mudanças iniciais
    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calcula RSI para o último período
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return Math.round(rsi * 10) / 10; // Arredonda para 1 casa decimal
}

/**
 * Determina nível de risco baseado no score
 */
function getRiskLevel(score) {
    if (score <= 33) return { level: 'low', color: 'green', text: 'Baixo Risco', emoji: '🟢' };
    if (score <= 66) return { level: 'moderate', color: 'yellow', text: 'Risco Moderado', emoji: '🟡' };
    return { level: 'high', color: 'red', text: 'Alto Risco', emoji: '🔴' };
}

/**
 * Renderiza o card de Market Exit no dashboard
 */
export async function renderMarketExitCard(container) {
    const marketExitData = await calculateMarketExitScore();
    
    const card = document.createElement('div');
    card.className = 'crypto-card p-6 cursor-pointer market-exit-card';
    card.onclick = () => showMarketExitPage();
    
    const riskLevel = getRiskLevel(marketExitData.score);
    
    card.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <div>
                <h3 class="text-lg font-semibold text-gray-300">Market Exit Indicator</h3>
                <p class="text-3xl font-bold ${riskLevel.color === 'green' ? 'text-green-400' : riskLevel.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}">
                    ${marketExitData.score}/100
                </p>
            </div>
            <div class="text-right">
                <div class="text-4xl mb-1">${riskLevel.emoji}</div>
                <div class="text-sm text-gray-400">${riskLevel.text}</div>
            </div>
        </div>
        
        <div class="space-y-2">
            <div class="flex justify-between text-sm">
                <span class="text-gray-400">Indicadores Ativos:</span>
                <span>${Object.values(marketExitData.indicators).filter(ind => ind.score !== null).length}/8</span>
            </div>
            
            <div class="w-full bg-gray-700 rounded-full h-2 max-w-full">
                <div class="${riskLevel.color === 'green' ? 'bg-green-400' : riskLevel.color === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'} h-2 rounded-full transition-all duration-500" 
                     style="width: ${Math.min(marketExitData.score, 100)}%"></div>
            </div>
            
            <div class="text-xs text-gray-400 mt-2">
                Clique para ver detalhes dos indicadores
            </div>
        </div>
    `;
    
    // Adiciona o card ao container
    container.innerHTML = '';
    container.appendChild(card);
}

/**
 * Mostra a página de Market Exit com todos os indicadores
 */
export async function showMarketExitPage() {
    // Esconde dashboard e mostra página de Market Exit
    document.getElementById('dashboard-page').classList.remove('active');
    document.getElementById('crypto-page').classList.remove('active');
    
    // Cria ou mostra página de Market Exit
    let marketExitPage = document.getElementById('market-exit-page');
    if (!marketExitPage) {
        marketExitPage = document.createElement('div');
        marketExitPage.id = 'market-exit-page';
        marketExitPage.className = 'page-view';
        document.body.appendChild(marketExitPage);
    }
    
    marketExitPage.classList.add('active');
    
    // Busca dados atualizados
    const marketExitData = await calculateMarketExitScore();
    
    // Renderiza conteúdo
    marketExitPage.innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div class="flex items-center space-x-3 mb-6">
                <button class="nav-btn" onclick="closeMarketExitPage()">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar
                </button>
                <h1 class="text-3xl font-bold">
                    <i class="fas fa-exclamation-triangle mr-2 text-yellow-400"></i>
                    Market Exit Indicator
                </h1>
            </div>
            
            <!-- Score Geral -->
            <div class="crypto-card p-6 mb-8">
                <div class="text-center mb-6">
                    <h2 class="text-2xl font-bold mb-2">Score de Risco do Mercado</h2>
                    <div class="text-6xl font-bold mb-2 ${marketExitData.riskLevel.color === 'green' ? 'text-green-400' : marketExitData.riskLevel.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}">
                        ${Math.min(marketExitData.score, 100)}/100
                    </div>
                    <div class="text-xl mb-4">${marketExitData.riskLevel.emoji} ${marketExitData.riskLevel.text}</div>
                    <div class="w-full max-w-md mx-auto bg-gray-700 rounded-full h-4">
                        <div class="${marketExitData.riskLevel.color === 'green' ? 'bg-green-400' : marketExitData.riskLevel.color === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'} h-4 rounded-full transition-all duration-1000" 
                             style="width: ${Math.min(marketExitData.score, 100)}%"></div>
                    </div>
                </div>
                
                <div class="text-center text-gray-400">
                    <p>Última atualização: ${new Date(marketExitData.timestamp).toLocaleString('pt-BR')}</p>
                    <p class="text-sm mt-2">
                        ${marketExitData.score <= 33 ? '🟢 Momento favorável para manter posições' : 
                          marketExitData.score <= 66 ? '🟡 Atenção! Considere reduzir exposição' : 
                          '🔴 Alerta! Momento de considerar saída do mercado'}
                    </p>
                </div>
            </div>
            
            <!-- Grid de Indicadores -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${renderIndicatorCards(marketExitData.indicators)}
            </div>
            
            <!-- Detalhes dos Indicadores -->
            <div class="crypto-card p-6">
                <h3 class="text-xl font-bold mb-4">📊 Detalhamento dos 8 Indicadores Técnicos</h3>
                <div class="space-y-4">
                    ${renderIndicatorDetails(marketExitData.indicators)}
                </div>
            </div>
            
            <!-- Notas Explicativas -->
            <div class="crypto-card p-6 mt-6">
                <h3 class="text-lg font-bold mb-3">ℹ️ Sobre este indicador</h3>
                <div class="text-sm text-gray-400 space-y-2">
                    <p>• O Market Exit Indicator combina 8 métricas diferentes para avaliar o risco atual do mercado de criptomoedas.</p>
                    <p>• Cada indicador tem um peso específico baseado em sua eficácia histórica.</p>
                    <p>• 🟢 0-33: Baixo risco - momento favorável para manter ou aumentar posições.</p>
                    <p>• 🟡 34-66: Risco moderado - considere reduzir exposição ou tomar lucros parciais.</p>
                    <p>• 🔴 67-100: Alto risco - momento de considerar saída significativa do mercado.</p>
                    <p>• ⚠️ Este é um indicador educativo e não deve ser usado como única fonte para decisões de investimento.</p>
                </div>
            </div>
        </div>
    `;
    
    // Adiciona event listener para voltar
    window.closeMarketExitPage = () => {
        marketExitPage.classList.remove('active');
        document.getElementById('dashboard-page').classList.add('active');
    };
}

/**
 * Renderiza cards individuais dos indicadores
 */
function renderIndicatorCards(indicators) {
    return Object.keys(INDICATORS_CONFIG).map(key => {
        const indicator = indicators[key];
        const config = INDICATORS_CONFIG[key];
        
        if (!indicator || indicator.score === null) {
            return `
                <div class="crypto-card p-4 opacity-60">
                    <div class="text-center">
                        <div class="text-sm font-semibold text-gray-400 mb-2">${config.name}</div>
                        <div class="text-lg text-gray-500">Indisponível</div>
                        <div class="text-xs text-gray-600 mt-1">Peso: ${(config.weight * 100).toFixed(0)}%</div>
                    </div>
                </div>
            `;
        }
        
        const riskColor = indicator.score <= 33 ? 'green' : indicator.score <= 66 ? 'yellow' : 'red';
        const emoji = indicator.score <= 33 ? '🟢' : indicator.score <= 66 ? '🟡' : '🔴';
        
        return `
            <div class="crypto-card p-4">
                <div class="text-center">
                    <div class="text-sm font-semibold text-gray-300 mb-2">${config.name}</div>
                    <div class="text-lg font-bold mb-1">${indicator.value}</div>
                    <div class="text-xs mb-2">${indicator.description}</div>
                    <div class="flex items-center justify-center space-x-1 mb-2">
                        <span class="text-lg">${emoji}</span>
                        <span class="text-xs">${indicator.score}/100</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="${riskColor === 'green' ? 'bg-green-400' : riskColor === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'} h-2 rounded-full" 
                             style="width: ${indicator.score}%"></div>
                    </div>
                    <div class="text-xs text-gray-400 mt-1">
                        Peso: ${(config.weight * 100).toFixed(0)}%
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Renderiza detalhes dos indicadores
 */
function renderIndicatorDetails(indicators) {
    const details = [
        {
            name: 'Bitcoin Dominance',
            description: 'Dominância do Bitcoin no mercado total de criptomoedas. Quando muito baixa, indica possível topo de mercado (alt season).',
            source: 'CoinGecko API',
            weight: '15%'
        },
        {
            name: 'MVRV Z-Score',
            description: 'Relação entre valor de mercado e valor realizado. Valores altos indicam sobrevalorização extrema.',
            source: 'Dados on-chain mockados',
            weight: '20%'
        },
        {
            name: 'Fear & Greed Index',
            description: 'Índice de sentimento do mercado. Extrema ganância frequentemente precede correções.',
            source: 'Alternative.me API',
            weight: '10%'
        },
        {
            name: 'Pi Cycle Top Indicator',
            description: 'Cruzamento de médias móveis 111 e 350 dias. Sinais históricos de topo de mercado.',
            source: 'Dados técnicos mockados',
            weight: '15%'
        },
        {
            name: 'Puell Multiple',
            description: 'Múltiplo da receita diária dos miners. Valores extremos indicam pontos de inflexão.',
            source: 'Dados on-chain mockados',
            weight: '10%'
        },
        {
            name: 'NUPL - Net Unrealized P&L',
            description: 'Lucro/prejuízo não realizado da rede. Euphoria indica possível topo.',
            source: 'Dados on-chain mockados',
            weight: '10%'
        },
        {
            name: 'RSI 22-Day',
            description: 'Índice de força relativa de 22 dias do Bitcoin. Sobrevenda extrema em mercados em alta.',
            source: 'Binance API',
            weight: '10%'
        },
        {
            name: 'Rainbow Chart',
            description: 'Posição nas bandas logarítmicas de preço do Bitcoin. Topo da banda = possível venda.',
            source: 'Dados técnicos mockados',
            weight: '10%'
        }
    ];

    return details.map((detail, index) => {
        const key = Object.keys(INDICATORS_CONFIG)[index];
        const indicator = indicators[key];
        
        if (!indicator || indicator.score === null) {
            return `
                <div class="border-l-4 border-gray-600 pl-4 py-2 opacity-60">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-semibold">${detail.name}</h4>
                        <span class="text-xs bg-gray-700 px-2 py-1 rounded">${detail.weight}</span>
                    </div>
                    <div class="text-sm text-gray-500 mb-1">Dados indisponíveis</div>
                    <div class="text-xs text-gray-600">Fonte: ${detail.source}</div>
                </div>
            `;
        }
        
        return `
            <div class="border-l-4 ${indicator.score <= 33 ? 'border-green-400' : indicator.score <= 66 ? 'border-yellow-400' : 'border-red-400'} pl-4 py-2">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold">${detail.name}</h4>
                    <div class="flex items-center space-x-2">
                        <span class="text-sm ${indicator.score <= 33 ? 'text-green-400' : indicator.score <= 66 ? 'text-yellow-400' : 'text-red-400'}">
                            ${indicator.score}/100
                        </span>
                        <span class="text-xs bg-gray-700 px-2 py-1 rounded">${detail.weight}</span>
                    </div>
                </div>
                <div class="text-sm text-gray-300 mb-1">${detail.description}</div>
                <div class="text-xs text-gray-500 mb-1">Valor atual: <span class="font-mono">${indicator.value}</span></div>
                <div class="text-xs text-gray-600">Fonte: ${detail.source}</div>
            </div>
        `;
    }).join('');
}

// Exporta funções principais