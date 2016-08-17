MagicFAQ.auth = (function () {

    /** @type {string} */
    var token;

    /** @type {string} */
    var expiration;

    /**
     * @returns {boolean}
     */
    var tokenIsValid = function()
    {
        return (
               typeof token !== 'undefined'
            && typeof expiration !== 'undefined'
            && Date.parse(expiration) > Date.now()
        );
    };

    /**
     * @returns {undefined}
     */
    var renewToken = function()
    {
        $.get(
            {
                url: MagicFAQ.baseURL + 'auth/admin/',
                async: false,
                success: function(msg) {
                    msg = $.parseJSON(msg);

                    token = msg.token;
                    expiration = msg.expiration
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                },
                timeout: 3000,
            }
        )
    };

    /**
     *
     * @returns {string}
     */
    var getToken = function()
    {
        if (!tokenIsValid()) {
            renewToken()
        }
        
        return token;
    };

    return {
        getToken: getToken
    };

}());
