document.getElementById('user-form').addEventListener('submit', async (event) =>{
    event.preventDefault();

    const formData = new formData(event.target);
    const data = Object.fromEntries(formData.entries());

    try{
        const response = await fetch ('/')
    }
})