document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();  // Impede o envio padrão do formulário

    const formData = new FormData(this);
    const data = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .then(data => {
        // Se o login for bem-sucedido e o usuário for admin, armazena a hora do login e redireciona
        if (data.tipo_usuario === 'admin') {
            const now = new Date().getTime();
            localStorage.setItem('loginTime', now);
            window.location.href = '/html/dashboard.html'; // Redireciona para o dashboard
        }
    })
    .catch((error) => {
        console.error('Erro:', error);
        document.getElementById("message").textContent = error.message; // Exibe a mensagem de erro
    });
});
