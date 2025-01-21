/*
    > Controlador
        - Responsável por inicializar o formulário e prover funcionalidades genéricas
 */

const Controlador = (() => {
    // Variáveis para uso na geração e validação do formulário
    let validador = new Validador();
    let etapa = null;
    let inicializado = false;

    // Interface da API do workflow (BPM) que lida com a inicialização, salvamento de dados e erros do formulário
    // Função "_rollback" não implementada até o momento
    this.workflowCockpit = workflowCockpit({
        init: _init,
        onSubmit: _saveData,
        onError: _rollback,
    });

    // Função de inicialização do formulário chamada pela API do workflow
    function _init(data, info) {
        inicializar();
        const {initialVariables} = data["loadContext"];
        console.log(initialVariables);

        info["getUserData"]()
            .then(function (user) {
                console.log(user);
                /*
                {
                    "id": "",
                    "username": "",
                    "subject": "",
                    "fullname": "",
                    "email": "",
                    "tenantName": "",
                    "tenantLocale": "pt-BR",
                    "locale": "pt-BR"
                }
                 */
            })
            .then(function () {
                /*
                info["getPlatformData"]().then((dados) => {
                    carregarFontes(dados);
                });
                 */
            });

        info["getInfoFromProcessVariables"]()
            .then(function (data) {
                console.log(data);

                if (!info["isRequestNew"]() && Array.isArray(data)) {
                    const mapa = new Map();

                    for (let i = 0; i < data.length; i++) {
                        mapa.set(data[i].key, data[i].value || "");
                    }

                    console.log("Carregando dados: ", mapa);
                    Formulario.carregarDados(mapa);

                    // Disparar eventos dos campos para ativar validações
                    for (const campo in Formulario.campos) {
                        Formulario.campos[campo].campo.trigger("change");
                    }
                }
            });
    }

    async function _saveData(data, info) {
        validarFormulario();

        let dados = await Formulario.salvarDados();

        console.log(dados);
        return {
            formData: dados,
        };
    }

    function _rollback() {
        // A implementar.
    }

    function inicializar() {
        if (inicializado) {
            return;
        }

        Formulario.gerar();
        // Formulario.listarCampos();
        Formulario.configurarPlugins();
        Formulario.configurarEventos();
        Formulario.definirEstadoInicial();

        configurarEtapas();
        aplicarValidacoes(Formulario.obterValidacoes());
        inicializado = true;
    }

    function carregarFontes(dadosPlataforma) {
        const token = dadosPlataforma["token"]["access_token"];

        for (const nomeFonte in Formulario.fontes) {
            Consultor.carregarFonte(Formulario.fontes[nomeFonte], token)
                .then((dados) => {
                    Formulario.fontes[nomeFonte].dados = dados;
                    console.log(dados);
                });
        }
    }

    function validarFormulario() {
        validador.validarCampos();

        const titulo = "Validação";
        let mensagem = "Dados validados com sucesso.";

        if (!validador.formularioValido()) {
            mensagem = "Dados inválidos. Preencha todos os campos obrigatórios e verifique as informações inseridas "
                + "no formulário para prosseguir.";
            Mensagem.exibir(titulo, mensagem, "aviso");
            throw new Error(mensagem);
        }
        else {
            Mensagem.exibir(titulo, mensagem, "sucesso");
        }
    }

    // Configuração das etapas com base nos parâmetros da URL
    // Ex.: https://gnativa.github.io/bpm-clientes-fornecedores/?etapa=solicitacao&
    // O & ao final é adicionado para considerar os parâmetros inseridos na URL pelo próprio Senior X
    function configurarEtapas() {
        const url = new URL(window.location.toLocaleString());
        const parametros = url.searchParams;
        etapa = parametros.get("etapa");

        // Bloquear todos os campos caso o formulário seja acessado de modo avulso
        // Ex.: consulta da solicitação na Central de Tarefas
        if (etapa === null || !(etapa in Formulario.camposObrigatorios)) {
            for (const idCampo in Formulario.campos) {
                Formulario.campos[idCampo].definirEdicao(false);
                Formulario.campos[idCampo].sobrescreverEditabilidade(true);
                Formulario.campos[idCampo].sobrescreverObrigatoriedade(true);
            }

            return;
        }

        for (const idCampo of Formulario.camposObrigatorios[etapa]) {
            Formulario.campos[idCampo].definirObrigatoriedade(true);
        }

        for (const idCampo of Formulario.camposBloqueados[etapa]) {
            Formulario.campos[idCampo].definirEdicao(false);
            Formulario.campos[idCampo].sobrescreverEditabilidade(true);
        }

        for (const idCampo of Formulario.camposOcultos[etapa]) {
            Formulario.campos[idCampo].definirVisibilidade(false);
            Formulario.campos[idCampo].sobrescreverVisibilidade(true);
        }
    }

    function aplicarValidacoes(validacoes) {
        validador.validacoes = validacoes;
        validador.configurarValidacoes();
    }

    return {
        validarFormulario, inicializar
    };
})();