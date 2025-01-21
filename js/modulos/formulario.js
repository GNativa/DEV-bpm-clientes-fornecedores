const Formulario = (() => {
    // Variáveis para uso em validações, consultas, etc.
    let campos = {};

    let cnpjInaptoCadastro = false, cnpjInaptoTitular = false,
        documentoAnterior = "";

    let secaoAprovacao,              // Seção de aprovação
        secaoDadosPrincipais,        // Etc.
        secaoContaBancaria,
        secaoDetalhesDocumentos,
        secaoControle,
        botaoEnviar;

    // Listas dos IDs dos campos que serão obrigatórios, bloqueados ou ocultos por etapa
    // Formato:
    // {"etapa1": ["campo1", "campo2, "campo3"], "etapa2": ["campo1", "campo2"]}
    const camposObrigatorios = {
        "solicitacao": ["razaoSocial", "nomeFantasia", "ramoAtividade", "cep", "pais", "estado", "cidade", "logradouro",
            "numero", "bairro", "formaPagamento"],
        "aprovacaoInicial": ["observacoesAprovacao"],
        "execucao": [],
        "aprovacaoFinanceiro": ["observacoesAprovacao"],
        "revisao": ["razaoSocial", "nomeFantasia", "ramoAtividade", "cep", "estado", "cidade", "logradouro", "numero", "bairro",
            "formaPagamento"],
    };

    const camposBloqueados = {
        "solicitacao": [],
        "aprovacaoInicial": ["documento", "cadastroComRestricao", "razaoSocial", "nomeFantasia", "mercadoExterior", "fornecedorIndustria",
            "ramoAtividade", "cep", "pais", "estado", "cidade", "logradouro", "numero", "bairro", "complemento", "enderecoCorresp",
            "nomeContato", "emailContato", "emailAdicional", "telefone", "celular", "contatoAdicional", "formaPagamento", "banco", "agenciaDigito",
            "contaDigito", "tipoConta", "documentoConta", "titularConta", "favNomeFantasia", "favCep", "favEstado", "favCidade", "favLogradouro",
            "favBairro", "favNumero", "favComplemento", "favEmail", "favTelefone", "observacoes", "documentosPessoaFisica", "comprovanteEndereco",
            "comprovanteContaBancaria", "retornoRegra"],
        "execucao": [],
        "aprovacaoFinanceiro": ["documento", "cadastroComRestricao", "razaoSocial", "nomeFantasia", "mercadoExterior", "fornecedorIndustria",
            "ramoAtividade", "inscricaoEstadual", "cep", "pais", "estado", "cidade", "logradouro", "numero", "bairro", "complemento", "enderecoCorresp",
            "nomeContato", "emailContato", "emailAdicional", "telefone", "celular", "contatoAdicional", "formaPagamento",
            "documentoConta", "titularConta", "favNomeFantasia", "favCep", "favEstado", "favCidade", "favLogradouro",
            "favBairro", "favNumero", "favComplemento", "favEmail", "favTelefone", "observacoes", "documentosPessoaFisica", "comprovanteEndereco", "retornoRegra"],
        "revisao": ["observacoesAprovacao"]
    };

    const camposOcultos = {
        "solicitacao": ["observacoesAprovacao", "retornoRegra", "nomeUsuario"],
        "aprovacaoInicial": ["retornoRegra", "nomeUsuario"],
        "execucao": [],
        "aprovacaoFinanceiro": ["retornoRegra", "nomeUsuario"],
        "revisao": ["retornoRegra", "nomeUsuario"]
    };

    const fontes = {
        "consultaCadastro": new Fonte("Clientes", []),
    };

    function obterValidacoes() {
        return [
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
                    const documento = campos["documentoConta"].cleanVal();

                    return campos["formaPagamento"].val() === "3"
                        && (documento.length !== 11 && documento.length !== 14);
                },
                "Insira um documento completo.",
                [campos["documentoConta"]],
                [campos["documentoConta"]],
            ),
            new Validacao(() => {
                    const tamanhoDocumento = campos["documento"].cleanVal().length;
                    const mercadoExterior = campos["mercadoExterior"].campo.prop("checked");

                    if (mercadoExterior && tamanhoDocumento === 0) {
                        return campos["tipoPessoa"].val() === "F";
                    }

                    return tamanhoDocumento <= 11;
                },
                null,
                [campos["documento"], campos["tipoPessoa"]],
                null,
                [campos["documentosPessoaFisica"], campos["comprovanteEndereco"]],
            ),
            new Validacao(() => {
                    const tamanhoDocumento = campos["documento"].cleanVal().length;

                    return tamanhoDocumento > 11;
                },
                null,
                [campos["documento"]],
                null,
                null,
                null,
                [campos["razaoSocial"], campos["cep"], campos["estado"], campos["cidade"],
                    campos["logradouro"], campos["numero"], campos["bairro"], campos["emailContato"], campos["telefone"]],
            ),
            new Validacao(() => {
                    const mercadoExterior = campos["mercadoExterior"].campo.prop("checked");
                    const tamanhoDocumento = campos["documento"].cleanVal().length;

                    return !mercadoExterior || tamanhoDocumento > 0;
                },
                null,
                [campos["documento"], campos["mercadoExterior"]],
                null,
                null,
                [campos["tipoPessoa"]],
            ),
            new Validacao(() => {
                    return !campos["mercadoExterior"].campo.prop("checked");
                },
                null,
                [campos["mercadoExterior"]],
                null,
                [campos["documento"]],
            ),
            new Validacao(() => {
                    return campos["mercadoExterior"].campo.prop("checked");
                },
                null,
                [campos["mercadoExterior"]],
                null,
                [campos["tipoPessoa"]],
                null,
                null,
                [campos["pais"]],
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
                [campos["documentoConta"]],
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
                [campos["documentoConta"]],
            ),
            new Validacao(() => {
                    const documentoCadastro = campos["documento"].cleanVal();
                    const documentoConta = campos["documentoConta"].cleanVal();

                    return campos["formaPagamento"].val() === "3"
                        && ((documentoCadastro !== "") && (documentoConta !== ""))
                        && (documentoCadastro.length === 14 && documentoConta.length === 14)
                        && (documentoCadastro.substring(0, 8) !== documentoConta.substring(0, 8));
                },
                "A raiz do CNPJ do favorecido (8 primeiros dígitos) deve ser a mesma do CNPJ do cadastro.",
                [campos["documento"], campos["documentoConta"]],
                [campos["documentoConta"]],
            ),
            new Validacao(() => {
                    const documentoCadastro = campos["documento"].cleanVal();
                    const documentoConta = campos["documentoConta"].cleanVal();

                    return campos["formaPagamento"].val() === "3"
                        && ((documentoCadastro !== "") && (documentoConta !== ""))
                        && (documentoCadastro.length === 11 && documentoConta.length === 11)
                        && documentoCadastro !== documentoConta;
                },
                "Insira o mesmo CPF digitado nos dados principais.",
                [campos["documento"], campos["documentoConta"]],
                [campos["documentoConta"]],
            ),
            new Validacao(() => {
                    const documentoCadastro = campos["documento"].cleanVal();
                    const documentoConta = campos["documentoConta"].cleanVal();

                    return campos["formaPagamento"].val() === "3"
                        && ((documentoCadastro !== "") && (documentoConta !== ""))
                        && (documentoCadastro.length === documentoConta.length)
                        && (documentoCadastro !== documentoConta)
                        && (documentoCadastro.length === 14 && documentoConta.length === 14);
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
                [campos["favCep"]],
            ),
            new Validacao(() => {
                    return cnpjInaptoCadastro && !campos["cadastroComRestricao"].campo.prop("checked");
                },
                "A empresa está com restrição. Marque a caixa ao lado para prosseguir com o cadastro.",
                [campos["documento"], campos["cadastroComRestricao"]],
                [campos["documento"]],
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
                [campos["cadastroComRestricao"]],
            ),
            new Validacao(() => {
                    return campos["documentoConta"].val() !== campos["documento"].val()
                        && cnpjInaptoTitular
                        && !campos["titularComRestricao"].campo.prop("checked");
                },
                "A empresa está com restrição. Marque a próxima caixa para prosseguir com o cadastro.",
                [campos["documentoConta"], campos["titularComRestricao"]],
                [campos["documentoConta"]],
            ),
            new Validacao(() => {
                    return campos["documentoConta"].val() !== campos["documento"].val()
                        && cnpjInaptoTitular
                        && campos["documentoConta"].cleanVal().length === 14;
                },
                null,
                [campos["documentoConta"]],
                null,
                [campos["titularComRestricao"]],
                null,
                null,
                [campos["titularComRestricao"]],
            ),
        ];
    }

    function carregarDados(mapa) {
        campos["observacoesAprovacao"].val(mapa.get("observacoesAprovacao") || "");
        campos["documento"].val(mapa.get("documento") || "");
        cnpjInaptoCadastro = (mapa.get("cadastroComRestricao") ?? "false") === "true";
        campos["cadastroComRestricao"].campo.prop("checked", cnpjInaptoCadastro);
        campos["razaoSocial"].val(mapa.get("razaoSocial") || "");
        campos["nomeFantasia"].val(mapa.get("nomeFantasia") || "");
        campos["mercadoExterior"].campo.prop("checked", (mapa.get("mercadoExterior") ?? "false") === "true");
        campos["fornecedorIndustria"].campo.prop("checked", (mapa.get("fornecedorIndustria") ?? "false") === "true");
        campos["ramoAtividade"].val(mapa.get("ramoAtividade") || "");
        campos["inscricaoEstadual"].val(mapa.get("inscricaoEstadual") || "");
        campos["cep"].val(mapa.get("cep") || "");
        campos["estado"].val(mapa.get("estado") || "");
        campos["cidade"].val(mapa.get("cidade") || "");
        campos["logradouro"].val(mapa.get("logradouro") || "");
        campos["numero"].val(mapa.get("numero") || "");
        campos["bairro"].val(mapa.get("bairro") || "");
        campos["complemento"].val(mapa.get("complemento") || "");
        campos["enderecoCorresp"].val(mapa.get("enderecoCorresp") || "");
        campos["nomeContato"].val(mapa.get("nomeContato") || "");
        campos["emailContato"].val(mapa.get("emailContato") || "");
        campos["emailAdicional"].val(mapa.get("emailAdicional") || "");
        campos["telefone"].val(mapa.get("telefone") || "");
        campos["celular"].val(mapa.get("celular") || "");
        campos["contatoAdicional"].val(mapa.get("contatoAdicional") || "");
        campos["formaPagamento"].val(mapa.get("formaPagamento") || "");
        campos["banco"].val(mapa.get("banco") || "");
        campos["agenciaDigito"].val(mapa.get("agenciaDigito") || "");
        campos["contaDigito"].val(mapa.get("contaDigito") || "");
        campos["tipoConta"].val(mapa.get("tipoConta") || "");
        campos["documentoConta"].val(mapa.get("documentoConta") || "");
        cnpjInaptoTitular = (mapa.get("titularComRestricao") ?? "false") === "true";
        campos["titularComRestricao"].campo.prop("checked", cnpjInaptoTitular);
        campos["titularConta"].val(mapa.get("titularConta") || "");
        campos["favNomeFantasia"].val(mapa.get("favNomeFantasia") || "");
        campos["favCep"].val(mapa.get("favCep") || "");
        campos["favEstado"].val(mapa.get("favEstado") || "");
        campos["favCidade"].val(mapa.get("favCidade") || "");
        campos["favLogradouro"].val(mapa.get("favLogradouro") || "");
        campos["favBairro"].val(mapa.get("favBairro") || "");
        campos["favNumero"].val(mapa.get("favNumero") || "");
        campos["favComplemento"].val(mapa.get("favComplemento") || "");
        campos["favEmail"].val(mapa.get("favEmail") || "");
        campos["favTelefone"].val(mapa.get("favTelefone") || "");
        campos["observacoes"].val(mapa.get("observacoes") || "");
        campos["nomeUsuario"].val(mapa.get("nomeUsuario") || "");
        campos["retornoRegra"].val(mapa.get("retornoRegra") || "");
        campos["documentosPessoaFisica"].campo.prop(
            "files",
            Utilitario.carregarArquivosDeString(mapa.get("documentosPessoaFisica") || "")
        );
        campos["comprovanteEndereco"].campo.prop(
            "files",
            Utilitario.carregarArquivosDeString(mapa.get("comprovanteEndereco") || "")
        );
        campos["comprovanteContaBancaria"].campo.prop(
            "files",
            Utilitario.carregarArquivosDeString(mapa.get("comprovanteContaBancaria") || "")
        );
    }

    async function salvarDados() {
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
        dados.titularComRestricao = campos["titularComRestricao"].campo.prop("checked");
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
        dados.documentosPessoaFisica = await Utilitario.salvarArquivosEmString(
            campos["documentosPessoaFisica"].obterElementoHtml()
        ); // Salvamento de anexo na forma de uma string
        dados.comprovanteEndereco = await Utilitario.salvarArquivosEmString(
            campos["comprovanteEndereco"].obterElementoHtml()
        );
        dados.comprovanteContaBancaria = await Utilitario.salvarArquivosEmString(
            campos["comprovanteContaBancaria"].obterElementoHtml()
        );
        dados.nomeUsuario = campos["nomeUsuario"].val();
        dados.retornoRegra = campos["retornoRegra"].val();

        return dados;
    }

    function definirEstadoInicial() {
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
            campos["favCidade"], campos["favLogradouro"], campos["favNumero"], campos["favBairro"], campos["favComplemento"],
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

    function configurarPlugins() {
        const tooltipTriggerList =
            document.querySelectorAll(`[data-bs-toggle="tooltip"]`);
        const tooltipList = [...tooltipTriggerList].map(
            tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl)
        );
    }

    function configurarEventos() {
        botaoEnviar.click(enviar);
    }

    function listarCampos() {
        const props = [];

        for (const prop in campos) {
            props.push(`"${prop}"`);
        }

        console.log(props.join(", "));
    }

    function consultarCnpj(origemConsulta, campoDocumento, campoRazaoSocial, campoNomeFantasia, campoCep, campoEstado,
                           campoCidade, campoLogradouro, campoNumero, campoBairro, campoComplemento, campoEmailContato,
                           campoTelefone, campoContatoAdicional) {
        let consultar = true;
        let razaoSocial, nomeFantasia, cep, estado, cidade, tipoLogradouro, logradouro,
            numero, bairro, complemento, email, ddd1, telefone1, telefone, ddd2, telefone2, telefoneAdicional;
        const carregaveis = $(campoDocumento.classeCarregaveis);
        const documento = campoDocumento.cleanVal();

        if (documento === "" || (documento.length < 14 && campoRazaoSocial.val() === "")) {
            if (origemConsulta === "cadastro") {
                cnpjInaptoCadastro = false;
                campos["cadastroComRestricao"].campo.prop("checked", false);
            }
            else {
                cnpjInaptoTitular = false;
                campos["titularComRestricao"].campo.prop("checked", false);
            }

            if (!campos["mercadoExterior"].campo.prop("checked")) {
                limparCampos();
            }
            return;
        }

        if (origemConsulta !== "cadastro") {
            consultar = campos["documentoConta"].cleanVal() !== campos["documento"].cleanVal();

            if (!consultar) {
                campoDocumento.iniciarCarregamento();
                cnpjInaptoTitular = cnpjInaptoCadastro;

                razaoSocial = campos["razaoSocial"].val();
                nomeFantasia = campos["nomeFantasia"].val();
                cep = campos["cep"].cleanVal();
                estado = campos["estado"].val();
                cidade = campos["cidade"].val();
                logradouro = campos["logradouro"].val();
                numero = campos["numero"].val();
                bairro = campos["bairro"].val();
                complemento = campos["complemento"].val();
                email = campos["emailContato"].val();
                telefone = campos["telefone"].cleanVal();
                telefoneAdicional = campos["contatoAdicional"].cleanVal();

                campoDocumento.finalizarCarregamento();
                salvarDados();
                validarObrigatorios();
            }
        }

        if (documento.length < 14 || !consultar || (documentoAnterior !== "" && documento === documentoAnterior)) {
            return;
        }
        documentoAnterior = documento;

        let titulo = "Consulta por CNPJ";

        campoDocumento.iniciarCarregamento();
        consultarCnpjWs();

        function consultarCnpjWs() {
            $.getJSON(`https://publica.cnpj.ws/cnpj/${documento}`, function (dadosCnpj) {
                campoDocumento.finalizarCarregamento();

                if (origemConsulta === "cadastro") {
                    campos["cadastroComRestricao"].campo.prop("checked", false);
                    cnpjInaptoCadastro = dadosCnpj["estabelecimento"]["situacao_cadastral"].toLowerCase() !== "ativa";
                }
                else {
                    campos["titularComRestricao"].campo.prop("checked", false);
                    cnpjInaptoTitular = dadosCnpj["estabelecimento"]["situacao_cadastral"].toLowerCase() !== "ativa";
                }

                obterDados(dadosCnpj, "cnpjWs");
                salvarDados();
                validarObrigatorios();
            }).fail(function (retorno) {
                const resposta = retorno["responseJSON"];
                let mensagem, tipoMensagem;

                switch (resposta["status"]) {
                    case 400: {
                        mensagem = "CNPJ inválido.";
                        tipoMensagem = "aviso";
                        break;
                    }
                    case 404: {
                        mensagem = "CNPJ não encontrado.";
                        tipoMensagem = "aviso";
                        break;
                    }
                    case 500: {
                        mensagem = resposta["detalhes"];
                        tipoMensagem = "erro";
                        break;
                    }
                    case 429: {
                        consultarSpeedio();
                        return;
                    }
                    default: {
                        mensagem = resposta["detalhes"];
                        tipoMensagem = "aviso";
                        break;
                    }
                }

                campoDocumento.falharCarregamento();
                console.log(retorno);
                Mensagem.exibir(titulo, mensagem, tipoMensagem);
                limparCampos();
            });
        }

        function consultarSpeedio() {
            $.getJSON(`https://api-publica.speedio.com.br/buscarcnpj?cnpj=${documento}`, function (dadosCnpj) {
                campoDocumento.finalizarCarregamento();

                if ("error" in dadosCnpj) {
                    Mensagem.exibir(titulo, "CNPJ não encontrado.", "aviso");
                    return;
                }

                if (origemConsulta === "cadastro") {
                    campos["cadastroComRestricao"].campo.prop("checked", false);
                    cnpjInaptoCadastro = dadosCnpj["STATUS"].toLowerCase() !== "ativa";
                }
                else {
                    campos["titularComRestricao"].campo.prop("checked", false);
                    cnpjInaptoTitular = dadosCnpj["STATUS"].toLowerCase() !== "ativa";
                }

                obterDados(dadosCnpj, "speedio");
                salvarDados();
                validarObrigatorios();
            }).fail(function (retorno) {
                // const resposta = retorno["responseJSON"];
                let mensagem = "Houve um erro não especificado ao consultar o CNPJ.", tipoMensagem = "aviso";
                campoDocumento.falharCarregamento();
                console.log(retorno);
                Mensagem.exibir(titulo, mensagem, tipoMensagem);
            });
        }

        function obterDados(dadosCnpj, apiOrigem) {
            if (apiOrigem === "cnpjWs") {
                razaoSocial = dadosCnpj["razao_social"];
                nomeFantasia = dadosCnpj["estabelecimento"]["nome_fantasia"] ?? "";
                cep = dadosCnpj["estabelecimento"]["cep"];
                estado = dadosCnpj["estabelecimento"]["estado"]["sigla"];
                cidade = dadosCnpj["estabelecimento"]["cidade"]["nome"];
                tipoLogradouro = dadosCnpj["estabelecimento"]["tipo_logradouro"] ?? "";
                logradouro = (tipoLogradouro !== "" ? (tipoLogradouro + " ") : "") + dadosCnpj["estabelecimento"]["logradouro"];
                numero = dadosCnpj["estabelecimento"]["numero"];
                bairro = dadosCnpj["estabelecimento"]["bairro"];
                complemento = (dadosCnpj["estabelecimento"]["complemento"] ?? "").replace(/\s\s+/g, " ");
                email = dadosCnpj["estabelecimento"]["email"];
                ddd1 = dadosCnpj["estabelecimento"]["ddd1"] ?? "";
                telefone1 = dadosCnpj["estabelecimento"]["telefone1"] ?? "";
                telefone = ddd1 + telefone1;
                ddd2 = dadosCnpj["estabelecimento"]["ddd2"] ?? "";
                telefone2 = dadosCnpj["estabelecimento"]["telefone2"] ?? "";
                telefoneAdicional = ddd2 + telefone2;
            }
            else if (apiOrigem === "speedio") {
                razaoSocial = dadosCnpj["RAZAO SOCIAL"];
                nomeFantasia = dadosCnpj["NOME FANTASIA"] ?? "";
                cep = dadosCnpj["CEP"];
                estado = dadosCnpj["UF"];
                cidade = dadosCnpj["MUNICIPIO"];
                tipoLogradouro = dadosCnpj["TIPO LOGRADOURO"] ?? "";
                logradouro = (tipoLogradouro !== "" ? (tipoLogradouro + " ") : "") + dadosCnpj["LOGRADOURO"];
                numero = dadosCnpj["NUMERO"];
                bairro = dadosCnpj["BAIRRO"];
                complemento = dadosCnpj["COMPLEMENTO"] ?? "";
                email = dadosCnpj["EMAIL"];
                ddd1 = dadosCnpj["DDD"] ?? "";
                telefone1 = dadosCnpj["TELEFONE"] ?? "";
                telefone = ddd1 + telefone1;
                telefoneAdicional = "";
            }
            else {
                throw new Error(`API "${apiOrigem}" não implementada para realizar consultas por CNPJ.`);
            }
        }

        function salvarDados() {
            campoDocumento.campo.trigger("change");
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

            if (campoContatoAdicional) {
                campoContatoAdicional.configurarMascara("(00) 0000-00009");
                campoContatoAdicional.val(telefoneAdicional);
            }
        }

        function limparCampos() {
            campoDocumento.campo.trigger("change");
            carregaveis.not(campoDocumento.campo).val("");
        }

        function validarObrigatorios() {
            carregaveis.filter("[required]").trigger("blur.obrigatorio");
        }
    }

    function consultarCep(campoCep, campoEstado, campoCidade, campoLogradouro, campoBairro, campoComplemento) {
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

        let titulo = "Consulta por CEP";
        let mensagem = "CEP não encontrado.";

        campoCep.iniciarCarregamento();
        consultarViaCep();

        function consultarViaCep() {
            const url = `https://viacep.com.br/ws/${cep}/json`;

            $.getJSON(url, function (dadosCep) {
                if ("erro" in dadosCep) {
                    campoCep.falharCarregamento();
                    Mensagem.exibir(titulo, mensagem, "aviso");
                    return;
                }

                campoCep.finalizarCarregamento();

                const estado = dadosCep["uf"];
                const cidade = dadosCep["localidade"];
                const logradouro = dadosCep["logradouro"];
                const bairro = dadosCep["bairro"];
                const complemento = dadosCep["complemento"];

                campoEstado.val(estado);
                campoCidade.val(cidade);
                campoLogradouro.val(logradouro);
                campoBairro.val(bairro);
                campoComplemento.val(complemento);
            }).fail(function (retorno) {
                console.log(retorno);
                mensagem = "Houve um erro ao realizar a consulta por CEP. Tente novamente mais tarde.";
                Mensagem.exibir(titulo, mensagem, "erro");
                campoCep.falharCarregamento();
            });
        }
    }

    /*
        const lista = [
            new Campo(id, rotulo, tipo, largura, ...),
            new Campo(id, rotulo, tipo, largura, ...),
            new Campo(id, rotulo, tipo, largura, ...),
            ...
        ];
        salvarCampos(lista);
        secao = new Secao(id, titulo, lista);
     */

    function gerar() {
        botaoEnviar = $("#enviar");

        const camposAprovacao = [
            new Campo(
                "observacoesAprovacao", "Observações de aprovação", "area-texto", 12, null, 5
            ),
        ];

        salvarCampos(camposAprovacao);
        secaoAprovacao = new Secao("aprovacao", "Aprovação", camposAprovacao);

        const listaEstados = [
            new OpcaoLista("AC", "AC - Acre"),
            new OpcaoLista("AL", "AL - Alagoas"),
            new OpcaoLista("AM", "AM - Amazonas"),
            new OpcaoLista("AP", "AP - Amapá"),
            new OpcaoLista("BA", "BA - Bahia"),
            new OpcaoLista("CE", "CE - Ceará"),
            new OpcaoLista("DF", "DF - Distrito Federal"),
            new OpcaoLista("ES", "ES - Espírito Santo"),
            new OpcaoLista("GO", "GO - Goiás"),
            new OpcaoLista("MA", "MA - Maranhão"),
            new OpcaoLista("MG", "MG - Minas Gerais"),
            new OpcaoLista("MS", "MS - Mato Grosso do Sul"),
            new OpcaoLista("MT", "MT - Mato Grosso"),
            new OpcaoLista("PA", "PA - Pará"),
            new OpcaoLista("PB", "PB - Paraíba"),
            new OpcaoLista("PE", "PE - Pernambuco"),
            new OpcaoLista("PI", "PI - Piauí"),
            new OpcaoLista("PR", "PR - Paraná"),
            new OpcaoLista("RJ", "RJ - Rio de Janeiro"),
            new OpcaoLista("RN", "RN - Rio Grande do Norte"),
            new OpcaoLista("RO", "RO - Rondônia"),
            new OpcaoLista("RR", "RR - Roraima"),
            new OpcaoLista("RS", "RS - Rio Grande do Sul"),
            new OpcaoLista("SC", "SC - Santa Catarina"),
            new OpcaoLista("SE", "SE - Sergipe"),
            new OpcaoLista("SP", "SP - São Paulo"),
            new OpcaoLista("TO", "TO - Tocantins"),
            new OpcaoLista("CO", "CO - COLORADO"),
            new OpcaoLista("DL", "DL - DELAWARE"),
            new OpcaoLista("EX", "EX - Exterior"),
            new OpcaoLista("IA", "IA - Iowa"),
            new OpcaoLista("KA", "KA - Kansas"),
            new OpcaoLista("NP", "NP - New Providence"),
            new OpcaoLista("TN", "TN - Tennessee"),
            new OpcaoLista("US", "US - Estados Unidos"),
            new OpcaoLista("SU", "SU - Switzerland"),
        ];

        const camposDadosPrincipais = [
            new Campo(
                "documento", "CPF/CNPJ", "texto", 2,
                "Pressione TAB ou selecione outro campo para efetuar uma consulta com o documento informado"
            ),
            new Campo("tipoPessoa", "Tipo de pessoa", "lista", 2)
                .adicionarOpcoes([
                    new OpcaoLista("F", "F - Física"),
                    new OpcaoLista("J", "J - Jurídica"),
                ]),
            new Campo(
                "cadastroComRestricao", "Solicitar aprovação de cadastro com restrição",
                "checkbox", 2, "Marcar caso seja necessário realizar um cadastro com alguma restrição"
            ),
            new Campo("razaoSocial", "Razão social", "texto", 4),
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
            new Campo(
                "cep", "CEP", "texto", 2,
                "Pressione TAB ou selecione outro campo para efetuar uma consulta com o CEP informado"
            ),
            new Campo("pais", "País", "lista", 2)
                .adicionarOpcoes([
                    new OpcaoLista("0132", "0132 - Afeganistão"),
                    new OpcaoLista("0175", "0175 - Albânia"),
                    new OpcaoLista("0230", "0230 - Alemanha"),
                    new OpcaoLista("0310", "0310 - Burkina Faso"),
                    new OpcaoLista("0370", "0370 - Andorra"),
                    new OpcaoLista("0400", "0400 - Angola"),
                    new OpcaoLista("0418", "0418 - Anguilla"),
                    new OpcaoLista("0434", "0434 - Antigua e Barbuda"),
                    new OpcaoLista("0477", "0477 - Antilhas Holandesas"),
                    new OpcaoLista("0531", "0531 - Arábia Saudita"),
                    new OpcaoLista("0590", "0590 - Argélia"),
                    new OpcaoLista("0639", "0639 - Argentina"),
                    new OpcaoLista("0647", "0647 - Armênia"),
                    new OpcaoLista("0655", "0655 - Aruba"),
                    new OpcaoLista("0698", "0698 - Austrália"),
                    new OpcaoLista("0728", "0728 - Áustria"),
                    new OpcaoLista("0736", "0736 - Azerbaijão"),
                    new OpcaoLista("0779", "0779 - Bahamas"),
                    new OpcaoLista("0809", "0809 - Bahrein"),
                    new OpcaoLista("0817", "0817 - Bangladesh"),
                    new OpcaoLista("0833", "0833 - Barbados"),
                    new OpcaoLista("0850", "0850 - Belarus"),
                    new OpcaoLista("0876", "0876 - Bélgica"),
                    new OpcaoLista("0884", "0884 - Belize"),
                    new OpcaoLista("0906", "0906 - Bermudas"),
                    new OpcaoLista("0930", "0930 - Mianmar"),
                    new OpcaoLista("0973", "0973 - Bolívia"),
                    new OpcaoLista("0981", "0981 - Bósnia-Herzegovina"),
                    new OpcaoLista("1015", "1015 - Botsuana"),
                    new OpcaoLista("1058", "1058 - Brasil"),
                    new OpcaoLista("1082", "1082 - Brunei"),
                    new OpcaoLista("1112", "1112 - Bulgária"),
                    new OpcaoLista("1155", "1155 - Burundi"),
                    new OpcaoLista("1198", "1198 - Butão"),
                    new OpcaoLista("1279", "1279 - Cabo Verde"),
                    new OpcaoLista("1376", "1376 - Cayman, Ilhas"),
                    new OpcaoLista("1414", "1414 - Camboja"),
                    new OpcaoLista("1457", "1457 - Camarões"),
                    new OpcaoLista("1490", "1490 - Canadá"),
                    new OpcaoLista("1504", "1504 - Canal, Ilhas do"),
                    new OpcaoLista("1511", "1511 - Canárias, Ilhas"),
                    new OpcaoLista("1538", "1538 - Cazaquistão"),
                    new OpcaoLista("1546", "1546 - Catar"),
                    new OpcaoLista("1589", "1589 - Chile"),
                    new OpcaoLista("1600", "1600 - China, Rep.Popular"),
                    new OpcaoLista("1619", "1619 - Formosa (Taiwan)"),
                    new OpcaoLista("1635", "1635 - Chipre"),
                    new OpcaoLista("1651", "1651 - Cocos, Ilhas"),
                    new OpcaoLista("1694", "1694 - Colômbia"),
                    new OpcaoLista("1732", "1732 - Comores, Ilhas"),
                    new OpcaoLista("1775", "1775 - Congo, República do"),
                    new OpcaoLista("1830", "1830 - Cook, Ilhas"),
                    new OpcaoLista("1872", "1872 - Coréia, Rep.Pop.Dem."),
                    new OpcaoLista("1902", "1902 - Coréia, República da"),
                    new OpcaoLista("1937", "1937 - Costa do Marfim"),
                    new OpcaoLista("1953", "1953 - Croácia"),
                    new OpcaoLista("1961", "1961 - Costa Rica"),
                    new OpcaoLista("1988", "1988 - Coveite"),
                    new OpcaoLista("1996", "1996 - Cuba"),
                    new OpcaoLista("2291", "2291 - Benin"),
                    new OpcaoLista("2321", "2321 - Dinamarca"),
                    new OpcaoLista("2356", "2356 - Dominica, Ilha"),
                    new OpcaoLista("2399", "2399 - Equador"),
                    new OpcaoLista("2402", "2402 - Egito"),
                    new OpcaoLista("2437", "2437 - Eritréia"),
                    new OpcaoLista("2445", "2445 - Emirados Árabes Unid"),
                    new OpcaoLista("2453", "2453 - Espanha"),
                    new OpcaoLista("2461", "2461 - Eslovênia"),
                    new OpcaoLista("2470", "2470 - Eslovaquia"),
                    new OpcaoLista("2496", "2496 - Estados Unidos"),
                    new OpcaoLista("2518", "2518 - Estônia"),
                    new OpcaoLista("2534", "2534 - Etiópia"),
                    new OpcaoLista("2550", "2550 - Falkland (Malvinas)"),
                    new OpcaoLista("2593", "2593 - Feroe, Ilhas"),
                    new OpcaoLista("2674", "2674 - Filipinas"),
                    new OpcaoLista("2712", "2712 - Finlândia"),
                    new OpcaoLista("2755", "2755 - França"),
                    new OpcaoLista("2810", "2810 - Gabão"),
                    new OpcaoLista("2852", "2852 - Gâmbia"),
                    new OpcaoLista("2895", "2895 - Gana"),
                    new OpcaoLista("2917", "2917 - Geórgia"),
                    new OpcaoLista("2933", "2933 - Gibraltar"),
                    new OpcaoLista("2976", "2976 - Granada"),
                    new OpcaoLista("3018", "3018 - Grécia"),
                    new OpcaoLista("3050", "3050 - Groenlândia"),
                    new OpcaoLista("3093", "3093 - Guadalupe"),
                    new OpcaoLista("3131", "3131 - Guam"),
                    new OpcaoLista("3174", "3174 - Guatemala"),
                    new OpcaoLista("3255", "3255 - Guiana Francesa"),
                    new OpcaoLista("3298", "3298 - Guiné"),
                    new OpcaoLista("3310", "3310 - Guiné-Equatorial"),
                    new OpcaoLista("3344", "3344 - Guiné-Bissau"),
                    new OpcaoLista("3379", "3379 - Guiana"),
                    new OpcaoLista("3417", "3417 - Haiti"),
                    new OpcaoLista("3450", "3450 - Honduras"),
                    new OpcaoLista("3514", "3514 - Hong Kong"),
                    new OpcaoLista("3557", "3557 - Hungria"),
                    new OpcaoLista("3573", "3573 - Iemen"),
                    new OpcaoLista("3595", "3595 - Man, Ilha de"),
                    new OpcaoLista("3611", "3611 - Índia"),
                    new OpcaoLista("3654", "3654 - Indonésia"),
                    new OpcaoLista("3697", "3697 - Iraque"),
                    new OpcaoLista("3727", "3727 - Irã"),
                    new OpcaoLista("3751", "3751 - Irlanda"),
                    new OpcaoLista("3794", "3794 - Islândia"),
                    new OpcaoLista("3832", "3832 - Israel"),
                    new OpcaoLista("3867", "3867 - Itália"),
                    new OpcaoLista("3883", "3883 - Iugoslávia"),
                    new OpcaoLista("3913", "3913 - Jamaica"),
                    new OpcaoLista("3964", "3964 - Johnston, Ilhas"),
                    new OpcaoLista("3999", "3999 - Japão"),
                    new OpcaoLista("4030", "4030 - Jordânia"),
                    new OpcaoLista("4111", "4111 - Kiribati"),
                    new OpcaoLista("4200", "4200 - Laos"),
                    new OpcaoLista("4235", "4235 - Lebuan"),
                    new OpcaoLista("4260", "4260 - Lesoto"),
                    new OpcaoLista("4278", "4278 - Letônia"),
                    new OpcaoLista("4316", "4316 - Líbano"),
                    new OpcaoLista("4340", "4340 - Libéria"),
                    new OpcaoLista("4383", "4383 - Líbia"),
                    new OpcaoLista("4405", "4405 - Liechtenstein"),
                    new OpcaoLista("4421", "4421 - Lituânia"),
                    new OpcaoLista("4456", "4456 - Luxemburgo"),
                    new OpcaoLista("4472", "4472 - Macau"),
                    new OpcaoLista("4499", "4499 - Macedônia"),
                    new OpcaoLista("4502", "4502 - Madagascar"),
                    new OpcaoLista("4525", "4525 - Madeira, Ilha da"),
                    new OpcaoLista("4553", "4553 - Malásia"),
                    new OpcaoLista("4588", "4588 - Malavi"),
                    new OpcaoLista("4618", "4618 - Maldivas"),
                    new OpcaoLista("4642", "4642 - Mali"),
                    new OpcaoLista("4677", "4677 - Malta"),
                    new OpcaoLista("4723", "4723 - Marianas do Norte"),
                    new OpcaoLista("4740", "4740 - Marrocos"),
                    new OpcaoLista("4766", "4766 - Marshall, Ilhas"),
                    new OpcaoLista("4774", "4774 - Martinica"),
                    new OpcaoLista("4855", "4855 - Maurício"),
                    new OpcaoLista("4880", "4880 - Mauritânia"),
                    new OpcaoLista("4901", "4901 - Midway, Ilhas"),
                    new OpcaoLista("4936", "4936 - México"),
                    new OpcaoLista("4944", "4944 - Moldávia"),
                    new OpcaoLista("4952", "4952 - Mônaco"),
                    new OpcaoLista("4979", "4979 - Mongólia"),
                    new OpcaoLista("4995", "4995 - Micronésia"),
                    new OpcaoLista("5010", "5010 - Montserrat, Ilhas"),
                    new OpcaoLista("5053", "5053 - Moçambique"),
                    new OpcaoLista("5070", "5070 - Namíbia"),
                    new OpcaoLista("5088", "5088 - Nauru"),
                    new OpcaoLista("5118", "5118 - Christmas, Ilha"),
                    new OpcaoLista("5177", "5177 - Nepal"),
                    new OpcaoLista("5215", "5215 - Nicarágua"),
                    new OpcaoLista("5258", "5258 - Niger"),
                    new OpcaoLista("5282", "5282 - Nigéria"),
                    new OpcaoLista("5312", "5312 - Niue, Ilha"),
                    new OpcaoLista("5355", "5355 - Norfolk, Ilha"),
                    new OpcaoLista("5380", "5380 - Noruega"),
                    new OpcaoLista("5428", "5428 - Nova Caledônia"),
                    new OpcaoLista("5452", "5452 - Papua Nova Guiné"),
                    new OpcaoLista("5487", "5487 - Nova Zelândia"),
                    new OpcaoLista("5517", "5517 - Vanuatu"),
                    new OpcaoLista("5568", "5568 - Omã"),
                    new OpcaoLista("5738", "5738 - Holanda(Países Baixo"),
                    new OpcaoLista("5754", "5754 - Palau"),
                    new OpcaoLista("5762", "5762 - Paquistão"),
                    new OpcaoLista("5800", "5800 - Panamá"),
                    new OpcaoLista("5860", "5860 - Paraguai"),
                    new OpcaoLista("5894", "5894 - Perú"),
                    new OpcaoLista("5932", "5932 - Pitcairn, Ilha"),
                    new OpcaoLista("5991", "5991 - Polinésia Francesa"),
                    new OpcaoLista("6033", "6033 - Polônia"),
                    new OpcaoLista("6076", "6076 - Portugal"),
                    new OpcaoLista("6114", "6114 - Porto Rico"),
                    new OpcaoLista("6238", "6238 - Quênia"),
                    new OpcaoLista("6254", "6254 - Quirquiz"),
                    new OpcaoLista("6289", "6289 - Reino Unido"),
                    new OpcaoLista("6408", "6408 - Centro-Africana, Rep"),
                    new OpcaoLista("6475", "6475 - Dominicana, Rep."),
                    new OpcaoLista("6602", "6602 - Reunião, Ilha"),
                    new OpcaoLista("6653", "6653 - Zimbabue"),
                    new OpcaoLista("6700", "6700 - Romênia"),
                    new OpcaoLista("6750", "6750 - Ruanda"),
                    new OpcaoLista("6769", "6769 - Rússia"),
                    new OpcaoLista("6777", "6777 - Salomão, Ilhas"),
                    new OpcaoLista("6858", "6858 - Saara Ocidental"),
                    new OpcaoLista("6874", "6874 - El Salvador"),
                    new OpcaoLista("6904", "6904 - Samoa"),
                    new OpcaoLista("6912", "6912 - Samoa Americana"),
                    new OpcaoLista("6955", "6955 - São Cristóvão e Neve"),
                    new OpcaoLista("6971", "6971 - San Marino"),
                    new OpcaoLista("7005", "7005 - São Pedro e Miquelon"),
                    new OpcaoLista("7056", "7056 - São Vicente e Granad"),
                    new OpcaoLista("7102", "7102 - Santa Helena"),
                    new OpcaoLista("7153", "7153 - Santa Lúcia"),
                    new OpcaoLista("7200", "7200 - São Tomé e Príncipe"),
                    new OpcaoLista("7285", "7285 - Senegal"),
                    new OpcaoLista("7315", "7315 - Seychelles"),
                    new OpcaoLista("7358", "7358 - Serra Leoa"),
                    new OpcaoLista("7412", "7412 - Cingapura"),
                    new OpcaoLista("7447", "7447 - Síria"),
                    new OpcaoLista("7480", "7480 - Somália"),
                    new OpcaoLista("7501", "7501 - Sri Lanka"),
                    new OpcaoLista("7544", "7544 - Suazilândia"),
                    new OpcaoLista("7560", "7560 - África do Sul"),
                    new OpcaoLista("7595", "7595 - Sudão"),
                    new OpcaoLista("7641", "7641 - Suécia"),
                    new OpcaoLista("7676", "7676 - Suíça"),
                    new OpcaoLista("7706", "7706 - Suriname"),
                    new OpcaoLista("7722", "7722 - Tadjiquistão"),
                    new OpcaoLista("7765", "7765 - Tailândia"),
                    new OpcaoLista("7803", "7803 - Tanzânia"),
                    new OpcaoLista("7820", "7820 - Terr.Britânico Oc.In"),
                    new OpcaoLista("7838", "7838 - Djibuti"),
                    new OpcaoLista("7889", "7889 - Chade"),
                    new OpcaoLista("7919", "7919 - Tcheca, Rep."),
                    new OpcaoLista("7951", "7951 - Timor Leste"),
                    new OpcaoLista("8001", "8001 - Togo"),
                    new OpcaoLista("8052", "8052 - Toquelau, Ilhas"),
                    new OpcaoLista("8109", "8109 - Tonga"),
                    new OpcaoLista("8150", "8150 - Trinidad e Tobago"),
                    new OpcaoLista("8206", "8206 - Tunísia"),
                    new OpcaoLista("8230", "8230 - Turcas e Caicos, Ilh"),
                    new OpcaoLista("8249", "8249 - Turcomenistão"),
                    new OpcaoLista("8273", "8273 - Turquia"),
                    new OpcaoLista("8281", "8281 - Tuvalu"),
                    new OpcaoLista("8311", "8311 - Ucrânia"),
                    new OpcaoLista("8338", "8338 - Uganda"),
                    new OpcaoLista("8451", "8451 - Uruguai"),
                    new OpcaoLista("8478", "8478 - Uzbequistão"),
                    new OpcaoLista("8486", "8486 - Vaticano"),
                    new OpcaoLista("8508", "8508 - Venezuela"),
                    new OpcaoLista("8583", "8583 - Vietnã"),
                    new OpcaoLista("8630", "8630 - Virgens Brit., Ilhas"),
                    new OpcaoLista("8664", "8664 - Virgens EUA, Ilhas"),
                    new OpcaoLista("8702", "8702 - Fiji"),
                    new OpcaoLista("8737", "8737 - Wake, Ilha"),
                    new OpcaoLista("8753", "8753 - Wallis e Futuna, Ilh"),
                    new OpcaoLista("8885", "8885 - Congo, Rep. Dem."),
                    new OpcaoLista("8907", "8907 - Zâmbia"),
                    new OpcaoLista("8958", "8958 - Zona Canal Panamá"),
                ]),
            new Campo("estado", "Estado", "lista", 2)
                .adicionarOpcoes(listaEstados),
            new Campo("cidade", "Cidade", "texto", 4),
            new Campo("logradouro", "Logradouro", "texto", 4),
            new Campo("numero", "Número", "texto", 2),
            new Campo("bairro", "Bairro", "texto", 4),
            new Campo("complemento", "Complemento", "texto", 4),
            new Campo("enderecoCorresp", "Endereço de correspondência", "texto", 4),
            new Campo("nomeContato", "Nome do contato", "texto", 4),
            new Campo("emailContato", "E-mail para contato", "email", 4),
            new Campo("emailAdicional", "E-mail adicional", "email", 4),
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

        salvarCampos(camposDadosPrincipais);
        secaoDadosPrincipais = new Secao("dadosPrincipais", "Dados principais", camposDadosPrincipais);

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
            new Campo(
                "documentoConta", "CPF/CNPJ do titular", "texto", 2,
                "Pressione TAB ou selecione outro campo para efetuar uma consulta com o documento informado"
            ),
            new Campo("titularComRestricao", "Solicitar aprovação de titular com restrição", "checkbox",
                2, "Marcar caso seja necessário realizar um cadastro com alguma restrição"),
            new Campo("titularConta", "Titular da conta", "texto", 4),
            new Campo("favNomeFantasia", "Nome fantasia", "texto", 4),
            new Campo(
                "favCep", "CEP", "texto", 2,
                "Pressione TAB ou selecione outro campo para efetuar uma consulta com o CEP informado"
            ),
            new Campo("favEstado", "Estado", "lista", 2)
                .adicionarOpcoes(listaEstados),
            new Campo("favCidade", "Cidade", "texto", 4),
            new Campo("favLogradouro", "Logradouro", "texto", 4),
            new Campo("favBairro", "Bairro", "texto", 4),
            new Campo("favNumero", "Número", "texto", 2),
            new Campo("favComplemento", "Complemento", "texto", 4),
            new Campo("favEmail", "E-mail", "email", 4),
            new Campo("favTelefone", "Telefone ou celular", "texto", 2),
        ];

        salvarCampos(camposContaBancaria);
        secaoContaBancaria = new Secao("contaBancaria", "Conta bancária", camposContaBancaria);

        const camposDetalhesDocumentos = [
            new Campo("observacoes", "Observações", "area-texto", 12, null, 5),
            new Campo(
                "documentosPessoaFisica", "Documentos de pessoa física", "anexo", 4,
                null, null, null, {"multiple": true}
            ),
            new Campo("comprovanteEndereco", "Comprovante de endereço", "anexo", 4),
            new Campo("comprovanteContaBancaria", "Comprovante de conta bancária", "anexo", 4),
        ];

        salvarCampos(camposDetalhesDocumentos);
        secaoDetalhesDocumentos = new Secao("detalhesDocumentos", "Detalhes e documentos", camposDetalhesDocumentos);
        
        const camposControle = [
            new Campo(
                "retornoRegra", "Retorno da regra", "area-texto", "12",
                "Retorno da regra de integração do ERP que fará o cadastro no sistema.", 5
            ),
            new Campo(
                "nomeUsuario", "Usuário solicitante", "texto", "2"
            ),
        ];

        salvarCampos(camposControle);
        secaoControle = new Secao("controle", "Controle", camposControle);
    }

    function salvarCampos(listaDeCampos) {
        for (const campo of listaDeCampos) {
            campos[campo["id"]] = campo;
        }
    }

    // Função usada para envios de teste
    function enviar() {
        Controlador.validarFormulario();
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