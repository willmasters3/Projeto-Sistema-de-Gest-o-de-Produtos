const { sql } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'sua_chave_secreta'; // Troque isso por uma chave mais segura!

// Função para registrar um novo usuário
exports.registrarUsuario = async (req, res) => {
    const { nome, email, senha, perfil } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(senha, 10); // Hashing da senha

        await sql.connect();
        await sql.query`INSERT INTO Usuarios (nome, email, senha, perfil) VALUES (${nome}, ${email}, ${hashedPassword}, ${perfil})`;

        res.status(201).send({ message: 'Usuário registrado com sucesso!' });
    } catch (err) {
        res.status(500).send({ error: 'Erro ao registrar usuário', details: err.message });
    }
};

// Função para login do usuário
exports.loginUsuario = async (req, res) => {
    const { email, senha } = req.body;

    try {
        await sql.connect();
        const result = await sql.query`SELECT * FROM Usuarios WHERE email = ${email}`;

        if (result.recordset.length === 0) {
            return res.status(400).send({ message: 'Usuário não encontrado' });
        }

        const usuario = result.recordset[0];

        // Verificando a senha
        const isMatch = await bcrypt.compare(senha, usuario.senha);
        if (!isMatch) {
            return res.status(400).send({ message: 'Senha inválida' });
        }

        // Gerar token JWT
        const token = jwt.sign({ id: usuario.id, perfil: usuario.perfil }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).send({
            message: 'Login bem-sucedido!',
            token,
            perfil: usuario.perfil
        });
    } catch (err) {
        res.status(500).send({ error: 'Erro ao fazer login', details: err.message });
    }
};
