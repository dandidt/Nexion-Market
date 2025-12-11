
// SVG icons as strings
const upIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#26a69a"><path d="M480-525 291-336l-51-51 240-240 240 240-51 51-189-189Z"/></svg>`;
const downIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#ef5350"><path d="M480-333 240-573l51-51 189 189 189-189 51 51-240 240Z"/></svg>`;

let priceData = {};
let coinMetadata = {};

// Fetch local data.json for coin icons and colors
async function loadCoinMetadata() {
    try {
        const response = await fetch('./data.json');
        const data = await response.json();
        const metadataMap = {};
        data.forEach(item => {
            metadataMap[item.symbol] = {
                link: item.link.trim(),
                name: item.name,       // <-- tambahkan ini
                color: item.color
            };
        });
        coinMetadata = metadataMap;
    } catch (err) {
        console.error('Failed to load data.json:', err);
    }
}

async function fetchCryptoData() {
    try {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'BNBUSDT', 'SOLUSDT', 'TRXUSDT', 'DOGEUSDT', 'ADAUSDT', 'BCHUSDT', 'LINKUSDT', 'LEOUSDT', 'XLMUSDT', 'XMRUSDT', 'ZECUSDT', 'LTCUSDT', 'AVAXUSDT', 'SUIUSDT', 'HBARUSDT', 'DAIUSDT'];
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const binanceData = await response.json();

        const tableBody = document.getElementById('cryptoTable');
        tableBody.innerHTML = '';

        symbols.forEach((symbol, index) => {
            const coinData = binanceData.find(d => d.symbol === symbol);
            if (!coinData) return;

            const baseSymbol = symbol.replace('USDT', '');
            const meta = coinMetadata[baseSymbol] || {
                link: '',
                name: baseSymbol, // fallback ke simbol jika tidak ditemukan
                color: { start: '#667eea', end: '#764ba2' }
            };

            const price = parseFloat(coinData.lastPrice);
            const change24h = parseFloat(coinData.priceChangePercent);
            const volume = parseFloat(coinData.quoteVolume);
            const change1h = (Math.random() - 0.5) * 2;
            const change7d = change24h * (2 + Math.random());
            const marketCap = price * parseFloat(coinData.volume);

            // Format numbers
            const priceFormatted = `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            const marketCapFormatted = `$${(marketCap / 1e9).toFixed(2)}B`;
            const volumeFormatted = `$${(volume / 1e6).toFixed(2)}M`;

            // Choose icon
            const iconImg = meta.link ? `<img src="${meta.link}" alt="${baseSymbol}">` : baseSymbol.charAt(0);

            // Get color gradient
            const startColor = meta.color?.start || '#667eea';
            const endColor = meta.color?.end || '#764ba2';

            // Create change icons
            const icon1h = change1h >= 0 ? upIcon : downIcon;
            const icon24h = change24h >= 0 ? upIcon : downIcon;
            const icon7d = change7d >= 0 ? upIcon : downIcon;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="star">☆</span></td>
                <td>
                    <div class="coin-info">
                        <div class="coin-icon" style="--start-color: ${startColor}; --end-color: ${endColor}">
                            ${iconImg}
                        </div>
                        <div class="coin-name">
                            <strong>${meta.name}</strong>        <!-- NAMA LENGKAP -->
                            <span class="coin-symbol">${baseSymbol}</span>  <!-- TICKER -->
                        </div>
                    </div>
                </td>
                <td class="price">${priceFormatted}</td>
                <td class="${change1h >= 0 ? 'positive' : 'negative'}">
                    <span class="change-icon">${icon1h}</span> ${Math.abs(change1h).toFixed(2)}%
                </td>
                <td class="${change24h >= 0 ? 'positive' : 'negative'}">
                    <span class="change-icon">${icon24h}</span> ${Math.abs(change24h).toFixed(2)}%
                </td>
                <td class="${change7d >= 0 ? 'positive' : 'negative'}">
                    <span class="change-icon">${icon7d}</span> ${Math.abs(change7d).toFixed(2)}%
                </td>
                <td>${marketCapFormatted}</td>
                <td>${volumeFormatted}</td>
                <td>${new Date().toLocaleTimeString('id-ID')}</td>
            `;
            tableBody.appendChild(row);
        });

        tableBody.classList.add('updating');
        setTimeout(() => tableBody.classList.remove('updating'), 500);

    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('cryptoTable').innerHTML = 
            '<tr><td colspan="9" class="loading" style="color: #ef5350;">Error loading data. Retrying...</td></tr>';
    }
}

// Initialize
loadCoinMetadata().then(() => {
    fetchCryptoData();
    setInterval(fetchCryptoData, 10000);
});

// Star toggle
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('star')) {
        e.target.textContent = e.target.textContent === '☆' ? '★' : '☆';
        e.target.style.color = e.target.textContent === '★' ? '#ffd700' : '#8b92b3';
    }
});