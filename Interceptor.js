angular.module('Interceptors', [])
     //Interceptors
     .factory('AuthInterceptor',
        [
            '$q',
            '$window',
            '$location',
            '$injector',

            function ($q, $window, $location, $injector) {
                return {
                    //Put auth header for each request except token request
                    request: function (config) {
                        if (config.url.indexOf(URL_TOKEN) === -1) {
                            var token = $window.sessionStorage.getItem('token');
                            config.headers.Authorization = 'Bearer ' + token;
                            retries = 0;
                        }
                        return config;
                    },

                    //Gets token from request /auth/token  and adds it to local storage
                    response: function (response) {
                        if (response.data.access_token !== undefined) {
                            $window.sessionStorage.setItem('token', response.data.access_token);
                        }
                        return response;
                    },

                    //Capture 401 eror and try to get new token to relaunch request
                    responseError: function (responseRejection) {
                        var response = responseRejection;

                        //Error accesing /token (we are not users)
                        if (responseRejection.status === 400 && responseRejection.config.url.indexOf(URL_TOKEN) !== -1) {
                            $window.sessionStorage.removeItem('user');
                            $window.sessionStorage.removeItem('password');

                            $q.reject(responseRejection);
                            $location.path('/login');
                        }

                        else if (responseRejection.status === 401) {

                            var deferred = $q.defer();

                            //Get new token and retry
                            var user = $window.sessionStorage.getItem('user');
                            var password = $window.sessionStorage.getItem('password');

                            //If exists user and password get token. If fails remove credentials
                            if (user && password) {
                                $injector.get('SessionService').getToken()
                                    .then(function (token) {
                                        $window.sessionStorage.setItem('token', token.data.access_token);
                                    })
                                    .then(function (success) {
                                        var $http = $injector.get('$http');
                                        $http(response.config)
                                            .then(function (success) {
                                                deferred.resolve(success);
                                            });

                                    //Error case
                                    }, function () {
                                        deferred.resolve(undefined);
                                    });

                                //Return the promise ot the request value
                                return deferred.promise;
                            }
                            else {
                                $q.reject(responseRejection);
                                $location.path('/login');
                            }
                        }
                    }
                };
            }])

        //Adds http interceptor
        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('AuthInterceptor');
        }]);
