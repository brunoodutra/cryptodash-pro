// marketExit.js - Market Exit Indicators Module
import { state } from './state.js';
import { formatCurrency, formatNumber } from './utils.js';

// Market Exit Indicators Configuration
const INDICATORS_CONFIG = {
    bitcoinDominance: { weight: 0.15, name: 'Bitcoin Dominance' },
    mvrvZScore: { weight: 0.20, name: 'MVRV Z-Score' },
    fearGreed: { weight: 0.15, name: 'Fear & Greed Index' },
    piCycle: { weight: 0.15, name: 'Pi Cycle Top' },
    puellMultiple: { weight: 0.10, name: 'Puell Multiple' },
    nupl: { weight: 0.10, name: 'NUPL' },
    rsi22: { weight: 0.10, name: 'RSI 22-Day' },
    rainbow: { weight: 0.05, name: 'Rainbow Chart' }
};

// Calculate weighted market exit score
export async function calculateMarketExitScore() {
    try {
        const indicators = await Promise.all([
            getBitcoinDominance(),
            getMVRVZScore(),
            getFearGreedIndex(),
            getPiCycleTop(),
            getPuellMultiple(),
            getNUPL(),
            getRSI22Day(),
            getRainbowChart()
        ]);

        let totalScore = 0;
        let totalWeight = 0;
        const indicatorResults = {};

        Object.keys(INDICATORS_CONFIG).forEach((key, index) => {
            const indicator = indicators[index];
            if (indicator && indicator.score !== null) {
                const weight = INDICATORS_CONFIG[key].weight;
                totalScore += indicator.score * weight;
                totalWeight += weight;
                indicatorResults[key] = indicator;
            }
        });

        const finalScore = totalWeight > 0 ? (totalScore / totalWeight) : 0;
        
        // Store in state
        state.marketExit = {
            score: finalScore,
            indicators: indicatorResults,
            lastUpdate: new Date().toISOString()
        };

        return {
            score: finalScore,
            indicators: indicatorResults,
            level: getRiskLevel(finalScore)
        };
    } catch (error) {
        console.error('Error calculating market exit score:', error);
        return {
            score: 0,
            indicators: {},
            level: 'low',
            error: true
        };
    }
}

// Individual indicator functions
async function getBitcoinDominance() {
    try {
        // Mock data - in real implementation, fetch from CoinGecko
        const dominance = 45.2; // Current BTC dominance percentage
        
        let score = 0;
        let description = '';
        
        if (dominance > 60) {
            score = 0.8;
            description = 'Very high dominance - potential market top signal';
        } else if (dominance > 50) {
            score = 0.6;
            description = 'High dominance - caution advised';
        } else if (dominance > 40) {
            score = 0.4;
            description = 'Moderate dominance - neutral signal';
        } else {
            score = 0.2;
            description = 'Low dominance - altcoin season possible';
        }

        return {
            value: dominance,
            score: score,
            description: description,
            unit: '%'
        };
    } catch (error) {
        console.error('Error fetching Bitcoin Dominance:', error);
        return { value: null, score: null, description: 'Data unavailable', unit: '%' };
    }
}

async function getMVRVZScore() {
    try {
        // Mock data - in real implementation, fetch from on-chain data provider
        const zScore = 2.1;
        
        let score = 0;
        let description = '';
        
        if (zScore > 7) {
            score = 0.9;
            description = 'Extreme overvaluation - strong sell signal';
        } else if (zScore > 3.5) {
            score = 0.7;
            description = 'High overvaluation - consider taking profits';
        } else if (zScore > 1) {
            score = 0.4;
            description = 'Moderate overvaluation - monitor closely';
        } else if (zScore > -1) {
            score = 0.2;
            description = 'Fair value range - neutral';
        } else {
            score = 0.1;
            description = 'Undervalued - potential buying opportunity';
        }

        return {
            value: zScore,
            score: score,
            description: description,
            unit: ''
        };
    } catch (error) {
        console.error('Error fetching MVRV Z-Score:', error);
        return { value: null, score: null, description: 'Data unavailable', unit: '' };
    }
}

async function getFearGreedIndex() {
    try {
        // This should use the same data as the main Fear & Greed display
        const response = await fetch('https://api.alternative.me/fng/');
        const data = await response.json();
        const index = parseInt(data.data[0].value);
        
        let score = 0;
        let description = '';
        
        if (index > 80) {
            score = 0.8;
            description = 'Extreme greed - market top warning';
        } else if (index > 60) {
            score = 0.6;
            description = 'Greed - consider taking profits';
        } else if (index > 40) {
            score = 0.4;
            description = 'Neutral sentiment';
        } else if (index > 20) {
            score = 0.3;
            description = 'Fear - potential buying opportunity';
        } else {
            score = 0.2;
            description = 'Extreme fear - strong buying opportunity';
        }

        return {
            value: index,
            score: score,
            description: description,
            unit: ''
        };
    } catch (error) {
        console.error('Error fetching Fear & Greed Index:', error);
        return { value: null, score: null, description: 'Data unavailable', unit: '' };
    }
}

async function getPiCycleTop() {
    try {
        // Mock data - in real implementation, calculate using Bitcoin price and moving averages
        const currentPrice = 45000; // Current BTC price
        const piCycleLevel = 52000; // Pi Cycle top level
        const ratio = currentPrice / piCycleLevel;
        
        let score = 0;
        let description = '';
        
        if (ratio > 1.1) {
            score = 0.9;
            description = 'Above Pi Cycle top - strong sell signal';
        } else if (ratio > 0.95) {
            score = 0.7;
            description = 'Approaching Pi Cycle top - caution';
        } else if (ratio > 0.8) {
            score = 0.5;
            description = 'Moderate distance from top';
        } else {
            score = 0.3;
            description = 'Well below Pi Cycle top';
        }

        return {
            value: ratio,
            score: score,
            description: description,
            unit: 'ratio'
        };
    } catch (error) {
        console.error('Error calculating Pi Cycle Top:', error);
        return { value: null, score: null, description: 'Data unavailable', unit: 'ratio' };
    }
}

async function getPuellMultiple() {
    try {
        // Mock data - in real implementation, calculate using mining revenue and moving average
        const multiple = 1.8;
        
        let score = 0;
        let description = '';
        
        if (multiple > 4) {
            score = 0.8;
            description = 'Extremely high - market top signal';
        } else if (multiple > 2.5) {
            score = 0.6;
            description = 'High - consider taking profits';
        } else if (multiple > 1) {
            score = 0.4;
            description = 'Normal range';
        } else if (multiple > 0.5) {
            score = 0.3;
            description = 'Low - potential buying opportunity';
        } else {
            score = 0.2;
            description = 'Very low - strong buying signal';
        }

        return {
            value: multiple,
            score: score,
            description: description,
            unit: ''
        };
    } catch (error) {
        console.error('Error calculating Puell Multiple:', error);
        return { value: null, score: null, description: 'Data unavailable', unit: '' };
    }
}

async function getNUPL() {
    try {
        // Mock data - Net Unrealized P&L
        const nupl = 0.65; // Value between -1 and 1
        
        let score = 0;
        let description = '';
        
        if (nupl > 0.75) {
            score = 0.8;
            description = 'Euphoria/Greed - consider selling';
        } else if (nupl > 0.5) {
            score = 0.6;
            description = 'Belief/Denial - monitor closely';
        } else if (nupl > 0.25) {
            score = 0.4;
            description = 'Optimism/Anxiety - neutral';
        } else if (nupl > 0) {
            score = 0.3;
            description = 'Hope/Fear - potential opportunity';
        } else {
            score = 0.2;
            description = 'Capitulation - strong buy signal';
        }

        return {
            value: nupl,
            score: score,
            description: description,
            unit: ''
        };
    } catch (error) {
        console.error('Error calculating NUPL:', error);
        return { value: null, score: null, description: 'Data unavailable', unit: '' };
    }
}

async function getRSI22Day() {
    try {
        // Fetch Bitcoin price data for RSI calculation
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30`);
        const data = await response.json();
        
        if (!data || data.length < 22) {
            throw new Error('Insufficient data for RSI calculation');
        }

        // Calculate RSI
        const closes = data.map(candle => parseFloat(candle[4])); // Close prices
        const rsi = calculateRSI(closes, 22);
        
        let score = 0;
        let description = '';
        
        if (rsi > 80) {
            score = 0.8;
            description = 'Extremely overbought - sell signal';
        } else if (rsi > 70) {
            score = 0.6;
            description = 'Overbought - caution advised';
        } else if (rsi > 50) {
            score = 0.4;
            description = 'Bullish momentum';
        } else if (rsi > 30) {
            score = 0.3;
            description = 'Bearish momentum';
        } else {
            score = 0.2;
            description = 'Oversold - potential buy signal';
        }

        return {
            value: rsi,
            score: score,
            description: description,
            unit: ''
        };
    } catch (error) {
        console.error('Error calculating RSI 22-Day:', error);
        return { value: null, score: null, description: 'Data unavailable', unit: '' };
    }
}

// RSI Calculation Helper
function calculateRSI(prices, period) {
    if (prices.length < period + 1) return null;
    
    let gains = 0;
    let losses = 0;
    
    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Calculate RSI for remaining periods
    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? Math.abs(change) : 0;
        
        avgGain = ((avgGain * (period - 1)) + gain) / period;
        avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    }
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

async function getRainbowChart() {
    try {
        // Mock data - Rainbow Chart bands
        const currentPrice = 45000;
        const rainbowBand = 6; // Band 1-9, where 9 is maximum bubble territory
        
        let score = 0;
        let description = '';
        
        if (rainbowBand >= 9) {
            score = 0.9;
            description = 'Maximum bubble territory - sell';
        } else if (rainbowBand >= 7) {
            score = 0.7;
            description = 'Bubble territory - take profits';
        } else if (rainbowBand >= 5) {
            score = 0.5;
            description = 'HODL zone - hold position';
        } else if (rainbowBand >= 3) {
            score = 0.3;
            description = 'Accumulate zone - good buying';
        } else {
            score = 0.2;
            description = 'Fire sale - strong buy';
        }

        return {
            value: rainbowBand,
            score: score,
            description: description,
            unit: 'band'
        };
    } catch (error) {
        console.error('Error calculating Rainbow Chart:', error);
        return { value: null, score: null, description: 'Data unavailable', unit: 'band' };
    }
}

// Get risk level based on score
export function getRiskLevel(score) {
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    if (score >= 0.3) return 'low';
    return 'very-low';
}

// Render market exit card
export function renderMarketExitCard(data) {
    const card = document.getElementById('market-exit-card');
    if (!card) return;

    const { score, level, error } = data;
    
    if (error) {
        card.innerHTML = `
            <div class="market-exit-error">
                <h3>Market Exit Indicators</h3>
                <p>Unable to load data</p>
                <div class="score-display error">--</div>
            </div>
        `;
        return;
    }

    const scorePercentage = Math.round(score * 100);
    const levelText = {
        'very-low': 'Very Low Risk',
        'low': 'Low Risk', 
        'medium': 'Medium Risk',
        'high': 'High Risk'
    };

    const levelColor = {
        'very-low': '#00ff88',
        'low': '#4CAF50',
        'medium': '#FF9800', 
        'high': '#f44336'
    };

    card.innerHTML = `
        <div class="market-exit-content">
            <h3>Market Exit Score</h3>
            <div class="score-display" style="color: ${levelColor[level]}">
                ${scorePercentage}%
            </div>
            <div class="risk-level" style="color: ${levelColor[level]}">
                ${levelText[level]}
            </div>
            <button onclick="showMarketExitPage()" class="view-details-btn">
                View Details
            </button>
        </div>
    `;
}

// Show detailed market exit page
export function showMarketExitPage() {
    const page = document.getElementById('market-exit-page');
    if (!page) return;

    // Hide other pages
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    page.style.display = 'block';

    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    // Render indicators
    renderMarketExitIndicators();
}

async function renderMarketExitIndicators() {
    const container = document.getElementById('market-exit-indicators');
    if (!container) return;

    try {
        const data = await calculateMarketExitScore();
        const { indicators, score } = data;

        let html = `
            <div class="market-exit-header">
                <h2>Market Exit Indicators</h2>
                <div class="overall-score">
                    <span>Overall Score: </span>
                    <span class="score-value">${Math.round(score * 100)}%</span>
                </div>
            </div>
            <div class="indicators-grid">
        `;

        Object.keys(INDICATORS_CONFIG).forEach(key => {
            const config = INDICATORS_CONFIG[key];
            const indicator = indicators[key];
            
            if (indicator) {
                const scorePercentage = Math.round(indicator.score * 100);
                html += `
                    <div class="indicator-card">
                        <h3>${config.name}</h3>
                        <div class="indicator-value">
                            ${indicator.value !== null ? 
                                `${formatNumber(indicator.value)}${indicator.unit}` : 
                                'N/A'
                            }
                        </div>
                        <div class="indicator-score">
                            Score: ${scorePercentage}%
                        </div>
                        <div class="indicator-description">
                            ${indicator.description}
                        </div>
                        <div class="indicator-weight">
                            Weight: ${Math.round(config.weight * 100)}%
                        </div>
                    </div>
                `;
            }
        });

        html += `
            </div>
            <div class="market-exit-info">
                <h3>How to Use Market Exit Indicators</h3>
                <p>The Market Exit Score combines multiple on-chain and technical indicators to help identify potential market tops. A higher score suggests increased risk of a market correction.</p>
                <ul>
                    <li><strong>0-30%:</strong> Low risk - Good accumulation zone</li>
                    <li><strong>30-50%:</strong> Medium risk - Monitor closely</li>
                    <li><strong>50-70%:</strong> High risk - Consider taking profits</li>
                    <li><strong>70%+:</strong> Very high risk - Strong sell signal</li>
                </ul>
            </div>
        `;

        container.innerHTML = html;
    } catch (error) {
        console.error('Error rendering market exit indicators:', error);
        container.innerHTML = `
            <div class="error-message">
                <h2>Market Exit Indicators</h2>
                <p>Unable to load indicator data. Please try again later.</p>
            </div>
        `;
    }
}

// Make functions globally available
window.showMarketExitPage = showMarketExitPage;