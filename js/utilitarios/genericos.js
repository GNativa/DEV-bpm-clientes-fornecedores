const Genericos = (() => {
    const salvarArquivosEmString = (inputElement) => {
        return new Promise((resolve, reject) => {
            const arquivos = inputElement.files;
            const dadosArquivos = [];

            if (arquivos.length === 0) {
                resolve(""); // Retorna string vazia se não há arquivos selecionados
                return;
            }

            let arquivosLidos = 0;

            for (let i = 0; i < arquivos.length; i++) {
                const arquivo = arquivos[i];
                const reader = new FileReader();

                reader.onload = function(event) {
                    dadosArquivos.push({
                        nome: arquivo.name,
                        tipo: arquivo.type,
                        conteudo: event.target.result
                    });

                    arquivosLidos++;
                    if (arquivosLidos === arquivos.length) {
                        const stringUnica = JSON.stringify(dadosArquivos); // Converte o array de dados em uma única string JSON
                        resolve(stringUnica);
                    }
                };

                reader.onerror = function(error) {
                    reject(error);
                };

                reader.readAsDataURL(arquivo); // Lê como base64
            }
        });
    }


    const carregarArquivosDeString = (stringUnica) => {
        const dadosArquivos = JSON.parse(stringUnica); // Converte a string JSON de volta para o array de objetos

        const arquivos = dadosArquivos.map((arquivoData) => {
            const conteudo = arquivoData.conteudo.split(',')[1]; // Remove o prefixo data:mime/type;base64,
            const blob = new Blob([Uint8Array.from(atob(conteudo), c => c.charCodeAt(0))], { type: arquivoData.tipo });
            return new File([blob], arquivoData.nome, { type: arquivoData.tipo });
        });

        const dataTransfer = new DataTransfer();
        arquivos.forEach((arquivo) => dataTransfer.items.add(arquivo));

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