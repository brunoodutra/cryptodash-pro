# CryptoDash Pro 📈

Dashboard profissional de criptomoedas com análise técnica avançada, gráficos interativos e recomendações de IA.

## 🚀 Características

- **Dados em Tempo Real**: Monitoramento de Bitcoin, Ethereum, Solana, Cardano e Ripple
- **Análise Técnica Avançada**: Gráficos interativos com TradingView Lightweight Charts
- **Recomendações de IA**: Sistema inteligente de recomendações de trading
- **Fear & Greed Index**: Indicador de sentimento do mercado
- **Interface Responsiva**: Design moderno e adaptável para todos os dispositivos
- **Perfis de Investimento**: Configurações personalizáveis (Conservative, Moderate, Aggressive)

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Gráficos**: TradingView Lightweight Charts
- **Styling**: Tailwind CSS, Font Awesome
- **APIs**: Binance, CoinGecko, Fear & Greed Index

## 📱 Interface

### Dashboard Principal
- Visão geral do mercado global
- Cards de criptomoedas com dados em tempo real
- Indicadores de mercado (Market Cap, Volume, Dominância BTC)

### Análise Individual
- Gráficos de preço com múltiplos timeframes (1H, 4H, 1D, 1W)
- Ferramenta de régua para medições
- Recomendações de IA baseadas em análise técnica

### Configurações
- Seleção de modelo de previsão (CNN, LSTM, GRU)
- Configuração de timeframes e intervalos de atualização
- Perfis de recomendação personalizáveis

## 🚀 Como Usar

1. Acesse o dashboard principal para ver a visão geral do mercado
2. Clique em qualquer criptomoeda para análise detalhada
3. Use os botões de timeframe para diferentes períodos de análise
4. Configure suas preferências no menu de configurações
5. Monitore as recomendações de IA para decisões de trading

## 📊 Funcionalidades Principais

### Busca de Dados
- `fetchCryptoData()`: Busca dados das principais criptomoedas
- `fetchGlobalData()`: Obtém estatísticas globais do mercado
- `fetchFearGreedIndex()`: Coleta índice de medo e ganância
- `fetchRecommendations()`: Busca recomendações de IA

### Renderização
- `renderCryptoCards()`: Exibe cards das criptomoedas
- `renderChart()`: Cria gráficos interativos
- `updateGlobalStats()`: Atualiza estatísticas globais
- `updateFearGreedGauge()`: Atualiza medidor de sentimento

## 🔧 Configuração Local

Para executar localmente:

```bash
# Clone o repositório
git clone https://github.com/brunoodutra/cryptodash-pro.git

# Entre no diretório
cd cryptodash-pro

# Inicie um servidor local
python -m http.server 8080
# ou
npx serve .

# Acesse http://localhost:8080
```

## 🌐 Deploy

Este projeto está configurado para deploy em:
- **Netlify** (Recomendado)
- **Vercel**
- **GitHub Pages**
- **Firebase Hosting**

## 📈 APIs Utilizadas

- **Binance API**: Dados de preço em tempo real
- **CoinGecko API**: Informações de mercado e metadados
- **Fear & Greed Index API**: Sentimento do mercado
- **API de Recomendações**: Sistema de IA para análise técnica

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**CryptoDash Pro** - Desenvolvido com ❤️ para traders e entusiastas de criptomoedas