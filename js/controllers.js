var app = angular.module('app', ['ui.materialize']);    //Include angular-materialize plugin
app.controller('controller', function ($scope, $http) {
    /* *************************************************************************
     *                          General functions
     * ************************************************************************/
    $scope.session = getSessionData();

    /**
     * Searches GET parameters to get the value of the parameter with the specified
     * name.
     * 
     * @param {String} paramName
     * @returns {String|null} The value of the parameter with the specified key, or
     * null if not found.
     */
    $scope.getGETparam = function (paramName) {
        var query = location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === paramName) {
                return decodeURIComponent(pair[1]);
            }
        }
        return null;
    }

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
            headers: {"Accept": "application/json; charset=utf-8", 'Content-Type': 'application/json; charset=UTF-8'}, //TODO España still returns weird, is it encoding or DB error?
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
        if (size === 0)
            return [];
        var arr = new Array(size);
        for (var i = 1; i <= size; i++) {
            arr[i - 1] = i;
        }
        return arr;
    };

    /* *************************************************************************
     *                          Review functions
     * ************************************************************************/
    $scope.reviewCount = 0;

    $scope.getFlightReviews = function (airlineID, flightNumber, pageSize, pageNum, orderBy, ascOrDesc) {
        var optionalParams = "&page_size=" + (pageSize || "") + "&page=" + (pageNum || "") + "&sort_key=" + (orderBy || "") + "&sort_order=" + (ascOrDesc || "");
        debugger;
        $http.get("http://eiffel.itba.edu.ar/hci/service4/review.groovy?method=getairlinereviews&airline_id=" + airlineID + "&flight_number=" + flightNumber + optionalParams, {cache: true, timeout: 10000})
                .then(function (response) {
                    if (!response.data.error) {
                        $scope.reviews = response.data.reviews;
                        $scope.reviewCount = response.data.total;    // === $scope.reviews.length
                    } else {
                        console.log("Error getting reviews: " + JSON.stringify(response.data.error));
                    }
                });
    };

    $scope.getFlightAverage = function (airlineID, flightNumber) {
        $scope.getFlightReviews(airlineID, flightNumber, 30, 1);
        var cantReview = $scope.reviewCount;
        var i = 1; //MAximo 15000 comentarios
        var sum = 0;
        do {
            debugger;
            $scope.getFlightReviews(airlineID, flightNumber, 30, i);
            for (var j = 0; j < 30 && j < cantReview; j++) {
                sum = sum + $scope.reviews[j].rating.overall;
            }
            cantReview = cantReview - 30;
            i++;
        } while (cantReview > 0 && i <= 500);
        return sum / $scope.reviewCount;
    };

    /* *************************************************************************
     *                          Flight functions
     * ************************************************************************/
    $scope.deals = [];
    $scope.flights = null;

    $scope.selectFlight = function (flight) {
        //Store flight in session
        var session = getSessionData();
        if (session.search.selectedFlight !== null) {   //If there's already a selected flight, subtract its total first
            session.payment.total -= getFlightTotal(session.search.selectedFlight);
        }
        session.payment.total += getFlightTotal(flight);
        session.search.selectedFlight = flight;
        setSessionData(session);
        markSelectedFlight(flight, session.search.direction);
        $("#currentTotal").html(session.payment.total.toFixed(2));
        $("#nextStep > button").removeClass("disabled");
    };

    $scope.searchFlights = function (extraParamsObj) {
        var session = getSessionData();
        var params = {
            method: "getonewayflights",
            from: session.search.oneWayTrip || !session.state.hasOutboundFlight ? session.search.from.id : session.search.to.id,
            to: session.search.oneWayTrip || !session.state.hasOutboundFlight ? session.search.to.id : session.search.from.id,
            dep_date: session.search.oneWayTrip || !session.state.hasOutboundFlight ? session.search.departDate.full : session.search.returnDate.full,
            adults: session.search.numAdults,
            children: session.search.numChildren,
            infants: session.search.numInfants
        };
        //Add extra params, if supplied
        var extraParams = ['airline_id', 'max_price', 'min_price', 'stopovers', 'cabin_type', 'min_dep_time', 'max_dep_time', 'page', 'page_size', 'sort_key', 'sort_order'];
        for (var index in extraParams) {
            if (extraParamsObj.hasOwnProperty(extraParams[index])) {
                params[extraParams[index]] = extraParamsObj[extraParams[index]];
            }
        }

        $http({
            url: "http://eiffel.itba.edu.ar/hci/service4/booking.groovy",
            method: "GET",
            params: params,
            cache: true,
            timeout: 10000
        }).then(function (response) {
            if (response.data.error) {
                console.log("Error getting flights");
                console.log(JSON.stringify(response.data.error));
                $scope.flights = [];
            } else {
                $scope.flights = response.data;
            }
        });
    };

    $scope.getDeals = function (origin) {
        $http.get("http://eiffel.itba.edu.ar/hci/service4/booking.groovy?method=getflightdeals&from=" + origin, {cache: true, timeout: 10000})
                .then(function (response) {
                    $scope.deals = response.data.deals;
                });
    };

    $scope.goToDeal = function (origin) {
        Materialize.toast("Woooh! Look at that deal!!!", 5000);
    };

    $scope.getLastMinuteDeals = function (origin) {
        $http.get("http://eiffel.itba.edu.ar/hci/service4/booking.groovy?method=getlastminuteflightdeals&from=" + origin, {cache: true, timeout: 10000})
                .then(function (response) {
                    $scope.deals = response.data.deals;
                });
    };

    $scope.bookFlight = function (firstName, lastName, birthDate, idType, idNumber, installments, state, zip, street, streetNumber, phones, email, addressFloor, addressApartment) {
        $http.post("http://eiffel.itba.edu.ar/hci/service4/booking.groovy",
                {method: "getflightdeals",
                    first_name: firstName,
                    last_name: lastName,
                    birthDate: birthDate,
                    id_type: idType,
                    id_number: idNumber,
                    installments: installments,
                    state: state,
                    zip_code: zip,
                    street: street,
                    number: streetNumber,
                    phones: phones,
                    email: email,
                    floor: (addressFloor === undefined ? null : addressFloor),
                    apartment: (addressApartment === undefined ? null : addressApartment)
                },
                {cache: true,
                    timeout: 10000
                }).then(function (response) {
            if (response.data.booking === true) {
                Materialize.toast("OK señorita querida de mi corazón de melocotón de 4 o más décadas", 5000);
            } else {
                Materialize.toast("Error bookeando el flighto", 5000);
            }
        });
    };

    $scope.buildFlickURL = function (imgObj) {
        var URL = "https://farm" + imgObj.farm + ".staticflickr.com/" + imgObj.server + "/" + imgObj.id + "_" + imgObj.secret + "_c.jpg";
        return URL;
    };

    $scope.getFlickrImg = function (query, destId) {
        $http({
            url: "https://api.flickr.com/services/rest/",
            method: "GET",
            params: {
                method: "flickr.photos.search",
                api_key: "9a5f81e1e267f943ba8bbc71ae056840",
                text: query,
                tags: "landscape",
                media: "photos",
                extra: "url_l",
                format: "json",
                nojsoncallback: 1,
//                auth_token: "72157668239782652-059ca87c58c4d413",
//                api_sig: "fd31f0929e9b67bf16f960d68fc663ec",
            },
            cache: true,
            timeout: 10000
        }).then(function (response) {
            if (response.data.stat !== "ok") {
                Materialize.toast("Flickr Error");
                console.log(JSON.stringify(response.data));
            } else {
                if (response.data.photos.photo.length === 0) {
                    Materialize.toast("No images found for " + query);
                }
                $("#" + destId).attr("src", $scope.buildFlickURL(response.data.photos.photo[0]));
//                 $("#"+destId).attr("style",  "background-image: url('"+$scope.buildFlickURL(response.data.photos.photo[0])+"');");
//               
//                return $scope.buildFlickURL(response.data.photos.photo[0/*(Math.random() * response.data.photos.perpage)*/]);
            }
        });
    };

    $scope.getFlickBannerImg = function (query, selector) {
        $http({
            url: "https://api.flickr.com/services/rest/",
            method: "GET",
            params: {
                method: "flickr.photos.search",
                api_key: "9a5f81e1e267f943ba8bbc71ae056840",
                text: query,
                tags: "landscape",
                media: "photos",
                extra: "url_l",
                format: "json",
                nojsoncallback: 1,
//                auth_token: "72157668239782652-059ca87c58c4d413",
//                api_sig: "fd31f0929e9b67bf16f960d68fc663ec",
            },
            cache: true,
            timeout: 10000
        }).then(function (response) {
            if (response.data.stat !== "ok") {
                Materialize.toast("Flickr Error");
                console.log(JSON.stringify(response.data));
            } else {
                if (response.data.photos.photo.length === 0) {
                    Materialize.toast("No images found for " + query);
                }
                $(selector).css("background", "url('" + $scope.buildFlickURL(response.data.photos.photo[0]) + "')");
            }
        });
    };

    $scope.getOriginAirport = function (flight) {
        return flight.outbound_routes[0].segments[0].departure.airport;
    };

    $scope.getDepartureDateObj = function (flight) {
        return new Date(flight.outbound_routes[0].segments[0].departure.date);
    };

    $scope.getDestinationAirport = function (flight) {
        return flight.outbound_routes[0].segments[0].arrival.airport;
    };

    $scope.getArrivalDateObj = function (flight) {
        return new Date(flight.outbound_routes[0].segments[0].arrival.date);
    };

    $scope.getStopovers = function (flight) {
        return flight.outbound_routes[0].segments[0].stopovers;
    };

    $scope.getStopoversCount = function (flight) {
        return flight.outbound_routes[0].segments[0].stopovers.length;
    };

    $scope.isDirectFlight = function (flight) {
        return $scope.getStopovers(flight).length === 0;
    };

    $scope.getFlightTotal = function (flight) {
        return $scope.getFlightPriceBreakdown(flight).total.total;
    };

    $scope.getFlightPriceBreakdown = function (flight) {
        return flight.price;
    };

    $scope.getFlightAirlineName = function (flight) {
        return flight.outbound_routes[0].segments[0].airline.name;
    };

    $scope.getFlightAirlineID = function (flight) {
        return flight.outbound_routes[0].segments[0].airline.id;
    };

    $scope.getFlightAirlineLogoURL = function (flight) {
        var session = getSessionData();
        return session.airlines[getFlightAirlineID(flight)].logo || "#";
        //    TODO fall back to default image if not found
    };

    $scope.getFlightNumber = function (flight) {
        return flight.outbound_routes[0].segments[0].number;
    };

    $scope.getFlightDuration = function (flight) {
        return flight.outbound_routes[0].duration;
    };


    /* *************************************************************************
     *                          Passengers functions
     * ************************************************************************/
    //lel nothing

    $scope.resultsPerPage = 30;
    /* *************************************************************************
     *                          math functions
     * ************************************************************************/
    $scope.getNumberOfPages = function (totalResults, resultsPerPage) {
        if (typeof totalResults === 'undefined' || totalResults === 0)
            return 0;
        var numberOfPages = Number(totalResults) / Number(resultsPerPage);
        var nonCompletePage = Number(numberOfPages);
        numberOfPages = Number(numberOfPages).toFixed(0);
        if (numberOfPages < nonCompletePage) {
            debugger;
            numberOfPages = Number(numberOfPages) + 1;
        }
        debugger;
        return Number(numberOfPages);
    };
});