import { state } from './state.js';

/**
 * Toggle Moving Averages Panel visibility
 */
function toggleMAPanel() {
    const panel = document.getElementById('ma-panel');
    const toggleBtn = document.getElementById('ma-toggle-btn');
    const arrow = toggleBtn.querySelector('.dropdown-arrow');
    
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
    } else {
        panel.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
}

/**
 * Aplica as configuraÃ§Ãµes de mÃ©dias mÃ³veis selecionadas
 */
function applyMASettings() {
    console.log('ðŸ”§ Applying MA settings...');
    
    // Check if indicatorsManager is available
    if (!state.indicatorsManager) {
        console.error('âŒ IndicatorsManager not initialized');
        alert('Erro: Sistema de indicadores nÃ£o inicializado. Tente recarregar a pÃ¡gina.');
        return;
    }
    
    // Check if candlestick data is available
    if (!state.candlestickData || state.candlestickData.length === 0) {
        console.error('âŒ No candlestick data available');
        alert('Erro: Dados do grÃ¡fico nÃ£o disponÃ­veis. Selecione uma criptomoeda primeiro.');
        return;
    }
    
    // Get selected MA type
    const maTypeRadio = document.querySelector('input[name="ma-type"]:checked');
    if (!maTypeRadio) {
        console.warn('âš ï¸ No MA type selected');
        alert('Por favor, selecione o tipo de mÃ©dia mÃ³vel (SMA ou EMA)');
        return;
    }
    const maType = maTypeRadio.value;
    
    // Get selected periods
    const selectedPeriods = [];
    const checkboxes = document.querySelectorAll('.period-checkbox input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        selectedPeriods.push(parseInt(checkbox.value));
    });
    
    if (selectedPeriods.length === 0) {
        console.warn('âš ï¸ No periods selected');
        alert('Por favor, selecione pelo menos um perÃ­odo para a mÃ©dia mÃ³vel');
        return;
    }
    
    console.log(`ðŸ“Š Applying ${maType.toUpperCase()} for periods:`, selectedPeriods);
    
    // Apply moving averages
    selectedPeriods.forEach(period => {
        const id = `${maType}${period}`;
        try {
            state.indicatorsManager.addMovingAverage(id, state.candlestickData, period, maType);
            console.log(`âœ… Applied ${maType.toUpperCase()}(${period})`);
        } catch (error) {
            console.error(`âŒ Error applying ${maType.toUpperCase()}(${period}):`, error);
        }
    });
    
    // Update button state
    updateMAToggleButtonState();
    
    console.log('âœ… MA settings applied successfully');
}

/**
 * Manipula mudanças nos checkboxes de período sem aplicar imediatamente.
 * Apenas atualiza o estado visual; a aplicação ocorre ao clicar em "Aplicar".
 */
function handlePeriodCheckboxChange(event) {
    // Não adiciona nem remove indicadores aqui
    updateMAToggleButtonState();
}

/**
 * Atualiza o estado do botÃ£o principal de MA baseado nos checkboxes ativos
 */
function updateMAToggleButtonState() {
    const toggleBtn = document.getElementById('ma-toggle-btn');
    const checkedBoxes = document.querySelectorAll('.period-checkbox input[type="checkbox"]:checked');
    
    if (checkedBoxes.length > 0) {
        toggleBtn.classList.add('active');
    } else {
        toggleBtn.classList.remove('active');
    }
}

/**
 * Clear all Moving Averages
 */
function clearAllMA() {
    console.log('ðŸ§¹ Clearing all Moving Averages');
    
    if (!state.indicatorsManager) {
        console.error('âŒ IndicatorsManager not initialized');
        return;
    }

    // Common MA periods and types to clear
    const periodsToCheck = [10, 20, 50, 100, 200];
    const typesToCheck = ['sma', 'ema'];

    typesToCheck.forEach(type => {
        periodsToCheck.forEach(period => {
            const id = `${type}${period}`;
            try {
                state.indicatorsManager.removeIndicator(id);
            } catch (error) {
                // Silently ignore if indicator doesn't exist
            }
        });
    });

    // Update button state
    const toggleBtn = document.getElementById('ma-toggle-btn');
    toggleBtn.classList.remove('active');

    // Uncheck all checkboxes
    const checkboxes = document.querySelectorAll('.period-checkbox input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    console.log('âœ… All Moving Averages cleared');
}

/**
 * Legacy function for backward compatibility
 */
function toggleMovingAverages() {
    console.log('âš ï¸ Using legacy toggleMovingAverages - consider using new MA panel');
    
    const button = document.getElementById('ma-btn');
    if (!button) {
        console.warn('âš ï¸ Legacy MA button not found');
        return;
    }
    
    const isActive = button.classList.contains('active');
    
    if (!state.indicatorsManager) {
        console.error('âŒ IndicatorsManager not initialized');
        return;
    }
    
    if (isActive) {
        // Remove moving averages
        state.indicatorsManager.removeIndicator('sma20');
        state.indicatorsManager.removeIndicator('sma50');
        button.classList.remove('active');
        console.log('ðŸ”´ Moving Averages disabled');
    } else {
        // Add moving averages
        if (state.candlestickData && state.candlestickData.length > 0) {
            state.indicatorsManager.addMovingAverage('sma20', state.candlestickData, 20, 'sma');
            state.indicatorsManager.addMovingAverage('sma50', state.candlestickData, 50, 'sma');
            button.classList.add('active');
            console.log('ðŸŸ¢ Moving Averages enabled');
        } else {
            console.warn('âš ï¸ No candlestick data available for Moving Averages');
        }
    }
}

/**
 * Toggle do Fibonacci
 */
function toggleFibonacci() {
    console.log('ðŸ”„ Toggling Fibonacci');
    
    const button = document.getElementById('fib-btn');
    const isActive = button.classList.contains('active');
    
    if (!state.indicatorsManager) {
        console.error('âŒ IndicatorsManager not initialized');
        return;
    }
    
    if (isActive) {
        // Remover Fibonacci
        state.indicatorsManager.removeIndicator('fibonacci');
        button.classList.remove('active');
        console.log('ðŸ”´ Fibonacci disabled');
    } else {
        // Adicionar Fibonacci
        if (state.candlestickData && state.candlestickData.length > 0) {
            state.indicatorsManager.addFibonacci('fibonacci', state.candlestickData);
            button.classList.add('active');
            console.log('ðŸŸ¢ Fibonacci enabled');
        } else {
            console.warn('âš ï¸ No candlestick data available for Fibonacci');
        }
    }
}

/**
 * Toggle do RSI
 */
function toggleRSI() {
    console.log('ðŸ”„ Toggling RSI');
    
    const button = document.getElementById('rsi-btn');
    const isActive = button.classList.contains('active');
    
    if (!state.indicatorsManager) {
        console.error('âŒ IndicatorsManager not initialized');
        return;
    }
    
    if (isActive) {
        // Remover RSI
        state.indicatorsManager.removeIndicator('rsi');
        button.classList.remove('active');
        console.log('ðŸ”´ RSI disabled');
    } else {
        // Adicionar RSI
        if (state.candlestickData && state.candlestickData.length > 0) {
            state.indicatorsManager.addRSI('rsi', state.candlestickData);
            button.classList.add('active');
            console.log('ðŸŸ¢ RSI enabled');
        } else {
            console.warn('âš ï¸ No candlestick data available for RSI');
        }
    }
}

/**
 * Toggle do MACD
 */
function toggleMACD() {
    console.log('ðŸ”„ Toggling MACD');
    
    const button = document.getElementById('macd-btn');
    const isActive = button.classList.contains('active');
    
    if (!state.indicatorsManager) {
        console.error('âŒ IndicatorsManager not initialized');
        return;
    }
    
    if (isActive) {
        // Remover MACD
        state.indicatorsManager.removeIndicator('macd');
        button.classList.remove('active');
        console.log('ðŸ”´ MACD disabled');
    } else {
        // Adicionar MACD
        if (state.candlestickData && state.candlestickData.length > 0) {
            state.indicatorsManager.addMACD('macd', state.candlestickData);
            button.classList.add('active');
            console.log('ðŸŸ¢ MACD enabled');
        } else {
            console.warn('âš ï¸ No candlestick data available for MACD');
        }
    }
}

/**
 * Atualiza todos os indicadores ativos quando os dados do grÃ¡fico mudam
 */
function updateIndicators() {
    console.log('ðŸ”„ Updating active indicators');
    
    if (!state.indicatorsManager || !state.candlestickData) {
        console.warn('âš ï¸ IndicatorsManager or candlestick data not available');
        return;
    }
    
    // Verificar quais indicadores estÃ£o ativos e atualizÃ¡-los
    const maBtn = document.getElementById('ma-btn');
    const fibBtn = document.getElementById('fib-btn');
    const rsiBtn = document.getElementById('rsi-btn');
    const macdBtn = document.getElementById('macd-btn');
    
    if (maBtn && maBtn.classList.contains('active')) {
        state.indicatorsManager.updateMovingAverage('sma20', state.candlestickData, 20, 'sma');
        state.indicatorsManager.updateMovingAverage('sma50', state.candlestickData, 50, 'sma');
    }
    
    if (fibBtn && fibBtn.classList.contains('active')) {
        state.indicatorsManager.updateFibonacci('fibonacci', state.candlestickData);
    }
    
    if (rsiBtn && rsiBtn.classList.contains('active')) {
        state.indicatorsManager.updateRSI('rsi', state.candlestickData);
    }
    
    if (macdBtn && macdBtn.classList.contains('active')) {
        state.indicatorsManager.updateMACD('macd', state.candlestickData);
    }
    
    console.log('âœ… Indicators updated');
}

// Export functions for global access
// Make functions globally available
window.toggleMAPanel = toggleMAPanel;
window.applyMASettings = applyMASettings;
window.clearAllMA = clearAllMA;
window.toggleFibonacci = toggleFibonacci;
window.toggleRSI = toggleRSI;
window.toggleMACD = toggleMACD;

export { toggleMAPanel, applyMASettings, clearAllMA, handlePeriodCheckboxChange, updateMAToggleButtonState, toggleMovingAverages, toggleFibonacci, toggleRSI, toggleMACD, updateIndicators };
