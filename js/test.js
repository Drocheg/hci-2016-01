/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var test = angular.module('test', []);

test.controller('testController', function ($scope) {
  $scope.tickets = [
    {'age': 'Adulto'},
    {'age': 'Adulto'},
    {'age': 'Niño'}
  ];
});