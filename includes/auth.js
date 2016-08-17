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
                    if (jqXHR.status === 401) {
                        var loginURI;

                        if (typeof jqXHR.getResponseHeader('WWW-Authenticate') === 'string') {
                            loginURI = jqXHR.getResponseHeader('WWW-Authenticate').trim().split(' ').pop();
                        } else {
                            loginURI = MagicFAQ.baseURL + 'auth/login/';
                        }

                        console.log(loginURI);

                        authWindow = window.open(loginURI, '', 'width=800,height=600');

                        MagicFAQ.notify(
                            'Need to re-authenticate. Please sign in and then try again. Disable pop-up blockers if sign in window does not appear.',
                            'info',
                            10000
                        );

                        authWindow.onclose = function() {
                            if (typeof getToken() !== 'undefined') {
                                MagicFAQ.notify(
                                    'You have been re-authenticated. Please try your operation again.',
                                    'success',
                                    10000
                                );
                            }
                        }
                    }
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
