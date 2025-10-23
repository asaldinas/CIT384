document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submit");

    submitButton.addEventListener("click", () => {
        window.location.href = "form.html";
    });
});