export const CONFIG = {
    cryptos: [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', binanceSymbol: 'BTCUSDT', color: '#f7931a' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', binanceSymbol: 'ETHUSDT', color: '#627eea' },
        { id: 'solana', symbol: 'SOL', name: 'Solana', binanceSymbol: 'SOLUSDT', color: '#00d4aa' },
        { id: 'cardano', symbol: 'ADA', name: 'Cardano', binanceSymbol: 'ADAUSDT', color: '#0033ad' },
        { id: 'ripple', symbol: 'XRP', name: 'Ripple', binanceSymbol: 'XRPUSDT', color: '#23292f' }
    ],
    apis: {
        binance: 'https://api.binance.com/api/v3',
        coingecko: 'https://api.coingecko.com/api/v3',
        fearGreed: 'https://api.alternative.me/fng/',
        recommendations: 'http://192.168.1.10:8000'
    },
    updateIntervals: {
        prices: 30000, // 30s
        fearGreed: 300000, // 5min
        global: 60000, //1 min
        chart : 60000,
    },
    chart: {
        defaultVisibleCandles: 50, // Número padrão de candles visíveis no autoajuste
        autoZoomBuffer: 5 // Buffer adicional para o zoom automático
    }
};