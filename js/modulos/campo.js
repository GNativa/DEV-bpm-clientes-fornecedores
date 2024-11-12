class OpcaoLista {
    constructor(valor, conteudo) {
        this.valor = valor;
        this.conteudo = conteudo;
    }
}

class TipoCampo {
    constructor(elemento, tipo) {
        this.elemento = elemento;
        this.tipo = tipo;
    }
}

const tipoParaElemento = {
    "checkbox": new TipoCampo("input", "checkbox"),
    "texto": new TipoCampo("input", "text"),
    "email": new TipoCampo("input", "email"),
    "area-texto": new TipoCampo("textarea", null),
    "anexo": new TipoCampo("input", "file"),
    "lista": new TipoCampo("select", null),
    "data": new TipoCampo("input", "date")
};

class Campo {
    constructor(id, rotulo, tipo, largura, dica, altura, propriedadesAdicionais) {
        if (document.getElementById(id) !== null) {
            throw Error(`Já existe um campo com o id "${id}".`);
        }

        if (!(tipo in tipoParaElemento)) {
            throw Error(`Tipo de campo "${tipo}" inválido ou não suportado.`);
        }

        this.id = id;
        this.rotulo = rotulo;
        this.tipo = tipo.toLowerCase();
        this.largura = largura;
        this.altura = altura !== undefined && altura !== null ? `${altura}lh` : null;
        this.dica = dica ?? null;
        this.propriedadesAdicionais = propriedadesAdicionais ?? {};
        this.obrigatorio = false;
        this.visivel = true;
        this.editavel = true;
        this.feedback = null;
        this.links = null;
        this.classeCarregaveis = null;

        this.obterLinks = () => {
            const links = this.links;
            links.innerHTML = "";

            for (const arquivo of this.obterElementoHtml().files) {
                const link = document.createElement("a");
                link.target = "_blank";
                link.href = URL.createObjectURL(arquivo);
                link.textContent = arquivo.name;
                links.appendChild(link);
                links.appendChild(document.createElement("br"));
            }
        };

        this.coluna = document.createElement("div");
        this.campo = this.configurarElementoHtml();
        this.definirVisibilidade(true);
        this.definirEdicao(true);
    }

    configurarElementoHtml() {
        const id = this.id;
        const tipo = this.tipo;
        const rotulo = this.rotulo;
        const largura = this.largura;
        const dica = this.dica;
        const altura = this.altura;
        const coluna = this.coluna;
        const propriedadesAdicionais = this.propriedadesAdicionais;

        const classeColuna = largura >= 1 && largura <= 12 ? `col-${largura}` : "col";
        coluna.classList.add(classeColuna);

        let classes = ["campo"];
        let filhoColuna, campo, label;

        const elemento = tipoParaElemento[tipo].elemento;
        const tipoCampo = tipoParaElemento[tipo].tipo;

        campo = document.createElement(elemento);
        campo.id = id;
        campo.name = id;
        campo.placeholder = rotulo;

        if (dica !== null) {
            campo.title = dica;
        }

        if (tipoCampo !== null) {
            campo.type = tipoCampo;
        }

        for (const propriedade in propriedadesAdicionais) {
            campo[propriedade] = propriedadesAdicionais[propriedade];
        }

        if ((elemento === "input" || elemento === "textarea") && tipoCampo !== "file") {
            filhoColuna = document.createElement("div");
            let classeFilho;

            label = document.createElement("label");
            label.textContent = rotulo;
            label.htmlFor = id;

            if (tipo !== "checkbox") {
                classes.push("form-control");
                classeFilho = "form-floating";
            }
            else {
                classes.push("form-check-input");
                classeFilho = "form-check";
                label.classList.add("mt-1", "ms-2");
            }

            filhoColuna.classList.add(classeFilho);
            coluna.appendChild(filhoColuna);
            filhoColuna.appendChild(campo);
            filhoColuna.appendChild(label);

            if (altura !== null) {
                campo.style.height = altura;
            }
        }
        else if (elemento === "select") {
            classes.push("form-select");
            campo.ariaLabel = rotulo;

            const opcao = document.createElement("option");
            opcao.value = "";
            opcao.textContent = rotulo;

            campo.appendChild(opcao);
            coluna.appendChild(campo);
        }
        else if (tipoCampo === "file") {
            classes.push("form-control");
            label = document.createElement("label");
            label.textContent = rotulo;
            label.htmlFor = id;

            coluna.appendChild(label);
            coluna.appendChild(campo);

            const links = document.createElement("div");
            links.classList.add("links", "mt-1");
            coluna.appendChild(links);

            this.links = links;

            $(campo).on("change", () => {
                this.obterLinks();
            });
        }

        const feedback = document.createElement("div");
        feedback.classList.add("feedback");
        feedback.style.display = "none";
        this.coluna.appendChild(feedback);
        this.feedback = $(feedback);

        campo.classList.add(...classes);
        return $(campo);
    }

    configurarMascara(mascara, opcoes) {
        if (opcoes === undefined) {
            this.campo.mask(mascara, {clearIfNotMatch: true});
        }
        else {
            this.campo.mask(mascara, opcoes);
        }

        return this;
    }

    adicionarEvento(evento, funcao) {
        this.campo.on(evento, funcao);
        return this;
    }

    removerEvento(evento) {
        this.campo.off(evento);
        return this;
    }

    definirFeedback(mensagem) {
        this.feedback.val(mensagem);
        return this;
    }

    mostrarFeedback(mostrar) {
        const feedback = this.feedback;

        if (mostrar) {
            feedback.show();
        }
        else {
            feedback.hide();
        }

        return this;
    }

    definirObrigatoriedade(obrigatorio) {
        const campo = this.campo;
        this.obrigatorio = obrigatorio;
        campo.prop("aria-required", obrigatorio);
        campo.prop("required", obrigatorio);

        if (obrigatorio) {
            campo.on("blur.obrigatorio", configurar);
        }
        else {
            campo.off("blur.obrigatorio");
            campo.removeClass("nao-preenchido");
        }

        function configurar() {
            if (campo.val() === "" || (campo.prop("type") === "checkbox" && !campo.prop("checked"))) {
                campo.addClass("nao-preenchido");
            }
            else {
                campo.removeClass("nao-preenchido");
            }
        }

        return this;
    }

    definirVisibilidade(visivel) {
        this.visivel = visivel;

        if (this.visivel) {
            $(this.coluna).show();
        }
        else {
            $(this.coluna).hide();
        }

        return this;
    }

    definirEdicao(editavel) {
        this.editavel = editavel;
        this.campo.prop("disabled", !this.editavel);
        return this;
    }

    definirValidez(valido) {
        const campo = this.campo;
        campo.prop("aria-invalid", !valido);

        if (valido) {
            campo.removeClass("is-invalid");
        }
        else {
            campo.addClass("is-invalid");
        }
    }

    adicionarOpcoes(opcoes) {
        const id = this.id;
        const tipo = this.tipo;
        const campo = this.campo;

        if (tipo !== "lista") {
            throw Error(`O campo "${id}" deve ser do tipo "lista" (select) para suportar opções.`);
        }

        for (const opcao of opcoes) {
            const elementoOpcao = document.createElement("option");
            elementoOpcao.value = opcao["valor"];
            elementoOpcao.textContent = opcao["conteudo"];
            campo[0].appendChild(elementoOpcao);
        }

        return this;
    }

    configurarConsulta(carregaveis, classe, consulta) {
        this.classeCarregaveis = "." + classe;
        this.campo.addClass(classe);

        for (const carregavel of carregaveis) {
            carregavel.campo.addClass(classe);
        }

        this.adicionarEvento("blur.consulta", consulta);
    }

    iniciarCarregamento() {
        const carregaveis = $(this.classeCarregaveis);
        carregaveis.removeClass("carregado");
        this.campo.removeClass("carregado-falha");
        carregaveis.css("animation-delay", "0s");
        this.campo.addClass("carregando");
    }

    finalizarCarregamento() {
        const carregaveis = $(this.classeCarregaveis);
        const carregaveisVisiveis = carregaveis.filter(function () {
            return this.style.display !== "none"
        });

        for (let i = 0; i < carregaveisVisiveis.length; i++) {
            carregaveisVisiveis[i].style.animationDelay = ((i + 1) * 0.15) + "s";
        }

        this.campo.removeClass("carregando");
        carregaveisVisiveis.addClass("carregado");
    }

    falharCarregamento() {
        this.campo.removeClass("carregando");
        this.campo.addClass("carregado-falha");
    }

    obterElementoHtml() {
        return this.campo[0];
    }

    val(valor) {
        if (valor === undefined) {
            return this.campo.val();
        }

        this.campo.trigger("input");

        return this.campo.val(valor);
    }

    cleanVal() {
        return this.campo.cleanVal();
    }
}