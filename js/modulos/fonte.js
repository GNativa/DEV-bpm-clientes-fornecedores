class Fonte {
    constructor(nome, camposExibicao, opcoesLista) {
        this.nome = nome;
        this.camposExibicao = camposExibicao ?? {"chave": "", "valor": ""};
        this.opcoesLista = opcoesLista ?? [];
        this.dados = {};
    }

    definirDados(dados) {
        for (const obj of dados) {
            const chave = obj[this.camposExibicao["chave"]];
            const valor = obj[this.camposExibicao["valor"]];

            const opcao = new OpcaoLista(chave, `${chave} - ${valor}`);
            this.opcoesLista.push(opcao);
        }

        this.dados = dados;
    }
}