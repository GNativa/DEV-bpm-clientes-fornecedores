const Consultor = (() => {
    let token = null;

    const guardarToken = (novo) =>{
        token = novo;
    }

    const obterToken = () => {
        return token;
    }


    const obterDados = (url) => {
        return new Promise((resolve, reject) => {
            $.getJSON(url, function(data) {
                resolve(data);
            }).fail(function(jqxhr, textStatus, error) {
                reject(error);
            });
        });
    };

    const carregarFonte = async (nomeFonte, filtros = []) => {
        const url = "https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/ecm_form/actions/getResultSet";
        const corpo = {
            "dataSource": `${nomeFonte}`,
            "token": obterToken(),
            "top": 50000,
            "filters": filtros
        };

     // exemplo aplicável filters [{fieldName: "tipope", operator: "=", openingOrder: "", closingOrder: "", value: "'Transferência entre filiais'"}]

        const resposta = await fetch(url, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `bearer ${obterToken()}`,
            },
            body: JSON.stringify(corpo),
        });

        const json = await resposta.json();
        return JSON.parse(json["data"])["value"];
    }

    return { obterDados, carregarFonte, guardarToken, obterToken };
})();