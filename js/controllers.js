var app = angular.module('app', ['ui.materialize']);    //Include angular-materialize plugin
app.controller('controller', function ($scope, $http) {
    /* *************************************************************************
     *                          General functions
     * ************************************************************************/
    $scope.session = getSessionData();

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

    $scope.stringToDate = function (dateString) {
        return new Date(dateString);
    };

    /**
     * Turns the window.search variable into an object of parameters.
     * @returns {object}
     * @see http://stackoverflow.com/a/5448635
     */
    $scope.getGETParams = function () {
        var str = window.location.search.substr(1);
        return str !== null && str !== "" ? $scope.URLStringToObj(str) : {};
    };

    /**
     * Converts an URL-encoded string to an object.
     * 
     * @param {string} str
     * @returns {object}
     * @see http://stackoverflow.com/a/5448635
     */
    $scope.URLStringToObj = function (str) {
        var params = {};
        var prmarr = str.split("&");
        for (var i = 0; i < prmarr.length; i++) {
            var tmparr = prmarr[i].split("=");
            params[tmparr[0]] = tmparr[1];
        }
        return params;
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
        var arr = new Array(size);
        for (var i = 1; i <= size; i++) {
            arr[i - 1] = i;
        }
        return arr;
    };

    /* *************************************************************************
     *                          Review functions
     * ************************************************************************/
    $scope.getFlightReviews = function (airlineID, flightNumber, pageSize, pageNum, orderBy, ascOrDesc) {
        var optionalParams = "&page_size=" + (pageSize || "") + "&page=" + (pageNum || "") + "&sort_key=" + (orderBy || "") + "&sort_order=" + (ascOrDesc || "");
        debugger;
        $http.get("http://eiffel.itba.edu.ar/hci/service4/review.groovy?method=getairlinereviews&airline_id=" + airlineID + "&flight_number=" + flightNumber + optionalParams, {cache: true, timeout: 10000})
                .then(function (response) {
                    $scope.reviews = response.data.reviews;
                    $scope.reviewCount = response.data.total;    // === $scope.reviews.length
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

    $scope.searchFlights = function (criteria, order) {
        var session = getSessionData();
        var f = session.search.oneWayTrip || !session.state.hasOutboundFlight ? session.search.from.id : session.search.to.id,
                t = session.search.oneWayTrip || !session.state.hasOutboundFlight ? session.search.to.id : session.search.from.id,
                d = session.search.oneWayTrip || !session.state.hasOutboundFlight ? session.search.departDate.full : session.search.returnDate.full,
                a = session.search.numAdults,
                c = session.search.numChildren,
                i = session.search.numInfants;
        if (!f || !t || !d || a < 0 || c < 0 || i < 0) {  //Any empty, null or undefined variable will return false
            return;
        }
        //All info is present, search
        $scope.getOneWayFlights(f, t, d, a, c, i, undefined, undefined, criteria, order);   //TODO incorporate page number
    };

    /**
     * Gets one-way flights matching the specified criteria.
     * 
     * @param {string} from City or airport ID.
     * @param {string} to City or airport ID.
     * @param {string} departDate Departure date, yyyy-mm-dd format. <b>NOTE: </b>
     * Must be at least 3 days from today. Otherwise use getLastMinuteDeals().
     * @param {number} numAdults Number of adults flying.
     * @param {number} numChildren Number of children flying. Children can
     * travel without an adult.
     * @param {number} numInfants Number of infants flying. Infants can't travel
     * without an adult.
     * @param {number} pageNum OPTIONAL. Page number of results to get. Defaults
     * to 1.
     * @param {number} pageSize OPTIONAL. Results per page. Defaults to 30.
     * @param {string} sortKey OPTIONAL. Sorting key of results. Valid values:
     * fare, total, stopovers, airline, duration. Defaults to undefined.
     * @param {string} sortOrder OPTIONAL. Valid values: asc, desc. Defaults to
     * asc.
     * @returns {undefined}
     */
    $scope.getOneWayFlights = function (from, to, departDate, numAdults, numChildren, numInfants, pageNum, pageSize, sortKey, sortOrder) {
        var params = {
            method: "getonewayflights",
            from: from,
            to: to,
            dep_date: departDate,
            adults: numAdults,
            children: numChildren,
            infants: numInfants,
            page: pageNum || undefined, //API defaults to 1
            page_size: pageSize || undefined, //API defaults to 30
            sort_key: sortKey || undefined,
            sort_order: sortOrder || undefined
        };
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
//                    $scope.deals = $scope.separateIntoGroupsOf(3, response.data.deals);
                    $scope.deals = response.data.deals;
                });
    };

    $scope.goToDeal = function (origin) {
        Materialize.toast("Woooh! Look at that deal!!!", 5000);
    };

    $scope.getPicture = function (cardIndex, city) {
        return "#";
//        $http.jsonp("http://www.panoramio.com/map/get_panoramas.php?set=public&from=0&to=20&minx=-180&miny=-90&maxx=180&maxy=90&size=medium&mapfilter=true&callback=magic", {cache: true, timeout: 10000})
//                .then(function (response) {
//                    console.log(repsonse.data);
//                    return response.data.photos[0].photo_url;
//                });
    };

    $scope.getLastMinuteDeals = function (origin) {
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
                api_key: "d4a47ff42274335c76b940e3ef520dcd",
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
                $("#"+destId).attr("src", $scope.buildFlickURL(response.data.photos.photo[0]));
//                 $("#"+destId).attr("style",  "background-image: url('"+$scope.buildFlickURL(response.data.photos.photo[0])+"');");
//               
//                return $scope.buildFlickURL(response.data.photos.photo[0/*(Math.random() * response.data.photos.perpage)*/]);
            }
        });
    };
    
    $scope.getFlickBannerImg = function(query, selector) {
        $http({
            url: "https://api.flickr.com/services/rest/",
            method: "GET",
            params: {
                method: "flickr.photos.search",
                api_key: "d4a47ff42274335c76b940e3ef520dcd",
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
                $(selector).css("background", "url('"+$scope.buildFlickURL(response.data.photos.photo[0])+"')");
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

    $scope.getAdults = function () {
        // var session = getSessionData();
        // return session.search.numAdults;
        return 2;
    };

    $scope.sexos = [
        {name: 'Masculino'},
        {name: 'Femenino'},
        {name: 'Apache Helicopter'}
    ];

    $scope.mySexo = $scope.sexos[2];

    $scope.getNumber = function (num) {
        return new Array(num);
    };

    $scope.getColors = function () {
        return $scope.colors;
    };

    $scope.resultsPerPage = 30;
    /* *************************************************************************
     *                          math functions
     * ************************************************************************/
    $scope.getNumberOfPages = function (totalResults, resultsPerPage) {
        var numberOfPages = Number(totalResults) / Number(resultsPerPage);
        debugger;
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
