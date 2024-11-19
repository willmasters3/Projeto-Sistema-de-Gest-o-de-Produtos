const express = require('express');
const session = require('express-session'); 
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const produtoRoutes = require('./index'); // Ajuste conforme a estrutura real
const config = require('./db'); // Ajuste aqui para o caminho correto do seu arquivo de configuração

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));


// Servir arquivos estáticos normalmente
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/imagens', express.static(path.join(__dirname, '../imagens')));


// Configuração de Sessão (opcional)
app.use(session({
    secret: 'seu-segredo-aqui', // Troque por uma string segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Para desenvolvimento
}));

// Conectar ao banco de dados
const conectarBanco = () => {
    const sql = require('mssql');
    console.log('Tentando conectar ao banco de dados...');

    sql.connect(config)
        .then(pool => {
            console.log('Conectado ao banco de dados com sucesso!');
            app.listen(process.env.PORT || 3010, () => {
                console.log(`Servidor iniciado na porta ${process.env.PORT || 3010}`);
            });
        })
        .catch(err => {
            console.error('Erro ao conectar ao banco de dados:', err);
        });
};

// Middleware para verificar se o usuário está logado
const verificarLogin = (req, res, next) => {
    if (req.session.usuario) { // Verifica se a sessão do usuário está ativa
        next(); // Se o usuário está logado, continua para a próxima rota
    } else {
        res.status(401).send('Você precisa estar logado para acessar esta página.'); // Mensagem de erro
    }
};

// Middleware para verificar se o usuário é admin
const verificarAdmin = (req, res, next) => {
    const usuario = req.session.usuario; // Ajuste conforme sua lógica de sessão
    if (usuario && usuario.tipo_usuario === 'admin') {
        next();
    } else {
        res.status(403).send('Acesso negado. Você não tem permissão para acessar esta página.');
    }
};

// Usar este middleware na rota do dashboard
app.get('/dashboard', verificarLogin, verificarAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/dashboard.html'));
});
// Rota da página de produtos, protegida por verificação de login
app.get('/produtos', verificarLogin, verificarAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/produtos.html'));
});

// Rotas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/login.html'));
});

app.get('/cadastro',verificarLogin, verificarAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/cadastro.html'));
});


app.use('/api', produtoRoutes); // Esta parte é essencial para que a rota funcione

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});

// Conectar ao banco e iniciar o servidor
conectarBanco();

module.exports = config;
