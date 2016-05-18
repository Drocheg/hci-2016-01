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
    var html = '<div class="card-panel green lighten-2" style="height: 70px; padding:2px;">';
    //Airline code and flight number        
    html += '<div class="col s2"><p><img src="' + getFlightAirlineLogoURL(flight) + '" />  ' + getFlightAirlineID(flight) + " " + getFlightNumber(flight) + '</p></div>';
    //Departure airport and time, arrival airport and time
    var depDate = getDepartureDateObj(flight);
    var arrDate = getArrivalDateObj(flight);
    var depTimeStr = (depDate.getHours() < 10 ? "0" : "") + depDate.getHours() + ":" + (depDate.getMinutes() < 10 ? "0" : "") + depDate.getMinutes();
    var arrTimeStr = (arrDate.getHours() < 10 ? "0" : "") + arrDate.getHours() + ":" + (arrDate.getMinutes() < 10 ? "0" : "") + arrDate.getMinutes();
    html += '<div class="col s4" style="text-align: center;"><p style="line-height: 35px;">' + depTimeStr + ' - ' + getOriginAirport(flight).id + '  <span class="material-icons">send</span>  ' + arrTimeStr + ' - ' + getDestinationAirport(flight).id + '</p></div>';
    //Stopovers
    html += '<div class="col s2"><p style="line-height: 35px;"><i class="material-icons">flight</i>  ' + (getStopoversCount(flight) === 0 ? 'Directo' : getStopoversCount(flight) + ' Escalas') + '</p></div>';
    //Duration
    html += '<div class="col s2 center"><p style="line-height: 35px;"><i class="material-icons">timer</i>  ' + getFlightDuration(flight) + '</p></div>';
    //Cost
    html += '<div class="col s2 center"><p style="line-height: 35px;"><b>$' + getFlightTotal(flight) + '</b></p></div>';
    html += '</div>';
    $("#" + id).html(html);
}

$(function () {


    var session = getSessionData();
    //Set the one way trip checkbox accordingly
    if (session.search.oneWayTrip) {
        $("#returnDate").hide();
        $("#returnDate").removeAttr("required");
        $("label[for=returnDate]").hide();
    }

    //Unselect any previously selected flight
    if (session.search.selectedFlight !== null) {        //User refreshed page
        session.payment.total -= getFlightTotal(session.search.selectedFlight);
    }
    session.search.selectedFlight = null;
    setSessionData(session);

    //Redirect to home if no search has been performed.
//    if(session.search.from.id === null) {
//        window.location = ".";
//    }

    //Mark current total
    $("#currentTotal").html(session.payment.total.toFixed(2));
    //Mark any selected flights
    markSelectedFlight(session.outboundFlight, 'outbound');
    markSelectedFlight(session.inboundFlight, 'inbound');

    //Autocomplete (typeahead.js)
    var autocomplete = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: 'http://eiffel.itba.edu.ar/hci/service4/geo.groovy?method=getcitiesandairportsbyname&name=%QUERY',
            wildcard: '%QUERY',
            transform: function (response) {
                if (response.error) {
                    console.log("Autocomplete error: " + JSON.stringify(response.error));        //TODO shouldn't happen
                    return [];
                }
                return response.data.map(function (entry) {
                    return {
                        value: (entry.name || entry.description) + " (" + entry.id + ")",
                        id: entry.id
                    };
                });
            }
        }
    });

    $('#from').typeahead(null, {
        source: autocomplete,
        name: 'autocomplete-from',
        display: 'value',
        minLength: 3,
        highlight: true
    });

    $('#from').on("change", function () {
        $("#fromId").val("");
    });

    $('#from').bind('typeahead:select', function (ev, suggestion) {
        $("#fromId").val(suggestion.id);
    });

    $('#to').typeahead(null, {
        source: autocomplete,
        name: 'autocomplete-to',
        display: 'value',
        minLength: 3,
        highlight: true
    });

    $('#to').bind('typeahead:select', function (ev, suggestion) {
        $("#toId").val(suggestion.id);
    });

    $('#to').on("change", function () {
        $("#fromId").val("");
    });

    var minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    //Set up datepickers
    var datePickerBaseOptions = {
        min: minDate,
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
//        formatSubmit: 'yyyy-mm-dd',
        onSet: function (arg) {
            if ('select' in arg) { //closeOnSelect is overriden by materialize, this is the workaround https://github.com/Dogfalo/materialize/issues/870
                var d = new Date(arg.select);
                var d2 = d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" : "") + d.getDate();
                console.log(d2);
                $("#" + this.get('id') + "Full").val(d2);
                this.close();
            }
        }
    };

    $('.datepicker').pickadate(datePickerBaseOptions);


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
            from: {
                name: $("#from").val(),
                id: $("#fromId").val()
            },
            to: {
                name: $("#to").val(),
                id: $("#toId").val()
            },
            departDate: {
                pretty: $("#departDate").val(),
                full: $("#departDateFull").val()
            },
            oneWayTrip: $("#oneWayTrip").is(":checked"),
            returnDate: $("#oneWayTrip").is(":checked") ? null : {
                pretty: $("#returnDate").val(),
                full: $("#returnDateFull").val()
            },
            numAdults: Number($("#numAdults").val()),
            numChildren: Number($("#numChildren").val()),
            numInfants: Number($("#numInfants").val())
        };
        if (!data.oneWayTrip && new Date(data.returnDate.full) < new Date(data.departDate.full)) {  //Departure calendar already allows minimum date 2 days from now
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

        if (!data.from.id) {
            if (!data.oneWayTrip && !data.to.id) {
                Materialize.toast("Tiene que ingresar origen y destino validos.", 5000);
                return;
            } else {
                Materialize.toast("Tiene que ingresar origen válido.", 5000);
                return;
            }
        }

        if (!data.to.id) {
            //Don't validate origin, that was checked in previous if
            Materialize.toast("Tiene que ingresar destino válido.", 5000);
            return;
        }

        //TODO use invalid class rather than toasts

        //Valid, store data and go to flight search
        var session = getSessionData();
        session.search.from = data.from;
        session.search.to = data.to;
        session.search.oneWayTrip = data.oneWayTrip;
        session.search.departDate = data.departDate;
        session.search.returnDate = data.returnDate;
        session.search.numAdults = data.numAdults;
        session.search.numChildren = data.numChildren;
        session.search.numInfants = data.numInfants;
        var passengersChanged = data.numAdults !== session.search.numAdults || data.numChildren !== session.search.numChildren || data.numInfants !== session.search.numChildren,
                outboundChanged = data.departDate.full !== session.search.departDate.full || data.from.id !== session.search.from.id,
                inboundChanged = data.oneWayTrip !== session.search.oneWayTrip || data.returnDate.full !== session.search.returnDate.full || data.to.id !== session.search.to.id;

        //Passenger count or outbound trip changed, reset everything
        if (outboundChanged || (passengersChanged && (session.state.hasOutboundFlight || session.state.hasInboundFlight))) {
            session.search.direction = "outbound";
            session.outboundFlight = null;
            session.inboundFlight = null;
            session.state.hasOutboundFlight = false;
            session.state.hasInboundFlight = false;
            session.payment.total = 0;
        }
        //Inbound trip changed, change only inbound trip
        else if (inboundChanged) {
            if (session.state.hasInboundFlight) {
                session.payment.total -= getFlightTotal(session.InboundFlight);
            }
            if (!outboundChanged) {
                session.search.direction = "inbound";
            }
            session.inboundFlight = null;
            session.state.hasInboundFlight = false;
        }
        session.search.selectedFlight = null;
        setSessionData(session);
        window.location = "flights.html";
        //TODO actualizar botón de nextStep si se agrega/saca vuelta
    });

    $("#flights").on("click", ".selectFlightBtn", function () {
        //Re-enable all other buttons
        $(".selectFlightBtn").html("Seleccionar");
        $(".selectFlightBtn").removeClass("disabled");
        //Disable this one
        $(this).html("Seleccionado");
        $(this).addClass("disabled");
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
