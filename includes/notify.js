MagicFAQ.notify = (function () {

    var messageTypes = {
        success: {
            glyphicon: 'glyphicon-ok',
            bootstrapType: 'success'
        },
        wait: {
            glyphicon: 'glyphicon-time',
            bootstrapType: 'info'
        },
        info: {
            glyphicon: 'glyphicon-exclamation-sign',
            bootstrapType: 'info'
        },
        error: {
            glyphicon: 'glyphicon-remove',
            bootstrapType: 'danger'
        },
    };

    var DelayedNotification = function(message, type, duration, delay)
    {
        var notification = undefined;
        
        this.timeout = window.setTimeout(
            function() {
                notification = notify(message, type, duration);
            },
            delay
        );
        
        this.close = function() {
            window.clearTimeout(this.timeout);
            
            if (typeof notification !== 'undefined') {
                notification.close();
            }
        };

        return this;
    };

    var notify = function(message, type, duration, delay)
    {
        if (typeof duration === 'undefined') {
            duration = 5000;
        }
        
        if (typeof delay === 'undefined') {
            delay = 0;
        }
        
        if (delay > 0) {
            return DelayedNotification(message, type, duration, delay);
        } else {
            var messageType = messageTypes[type];

            return $.notify({
                icon: 'glyphicon ' + messageType.glyphicon,
                message: message
            },{
                type: messageType.bootstrapType,
                animate: {
                    enter: 'animated fadeInDown',
                    exit: 'animated fadeOutUp'
                },
                delay: duration
            });
        }
    };

    return notify;

}());
