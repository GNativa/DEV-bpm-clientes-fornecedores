const Genericos = (() => {
    const obterDicionario = (array, propriedadeChave, propriedadeValor) => {
        const dicionario = {};

        for (const item of array) {
            dicionario[item[propriedadeChave]] = item[propriedadeValor];
        }

        return dicionario;
    };

    return { obterDicionario };
})();