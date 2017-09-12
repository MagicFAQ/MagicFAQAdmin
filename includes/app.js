// Define the application
app = angular.module('items', ['restangular', 'ngRoute', 'summernote', 'angular-table']);

app.filter('getId', function() {
    return function(input) {
        return input.replace(/\/$/, "").split('/').pop();
    }
});

// Configure the application
app.config(function(RestangularProvider) {
    RestangularProvider
        .setBaseUrl(MagicFAQ.baseURL)
        .setRequestSuffix('/');
});

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'partials/item-list.html'
        }).
        when('/questions/new', {
            templateUrl: 'partials/question-create.html'
        }).
        when('/questions/ask', {
            templateUrl: 'partials/question-ask.html'
        }).
        when('/questions/:itemId', {
            templateUrl: 'partials/question-detail.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }]);

app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.html5Mode(true)
    }]);

app.controller('mainCtrl', function($scope, Restangular) {

    var notification = MagicFAQ.notify('Loading Questions', 'info', 5000, 1000);
    Restangular.all('questions/').getList({all: 'true'}).then(function(result) {
        notification.close();
        $scope.items = result;
    });

});

app.controller('questionDetailCtrl', function($scope, Restangular, $routeParams) {
    var notification = MagicFAQ.notify('Loading Question', 'info', 5000, 1000);
    Restangular.one('questions', $routeParams.itemId).get().then(function(result) {
        notification.close();

        $scope.item = result;

        $scope.synonym = "";

        $scope.editItem = function(){
            Restangular.one('questions', $scope.item.id).patch($scope.item, {}, {'Authorization': MagicFAQ.auth.getToken()})
                .then(function() {
                    MagicFAQ.notify('Item edited.', 'success', 5000)
                });
        };

        $scope.markQueryPositive = function ($query) {
            MagicFAQ.notify('Submitting synonym.', 'info', 2000);
            $.post(
                {
                    url: Restangular.configuration.baseUrl + '/feedback/',
                    beforeSend: function (request)
                    {
                        request.setRequestHeader("Authorization", MagicFAQ.auth.getToken());
                    },
                    data: {
                        'question_id': $scope.item.id,
                        'question': $query,
                        'magnitude': 2
                    },
                    success: function() {
                        MagicFAQ.notify('Synonym created.', 'success', 5000);
                        $scope.synonym = '';

                        var feedback = Restangular.one('feedback', $routeParams.itemId);
                        feedback.get().then(function (result) {
                            $scope.feedback = result['feedback'];
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        MagicFAQ.notify('Unanticipated error ' + $jqXHR.status + '. Try refreshing the page.', 'error', 20000);

                    }
                }
            );
        };

        $scope.markQueryNegative = function ($query) {
            MagicFAQ.notify('Submitting synonym.', 'info', 2000);
            $.post(
                {
                    url: Restangular.configuration.baseUrl + '/feedback/',
                    beforeSend: function (request)
                    {
                        request.setRequestHeader("Authorization", MagicFAQ.auth.getToken());
                    },
                    data: {
                        'question_id': $scope.item.id,
                        'question': $query,
                        'magnitude': -2
                    },
                    success: function() {
                        MagicFAQ.notify('Synonym created.', 'success', 5000);
                        $scope.synonym = '';

                        var feedback = Restangular.one('feedback', $routeParams.itemId);
                        feedback.get().then(function (result) {
                            $scope.feedback = result['feedback'];
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        MagicFAQ.notify('Unanticipated error ' + jqXHR.status+ '. Try refreshing the page.', 'error', 20000);
                    }
                }
            );
        };

        $scope.removeSynonym = function ($partialId) {
            var note = MagicFAQ.notify('Removing synonym.', 'info', 5000);
            $.post(
                {
                    url: Restangular.configuration.baseUrl + '/feedback/' + $scope.item.id + '/partial/' + $partialId,
                    method: 'DELETE',
                    beforeSend: function (request)
                    {
                        request.setRequestHeader("Authorization", MagicFAQ.auth.getToken());
                    },
                    success: function() {
                        MagicFAQ.notify('Synonym removed.', 'success', 2000);
                        $scope.synonym = '';

                        var feedback = Restangular.one('feedback', $routeParams.itemId);
                        feedback.get().then(function (result) {
                            $scope.feedback = result['feedback'];
                        });
                        note.close();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        MagicFAQ.notify('Unanticipated error '+ $jqXHR.status + '. Try refreshing the page.', 'error', 20000);
                    }
                }
            );
        };

        $scope.submitSynonym = function() {
            var note = MagicFAQ.notify('Submitting synonym.', 'info', 5000);
            $.post(
                {
                    url: Restangular.configuration.baseUrl + '/feedback/',
                    beforeSend: function (request)
                    {
                        request.setRequestHeader("Authorization", MagicFAQ.auth.getToken());
                    },
                    data: {
                        'question_id': $scope.item.id,
                        'question': $scope.synonym
                    },
                    success: function() {
                        MagicFAQ.notify('Synonym created.', 'success', 2000);
                        $scope.synonym = '';

                        var feedback = Restangular.one('feedback', $routeParams.itemId);
                        feedback.get().then(function (result) {
                            $scope.feedback = result['feedback'];
                        });
                        note.close();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        MagicFAQ.notify('Unanticipated error '+ $jqXHR.status + '. Try refreshing the page.', 'error', 20000);
                    }
                }
            );
        }
    });

    var self = this;

    $scope.queries = [];
    var queries = Restangular.one('queries', $routeParams.itemId);
    queries.get().then(function (result) {
        $scope.queries = result['raw_queries'];
    });

    $scope.feedback = [];
    var feedback = Restangular.one('feedback', $routeParams.itemId);
    feedback.get().then(function (result) {
        $scope.feedback = result['feedback'];
    });

    $scope.queries_config = {
        itemsPerPage: 12,
        fillLastPage: true
    }

    $scope.feedback_config = {
        itemsPerPage: 8,
        fillLastPage: true
    }

    // console.log($scope.queries);
});

app.controller('questionCreateCtrl', function($scope, Restangular, $location) {
    $scope.item = {question: "", answer: ""};
    var notification = MagicFAQ.notify('Creating question.', 'info', 5000);
    $scope.createQuestion = function(){
        $.post(
            {
                url: Restangular.configuration.baseUrl + '/questions/',
                beforeSend: function (request)
                {
                    request.setRequestHeader("Authorization", MagicFAQ.auth.getToken());
                },
                data: {
                    'question': $scope.item.question,
                    'answer': $scope.item.answer,
                },
                success: function(msg) {
                    MagicFAQ.notify('Question created.', 'success', 5000);
                    $location.path('/questions/' + $.parseJSON(msg)['id'] + '/');
                }
            }
        )
        .fail(function () {var notification = MagicFAQ.notify('Error.', 'error', 3000);})
        .always(function () {notification.close();});
    }

    $('document').ready(function () {
        console.log('ready');
        $('[data-toggle="popover"]').popover();
    });
});


// Standardize data format (extract from meta-data where needed)
app.config(function(RestangularProvider) {
    // add a response intereceptor
    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
        var extractedData;
        // .. to look for getList operations
        if (operation === "getList") {
            // .. and handle the data and meta data
            extractedData = data.questions;
            // extractedData._resultmeta = {
            //     "count": data.count,
            //     "next": data.next,
            //     "previous": data.previous
            // };
        } else {
            extractedData = data;
            console.log(operation);
        }
        return extractedData;
    });
});

