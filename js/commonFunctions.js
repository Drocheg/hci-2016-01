/* *****************************************************************************
 *                          Flight helper functions
 * ****************************************************************************/
function getOriginAirport(flight) {
    return flight.outbound_routes[0].segments[0].departure.airport;
}

function getDepartureDateObj(flight) {
    return new Date(flight.outbound_routes[0].segments[0].departure.date);
}

function getDestinationAirport(flight) {
    return flight.outbound_routes[0].segments[0].arrival.airport;
}

function getArrivalDateObj(flight) {
    return new Date(flight.outbound_routes[0].segments[0].arrival.date);
}

function getStopovers(flight) {
    return flight.outbound_routes[0].segments[0].stopovers;
}

function getStopoversCount(flight) {
    return flight.outbound_routes[0].segments[0].stopovers.length;
}

function isDirectFlight(flight) {
    return getStopovers(flight).length === 0;
}

function getFlightTotal(flight) {
    return getFlightPriceBreakdown(flight).total.total;
}

function getFlightPriceBreakdown(flight) {
    return flight.price;
}

function getFlightAirlineName(flight) {
    return flight.outbound_routes[0].segments[0].airline.name;
}

function getFlightAirlineID(flight) {
    return flight.outbound_routes[0].segments[0].airline.id;
}

function getFlightAirlineLogoURL(flight) {
    var session = getSessionData();
    return session.airlines[getFlightAirlineID(flight)].logo || "#";
//    TODO fall back to default image if not found
}

function getFlightNumber(flight) {
    return flight.outbound_routes[0].segments[0].number;
}

function getFlightDuration(flight) {
    return flight.outbound_routes[0].duration;
}


/* *****************************************************************************
 *                              General Functions
 * ****************************************************************************/

/**
 * Searches GET parameters to get the value of the parameter with the specified
 * name.
 * 
 * @param {String} paramName
 * @returns {String|null} The value of the parameter with the specified key, or
 * null if not found.
 */
function getGETparam(paramName) {
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