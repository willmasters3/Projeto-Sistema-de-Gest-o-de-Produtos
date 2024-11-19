document.getElementById("cadastroForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const formData = new FormData(this);
    const data = {
        username: formData.get('username'),
        password: formData.get('password'),
        tipo_usuario: formData.get('tipo_usuario')
    };

    fetch('/api/cadastrar-usuario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            // Se a resposta não for 2xx, é um erro (400, 500, etc.)
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .then(data => {
        alert('Usuário cadastrado com sucesso!');
        // Limpa os campos do formulário
        document.getElementById("cadastroForm").reset();
    })
    .catch((error) => {
        console.error('Erro:', error);
        alert(error.message); // Exibe a mensagem de erro para o usuário
    });
});
