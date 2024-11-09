class Validacao {
    constructor(ativa, feedback, camposMonitorados, camposConsistidos, camposObrigatorios, camposEscondidos, camposDesabilitados,
                camposMostrados, camposHabilitados) {
        this.ativa = ativa;
        this.feedback = feedback;
        this.camposMonitorados = camposMonitorados ?? [];
        this.camposConsistidos = camposConsistidos ?? [];
        this.camposObrigatorios = camposObrigatorios ?? [];
        this.camposEscondidos = camposEscondidos ?? [];
        this.camposDesabilitados = camposDesabilitados ?? [];
        this.camposMostrados = camposMostrados ?? [];
        this.camposHabilitados = camposHabilitados ?? [];
    }
}

class Validador {
    constructor() {
        this.validacoes = [];
    }

    adicionarValidacao(validacao) {
        this.validacoes.push(validacao);
    }

    validarCampos() {
        $(".campo")
            .trigger("change.tornarObrigatorio")
            .filter("[required]:visible")
            .filter(function () {
                return this.value === ""
            })
            .addClass("nao-preenchido")
            .trigger("change.consistir");
    }

    validarCamposObrigatorios() {
        $("[required]:visible").trigger("blur.obrigatorio");
    }

    formularioValido() {
        return $(".nao-preenchido:visible").length === 0
            && $(".is-invalid:visible").length === 0;
    }

    configurarValidacoes() {
        for (const validacao of this.validacoes) {
            const campos = [...validacao.camposMonitorados];

            for (const campo of campos) {
                campo.adicionarEvento("change.consistir", function() {
                    for (const consistido of validacao.camposConsistidos) {
                        consistido.definirValidez(!validacao.ativa());
                        consistido.definirFeedback(validacao.feedback);
                        consistido.mostrarFeedback(validacao.ativa());
                    }
                });

                campo.adicionarEvento("change.tornarObrigatorio", function() {
                    for (const obrigatorio of validacao.camposObrigatorios) {
                        obrigatorio.definirObrigatoriedade(validacao.ativa());
                    }
                });

                campo.adicionarEvento("change.esconder", function() {
                    for (const escondido of validacao.camposEscondidos) {
                        escondido.definirVisibilidade(!validacao.ativa());
                    }
                });

                campo.adicionarEvento("change.desabilitar", function() {
                    for (const desabilitado of validacao.camposDesabilitados) {
                        desabilitado.definirEdicao(!validacao.ativa());
                    }
                });

                campo.adicionarEvento("change.mostrar", function() {
                    for (const escondido of validacao.camposMostrados) {
                        escondido.definirVisibilidade(validacao.ativa());
                    }
                });

                campo.adicionarEvento("change.habilitar", function() {
                    for (const desabilitado of validacao.camposHabilitados) {
                        desabilitado.definirEdicao(validacao.ativa());
                    }
                });

                campo.campo.trigger("change.consistir");
                campo.campo.trigger("change.tornarObrigatorio");
                campo.campo.trigger("change.esconder");
                campo.campo.trigger("change.desabilitar");
                campo.campo.trigger("change.mostrar");
                campo.campo.trigger("change.habilitar");
            }
        }
    }
}