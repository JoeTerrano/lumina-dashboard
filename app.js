// --- State & Constants ---
let state = {
    units: { temp: 'C', time: '24' },
    location: { city: 'New York', lat: 40.7128, lon: -74.0060 },
    links: [
        { name: 'Discuss', url: 'https://discuss.google.dev/' },
        { name: 'AI', url: 'https://ai.google.dev/' },
        { name: 'Cloud', url: 'https://cloud.google.com/' },
        { name: 'Gemini', url: 'https://gemini.google.com/' }
    ]
};

// Load state from LocalStorage
function loadState() {
    const saved = localStorage.getItem('lumina_state');
    if (saved) {
        state = JSON.parse(saved);
        // Sync Modal UI
        document.getElementById('location-input').value = state.location.city;
        document.getElementById('temp-unit').value = state.units.temp;
        document.getElementById('time-format').value = state.units.time;
    }
}

function saveState() {
    localStorage.setItem('lumina_state', JSON.stringify(state));
    renderLinks();
    updateWeather();
}

// --- UI Elements ---
const clockElement = document.getElementById('clock');
const greetingElement = document.getElementById('greeting');
const focusInput = document.getElementById('focus-input');
const focusDisplay = document.getElementById('focus-display');
const focusText = document.getElementById('focus-text');
const completeBtn = document.getElementById('complete-btn');
const inputContainer = document.getElementById('focus-input-container');
const settingsToggle = document.getElementById('settings-toggle');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const launchpad = document.getElementById('launchpad');

// --- Logic ---

// Clock & Greeting
function updateTime() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    let displayH = h;
    let ampm = '';

    if (state.units.time === '12') {
        ampm = h >= 12 ? ' PM' : ' AM';
        displayH = h % 12 || 12;
    }

    const timeStr = `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}${ampm}`;
    clockElement.textContent = timeStr;

    if (h < 12) greetingElement.textContent = "Good Morning";
    else if (h < 18) greetingElement.textContent = "Good Afternoon";
    else greetingElement.textContent = "Good Evening";
}

// Weather (Open-Meteo)
async function updateWeather() {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${state.location.lat}&longitude=${state.location.lon}&current_weather=true`;
        const response = await fetch(url);
        const data = await response.json();
        const weather = data.current_weather;

        let temp = weather.temperature;
        if (state.units.temp === 'F') {
            temp = (temp * 9/5) + 32;
        }

        document.getElementById('temp').textContent = `${Math.round(temp)}°${state.units.temp}`;
        document.getElementById('condition').textContent = decodeWeatherCode(weather.weathercode);
        const locationDisplay = document.getElementById('location-display');
        if (locationDisplay) locationDisplay.textContent = state.location.city;
    } catch (err) {
        console.error("Weather fetch failed:", err);
    }
}

function decodeWeatherCode(code) {
    const codes = { 0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast", 45: "Foggy", 51: "Drizzle", 61: "Rainy", 71: "Snowy", 95: "Thunderstorm" };
    return codes[code] || "Passing Clouds";
}

// Geocoding (Fetch Lat/Lon from City Name)
async function updateLocation(city) {
    try {
        const resp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const data = await resp.json();
        if (data.results && data.results[0]) {
            const res = data.results[0];
            state.location = { city: res.name, lat: res.latitude, lon: res.longitude };
            saveState();
        }
    } catch (err) {
        console.error("Geocoding failed:", err);
    }
}

// Launchpad Management
let draggedItemIndex = null;

function renderLinks() {
    launchpad.innerHTML = '';
    const listManager = document.getElementById('links-list');
    if (listManager) listManager.innerHTML = '';

    state.links.forEach((link, index) => {
        // Render on dashboard
        const a = document.createElement('a');
        a.href = link.url;
        a.target = "_blank";
        a.className = "launch-button";
        a.textContent = link.name;
        launchpad.appendChild(a);

        // Render in settings manager
        if (listManager) {
            const div = document.createElement('div');
            div.className = "link-item";
            div.draggable = true;
            div.id = `link-${index}`;
            div.dataset.index = index;

            div.innerHTML = `
                <div class="drag-handle"><i data-lucide="grip-vertical"></i></div>
                <span>${link.name}</span>
                <button class="remove-link" onclick="removeLink(${index})">&times;</button>
            `;

            // Drag Events
            div.addEventListener('dragstart', (e) => {
                draggedItemIndex = index;
                div.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            div.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            div.addEventListener('drop', (e) => {
                e.preventDefault();
                const targetIndex = index;
                if (draggedItemIndex !== null && draggedItemIndex !== targetIndex) {
                    reorderLinks(draggedItemIndex, targetIndex);
                }
            });

            div.addEventListener('dragend', () => {
                div.classList.remove('dragging');
                draggedItemIndex = null;
            });

            listManager.appendChild(div);
        }
    });
    if (window.lucide) window.lucide.createIcons();
}

function reorderLinks(fromIndex, toIndex) {
    const item = state.links.splice(fromIndex, 1)[0];
    state.links.splice(toIndex, 0, item);
    saveState();
}

window.removeLink = (index) => {
    state.links.splice(index, 1);
    saveState();
};

// --- Events ---

settingsToggle.onclick = () => settingsModal.classList.remove('hidden');
closeSettings.onclick = () => settingsModal.classList.add('hidden');

document.getElementById('add-link-btn').onclick = () => {
    const name = document.getElementById('new-link-name').value;
    const url = document.getElementById('new-link-url').value;
    if (name && url && state.links.length < 8) {
        state.links.push({ name, url });
        document.getElementById('new-link-name').value = '';
        document.getElementById('new-link-url').value = '';
        saveState();
    }
};

document.getElementById('temp-unit').onchange = (e) => {
    state.units.temp = e.target.value;
    saveState();
};

document.getElementById('time-format').onchange = (e) => {
    state.units.time = e.target.value;
    saveState();
};

document.getElementById('location-input').onblur = (e) => {
    if (e.target.value !== state.location.city) {
        updateLocation(e.target.value);
    }
};

// --- Quote Management ---
async function fetchNewQuote() {
    const btn = document.getElementById('refresh-quote-btn');
    const content = document.getElementById('quote-content');
    const quoteEl = document.getElementById('quote');
    const authorEl = document.getElementById('quote-author');

    if (btn) btn.classList.add('spinning');
    if (content) content.classList.add('fade-out');

    try {
        const response = await fetch('https://dummyjson.com/quotes/random');
        const data = await response.json();
        
        setTimeout(() => {
            if (quoteEl) quoteEl.textContent = `"${data.quote}"`;
            if (authorEl) authorEl.textContent = `— ${data.author}`;
            
            if (content) content.classList.remove('fade-out');
            if (btn) btn.classList.remove('spinning');
        }, 300); // Wait for fade out
    } catch (error) {
        console.error("Failed to fetch quote:", error);
        if (content) content.classList.remove('fade-out');
        if (btn) btn.classList.remove('spinning');
    }
}

const refreshBtn = document.getElementById('refresh-quote-btn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', fetchNewQuote);
}

// Focus Persistence (Existing Logic)
focusInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && focusInput.value.trim() !== "") {
        const task = focusInput.value.trim();
        focusText.textContent = task;
        inputContainer.classList.add('hidden');
        focusDisplay.classList.remove('hidden');
        localStorage.setItem('lumina_focus', task);
    }
});

completeBtn.onclick = () => {
    focusDisplay.classList.add('hidden');
    inputContainer.classList.remove('hidden');
    focusInput.value = "";
    localStorage.removeItem('lumina_focus');
};

// --- Init ---
loadState();
updateTime();
renderLinks();
updateWeather();
fetchNewQuote();
setInterval(updateTime, 1000);

const savedFocus = localStorage.getItem('lumina_focus');
if (savedFocus) {
    focusText.textContent = savedFocus;
    inputContainer.classList.add('hidden');
    focusDisplay.classList.remove('hidden');
}
