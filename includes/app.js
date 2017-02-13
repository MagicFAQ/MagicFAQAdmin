

app = angular.module('Questions', ['ngMaterial', 'ngRoute', 'restangular', 'summernote', 'md.data.table']);
// app = angular.module('Questions', ['restangular', 'ngRoute', 'summernote', 'ngMaterial']);

app.config(function(RestangularProvider) {
    RestangularProvider
        .setBaseUrl(MagicFAQ.baseURL)
        .setRequestSuffix('/');
});

app.controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $log) {
        $scope.toggleLeft = buildDelayedToggler('left');

        /**
         * Supplies a function that will continue to operate until the
         * time is up.
         */
        function debounce(func, wait, context) {
            var timer;

            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function() {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }

        /**
         * Build handler to open/close a SideNav; when animation finishes
         * report completion in console
         */
        function buildDelayedToggler(navID) {
            return debounce(function() {
                // Component lookup should always be available since we are not using `ng-if`
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        $log.debug("toggle " + navID + " is done");
                    });
            }, 200);
        }

        function buildToggler(navID) {
            return function() {
                // Component lookup should always be available since we are not using `ng-if`
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        $log.debug("toggle " + navID + " is done");
                    });
            };
        }
    });

app.controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function () {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav('left').close()
                .then(function () {
                    $log.debug("close LEFT is done");
                });

        };
    });


//
// app.filter('getId', function() {
//     return function(input) {
//         return input.replace(/\/$/, "").split('/').pop();
//     }
// });
//
// // Configure the application
// app.config(function(RestangularProvider) {
//     RestangularProvider
//         .setBaseUrl(MagicFAQ.baseURL)
//         .setRequestSuffix('/');
// });
//
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
//
// app.config(['$locationProvider',
//     function($locationProvider) {
//         $locationProvider.html5Mode(true)
//     }]);
//
app.controller('mainCtrl', function($scope, Restangular) {

    // var notification = MagicFAQ.notify('Loading Questions', 'info', 5000, 1000);
    Restangular.all('questions/').getList({all: 'true'}).then(function(result) {
        // notification.close();
        $scope.items = result;
    });

});
//
// app.controller('questionDetailCtrl', function($scope, Restangular, $routeParams) {
//     var notification = MagicFAQ.notify('Loading Question', 'info', 5000, 1000);
//     Restangular.one('questions', $routeParams.itemId).get().then(function(result) {
//         notification.close();
//
//         $scope.item = result;
//         $scope.synonym = "";
//
//         $scope.editItem = function(){
//             Restangular.one('questions', $scope.item.id).patch($scope.item, {}, {'Authorization': MagicFAQ.auth.getToken()})
//                 .then(function() {
//                     MagicFAQ.notify('Item edited.', 'success', 5000)
//                 });
//         };
//
//         $scope.submitSynonym = function() {
//             MagicFAQ.notify('Submitting synonym.', 'info', 5000);
//             $.post(
//                 {
//                     url: Restangular.configuration.baseUrl + '/feedback/',
//                     beforeSend: function (request)
//                     {
//                         request.setRequestHeader("Authorization", MagicFAQ.auth.getToken());
//                     },
//                     data: {
//                         'question_id': $scope.item.id,
//                         'question': $scope.synonym
//                     },
//                     success: function() {
//                         MagicFAQ.notify('Synonym created.', 'success', 5000);
//                         $scope.synonym = '';
//                     },
//                     error: function(jqXHR, textStatus, errorThrown) {
//                         if (jqXHR.status === 401) {
//                             // MagicFAQ.notify('Unanticipated authorization error. Try refreshing the page.', 'error', 20000);
//                         }
//                     }
//                 }
//             );
//         }
//     });
// });
//
// app.controller('questionCreateCtrl', function($scope, Restangular, $location) {
//     $scope.item = {question: "", answer: ""};
//     MagicFAQ.notify('Creating question.', 'info', 5000);
//     $scope.createQuestion = function(){
//         $.post(
//             {
//                 url: Restangular.configuration.baseUrl + '/questions/',
//                 beforeSend: function (request)
//                 {
//                     request.setRequestHeader("Authorization", MagicFAQ.auth.getToken());
//                 },
//                 data: {
//                     'question': $scope.item.question,
//                     'answer': $scope.item.answer,
//                 },
//                 success: function(msg) {
//                     MagicFAQ.notify('Question created.', 'success', 5000);
//                     $location.path('/questions/' + $.parseJSON(msg)['id'] + '/');
//                 }
//             }
//
//         );
//     }
// });
//
//
// // Standardize data format (extract from meta-data where needed)
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