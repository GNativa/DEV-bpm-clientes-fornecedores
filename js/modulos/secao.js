/*
    - Seção: agrupamento de campos que pode possuir um título ou não, servindo como quebra de linha quando
    gerada sem um título.
 */

class Secao {
    constructor(id, titulo, campos) {
        this.id = id;
        this.titulo = titulo;
        this.possuiTitulo = titulo !== undefined && titulo !== null;
        this.gerada = false;
        this.elemento = $();
        this.divSecao = document.createElement("div");
        this.campos = campos ?? [];
        this.tituloSecao = null;
        this.gerar();
    }

    configurarTitulo(elementoSecao) {
        const linhaTitulo = document.createElement("div");
        linhaTitulo.classList.add("row", "linha-titulo");

        const colunaTitulo = document.createElement("div");
        colunaTitulo.classList.add("col", "coluna-titulo");

        this.tituloSecao = document.createElement("div");
        this.tituloSecao.classList.add("titulo-g");
        this.tituloSecao.textContent = this.titulo;

        const hr = document.createElement("hr");
        hr.classList.add("hr-titulo");
        linhaTitulo.append(colunaTitulo);
        colunaTitulo.append(this.tituloSecao);
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
            return null;
        }

        const id = this.id;
        const possuiTitulo = this.possuiTitulo;

        secao.id = id;
        secao.classList.add("mb-4");

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

    atualizarTitulo(titulo) {
        if (!this.possuiTitulo) {
            return null;
        }
        this.titulo = titulo;
        this.tituloSecao.textContent = titulo;

        return titulo;
    }
}