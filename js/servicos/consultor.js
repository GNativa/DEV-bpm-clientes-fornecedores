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



    return { obterDados };
})();