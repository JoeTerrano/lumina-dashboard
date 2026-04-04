// DOM Elements
const clockElement = document.getElementById('clock');
const greetingElement = document.getElementById('greeting');
const focusInput = document.getElementById('focus-input');
const focusDisplay = document.getElementById('focus-display');
const focusText = document.getElementById('focus-text');
const completeBtn = document.getElementById('complete-btn');
const inputContainer = document.getElementById('focus-input-container');

// Update Clock and Greeting
function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Format: HH:MM:SS
    clockElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Update Greeting
    if (hours < 12) {
        greetingElement.textContent = "Good Morning";
    } else if (hours < 18) {
        greetingElement.textContent = "Good Afternoon";
    } else {
        greetingElement.textContent = "Good Evening";
    }
}

// Initial Call
updateTime();
setInterval(updateTime, 1000);

// Focus Task Logic
focusInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && focusInput.value.trim() !== "") {
        const task = focusInput.value.trim();
        focusText.textContent = task;
        
        // Hide input, show display
        inputContainer.classList.add('hidden');
        focusDisplay.classList.remove('hidden');
        
        // Save to local storage (optional, for persistence)
        localStorage.setItem('focusTask', task);
    }
});

completeBtn.addEventListener('click', () => {
    // Reset state
    focusDisplay.classList.add('hidden');
    inputContainer.classList.remove('hidden');
    focusInput.value = "";
    
    // Clear storage
    localStorage.removeItem('focusTask');
    
    // Add a simple celebration effect (optional)
    completeBtn.textContent = "Done! 🎉";
    setTimeout(() => {
        completeBtn.textContent = "Complete";
    }, 2000);
});

// Load task from local storage if exists
window.addEventListener('load', () => {
    const savedTask = localStorage.getItem('focusTask');
    if (savedTask) {
        focusText.textContent = savedTask;
        inputContainer.classList.add('hidden');
        focusDisplay.classList.remove('hidden');
    }
});

// Simple Mock Weather (could be real with an API key)
function updateWeather() {
    const temperatures = [21, 22, 23, 24, 25, 20];
    const conditions = ["Partly Cloudy", "Sunny", "Clear Skies", "Light Breeze"];
    
    const randomTemp = temperatures[Math.floor(Math.random() * temperatures.length)];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    document.getElementById('temp').textContent = `${randomTemp}°C`;
    document.getElementById('condition').textContent = randomCondition;
}

updateWeather();
setInterval(updateWeather, 600000); // Update every 10 mins
