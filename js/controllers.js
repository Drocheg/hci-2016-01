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
    $scope.getFlightReviews = function (airlineID, flightNumber) {
        console.log("Airline ID: " + airlineID);
        console.log("Flight: #" + flightNumber);

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
    $scope.flights = [];
    $scope.total = 0;
    $scope.flightTotal = 0;

    $scope.selectFlight = function (flightObj) {
        $scope.total -= $scope.flightTotal;
        //Store flight in session
        var session = getSessionData();
        session.search.selectedFlight = flightObj;
        setSessionData(session);
        var id;
        switch (session.search.direction) {
            case "outbound":
                id = "selectedOutboundFlight";
                break;
            case "inbound":
                id = "selectedInboundFlight";
                break;
            default:
                console.log("Flight direction not stored in session, I don't know which box to put the flight in. Aborting.");  //TODO validate and remove
                return;
        }
        //Airline code and flight number        
        var html = '<div class="card-panel green" style="height: 70px; padding:2px;">';
        html += '<div class="col s4"><p><i class="material-icons">airplanemode_active</i>' + flightObj.outbound_routes[0].segments[0].airline.name + " #" + flightObj.outbound_routes[0].segments[0].number + '</p></div>';
        //Departure airport and time, arrival airport and time
        var depDate = new Date(flightObj.outbound_routes[0].segments[0].departure.date);
        var arrDate = new Date(flightObj.outbound_routes[0].segments[0].arrival.date);
        html += '<div class="col s4"><p>' + flightObj.outbound_routes[0].segments[0].departure.airport.id + ' (' + depDate.getHours() + ':' + depDate.getMinutes() + ') <span class="material-icons">forward</span> ' + flightObj.outbound_routes[0].segments[0].arrival.airport.id + ' (' + arrDate.getHours() + ':' + arrDate.getMinutes() + ')</p></div>';
        //Cost
        html += '<div class="col s1 center"><p style="line-height: 35px;">$' + flightObj.price.total.total + '</p></div>';
        //Change button - only allow changes if on a one-way trip or if the other part of the trip has already been chosen.
        var changeFlightState = ' disabled';
        if (session.search.direction === "outbound" && (session.search.oneWayTrip || session.state.hasInboundFlight)) {
            changeFlightState = '';
        } else if (session.search.direction === "inbound" && session.state.hasOutboundFlight) {
            changeFlightState = '';
        }
        html += '<div class="col s3 right-align"><button class="btn' + changeFlightState + '" style="margin-top: 15px;">Cambiar</button></div>';
        html += '</div>';
        $("#" + id).html(html);
        $scope.flightTotal = flightObj.price.total.total;
        $scope.total += $scope.flightTotal;
    };

    $scope.searchFlights = function (criteria, order) {
        var sessionData = getSessionData();
        var f = sessionData.search.from || null, //If undefined, set to NULL
                t = sessionData.search.to || null,
                d = sessionData.search.depart || null,
                a = typeof sessionData.search.adults === 'undefined' ? -1 : sessionData.search.adults, //0 evaluates to false so we can't use the || here
                c = typeof sessionData.search.children === 'undefined' ? -1 : sessionData.search.children,
                i = typeof sessionData.search.infants === 'undefined' ? -1 : sessionData.search.infants;
        if (!f || !t || !d || a < 0 || c < 0 || i < 0) {  //Any empty, null or undefined variable will return false
            return;
        }
        //All info is present, search
        $scope.getOneWayFlights(f, t, d, a, c, i, undefined, undefined, criteria, order);
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
            $scope.flights = response.data;
        });
    };

    $scope.getDeals = function (origin) {
        $http.get("http://eiffel.itba.edu.ar/hci/service4/booking.groovy?method=getflightdeals&from=" + origin, {cache: true, timeout: 10000})
                .then(function (response) {
//                    $scope.deals = $scope.separateIntoGroupsOf(3, response.data.deals);
                    $scope.deals = response.data.deals;
                });
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

    $scope.getOriginAirport = function (flight) {
        return flight.outbound_routes[0].segments[0].departure.airport;
    };

    $scope.getDepartureDateObj = function (flight) {
        return new Date(flight.outbound_routes[0].segments[0].departure.date);
    };

    $scope.getDestinationAirport = function (flight) {
        return flight.outbound_routes[0].segments[0].departure.airport;
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
        // return session.search.adults;
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

});