
document.addEventListener('DOMContentLoaded', () => {
    const botonAbrir = document.querySelector('#Button_CrearViaje');
    const botonCerrar = document.querySelector('#btn-cancelar');
    const botonX = document.querySelector('#btn-x-cerrar');
    const botonGuardar = document.getElementById('btn-guardar');
    let misViajes = [];
    const elementoModal = document.getElementById('miModalBootstrap');
    const miModal = new bootstrap.Modal(elementoModal);
    botonAbrir.addEventListener('click', () => {
        miModal.show();
    });
    botonCerrar.addEventListener('click', () => {
        miModal.hide();
    });
    botonX.addEventListener('click', () => {
        miModal.hide();
    });
    botonGuardar.addEventListener('click', () => {
        guardarViajeForm(miModal);
    })

    const ViajesGuardados=localStorage.getItem('misViajes');
    if (ViajesGuardados != null) {
        misViajes=JSON.parse(ViajesGuardados);
        printarViajes();
    }

    function guardarViajeForm(modalBootstrap){
        const Inputpais= document.getElementById('LabelPais');
        const Inputciudad=document.getElementById('LabelCiudad');
        const InputfechaIda = document.getElementById('LabelFechaIda');
        const InputfechaFin = document.getElementById('LabelFechaVuelta');

        const pais = Inputpais.value;
        const ciudad = Inputciudad.value;
        const fechaIda = InputfechaIda.value;
        const fechaFin = InputfechaFin.value;
        if (pais === "" || ciudad === ""){
            alert("Falta rellenar el pais o la ciudad");
            return;
        }
        if (fechaFin === "" || fechaIda === ""){
            alert("Falta rellenar las fechas");
            return;
        }

        const idUnico=500
        const urlFoto = `https://loremflickr.com/400/400/${ciudad},city?lock=${idUnico}`;

        const nuevoViaje= {
            fechaInicio: fechaIda,
            fechaFin: fechaFin,
            ciudad: ciudad,
            pais: pais,
            urlFoto: urlFoto,
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
            const nuevaTarjeta=document.createElement('div');
            nuevaTarjeta.className= "card mb-3"
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
    function mostrarDetalle(i){
        let viaje = misViajes[i];
        let fin = viaje.fechaFin.split('-').reverse().join('/');
        let inicio = viaje.fechaInicio.split('-').reverse().join('/');

        const bienvenida=document.getElementById('mensaje-bienvenida');
        const contenedorDetalle=document.getElementById('contenedor-detalles');
        const cajaChatPrincipal = document.querySelector('.container-gemini');

        const img = document.getElementById('detalle-img');
        const titulo = document.getElementById('detalle-titulo');
        const pais = document.getElementById('detalle-pais');
        const fechas = document.getElementById('detalle-fechas');

        bienvenida.style.display="none";
        contenedorDetalle.style.display="flex";
        cajaChatPrincipal.style.display="flex";

        enviarMensaje("Dime cosas que hacer en la ciudad de " + viaje.ciudad);
        titulo.innerText= viaje.ciudad;
        pais.innerText= viaje.pais;
        fechas.innerText = `Del ${inicio} al ${fin}`;

        img.src=viaje.urlFoto;
    }

    const API_GeminiKey = "AIzaSyDtjLLhYJUocSKooLEVWbSlkI8rwZKvtjo";

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_GeminiKey}`;
    const inputUser = document.querySelector('.input-pregunta');
    const botonGemini = document.querySelector('.buttonGemini');

    function mostrarMensaje(mensaje,rol){
        const chatContainer = document.getElementById('contenedor-chat-gemini');


        const messageDiv = document.createElement('div');
        if (rol === "usuario"){
            messageDiv.classList.add('mensaje-respuesta-usuario');
        }else{
            messageDiv.classList.add('mensaje-respuesta-gemini');
        }
        const aux= document.createElement('div');
        aux.textContent=mensaje;
        messageDiv.appendChild(aux);
        chatContainer.appendChild(messageDiv);
    }

    function enviarMensaje(inputPregunta){

        if (!inputPregunta){
            return;
        }
        mostrarMensaje(inputPregunta,"usuario");
        inputUser.value = '';

        fetch(API_URL,{
            method: 'POST',
            headers: {
                'Content-Type': "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: inputPregunta }]
                }]
            })


        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Errores con la API")
            }
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
            .catch(error =>{
                console.error(error);
                mostrarMensaje("Lo siento ha ocurrido un error de conexion,vuelva a introducir el mensaje ", 'gemini');
            })
    }
    botonGemini.addEventListener('click', () => {
        let inputPregunta = inputUser.value.trim();
        enviarMensaje(inputPregunta)
    });




});