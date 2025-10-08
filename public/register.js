const form = document.getElementById("user-form");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim;
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    msg.textContent = "";

    if (!email || !username || !password || !password2){
        msg.textContent = "PLease fill out all fields.";
        return;
    }
    if (password !== password2){
        msg.textContent = "Passwords do not match.";
        return;
    }

    try{
        const res = await fetch("api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" };
            body: JSON.stringify({ email, username, password }),
        });
        const data = await res.json();
        if(!res.ok) {
            msg.textContent = data.status || "Registration failed.";
            return;
        }
       window.location.assign("/form.html");
    } catch (err){
        msg.textContent = "Network error. Please try again";
    }
});