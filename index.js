
const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Route for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to get current weather data
app.get('/api/weather/:city', async (req, res) => {
  const city = req.params.city;
  
  try {
    const apiKey = "10389e0e65af493a70d7d527cc98e0a1";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    const data = await response.json();
    
    const weatherData = {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : 'N/A',
      icon: data.weather[0].icon,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      coords: {
        lat: data.coord.lat,
        lon: data.coord.lon
      }
    };
    
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// API route to get weather by coordinates
app.get('/api/weather/coords/:lat/:lon', async (req, res) => {
  const { lat, lon } = req.params;
  
  try {
    const apiKey = "10389e0e65af493a70d7d527cc98e0a1";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    const data = await response.json();
    
    const weatherData = {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : 'N/A',
      icon: data.weather[0].icon,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      coords: {
        lat: data.coord.lat,
        lon: data.coord.lon
      }
    };
    
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// API route to get 5-day forecast
app.get('/api/forecast/:city', async (req, res) => {
  const city = req.params.city;
  
  try {
    const apiKey = "10389e0e65af493a70d7d527cc98e0a1";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    const data = await response.json();
    
    // Group forecast by day
    const dailyForecast = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();
      
      if (!dailyForecast[dateKey]) {
        dailyForecast[dateKey] = {
          date: dateKey,
          temps: [],
          descriptions: [],
          icons: [],
          humidity: [],
          windSpeed: []
        };
      }
      
      dailyForecast[dateKey].temps.push(item.main.temp);
      dailyForecast[dateKey].descriptions.push(item.weather[0].description);
      dailyForecast[dateKey].icons.push(item.weather[0].icon);
      dailyForecast[dateKey].humidity.push(item.main.humidity);
      dailyForecast[dateKey].windSpeed.push(item.wind.speed);
    });
    
    // Process daily data
    const forecast = Object.values(dailyForecast).slice(0, 5).map(day => ({
      date: day.date,
      maxTemp: Math.round(Math.max(...day.temps)),
      minTemp: Math.round(Math.min(...day.temps)),
      description: day.descriptions[0],
      icon: day.icons[0],
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length)
    }));
    
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// API route to get forecast by coordinates
app.get('/api/forecast/coords/:lat/:lon', async (req, res) => {
  const { lat, lon } = req.params;
  
  try {
    const apiKey = "10389e0e65af493a70d7d527cc98e0a1";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    const data = await response.json();
    
    // Group forecast by day
    const dailyForecast = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();
      
      if (!dailyForecast[dateKey]) {
        dailyForecast[dateKey] = {
          date: dateKey,
          temps: [],
          descriptions: [],
          icons: [],
          humidity: [],
          windSpeed: []
        };
      }
      
      dailyForecast[dateKey].temps.push(item.main.temp);
      dailyForecast[dateKey].descriptions.push(item.weather[0].description);
      dailyForecast[dateKey].icons.push(item.weather[0].icon);
      dailyForecast[dateKey].humidity.push(item.main.humidity);
      dailyForecast[dateKey].windSpeed.push(item.wind.speed);
    });
    
    // Process daily data
    const forecast = Object.values(dailyForecast).slice(0, 5).map(day => ({
      date: day.date,
      maxTemp: Math.round(Math.max(...day.temps)),
      minTemp: Math.round(Math.min(...day.temps)),
      description: day.descriptions[0],
      icon: day.icons[0],
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length)
    }));
    
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Weather app running on port ${PORT}`);
});
