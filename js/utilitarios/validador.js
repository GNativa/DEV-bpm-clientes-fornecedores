class Validacao {
    static proximoId = 1;

    constructor(id, ativa, feedback, camposMonitorados, camposConsistidos, camposObrigatorios, camposEscondidos, camposDesabilitados,
                camposMostrados, camposHabilitados) {
        this.id = id;
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
            .trigger("change")
            .filter("[required]:visible")
            .filter(function () {
                return this.value === ""
            })
            .addClass("nao-preenchido")
            .trigger("change");
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
                campo.adicionarEvento("change", function() {
                    for (const consistido of validacao.camposConsistidos) {
                        if (consistido["consistenciaAtiva"] !== null && consistido["consistenciaAtiva"]["id"] !== validacao["id"]) {
                            continue;
                        }

                        if (validacao.ativa() && consistido["consistenciaAtiva"] === null) {
                            consistido.definirConsistenciaAtiva(validacao);
                        }
                        else if (!validacao.ativa()
                              && consistido["consistenciaAtiva"] !== null
                              && consistido["consistenciaAtiva"]["id"] === validacao["id"]) {
                            consistido.definirConsistenciaAtiva(null);
                        }

                        consistido.definirValidez(!validacao.ativa());
                        consistido.definirFeedback(validacao.feedback ?? "");
                        consistido.mostrarFeedback(validacao.ativa());
                    }
                });

                campo.adicionarEvento("change", function() {
                    for (const obrigatorio of validacao.camposObrigatorios) {
                        obrigatorio.definirObrigatoriedade(validacao.ativa());
                    }
                });

                campo.adicionarEvento("change", function() {
                    for (const escondido of validacao.camposEscondidos) {
                        escondido.definirVisibilidade(!validacao.ativa());
                    }
                });

                campo.adicionarEvento("change", function() {
                    for (const desabilitado of validacao.camposDesabilitados) {
                        desabilitado.definirEdicao(!validacao.ativa());
                    }
                });

                campo.adicionarEvento("change", function() {
                    for (const escondido of validacao.camposMostrados) {
                        escondido.definirVisibilidade(validacao.ativa());
                    }
                });

                campo.adicionarEvento("change", function() {
                    for (const desabilitado of validacao.camposHabilitados) {
                        desabilitado.definirEdicao(validacao.ativa());
                    }
                });

                campo.campo.trigger("change");
            }
        }
    }
}