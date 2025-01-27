class Fonte {
    constructor(nome, campoChave, campoValor, camposCorrespondentes) {
        this.nome = nome;
        this.campoChave = campoChave;
        this.campoValor = campoValor;
        this.dados = {};
        this.camposCorrespondentes = camposCorrespondentes ?? [];
    }

    definirDados(dados) {
        this.dados = dados;
    }

    gerarOpcoes() {
        const opcoes = [];
        const chave = this.campoChave;
        const valor = this.campoValor;

        for (const obj of this.dados) {
            const opcao = new OpcaoLista(obj[chave], `${obj[chave]} - ${obj[valor]}`);
            opcoes.push(opcao);
        }

        console.log(opcoes);
        return opcoes;
    }
}