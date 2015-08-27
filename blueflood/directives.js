define([
  'angular',
],
function (angular) {
  'use strict';

  var module = angular.module('grafana.directives');

  module.directive('annotationsQueryEditorGraphite', function() {
    return {templateUrl: 'app/plugins/datasource/blueflood/partials/annotations.editor.html'};
  });

});
