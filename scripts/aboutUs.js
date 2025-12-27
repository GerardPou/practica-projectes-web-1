document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");


    const SERVICE_ID = "service_qh3m3kj";
    const PUBLIC_KEY = "2bZ5JyC2EVf5S-w9k";
    const TEMPLATE_TEAM = "template_g2ddu5t";
    const TEMPLATE_USER = "template_pm7w7da";

    form.addEventListener("submit", (e) => {
        e.preventDefault();


        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        clearErrors();

        let hasError = false;


        if (!firstName) {
            showError("firstName", "First name is required");
            hasError = true;
        }
        if (!lastName) {
            showError("lastName", "Last name is required");
            hasError = true;
        }
        if (!email) {
            showError("email", "Email is required");
            hasError = true;
        }
        if (!message) {
            showError("message", "Message is required");
            hasError = true;
        }

        if (hasError) return;


        const currentTime = new Date().toLocaleString();


        const templateTeamParams = {
            from_name: `${firstName} ${lastName}`,
            from_email: email,
            message: message,
            time: currentTime
        };

        const templateUserParams = {
            to_name: firstName,
            to_email: email,
            message: message
        };
        // ENVIAR EMAIL AL EQUIPO
        fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                service_id: SERVICE_ID,
                template_id: TEMPLATE_TEAM,
                user_id: PUBLIC_KEY,
                template_params: templateTeamParams
            })
        })

            .then(() => {
                return fetch("https://api.emailjs.com/api/v1.0/email/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        service_id: SERVICE_ID,
                        template_id: TEMPLATE_USER,
                        user_id: PUBLIC_KEY,
                        template_params: templateUserParams
                    })
                });
            })
            .then(() => {
                alert("Message sent successfully!\n\nWe have received your message and will contact you as soon as possible.");
                form.reset();
            })
            .catch(error => {
                console.error("Error:", error);
                alert("There was an error sending the message. Please try again later.");
            });

    });

    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const error = document.createElement("p");
        error.className = "error-message";
        error.style.color = "red";
        error.style.fontSize = "0.9rem";
        error.textContent = message;

        input.parentElement.appendChild(error);
        input.style.border = "2px solid red";
    }

    function clearErrors() {
        document.querySelectorAll(".error-message").forEach(el => el.remove());
        document.querySelectorAll("input, textarea").forEach(el => {
            el.style.border = "";
        });
    }



});
