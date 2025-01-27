class Fonte {
    constructor(nome, camposExibicao, camposCorrespondentes) {
        this.nome = nome;
        this.camposExibicao = camposExibicao ?? {"chave": "", "valor": ""};
        this.dados = {};
        this.camposCorrespondentes = camposCorrespondentes ?? [];
    }

    definirDados(dados) {
        this.dados = dados;
    }

    gerarOpcoes() {
        const opcoes = [];

        for (const obj of this.dados) {
            const chave = obj[this.camposExibicao["chave"]];
            const valor = obj[this.camposExibicao["valor"]];

            const opcao = new OpcaoLista(chave, `${chave} - ${valor}`);
            opcoes.push(opcao);
        }

        return opcoes;
    }
}