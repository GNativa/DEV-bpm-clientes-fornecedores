/*
    > Formulário
        - Mantém o estado do formulário, realizando carregamento e salvamento de dados, validações etc.
 */

const FormularioTemplate = (() => {
    // Variáveis para uso em validações, consultas, etc.
    let campos = {};

    let variavelA = true, variavelB = "";

    let secaoA,
        secaoB,
        secaoC;

    // Listas dos IDs dos campos que serão obrigatórios, bloqueados ou ocultos por etapa
    const camposObrigatorios = {
        "etapa1": ["campo1", "campo2", "campo3"],
        "etapa2": ["campo1", "campo2", "campo3"],
        "etapa3": ["campo1", "campo2", "campo3"],
    };

    const camposBloqueados = {
        "etapa1": ["campo1", "campo2", "campo3"],
        "etapa2": ["campo1", "campo2", "campo3"],
        "etapa3": ["campo1", "campo2", "campo3"],
    };

    const camposOcultos = {
        "etapa1": [],
        "etapa2": [],
        "etapa3": [],
    };

    const fontes = {
        "fonte1": new Fonte("Fonte1", []),
        "fonte2": new Fonte("Fonte2", []),
    };

    // obterValidacoes(): array<Validacao>
    /*
        Validações a serem usadas no formulário.
     */
    function obterValidacoes() {
        return [
            new Validacao(() => {
                    return true;
                },
                "Feedback 1",
                [campos["campo1"]],
                [campos["campo1"], campos["campo2"], campos["campo3"]],
                [campos["campo1"], campos["campo2"], campos["campo3"]],
                null,
                null,
                [campos["campo1"], campos["campo2"], campos["campo3"]],
                [campos["campo1"], campos["campo2"], campos["campo3"]],
            ),
            new Validacao(() => {
                    return false;
                },
                "Feedback 2",
                [campos["campo2"], campos["campo3"]],
                [campos["campo1"], campos["campo2"], campos["campo3"]],
                [campos["campo1"], campos["campo2"], campos["campo3"]],
                [campos["campo1"], campos["campo2"], campos["campo3"]],
                [campos["campo1"], campos["campo2"], campos["campo3"]],
                null,
                null,
            ),
        ];
    }

    // salvarDados(): Promise<{}>
    /*
        Guarda os dados de todos os campos em um objeto para uso na função _saveData da API do workflow.
     */
    async function salvarDados() {
        let dados = {};

        dados.campo1 = campos["campo1"].val();
        dados.campo2 = campos["campo2"].val();
        dados.campo3 = campos["campo3"].val();

        return dados;
    }

    // carregarDados(mapa: Map): void
    /*
        Extrai os dados do mapa obtido como retorno da API do workflow,
        repassando-os para os campos e variáveis necessárias.
     */
    function carregarDados(mapa) {
        campos["campo1"].val(mapa.get("campo1") || "");
        campos["campo2"].val(mapa.get("campo2") || "");
        campos["campo3"].val(mapa.get("campo3") || "");
    }

    // definirEstadoInicial(): void
    /*
        Configura máscaras de campos, consultas de APIs e parâmetros diversos.
     */
    function definirEstadoInicial() {
    }

    // configurarPlugins(): void
    /*
        Configura plugins que necessitam de inicialização na página.
     */
    function configurarPlugins() {
        const tooltipTriggerList =
            document.querySelectorAll(`[data-bs-toggle="tooltip"]`);
        const tooltipList = [...tooltipTriggerList].map(
            tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl)
        );
    }

    // configurarEventos(): void
    /*
        Configura eventos em elementos diversos.
     */
    function configurarEventos() {
        // A implementar.
    }

    // listarCampos(): void
    /*
        Obtém os IDs dos campos na variável campos{} e os lista no console.
     */
    function listarCampos() {
        const props = [];

        for (const prop in campos) {
            props.push(`"${prop}"`);
        }

        console.log(props.join(", "));
    }

    // gerar(): void
    /*
        Define os campos do formulário, agrupados por seção, e suas propriedades.
     */
    function gerar() {
        const camposSecaoA = [
            new Campo(
                "campo1", "Campo 1", "checkbox", 2, "Esta é uma caixa de seleção.",
            ),
            new Campo(
                "campo2", "Campo 2", "texto", 4,
            ),
            new Campo(
                "campo3", "Campo 3", "email", 4,
            ),
            new Campo(
                "campo4", "Campo 4", "area-texto", 2, "As dicas não são obrigatórias.", 5
            ),
            new Campo(
                "campo5", "Campo 5", "anexo", 6, null, null, null, {multiple: true},
            ),
            new Campo(
                "campo6", "Campo 6", "lista", 4, "É necessário adicionar opções nesse campo.",
            )
                .adicionarOpcoes([
                    new OpcaoLista("1", "1 - Opção 1"),
                    new OpcaoLista("2", "2 - Opção 2"),
                    new OpcaoLista("3", "3 - Opção 3"),
                ]
            ),
            new Campo(
                "campo7", "Campo 7", "data", 2, "Dica",
            ),
        ];

        salvarCampos(camposSecaoA);
        secaoA = new Secao("secaoA", "Seção A", camposSecaoA);
    }

    // salvarDados(listaDeCampos: array<Campo>): void
    /*
        Salva os campos de uma lista no objeto de campos{} para acesso via ID.
     */
    function salvarCampos(listaDeCampos) {
        for (const campo of listaDeCampos) {
            campos[campo["id"]] = campo;
        }
    }

    return {
        campos,
        camposObrigatorios,
        camposBloqueados,
        camposOcultos,
        fontes,
        listarCampos,
        carregarDados,
        salvarDados,
        obterValidacoes,
        configurarPlugins,
        definirEstadoInicial,
        configurarEventos,
        gerar
    };
})();