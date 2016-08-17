// Define the application
app = angular.module('items', ['restangular', 'ngRoute', 'summernote']);

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
            Restangular.one('questions', $scope.item.id).patch($scope.item);
        };

        $scope.submitSynonym = function() {
            MagicFAQ.notify('Submitting synonym.', 'info', 5000);
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
                        MagicFAQ.notify('Synonym created.', 'success', 5000);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        if (jqXHR.status === 401) {
                            // MagicFAQ.notify('Unanticipated authorization error. Try refreshing the page.', 'error', 20000);
                        }
                    }
                }
            );
        }
    });
});

app.controller('questionCreateCtrl', function($scope, Restangular, $location) {
    $scope.item = {question: "", answer: ""};
    $scope.createQuestion = function(){
        $.post(
            Restangular.configuration.baseUrl + '/questions/',
            {
                'question': $scope.item.question,
                'answer': $scope.item.answer,
            },
            function(msg) {
                $location.path('/questions/' + $.parseJSON(msg)['id'] + '/');
            }
        );

    }
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