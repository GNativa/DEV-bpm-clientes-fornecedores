class Fonte {
    constructor(nome, camposExibicao) {
        this.nome = nome;
        this.camposExibicao = camposExibicao ?? {"chave": "", "valor": ""};
        this.dados = {};
    }

    definirDados(dados) {
        this.dados = dados;
    }
}