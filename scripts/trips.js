document.addEventListener('DOMContentLoaded', () => {
    const botonAbrir = document.querySelector('#Button_CrearViaje');
    const botonCerrar = document.querySelector('#btn-cancelar');
    const botonX = document.querySelector('#btn-x-cerrar');

    const elementoHTML = document.getElementById('miModalBootstrap');
    const miModal = new bootstrap.Modal(elementoHTML);
    botonAbrir.addEventListener('click', () => {
        miModal.show();
    });
    botonCerrar.addEventListener('click', () => {
        miModal.hide();
    });
    botonX.addEventListener('click', () => {
        miModal.hide();
    });
});