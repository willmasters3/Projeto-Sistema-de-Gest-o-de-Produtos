
// Função para cadastrar grupo
document.getElementById('form-grupo').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('grupo-nome').value;
    const codigo = document.getElementById('grupo-codigo').value;

    console.log('Tentando cadastrar grupo:', { nome, codigo }); // Linha adicionada para debug

    try {
        const response = await fetch('/api/grupos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, codigo_barras: codigo }),
        });

        console.log('Resposta do servidor:', response); // Linha adicionada para debug

        if (!response.ok) {
            const errorData = await response.json(); // Captura a resposta de erro do servidor
            throw new Error(errorData.message); // Lança erro com a mensagem apropriada
        }

        alert('Grupo cadastrado com sucesso!');
        carregarGrupos(); // Recarregar grupos após cadastro
    } catch (error) {
        console.error('Erro ao cadastrar grupo:', error);
        alert(error.message); // Exibe a mensagem de erro recebida do servidor
    }
});



// Função para cadastrar produto
document.getElementById('form-produto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const quantidade = document.getElementById('quantidade').value;
    const grupo_id = document.getElementById('grupo_id').value;
    const codigo_barras = document.getElementById('codigo_barras').value;

    try {
        const response = await fetch('/api/produtos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, quantidade, entradas: 0, saidas: 0, grupo_id, codigo_barras }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        alert('Produto cadastrado com sucesso!');
        carregarProdutos(); // Recarregar produtos após cadastro
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        alert(error.message);
    }
});

// Função para carregar grupos no seletor de produtos
async function carregarGrupos() {
    const response = await fetch('/api/grupos');
    const grupos = await response.json();
    const selectGrupo = document.getElementById('grupo_id');
    
    selectGrupo.innerHTML = ''; // Limpa opções anteriores

    const optionDefault = new Option('Selecionar Grupo', '');
    selectGrupo.add(optionDefault);
    
    grupos.forEach(grupo => {
        const option = new Option(grupo.nome, grupo.id);
        selectGrupo.add(option);
    });

    // Adiciona um evento para quando o grupo é selecionado
    selectGrupo.addEventListener('change', async () => {
        const selectedGrupoId = selectGrupo.value;
        if (selectedGrupoId) {
            // Aqui você pode buscar o grupo para obter o código de barras
            const grupoResponse = await fetch(`/api/grupos/${selectedGrupoId}`); // Verifique se essa rota existe
            if (grupoResponse.ok) { // Verifique se a resposta está ok antes de processá-la
                
               
            } else {
                console.error('Erro ao buscar grupo:', grupoResponse.statusText); // Log para entender o erro
            }
        } else {
            document.getElementById('codigo_barras').value = ''; // Limpa o campo se nenhum grupo estiver selecionado
        }
    });
    
}

// Função para carregar produtos na lista

// Função para carregar produtos na lista
async function carregarProdutos() {
    const response = await fetch('/api/produtos');
    const produtos = await response.json();
    const tbody = document.getElementById('produtos-tabela').querySelector('tbody'); // Acesse o tbody da tabela corretamente
    tbody.innerHTML = '';

    produtos.forEach(produto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.quantidade}</td>
            <td>${produto.grupo_id}</td>
            <td>
                <button onclick="editarProduto(${produto.id})">Editar</button>
                <button onclick="excluirProduto(${produto.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}



// Função para editar produto
async function editarProduto(id) {
    // Carregar dados do produto
    const response = await fetch(`/api/produtos/${id}`);
    const produto = await response.json();
    
    document.getElementById('editar-nome').value = produto.nome;
    document.getElementById('editar-quantidade').value = produto.quantidade;
    document.getElementById('editar-id').value = produto.id;

    // Preencher o grupo com as opções disponíveis
    await carregarGruposParaEditar(produto.grupo_id);

    // Mostra o modal de edição
    document.getElementById('modal-editar').style.display = 'block';
}
async function carregarGruposParaEditar(grupoSelecionado) {
    const response = await fetch('/api/grupos');
    const grupos = await response.json();
    const selectGrupo = document.getElementById('editar-grupo');
    
    selectGrupo.innerHTML = ''; // Limpa opções anteriores

    grupos.forEach(grupo => {
        const option = new Option(grupo.nome, grupo.id);
        if (grupo.id === grupoSelecionado) {
            option.selected = true; // Marca o grupo atual como selecionado
        }
        selectGrupo.add(option);
    });
}


// Atualizar produto
document.getElementById('form-editar').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editar-id').value;
    const nome = document.getElementById('editar-nome').value;
    const quantidade = document.getElementById('editar-quantidade').value;
    const grupo_id = document.getElementById('editar-grupo').value;

    try {
        await fetch(`/api/produtos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, quantidade, grupo_id }),
        });
        alert('Produto atualizado com sucesso!');
        document.getElementById('modal-editar').style.display = 'none';
        carregarProdutos(); // Recarregar produtos após atualização
    } catch (error) {
        console.error(error);
        alert('Erro ao atualizar produto.');
    }
});


// Função para excluir produto
async function excluirProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        try {
            await fetch(`/api/produtos/${id}`, {
                method: 'DELETE',
            });
            alert('Produto excluído com sucesso!');
            carregarProdutos(); // Recarregar produtos após exclusão
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir produto.');
        }
    }
}
document.getElementById('fechar-modal').addEventListener('click', () => {
    document.getElementById('modal-editar').style.display = 'none';
});

// Carregando grupos e produtos ao carregar a página
window.onload = async () => {
    await carregarGrupos();
    await carregarProdutos();
};
