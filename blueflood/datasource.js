'use strict';
define([
        'angular',
        'lodash',
        'kbn'
    ],
    function (angular, _, kbn) {
        //'use strict';

        var module = angular.module('grafana.services');

        module.factory('BluefloodDatasource', function ($q, backendSrv, templateSrv) {

            /**
             * Datasource initialization. Calls when you refresh page, add
             * or modify datasource.
             *
             * @param {Object} datasource Grafana datasource object.
             */
            function BluefloodDatasource(datasource) {
                this.name = datasource.name;
                this.url = datasource.url;
                this.basicAuth = datasource.basicAuth;
                this.withCredentials = datasource.withCredentials;

                // TODO: fix passing username and password from config.html
                this.username = datasource.meta.username;
                this.password = datasource.meta.password;

                // Limit metrics per panel for templated request
                this.limitmetrics = datasource.meta.limitmetrics || 100;

                // Initialize Blueflood API
                //this.bluefloodAPI = new BluefloodAPI(this.url, this.username, this.password, this.basicAuth, this.withCredentials);
            }

            BluefloodDatasource.prototype.doAPIRequest = function(options) {
                if (this.basicAuth || this.withCredentials) {
                    options.withCredentials = true;
                }
                if (this.basicAuth) {
                    options.headers = options.headers || {};
                    options.headers.Authorization = this.basicAuth;
                }

                options.url = this.url + options.url;
                options.inspect = { type: 'blueflood' };

                return backendSrv.datasourceRequest(options);
            };

            /////////////////
            // Annotations //
            /////////////////

            BluefloodDatasource.prototype.annotationQuery = function (annotation, rangeUnparsed) {

                var tags = templateSrv.replace(annotation.tags);
                return this.events({range: rangeUnparsed, tags: tags})
                    .then(function (results) {
                        var list = [];
                        for (var i = 0; i < results.data.length; i++) {
                            var e = results.data[i];

                            list.push({
                                annotation: annotation,
                                time: e.when,
                                title: e.what,
                                tags: e.tags,
                                text: e.data
                            });
                        }
                        return list;
                    });
            };

            BluefloodDatasource.prototype.events = function (options) {
                try {
                    var tags = '';
                    if (options.tags) {
                        tags = '&tags=' + options.tags;
                    }

                    return this.doAPIRequest({
                        method: 'GET',
                        url: '/events/getEvents?from=' +this.translateTime(options.range.from)+ '&until=' +this.translateTime(options.range.to) + tags,
                    });
                }
                catch (err) {
                    return $q.reject(err);
                }
            };

            BluefloodDatasource.prototype.translateTime = function(date) {
              return kbn.parseDate(date).getTime();
            };
            return BluefloodDatasource;
        });
    });
