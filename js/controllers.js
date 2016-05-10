/* global controladorDeComentarios */

var comentariosApps = angular.module('comentariosApps', []);

flightsApp.controller('controladorDeComentarios', function ($scope) {
    
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

var flightsApp = angular.module('flightsApp', []);

flightsApp.controller('flightsController', function ($scope) {
    
    $scope.getDeals = function(origin) {
        $http.get("http://eiffel.itba.edu.ar/hci/service4/booking.groovy?method=getflightdeals&from="+origin, { cache: true, timeout: 10000 })
        .then(function(response) {
           $scope.deals = response.deals;
        });
    };
    
    $scope.getLastMinuteFlightDeals = function(origin) {
        $http.get("http://eiffel.itba.edu.ar/hci/service4/booking.groovy?method=getlastminuteflightdeals&from="+origin, { cache: true, timeout: 10000 })
        .then(function(response) {
           $scope.deals = response.deals;
        });
    };
    
    $scope.bookFlight = function(firstName, lastName, birthDate, idType, idNumber, installments, state, zip, street, streetNumber, phones, email, addressFloor, addressApartment) {
        $http.post("http://eiffel.itba.edu.ar/hci/service4/booking.groovy", {method: "getflightdeals", first_name: firstName, last_name: lastName, birthDate: birthDate, id_type: idType, id_number: idNumber, installments: installments, state: state, zip_code: zip, street: street, number: streetNumber, phones: phones, email: email, floor: (addressFloor === undefined ? null : addressFloor), apartment: (addressApartment === undefined ? null : addressApartment)}, { cache: true, timeout: 10000 })
        .then(function(response) {
           if(response.booking === true) {
               Materialize.toast("OK señorita querida de mi corazón de melocotón de 4 o más décadas", 5000);
           }
           else {
               Materialize.toast("Error bookeando el flighto", 5000);
           }
        });
    };
       
});