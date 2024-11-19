const { sql } = require('../db');

// Função para adicionar produto
exports.adicionarProduto = async (req, res) => {
    const { nome, quantidade } = req.body;
    const codigoBarra = gerarCodigoBarra(nome);

    try {
        await sql.connect();
        await sql.query`INSERT INTO Produtos (nome, quantidade, codigo_barra) VALUES (${nome}, ${quantidade}, ${codigoBarra})`;
        res.status(201).send({ message: 'Produto adicionado com sucesso!' });
    } catch (err) {
        res.status(500).send({ error: 'Erro ao adicionar produto', details: err });
    }
};

// Função para gerar código de barras
function gerarCodigoBarra(nome) {
    return "BAR" + Math.floor(Math.random() * 1000000).toString();
}
