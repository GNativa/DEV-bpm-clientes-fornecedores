class Secao {
    constructor(id, titulo, campos) {
        this.id = id;
        this.titulo = titulo;
        this.possuiTitulo = titulo !== undefined && titulo !== null;
        this.gerada = false;
        this.elemento = $();
        this.divSecao = document.createElement("div");
        this.campos = campos ?? [];
    }

    configurarTitulo(elementoSecao) {
        const linhaTitulo = document.createElement("div");
        linhaTitulo.classList.add("row", "linha-titulo");

        const colunaTitulo = document.createElement("div");
        colunaTitulo.classList.add("col", "coluna-titulo");

        const tituloSecao = document.createElement("div");
        tituloSecao.classList.add("titulo-g");
        tituloSecao.textContent = this.titulo;

        const hr = document.createElement("hr");
        hr.classList.add("hr-titulo");
        linhaTitulo.append(colunaTitulo);
        colunaTitulo.append(tituloSecao);
        elementoSecao.appendChild(linhaTitulo);
        elementoSecao.appendChild(hr);
    }

    adicionarLinha() {
        const linhaCampos = document.createElement("div");
        linhaCampos.classList.add("row", "g-3");

        for (const campo of this.campos) {
            if (document.getElementById(campo.obterElementoHtml().id) !== null) {
                throw Error(`Já existe um campo com o id "${id}".`);
            }

            linhaCampos.appendChild(campo.coluna);
            this.divSecao.append(linhaCampos);
        }
    }

    gerar() {
        const gerada = this.gerada;
        const campos = this.campos;
        const secao = this.divSecao;

        if (gerada || campos.length === 0) {
            return;
        }

        const id = this.id;
        const possuiTitulo = this.possuiTitulo;

        secao.id = id;
        secao.classList.add("mb-3");

        if (possuiTitulo) {
            this.configurarTitulo(secao);
        }

        const linhaCampos = document.createElement("div");
        linhaCampos.classList.add("row", "g-3");

        this.adicionarLinha();
        const elemento = $(secao);
        $("#containerFormulario").append(elemento);

        this.elemento = elemento;
        this.gerada = true;
        return this;
    }

    definirVisibilidade(visivel) {
        this.visivel = visivel;

        if (this.visivel) {
            this.elemento.show();
        }
        else {
            this.elemento.hide();
        }

        return this;
    }

    adicionarCampo(campo) {
        this.campos.push(campo);
    }
}