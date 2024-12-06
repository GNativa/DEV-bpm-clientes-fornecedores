const Mensagem = (() => {
    const container = $("#containerMensagens");

    const tiposDeMensagem = {
        "sucesso": "bi-check-square-fill sucesso",
        "info": "bi-info-circle-fill info",
        "aviso": "bi-exclamation-triangle-fill aviso",
        "erro": "bi-exclamation-diamond-fill erro",
    };

    const exibir = (textoTitulo, conteudo, tipoMensagem, segundosTimeout) => {
        const tipo = tipoMensagem.toLowerCase();

        if (!(tipo in tiposDeMensagem)) {
            throw new Error(`Tipo de mensagem "${tipo}" não suportado.`);
        }

        const elementoToast = $(`<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false"></div>`);
            const cabecalho = $(`<div class="toast-header"></div>`);
                const icone = $(`<i class="bi ${tiposDeMensagem[tipo]} me-2 fs-5"></i>`);
                const titulo = $(`<strong class="me-auto titulo-p">${textoTitulo}</strong>`);
            const corpo = $(`<div class="toast-body texto-mensagem">${conteudo}</div>`);

        const toast = bootstrap.Toast.getOrCreateInstance(elementoToast[0]);

        cabecalho.append(icone);
        cabecalho.append(titulo);
        elementoToast.append(cabecalho);
        elementoToast.append(corpo);
        container.append(elementoToast);
        toast.show();

        if (!segundosTimeout) {
            const botaoFechar = $(`<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Fechar">`);

            botaoFechar.on("click", function() {
                setTimeout(function() {
                    elementoToast.remove();
                }, 10000);
            });

            cabecalho.append(botaoFechar);
        }
        else {
            elementoToast.on("click", function() {
                toast.hide();
            });

            setTimeout(function() {
                toast.hide();

                setTimeout(function () {
                    elementoToast.remove();
                }, 20000);
            }, segundosTimeout * 1000);
        }
    }

    return {
        exibir,
    };
})();