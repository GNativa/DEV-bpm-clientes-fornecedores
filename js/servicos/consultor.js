const Consultor = (() => {
    const obterDados = (url) => {
        return new Promise((resolve, reject) => {
            $.getJSON(url, function(data) {
                resolve(data);
            }).fail(function(jqxhr, textStatus, error) {
                reject(error);
            });
        });
    };

    const carregarFonte = async (fonte, token) => {
        const url = "https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/ecm_form/actions/getResultSet";
        const corpo = {
            "dataSource": `${fonte.nome}`,
            "token": `${token}`,
            "top": 50000,
        };

        const resposta = await fetch(url, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `bearer ${token}`,
            },
            body: JSON.stringify(corpo),
        });

        const json = await resposta.json();
        return JSON.parse(json["data"].replace("\\", ""))["value"];
    }

    return { obterDados, carregarFonte };
})();