// Controlador()
/*
    Responsável por inicializar o formulário e prover funcionalidades genéricas.
 */

const Controlador = (() => {
    // Variáveis para uso na geração e validação do formulário.
    let validador = new Validador();
    let etapa = null;
    let inicializado = false;

    // Interface da API do workflow (BPM) que lida com a inicialização, salvamento de dados e erros do formulário.
    // Função "_rollback" não implementada até o momento
    this.workflowCockpit = workflowCockpit({
        init: _init,
        onSubmit: _saveData,
        onError: _rollback,
    });

    // _init(data: ?, info: ?): void
    /*
        Inicialização do formulário através da API do workflow.
        Também será responsável por carregar as fontes de dados
        com o uso do token do usuário.
     */
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
                return info["getPlatformData"]();
            })
            .then(function (dados) {
                return carregarFontes(dados);
            })
            .then(function () {
                return info["getInfoFromProcessVariables"]();
            })
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

    // _saveData(data: ?, info: ?): Promise<{}>
    /*
        Valida o formulário e salva os dados na API do Workflow.
     */
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

    // inicializar(): void
    /*
        Inicializa o formulário, podendo ser através da API ou localmente.
     */
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
        configurarElementosFixos();
        aplicarValidacoes(Formulario.obterValidacoes());
        inicializado = true;
    }

    // carregarFontes(dadosPlataforma: {}): void
    /*
        Carrega as fontes de dados definidas na classe Formulario usando o token de acesso do Senior X.
     */
    async function carregarFontes(dadosPlataforma) {
        const token = dadosPlataforma["token"]["access_token"];

        for (const nomeFonte in Formulario.fontes) {
            const fonte = Formulario.fontes[nomeFonte];

            const dados = await Consultor.carregarFonte(fonte, token)
            fonte.definirDados(dados);
            console.log(dados);

            for (const campo of fonte.camposCorrespondentes) {
                Formulario.campos[campo].adicionarOpcoes(fonte.gerarOpcoes());
            }
        }
    }

    // validarFormulario(): void
    /*
        Valida o formulário e exibe uma mensagem conforme o resultado da validação.
        Caso o formulário seja inválido, um erro é lançado para impedir que a plataforma prossiga
        com o envio dos dados.
     */
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

    // configurarEtapas(): void
    /*
        Configura as etapas do processo com base nos parâmetros da URL, usando como sufixo "?etapa=nomeDaEtapa&".
        Ex.: https://gnativa.github.io/bpm-clientes-fornecedores/?etapa=solicitacao&
        O "&" ao final é adicionado para considerar os parâmetros inseridos na URL pelo próprio Senior X.
     */
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

    // configurarElementosFixos(): void
    /*
        Configura opções diversas de elementos fixos, como o botão de enviar utilizado para testes de validação
        do formulário.
     */
    function configurarElementosFixos() {
        $("#enviar").on("click", function () {
            validarFormulario();
        });
    }

    // aplicarValidacoes(validacoes: array<Validacao>): void
    /*
        Define a lista de validações do validador e as configura.
     */
    function aplicarValidacoes(validacoes) {
        validador.validacoes = validacoes;
        validador.configurarValidacoes();
    }

    return {
        inicializar
    };
})();