/*
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
 */

(function($) {
    $.fn.campo = function(options) {
        const parametros = $.extend({
            idCampo: null,
            rotulo: "",
            tipo: "",
            largura: 12,
            dica: null,
            altura: null,
            propriedadesAdicionais: {},
            $coluna: $("<div>"),
        }, options);

        if (document.getElementById(parametros.idCampo) !== null) {
            throw Error(`Já existe um campo com o id "${parametros.idCampo}".`);
        }

        // Verificar se o tipo é válido
        if (!(parametros.tipo in tipoParaElemento)) {
            throw Error(`Tipo de campo "${parametros.tipo}" inválido ou não suportado.`);
        }

        // Função principal do plugin
        return this.each(function() {
            parametros.$coluna.addClass(
                parametros.largura >= 1 && parametros.largura <= 12 ? `col-${parametros.largura}` : "col"
            );

            const elementoConfig = tipoParaElemento[parametros.tipo];
            const $campo = $(`<${elementoConfig.elemento}>`, {
                id: parametros.idCampo,
                name: parametros.idCampo,
                placeholder: parametros.rotulo,
                title: parametros.dica,
                type: elementoConfig.tipo || undefined
            });

            for (const [prop, val] of Object.entries(parametros.propriedadesAdicionais)) {
                $campo.prop(prop, val);
            }

            // Condicionais de estrutura e layout por tipo de elemento
            if (["input", "textarea"].includes(elementoConfig.elemento) && parametros.tipo !== "file") {
                const $label = $("<label>", {
                    for: parametros.idCampo,
                    text: parametros.rotulo,
                });

                let $container;

                if (parametros.tipo === "checkbox") {
                    $container = $(`<div class="form-check">`);
                    $campo.addClass("form-check-input");
                    $label.addClass("form-check-label mt-1 ms-2");
                }
                else {
                    $container = $(`<div class="form-floating">`);
                    $campo.addClass("form-control");

                    if (parametros.altura) {
                        $campo.css("height", parametros.altura);
                    }
                }

                $container.append($campo, $label);
                parametros.$coluna.append($container);
            }
            else if (elementoConfig.elemento === "select") {
                $campo.addClass("form-select").append(new Option(parametros.rotulo, ""));
                parametros.$coluna.append($campo);
            }
            else if (parametros.tipo === "file") {
                const $label = $("<label>", {
                    for: parametros.idCampo,
                    text: parametros.rotulo
                });
                parametros.$coluna.append($label, $campo.addClass("form-control"));

                // Elemento para exibir os links de arquivos
                const $links = $("<div>", { class: "links mt-1" });
                parametros.$coluna.append($links);

                $campo.on("change", function() {
                    $links.empty();
                    for (const arquivo of this.files) {
                        const $link = $("<a>", {
                            target: "_blank",
                            href: URL.createObjectURL(arquivo),
                            text: arquivo.name
                        });
                        $links.append($link, "<br>");
                    }
                });
            }

            // Métodos jQuery
            $campo.extend({
                definirObrigatoriedade(obrigatorio) {
                    $campo.prop("aria-required", obrigatorio).prop("required", obrigatorio);

                    if (obrigatorio) {
                        $campo.on("blur.obrigatorio", verificarPreenchimento);
                    } else {
                        $campo.off("blur.obrigatorio");
                        $campo.removeClass("nao-preenchido");
                    }

                    function verificarPreenchimento() {
                        if ($campo.val() === "" || ($campo.is(":checkbox") && !$campo.is(":checked"))) {
                            $campo.addClass("nao-preenchido");
                        } else {
                            $campo.removeClass("nao-preenchido");
                        }
                    }
                },

                definirVisibilidade(visivel) {
                    parametros.$coluna.toggle(visivel);
                },

                definirEdicao(editavel) {
                    $campo.prop("disabled", !editavel);
                },

                definirValidez(valido) {
                    $campo.prop("aria-invalid", !valido).toggleClass("is-invalid", !valido);
                },

                configurarMascara(mascara, opcoes) {
                    $campo.mask(mascara, opcoes || { clearIfNotMatch: true });
                },

                adicionarEvento(evento, funcao) {
                    $campo.on(evento, funcao);
                },

                removerEvento(evento) {
                    $campo.off(evento);
                },

                definirFeedback(mensagem) {
                    const $feedback = $("<div>", {
                        text: mensagem,
                        class: "feedback",
                        css: {display: "none"}
                    });
                    parametros.$coluna.append($feedback);
                    $campo.on("focus feedback", function() {
                        $feedback.toggle();
                    });
                }
            });

            $(this).data("campo", $campo);
        });
    };
})(jQuery);