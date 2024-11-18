const Controlador = (() => {
    // Listas dos IDs dos campos que serão obrigatórios, bloqueados ou ocultos por etapa
    // Formato:
    // { "etapa1": ["campo1", "campo2, "campo3"], "etapa2": ["campo1", "campo2"] }
    const camposObrigatorios = {
        "solicitacao": ["documento", "razaoSocial", "nomeFantasia", "ramoAtividade", "cep", "logradouro", "numero", "bairro",
            "formaPagamento", "documentosPessoaFisica", "comprovanteEndereco"],
        "aprovacaoInicial": ["observacoesAprovacao"],
        "execucao": [],
        "aprovacaoContasBancarias": ["observacoesAprovacao"],
        "revisaoAprovacao": ["documento", "razaoSocial", "nomeFantasia", "ramoAtividade", "cep", "logradouro", "numero", "bairro",
            "formaPagamento", "documentosPessoaFisica", "comprovanteEndereco"],
        "revisaoErros": ["documento", "razaoSocial", "nomeFantasia", "ramoAtividade", "cep", "logradouro", "numero", "bairro",
            "formaPagamento", "documentosPessoaFisica", "comprovanteEndereco"]
    };
    const camposBloqueados = {
        "solicitacao": ["estado", "cidade"],
        "aprovacaoInicial": ["documento", "cadastroComRestricao", "razaoSocial", "nomeFantasia", "mercadoExterior", "fornecedorIndustria",
            "ramoAtividade", "inscricaoEstadual", "cep", "estado", "cidade", "logradouro", "numero", "bairro", "complemento", "enderecoCorresp",
            "nomeContato", "emailContato", "emailAdicional", "telefone", "celular", "contatoAdicional", "formaPagamento", "banco", "agenciaDigito",
            "contaDigito", "tipoConta", "documentoConta", "titularConta", "favNomeFantasia", "favCep", "favEstado", "favCidade", "favLogradouro",
            "favBairro", "favNumero", "favComplemento", "favEmail", "favTelefone", "observacoes", "documentosPessoaFisica", "comprovanteEndereco",
            "comprovanteContaBancaria", "retornoRegra"],
        "execucao": [],
        "aprovacaoContasBancarias": ["documento", "cadastroComRestricao", "razaoSocial", "nomeFantasia", "mercadoExterior", "fornecedorIndustria",
            "ramoAtividade", "inscricaoEstadual", "cep", "estado", "cidade", "logradouro", "numero", "bairro", "complemento", "enderecoCorresp",
            "nomeContato", "emailContato", "emailAdicional", "telefone", "celular", "contatoAdicional", "formaPagamento", "banco", "agenciaDigito",
            "contaDigito", "tipoConta", "documentoConta", "titularConta", "favNomeFantasia", "favCep", "favEstado", "favCidade", "favLogradouro",
            "favBairro", "favNumero", "favComplemento", "favEmail", "favTelefone", "observacoes", "documentosPessoaFisica", "comprovanteEndereco", "retornoRegra"],
        "revisaoAprovacao": ["estado", "cidade", "observacoesAprovacao"],
        "revisaoErros": ["estado", "cidade", "observacoesAprovacao"]
    };
    const camposOcultos = {
        "solicitacao": ["observacoesAprovacao", "retornoRegra", "nomeUsuario"],
        "aprovacaoInicial": ["retornoRegra", "nomeUsuario"],
        "execucao": [],
        "aprovacaoContasBancarias": ["retornoRegra", "nomeUsuario"],
        "revisaoAprovacao": ["retornoRegra", "nomeUsuario"],
        "revisaoErros": ["retornoRegra", "nomeUsuario"]
    };

    // Variáveis para uso na geração e validação do formulário
    let validador = new Validador();
    let etapa = null;
    let inicializado = false;

    // Variáveis para uso em validações, consultas, etc.
    let cnpjInaptoCadastro = false;

    let campos = {},             // Contém todos os campos no formato { "id": Campo }
        aprovacao = {},          // Campos da seção de aprovação
        secaoAprovacao,              // A própria seção de aprovação
        dadosPrincipais = {},    // Campos da seção de dados principais
        secaoDadosPrincipais,        // Etc.
        contaBancaria = {},
        secaoContaBancaria,
        detalhesDocumentos = {},
        secaoDetalhesDocumentos,
        controle = {},
        secaoControle,
        botaoEnviar;

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
        const { initialVariables } = data["loadContext"];
        console.log(initialVariables);

        info
            .getUserData()
            .then(function (user) {
                console.log(user);
                /*
                {
                    "id": "b64e1f31-9b9a-42f8-bd0a-7ac34e8b9206",
                    "username": "carlos.santos@gruponativa-homolog.com.br",
                    "subject": "carlos.santos",
                    "fullname": "Carlos Henrique Menezes dos Santos",
                    "email": "carlos.santos@gruponativa.com.br",
                    "tenantName": "gruponativa-homologcombr",
                    "tenantLocale": "pt-BR",
                    "locale": "pt-BR"
                }
                 */
            })
            .then(function () {
                info.getPlatformData().then(function (platformData) {
                    console.log(platformData);
                });
            });

        info
            .getInfoFromProcessVariables()
            .then(function (data) {
                console.log(data);

                if (!info.isRequestNew() && Array.isArray(data)) {
                    const map = new Map();

                    for (let i = 0; i < data.length; i++) {
                        map.set(data[i].key, data[i].value || "");
                    }

                    console.log("Carregando dados: ", map);

                    campos["observacoesAprovacao"].val(map.get("observacoesAprovacao") || "");
                    campos["documento"].val(map.get("documento") || "");
                    campos["cadastroComRestricao"].campo.prop("checked", (map.get("cadastroComRestricao") ?? "false") === "true");
                    campos["razaoSocial"].val(map.get("razaoSocial") || "");
                    campos["nomeFantasia"].val(map.get("nomeFantasia") || "");
                    campos["mercadoExterior"].campo.prop("checked", (map.get("mercadoExterior") ?? "false") === "true");
                    campos["fornecedorIndustria"].campo.prop("checked", (map.get("fornecedorIndustria") ?? "false") === "true");
                    campos["ramoAtividade"].val(map.get("ramoAtividade") || "");
                    campos["inscricaoEstadual"].val(map.get("inscricaoEstadual") || "");
                    campos["cep"].val(map.get("cep") || "");
                    campos["estado"].val(map.get("estado") || "");
                    campos["cidade"].val(map.get("cidade") || "");
                    campos["logradouro"].val(map.get("logradouro") || "");
                    campos["numero"].val(map.get("numero") || "");
                    campos["bairro"].val(map.get("bairro") || "");
                    campos["complemento"].val(map.get("complemento") || "");
                    campos["enderecoCorresp"].val(map.get("enderecoCorresp") || "");
                    campos["nomeContato"].val(map.get("nomeContato") || "");
                    campos["emailContato"].val(map.get("emailContato") || "");
                    campos["emailAdicional"].val(map.get("emailAdicional") || "");
                    campos["telefone"].val(map.get("telefone") || "");
                    campos["celular"].val(map.get("celular") || "");
                    campos["contatoAdicional"].val(map.get("contatoAdicional") || "");
                    campos["formaPagamento"].val(map.get("formaPagamento") || "");
                    campos["banco"].val(map.get("banco") || "");
                    campos["agenciaDigito"].val(map.get("agenciaDigito") || "");
                    campos["contaDigito"].val(map.get("contaDigito") || "");
                    campos["tipoConta"].val(map.get("tipoConta") || "");
                    campos["documentoConta"].val(map.get("documentoConta") || "");
                    campos["titularConta"].val(map.get("titularConta") || "");
                    campos["favNomeFantasia"].val(map.get("favNomeFantasia") || "");
                    campos["favCep"].val(map.get("favCep") || "");
                    campos["favEstado"].val(map.get("favEstado") || "");
                    campos["favCidade"].val(map.get("favCidade") || "");
                    campos["favLogradouro"].val(map.get("favLogradouro") || "");
                    campos["favBairro"].val(map.get("favBairro") || "");
                    campos["favNumero"].val(map.get("favNumero") || "");
                    campos["favComplemento"].val(map.get("favComplemento") || "");
                    campos["favEmail"].val(map.get("favEmail") || "");
                    campos["favTelefone"].val(map.get("favTelefone") || "");
                    campos["observacoes"].val(map.get("observacoes") || "");
                    campos["nomeUsuario"].val(map.get("nomeUsuario") || "");
                    campos["retornoRegra"].val(map.get("retornoRegra") || "");
                    campos["documentosPessoaFisica"].campo.prop(
                        "files",
                        Genericos.carregarArquivosDeString(map.get("documentosPessoaFisica") || "")
                    ).trigger("change");
                    campos["comprovanteEndereco"].campo.prop(
                        "files",
                        Genericos.carregarArquivosDeString(map.get("comprovanteEndereco") || "")
                    ).trigger("change");
                    campos["comprovanteContaBancaria"].campo.prop(
                        "files",
                        Genericos.carregarArquivosDeString(map.get("comprovanteContaBancaria") || "")
                    ).trigger("change");
                }
            });
    }

    async function _saveData(data, info) {
        validador.validarCampos();

        if (!validador.formularioValido()) {
            const mensagem = "Dados inválidos. Corrija as informações preenchidas no formulário e preencha todos os campos obrigatórios para prosseguir.";
            alert(mensagem);
            throw new Error(mensagem);
        }

        let dados = {};

        dados.observacoesAprovacao = campos["observacoesAprovacao"].val();
        dados.documento = campos["documento"].cleanVal(); // Valor do campo sem máscara
        dados.cadastroComRestricao = campos["cadastroComRestricao"].campo.prop("checked"); // Estado do checkbox (marcado ou não marcado)
        dados.razaoSocial = campos["razaoSocial"].val();
        dados.nomeFantasia = campos["nomeFantasia"].val();
        dados.mercadoExterior = campos["mercadoExterior"].campo.prop("checked");
        dados.fornecedorIndustria = campos["fornecedorIndustria"].campo.prop("checked");
        dados.ramoAtividade = campos["ramoAtividade"].val();
        dados.inscricaoEstadual = campos["inscricaoEstadual"].val();
        dados.cep = campos["cep"].cleanVal();
        dados.estado = campos["estado"].val();
        dados.cidade = campos["cidade"].val();
        dados.logradouro = campos["logradouro"].val();
        dados.numero = campos["numero"].val();
        dados.bairro = campos["bairro"].val();
        dados.complemento = campos["complemento"].val();
        dados.enderecoCorresp = campos["enderecoCorresp"].val();
        dados.nomeContato = campos["nomeContato"].val();
        dados.emailContato = campos["emailContato"].val();
        dados.emailAdicional = campos["emailAdicional"].val();
        dados.telefone = campos["telefone"].cleanVal();
        dados.celular = campos["celular"].cleanVal();
        dados.contatoAdicional = campos["contatoAdicional"].cleanVal();
        dados.formaPagamento = campos["formaPagamento"].val();
        dados.banco = campos["banco"].val();
        dados.agenciaDigito = campos["agenciaDigito"].val();
        dados.contaDigito = campos["contaDigito"].val();
        dados.tipoConta = campos["tipoConta"].val();
        dados.documentoConta = campos["documentoConta"].cleanVal();
        dados.titularConta = campos["titularConta"].val();
        dados.favNomeFantasia = campos["favNomeFantasia"].val();
        dados.favCep = campos["favCep"].val();
        dados.favEstado = campos["favEstado"].val();
        dados.favCidade = campos["favCidade"].val();
        dados.favLogradouro = campos["favLogradouro"].val();
        dados.favBairro = campos["favBairro"].val();
        dados.favNumero = campos["favNumero"].val();
        dados.favComplemento = campos["favComplemento"].val();
        dados.favEmail = campos["favEmail"].val();
        dados.favTelefone = campos["favTelefone"].cleanVal();
        dados.observacoes = campos["observacoes"].val();
        dados.documentosPessoaFisica = await Genericos.salvarArquivosEmString(
            campos["documentosPessoaFisica"].obterElementoHtml()
        ); // Salvamento de anexo na forma de uma string
        dados.comprovanteEndereco = await Genericos.salvarArquivosEmString(
            campos["comprovanteEndereco"].obterElementoHtml()
        );
        dados.comprovanteContaBancaria = await Genericos.salvarArquivosEmString(
            campos["comprovanteContaBancaria"].obterElementoHtml()
        );
        dados.nomeUsuario = campos["nomeUsuario"].val();
        dados.retornoRegra = campos["retornoRegra"].val();

        return {
            formData: dados,
        };
    }

    function _rollback() {

    }

    const inicializar = () => {
        if (inicializado) {
            return;
        }

        inicializado = true;

        // Construção dos campos do formulário
        gerarFormulario();

        // Reunião dos campos de todas as seções em um só "dicionário" (objeto com pares de chave-valor)
        campos = {...aprovacao, ...dadosPrincipais, ...contaBancaria, ...detalhesDocumentos, ...controle};

        // Listagem dos IDs de todos os campos
        // listarCampos();

        // Configuração de eventos, máscaras, validações, consultas, etc.
        definirEstadoInicial();
    }

    const listarCampos = () => {
        const props = [];

        for (const prop in campos) {
            props.push(`"${prop}"`);
        }

        console.log(props.join(", "));
    }

    const definirEstadoInicial = () => {
        botaoEnviar = $("#enviar");
        configurarEtapas();
        configurarEventos();

        // Opções de máscara
        const opcoesDocumento = {
            onKeyPress: function (documento, ev, el, op) {
                const mascaras = ["000.000.000-000", "00.000.000/0000-00"];
                campos["documento"].campo.mask(documento.length <= 14 && documento.length > 0 ? mascaras[0] : mascaras[1], op);
            }
        };
        const opcoesDocumentoConta = {
            onKeyPress: function (documento, ev, el, op) {
                const mascaras = ["000.000.000-000", "00.000.000/0000-00"];
                campos["documentoConta"].campo.mask(documento.length <= 14 && documento.length > 0 ? mascaras[0] : mascaras[1], op);
            }
        };
        const opcoesContato = {
            onKeyPress: function (numero, ev, el, op) {
                const mascaras = ["(00) 0000-00009", "(00) 0 0000-0000"];
                console.log(numero.length);
                campos["contatoAdicional"].campo.mask(numero.length <= 14 && numero.length > 0 ? mascaras[0] : mascaras[1], op);
            },
            clearIfNotMatch: true
        };

        // Configuração das máscaras
        campos["documento"].configurarMascara("00.000.000/0000-00", opcoesDocumento);
        campos["cep"].configurarMascara("00000-000");
        campos["telefone"].configurarMascara("(00) 0000-0000");
        campos["celular"].configurarMascara("(00) 0 0000-0000");
        campos["contatoAdicional"].configurarMascara("(00) 0 0000-0000", opcoesContato);

        campos["documentoConta"].configurarMascara("00.000.000/0000-00", opcoesDocumentoConta);
        campos["favCep"].configurarMascara("00000-000");
        campos["favTelefone"].configurarMascara("(00) 0000-0000");

        // Lista de validações
        validador.validacoes = [
            new Validacao(() => {
                    const documento = campos["documento"].cleanVal();
                    return (documento.length > 11 && documento.length < 14)
                        || (documento.length > 0 && documento.length < 11);
                },
                "Insira um documento completo.",
                [campos["documento"]],
                [campos["documento"]],
            ),

            new Validacao(() => {
                    return campos["documento"].cleanVal().length <= 11;
                },
                null,
                [campos["documento"]],
                null,
                [campos["documentosPessoaFisica"], campos["comprovanteEndereco"]],
                null,
                null,
                null,
                [campos["razaoSocial"], campos["cep"], campos["logradouro"],
                    campos["numero"], campos["bairro"], campos["emailContato"], campos["telefone"]]
            ),

            new Validacao(() => {
                    return campos["formaPagamento"].val() === "3";
                },
                null,
                [campos["formaPagamento"]],
                null,
                [campos["comprovanteContaBancaria"], campos["banco"], campos["agenciaDigito"],
                    campos["contaDigito"], campos["tipoConta"], campos["documentoConta"], campos["titularConta"]],
                null,
                null,
                [campos["banco"], campos["agenciaDigito"], campos["contaDigito"], campos["tipoConta"],
                    campos["documentoConta"], campos["titularConta"]],
                [campos["documentoConta"]]
            ),

            new Validacao(() => {
                    const documentoCadastro = campos["documento"].val();
                    const documentoConta = campos["documentoConta"].val();

                    return campos["formaPagamento"].val() === "3"
                        && ((documentoCadastro !== "") && (documentoConta !== ""))
                        && (documentoCadastro.length !== documentoConta.length);
                },
                "Insira o mesmo tipo de documento (CPF/CNPJ).",
                [campos["documento"], campos["documentoConta"]],
                [campos["documentoConta"]]
            ),

            new Validacao(() => {
                    const documentoCadastro = campos["documento"].val();
                    const documentoConta = campos["documentoConta"].val();

                    return campos["formaPagamento"].val() === "3"
                        && ((documentoCadastro !== "") && (documentoConta !== ""))
                        && (documentoCadastro.length === documentoConta.length)
                        && (documentoCadastro !== documentoConta);
                },
                null,
                [campos["documento"], campos["documentoConta"]],
                null,
                null,
                null,
                null,
                [campos["favNomeFantasia"], campos["favCep"], campos["favEstado"],
                    campos["favCidade"], campos["favLogradouro"], campos["favBairro"], campos["favNumero"], campos["favComplemento"],
                    campos["favEmail"], campos["favTelefone"]],
                [campos["favCep"]]
            ),

            new Validacao(() => {
                    return cnpjInaptoCadastro && !campos["cadastroComRestricao"].campo.prop("checked");
                },
                "A empresa está com restrição. Marque a caixa ao lado para prosseguir.",
                [campos["documento"], campos["cadastroComRestricao"]],
                [campos["documento"]]
            ),

            new Validacao(() => {
                    console.log(cnpjInaptoCadastro && campos["documento"].cleanVal().length === 14);
                    return cnpjInaptoCadastro && campos["documento"].cleanVal().length === 14;
                },
                null,
                [campos["documento"]],
                null,
                [campos["cadastroComRestricao"]],
                null,
                null,
                [campos["cadastroComRestricao"]]
            ),

            new Validacao(() => {
                    const documento = campos["documentoConta"].cleanVal();

                    return campos["formaPagamento"].val() === 3
                        && ((documento.length > 11 && documento.length < 14) || (documento.length > 0 && documento.length < 11));
                },
                "Insira um documento completo.",
                [campos["documentoConta"]],
                [campos["documentoConta"]],
            ),

            /*
            new Validacao(() => {
                    return cnpjInaptoConta && !campos["cadastroComRestricao"].campo.prop("checked");
                },
                "A empresa está com restrição. Marque a caixa ao lado para prosseguir.",
                [campos["documento"], campos["cadastroComRestricao"]],
                [campos["documento"]]
            ),

            new Validacao(() => {
                    return cnpjInaptoCadastro && campos["documento"].cleanVal().length === 14;
                },
                null,
                [campos["documento"]],
                null,
                [campos["cadastroComRestricao"]],
                null,
                null,
                [campos["cadastroComRestricao"]]
            ),
             */
        ];

        validador.configurarValidacoes();

        // Configuração das consultas por API
        const carregaveisCnpj = [campos["documento"], campos["razaoSocial"], campos["nomeFantasia"], campos["cep"],
            campos["estado"], campos["cidade"], campos["logradouro"], campos["numero"], campos["bairro"],
            campos["complemento"], campos["emailContato"], campos["telefone"], campos["contatoAdicional"]];

        campos["documento"].configurarConsulta(
            carregaveisCnpj,
            "carregavel-documento",
            () => {
                consultarCnpj("cadastro", ...carregaveisCnpj);
            }
        );

        const carregaveisCep = [campos["cep"], campos["estado"], campos["cidade"], campos["logradouro"],
            campos["bairro"], campos["complemento"]];

        campos["cep"].configurarConsulta(
            carregaveisCep,
            "carregavel-cep",
            () => {
                consultarCep(...carregaveisCep);
            }
        );

        const carregaveisCnpjFav = [campos["documentoConta"], campos["titularConta"], campos["favNomeFantasia"], campos["favCep"], campos["favEstado"],
            campos["favCidade"], campos["favLogradouro"], campos["favBairro"], campos["favNumero"], campos["favComplemento"],
            campos["favEmail"], campos["favTelefone"]];

        campos["documentoConta"].configurarConsulta(
            carregaveisCnpjFav,
            "carregavel-documento-conta",
            () => {
                consultarCnpj("contaBancaria", ...carregaveisCnpjFav, null);
            }
        );

        const carregaveisCepFav = [campos["favCep"], campos["favEstado"], campos["favCidade"], campos["favLogradouro"],
            campos["favBairro"], campos["favComplemento"]];

        campos["favCep"].configurarConsulta(
            carregaveisCepFav,
            "carregavel-cep-fav",
            () => {
                consultarCep(...carregaveisCepFav);
            }
        );
    }

    // Configuração das etapas com base nos parâmetros da URL
    // Ex.: https://gnativa.github.io/bpm-clientes-fornecedores/?etapa=solicitacao&
    // O & ao final é adicionado para considerar os parâmetros inseridos na URL pelo próprio Senior X
    const configurarEtapas = () => {
        const url = new URL(window.location.toLocaleString());
        const parametros = url.searchParams;
        etapa = parametros.get("etapa");

        // Bloquear todos os campos caso o formulário seja acessado de modo avulso
        // Ex.: consulta da solicitação na Central de Tarefas
        if (etapa === null || !(etapa in camposObrigatorios)) {
            for (const idCampo in campos) {
                campos[idCampo].definirEdicao(false);
                campos[idCampo].sobrescreverEditabilidade(true);
            }

            return;
        }

        for (const idCampo of camposObrigatorios[etapa]) {
            campos[idCampo].definirObrigatoriedade(true);
        }

        for (const idCampo of camposBloqueados[etapa]) {
            campos[idCampo].definirEdicao(false);
            campos[idCampo].sobrescreverEditabilidade(true);
        }

        for (const idCampo of camposOcultos[etapa]) {
            campos[idCampo].definirVisibilidade(false);
            campos[idCampo].sobrescreverVisibilidade(true);
        }
    }

    const configurarEventos = () => {
        botaoEnviar.click(enviar);
    };

    // Função usada para envios de teste
    const enviar = () => {
        validador.validarCampos();

        if (validador.formularioValido()) {
            alert("Ok!");
        } else {
            alert("Formulário inválido!");
        }
    };

    const consultarCnpj = (tipoConsulta, campoDocumento, campoRazaoSocial, campoNomeFantasia, campoCep, campoEstado,
                           campoCidade, campoLogradouro, campoNumero, campoBairro, campoComplemento, campoEmailContato,
                           campoTelefone, campoContatoAdicional) => {
        const carregaveis = $(campoDocumento.classeCarregaveis);
        const cnpj = campoDocumento.cleanVal();

        if (cnpj === "" || (cnpj.length < 14 && campoRazaoSocial.val() !== "")) {
            if (tipoConsulta === "cadastro") {
                cnpjInaptoCadastro = false;
                campos["cadastroComRestricao"].campo.prop("checked", false);
                campos["documento"].campo.trigger("change");
            }

            carregaveis.not(campoDocumento.campo).val("");
            return;
        }

        if (cnpj.length < 14) {
            return;
        }

        campoDocumento.iniciarCarregamento();

        $.getJSON(`https://publica.cnpj.ws/cnpj/${cnpj}`, function (dadosCnpj) {
            campoDocumento.finalizarCarregamento();

            campos["cadastroComRestricao"].campo.prop("checked", false);

            if (tipoConsulta === "cadastro") {
                cnpjInaptoCadastro = dadosCnpj["estabelecimento"]["situacao_cadastral"].toLowerCase() !== "ativa";
                campoDocumento.campo.trigger("change");
            }

            const razaoSocial = dadosCnpj["razao_social"];
            const nomeFantasia = dadosCnpj["estabelecimento"]["nome_fantasia"] ?? "";
            const cep = dadosCnpj["estabelecimento"]["cep"];
            const estado = dadosCnpj["estabelecimento"]["estado"]["sigla"];
            const cidade = dadosCnpj["estabelecimento"]["cidade"]["nome"];
            const logradouro = dadosCnpj["estabelecimento"]["tipo_logradouro"] + " " + dadosCnpj["estabelecimento"]["logradouro"];
            const numero = dadosCnpj["estabelecimento"]["numero"];
            const bairro = dadosCnpj["estabelecimento"]["bairro"];
            const complemento = dadosCnpj["estabelecimento"]["complemento"] ?? "";
            const email = dadosCnpj["estabelecimento"]["email"];
            const ddd1 = dadosCnpj["estabelecimento"]["ddd1"] ?? "";
            const telefone1 = dadosCnpj["estabelecimento"]["telefone1"] ?? "";
            const telefone = ddd1 + telefone1;
            const ddd2 = dadosCnpj["estabelecimento"]["ddd2"] ?? "";
            const telefone2 = dadosCnpj["estabelecimento"]["telefone2"] ?? "";
            const telefoneAdicional = ddd2 + telefone2;

            campoRazaoSocial.val(razaoSocial);
            campoNomeFantasia.val(nomeFantasia);
            campoCep.val(cep);
            campoEstado.val(estado);
            campoCidade.val(cidade);
            campoLogradouro.val(logradouro);
            campoNumero.val(numero);
            campoBairro.val(bairro);
            campoComplemento.val(complemento);
            campoEmailContato.val(email);
            campoTelefone.val(telefone);

            if (campoContatoAdicional !== null && campoContatoAdicional !== undefined) {
                campoContatoAdicional.configurarMascara("(00) 0000-00009");
                campoContatoAdicional.val(telefoneAdicional);
            }

            carregaveis.filter("[required]").trigger("blur.obrigatorio");
        }).fail(function () {
            campoDocumento.falharCarregamento();
            setTimeout(function () {
                alert("CNPJ não encontrado ou API indisponível para consulta.");
            }, 1000);
        });
    }

    const consultarCep = (campoCep, campoEstado, campoCidade, campoLogradouro, campoBairro, campoComplemento) => {
        const carregaveisCep = $(campoCep.classeCarregaveis);
        const cep = campoCep.val().replace(/\D/g, "");

        if (cep === "") {
            carregaveisCep.val("");
            return;
        }

        const regExp = /^[0-9]{8}$/;

        if (!regExp.test(cep)) {
            carregaveisCep.val("");
            alert("Formato de CEP inválido.");
            return;
        }

        if (campoCep.campo.prop("disabled")) {
            return;
        }

        campoCep.iniciarCarregamento();

        $.getJSON(`https://viacep.com.br/ws/${cep}/json/?callback=?`, function(dadosCep) {
            campoCep.finalizarCarregamento();

            if ("erro" in dadosCep) {
                carregaveisCep.val("");
                alert("CEP não encontrado.");
                return;
            }

            campoEstado.val(dadosCep["uf"])//.trigger("blur");
            campoCidade.val(dadosCep["localidade"])//.trigger("blur");
            campoLogradouro.val(dadosCep["logradouro"])//.trigger("blur");
            campoBairro.val(dadosCep["bairro"])//.trigger("blur");
            campoComplemento.val(dadosCep["complemento"])//.trigger("blur");
        }).fail(function () {
            campoCep.falharCarregamento();
            setTimeout(function () {
                alert("CEP não encontrado ou API indisponível para consulta.");
            }, 1000);
        });
    }

    const gerarFormulario = () => {
        const camposAprovacao = [
            new Campo(
                "observacoesAprovacao", "Observações de aprovação", "area-texto", 12, null, 5
            ),
        ];

        aprovacao = obterDicionario("id", camposAprovacao);
        secaoAprovacao = new Secao("aprovacao", "Aprovação", camposAprovacao);
        secaoAprovacao.gerar();

        const camposDadosPrincipais = [
            new Campo("documento", "CPF/CNPJ", "texto", 2),
            new Campo(
                "cadastroComRestricao", "Solicitar aprovação de cadastro com restrição", "checkbox", 2,
                "Marcar caso seja necessário realizar um cadastro com alguma restrição"
            ),
            new Campo(
                "razaoSocial", "Razão social", "texto", 4,
                "Pressione TAB ou selecione outro campo para efetuar uma consulta com o documento informado"
            ),
            new Campo("nomeFantasia", "Nome fantasia", "texto", 4),
            new Campo("mercadoExterior", "Mercado exterior", "checkbox", 2),
            new Campo("fornecedorIndustria", "É indústria", "checkbox", 2),
            new Campo("ramoAtividade", "Ramo de atividade", "lista", 4)
                .adicionarOpcoes([
                    new OpcaoLista("1", "1 - Banco, financeira ou seguradora"),
                    new OpcaoLista("2", "2 - Agricultura, pecuária ou silvicultura"),
                    new OpcaoLista("3", "3 - Peças e materiais de uso e consumo"),
                    new OpcaoLista("4", "4 - Prestador de serviços pessoa física"),
                    new OpcaoLista("5", "5 - Instituições governamentais"),
                    new OpcaoLista("6", "6 - Prestador de serviços pessoa jurídica"),
                    new OpcaoLista("7", "7 - Combustíveis e Lubrificantes"),
                    new OpcaoLista("8", "8 - Funcionários"),
                    new OpcaoLista("9", "9 - Intercompany"),
                    new OpcaoLista("10", "10 - Energia elétrica"),
                    new OpcaoLista("11", "11 - Cooperativas"),
                    new OpcaoLista("12", "12 - TI - Softwares"),
                    new OpcaoLista("13", "13 - TIC - Links, rádios e comunicação"),
                    new OpcaoLista("14", "14 - TI - Infraestrutura, redes e hardwares"),
                    new OpcaoLista("15", "15 - TI - Segurança (câmeras e serviços)"),
                    new OpcaoLista("16", "16 - TI - Controle de acesso e ponto"),
                    new OpcaoLista("17", "17 - TIC - Telefonia"),
                ]),
            new Campo("inscricaoEstadual", "Inscrição estadual", "texto", 2),
            new Campo("cep", "CEP", "texto", 2),
            new Campo("estado", "Estado", "texto", 2),
            new Campo("cidade", "Cidade", "texto", 4),
            new Campo("logradouro", "Logradouro", "texto", 4),
            new Campo("numero", "Número", "texto", 2),
            new Campo("bairro", "Bairro", "texto", 4),
            new Campo("complemento", "Complemento", "texto", 4),
            new Campo("enderecoCorresp", "Endereço de correspondência", "texto", 4),
            new Campo("nomeContato", "Nome do contato", "texto", 4),
            new Campo("emailContato", "Email do contato", "email", 4),
            new Campo("emailAdicional", "Email adicional", "email", 4),
            new Campo("telefone", "Telefone", "texto", 2),
            new Campo("celular", "Celular", "texto", 2),
            new Campo("contatoAdicional", "Telefone ou celular adicional", "texto", 2),
            new Campo("formaPagamento", "Forma de pagamento", "lista", 2)
                .adicionarOpcoes([
                    new OpcaoLista("1", "1 - Boleto"),
                    new OpcaoLista("2", "2 - Carteira"),
                    new OpcaoLista("3", "3 - Transferência bancária"),
                    new OpcaoLista("4", "4 - Débito automático"),
                    new OpcaoLista("5", "5 - Compensação"),
                    new OpcaoLista("6", "6 - Financiamento"),
                    new OpcaoLista("7", "7 - Cartão de crédito"),
                    new OpcaoLista("8", "8 - Cheque"),
                ]),
        ];

        dadosPrincipais = obterDicionario("id", camposDadosPrincipais);
        secaoDadosPrincipais = new Secao("dadosPrincipais", "Dados principais", camposDadosPrincipais);
        secaoDadosPrincipais.gerar();

        const camposContaBancaria = [
            new Campo("banco", "Banco", "lista", 4)
                .adicionarOpcoes([
                    new OpcaoLista("CBB", "CBB - Itau Nassau"),
                    new OpcaoLista("MRM", "MRM - HSBC Bank USA"),
                    new OpcaoLista("M03", "M03 - Banco Fiat S.A."),
                    new OpcaoLista("M06", "M06 - Banco de Lage Landen Brasil S.A."),
                    new OpcaoLista("M07", "M07 - Banco GMAC S.A."),
                    new OpcaoLista("M08", "M08 - Banco Citicard S.A."),
                    new OpcaoLista("M09", "M09 - Banco Itaucred Financiamentos S.A."),
                    new OpcaoLista("M11", "M11 - Banco IBM S.A."),
                    new OpcaoLista("M14", "M14 - Banco Volkswagen S.A."),
                    new OpcaoLista("M16", "M16 - Banco Rodobens S.A."),
                    new OpcaoLista("M18", "M18 - Banco Ford S.A."),
                    new OpcaoLista("M19", "M19 - Banco CNH Capital S.A."),
                    new OpcaoLista("M20", "M20 - Banco Toyota do Brasil S.A."),
                    new OpcaoLista("M22", "M22 - Banco Honda S.A."),
                    new OpcaoLista("M23", "M23 - Banco Volvo (Brasil) S.A."),
                    new OpcaoLista("001", "001 - Banco do Brasil S.A."),
                    new OpcaoLista("003", "003 - Banco da Amazônia S.A."),
                    new OpcaoLista("004", "004 - Banco do Nordeste do Brasil S.A."),
                    new OpcaoLista("021", "021 - BANESTES S.A. Banco do Estado do Espírito Santo"),
                    new OpcaoLista("024", "024 - Banco de Pernambuco S.A. - BANDEPE"),
                    new OpcaoLista("025", "025 - Banco Alfa S.A."),
                    new OpcaoLista("029", "029 - Banco Banerj S.A."),
                    new OpcaoLista("033", "033 - Banco Santander (Brasil) S.A."),
                    new OpcaoLista("036", "036 - Banco Bradesco BBI S.A."),
                    new OpcaoLista("037", "037 - Banco do Estado do Pará S.A."),
                    new OpcaoLista("040", "040 - Banco Cargill S.A."),
                    new OpcaoLista("041", "041 - Banrisul"),
                    new OpcaoLista("044", "044 - Banco BVA S.A."),
                    new OpcaoLista("045", "045 - Banco Opportunity S.A."),
                    new OpcaoLista("047", "047 - Banco do Estado de Sergipe S.A."),
                    new OpcaoLista("062", "062 - Hipercard Banco Múltiplo S.A."),
                    new OpcaoLista("063", "063 - Banco Ibi S.A. Banco Múltiplo"),
                    new OpcaoLista("064", "064 - Goldman Sachs do Brasil Banco Múltiplo S.A."),
                    new OpcaoLista("065", "065 - Banco Bracce S.A."),
                    new OpcaoLista("069", "069 - BPN Brasil Banco Múltiplo S.A."),
                    new OpcaoLista("070", "070 - BRB - Banco de Brasília S.A."),
                    new OpcaoLista("072", "072 - Banco Rural Mais S.A."),
                    new OpcaoLista("073", "073 - BB Banco Popular do Brasil S.A."),
                    new OpcaoLista("074", "074 - Banco J. Safra S.A."),
                    new OpcaoLista("077", "077 - Banco Inter S.A."),
                    new OpcaoLista("078", "078 - BES Investimento do Brasil S.A.-Banco de Investimento"),
                    new OpcaoLista("079", "079 - Banco Original do Agronegócio S.A."),
                    new OpcaoLista("082", "082 - BANCO TOPAZIO S.A."),
                    new OpcaoLista("084", "084 - Uniprime"),
                    new OpcaoLista("085", "085 - Ailos"),
                    new OpcaoLista("096", "096 - Banco BM&F de Serviços de Liquidação e Custódia S.A"),
                    new OpcaoLista("097", "097 - Primacredi - Credisis"),
                    new OpcaoLista("099", "099 - Uniprime"),
                    new OpcaoLista("104", "104 - Caixa Economica Federal"),
                    new OpcaoLista("107", "107 - Banco BBM S.A."),
                    new OpcaoLista("119", "119 - Banco Western Union do Brasil S.A."),
                    new OpcaoLista("133", "133 - CRESOL"),
                    new OpcaoLista("136", "136 - UNICRED"),
                    new OpcaoLista("184", "184 - Banco Itaú BBA S.A."),
                    new OpcaoLista("197", "197 - Stone Pagamentos S.A"),
                    new OpcaoLista("204", "204 - Banco Bradesco Cartões S.A."),
                    new OpcaoLista("208", "208 - Banco BTG Pactual S.A."),
                    new OpcaoLista("212", "212 - Banco Original S.A"),
                    new OpcaoLista("214", "214 - Banco Dibens S.A."),
                    new OpcaoLista("215", "215 - Banco Comercial e de Investimento Sudameris S.A."),
                    new OpcaoLista("217", "217 - Banco John Deere S.A."),
                    new OpcaoLista("218", "218 - Banco Bonsucesso S.A."),
                    new OpcaoLista("222", "222 - Banco Credit Agricole Brasil S.A."),
                    new OpcaoLista("224", "224 - Banco Fibra S.A."),
                    new OpcaoLista("225", "225 - Banco Brascan S.A."),
                    new OpcaoLista("229", "229 - Banco Cruzeiro do Sul S.A."),
                    new OpcaoLista("230", "230 - Unicard Banco Múltiplo S.A."),
                    new OpcaoLista("233", "233 - Banco Cifra S.A."),
                    new OpcaoLista("237", "237 - Banco Bradesco S.A."),
                    new OpcaoLista("246", "246 - Banco ABC Brasil S.A."),
                    new OpcaoLista("248", "248 - Banco Boavista Interatlântico S.A."),
                    new OpcaoLista("249", "249 - Banco Investcred Unibanco S.A."),
                    new OpcaoLista("250", "250 - Banco Schahin S.A."),
                    new OpcaoLista("260", "260 - Nubank"),
                    new OpcaoLista("263", "263 - Banco Cacique S.A."),
                    new OpcaoLista("265", "265 - Banco Fator S.A."),
                    new OpcaoLista("269", "269 - Banco HSBC"),
                    new OpcaoLista("274", "274 - BANCO GRAFENO"),
                    new OpcaoLista("279", "279 - Banco Primacredi"),
                    new OpcaoLista("290", "290 - Pag Bank"),
                    new OpcaoLista("318", "318 - Banco BMG S.A."),
                    new OpcaoLista("320", "320 - Banco Industrial e Comercial S.A."),
                    new OpcaoLista("323", "323 - MERCADOPAGO.COM REPRESENTACOES LTDA"),
                    new OpcaoLista("329", "329 - QI SCD"),
                    new OpcaoLista("336", "336 - BANCO C6 S.A."),
                    new OpcaoLista("341", "341 - Itaú Unibanco S.A."),
                    new OpcaoLista("356", "356 - Banco Real S.A."),
                    new OpcaoLista("363", "363 - SINGULARE CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A."),
                    new OpcaoLista("364", "364 - Efí S.A. - IP"),
                    new OpcaoLista("366", "366 - Banco Société Générale Brasil S.A."),
                    new OpcaoLista("370", "370 - Banco WestLB do Brasil S.A."),
                    new OpcaoLista("376", "376 - Banco J. P. Morgan S.A."),
                    new OpcaoLista("383", "383 - Banco Juno"),
                    new OpcaoLista("389", "389 - Banco Mercantil do Brasil S.A."),
                    new OpcaoLista("394", "394 - Banco Finasa BMC S.A."),
                    new OpcaoLista("399", "399 - HSBC Bank Brasil S.A. - Banco Múltiplo"),
                    new OpcaoLista("403", "403 - Banco Cora SCD S.A."),
                    new OpcaoLista("409", "409 - UNIBANCO - União de Bancos Brasileiros S.A."),
                    new OpcaoLista("422", "422 - Banco Safra S.A."),
                    new OpcaoLista("428", "428 - COOP.CRED.RURAL - SICOOB"),
                    new OpcaoLista("453", "453 - Banco Rural S.A."),
                    new OpcaoLista("456", "456 - Banco de Tokyo-Mitsubishi UFJ Brasil S.A."),
                    new OpcaoLista("464", "464 - Banco Sumitomo Mitsui Brasileiro S.A."),
                    new OpcaoLista("473", "473 - Banco Caixa Geral - Brasil S.A."),
                    new OpcaoLista("477", "477 - Citibank S.A."),
                    new OpcaoLista("479", "479 - Banco ItaúBank S.A"),
                    new OpcaoLista("487", "487 - Deutsche Bank S.A. - Banco Alemão"),
                    new OpcaoLista("488", "488 - JPMorgan Chase Bank"),
                    new OpcaoLista("492", "492 - ING Bank N.V."),
                    new OpcaoLista("505", "505 - Banco Credit Suisse (Brasil) S.A."),
                    new OpcaoLista("529", "529 - BANCO PINBANK IP S/A"),
                    new OpcaoLista("600", "600 - Banco Luso Brasileiro S.A."),
                    new OpcaoLista("604", "604 - Banco Industrial do Brasil S.A."),
                    new OpcaoLista("610", "610 - Banco VR S.A."),
                    new OpcaoLista("611", "611 - Banco Paulista S.A."),
                    new OpcaoLista("612", "612 - Banco Guanabara S.A."),
                    new OpcaoLista("623", "623 - Banco Panamericano S.A."),
                    new OpcaoLista("626", "626 - Banco Ficsa S.A."),
                    new OpcaoLista("633", "633 - Banco Rendimento S.A."),
                    new OpcaoLista("634", "634 - Banco Triângulo S.A."),
                    new OpcaoLista("637", "637 - Banco Sofisa S.A."),
                    new OpcaoLista("638", "638 - Banco Prosper S.A."),
                    new OpcaoLista("641", "641 - Banco Alvorada S.A."),
                    new OpcaoLista("643", "643 - Banco Pine S.A."),
                    new OpcaoLista("652", "652 - Itaú Unibanco Holding S.A."),
                    new OpcaoLista("653", "653 - Banco Indusval S.A."),
                    new OpcaoLista("655", "655 - Banco Votorantim S.A."),
                    new OpcaoLista("707", "707 - Banco Daycoval S.A."),
                    new OpcaoLista("719", "719 - Banif-Banco Internacional do Funchal (Brasil)S.A."),
                    new OpcaoLista("739", "739 - Banco BGN S.A."),
                    new OpcaoLista("740", "740 - Banco Barclays S.A."),
                    new OpcaoLista("745", "745 - Banco Citibank S.A."),
                    new OpcaoLista("746", "746 - Banco Modal S.A."),
                    new OpcaoLista("747", "747 - Banco Rabobank International Brasil S.A."),
                    new OpcaoLista("748", "748 - Banco Cooperativo Sicredi S.A."),
                    new OpcaoLista("749", "749 - Banco Simples S.A."),
                    new OpcaoLista("751", "751 - Scotiabank Brasil S.A. Banco Múltiplo"),
                    new OpcaoLista("752", "752 - Banco BNP Paribas Brasil S.A."),
                    new OpcaoLista("755", "755 - Bank of America Merrill Lynch Banco Múltiplo S.A."),
                    new OpcaoLista("756", "756 - Sicoob"),
                ]),
            new Campo("agenciaDigito", "Agência e dígito", "texto", 2),
            new Campo("contaDigito", "Conta bancária e dígito", "texto", 2),
            new Campo("tipoConta", "Tipo de conta", "lista", 2)
                .adicionarOpcoes([
                    new OpcaoLista("1", "1 - Conta corrente"),
                    new OpcaoLista("2", "2 - Conta poupança"),
                ]),
            new Campo("documentoConta", "CPF/CNPJ do titular", "texto", 2),
            new Campo("titularConta", "Titular da conta", "texto", 4),
            new Campo("favNomeFantasia", "Nome fantasia", "texto", 4),
            new Campo("favCep", "CEP", "texto", 2),
            new Campo("favEstado", "Estado", "texto", 2),
            new Campo("favCidade", "Cidade", "texto", 4),
            new Campo("favLogradouro", "Logradouro", "texto", 4),
            new Campo("favBairro", "Bairro", "texto", 4),
            new Campo("favNumero", "Estado", "texto", 2),
            new Campo("favComplemento", "Complemento", "texto", 4),
            new Campo("favEmail", "E-mail", "email", 4),
            new Campo("favTelefone", "Telefone ou celular", "texto", 2),
        ];

        contaBancaria = obterDicionario("id", camposContaBancaria);
        secaoContaBancaria = new Secao("contaBancaria", "Conta bancária",  camposContaBancaria);
        secaoContaBancaria.gerar();

        const camposDetalhesDocumentos = [
            new Campo("observacoes", "Observações", "area-texto", 12, null, 5),
            new Campo(
                "documentosPessoaFisica", "Documentos de pessoa física", "anexo", 4,
                null, null, {"multiple": true}
            ),
            new Campo("comprovanteEndereco", "Comprovante de endereço", "anexo", 4),
            new Campo("comprovanteContaBancaria", "Comprovante de conta bancária", "anexo", 4),
        ];

        detalhesDocumentos = obterDicionario("id", camposDetalhesDocumentos);
        secaoDetalhesDocumentos = new Secao("detalhesDocumentos", "Detalhes e documentos", camposDetalhesDocumentos);
        secaoDetalhesDocumentos.gerar();
        
        const camposControle = [
            new Campo(
              "nomeUsuario", "Usuário solicitante", "texto", "2"
            ),
            new Campo(
                "retornoRegra", "Retorno da regra", "area-texto", "12",
                "Retorno da regra de integração do ERP que fará o cadastro no sistema.", 5
            ),
        ];

        controle = obterDicionario("id", camposControle);
        secaoControle = new Secao("controle", "Controle", camposControle);
        secaoControle.gerar();
    };

    const obterDicionario = (propriedadeChave, array) => {
        const dicionario = {};

        for (const item of array) {
            dicionario[item[propriedadeChave]] = item;
        }

        return dicionario;
    };

    return {
        inicializar
    };
})();