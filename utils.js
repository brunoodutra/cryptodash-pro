/**
 * Debounces a function, delaying its execution until after a certain amount of time has passed without it being called.
 * @param {Function} func The function to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {Function} The debounced function.
 */
export function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Formats a number as a currency string.
 * @param {number} value The number to format.
 * @returns {string} The formatted currency string.
 */
export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value);
}

/**
 * Formats a number with two decimal places.
 * @param {number} value The number to format.
 * @returns {string} The formatted number string.
 */
export function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Formats a large number into a human-readable string with suffixes (K, M, B, T).
 * @param {number} value The number to format.
 * @returns {string} The formatted large number string.
 */
export function formatLargeNumber(value) {
    if (value >= 1e12) return (value / 1e12).toFixed(2) + 'T';
    if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
    return value.toFixed(2);
}

/**
 * Normalizes a timestamp to the beginning of a candle based on the timeframe.
 * @param {number} timestamp The timestamp to normalize.
 * @param {string} timeframe The chart timeframe (e.g., '1m', '5m', '1h').
 * @returns {number} The normalized timestamp.
 */
export function normalizeTimeToCandle(timestamp, timeframe = '1m') {
    const date = new Date(timestamp * 1000);
    
    switch(timeframe) {
        case '1m':
            date.setSeconds(0, 0);
            break;
        case '5m':
            date.setMinutes(Math.floor(date.getMinutes() / 5) * 5, 0, 0);
            break;
        case '15m':
            date.setMinutes(Math.floor(date.getMinutes() / 15) * 15, 0, 0);
            break;
        case '1h':
            date.setMinutes(0, 0, 0);
            break;
        case '4h':
            date.setHours(Math.floor(date.getHours() / 4) * 4, 0, 0, 0);
            break;
        case '1d':
            date.setHours(0, 0, 0, 0);
            break;
        default:
            date.setSeconds(0, 0);
    }
    
    return Math.floor(date.getTime() / 1000);
}

/**
 * Updates an existing candle or creates a new one.
 * @param {any[]} existingData The array of existing candle data.
 * @param {number} newPrice The new price.
 * @param {number} timestamp The timestamp of the new price.
 * @param {number} volume The volume of the new price.
 * @returns {{type: string, candle: any, index: number}} An object containing the type of update ('update' or 'new'), the updated/new candle, and its index.
 */
export function updateCandleData(existingData, newPrice, timestamp, volume = 0) {
    const candleTime = normalizeTimeToCandle(timestamp);
    const lastCandle = existingData[existingData.length - 1];
    
    if (lastCandle && lastCandle.time === candleTime) {
        // Atualizar candle existente
        const updatedCandle = {
            ...lastCandle,
            high: Math.max(lastCandle.high, newPrice),
            low: Math.min(lastCandle.low, newPrice),
            close: newPrice,
            value: lastCandle.value + volume,
            color: newPrice >= lastCandle.open ? '#10b981' : '#ef4444'
        };
        
        // Substituir o último candle
        existingData[existingData.length - 1] = updatedCandle;
        return { type: 'update', candle: updatedCandle, index: existingData.length - 1 };
    } else {
        // Criar novo candle
        const newCandle = {
            time: candleTime,
            open: newPrice,
            high: newPrice,
            low: newPrice,
            close: newPrice,
            value: volume,
            color: '#26a69a'
        };
        
        existingData.push(newCandle);
        return { type: 'new', candle: newCandle, index: existingData.length - 1 };
    }
}

/**
 * Creates recommendation markers for the chart.
 * @param {any[]} recommendationHistory An array of recommendation history objects.
 * @param {any[]} candlestickData An array of candlestick data objects.
 * @returns {any[]} An array of marker objects for the chart.
 */
export function createRecommendationMarkers(recommendationHistory, candlestickData) {
    return recommendationHistory.map((rec, index) => {
        const recTimestamp = new Date(`${rec.Date}T${rec.Time}Z`).getTime() / 1000;
        let closestCandleTime = null;
        let minDiff = Infinity;
        
        candlestickData.forEach(candle => {
            const diff = Math.abs(candle.time - recTimestamp);
            const intervalSeconds = 4 * 60 * 60; // 4 hours in seconds
            if (diff < minDiff && diff < intervalSeconds * 0.6) {
                minDiff = diff;
                closestCandleTime = candle.time;
            }
        });
        
        if (closestCandleTime === null) return null;
        
        const sortedHistory = [...recommendationHistory].sort((a, b) => 
            new Date(`${b.Date}T${b.Time}Z`) - new Date(`${a.Date}T${a.Time}Z`)
        );
        const isLast = rec === sortedHistory[0];
        
        let markerStyle = {};
        if (rec.recommendation === 'Buy' || rec.recommendation === 'Compra') {
            markerStyle = { 
                position: 'belowBar', 
                color: '#10b981', 
                shape: 'arrowUp', 
                text: 'Buy', 
                size: isLast ? 1.2 : 0.8 
            };
        } else if (rec.recommendation === 'Sell' || rec.recommendation === 'Venda') {
            markerStyle = { 
                position: 'aboveBar', 
                color: '#ef4444', 
                shape: 'arrowDown', 
                text: 'Sell', 
                size: isLast ? 1.2 : 0.8 
            };
        } else {
            return null;
        }
        
        return { time: closestCandleTime, ...markerStyle };
    }).filter(marker => marker !== null);
}