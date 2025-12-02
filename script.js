const API_KEY = 'e37da9bf540393b942e08990dc919de9';
const CITY_NAME_SEARCH = 'Barcelona';
const API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${CITY_NAME_SEARCH}&limit=5&appid=${API_KEY}`;


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


