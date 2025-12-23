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

        const nuevoViaje= {
            fechaInicio: fechaIda,
            fechaFin: fechaFin,
            ciudad: ciudad,
            pais: pais,
        }
        misViajes.push(nuevoViaje);
        localStorage.setItem('misViajes', JSON.stringify(misViajes));
        printarViajes();
        document.getElementById('formCrear').reset();
        modalBootstrap.hide();
    }
    function printarViajes(){
        const contenedorViajes=document.getElementById('contenedor-viajes');
        let num_viajes=misViajes.length;
        contenedorViajes.innerHTML = "";
        for (i=0;i<num_viajes;i++){
            let viaje=misViajes[i];
            contenedorViajes.innerHTML +=`
                <div class="card" >
                <div class="card-body">
                    <h5 class="card-title">${viaje.ciudad}, ${viaje.pais}</h5>
                 <p class="card-text text-muted">
                         <strong>Ida:</strong> ${viaje.fechaInicio} <br>
                         <strong>Vuelta:</strong> ${viaje.fechaFin}
                    </p>
                </div>
            </div>`;


        }
    }
});