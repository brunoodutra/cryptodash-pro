import { CONFIG } from './config.js';
import { state } from './state.js';
import { calculateMarketExitScore } from './marketExit.js';
import { formatLargeNumber, formatCurrency } from './utils.js';
import { updateGauge, updateMarketExitCard, renderCryptoCards, preloadRecommendations } from './ui.js';

/**
 * Fetches data from a URL with caching mechanism.
 * @param {string} url The URL to fetch data from.
 * @param {string|null} cacheKey The key to use for caching the data.
 * @param {number} cacheDuration The duration in milliseconds to cache the data.
 * @returns {Promise<any|null>} A promise that resolves to the fetched data or null if an error occurs.
 */
export async function fetchData(url, cacheKey = null, cacheDuration = 3000) {
    if (cacheKey && state.cache[cacheKey]) {
        const cached = state.cache[cacheKey];
        if (Date.now() - cached.timestamp < cacheDuration) {
            return cached.data;
        }
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'CryptoDash-Pro/1.0'
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        if (cacheKey) {
            state.cache[cacheKey] = {
                data: data,
                timestamp: Date.now()
            };
        }
        
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        return null;    
    }
}

/**
 * Fetches global cryptocurrency market data from the CoinGecko API.
 */
export async function fetchGlobalData() {
    try {
        const data = await fetchData(
            `${CONFIG.apis.coingecko}/global`,
            'global_data',
            CONFIG.updateIntervals.global
        );
        
        if (data && data.data) {
            document.getElementById('global-market-cap').textContent = 
                '$' + formatLargeNumber(data.data.total_market_cap.usd);
            document.getElementById('global-volume').textContent = 
                '$' + formatLargeNumber(data.data.total_volume.usd);
            const btcDominanceValue = data.data.market_cap_percentage.btc.toFixed(1);
            document.getElementById('btc-dominance').textContent = btcDominanceValue + '%';
            
            // Update BTC dominance progress bar
            document.getElementById('btc-dominance-bar').style.width = btcDominanceValue + '%';
        }
    } catch (error) {
        console.error('Error fetching global data:', error);
    }
}

// Function to fetch Fear & Greed Index data
export async function fetchFearGreedIndex() {
    try {
        const data = await fetchData(
            CONFIG.apis.fearGreed,
            'fear_greed',
            CONFIG.updateIntervals.fearGreed
        );
        
        if (data && data.data && data.data[0]) {
            const fgData = data.data[0];
            const value = parseInt(fgData.value);
            const classification = fgData.value_classification;
            
            document.getElementById('fear-greed-number').textContent = value;
            document.getElementById('fear-greed-label').textContent = classification;
            document.getElementById('fear-greed-value').textContent = value;
            
            // Update gauge
            updateGauge(value);
        }
    } catch (error) {
        console.error('Error fetching Fear & Greed Index:', error);
    }
}

/**
 * Fetches 24-hour ticker data for all configured cryptocurrencies from the Binance API.
 */
export async function fetchCryptoData() {
    try {
        const cryptos = CONFIG.cryptos;

        const promises = cryptos.map(async (crypto) => {
            const url = `${CONFIG.apis.binance}/ticker/24hr?symbol=${crypto.binanceSymbol}`;
            const data = await fetchData(url, crypto.symbol, CONFIG.updateIntervals.prices);

            const current_price = parseFloat(data?.lastPrice ?? 0);
            const price_change_percentage_24h = parseFloat(data?.priceChangePercent ?? 0);
            const total_volume = parseFloat(data?.quoteVolume ?? 0); // 24h volume in USDT

            return {
                id: crypto.id,
                symbol: crypto.symbol,
                name: crypto.name,
                image:`https://raw.githubusercontent.com/Cryptofonts/cryptoicons/refs/heads/master/SVG/${crypto.symbol.toLowerCase()}.svg`,
                current_price,
                price_change_percentage_24h,
                market_cap: 0, // Binance não fornece diretamente
                total_volume,
                color: crypto.color
            };
        });

        const data = await Promise.all(promises);

        if (data) {
            renderCryptoCards(data);
            
            // Pre-load recommendations in background for better performance
            // Import the function dynamically to avoid circular dependencies
            if (typeof preloadRecommendations === 'function') {
                preloadRecommendations();
            }
        }

    } catch (error) {
        console.error('Erro ao buscar dados das criptos da Binance:', error);
    }
}

/**
 * Fetches the latest trading recommendation for a given cryptocurrency.
 * @param {string} crypto The cryptocurrency symbol (e.g., 'BTC').
 * @returns {Promise<any|null>} A promise that resolves to the recommendation data or null if an error occurs.
 */
export async function fetchRecommendation(crypto) {
    try {
        const data = await fetchData(
            `${CONFIG.apis.recommendations}/last_recommendation?model_name=${state.settings.model}&crypto=${crypto}`,
            `recommendation_${crypto}_${state.settings.model}`,
            CONFIG.updateIntervals.prices
        );
        return data;
    } catch (error) {
        console.error('Error fetching recommendation:', error);
        return null;
    }
}

/**
 * Fetches the recommendation history for a given cryptocurrency.
 * @param {string} crypto The cryptocurrency symbol (e.g., 'BTC').
 * @returns {Promise<any[]>} A promise that resolves to an array of recommendation history data or an empty array if an error occurs.
 */
export async function fetchRecommendationHistory(crypto) {
    try {
        const data = await fetchData(
            `${CONFIG.apis.recommendations}/recommendation_history?model_name=${state.settings.model}&crypto=${crypto}`,
            `recommendation_history_${crypto}_${state.settings.model}`,
            CONFIG.updateIntervals.prices
        );
        return data || [];
    } catch (error) {
        console.error('Error fetching recommendation history:', error);
        return [];
    }
}

/**
 * Fetches candlestick data for a given cryptocurrency from the Binance API.
 * @param {string} crypto The cryptocurrency symbol (e.g., 'BTC').
 * @param {string|null} interval The chart interval (e.g., '1h', '4h').
 * @param {number|null} limit The number of candles to fetch.
 * @returns {Promise<any[]>} A promise that resolves to an array of candlestick data or an empty array if an error occurs.
 */
export async function fetchCandlestickData(crypto, interval = null, limit = null) {
    const config = CONFIG.cryptos.find(c => c.symbol === crypto);
    if (!config) {
        console.error('Crypto symbol not found:', crypto);
        return [];
    }
    
    const symbol = config.binanceSymbol;
    const actualInterval = interval || state.settings.timeframe;
    const actualLimit = limit || state.settings.candles;
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${actualInterval}&limit=${actualLimit}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error ${response.status} fetching Binance data.`);
        }
        const data = await response.json();
        return data.map(candle => ({
            time: candle[0] / 1000,
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            value: parseFloat(candle[5]),
            color: parseFloat(candle[4]) >= parseFloat(candle[1]) ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
        }));
    } catch (error) {
        console.error('Error fetching candlestick data:', error);
        return [];
    }
}

/**
 * Fetches the target and stop-loss prices for a given cryptocurrency and recommendation.
 * @param {string} crypto The cryptocurrency symbol (e.g., 'BTC').
 * @param {string} recommendation The trading recommendation ('buy' or 'sell').
 * @returns {Promise<any|null>} A promise that resolves to the target and stop-loss data or null if an error occurs.
 */
export async function fetchTargetStop(crypto, recommendation) {
    if (!recommendation || (recommendation.toLowerCase() !== 'buy' && recommendation.toLowerCase() !== 'sell')) {
        return null;
    }

    try {
        const data = await fetchData(
            `${CONFIG.apis.recommendations}/last_target_stop?model_name=${state.settings.model}&crypto=${crypto}&profile=${state.settings.profile}`,
            `target_stop_${crypto}_${state.settings.profile}_${state.settings.model}`,
            CONFIG.updateIntervals.prices
        );
        return data;
    } catch (error) {
        console.error('Error fetching target/stop data:', error);
        return null;
    }
}

/**
 * Fetches Market Exit Indicator data and updates the UI.
 * Uses the calculateMarketExitScore from marketExit.js to calculate the score.
 */
export async function fetchMarketExitData() {
    try {
        // Calculate the market exit score
        const marketExitData = await calculateMarketExitScore();
        
        if (marketExitData) {
            // Update the Market Exit card in the dashboard
            updateMarketExitCard(marketExitData);
            
            // Store the data in state for the detailed page
            state.marketExitData = marketExitData;
        }
        
        return marketExitData;
    } catch (error) {
        console.error('Error fetching Market Exit data:', error);
        
        // Fallback: show error state in the card
        const marketExitCard = document.getElementById('market-exit-card');
        if (marketExitCard) {
            const scoreElement = marketExitCard.querySelector('.market-exit-score');
            const statusElement = marketExitCard.querySelector('.market-exit-status');
            const loadingElement = marketExitCard.querySelector('.market-exit-loading');
            
            if (loadingElement) loadingElement.style.display = 'none';
            if (scoreElement) scoreElement.textContent = 'Error';
            if (statusElement) statusElement.textContent = 'Failed to load data';
        }
        
        return null;
    }
}