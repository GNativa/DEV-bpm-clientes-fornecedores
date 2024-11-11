const Genericos = (() => {
    const salvarArquivosEmString = (input) => {
        return new Promise((resolve, reject) => {
            const arquivos = input.files;

            if (arquivos.length === 0) {
                resolve("");
            }

            let conteudoArquivos = [];
            let arquivosProcessados = 0;

            for (const arquivo of arquivos) {
                const leitor = new FileReader();

                leitor.onload = function (evento) {
                    conteudoArquivos.push({
                        name: arquivo.name,
                        type: arquivo.type,
                        content: evento.target.result
                    });

                    arquivosProcessados++;

                    if (arquivosProcessados === arquivos.length) {
                        resolve(JSON.stringify(conteudoArquivos));
                    }
                }

                leitor.onerror = function() {
                    reject(`Erro ao ler o arquivo "${arquivo.name}" do campo de anexo "${input.id}".`);
                }

                leitor.readAsText(arquivo);
            }
        });
    }

    const carregarArquivosDeString = (string) => {
        const conteudoArquivos = JSON.parse(string);
        const dataTransfer = new DataTransfer();

        for (const conteudo of conteudoArquivos) {
            const blob = new Blob([conteudo["content"]], {type: conteudo["type"]});
            const arquivo = new File([blob], conteudo["type"], {type: conteudo["type"]});
            dataTransfer.items.add(arquivo);
        }

        return dataTransfer.files;
    }

    const obterDicionario = (array, propriedadeChave, propriedadeValor) => {
        const dicionario = {};

        for (const item of array) {
            dicionario[item[propriedadeChave]] = item[propriedadeValor];
        }

        return dicionario;
    };

    return {
        salvarArquivosEmString,
        carregarArquivosDeString,
        obterDicionario
    };
})();