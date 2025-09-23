const Utilitario = (() => {
    const salvarArquivosEmString = (campoInput) => {
        return new Promise((resolve, reject) => {
            const arquivos = campoInput.files;
            const dadosArquivos = [];

            if (arquivos.length === 0) {
                resolve("");
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
                        const arquivosEmString = JSON.stringify(dadosArquivos); // Converter o array de dados em uma única string JSON
                        resolve(arquivosEmString);
                    }
                };

                reader.onerror = function(error) {
                    reject(error);
                };

                reader.readAsDataURL(arquivo); // Ler como base64
            }
        });
    }


    const carregarArquivosDeString = (string) => {
        if (string === "") {
            return new DataTransfer().files;
        }

        // Converter a string JSON de volta para o array de objetos
        const dadosArquivos = JSON.parse(string);

        const arquivos = dadosArquivos.map((arquivoData) => {
            // Remover o prefixo data:mime/type;base64,
            const conteudo = arquivoData.conteudo.split(',')[1];
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

    const obterEtapa = function() {
        const url = new URL(window.location.toLocaleString());
        const parametros = url.searchParams;
        return parametros.get("etapa");
    }

    return {
        salvarArquivosEmString,
        carregarArquivosDeString,
        obterDicionario,
        obterEtapa,
    };
})();