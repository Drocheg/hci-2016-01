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
    var html = '<div class="card-panel light-green lighten-1" style="height: 70px; padding:2px;">';
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

    //Enable tooltips for +1's
    $('.tooltipped').tooltip(/*{delay: 50}*/);

    if (session.search.selectedFlight !== null) {        //User refreshed page
        session.payment.total -= getFlightTotal(session.search.selectedFlight);
    }
    //Unselect any previously selected flight
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

    //Datepickers
    var minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
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

    //Handle form submit
    $("#searchButton").on("click", function (event) {
        event.preventDefault();
        var session = getSessionData();
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
            returnDate: session.search.oneWayTrip ? null : {
                pretty: $("#returnDate").val(),
                full: $("#returnDateFull").val()
            },
            numAdults: Number($("#numAdults").val()),
            numChildren: Number($("#numChildren").val()),
            numInfants: Number($("#numInfants").val())
        };
        //Validate
        var valid = true;

        //Origin
        if (data.from.id === "") {
            $("label[for=from]").attr("data-error", "Por favor ingrese un orígen válido");
            $("#from").removeClass("valid");
            $("#from").addClass("invalid");
            valid = false;
        } else {
            $("#from").removeClass("invalid");
            $("#from").addClass("valid");
        }
        //Destination
        if (data.to.id === "") {
            $("label[for=to]").attr("data-error", "Por favor ingrese un destino válido");
            $("#to").removeClass("valid");
            $("#to").addClass("invalid");
            valid = false;
        } else {
            $("#to").removeClass("invalid");
            $("#to").addClass("valid");
        }
        //Departure date
        if (data.departDate.full === "") {
            $("label[for=departDate]").attr("data-error", "Por favor ingrese una fecha de ida válida");
            $("#departDate").removeClass("valid");
            $("#departDate").addClass("invalid");
            valid = false;
        } else {
            $("#departDate").removeClass("invalid");
            $("#departDate").addClass("valid");
        }
        //Return date
        if (!session.search.oneWayTrip) {
            if (data.returnDate.full === "") {
                $("label[for=returnDate]").attr("data-error", "Por favor ingrese una fecha de vuelta válida");
                $("#returnDate").removeClass("valid");
                $("#returnDate").addClass("invalid");
                valid = false;
            } else if (!session.search.oneWayTrip && new Date(data.returnDate.full) < new Date(data.departDate.full)) {
                $("label[for=returnDate]").attr("data-error", "Todavía no ofrecemos viajes en el tiempo"); //TODO use serious message
                $("#returnDate").removeClass("valid");
                $("#returnDate").addClass("invalid");
                valid = false;
            } else {
                $("#returnDate").removeClass("invalid");
                $("#returnDate").addClass("valid");
            }
        }
        //Passengers: At least one must fly
        if (data.numAdults === 0 && data.numChildren === 0 && data.numInfants === 0) {
            $("label[for=numAdults]").attr("data-error", "Por favor ingrese al menos un pasajero");
            $("#numAdults").removeClass("valid");
            $("#numAdults").addClass("invalid");
            valid = false;
        }
        //Passengers: Infants can't travel without adults
        else if (data.numInfants > 0 && data.numAdults === 0) {
            $("label[for=numAdults]").attr("data-error", "Los infantes no pueden viajar sin adultos");
            $("#numAdults").removeClass("valid");
            $("#numAdults").addClass("invalid");
            valid = false;
        } else {
            $("#numAdults").removeClass("invalid");
            $("#numAdults").addClass("valid");
        }

        if (!valid) {
            return;
        }

        //What did the user change?
        var passengersChanged = data.numAdults !== session.search.numAdults || data.numChildren !== session.search.numChildren || data.numInfants !== session.search.numChildren,
                placesChanged = data.from.id !== session.search.from.id || data.to.id !== session.search.to.id,
                departDateChanged = data.departDate.full !== session.search.departDate.full,
                returnDateChanged = !session.search.oneWayTrip && data.returnDate.full !== session.search.returnDate.full;

        //Reset everything
        if (placesChanged || passengersChanged || departDateChanged) {
            session.search.direction = "outbound";
            session.outboundFlight = null;
            session.inboundFlight = null;
            session.state.hasOutboundFlight = false;
            session.state.hasInboundFlight = false;
            session.payment.total = 0;
        }
        //Inbound trip changed, change only inbound trip
        else if (returnDateChanged) {
            if (session.state.hasInboundFlight) {
                session.payment.total -= getFlightTotal(session.InboundFlight);
            }
            session.search.direction = session.state.hasOutboundFlight ? "inbound" : "outbound";
            session.inboundFlight = null;
            session.state.hasInboundFlight = false;
        } else {  //No change, don't submit
            return;
        }
        //Changed, store new data
        for (var property in data) {
            session.search[property] = data[property];
        }
        //Clear selected flight for next page load
        session.search.selectedFlight = null;
        setSessionData(session);
        window.location = "flights.html";
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
