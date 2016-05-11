var app = angular.module('app', []);
app.controller('controller', function ($scope, $http, $log) {
    var API_URL = 'http://eiffel.itba.edu.ar/hci/service4/';
    /* *************************************************************************
     *                          General functions
     * ************************************************************************/
    //http://stackoverflow.com/a/19679493
    $scope.separateIntoGroupsOf = function (groupSize, array) {
        var groups = array.map(function (element, index) {
            return index % groupSize === 0 ? array.slice(index, index + groupSize) : null;
        })
                .filter(function (e) {
                    return e;
                });
        return groups;
    };

    $scope.getAllPagesFromRequest = function (service, params, destArray, responseKey, method) {
        var done = false;
        var page = 1;
        params.page = page;
        params.page_size = 1000;        //Try to get as many result as possible per page
//        do {
        $http({
            url: API_URL + service + ".groovy",
            method: method || "GET",
            params: params,
            cache: true,
            timeout: 10000
        }).then(function (response) {
            if (response.data.length === 0) {
                done = true;
            } else {
                if (typeof responseKey !== 'undefined') {
                    destArray.push(response.data[responseKey]);
                } else {
                    destArray.push(response.data);
                }
                console.log(JSON.stringify(response.data));
                params.page = page++;
            }
        });
//        }while(!done);
    };

    /* *************************************************************************
     *                          Interaction functions
     * ************************************************************************/
    /**
     * Finds cities and airports matching part of the specified query.
     * 
     * @param {string} partialName Partial or complete name of city/airport.
     * Must be at least 3 characters long.
     * @param {string} destArrayName Name of $scope variable where to store the
     * result. Will store an object of type {cities: [], airports: []}.
     * @param {string} destStatusName Name of $scope variable where to store the
     * status of the query (true when a query is running, false otherwise). Used
     * to cancel previous queries if present.
     * @returns {undefined}
     */
    $scope.findSuggestions = function (partialName, destArrayName, destStatusName) {
        if (partialName && partialName.length <= 2) {  //Avoid excessively general queries
            return;
        }
        $scope[destStatusName] = true;  //Mark active query
        //TODO cancel previous query if $scope[destStatusName] === true
        $http({
            url: "http://eiffel.itba.edu.ar/hci/service4/geo.groovy",
            method: "GET",
            headers: {"Accept":"application/json; charset=utf-8", 'Content-Type' : 'application/json; charset=UTF-8'},  //TODO España still returns weird, is it encoding or DB error?
            params: {method: "getcitiesandairportsbyname", name: partialName},
            cache: true,
            timeout: 10000
        }).then(function (response) {
            $scope[destStatusName] = false; //Query finished
            var result = {cities: [], airports: []};
            $(response.data.data).each(function (index, entry) {
                if (entry.type === 'city') {
                    result.cities.push(entry);
                } else if (entry.type === 'airport') {
                    result.airports.push(entry);
                } else {
                    console.log("Unrecognized city/airport entry:");
                    console.log(entry); //TODO shouldn't happen
                }
            });
            $scope[destArrayName] = result;
        });
    };

    $scope.pageNumber = 5;
    $scope.getFilledArray = function (size) {
        var arr = new Array(size);
        for (var i = 1; i <= size; i++) {
            arr[i - 1] = i;
        }
        return arr;
    };

    /* *************************************************************************
     *                          Review functions
     * ************************************************************************/
    $scope.getFlightReviews = function (airlineID, flightNumber) {
        $http.get("http://eiffel.itba.edu.ar/hci/service4/review.groovy?method=getairlinereviews&airline_id=" + airlineID + "&flight_number=" + flightNumber, {cache: true, timeout: 10000})
                .then(function (response) {
                    $scope.reviews = response.data.reviews;
                    $scope.reviewCount = response.data.total;    // === $scope.reviews.length
                });
    };

    /* *************************************************************************
     *                          Flight functions
     * ************************************************************************/
    $scope.deals = [];

    $scope.getDeals = function (origin) {
        $http.get("http://eiffel.itba.edu.ar/hci/service4/booking.groovy?method=getflightdeals&from=" + origin, {cache: true, timeout: 10000})
                .then(function (response) {
//                    $scope.deals = $scope.separateIntoGroupsOf(3, response.data.deals);
                    $scope.deals = response.data.deals;
                });
    };

    $scope.getLastMinuteFlightDeals = function (origin) {
        $http.get("http://eiffel.itba.edu.ar/hci/service4/booking.groovy?method=getlastminuteflightdeals&from=" + origin, {cache: true, timeout: 10000})
                .then(function (response) {
                    $scope.deals = response.data.deals;
                });
    };

    $scope.bookFlight = function (firstName, lastName, birthDate, idType, idNumber, installments, state, zip, street, streetNumber, phones, email, addressFloor, addressApartment) {
        $http.post("http://eiffel.itba.edu.ar/hci/service4/booking.groovy", {method: "getflightdeals", first_name: firstName, last_name: lastName, birthDate: birthDate, id_type: idType, id_number: idNumber, installments: installments, state: state, zip_code: zip, street: street, number: streetNumber, phones: phones, email: email, floor: (addressFloor === undefined ? null : addressFloor), apartment: (addressApartment === undefined ? null : addressApartment)}, {cache: true, timeout: 10000})
                .then(function (response) {
                    if (response.data.booking === true) {
                        Materialize.toast("OK señorita querida de mi corazón de melocotón de 4 o más décadas", 5000);
                    } else {
                        Materialize.toast("Error bookeando el flighto", 5000);
                    }
                });
    };
});