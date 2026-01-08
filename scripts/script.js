const API_KEY = 'e37da9bf540393b942e08990dc919de9';
let CITY_NAME_SEARCH = 'Barcelona';
let lat;
let lon;
let dadesTemps;

function ferPeticioAjax(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const dades = JSON.parse(xhr.responseText);
                        resolve(dades);
                    } catch (e) {
                        reject("Error processant el JSON de la resposta");
                    }
                } else {
                    reject(`Error HTTP: ${xhr.status}`);
                }
            }
        };

        xhr.send();
    });
}

function carregarUltimResultatTemps() {
    const dataString = sessionStorage.getItem('ultimaCercaTemps');
    const ciutatGuardada = sessionStorage.getItem('ultimaCiutatBuscada');

    if (dataString) {
        try {
            const weatherData = JSON.parse(dataString);
            mostrarResultats(weatherData, ciutatGuardada);
        } catch (e) {
            sessionStorage.removeItem('ultimaCercaTemps');
            sessionStorage.removeItem('ultimaCiutatBuscada');
            console.error("Dades de sessionStorage corruptes.");
        }
    }
}

async function obtindreCoordenades(cityName) {
    const URL_SEARCH = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;

    try {
        const data = await ferPeticioAjax(URL_SEARCH);

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
        console.error("Error consultant Geocoding API via AJAX:", error);
        alert("Hi ha hagut un problema en buscar la ciutat. Intenta-ho de nou.");
        return null;
    }
}

async function obtenirDadesTemps(coords) {
    if (!coords) return;

    const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&lang=ca`;

    console.log(`Procedint a buscar el temps a: ${WEATHER_URL}`);

    try {
        const data = await ferPeticioAjax(WEATHER_URL);

        sessionStorage.setItem('ultimaCercaTemps', JSON.stringify(data));
        sessionStorage.setItem('ultimaCiutatBuscada', data.name);

        return data;

    } catch (error) {
        console.error("Error obtenint dades de temps via AJAX:", error);
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
            mostrarResultats(dadesTemps, CITY_NAME_SEARCH);
        } else {
            console.log(`No s'ha pogut obtenir dades completes.`);
        }

        form.reset();
    });

    carregarUltimResultatTemps();
});

function mostrarResultats(data, cityName) {
    const temperatura = Math.round(data.main.temp);
    const descripcio = data.weather[0].description;
    const iconaId = data.weather[0].icon;
    const nomCiutat = data.name || cityName;

    const iconaUrl = `https://openweathermap.org/img/w/${iconaId}.png`;

    const resultatHtml = `
        <div class="resultat-temps-box">
            <h3>Temps actual a ${nomCiutat} (${data.sys.country})</h3>
            
            <div class="dades-principals">
                <img src="${iconaUrl}" alt="${descripcio}" width="80">
                <p class="temperatura-actual">${temperatura}°C</p>
            </div>

            <p class="descripcio-temps">Estat del cel: ${descripcio}</p>
            <p>Temperatura mínima: ${Math.round(data.main.temp_min)}°C | Temperatura màxima: ${Math.round(data.main.temp_max)}°C</p>
        </div>
    `;

    const resultatElement = document.getElementById('missatgeTemperatura');
    if (resultatElement) {
        resultatElement.innerHTML = resultatHtml;
    }
}