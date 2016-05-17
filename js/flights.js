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
    return session.airlines[getFlightAirlineID(flight)].logo;
}

function getFlightNumber(flight) {
    return flight.outbound_routes[0].segments[0].number;
}

function getFlightDuration(flight) {
    return flight.outbound_routes[0].duration;
}

/**
 * Updates the outgoing/incoming boxes on flights.html to show info of the
 * specified flight.
 * 
 * @param {object} flight
 * @param {string} direction "outbound" or "inbound"
 * @returns {undefined}
 */
function markSelectedFlight(flight, direction) {
    if (flight === null) {
        return;
    }
    var id;
    switch (direction) {
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
    html += '<div class="col s4"><p><i class="material-icons">airplanemode_active</i>' + getFlightAirlineName(flight) + " #" + getFlightNumber(flight) + '</p></div>';
    //Departure airport and time, arrival airport and time
    var depDate = getDepartureDateObj(flight);
    var arrDate = getArrivalDateObj(flight);
    html += '<div class="col s4"><p>' + getOriginAirport(flight).id + ' (' + depDate.getHours() + ':' + depDate.getMinutes() + ') <span class="material-icons">forward</span> ' + getDestinationAirport(flight).id + ' (' + arrDate.getHours() + ':' + arrDate.getMinutes() + ')</p></div>';
    //Cost
    html += '<div class="col s1 center"><p style="line-height: 35px;">$' + getFlightTotal(flight) + '</p></div>';
    //Change button - only allow changes if on a one-way trip or if the other part of the trip has already been chosen.
    var changeFlightState = ' disabled';
    var session = getSessionData();
    if (direction === "outbound" && (session.search.oneWayTrip || !session.state.hasInboundFlight)) {
        changeFlightState = ' disabled';
    }
    else if(session.search.direction === "inbound" && !session.state.hasOutboundFlight) {
        changeFlightState = ' disabled';
    }
    else {
        changeFlightState = '';
    }
    html += '<div class="col s3 right-align"><button class="btn' + changeFlightState + '" style="margin-top: 15px;">Cambiar</button></div>';
    html += '</div>';
    $("#" + id).html(html);
}

$(function () {
    $(document).ready(function () {
        if ($("#oneWayTrip").is(":checked")) {
            $("#returnDate").fadeOut();
            $("#returnDate").removeAttr("required");
            $("label[for=returnDate]").fadeOut();
        } else {
            $("#returnDate").fadeIn();
            $("label[for=returnDate]").fadeIn();
            $("#returnDate").attr("required", "required");
        }
    });


    var session = getSessionData();
    //Unselect any previously selected flight
    session.search.selectedFlight = null;
    setSessionData(session);
    
    //Redirect to home if no search has been performed.
//    if(session.search.from === null) {
//        window.location = ".";
//    }
//    
    //Autofill form
//    $("#from").val(session.search.from);
//    $("#to").val(session.search.to);
//    $("#departDate").val(session.search.depart);
//    $("#oneWayTrip").prop('checked', session.search.oneWayTrip);
//    $("#returnDate").val(session.search.return || "");
//    $("#numAdults").val(session.search.adults);
//    $("#numInfants").val(session.search.infants);
//    $("#numChildren").val(session.search.children);
    //Mark current total
    $("#currentTotal").html(session.payment.total);
    //Mark any selected flights
    markSelectedFlight(session.outboundFlight, 'outbound');
    markSelectedFlight(session.inboundFlight, 'inbound');



    //Set up datepickers
    var datePickerOptions = {
        min: new Date(), //Can't travel in the past =(
        selectMonths: true,
        selectYears: 2, //Creates a dropdown of 2 years ahead to control year
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
            if ('select' in arg) { //prevent closing on selecting month/year
                this.close();
            }
        }
    };
    $('.datepicker').pickadate(datePickerOptions);


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

    $("#searchButton").on("click", function (event) {
        event.preventDefault();
        var data = {
            from: $("#from").val(),
            to: $("#to").val(),
            departDate: $("input[name=departDate_submit]").val(),
            oneWayTrip: $("#oneWayTrip").is(":checked"),
            returnDate: $("#oneWayTrip").is(":checked") ? null : $("input[name=returnDate_submit]").val(),
            numAdults: Number($("#numAdults").val()),
            numChildren: Number($("#numChildren").val()),
            numInfants: Number($("#numInfants").val())
        };
        if (!data.oneWayTrip && new Date(data.returnDate) < new Date(data.departDate)) {
            Materialize.toast("Fecha vuelta deberia ser inferior a fecha ida.", 5000); //El calendario no debería permitirlo pero por las dudas
            return;
        }
        //Tampoco se deberia poder que sean negativos
        if (data.numInfants > 0 && data.numAdults === 0) {
            Materialize.toast("Los infantes no pueden viajar sin adultos.", 5000);
            return;
        }
        if (data.numAdults === 0 && data.numChildren === 0 && data.numInfants === 0) {
            Materialize.toast("Tiene que ingresar al menos un pasajero.", 5000);    //No se puede validar antes, sólo se puede validar de que los 3 tengan como mínimo 0 con HTML
            return;
        }
        
        //TODO use invalid class rather than toasts

        //Valid, store data and go to flight search
        var session = getSessionData();
        session.search.from = data.from;
        session.search.to = data.to;
        session.search.oneWayTrip = data.oneWayTrip;
        session.search.depart = data.departDate;
        session.search.return = data.returnDate;
        session.search.adults = data.numAdults;
        session.search.children = data.numChildren;
        session.search.infants = data.numInfants;
        //Rreset search parameters, search starts over
        session.search.direction = "outbound";
        session.outboundFlight = null;
        session.inboundFlight = null;
        session.state.hasOutboundFlight = false;
        session.state.hasInboundFlight = false;
        session.payment.total = 0;
        setSessionData(session);
        debugger;
        window.location = "flights.html";
    });

    $("#nextStep").on("click", "> button", function () {
        //Make sure there's a selected flight
        var session = getSessionData();
        if (session.search.selectedFlight === null) {
            return;
        }
        var flight = session.search.selectedFlight;
        //Update session state
        var direction = session.search.direction;
        var nextPage = null;
        if (direction === "outbound") {
            session.outboundFlight = flight;
            session.state.hasOutboundFlight = true;
            if (session.search.oneWayTrip) {
                nextPage = session.state.hasPayment ? (session.state.hasPassengers ? "order-summary.html" : "passengers-information.html") : "payment.html";
                session.search.direction = null;
            } else {
                nextPage = session.state.hasInboundFlight ? (session.state.hasPayment ? ((session.state.hasPassengers ? "order-summary.html" : "passengers-information.html")) : "payment.html") : "flights.html";
                session.search.direction = session.state.hasInboundFlight ? null : "inbound";
            }
        } else if (direction === "inbound") {
            session.inboundFlight = flight;
            session.state.hasInboundFlight = true;
            nextPage = session.state.hasPayment ? (session.state.hasPassengers ? "order-summary.html" : "passengers-information.html") : "payment.html";
            session.search.direction = null;
        } else {
            Materialize.toast("Invalid state. Direction is neither inbound nor outbound. Fix.");    //TODO fix
        }
        session.search.selectedFlight = null;
        setSessionData(session);
        window.location = nextPage;

    });
});
