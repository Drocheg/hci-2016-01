$(function () {
    $("#changeOutboundFlightBtn").on("click", function () {
        var session = getSessionData();
        var f = session.outboundFlight;
        session.payment.total -= getFlightTotal(f);
        session.state.hasOutboundFlight = false;
        session.outboundFlight = null;
        setSessionData(session);
        window.location = "flights.html?from="+session.search.from.id+"&to="+session.search.to.id+"&dep_date="+session.search.departDate.full+"&direction=outbound"+"&adults="+session.search.numAdults+"&children="+session.search.numChildren+"&infants="+session.search.numInfants;
    });

    $("#changeInboundFlightBtn").on("click", function () {        
        var session = getSessionData();
        var f = session.inboundFlight;
        session.payment.total -= getFlightTotal(f);
        session.state.hasInboundFlight = false;
        session.inboundFlight = null;
        setSessionData(session);
        window.location = "flights.html?from="+session.search.to.id+"&to="+session.search.from.id+"&dep_date="+session.search.returnDate.full+"&direction=inbound"+"&adults="+session.search.numAdults+"&children="+session.search.numChildren+"&infants="+session.search.numInfants;
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
    
    $("#confirmBtn").on("click", function () {
        var session = getSessionData();
        bookFlight(session.payment.cardholderFirstName, session.payment.cardholderLastName, session.payment.birthday, 1, session.payment.idNum, installments, state, session.payment.zip, street, streetNumber, phones, session.payment.email, addressFloor, addressApartment)
        window.location = "payment.html";
    });
});


