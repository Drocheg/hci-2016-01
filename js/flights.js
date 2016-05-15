function getOriginAirport(flight) {
    return flight.outbound_routes[0].segments[0].departure.airport;
}

function getDepartureDateObj(flight) {
    return new Date(flight.outbound_routes[0].segments[0].departure.date);
}

function getDestinationAirport(flight) {
    return flight.outbound_routes[0].segments[0].departure.airport;
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

function getFlightNumber(flight) {
    return flight.outbound_routes[0].segments[0].number;
}

function getFlightDuration(flight) {
    return flight.outbound_routes[0].duration;
}

$(function() {
    //Autofill form
    var session = getSessionData();
    //Unselect any previously selected flight
    session.search.selectedFlight = null;
    setSessionData(session);
    //Redirect to home if no search has been performed.
//    if(session.search.from === null) {
//        window.location = ".";
//    }
    
    $("#from").val(session.search.from);
    $("#to").val(session.search.to);
    $("#departDate").val(session.search.depart);
    $("#oneWayTrip").prop('checked', session.search.oneWayTrip);
    $("#returnDate").val(session.search.return || "");
    $("#numAdults").val(session.search.adults);
    $("#numInfants").val(session.search.infants);
    $("#numChildren").val(session.search.children);
    
    //Set up datepickers
    var datePickerOptions = {
        min: new Date(),    //Can't travel in the past =(
        selectMonths: true,
        selectYears: 2,     //Creates a dropdown of 2 years ahead to control year
        //Spanish translation https://github.com/amsul/pickadate.js/blob/3.5.6/lib/translations/es_ES.js
        monthsFull: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthsShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
        weekdaysFull: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        weekdaysShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
        today: 'hoy',
        clear: 'borrar',
        close: 'cerrar',
        firstDay: 1,
        format: 'dddd d/m',
        formatSubmit: 'yyyy-mm-dd',
        //closeOnSelect is overriden by materialize, this is the workaround https://github.com/Dogfalo/materialize/issues/870
        onSet: function (arg) {
            if('select' in arg) { //prevent closing on selecting month/year
                this.close();
            }
        }
    };
    $('.datepicker').pickadate(datePickerOptions);
    
    //Hide/show return date picker when clicking one-way only
    $("#oneWayTrip").on('change', function () {
        if ($(this).is(":checked")) {
            $("#returnDate").fadeOut();
            $("#returnDate").removeAttr("required");
            $("label[for=returnDate]").fadeOut();
        } else {
            $("#returnDate").fadeIn();
            $("label[for=returnDate]").fadeIn();
            $("#returnDate").attr("required", "required");
        }
    });
    
    $("#nextStep").on("click", "> button", function() {
        debugger;
        //Make sure there's a selected flight
        var session = getSessionData();
        if(session.search.selectedFlight === null) {
            return;
        }
        var flight = session.search.selectedFlight;
        //Update session state
        var direction = session.search.direction;
        var nextPage = null;
        if(direction === "outbound") {
            session.outboundFlight = flight;
            session.state.hasOutboundFlight = true;
            if(session.search.oneWayTrip) {
                nextPage = session.state.hasPayment ? (session.state.hasPassengers ? "order-summary.html" : "passengers-information.html") : "payment.html";
            }
            else {
                nextPage = session.state.hasInboundFlight ? (session.state.hasPayment ? ((session.state.hasPassengers ? "order-summary.html" : "passengers-information.html")) : "payment.html") : "flights.html";
            }
        }
        else if(direction === "inbound") {
            session.inboundFlight = flight;
            session.state.hasInboundFlight = true;
            nextPage = session.state.hasPayment ? (session.state.hasPassengers ? "order-summary.html" : "passengers-information.html") : "payment.html";
        }
        else {
            Materialize.toast("Invalid state. Direction is neither inbound nor outbound. Fix.");    //TODO fix
        }
        session.payment.total += getFlightTotal(flight);
        session.search.selectedFlight = null;
        setSessionData(session);
        window.location = nextPage;
    });
});