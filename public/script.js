
// DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const unitToggle = document.getElementById('unitToggle');
const themeToggle = document.getElementById('themeToggle');
const favoriteBtn = document.getElementById('favoriteBtn');

const weatherCard = document.getElementById('weatherCard');
const forecastCard = document.getElementById('forecastCard');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const searchHistory = document.getElementById('searchHistory');
const favorites = document.getElementById('favorites');

// Weather data elements
const cityName = document.getElementById('cityName');
const weatherIcon = document.getElementById('weatherIcon');
const temp = document.getElementById('temp');
const tempUnit = document.getElementById('tempUnit');
const feelsLike = document.getElementById('feelsLike');
const feelsLikeUnit = document.getElementById('feelsLikeUnit');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const forecastList = document.getElementById('forecastList');

// App state
let currentWeatherData = null;
let currentUnit = 'metric'; // metric or imperial
let isDarkMode = false;
let searchHistoryData = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
let favoritesData = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

// Event listeners
searchBtn.addEventListener('click', () => getWeatherByCity());
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeatherByCity();
    }
});
cityInput.addEventListener('input', showSearchSuggestions);
locationBtn.addEventListener('click', getWeatherByLocation);
unitToggle.addEventListener('click', toggleUnit);
themeToggle.addEventListener('click', toggleTheme);
favoriteBtn.addEventListener('click', toggleFavorite);

// Hide all display elements
function hideAll() {
    weatherCard.classList.add('hidden');
    forecastCard.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loading.classList.add('hidden');
}

// Show loading state
function showLoading() {
    hideAll();
    loading.classList.remove('hidden');
}

// Show error message
function showError(message) {
    hideAll();
    resetBackgroundToDefault();
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Reset background to default
function resetBackgroundToDefault() {
    const weatherClasses = ['clear-sky', 'few-clouds', 'scattered-clouds', 'broken-clouds', 'shower-rain', 'rain', 'thunderstorm', 'snow', 'mist'];
    document.body.classList.remove(...weatherClasses);
}

// Show weather data
function showWeather(data) {
    hideAll();
    currentWeatherData = data;
    
    cityName.textContent = `${data.city}, ${data.country}`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
    
    updateTemperatureDisplay(data);
    
    description.textContent = data.description;
    humidity.textContent = data.humidity;
    windSpeed.textContent = currentUnit === 'metric' ? data.windSpeed : Math.round(data.windSpeed * 2.237);
    pressure.textContent = data.pressure;
    visibility.textContent = data.visibility;
    
    // Update sun times
    sunrise.textContent = new Date(data.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    sunset.textContent = new Date(data.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Update background
    updateBackgroundBasedOnWeather(data.description, data.icon);
    
    // Update favorite button
    updateFavoriteButton(data.city);
    
    weatherCard.classList.remove('hidden');
    
    // Add to search history
    addToSearchHistory(data.city);
    
    // Get and show forecast
    getForecast(data.city);
}

// Update temperature display based on unit
function updateTemperatureDisplay(data) {
    if (currentUnit === 'metric') {
        temp.textContent = data.temperature;
        feelsLike.textContent = data.feels_like;
        tempUnit.textContent = '°C';
        feelsLikeUnit.textContent = '°C';
    } else {
        temp.textContent = Math.round(data.temperature * 9/5 + 32);
        feelsLike.textContent = Math.round(data.feels_like * 9/5 + 32);
        tempUnit.textContent = '°F';
        feelsLikeUnit.textContent = '°F';
    }
}

// Update background based on weather condition
function updateBackgroundBasedOnWeather(description, icon) {
    resetBackgroundToDefault();
    
    const desc = description.toLowerCase();
    const iconCode = icon.substring(0, 2);
    
    if (desc.includes('clear') || iconCode === '01') {
        document.body.classList.add('clear-sky');
    } else if (desc.includes('few clouds') || iconCode === '02') {
        document.body.classList.add('few-clouds');
    } else if (desc.includes('scattered clouds') || iconCode === '03') {
        document.body.classList.add('scattered-clouds');
    } else if (desc.includes('broken clouds') || desc.includes('overcast') || iconCode === '04') {
        document.body.classList.add('broken-clouds');
    } else if (desc.includes('shower') || iconCode === '09') {
        document.body.classList.add('shower-rain');
    } else if (desc.includes('rain') || iconCode === '10') {
        document.body.classList.add('rain');
    } else if (desc.includes('thunderstorm') || iconCode === '11') {
        document.body.classList.add('thunderstorm');
    } else if (desc.includes('snow') || iconCode === '13') {
        document.body.classList.add('snow');
    } else if (desc.includes('mist') || desc.includes('fog') || desc.includes('haze') || iconCode === '50') {
        document.body.classList.add('mist');
    }
}

// Get weather by city name
async function getWeatherByCity() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`/api/weather/${encodeURIComponent(city)}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch weather data');
        }
        
        showWeather(data);
    } catch (error) {
        showError(error.message);
    }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
    showLoading();
    
    try {
        const response = await fetch(`/api/weather/coords/${lat}/${lon}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch weather data');
        }
        
        showWeather(data);
    } catch (error) {
        showError(error.message);
    }
}

// Get weather by user location
function getWeatherByLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoords(latitude, longitude);
        },
        (error) => {
            let errorMessage = 'Unable to retrieve your location';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied by user';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out';
                    break;
            }
            showError(errorMessage);
        }
    );
}

// Get forecast data
async function getForecast(city) {
    try {
        const response = await fetch(`/api/forecast/${encodeURIComponent(city)}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch forecast data');
        }
        
        showForecast(data);
    } catch (error) {
        console.error('Forecast error:', error);
    }
}

// Show forecast data
function showForecast(forecastData) {
    forecastList.innerHTML = '';
    
    forecastData.forEach(day => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const maxTemp = currentUnit === 'metric' ? day.maxTemp : Math.round(day.maxTemp * 9/5 + 32);
        const minTemp = currentUnit === 'metric' ? day.minTemp : Math.round(day.minTemp * 9/5 + 32);
        const unit = currentUnit === 'metric' ? '°C' : '°F';
        
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}" />
            <div class="forecast-temps">
                <span class="forecast-max">${maxTemp}${unit}</span>
                <span class="forecast-min">${minTemp}${unit}</span>
            </div>
            <div class="forecast-desc">${day.description}</div>
        `;
        
        forecastList.appendChild(forecastItem);
    });
    
    forecastCard.classList.remove('hidden');
}

// Toggle temperature unit
function toggleUnit() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    
    // Update unit toggle button
    unitToggle.textContent = currentUnit === 'metric' ? '°C | °F' : '°F | °C';
    
    // Update wind speed unit
    const windUnit = document.querySelector('.wind-unit');
    windUnit.textContent = currentUnit === 'metric' ? 'm/s' : 'mph';
    
    // Update current weather display if data exists
    if (currentWeatherData) {
        updateTemperatureDisplay(currentWeatherData);
        
        // Update wind speed
        windSpeed.textContent = currentUnit === 'metric' ? 
            currentWeatherData.windSpeed : 
            Math.round(currentWeatherData.windSpeed * 2.237);
        
        // Update forecast if visible
        if (!forecastCard.classList.contains('hidden')) {
            getForecast(currentWeatherData.city);
        }
    }
}

// Toggle theme
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('weatherAppTheme', isDarkMode ? 'dark' : 'light');
}

// Add to search history
function addToSearchHistory(city) {
    if (!searchHistoryData.includes(city)) {
        searchHistoryData.unshift(city);
        searchHistoryData = searchHistoryData.slice(0, 10); // Keep only last 10
        localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistoryData));
        updateSearchHistoryDisplay();
    }
}

// Update search history display
function updateSearchHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    searchHistoryData.forEach(city => {
        const historyItem = document.createElement('button');
        historyItem.className = 'history-item';
        historyItem.textContent = city;
        historyItem.onclick = () => {
            cityInput.value = city;
            getWeatherByCity();
        };
        historyList.appendChild(historyItem);
    });
    
    searchHistory.classList.toggle('hidden', searchHistoryData.length === 0);
}

// Show search suggestions
function showSearchSuggestions() {
    const value = cityInput.value.toLowerCase();
    if (value.length > 0) {
        updateSearchHistoryDisplay();
        updateFavoritesDisplay();
    } else {
        searchHistory.classList.add('hidden');
        favorites.classList.add('hidden');
    }
}

// Toggle favorite
function toggleFavorite() {
    if (!currentWeatherData) return;
    
    const city = currentWeatherData.city;
    const index = favoritesData.indexOf(city);
    
    if (index === -1) {
        favoritesData.push(city);
        favoriteBtn.textContent = '⭐';
        favoriteBtn.classList.add('active');
    } else {
        favoritesData.splice(index, 1);
        favoriteBtn.textContent = '☆';
        favoriteBtn.classList.remove('active');
    }
    
    localStorage.setItem('weatherFavorites', JSON.stringify(favoritesData));
    updateFavoritesDisplay();
}

// Update favorite button
function updateFavoriteButton(city) {
    const isFavorite = favoritesData.includes(city);
    favoriteBtn.textContent = isFavorite ? '⭐' : '☆';
    favoriteBtn.classList.toggle('active', isFavorite);
}

// Update favorites display
function updateFavoritesDisplay() {
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = '';
    
    favoritesData.forEach(city => {
        const favoriteItem = document.createElement('button');
        favoriteItem.className = 'favorite-item';
        favoriteItem.textContent = city;
        favoriteItem.onclick = () => {
            cityInput.value = city;
            getWeatherByCity();
        };
        favoritesList.appendChild(favoriteItem);
    });
    
    favorites.classList.toggle('hidden', favoritesData.length === 0);
}

// Initialize app
function initApp() {
    // Load theme preference
    const savedTheme = localStorage.getItem('weatherAppTheme');
    if (savedTheme === 'dark') {
        toggleTheme();
    }
    
    // Load search history and favorites
    updateSearchHistoryDisplay();
    updateFavoritesDisplay();
    
    // Load default city
    cityInput.value = 'London';
    getWeatherByCity();
}

// Initialize app on page load
window.addEventListener('load', initApp);
