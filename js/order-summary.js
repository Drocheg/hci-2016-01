$(function () {
    var session = getSessionData();
    
    //Make sure the user is supposed to be here, if not redirect to home
    if(!session.state.hasPayment || !session.state.hasPassengers || session.outboundFlight === null || (!session.search.oneWayTrip && session.inboundFlight === null)) {
        window.location = "index.html";
    }
    
    $("#changeOutboundFlightBtn").on("click", function () {
        var session = getSessionData();
        clearOutboundFlight();
        window.location = "flights.html?from="+session.search.from.id+"&to="+session.search.to.id+"&dep_date="+session.search.departDate.full+"&direction=outbound"+"&adults="+session.search.numAdults+"&children="+session.search.numChildren+"&infants="+session.search.numInfants;
    });

    $("#changeInboundFlightBtn").on("click", function () {        
        var session = getSessionData();
        clearInboundFlight();
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
        bookFlight(session.payment.cardholderFirstName, session.payment.cardholderLastName, session.payment.birthday, 1, session.payment.idNum, session.payment.installments, session.paymentstate, session.payment.zip, session.payment.street, session.payment.streetNumber, session.payment.phones, session.payment.email, session.payment.addressFloor, session.payment.addressApartment)
        window.location = "payment.html";
    });
});


