$(function () {
    /***********************************************************************
     *                            Search Form
     ***********************************************************************/

//Autocomplete (typeahead.js)
    var autocomplete = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: 'http://eiffel.itba.edu.ar/hci/service4/geo.groovy?method=getcitiesandairportsbyname&name=%QUERY',
            wildcard: '%QUERY',
            transform: function (response) {
                if (response.error) {
                    console.log("Autocomplete error: " + JSON.stringify(response.error)); //TODO shouldn't happen
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
    minDate.setDate(minDate.getDate() + 3); //Minimum date is 3 days from now
    $('.datepicker').pickadate({
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
                $("#" + this.get('id') + "Full").val(d2);
                this.close();
            }
        }
    });
    //Show/hide return date field when un/checking one-way trip
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
    //Handle form submit
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
        if (!data.oneWayTrip) {
            if (data.returnDate.full === "") {
                $("label[for=returnDate]").attr("data-error", "Por favor ingrese una fecha de vuelta válida");
                $("#returnDate").removeClass("valid");
                $("#returnDate").addClass("invalid");
                valid = false;
            }
            else if (!data.oneWayTrip && new Date(data.returnDate.full) < new Date(data.departDate.full)) {
                $("label[for=returnDate]").attr("data-error", "Todavía no ofrecemos viajes en el tiempo"); //TODO use serious message
                $("#returnDate").removeClass("valid");
                $("#returnDate").addClass("invalid");
                valid = false;
            }
            else {
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
        }
        else {
            $("#numAdults").removeClass("invalid");
            $("#numAdults").addClass("valid");
        }
        
        if (!valid) {
            return;
        }
        
        //Valid, store data and go to flight search
        var session = getSessionData();
        for (var property in data) {
            session.search[property] = data[property];
        }
        //Reset other fields in case user is coming back from a previous search
        session.search.selectedFlight = null;
        session.outboundFlight = null;
        session.inboundFlight = null;
        session.state.hasOutboundFlight = false;
        session.state.hasInboundFlight = false;
        session.payment.total = 0;
        //Data for next page
        session.search.direction = "outbound";
        setSessionData(session);
        window.location = "flights.html";
    });
    /***********************************************************************
     *                            Deals
     ***********************************************************************/
});
