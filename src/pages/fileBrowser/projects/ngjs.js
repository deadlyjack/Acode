export default {
  'index.html':
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta http-equiv="X-UA-Compatible" content="IE=Edge">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n\n  <title><%name%></title>\n  \n  <!-- AngularJS -->\n  <script src="https://cdn.jsdelivr.net/npm/jquery@3.3.1/dist/jquery.min.js"></script>\n  <script src="https://cdn.jsdelivr.net/npm/angular@1.7.3/angular.min.js"></script>\n  \n</head>\n\n<body>\n  <!-- AngularJS App Container -->\n<div id="angular-app" data-ng-app="app">\n  <div data-ng-controller="MainCtrl as vm" class="">\n    <h1 class="">{{heading}}</h1>\n    <p class="">{{text}}</p>\n  </div>\n</div>\n  <!-- Project -->\n  <script src="index.js"></script>\n</body>\n</html>',
  'index.js':
    'angular.module("app", [])\n  .controller("MainCtrl", function ($scope) {\n    $scope.heading = "<%name%>";\n    $scope.text = "Angular is different from AngularJS.";\n  });',
};
