class Fonte {
    constructor(nome, camposExibicao) {
        this.nome = nome;
        this.camposExibicao = camposExibicao ?? [];
        this.dados = {};
    }

    definirDados(dados) {
        this.dados = dados;
    }
}