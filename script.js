const API_KEY = 'e37da9bf540393b942e08990dc919de9';
let CITY_NAME_SEARCH = 'Barcelona';
const URL_SEARCH = `http://api.openweathermap.org/geo/1.0/direct?q=${CITY_NAME_SEARCH}&limit=5&appid=${API_KEY}`;
let lat;
let lon;
let dadesTemps;

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('[data-page]');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPage = button.getAttribute('data-page');

            if (targetPage) {
                window.location.href = targetPage;
            }
        });
    });
});

async function obtindreCoordenades(cityName) {
    const URL_SEARCH = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;

    try {
        const response = await fetch(URL_SEARCH);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            lat = data[0].lat;
            lon = data[0].lon;

            console.log(`Coordenades trobades: Lat=${lat}, Lon=${lon}`);
            return { lat: lat, lon: lon };
        } else {
            alert(`No s'ha trobat la ubicació per al nom: ${cityName}.`);
            return null;
        }

    } catch (error) {
        console.error("Error consultant Geocoding API:", error);
        alert("Hi ha hagut un problema en buscar la ciutat. Intenta-ho de nou.");
        return null;
    }
}

async function obtenirDadesTemps(coords) {
    if (!coords) return;

    const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&lang=ca`;

    console.log(`Procedint a buscar el temps a: ${WEATHER_URL}`);

    try {
        const response = await fetch(WEATHER_URL);

        if (!response.ok) {
            throw new Error(`Error HTTP en API Temps: ${response.status}`);
        }

        const data = await response.json();

        return data;

    } catch (error) {
        console.error("Error obtenint dades de temps:", error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#weather-search-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        CITY_NAME_SEARCH = form.querySelector('input[name="cercaWeather"]').value.trim();

        if (CITY_NAME_SEARCH === '') {
            return;
        }

        const coordinates = await obtindreCoordenades(CITY_NAME_SEARCH);

        if (coordinates) {
            dadesTemps = await obtenirDadesTemps(coordinates);
        }

        if (dadesTemps && dadesTemps.main && dadesTemps.weather) {
            alert(`${dadesTemps.weather[0].description} i ${Math.round(dadesTemps.main.temp)}°C a ${CITY_NAME_SEARCH}`);
        } else {
            alert(`No s'ha pogut obtenir dades completes per a ${CITY_NAME_SEARCH}.`);
        }


        form.reset();
    });
});

