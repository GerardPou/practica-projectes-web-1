document.addEventListener('DOMContentLoaded', () => {
    const botonAbrir = document.querySelector('#Button_CrearViaje');
    const botonCerrar = document.querySelector('#btn-cancelar');
    const botonX = document.querySelector('#btn-x-cerrar');
    const botonGuardar = document.getElementById('btn-guardar');

    const modalActivitatEl = document.getElementById('modalNovaActivitat');
    const modalActivitat = new bootstrap.Modal(modalActivitatEl);
    const btnObrirModalActivitat = document.getElementById('btn-obrir-modal-activitat');
    const btnGuardarActivitat = document.getElementById('btn-guardar-activitat');
    const titolModalActivitat = document.getElementById('titolModalActivitat');

    const API_KEY = 'e37da9bf540393b942e08990dc919de9';

    let misViajes = [];
    let indiceViajeSeleccionado = null;
    let indiceActivitatEdicio = -1;

    const elementoModal = document.getElementById('miModalBootstrap');
    const miModal = new bootstrap.Modal(elementoModal);

    botonAbrir.addEventListener('click', () => miModal.show());
    botonCerrar.addEventListener('click', () => miModal.hide());
    botonX.addEventListener('click', () => miModal.hide());
    botonGuardar.addEventListener('click', () => guardarViajeForm(miModal));

    const ViajesGuardados = localStorage.getItem('misViajes');
    if (ViajesGuardados != null) {
        misViajes = JSON.parse(ViajesGuardados);
        printarViajes();
    }

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
                            reject("Error processant el JSON");
                        }
                    } else {
                        reject(`Error HTTP: ${xhr.status}`);
                    }
                }
            };
            xhr.send();
        });
    }

    function guardarViajeForm(modalBootstrap) {
        const Inputpais = document.getElementById('LabelPais');
        const Inputciudad = document.getElementById('LabelCiudad');
        const InputfechaIda = document.getElementById('LabelFechaIda');
        const InputfechaFin = document.getElementById('LabelFechaVuelta');

        const pais = Inputpais.value;
        const ciudad = Inputciudad.value;
        const fechaIda = InputfechaIda.value;
        const fechaFin = InputfechaFin.value;

        if (pais === "" || ciudad === "") { alert("Falta rellenar el pais o la ciudad"); return; }
        if (fechaFin === "" || fechaIda === "") { alert("Falta rellenar las fechas"); return; }

        const idUnico = Math.floor(Math.random() * 1000);
        const urlFoto = `https://loremflickr.com/400/400/${ciudad},city?lock=${idUnico}`;

        const nuevoViaje = {
            fechaInicio: fechaIda,
            fechaFin: fechaFin,
            ciudad: ciudad,
            pais: pais,
            urlFoto: urlFoto,
            actividades: []
        }

        misViajes.push(nuevoViaje);
        localStorage.setItem('misViajes', JSON.stringify(misViajes));
        printarViajes();
        document.getElementById('formCrear').reset();
        modalBootstrap.hide();
    }

    function printarViajes() {
        const contenedorViajes = document.getElementById('contenedor-viajes');
        let num_viajes = misViajes.length;
        contenedorViajes.innerHTML = "";

        for (let i = 0; i < num_viajes; i++) {
            let viaje = misViajes[i];
            let inicio = viaje.fechaInicio.split('-').reverse().join('/');
            let fin = viaje.fechaFin.split('-').reverse().join('/');

            const nuevaTarjeta = document.createElement('div');
            nuevaTarjeta.className = "card mb-3";
            nuevaTarjeta.style.cursor = "pointer";

            nuevaTarjeta.addEventListener('click', () => mostrarDetalle(i));

            nuevaTarjeta.innerHTML += `
              <div class="row g-0">
                <div class="col-4">
                  <img src="${viaje.urlFoto}" class="img-fluid rounded-start" alt="${viaje.ciudad}" style="height: 100%; object-fit: cover;">
                </div>
                <div class="col-8">
                  <div class="card-body">
                    <h5 class="card-title">${viaje.ciudad}</h5>
                    <p class="card-text">${viaje.pais}</p>
                    <p class="card-text"><small class="text-body-secondary">${inicio} - ${fin}</small></p>
                  </div>
                </div>
              </div>`;
            contenedorViajes.appendChild(nuevaTarjeta);
        }
    }

    async function mostrarDetalle(i) {
        indiceViajeSeleccionado = i;
        let viaje = misViajes[i];

        if (!viaje.actividades) { viaje.actividades = []; }

        let fin = viaje.fechaFin.split('-').reverse().join('/');
        let inicio = viaje.fechaInicio.split('-').reverse().join('/');

        document.getElementById('mensaje-bienvenida').style.display = "none";
        document.getElementById('contenedor-detalles').style.display = "block";
        document.querySelector('.container-gemini').style.display = "flex";

        const containerWeather = document.querySelector('.container-weather');
        containerWeather.style.display = "flex";

        document.getElementById('contenedor-chat-gemini').innerHTML = "";
        enviarMensaje("Dime cosas que hacer en la ciudad de " + viaje.ciudad);

        document.getElementById('detalle-titulo').innerText = viaje.ciudad;
        document.getElementById('detalle-pais').innerText = viaje.pais;
        document.getElementById('detalle-fechas').innerText = `Del ${inicio} al ${fin}`;
        document.getElementById('detalle-img').src = viaje.urlFoto;

        printarTaulaActivitats();

        containerWeather.innerHTML = '<div class="text-center p-3" style="color:#6c757d">Cargando tiempo...</div>';
        await carregarPrevisioViatge(viaje);
    }

    async function carregarPrevisioViatge(viaje) {
        const containerWeather = document.querySelector('.container-weather');

        const urlGeo = `https://api.openweathermap.org/geo/1.0/direct?q=${viaje.ciudad}&limit=1&appid=${API_KEY}`;
        try {
            const geoData = await ferPeticioAjax(urlGeo);
            if (!geoData || geoData.length === 0) {
                containerWeather.innerHTML = '<p class="text-center text-muted">Ciudad no encontrada.</p>';
                return;
            }
            const { lat, lon } = geoData[0];

            const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
            const forecastData = await ferPeticioAjax(urlForecast);

            const dataInici = new Date(viaje.fechaInicio);
            const dataFi = new Date(viaje.fechaFin);
            const diffTime = Math.abs(dataFi - dataInici);
            let diesViatge = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            if (diesViatge > 5) diesViatge = 5;

            const llistaDiaria = [];
            for(let j=0; j < forecastData.list.length; j += 8) {
                llistaDiaria.push(forecastData.list[j]);
            }

            let carouselItemsHTML = '';

            for (let k = 0; k < diesViatge; k++) {
                if (!llistaDiaria[k]) break;

                const dada = llistaDiaria[k];
                const tempMax = Math.round(dada.main.temp_max);
                const tempMin = Math.round(dada.main.temp_min);
                const icon = dada.weather[0].icon;
                let desc = dada.weather[0].description;
                desc = desc.charAt(0).toUpperCase() + desc.slice(1);

                const diaActualViatge = new Date(dataInici);
                diaActualViatge.setDate(dataInici.getDate() + k);
                const nomDia = diaActualViatge.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'numeric' });

                const activeClass = (k === 0) ? 'active' : '';

                carouselItemsHTML += `
                    <div class="carousel-item ${activeClass}">
                        <div class="weather-day-title">${nomDia}</div>
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" class="weather-icon-large" alt="${desc}">
                        <div class="weather-temp-range">
                            <span class="max">${tempMax}°C</span> 
                            <span class="min">${tempMin}°C</span>
                        </div>
                        <div style="font-size: 0.85rem; color: #6c757d; margin-top:5px;">${desc}</div>
                    </div>
                `;
            }

            const tempActual = Math.round(llistaDiaria[0].main.temp);
            const descActual = llistaDiaria[0].weather[0].description;

            containerWeather.innerHTML = `
                <div class="weather-header">
                    <div>
                        <div class="weather-temp-big">${tempActual}°</div>
                        <div class="weather-city">${viaje.ciudad}</div>
                    </div>
                    <div style="text-align:right">
                        <small style="color:#6c757d">Ahora</small><br>
                        <span style="font-size:0.9rem; color:#333">${descActual}</span>
                    </div>
                </div>

                <div id="weatherCarouselIndicators" class="carousel slide" data-bs-interval="false">
                    <div class="carousel-inner">
                        ${carouselItemsHTML}
                    </div>
                    
                    <button class="carousel-control-prev" type="button" data-bs-target="#weatherCarouselIndicators" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Ant.</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#weatherCarouselIndicators" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Sig.</span>
                    </button>
                </div>
            `;

        } catch (error) {
            console.error(error);
            containerWeather.innerHTML = '<p class="text-danger text-center">Error API Tiempo</p>';
        }
    }

    btnObrirModalActivitat.addEventListener('click', () => {
        indiceActivitatEdicio = -1;
        document.getElementById('formNovaActivitat').reset();
        titolModalActivitat.textContent = "Añadir Nueva Actividad";
        modalActivitat.show();
    });

    btnGuardarActivitat.addEventListener('click', () => {
        if (indiceViajeSeleccionado === null) return;

        const inputData = document.getElementById('inputDataActivitat').value;
        const inputHora = document.getElementById('inputHoraActivitat').value;
        const inputNom = document.getElementById('inputNomActivitat').value;
        const inputPreu = document.getElementById('inputPreuActivitat').value;

        if (inputData === "" || inputHora === "" || inputNom === "") {
            alert("Falta rellenar campos obligatorios");
            return;
        }

        const novaActivitat = {
            data: inputData,
            hora: inputHora,
            nom: inputNom,
            preu: inputPreu
        };

        if (indiceActivitatEdicio === -1) {
            misViajes[indiceViajeSeleccionado].actividades.push(novaActivitat);
        } else {
            misViajes[indiceViajeSeleccionado].actividades[indiceActivitatEdicio] = novaActivitat;
        }

        localStorage.setItem('misViajes', JSON.stringify(misViajes));
        printarTaulaActivitats();
        document.getElementById('formNovaActivitat').reset();
        modalActivitat.hide();
    });

    function prepararEdicio(index) {
        indiceActivitatEdicio = index;
        const activitat = misViajes[indiceViajeSeleccionado].actividades[index];

        document.getElementById('inputDataActivitat').value = activitat.data;
        document.getElementById('inputHoraActivitat').value = activitat.hora;
        document.getElementById('inputNomActivitat').value = activitat.nom;
        document.getElementById('inputPreuActivitat').value = activitat.preu;

        titolModalActivitat.textContent = "Editar Actividad";
        modalActivitat.show();
    }

    function printarTaulaActivitats() {
        const tbody = document.getElementById('body-taula-activitats');
        const viajeActual = misViajes[indiceViajeSeleccionado];

        tbody.innerHTML = "";

        if (viajeActual.actividades.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">No hay actividades seleccionadas.</td>
                </tr>`;
        } else {
            viajeActual.actividades.sort((a, b) => {
                return new Date(a.data + 'T' + a.hora) - new Date(b.data + 'T' + b.hora);
            });

            viajeActual.actividades.forEach((act, index) => {
                const dataFormatada = act.data.split('-').reverse().join('/');

                const fila = document.createElement('tr');

                const tdAccions = document.createElement('td');
                tdAccions.style.display = "flex";
                tdAccions.style.gap = "5px";

                const btnEditar = document.createElement('button');
                btnEditar.className = "btn btn-warning btn-sm";
                btnEditar.textContent = "Editar";
                btnEditar.addEventListener('click', () => prepararEdicio(index));

                const btnEliminar = document.createElement('button');
                btnEliminar.className = "btn btn-danger btn-sm";
                btnEliminar.textContent = "Eliminar";
                btnEliminar.addEventListener('click', () => {
                    eliminarActivitat(index);
                });

                tdAccions.appendChild(btnEditar);
                tdAccions.appendChild(btnEliminar);

                fila.innerHTML = `
                    <td>${dataFormatada}</td>
                    <td>${act.hora}</td>
                    <td>${act.nom}</td>
                    <td>${act.preu ? act.preu + '€' : '-'}</td>
                `;
                fila.appendChild(tdAccions);

                tbody.appendChild(fila);
            });
        }
    }

    function eliminarActivitat(index) {
        misViajes[indiceViajeSeleccionado].actividades.splice(index, 1);
        localStorage.setItem('misViajes', JSON.stringify(misViajes));
        printarTaulaActivitats();
    }

    const API_GeminiKey = "AIzaSyDtjLLhYJUocSKooLEVWbSlkI8rwZKvtjo";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_GeminiKey}`;
    const inputUser = document.querySelector('.input-pregunta');
    const botonGemini = document.querySelector('.buttonGemini');

    function mostrarMensaje(mensaje, rol) {
        const chatContainer = document.getElementById('contenedor-chat-gemini');
        const messageDiv = document.createElement('div');
        if (rol === "usuario") {
            messageDiv.classList.add('mensaje-respuesta-usuario');
        } else {
            messageDiv.classList.add('mensaje-respuesta-gemini');
        }
        const aux = document.createElement('div');
        aux.textContent = mensaje;
        messageDiv.appendChild(aux);
        chatContainer.appendChild(messageDiv);

        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function enviarMensaje(inputPregunta) {
        if (!inputPregunta) return;

        mostrarMensaje(inputPregunta, "usuario");
        inputUser.value = '';

        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: inputPregunta }] }]
            })
        })
            .then(response => {
                if (!response.ok) throw new Error("Errores con la API");
                return response.json();
            })
            .then(data => {
                if (data.candidates && data.candidates.length > 0) {
                    const botText = data.candidates[0].content.parts[0].text;
                    mostrarMensaje(botText, 'gemini');
                } else {
                    mostrarMensaje("No he entendido eso, ¿puedes repetir?", 'gemini');
                }
            })
            .catch(error => {
                console.error(error);
                mostrarMensaje("Lo siento ha ocurrido un error de conexion.", 'gemini');
            });
    }

    botonGemini.addEventListener('click', () => {
        let inputPregunta = inputUser.value.trim();
        enviarMensaje(inputPregunta);
    });
});