// Função para verificar se o usuário está logado
function checkSession() {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) {
        // Se não houver tempo de login, redirecione para o login
        window.location.href = '/html/login.html';
        return;
    }

    const now = new Date().getTime();
    const sessionDuration = 15 * 60 * 1000; // 15 minutos em milissegundos

    // Verifica se a sessão expirou
    if (now - Number(loginTime) > sessionDuration) {
        localStorage.removeItem('loginTime'); // Limpa o tempo de login
        window.location.href = '/html/login.html'; // Redireciona para o login
    }
}

// Chama a função de verificação ao carregar a página
window.onload = checkSession;

// Aqui você pode adicionar outras funções relacionadas ao dashboard, como:
function initializeDashboard() {
    // Lógica de inicialização do dashboard
    console.log("Dashboard inicializado!");
}

// Chama a função de inicialização do dashboard
initializeDashboard();
