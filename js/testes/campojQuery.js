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
        const settings = $.extend({
            idCampo: null,
            rotulo: "",
            tipo: "",
            largura: 12,
            dica: null,
            altura: null,
            propriedadesAdicionais: {},
            $coluna: $("<div>")
        }, options);

        // Verificar se o tipo é válido
        if (!(settings.tipo in tipoParaElemento)) {
            throw Error(`Tipo de campo "${settings.tipo}" inválido ou não suportado.`);
        }

        // Função principal do plugin
        return this.each(function() {
            settings.$coluna.addClass(
                settings.largura >= 1 && settings.largura <= 12 ? `col-${settings.largura}` : "col"
            );

            const elementoConfig = tipoParaElemento[settings.tipo];
            const $campo = $(`<${elementoConfig.elemento}>`, {
                id: settings.idCampo,
                name: settings.idCampo,
                placeholder: settings.rotulo,
                title: settings.dica,
                type: elementoConfig.tipo || undefined
            });

            for (const [prop, val] of Object.entries(settings.propriedadesAdicionais)) {
                $campo.prop(prop, val);
            }

            // Condicionais de estrutura e layout por tipo de elemento
            if (["input", "textarea"].includes(elementoConfig.elemento) && settings.tipo !== "file") {
                const $label = $("<label>", {
                    for: settings.idCampo,
                    text: settings.rotulo,
                });

                let $container;

                if (settings.tipo === "checkbox") {
                    $container = $(`<div class="form-check">`);
                    $campo.addClass("form-check-input");
                    $label.addClass("form-check-label mt-1 ms-2");
                }
                else {
                    $container = $(`<div class="form-floating">`);
                    $campo.addClass("form-control");

                    if (settings.altura) $campo.css("height", settings.altura);
                }

                $container.append($campo, $label);
                settings.$coluna.append($container);
            }
            else if (elementoConfig.elemento === "select") {
                $campo.addClass("form-select").append(new Option(settings.rotulo, ""));
                settings.$coluna.append($campo);
            }
            else if (settings.tipo === "file") {
                const $label = $("<label>", {
                    for: settings.idCampo,
                    text: settings.rotulo
                });
                settings.$coluna.append($label, $campo.addClass("form-control"));

                // Elemento para exibir os links de arquivos
                const $links = $("<div>", { class: "links mt-1" });
                settings.$coluna.append($links);

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
                    settings.$coluna.toggle(visivel);
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
                    settings.$coluna.append($feedback);
                    $campo.on("focus feedback", function() {
                        $feedback.toggle();
                    });
                }
            });

            $(this).data("campo", $campo);
        });
    };
})(jQuery);