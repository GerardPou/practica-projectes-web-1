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
