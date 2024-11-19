const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtosController');

// Rota para adicionar produtos
router.post('/', produtosController.adicionarProduto);

// Outras rotas relacionadas a produtos (pode adicionar depois)
// router.get('/', produtosController.listarProdutos);
// router.put('/:id', produtosController.atualizarProduto);
// router.delete('/:id', produtosController.deletarProduto);

module.exports = router;
