/* global controladorDeComentarios */

var comentariosApps = angular.module('comentariosApps', []);

comentariosApps.controller('controladorDeComentarios', function ($scope) {
    
    $scope.getFlightReviews = function(airlineID, flightNumber) {
        $http.get("http://eiffel.itba.edu.ar/hci/service4/review.groovy?method=getairlinereviews&airline_id="+airlineID+"&flight_number="+flightNumber, { cache: true, timeout: 10000 })
        .then(function(response) {
           $scope.reviews = response.reviews;
           $scope.reviewCount = response.total;
        });
    };
    
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