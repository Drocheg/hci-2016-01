/**
 * Updates the outgoing/incoming boxes on the flights page to show info of the
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
    html += '<div class="col s2 center"><p style="line-height: 35px;"><b>' + toSelectedCurrency(getFlightTotal(flight)) + '</b></p></div>';
    html += '</div>';
    $("#" + id).html(html);
    //Update total (angular isn't picking up the changes)
    $("#total").html(toSelectedCurrency(getSessionData().payment.total));
}

/**
 * Gets the next page the user should visit, given they are on the flights page,
 * based on their current state.
 * 
 * @returns {string} The next page; flights, passenger info, payment or order
 * summary.
 */
function nextPage() {
    var session = getSessionData();
    var nextPage = "index.html";        //Fall back to home if nothing is chosen
    if (!session.search.oneWayTrip && session.inboundFlight === null) {
        nextPage = "flights.html?from=" + session.search.to.id + "&to=" + session.search.from.id + "&dep_date=" + session.search.returnDate.full + "&direction=inbound" + "&adults=" + session.search.numAdults + "&children=" + session.search.numChildren + "&infants=" + session.search.numInfants;
    } else {
        nextPage = session.state.hasPassengers ? (session.state.hasPayment ? "order-summary.html" : "payment.html") : "passengers-information.html";
    }
    return nextPage;
}

$(function () {
   //Validate GET parameters
   var requiredParams = ['from', 'to', 'dep_date', 'adults', 'children', 'infants'];
   for(var index in requiredParams) {
       if(getGETparam(requiredParams[index]) === null) {        //Redirect users to home on invalid parameters
           window.location = "index.html";
       }
   }

    if(getGETparam("direction") === "outbound") {       //If there's a flight already selected for this direction, clear it
        clearOutboundFlight();
        clearInboundFlight();
    }
    else if(getGETparam("direction") === "inbound") {
        clearInboundFlight();   //TODO redundant, clear inbound flight either case
    }

    var session = getSessionData();
    
    //Mark current total
    $("#total").html(toSelectedCurrency(session.payment.total));

    //Mark any selected flights
    markSelectedFlight(session.outboundFlight, 'outbound');
    markSelectedFlight(session.inboundFlight, 'inbound');


    //Autocomplete (typeahead.js), cities and airports need to be loaded first
    $.when(citiesPromise, airportsPromise).then(function () {
        var airports = new Bloodhound({
            datumTokenizer: function (datum) {
                return Bloodhound.tokenizers.whitespace(datum.full);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: getSessionData().airports.map(function (entry) {
                return {id: entry.id,
                    full: entry.description + " (" + entry.id + ")"};
            })
        });
        airports.initialize();

        var cities = new Bloodhound({
            datumTokenizer: function (datum) {
                return Bloodhound.tokenizers.whitespace(datum.full);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: getSessionData().cities.map(function (entry) {
                return {id: entry.id,
                    full: entry.name + " (" + entry.id + ")"};
            })
        });
        cities.initialize();


        $('#from, #to').typeahead(
                {
//                    minLength: 2,
                    highlight: true,
                    templates: {
                        notFound: '<div>Sin resultados</div>'
                    }
                },
                {
                    name: 'Aeropuertos',
                    source: airports.ttAdapter(),
                    displayKey: 'full',
                    limit: 5,
                    templates: {
                        header: '<p class="center dataset-title">Aeropuertos <i class="material-icons">airplanemode_active</i></p><div class="divider"></div>'
                    }
                },
                {
                    name: 'Ciudades',
                    source: cities.ttAdapter(),
                    displayKey: 'full',
                    limit: 5,
                    templates: {
                        header: '<div class="divider"></div><p class="center dataset-title">Ciudades <i class="material-icons">location_city</i></p><div class="divider"></div>'
                    }
                }
        );

        $('#from, #to').removeAttr("disabled");
        $("#from").attr("placeholder", "Origen");
        $("#to").attr("placeholder", "Destino");
    });

    //Validate entered destinations
    $('#from').on("change", function () {
        $("#fromId").val("");
    });
    $('#from').bind('typeahead:select', function (ev, suggestion) {
        $("#fromId").val(suggestion.id);
    });

    $('#to').bind('typeahead:select', function (ev, suggestion) {
        $("#toId").val(suggestion.id);
    });
    $('#to').on("change", function () {
        $("#fromId").val("");
    });

    //TODO FIXME datepickers don't pick up a date if selected with keyboard, fix or disable

    //Datepickers
    var minDate = new Date();
    minDate.setDate(minDate.getDate() + 3); //Minimum date is 3 days from now
    var datePickerBaseOpts = {
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
                var d = arg.select.obj || new Date(arg.select);
                var d2 = d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" : "") + d.getDate();
                $("#" + this.get('id') + "Full").val(d2);
                this.close();
            }
        },
        onOpen: function() {
            $("#fixedTopSection").css("z-index", "-1");     //Forcibly put cards behind calendar
            $(".flightCard").css("z-index", "-2");          //Forcibly put cards behind calendar
        },
        onClose: function() {
            setTimeout(function() { //Wait for the calendar's black cover to fade out
                $("#fixedTopSection").css("z-index", "");
                $(".flightCard").css("z-index", "");
            }, 500);
        }
    };
    //Define return date picker first, depart datepicker will open return datepicker on set
    var returnDatePicker = $("#returnDate").pickadate(datePickerBaseOpts).pickadate("picker");  //How to access pickadate API with Materialize: http://stackoverflow.com/a/30324855/2333689
//    returnDatePicker.set("select", new Date(session.search.returnDate.full));
//    returnDatePicker.close();
    
    
    var departOptions = datePickerBaseOpts;
    departOptions.onSet = function(arg) {
        if ('select' in arg) {
                var depDate = arg.select.obj || new Date(arg.select);
                var dStr = depDate.getFullYear() + "-" + (depDate.getMonth() + 1 < 10 ? "0" : "") + (depDate.getMonth() + 1) + "-" + (depDate.getDate() < 10 ? "0" : "") + depDate.getDate();
                $("#" + this.get('id') + "Full").val(dStr);
                this.close();
                returnDatePicker.set("min", depDate);       //Set the minimum return date as the same day as departure,
                returnDatePicker.set("highlight", depDate); //Highlight it,
                depDate.setDate(depDate.getDate()+1);       //And select the next day
                returnDatePicker.set("select", depDate);
//                if(!$("#oneWayTrip").is(":checked")) {      //If NOT on a one-way trip, automatically open the next datepicker
//                    setTimeout(function() {
//                        returnDatePicker.open();
//                    }, 250);
//                }
            }
    };
    var departDatePicker = $("#departDate").pickadate(departOptions).pickadate("picker");
//    departDatePicker.set("select", new Date(session.search.departDate.full));
//    departDatePicker.close();


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
       
        var nextPage = "index.html";
        if (placesChanged || passengersChanged || departDateChanged) {  //Destinations, passengers or departure date changed, reset everything
            clearOutboundFlight();
            clearInboundFlight();
            if(passengersChanged) {
                session.state.hasPassengers = false;
            }
            nextPage = "flights.html?from=" + data.from.id + "&to=" + data.to.id + "&dep_date=" + data.departDate.full + "&direction=outbound" + "&adults=" + data.numAdults + "&children=" + data.numChildren + "&infants=" + data.numInfants;
        }
        else if (returnDateChanged) {       //Inbound trip changed, change only inbound trip
            clearInboundFlight();
            nextPage = "flights.html?from=" + data.to.id + "&to=" + data.from.id + "&dep_date=" + data.returnDate.full + "&direction=inbound" + "&adults=" + data.numAdults + "&children=" + data.numChildren + "&infants=" + data.numInfants;
            //TODO if return date is prior to arrival date, change outbound. Or should we just reset everything?            
        } else {  //No change, don't submit
            return;
        }

        for (var property in data) {                    //Changed, store new data
            session.search[property] = data[property];
        }
        setSessionData(session);
        window.location = nextPage;
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
        //TODO NOW handle changes (i.e. if came back from order summary and changed outbound, must choose inbound again)
        window.location = nextPage();
    });
});