/* *****************************************************************************
 *                          Flight helper functions
 * ****************************************************************************/
function getOriginAirport(flight) {
    return flight.outbound_routes[0].segments[0].departure.airport;
}

function getDepartureDateObj(flight) {
    var str = flight.outbound_routes[0].segments[0].departure.date.split(" ");
    var date = str[0].split("-"), time = str[1].split(":");
    return new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
}

function getDestinationAirport(flight) {
    return flight.outbound_routes[0].segments[0].arrival.airport;
}

function getArrivalDateObj(flight) {
    var str = flight.outbound_routes[0].segments[0].arrival.date.split(" ");
    var date = str[0].split("-"), time = str[1].split(":");
    return new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
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
 *                              Session Functions
 * ****************************************************************************/

/**
 * Sets the specified outbound flight and stores it in session, clearing any
 * previously selected flight, if present.
 * 
 * @param {object} flightObj The flight to store
 * @returns {boolean} True if there was a previous flight, false otherwise.
 */
function setOutboundFlight(flightObj) {
    var result = clearOutboundFlight();
    var session = getSessionData();
    session.payment.total += getFlightTotal(flightObj);
    session.outboundFlight = flightObj;
    setSessionData(session);
    return result;
}

/**
 * Removes the session-stored outbound flight, if present.
 * 
 * @returns {Boolean} True if there was an outbound flight and it was cleared,
 * false otherwise.
 */
function clearOutboundFlight() {
    var session = getSessionData();
    if(session.outboundFlight === null) {
        return false;
    }
    session.payment.total -= getFlightTotal(session.outboundFlight);
    if(session.payment.total < 0) { //Handle precision errors
        session.payment.total = 0;
    }
    session.outboundFlight = null;
    setSessionData(session);
    return true;
}

/**
 * Sets the specified inbound flight and stores it in session, clearing any
 * previously selected flight, if present.
 * 
 * @param {object} flightObj The flight to store
 * @returns {boolean} True if there was a previous flight, false otherwise.
 */
function setInboundFlight(flightObj) {
    var result = clearInboundFlight();
    var session = getSessionData();
    session.payment.total += getFlightTotal(flightObj);
    session.inboundFlight = flightObj;
    setSessionData(session);
    return result;
}

/**
 * Removes the session-stored inbound flight, if present.
 * 
 * @returns {Boolean} True if there was an inbound flight and it was cleared,
 * false otherwise.
 */
function clearInboundFlight() {
    var session = getSessionData();
    if(session.inboundFlight === null) {
        return false;
    }
    session.payment.total -= getFlightTotal(session.inboundFlight);
    if(session.payment.total < 0) { //Handle precision errors
        session.payment.total = 0;
    }
    session.inboundFlight = null;
    setSessionData(session);
    return true;
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

function defaultFailHandler(errorObj, customMessage) {
    Materialize.toast(customMessage || "Error de conexión, por favor intente de nuevo.", 5000);
    console.log("Network error: ");
    console.log(errorObj);
}

/**
 * Makes an API call with the specified parameters.
 * 
 * @param {string} service A valid API service.
 * @param {object} params Parameters for the query, including the "method"
 * parameter.
 * @param {function} successCallback Callback to run on successful
 * completion of the request that returned without errors.
 * @param {function} errorCallback (Optional) Callback to run on successful
 * completion of the request that returned with errors. If none provided,
 * the error will be logged.
 * @param {function} failCallback (Optional) Callback to run on failure (e.g.
 * network error). If none provided, calls default fail handler.
 * @param {string} method (Optional) GET or POST. Defaults to GET.
 * @returns {undefined}
 */
function APIrequest(service, params, successCallback, errorCallback, failCallback, method) {
    $.ajax({
        url: "http://eiffel.itba.edu.ar/hci/service4/" + service + ".groovy",
        method: method || "GET",
        dataType: 'json',
        data: params || {},
        timeout: 10000
    }).done(function (response) {
        if (response.error) {
            if (typeof errorCallback !== 'undefined') {
                errorCallback(response);
            } else {
                console.log("API returned an error: " + JSON.stringify(response));
            }
        } else {
            successCallback(response);
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        if (typeof failCallback !== 'undefined') {
            failCallback(jqXHR, textStatus, errorThrown);
        } else {
            defaultFailHandler({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
        }
    });

}

/**
 * Makes an API request that is paginated and runs a callback with the total
 * returned by the API, if specified.
 * 
 * @param {string} service
 * @param {object} params
 * @param {function} callback
 * @returns {undefined}
 */
function countResults(service, params, callback) {
    APIrequest(
            service,
            params,
            function (response) {
                if (response.total) {
                    callback(response.total);
                } else {
                    console.log("No total returned for query " + JSON.stringify(params));
                }
            },
            function (response) {
                console.log("Error counting totals\nQuery: " + JSON.stringify(params) + "\nResponse error: " + JSON.stringify(response.error));
            });
}