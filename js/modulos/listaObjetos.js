class ListaObjetos extends Secao {
    constructor(id, titulo, campos, tituloSingular) {
        super(id, titulo, campos);
        this.tituloSingular = tituloSingular;
        this.quantidadeLinhas = 0;
        this.camposLista = [];
    }

    adicionarLinha() {
        const linhaCampos = document.createElement("div");
        linhaCampos.classList.add("row", "g-3");

        for (const campo of this.campos) {
            const quantidadeLinhas = this.quantidadeLinhas;
            const novoId = `${campo.obterElementoHtml().id}${quantidadeLinhas}`;

            if (document.getElementById(novoId) !== null) {
                throw Error(`Já existe um campo com o id "${novoId}".`);
            }

            campo.campo.attr("id", novoId);

            linhaCampos.appendChild(campo.coluna);
            this.divSecao.append(linhaCampos);
        }
    }

    configurarTitulo(elementoSecao) {
        const linhaTitulo = document.createElement("div");
        linhaTitulo.classList.add("row", "mt-3");

        const colunaTitulo = document.createElement("div");
        colunaTitulo.classList.add("col");

        const tituloSecao = document.createElement("div");
        tituloSecao.classList.add("titulo-m");
        tituloSecao.textContent = this.titulo;

        const botaoNovaLinha = document.createElement("button");
        botaoNovaLinha.textContent = "Nova linha";
        botaoNovaLinha.classList.add("btn", "botao", "ms-3");

        botaoNovaLinha.addEventListener("click", function () {

        });

        tituloSecao.appendChild(botaoNovaLinha);
        tituloSecao.textContent = this.titulo;

        const hr = document.createElement("hr");

        linhaTitulo.append(colunaTitulo);
        colunaTitulo.append(tituloSecao);
        elementoSecao.appendChild(linhaTitulo);
        elementoSecao.appendChild(hr);
    }
}