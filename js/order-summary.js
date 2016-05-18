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


$(function () {


    $("#changeOutboundFlightBtn").on("click", function () {
        var session = getSessionData();
        var f = session.outboundFlight;
        session.payment.total -= getFlightTotal(f);
        session.state.hasOutboundFlight = false;
        session.outboundFlight = null;
        setSessionData(session);
        window.location = "flights.html";
    });

    $("#changeInboundFlightBtn").on("click", function () {        
        var session = getSessionData();
        var f = session.inboundFlight;
        session.payment.total -= getFlightTotal(f);
        session.state.hasInboundFlight = false;
        session.inboundFlight = null;
        setSessionData(session);
        window.location = "flights.html";
    });

    $("#changePassengersBtn").on("click", function () {
        var session = getSessionData();
        session.state.hasPassengers = false;
        setSessionData(session);
        window.location = "passengers-information.html";
    });

    $("#changePaymentBtn").on("click", function () {
        var session = getSessionData();
        session.state.hasPayment = false;
        setSessionData(session);
        window.location = "payment.html";
    });

    $("#changeContactBtn").on("click", function () {
        var session = getSessionData();
        session.state.hasContact = false;
        setSessionData(session);
        window.location = "payment.html";
    });
});


