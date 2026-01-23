/**
 * CHRISTCHURCH WEATHER DASHBOARD - VANILLA JS PORT
 * Ported from React version
 */

// ==========================================
// CONSTANTS
// ==========================================
const CHRISTCHURCH_COORDS = {
    lat: -43.5321,
    lon: 172.6362,
};

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// ==========================================
// TYPES (JSDoc for intellisense mainly)
// ==========================================
/**
 * @typedef {Object} CurrentWeather
 * @property {number} temperature
 * @property {number} windSpeed
 * @property {number} windDirection
 * @property {number} weatherCode
 * @property {number} isDay
 * @property {string} time
 * @property {number} humidity
 * @property {number} apparentTemperature
 * @property {number} precipitation
 * @property {number} [uvIndex]
 * @property {Object} [uvPeak]
 * @property {number} uvPeak.value
 * @property {string} uvPeak.time
 */

// ==========================================
// HELPERS - ICONS (SVG Strings)
// ==========================================

const getIconGradients = () => `
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="100%" stop-color="#D4AF37" />
    </linearGradient>
    <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3F4F6" />
      <stop offset="100%" stop-color="#9CA3AF" />
    </linearGradient>
    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
`;

const Icons = {
    Sun: (cls) => `
        <svg class="${cls} overflow-visible" viewBox="0 0 64 64">
            ${getIconGradients()}
            <g class="animate-spin-slow origin-center">
                ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg =>
        `<line x1="32" y1="10" x2="32" y2="4" stroke="url(#goldGradient)" stroke-width="4" stroke-linecap="round" transform="rotate(${deg} 32 32)" />`
    ).join('')}
            </g>
            <circle cx="32" cy="32" r="16" fill="url(#goldGradient)" filter="url(#glow)" />
        </svg>
    `,
    Sunrise: (cls) => `
        <svg class="${cls} overflow-visible" viewBox="0 0 64 64">
            ${getIconGradients()}
            <path d="M4 54 L60 54" stroke="url(#silverGradient)" stroke-width="3" stroke-linecap="round" opacity="0.8" />
            <g transform="translate(0, -4)">
                <g class="animate-spin-slow origin-[32px_38px]">
                    ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg =>
        `<line x1="32" y1="24" x2="32" y2="18" stroke="url(#goldGradient)" stroke-width="3" stroke-linecap="round" transform="rotate(${deg} 32 38)" />`
    ).join('')}
                </g>
                <circle cx="32" cy="38" r="10" fill="url(#goldGradient)" filter="url(#glow)" />
            </g>
            <path d="M32 18 L32 8 M26 14 L32 8 L38 14" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" />
        </svg>
    `,
    Sunset: (cls) => `
        <svg class="${cls} overflow-visible" viewBox="0 0 64 64">
            ${getIconGradients()}
            <path d="M4 54 L60 54" stroke="url(#silverGradient)" stroke-width="3" stroke-linecap="round" opacity="0.8" />
            <g transform="translate(0, 4)">
                <g class="animate-spin-slow origin-[32px_38px]">
                    ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg =>
        `<line x1="32" y1="24" x2="32" y2="18" stroke="url(#goldGradient)" stroke-width="3" stroke-linecap="round" transform="rotate(${deg} 32 38)" />`
    ).join('')}
                </g>
                <circle cx="32" cy="38" r="10" fill="url(#goldGradient)" filter="url(#glow)" />
            </g>
            <path d="M32 8 L32 18 M26 12 L32 18 L38 12" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" />
        </svg>
    `,
    Moon: (cls) => `
        <svg class="${cls} overflow-visible animate-float" viewBox="0 0 64 64">
            ${getIconGradients()}
            <path d="M48 32C48 45.2548 37.2548 56 24 56C19.8 56 15.9 54.9 12.5 53C16.5 60 25 62 32 62C48.5685 62 62 48.5685 62 32C62 18.5 55 8 48 3.5C48 3.5 48 18 48 32Z" fill="url(#silverGradient)" filter="url(#glow)" />
        </svg>
    `,
    Cloud: (cls, opacity = "") => `
        <svg class="${cls} overflow-visible animate-float ${opacity}" viewBox="0 0 64 64">
            ${getIconGradients()}
            <path d="M46 48H18C11.3726 48 6 42.6274 6 36C6 29.8 10.6 24.7 16.6 24.1C17.8 15.6 25 9 33.5 9C42.8 9 50.5 15.8 52 24.8C57.6 25.9 62 30.7 62 36.5C62 42.85 56.85 48 50.5 48H46Z" fill="url(#silverGradient)" opacity="0.9" />
        </svg>
    `,
    Rain: (cls) => `
        <svg class="${cls} overflow-visible" viewBox="0 0 64 64">
            ${getIconGradients()}
            <path d="M46 38H18C11.3726 38 6 32.6274 6 26C6 19.8 10.6 14.7 16.6 14.1C17.8 5.6 25 -1 33.5 -1C42.8 -1 50.5 5.8 52 14.8C57.6 15.9 62 20.7 62 26.5C62 32.85 56.85 38 50.5 38H46Z" fill="url(#silverGradient)" />
            <g>
                <path d="M22 42L18 52" stroke="url(#blueGradient)" stroke-width="3" stroke-linecap="round" class="animate-rain" style="animation-delay: 0s" />
                <path d="M32 42L28 52" stroke="url(#blueGradient)" stroke-width="3" stroke-linecap="round" class="animate-rain" style="animation-delay: 0.3s" />
                <path d="M42 42L38 52" stroke="url(#blueGradient)" stroke-width="3" stroke-linecap="round" class="animate-rain" style="animation-delay: 0.6s" />
            </g>
        </svg>
    `,
    Snow: (cls) => `
        <svg class="${cls} overflow-visible" viewBox="0 0 64 64">
             ${getIconGradients()}
            <path d="M46 38H18C11.3726 38 6 32.6274 6 26C6 19.8 10.6 14.7 16.6 14.1C17.8 5.6 25 -1 33.5 -1C42.8 -1 50.5 5.8 52 14.8C57.6 15.9 62 20.7 62 26.5C62 32.85 56.85 38 50.5 38H46Z" fill="url(#silverGradient)" />
            <g class="animate-float-sway">
                <circle cx="20" cy="50" r="2" fill="#fff" />
                <circle cx="32" cy="56" r="2" fill="#fff" />
                <circle cx="44" cy="50" r="2" fill="#fff" />
            </g>
        </svg>
    `,
    Thunder: (cls) => `
        <svg class="${cls} overflow-visible" viewBox="0 0 64 64">
            ${getIconGradients()}
            <path d="M46 38H18C11.3726 38 6 32.6274 6 26C6 19.8 10.6 14.7 16.6 14.1C17.8 5.6 25 -1 33.5 -1C42.8 -1 50.5 5.8 52 14.8C57.6 15.9 62 20.7 62 26.5C62 32.85 56.85 38 50.5 38H46Z" fill="#52525B" />
            <path d="M34 36L24 50H32L30 62L44 46H34L36 36Z" fill="url(#goldGradient)" class="animate-flash" stroke="#fff" stroke-width="1" />
        </svg>
    `,
    UV: (cls) => `
        <svg class="${cls} overflow-visible" viewBox="0 0 64 64">
            ${getIconGradients()}
            <path d="M32 4 L56 14 V28 C56 46 32 60 32 60 C32 60 8 46 8 28 V14 L32 4 Z" fill="none" stroke="url(#goldGradient)" stroke-width="2.5" stroke-linejoin="round" filter="url(#glow)" class="opacity-90" />
            <g class="animate-spin-slow origin-center">
                ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg =>
        `<line x1="32" y1="22" x2="32" y2="16" stroke="url(#goldGradient)" stroke-width="3" stroke-linecap="round" transform="rotate(${deg} 32 32)" />`
    ).join('')}
                <circle cx="32" cy="32" r="8" fill="url(#goldGradient)" />
            </g>
        </svg>
    `,
    Navigation: (cls, style, fill = 'currentColor') => `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" style="${style}">
            <polygon points="3 11 22 2 13 21 11 13 3 11" fill="${fill}" stroke="${fill}" />
        </svg>
    `
};

const getWeatherIcon = (code, isDay, className) => {
    if (code === 0 || code === 1) return isDay ? Icons.Sun(className) : Icons.Moon(className);
    if (code === 2 || code === 3) return Icons.Cloud(className);
    if (code >= 45 && code <= 48) return Icons.Cloud(className, "opacity-75");
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return Icons.Rain(className);
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return Icons.Snow(className);
    if (code >= 95) return Icons.Thunder(className);
    return Icons.Cloud(className);
};

// ==========================================
// HELPERS - DATA UTILS
// ==========================================

const getWeatherDescription = (code) => {
    const codes = {
        0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Foggy',
        51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
        56: 'Freezing Drizzle', 57: 'Freezing Drizzle',
        61: 'Rain', 63: 'Rain', 65: 'Heavy Rain',
        66: 'Freezing Rain', 67: 'Freezing Rain',
        71: 'Snow Fall', 73: 'Snow Fall', 75: 'Snow Fall',
        77: 'Snow Grains',
        80: 'Rain Showers', 81: 'Rain Showers', 82: 'Rain Showers',
        85: 'Snow Showers', 86: 'Snow Showers',
        95: 'Thunderstorm', 96: 'Thunderstorm & Hail', 99: 'Thunderstorm & Hail'
    };
    return codes[code] || 'Unknown';
};

const getMoonPhase = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let c, e, jd, b;
    let y = year;
    let m = month;
    if (month < 3) { y--; m += 12; }
    ++m;
    c = 365.25 * y;
    e = 30.6 * m;
    jd = c + e + day - 694039.09;
    jd /= 29.5305882;
    b = parseInt(jd); // Use integer part
    jd -= b;
    b = Math.round(jd * 8);
    if (b >= 8) b = 0;

    const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    return phases[b];
};

const getWindDirection = (degrees) => {
    const directions = ['NORTH', 'NORTH EAST', 'EAST', 'SOUTH EAST', 'SOUTH', 'SOUTH WEST', 'WEST', 'NORTH WEST'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
};

// ==========================================
// SERVICE - API
// ==========================================

const fetchWeatherData = async () => {
    const params = new URLSearchParams({
        latitude: CHRISTCHURCH_COORDS.lat.toString(),
        longitude: CHRISTCHURCH_COORDS.lon.toString(),
        current: ['temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day', 'precipitation', 'weather_code', 'cloud_cover', 'wind_speed_10m', 'wind_direction_10m'].join(','),
        daily: ['weather_code', 'temperature_2m_max', 'temperature_2m_min', 'sunrise', 'sunset', 'uv_index_max', 'rain_sum'].join(','),
        hourly: ['temperature_2m', 'uv_index'].join(','),
        timezone: 'Pacific/Auckland',
        forecast_days: '8'
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();

    const currentHour = new Date().getHours();
    const currentUV = data.hourly.uv_index[currentHour] || 0;
    const uvToday = data.hourly.uv_index.slice(0, 24);
    const maxUV = Math.max(...uvToday);
    const maxUVIndex = uvToday.indexOf(maxUV);
    const maxUVTimeStr = data.hourly.time[maxUVIndex];

    return {
        current: {
            temperature: data.current.temperature_2m,
            windSpeed: data.current.wind_speed_10m,
            windDirection: data.current.wind_direction_10m,
            weatherCode: data.current.weather_code,
            isDay: data.current.is_day,
            time: data.current.time,
            humidity: data.current.relative_humidity_2m,
            apparentTemperature: data.current.apparent_temperature,
            precipitation: data.current.precipitation,
            uvIndex: currentUV,
            uvPeak: { value: maxUV, time: maxUVTimeStr }
        },
        daily: {
            time: data.daily.time,
            weatherCode: data.daily.weather_code,
            temperatureMax: data.daily.temperature_2m_max,
            temperatureMin: data.daily.temperature_2m_min,
            sunrise: data.daily.sunrise,
            sunset: data.daily.sunset,
            uvIndexMax: data.daily.uv_index_max,
            rainSum: data.daily.rain_sum,
        }
    };
};

// ==========================================
// COMPONENTS Logic
// ==========================================

// --- Background Animation ---
const initWeatherBackground = (weatherCode, isDay, sunrise, sunset, precipitation) => {
    const canvas = document.getElementById('weather-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let stars = [];
    let animationId;

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    // Setup logic
    const isRainCode = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82);
    const isRain = isRainCode || (precipitation > 0 && weatherCode < 70);
    const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
    const isCloudy = weatherCode === 2 || weatherCode === 3 || weatherCode === 45;

    // Remove old listeners to prevent leak if re-init (basic implementation here)
    if (window.bgCancel) window.bgCancel();

    const initParticles = () => {
        particles = [];
        const count = isRain ? 1200 : isSnow ? 400 : 0;
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                speed: Math.random() * 5 + 2,
                length: Math.random() * 30 + 15,
                opacity: Math.random() * 0.5 + 0.1,
                size: Math.random() * 3,
            });
        }
    };

    const initStars = () => {
        stars = [];
        if (!isDay && !isRain && !isSnow && !isCloudy) {
            for (let i = 0; i < 200; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height * 0.85,
                    size: Math.random() * 1.2 + 0.1,
                    opacity: Math.random() * 0.5 + 0.1,
                    twinkleSpeed: Math.random() * 0.02 + 0.005
                });
            }
        }
    };

    initParticles();
    initStars();

    const drawBackground = () => {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (isDay) {
            if (isCloudy || isRain) {
                gradient.addColorStop(0, '#3a4b5c');
                gradient.addColorStop(1, '#6a7b8c');
            } else {
                gradient.addColorStop(0, '#1565C0');
                gradient.addColorStop(0.5, '#42A5F5');
                gradient.addColorStop(1, '#90CAF9');
            }
        } else {
            gradient.addColorStop(0, '#0D1117');
            gradient.addColorStop(0.4, '#1A237E');
            gradient.addColorStop(1, '#311B92');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    };

    const drawCelestialBody = () => {
        if (!sunrise || !sunset) return;
        const now = new Date().getTime();
        const sunriseTime = new Date(sunrise).getTime();
        const sunsetTime = new Date(sunset).getTime();

        let percent = 0;
        if (isDay) {
            percent = (now - sunriseTime) / (sunsetTime - sunriseTime);
        } else {
            const msInDay = 86400000;
            if (now > sunsetTime) {
                percent = (now - sunsetTime) / (msInDay / 2);
            } else {
                percent = 1 - ((sunriseTime - now) / (msInDay / 2));
            }
        }
        const safePercent = Math.max(0, Math.min(1, percent));
        const x = width * (1 - safePercent);
        const horizonY = height * 0.85;
        const zenithY = height * 0.15;
        const y = horizonY - Math.sin(safePercent * Math.PI) * (horizonY - zenithY);

        ctx.save();
        if (isDay) {
            const sunRadius = 70;
            const glow = ctx.createRadialGradient(x, y, sunRadius, x, y, sunRadius * 6);
            glow.addColorStop(0, 'rgba(255, 200, 50, 0.4)');
            glow.addColorStop(0.5, 'rgba(255, 150, 50, 0.1)');
            glow.addColorStop(1, 'rgba(255, 150, 50, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(x, y, sunRadius * 6, 0, Math.PI * 2);
            ctx.fill();

            const core = ctx.createRadialGradient(x, y, 0, x, y, sunRadius);
            core.addColorStop(0, '#FFFFFF');
            core.addColorStop(0.3, '#FFFACD');
            core.addColorStop(1, '#FFD700');
            ctx.fillStyle = core;
            ctx.shadowColor = '#FFA500';
            ctx.shadowBlur = 50;
            ctx.beginPath();
            ctx.arc(x, y, sunRadius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const moonRadius = 50;
            const glow = ctx.createRadialGradient(x, y, moonRadius, x, y, moonRadius * 4);
            glow.addColorStop(0, 'rgba(200, 220, 255, 0.2)');
            glow.addColorStop(1, 'rgba(200, 220, 255, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(x, y, moonRadius * 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#F0F4F8';
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(x, y, moonRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    const drawStars = () => {
        if (isDay) return;
        stars.forEach(star => {
            ctx.globalAlpha = Math.abs(Math.sin(Date.now() * star.twinkleSpeed + star.x));
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    };

    const drawParticles = () => {
        particles.forEach((p) => {
            ctx.beginPath();
            if (isRain) {
                ctx.strokeStyle = \`rgba(174, 194, 224, \${p.opacity})\`;
               ctx.lineWidth = 1.5;
               ctx.moveTo(p.x, p.y);
               ctx.lineTo(p.x, p.y + p.length);
               ctx.stroke();
               p.y += p.speed * 2; 
               if (p.y > height) p.y = -p.length;
           } else if (isSnow) {
               ctx.fillStyle = \`rgba(255, 255, 255, \${p.opacity})\`;
               ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
               ctx.fill();
               p.y += p.speed / 2;
               p.x += Math.sin(p.y / 50) * 0.5;
               if (p.y > height) p.y = -5;
           }
       });
    };

    const loop = () => {
        ctx.clearRect(0,0,width,height);
        drawBackground();
        drawStars();
        drawCelestialBody();
        drawParticles();
        animationId = requestAnimationFrame(loop);
    };

    loop();

    window.bgCancel = () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resize);
    };
};

// ==========================================
// APP LOGIC
// ==========================================

const App = {
    state: {
        data: null,
        loading: true,
        error: null,
        showTotalRain: false,
        currentTime: new Date(),
        lastUpdated: null,
    },

    elements: {},

    init() {
        this.cacheDOM();
        this.renderStaticIcons();
        this.startTimers();
        this.loadData();
    },

    renderStaticIcons() {
        // Inject static SVG icons into placeholders
        const setIcon = (id, iconFn, cls = "w-full h-full") => {
            const el = document.getElementById(id);
            if(el) el.innerHTML = iconFn(cls);
        };

        setIcon('icon-sunset', Icons.Sunset); // Wait, I named it card-icon-sunset in HTML
        // Let's correct the IDs based on HTML I just wrote
        setIcon('card-icon-sunset', Icons.Sunset);
        setIcon('card-icon-rain', Icons.Rain);
        setIcon('card-icon-uv', Icons.UV);
        setIcon('card-icon-moon', Icons.Moon);
        setIcon('card-icon-sunrise', Icons.Sunrise);
    },

    cacheDOM() {
        this.elements = {
            appContainer: document.getElementById('app-container'),
            loading: document.getElementById('loading-screen'),
            error: document.getElementById('error-screen'),
            mainContent: document.getElementById('main-content'),
            
            // Text Elements
            temp: document.getElementById('temp-value'),
            high: document.getElementById('high-value'),
            low: document.getElementById('low-value'),
            desc: document.getElementById('weather-desc'),
            humidity: document.getElementById('humidity-value'),
            windSpeed: document.getElementById('wind-speed'),
            windDir: document.getElementById('wind-dir'),
            windIcon: document.getElementById('wind-icon-container'),
            
            nextSunset: document.getElementById('next-sunset-value'),
            rainValue: document.getElementById('rain-value'),
            rainLabel: document.getElementById('rain-label'),
            uvValue: document.getElementById('uv-value'),
            uvTime: document.getElementById('uv-time'),
            moonPhase: document.getElementById('moon-phase'),
            nextSunrise: document.getElementById('next-sunrise-value'),
            
            // Main Icon
            mainIcon: document.getElementById('main-weather-icon'),
            
            // Footer
            forecastContainer: document.getElementById('forecast-container'),
            
            // Header
            clockTime: document.getElementById('clock-time'),
            clockDate: document.getElementById('clock-date'),
            lastSync: document.getElementById('last-sync'),
            
            // Error
            errorMsg: document.getElementById('error-message'),
            retryBtn: document.getElementById('retry-btn')
        };
        
        if(this.elements.retryBtn) {
            this.elements.retryBtn.addEventListener('click', () => this.loadData());
        }
    },

    startTimers() {
        // Clock
        setInterval(() => {
            this.state.currentTime = new Date();
            this.updateClock();
        }, 1000);

        // Rain Toggle
        setInterval(() => {
            this.state.showTotalRain = !this.state.showTotalRain;
            this.updateRainCard();
        }, 8000);

        // Data Refresh
        setInterval(() => this.loadData(), REFRESH_INTERVAL_MS);
    },

    async loadData() {
        this.setLoading(true);
        try {
            const data = await fetchWeatherData();
            console.log("Weather Data:", data);
            this.state.data = data;
            this.state.lastUpdated = new Date();
            this.state.error = null;
            this.render();
        } catch (err) {
            console.error(err);
            this.state.error = "SYSTEM OFFLINE";
            this.renderError();
        } finally {
            this.setLoading(false);
        }
    },

    setLoading(loading) {
        this.state.loading = loading;
        if(loading && !this.state.data) {
             this.elements.loading.classList.remove('hidden');
             this.elements.mainContent.classList.add('hidden');
             this.elements.error.classList.add('hidden');
        } else {
             this.elements.loading.classList.add('hidden');
        }
    },

    renderError() {
        if(this.state.error && !this.state.data) {
            this.elements.error.classList.remove('hidden');
            this.elements.mainContent.classList.add('hidden');
            this.elements.errorMsg.textContent = this.state.error;
        }
    },

    render() {
        if (!this.state.data) return;
        
        this.elements.mainContent.classList.remove('hidden');
        this.elements.error.classList.add('hidden');

        const { current, daily } = this.state.data;
        const now = new Date();
        
        // Canvas (Safe to re-call, it handles its own cleanup)
        initWeatherBackground(current.weatherCode, !!current.isDay, daily.sunrise[0], daily.sunset[0], current.precipitation);

        // Header Sync Status
        if(this.state.lastUpdated) {
            this.elements.lastSync.textContent = \`DATA SYNC: \${this.state.lastUpdated.toLocaleTimeString('en-NZ', {hour: '2-digit', minute:'2-digit'})}\`;
        }

        // Main Weather
        const displayWeatherCode = current.precipitation > 0 && current.weatherCode < 50 ? 61 : current.weatherCode;
        const displayDescription = current.precipitation > 0 && current.weatherCode < 50 ? "Light Rain" : getWeatherDescription(current.weatherCode);

        // Icons
        this.elements.mainIcon.innerHTML = getWeatherIcon(displayWeatherCode, !!current.isDay, "w-full h-full");

        // Temp
        this.elements.temp.textContent = Math.round(current.temperature);
        this.elements.high.textContent = \`\${Math.round(daily.temperatureMax[0])}°\`;
        this.elements.low.textContent = \`\${Math.round(daily.temperatureMin[0])}°\`;
        this.elements.desc.textContent = displayDescription;

        // Cards
        const todaySunrise = new Date(daily.sunrise[0]);
        const todaySunset = new Date(daily.sunset[0]);
        const tomorrowSunrise = new Date(daily.sunrise[1]);
        const tomorrowSunset = new Date(daily.sunset[1]);

        let nextSunriseTime = now < todaySunrise ? todaySunrise : tomorrowSunrise;
        let nextSunsetTime = now < todaySunset ? todaySunset : tomorrowSunset;

        this.updateTimeElement(this.elements.nextSunset, nextSunsetTime);
        this.updateTimeElement(this.elements.nextSunrise, nextSunriseTime);

        // Wind
        this.elements.windSpeed.textContent = Math.round(current.windSpeed);
        this.elements.windDir.textContent = getWindDirection(current.windDirection);
        this.elements.windIcon.innerHTML = Icons.Navigation("text-[#D4AF37] drop-shadow-lg", \`transform: rotate(\${current.windDirection}deg)\`, "#D4AF37");

        // Rain
        this.updateRainCard(); // Call explicitly to set initial state

        // UV
        const uvPeakTime = current.uvPeak?.time ? new Date(current.uvPeak.time) : new Date();
        const uvPeakTimeStr = uvPeakTime.toLocaleTimeString('en-NZ', {hour: 'numeric', minute:'2-digit'}).replace(" ", "").toLowerCase();
        this.elements.uvValue.textContent = current.uvPeak?.value.toFixed(1);
        this.elements.uvTime.textContent = \`@\${uvPeakTimeStr}\`;

        // Moon
        this.elements.moonPhase.textContent = getMoonPhase(now);

        // Daily Forecast
        this.renderForecast(daily);
    },

    updateRainCard() {
        if(!this.state.data) return;
        const { current, daily } = this.state.data;
        if(this.state.showTotalRain) {
             this.elements.rainValue.innerHTML = \`\${daily.rainSum[0]} <span class="text-2xl text-gray-400">mm</span>\`;
             this.elements.rainLabel.textContent = "Rain (Day)";
        } else {
             this.elements.rainValue.innerHTML = \`\${current.precipitation} <span class="text-2xl text-gray-400">mm</span>\`;
             this.elements.rainLabel.textContent = "Rain (1hr)";
        }
    },

    updateTimeElement(el, date) {
        let hours = date.getHours() % 12 || 12;
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = date.getHours() >= 12 ? 'pm' : 'am';
        
        // We use innerHTML to insert the structure similar to renderTimeWithBlink
        // But for static cards we might not need blink loop there, just time.
        // The original code had blinking on these cards too? 
        // "renderTimeWithBlink" was used for cards too.
        // Let's implement blink via CSS/Class update in the main loop if we want global sync,
        // or just render static here and let the clock loop update specific "seconds" based visible elements.
        // To keep it simple, I will just render static text here and perhaps update it in the clock loop if needed.
        // But the cards usually don't need second-precision blinking updates unless the user stares at them.
        // Actually the original App re-renders everything on state change.
        // I will just render HH:MM ampm here statically for now to avoid complexity,
        // OR I can use the same helper and just update the colon opacity.
        
        el.innerHTML = \`
            <div class="flex items-baseline justify-center">
                <span>\${hours}</span>
                <span class="colon-blink mx-[1px]">:</span>
                <span>\${minutes}</span>
                <span class="text-xl text-gray-400 font-bold ml-1 uppercase">\${ampm}</span>
            </div>
        \`;
    },

    updateClock() {
        const d = this.state.currentTime;
        let hoursRaw = d.getHours();
        const ampm = hoursRaw >= 12 ? 'PM' : 'AM';
        hoursRaw = hoursRaw % 12;
        hoursRaw = hoursRaw ? hoursRaw : 12; 
        const hours = hoursRaw.toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const isEvenSecond = d.getSeconds() % 2 === 0;

        // Update Main Clock
        // We can just update text content of spans if we had them cached individually, 
        // or just re-render the HTML string.
        if (this.elements.clockTime) {
            this.elements.clockTime.innerHTML = \`
                <span class="text-[6.5rem] tracking-tighter">\${hours}</span>
                <span class="text-[5.5rem] mx-2 -mt-4 transition-opacity duration-150 ease-in-out text-[#D4AF37]" style="opacity: \${isEvenSecond ? 1 : 0.2}">:</span>
                <span class="text-[6.5rem] tracking-tighter">\${minutes}</span>
                <span class="text-4xl text-[#D4AF37] ml-4 self-start mt-6">\${ampm}</span>
            \`;
        }
        
        // Update Colon Blinkers elsewhere (Next Sunset/Sunrise)
        const blinkers = document.querySelectorAll('.colon-blink');
        blinkers.forEach(b => {
            b.style.opacity = isEvenSecond ? '1' : '0.2';
            b.style.transition = 'opacity 0.2s';
        });

        // Update Date
        const dateStr = d.toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
        const dateChars = dateStr.split('');
        if (this.elements.clockDate) {
             this.elements.clockDate.innerHTML = dateChars.map(char => 
                \`<span class="text-2xl font-bold text-[#D4AF37] drop-shadow-md">\${char === ' ' ? '&nbsp;' : char}</span>\`
             ).join('');
        }
    },

    renderForecast(daily) {
        if(!this.elements.forecastContainer) return;
        
        const html = daily.time.slice(1, 8).map((t, index) => {
            const dailyIndex = index + 1;
            const date = new Date(t);
            const dayName = date.toLocaleDateString('en-NZ', { weekday: 'short' });
            const icon = getWeatherIcon(daily.weatherCode[dailyIndex], true, "w-full h-full");
            
            return \`
              <div class="flex-1 flex flex-col items-center justify-center border-r border-white/5 last:border-0 px-1 group">
                <span class="text-2xl text-gray-400 font-bold uppercase mb-1 group-hover:text-white transition-colors">\${dayName}</span>
                <div class="w-12 h-12 my-1 transform group-hover:scale-110 transition-transform">
                   \${icon}
                </div>
                <div class="flex gap-2 font-heading text-2xl mt-1">
                  <span class="text-white font-bold">\${Math.round(daily.temperatureMax[dailyIndex])}°</span>
                  <span class="text-gray-700">|</span>
                  <span class="text-gray-500 font-bold">\${Math.round(daily.temperatureMin[dailyIndex])}°</span>
                </div>
              </div>
            \`;
        }).join('');
        
        this.elements.forecastContainer.innerHTML = html;
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
