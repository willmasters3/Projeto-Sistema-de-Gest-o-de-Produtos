const express = require('express'); // Importando o Express
const router = express.Router(); // Criando um roteador
const sql = require('mssql');
const bcrypt = require('bcrypt'); // Importando bcrypt
const config = require('./db'); // Certifique-se do caminho correto

router.get('/', (req, res) => {
    // Implementar lógica para obter produtos, por exemplo.
});

router.post('/cadastrar-usuario', async (req, res) => {
    const { username, password, tipo_usuario } = req.body;

    try {
        const pool = await sql.connect(config);

        // Verificar se o usuário já existe
        const existingUser = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT COUNT(*) AS count FROM usuarios WHERE username = @username');

        if (existingUser.recordset[0].count > 0) {
            return res.status(400).json({ message: 'Usuário já existe. Escolha outro nome.' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Inserir novo usuário
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, hashedPassword)
            .input('tipo_usuario', sql.VarChar, tipo_usuario)
            .query('INSERT INTO usuarios (username, password, tipo_usuario) VALUES (@username, @password, @tipo_usuario)');
        
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
    }
});
// Pseudocódigo para a lógica de login no seu backend
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await sql.connect(config);
        const user = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT * FROM usuarios WHERE username = @username');

        if (user.recordset.length === 0) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.recordset[0].password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha inválida' });
        }

        // Verifica o tipo de usuário
        if (user.recordset[0].tipo_usuario === 'admin') {
            // Redireciona para o dashboard
            res.status(200).json({ message: 'Login bem-sucedido', tipo_usuario: 'admin' });
        } else {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para acessar o dashboard.' });
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro ao fazer login.' });
    }
});

// Rota para cadastrar um grupo
router.post('/grupos', async (req, res) => {
    const { nome, codigo_barras } = req.body;

    try {
        const pool = await sql.connect(config);

        // Verificar se já existe um grupo com o mesmo código de barras
        const existingCodigoBarras = await pool.request()
            .input('codigo_barras', sql.VarChar, codigo_barras)
            .query('SELECT COUNT(*) AS count FROM grupos WHERE codigo_barras = @codigo_barras');

        if (existingCodigoBarras.recordset[0].count > 0) {
            return res.status(400).json({ message: 'Código de barras já cadastrado.' });
        }

        // Verificar se já existe um grupo com o mesmo nome (insensível a maiúsculas)
        const existingNome = await pool.request()
            .input('nome', sql.VarChar, nome.toLowerCase()) // Nome em minúsculas
            .query('SELECT COUNT(*) AS count FROM grupos WHERE LOWER(nome) = LOWER(@nome)'); // Compara sem distinção entre maiúsculas e minúsculas

        if (existingNome.recordset[0].count > 0) {
            return res.status(400).json({ message: 'Nome de grupo já cadastrado.' });
        }

        // Se tudo estiver correto, cadastrar o novo grupo
        await pool.request()
            .input('nome', sql.VarChar, nome)
            .input('codigo_barras', sql.VarChar, codigo_barras)
            .query('INSERT INTO grupos (nome, codigo_barras) VALUES (@nome, @codigo_barras)');
        
        res.status(201).json({ message: 'Grupo cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar grupo:', error);
        res.status(500).json({ message: 'Erro ao cadastrar grupo.' });
    }
});
// Rota para obter todos os grupos
router.get('/grupos', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const grupos = await pool.request().query('SELECT * FROM grupos');
        res.status(200).json(grupos.recordset); // Aqui você retorna os grupos
    } catch (error) {
        console.error('Erro ao buscar grupos:', error);
        res.status(500).json({ message: 'Erro ao buscar grupos.' });
    }
});
// Rota para obter um grupo específico
router.get('/grupos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect(config);
        const grupo = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM grupos WHERE id = @id');

        if (grupo.recordset.length === 0) {
            return res.status(404).json({ message: 'Grupo não encontrado.' }); // Handle 404 caso não exista
        }

        res.status(200).json(grupo.recordset[0]); // Retorne o grupo encontrado
    } catch (error) {
        console.error('Erro ao buscar grupo:', error);
        res.status(500).json({ message: 'Erro ao buscar grupo.' });
    }
});

// Rota para cadastrar um produto
router.post('/produtos', async (req, res) => {
    const { nome, quantidade, entradas, saidas, grupo_id, codigo_barras } = req.body;

    try {
        const pool = await sql.connect(config);
        
        // Aqui você pode fazer qualquer validação adicional necessária

        // Inserção do novo produto no banco de dados
        await pool.request()
            .input('nome', sql.VarChar, nome)
            .input('quantidade', sql.Int, quantidade)
            .input('entradas', sql.Int, entradas)
            .input('saidas', sql.Int, saidas)
            .input('grupo_id', sql.Int, grupo_id)
            .input('codigo_barras', sql.VarChar, codigo_barras) // Lembre-se de adicionar esse campo se necessário
            .query('INSERT INTO produtos (nome, quantidade, entradas, saidas, grupo_id, codigo_barras) VALUES (@nome, @quantidade, @entradas, @saidas, @grupo_id, @codigo_barras)');
        
        res.status(201).json({ message: 'Produto cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        res.status(500).json({ message: 'Erro ao cadastrar produto.' });
    }
});


// Rota para obter todos os produtos
router.get('/produtos', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const produtos = await pool.request().query('SELECT * FROM produtos');
        res.status(200).json(produtos.recordset);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro ao buscar produtos.' });
    }
});

// Rota para obter produto específico
router.get('/produtos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect(config);
        const produto = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM produtos WHERE id = @id');

        res.status(200).json(produto.recordset[0]);
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ message: 'Erro ao buscar produto.' });
    }
});

// Rota para atualizar produto
router.put('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, quantidade, grupo_id } = req.body;

    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.Int, id)
            .input('nome', sql.VarChar, nome)
            .input('quantidade', sql.Int, quantidade)
            .input('grupo_id', sql.Int, grupo_id)
            .query('UPDATE produtos SET nome = @nome, quantidade = @quantidade, grupo_id = @grupo_id WHERE id = @id');

        res.status(200).json({ message: 'Produto atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ message: 'Erro ao atualizar produto.' });
    }
});

// Rota para excluir produto
router.delete('/produtos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM produtos WHERE id = @id');

        res.status(200).json({ message: 'Produto excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ message: 'Erro ao excluir produto.' });
    }
});


module.exports = router; // Exporta o roteador
