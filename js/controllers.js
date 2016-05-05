/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global controladorDeComentarios */

var comentariosApps = angular.module('comentariosApps', []);

comentariosApps.controller('controladorDeComentarios', function ($scope) {
    $scope.comentarios = [
        {'aerolinea': 'LAN',
            'numeroDeVuelo': '100A',
            'general': '10/10',
            'recomendado': 'Si',
            'comentarios': 'Esta bueno',
            'amabilidad': '10/10',
            'programaDeViajeroFrequente': '10/10',
            'comida': '10/10',
            'comodidad': '10/10',
            'puntualidad': '10/10',
            'relacionPrecioCalidad': '10/10',
        },
        {'aerolinea': 'Lan',
            'numeroDeVuelo': '100A',
            'general': '7/10',
            'recomendado': 'Si',
            'comentarios': 'G8 M8',
            'amabilidad': '7/10',
            'programaDeViajeroFrequente': '7/10',
            'comida': '7/10',
            'comodidad': '7/10',
            'puntualidad': '7/10',
            'relacionPrecioCalidad': '7/10',
        },
        {'aerolinea': 'Lan',
            'numeroDeVuelo': '100A',
            'general': '8/10',
            'recomendado': 'Si',
            'comentarios': '',
            'amabilidad': '8/10',
            'programaDeViajeroFrequente': '8/10',
            'comida': '8/10',
            'comodidad': '8/10',
            'puntualidad': '8/10',
            'relacionPrecioCalidad': '8/10',
        },
        {'aerolinea': 'Lan',
            'numeroDeVuelo': '100A',
            'general': '8/10',
            'recomendado': 'Si',
            'comentarios': 'Me pegue alto viaje',
            'amabilidad': '8/10',
            'programaDeViajeroFrequente': '8/10',
            'comida': '8/10',
            'comodidad': '8/10',
            'puntualidad': '8/10',
            'relacionPrecioCalidad': '8/10',
        },
        {'aerolinea': 'Lan',
            'numeroDeVuelo': '100A',
            'general': '9/10',
            'recomendado': 'Si',
            'comentarios': 'Me gustaron las merengadas',
            'amabilidad': '9/10',
            'programaDeViajeroFrequente': '9/10',
            'comida': '9/10',
            'comodidad': '9/10',
            'puntualidad': '9/10',
            'relacionPrecioCalidad': '9/10',
        },
        {'aerolinea': 'Lan',
            'numeroDeVuelo': '100A',
            'general': '8/10',
            'recomendado': 'Si',
            'comentarios': 'Me mire Human Centipide 2. Diversion para toda la familia',
            'amabilidad': '8/10',
            'programaDeViajeroFrequente': '8/10',
            'comida': '8/10',
            'comodidad': '8/10',
            'puntualidad': '8/10',
            'relacionPrecioCalidad': '8/10',
        }
    ];
});