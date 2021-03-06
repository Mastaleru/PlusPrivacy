/*
 * Copyright (c) 2016 ROMSOFT.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the The MIT License (MIT).
 * which accompanies this distribution, and is available at
 * http://opensource.org/licenses/MIT
 *
 * Contributors:
 *    RAFAEL MASTALERU (ROMSOFT)
 * Initially developed in the context of OPERANDO EU project www.operando.eu
 */

angular.module('operando', ['extensions', 'identities', 'pfbdeals', 'singleClickPrivacy',
    'notifications','socialApps', 'osp', 'angularModalService', 'operandoCore', 'schemaForm', 'abp',
    'settingEditor','angular-loading-bar','UIComponent','login','ui.select',
    'ngAnimate','ngMessages','datatables','ngResource','mgcrea.ngStrap'])
    .config([
        '$compileProvider',
        function ($compileProvider) {   //to accept chrome protocol
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome|chrome-extension|data):/);
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome|chrome-extension|data):/);

        }
    ])
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.includeBar = true;
        cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
        cfpLoadingBarProvider.latencyThreshold = 500;
        cfpLoadingBarProvider.autoIncrement = false;

    }])
    .filter("trusthtml", ['$sce', function($sce) {
        return function(htmlCode){
            return $sce.trustAsHtml(htmlCode);
        }
    }])
    .filter('isEmpty', [function() {
        return function(object) {
            return angular.equals({}, object);
        }
    }])
    .filter("removeWhiteSpace", [function() {
        return function(text){
            var w = text.replace(/[^A-Za-z0-9]/g, "");
            w = w.toLowerCase();
            w = w.replace(/\s/g,'');
            return w;
        }
    }])
    .run(['$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }
    ]).run(["$rootScope", function($rootScope){
        $rootScope.$on("$stateChangeSuccess", function (event, currentRoute, previousRoute) {
            window.dispatchEvent(new Event('scrollTop'));
        });
    }])
    .run( function(DTDefaultOptions){
        DTDefaultOptions.setLoadingTemplate('<ui-loader ></ui-loader>');
    })
    .config(function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {

        $ocLazyLoadProvider.config({
            debug: false,
            serie: true
        });

        // Now set up the states
        $stateProvider
            .state('home', {
                url: "/home",
                templateUrl: "views/home.html",
                cache: false
            })
            .state("socialNetworks", {
                url: "/social-networks",
                templateUrl:"views/social_networks.html",
                resolve: {
                    settings:['ospService', function (ospService) {
                        return ospService.loadOSPs();
                    }]
                }
            })
            .state("notifications", {
                url: "/notifications",
                templateUrl: "views/home/notifications.html"
            })
            .state("home.blog", {
                url: "/blog",
                templateUrl: "views/home/blog.html"
            })

            .state('preferences', {
                url: "/preferences",
                abstract: true,
                templateUrl: "views/preferences.html",
                resolve: {
                    settings:['ospService', function (ospService) {
                        return ospService.loadOSPs();
                    }],
                    loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load('/operando/controllers/preferencesController.js');
                    }]
                }
            })
            .state('preferences.sn', {
                url: "/:sn",
                params: {
                    sn: "facebook"
                },
                resolve: {
                    sn:['$stateParams', function ($stateParams) {
                        return $stateParams.sn;
                    }],
                    settings:['ospService', function (ospService) {
                        return ospService.loadOSPs();
                    }]
                },
                templateUrl:"views/preferences/social_network.html",
                controller:["$scope","$stateParams","settings", function($scope, $stateParams, settings) {

                    var socialNetworks={
                        facebook : "Facebook",
                        linkedin: "LinkedIn",
                        twitter: "Twitter",
                        google: "Google"

                    };

                    if (!$stateParams.sn) {
                        $scope.osp = {
                            key: 'facebook',
                            title: socialNetworks['facebook'],
                            settings: settings['facebook']
                        }

                    }
                    else {
                        $scope.osp = {
                            key: $stateParams.sn,
                            title: socialNetworks[$stateParams.sn.toLowerCase()],
                            settings: settings[$stateParams.sn]
                        }
                    }

                    $scope.sn = $stateParams.sn;
                }]
            })
            .state('network', {
                url: "/network",
                abstract: true,
                templateUrl: "views/network.html",
                resolve:{
                    loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load('/operando/controllers/socialAppsController.js');
                    }]
                }
            })
            .state('network.apps', {
                url: "/apps/:sn",
                params: {
                    sn: "facebook"
                },
                resolve: {
                    sn:['$stateParams', function ($stateParams) {
                        return $stateParams.sn;
                    }],
                    settings:['ospService', function (ospService) {
                        return ospService.loadOSPs();
                    }],
                    loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load('/operando/controllers/socialAppController.js');
                    }]
                },
                templateUrl:"views/apps/social_apps.html"
            })
            .state('abp', {
                url: "/ad-blocking",
                templateUrl: "views/preferences/abp.html",
                resolve: {
                    loadScript: ['$ocLazyLoad', function ($ocLazyLoad) {

                        return $ocLazyLoad.load(
                            {
                                name: "Utilities",
                                files: ['../ext/common.js',
                                    '../ext/content.js'
                                ], serie: true
                            });
                    }]
                }
            })
            .state('abp.options', {
                url: "/options",
                templateUrl: "views/preferences/abp-options.html"
            })
            .state('preferences.mobile', {
                url: "/mobile",
                templateUrl: "views/preferences/mobile.html"
            })
            .state('deals', {
                url: "/deals",
                templateProvider:["$stateParams", '$templateRequest',"messengerService",
                    function($stateParams, templateRequest,messengerService) {
                        var tplName = "views/deals.html";
                        var notLoggedIn = "views/not_authenticated.html";

                        return new Promise(function (resolve) {
                            messengerService.send("userIsAuthenticated", function (data) {
                                if(data.status && data.status =="success"){
                                    resolve(templateRequest(tplName))
                                }
                                else{
                                    resolve(templateRequest(notLoggedIn));
                                }

                            });
                        });
                    }
                ],
                resolve:{
                    loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                        //TODO load only when is needed
                        return $ocLazyLoad.load('/operando/controllers/appLoginController.js');
                    }]
                }
            })
            .state('identityManagement', {
                url: "/identities",
                templateProvider:["$stateParams", '$templateRequest',"messengerService",
                    function($stateParams, templateRequest,messengerService) {
                        var tplName = "views/identity_management.html";
                        var notLoggedIn = "views/not_authenticated.html";

                        return new Promise(function (resolve) {
                            messengerService.send("userIsAuthenticated", function (data) {
                                if(data.status && data.status =="success"){
                                    resolve(templateRequest(tplName))
                                }
                                else{
                                    resolve(templateRequest(notLoggedIn));
                                }

                            });
                        });
                    }
                ],
                resolve:{
                    loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                        //TODO load only when is needed
                        return $ocLazyLoad.load('/operando/controllers/appLoginController.js');
                    }]
                }
            })
            .state('extensions', {
                url: "/extensions",
                templateUrl: "views/apps/extensions.html",
                resolve:{
                    loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load('/operando/controllers/socialAppsController.js');
                    }]
                }
            })
            .state('admin', {
                url: "/admin",
                abstract:true,
                templateUrl: "views/admin/privacy_settings/reading_settings.html",
                resolve: {
                    loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load('/operando/controllers/readSocialNetworkPrivacySettings.js');
                    }]
                }
            })
            .state("admin.privacy_settings",{
                url:"/privacy_settings/:sn",
                params: {
                    sn: "facebook"
                },
                resolve: {
                    sn:['$stateParams', function ($stateParams) {
                        return $stateParams.sn;
                    }],
                    settings:['ospService', function (ospService) {
                        return ospService.loadOSPs();
                    }]
                },
                templateUrl:"views/admin/privacy_settings/social_network.html",
                controller:["$scope","$stateParams","settings", function($scope, $stateParams, settings) {

                    var socialNetworks={
                        facebook : "Facebook",
                        linkedin: "LinkedIn",
                        twitter: "Twitter",
                        google: "Google"

                    };

                    if (!$stateParams.sn) {
                        $scope.osp = {
                            key: 'facebook',
                            title: socialNetworks['facebook'],
                            settings: settings['facebook']
                        }

                    }
                    else {
                        $scope.osp = {
                            key: $stateParams.sn,
                            title: socialNetworks[$stateParams.sn.toLocaleLowerCase()],
                            settings: settings[$stateParams.sn]
                        }
                    }

                    $scope.sn = $stateParams.sn;
                }]
            })
            .state('analyst', {
                url: "/analyst",
                abstract:true,
                templateUrl: "views/analyst/settings_editor/settings_editor.html",
                resolve: {
                    loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load('/operando/controllers/readSocialNetworkPrivacySettings.js');
                    }]
                }
            })
            .state('analyst.settings_editor', {
                url:"/settings_editor/:sn",
                templateUrl: "views/analyst/settings_editor/home.html",
                params: {
                    sn: "facebook"
                },
                resolve: {
                    sn:['$stateParams', function ($stateParams) {
                        return $stateParams.sn;
                    }],
                    settings:['ospService', function (ospService) {
                        return ospService.loadOSPs();
                    }]
                },
                controller:["$scope","$stateParams","settings", function($scope, $stateParams, settings) {
                    if (!$stateParams.sn) {
                        $scope.osp = {
                            key: 'facebook',
                            title: 'Facebook',
                            settings: settings['facebook']
                        }
                    }
                    else {
                        $scope.osp = {
                            key: $stateParams.sn,
                            title: $stateParams.sn,
                            settings: settings[$stateParams.sn]
                        }
                    }

                    $scope.sn = $stateParams.sn;
                }]
            })
            .state('account', {
                url: "/account",
                abstract: true,
                templateProvider:["$stateParams", '$templateRequest',"messengerService",
                    function($stateParams, templateRequest, messengerService) {
                        var tplName = "views/user_account.html";
                        var notLoggedIn = "views/not_authenticated.html";

                        return new Promise(function (resolve) {
                            messengerService.send("userIsAuthenticated", function (data) {
                                if(data.status && data.status =="success"){
                                    resolve(templateRequest(tplName))
                                }
                                else{
                                    resolve(templateRequest(notLoggedIn));
                                }

                            });
                        });
                    }
                ],
                resolve: {
                    loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load('/operando/controllers/appLoginController.js');
                    }]
                }
            })
            .state('account.personal-details', {
                url: "/personal-details",
                templateUrl: "views/account/personal_details.html",
                resolve: {
                    loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load('/operando/controllers/accountController.js');
                    }]
                }
            })
            .state('account.activity', {
                url: "/activity",
                templateUrl: "views/account/activity.html"
            })
            .state('account.billing', {
                url: "/billing",
                templateUrl: "views/account/billing.html"
            })
            .state('privacyPolicy', {
            url: "/privacy-policy",
            templateUrl: "views/privacy_policy.html"
            })
            .state('feedback', {
                url: "/feedback",
                templateUrl: "views/feedback.html",
                resolve: {
                    loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load('/operando/controllers/feedbackController.js');
                    }]
                }
            })
            .state('contact', {
                url: "/contact",
                templateProvider:["$stateParams", '$templateRequest',"messengerService",
                    function($stateParams, templateRequest, messengerService) {
                        var tplName = "views/contact.html";
                        var notLoggedIn = "views/not_authenticated.html";

                        return new Promise(function (resolve) {
                            messengerService.send("userIsAuthenticated", function (data) {
                                if(data.status && data.status =="success"){
                                    resolve(templateRequest(tplName))
                                }
                                else{
                                    resolve(templateRequest(notLoggedIn));
                                }

                            });
                        });
                    }
                ],
                resolve: {
                    loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(['/operando/controllers/contactController.js',
                            '/operando/controllers/appLoginController.js']);
                    }]
                }
            });
        $urlRouterProvider.otherwise('/home');
    })
    .run(["i18nService",function(i18nService){
        i18nService.load();
    }])

    .run(["firstRunService","subscriptionsService", "$ocLazyLoad", function(firstRunService, subscriptionsService, $ocLazyLoad){

        $ocLazyLoad.load(
            ['../ext/common.js',
                '../ext/content.js',
                'util/hooks.js'
            ]).then(function () {
            subscriptionsService.init();
            firstRunService.onFirstRun(function(){

                    subscriptionsService.getFeatureSubscriptions(function (subscriptions) {
                        subscriptions.forEach(function (subscription) {

                            if (subscription.check_if_active_before === true) {
                                ext.backgroundPage.sendMessage({
                                    type: "subscriptions.get",
                                    downloadable: true
                                }, function (installedSubscriptions) {
                                    var shouldBeToggled = false;

                                    var interestedSubscription = installedSubscriptions.find(function (installedSubscription) {
                                        return installedSubscription.url === subscription.url;
                                    });

                                    if (interestedSubscription) {
                                        if (interestedSubscription.disabled === true) {
                                            shouldBeToggled = true;
                                        }
                                    } else {
                                        shouldBeToggled = true;
                                    }

                                    if (shouldBeToggled === true) {
                                        ext.backgroundPage.sendMessage({
                                            type: "subscriptions.toggle",
                                            url: subscription.url,
                                            title: subscription.title,
                                            homepage: subscription.homepage
                                        });
                                    }
                                });
                            } else {
                                ext.backgroundPage.sendMessage({
                                    type: "subscriptions.toggle",
                                    url: subscription.url,
                                    title: subscription.title,
                                    homepage: subscription.homepage
                                });
                            }

                        });

                        getPref("subscriptions_exceptionsurl", function (url) {
                            removeSubscription(url);
                            firstRunService.setupComplete();
                            console.log("Setup Completed...")
                        });
                    });

            });

        });

    }]);




