$(function () {
    /***********************************************************************
     *                            Search Form
     ***********************************************************************/
    $("#toId").val("");
    $("#fromId").val("");
  
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
        $("#from").focus();
        $("#to").attr("placeholder", "Destino");
    });

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
    $('#from').on('typeahead:change', function(){
       validateAllFields();
    });

    $('#to').on('typeahead:change', function(){
       validateAllFields();
    });   

    
    
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
            $(".dealCard .card").css("z-index", "-1");  //Forcibly put cards behind calendar
        },
        onClose: function() {
            setTimeout(function() { //Wait a little for the calendar to disappear
                $(".dealCard .card").css("z-index", "");    //Put them back
            }, 500);
        }
    };
    //Define return date picker first, depart datepicker will open return datepicker on set
    var returnDatePicker = $("#returnDate").pickadate(datePickerBaseOpts).pickadate("picker");  //How to access pickadate API with Materialize: http://stackoverflow.com/a/30324855/2333689
    var departureOptions = datePickerBaseOpts;
    departureOptions.onSet = function (arg) {
        if ('select' in arg) {
            var depDate = arg.select.obj || new Date(arg.select);
            var dStr = depDate.getFullYear() + "-" + (depDate.getMonth() + 1 < 10 ? "0" : "") + (depDate.getMonth() + 1) + "-" + (depDate.getDate() < 10 ? "0" : "") + depDate.getDate();
            $("#" + this.get('id') + "Full").val(dStr);
            this.close();
            returnDatePicker.set("min", depDate);       //Set the minimum return date as the same day as departure,
            returnDatePicker.set("highlight", depDate); //Highlight it,
            depDate.setDate(depDate.getDate() + 1);       //And select the next day
            returnDatePicker.set("select", depDate);
//            if (!$("#oneWayTrip").is(":checked")) {      //If NOT on a one-way trip, automatically open the next datepicker
//                setTimeout(function () {
//                    returnDatePicker.open();
//                }, 250);
//            }
        }
    };
    var departureDatePicker = $("#departDate").pickadate(departureOptions).pickadate("picker");


    //Show/hide return date field when un/checking one-way trip
    $("#oneWayTrip").on('change', function () {
        if ($(this).is(":checked")) {
            $("#returnField").fadeOut('fast', function () {
//                $("#departDateContainer").removeClass("s5").addClass("s10");
            });
            $("#returnDate").removeAttr("required");
        } else {
//            $("#departDateContainer").removeClass("s10").addClass("s5");
            $("#returnField").fadeIn('fast');
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
        if ($("#from").val() === "") {
            $("#" + "from" + "Error").html("Ingrese el aeropuerto o ciudad de origen");
            $("#from").removeClass("valid");
            $("#from").addClass("invalid");
            valid = false;
        } else if(!isValidId(data.from.id)){
            $("#" + "from" + "Error").html("Ingrese el nombre de un aeropuerto o ciudad valido");
            $("#from").removeClass("valid");
            $("#from").addClass("invalid");
            valid = false;
        }else{
            $("#from").removeClass("invalid");
            $("#from").addClass("valid");
            $("#" + "from" + "Error").html("");
        }
        //Destination
        if ($("#to").val() === "") {
            $("#" + "to" + "Error").html("Ingrese el aeropuerto o ciudad de destino");
            $("#to").removeClass("valid");
            $("#to").addClass("invalid");
            valid = false;
        } else if(!isValidId(data.to.id)){
            $("#" + "to" + "Error").html("Ingrese el nombre de un aeropuerto o ciudad valido");
            $("#to").removeClass("valid");
            $("#to").addClass("invalid");
            valid = false;
        }else{
            $("#to").removeClass("invalid");
            $("#to").addClass("valid");
            $("#" + "to" + "Error").html("");
        }
        
        if(valid && data.from.id===data.to.id ){
            $("#" + "from" + "Error").html("El lugar de origen y destino no pueden ser el mismo");
            $("#from").removeClass("valid");
            $("#from").addClass("invalid");
            $("#to").removeClass("valid");
            $("#to").addClass("invalid");
            valid = false;
        }else{
            if(valid){
                $("#" + "from" + "Error").html("");
            }
        }
        
        //Departure date
        if ($("#departDate").val() === "") {
            $("#" + "departDate" + "Error").html("Ingrese la fecha de ida");
            $("#departDate").removeClass("valid");
            $("#departDate").addClass("invalid");
            valid = false;
        } else {
            $("#departDate").removeClass("invalid");
            $("#departDate").addClass("valid");
            $("#" + "departDate" + "Error").html("");
        }
        //Return date
        if (!data.oneWayTrip) {
            if ($("#returnDate").val() === "") {
                $("#" + "returnDate" + "Error").html("Ingrese la fecha de vuelta");
                $("#returnDate").removeClass("valid");
                $("#returnDate").addClass("invalid");
                valid = false;
            } else if ($("#departDate").val() !== "" && new Date(data.returnDate.full) < new Date(data.departDate.full)) {
                $("#" + "returnDate" + "Error").html("La fecha de vuelta debe ser mayor a la de ida");
                $("#returnDate").removeClass("valid");
                $("#returnDate").addClass("invalid");
                valid = false;
            } else {
                $("#returnDate").removeClass("invalid");
                $("#returnDate").addClass("valid");
                $("#" + "returnDate" + "Error").html("");
            }
        }
         //Passengers:
        var isPassengersNumbers=true;
        if( !/^([0-9]{0,})$/.test(data.numAdults)){
            $("#" + "numAdults" + "Error").html("Ingrese solo números");
            isPassengersNumbers=false;
            valid = false;
            $("#numAdults").removeClass("valid");
                $("#numAdults").addClass("invalid");
               
        }
        if( !/^([0-9]{0,})$/.test(data.numChildren)){
            $("#" + "numChildren" + "Error").html("Ingrese solo números");
            isPassengersNumbers=false;
            valid = false;
           
                $("#numChildren").removeClass("valid");
                $("#numChildren").addClass("invalid");
               
        }
        if( !/^([0-9]{0,})$/.test(data.numInfants)){
            $("#" + "numInfants" + "Error").html("Ingrese solo números");
            isPassengersNumbers=false;
            valid = false;
           
                $("#numInfants").removeClass("valid");
                $("#numInfants").addClass("invalid");
        }
       
        if(isPassengersNumbers){
            //Passengers: At least one must fly
            if (data.numAdults === 0 && data.numChildren === 0 && data.numInfants === 0) {
                $("#" + "numAdults" + "Error").html("Por favor ingrese al menos un pasajero (minimo un adulto)");
                $("#numAdults").removeClass("valid");
                $("#numAdults").addClass("invalid");
                $("#numChildren").removeClass("valid");
                $("#numChildren").addClass("invalid");
                $("#numInfants").removeClass("valid");
                $("#numInfants").addClass("invalid");
                valid = false;
            }
            //Passengers: Infants and children can't travel without adults
            else if (data.numAdults === 0) {
                $("#" + "numAdults" + "Error").html("No se pueden viajar sin adultos");
                $("#numAdults").removeClass("valid");
                $("#numAdults").addClass("invalid");
                valid = false;
            } else {
                $("#numAdults").removeClass("invalid");
                $("#numAdults").addClass("valid");
                $("#numChildren").removeClass("invalid");
                $("#numChildren").addClass("valid");
                $("#numInfants").removeClass("invalid");
                $("#numInfants").addClass("valid");
                $("#" + "numAdults" + "Error").html("");
            }
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
        clearOutboundFlight();
        clearInboundFlight();
        //Data for next page
        setSessionData(session);
        window.location = "flights.html?from=" + data.from.id + "&to=" + data.to.id + "&dep_date=" + data.departDate.full + "&direction=outbound" + "&adults=" + data.numAdults + "&children=" + data.numChildren + "&infants=" + data.numInfants;
    });

    $("#fromId, #toId, #numAdults, #numChildren, #numInfants, #departDate, #returnDate").change(function(){
        validateAllFields();
    });
    
    

    /***********************************************************************
     *                            Session
     ***********************************************************************/

    //Reset session state
    var session = getSessionData();
    clearOutboundFlight();
    clearInboundFlight();
    setSessionData(session);
    
});


function isValidId(id) {
    var session = getSessionData();
    var cities = session.cities;
    var airports = session.airports;
    for(var i=0; i<airports.length; i++){
        if(airports[i].id==id){
            return true;
        }
    }
    for(var i=0; i<cities.length; i++){
        if(cities[i].id==id){
            return true;
        }
    }
    
    return false;
    
}

function validateAllFields(){
    
        
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
        if ($("#from").val() === "") {
            
        } else if(!isValidId(data.from.id)){
            $("#" + "from" + "Error").html("Ingrese el nombre de un aeropuerto o ciudad valido");
            $("#from").removeClass("valid");
            $("#from").addClass("invalid");
            valid = false;
        }else{
            $("#from").removeClass("invalid");
            $("#from").addClass("valid");
            $("#" + "from" + "Error").html("");
        }
        //Destination
        if ($("#to").val() === "") {
            
        } else if(!isValidId(data.to.id)){
            $("#" + "to" + "Error").html("Ingrese el nombre de un aeropuerto o ciudad valido");
            $("#to").removeClass("valid");
            $("#to").addClass("invalid");
            valid = false;
        }else{
            $("#to").removeClass("invalid");
            $("#to").addClass("valid");
            $("#" + "to" + "Error").html("");
        }
        
        if(valid && data.from.id===data.to.id ){
            $("#" + "from" + "Error").html("El lugar de origen y destino no pueden ser el mismo");
            $("#from").removeClass("valid");
            $("#from").addClass("invalid");
            $("#to").removeClass("valid");
            $("#to").addClass("invalid");
            valid = false;
        }else{
            if(valid){
                $("#" + "from" + "Error").html("");
            }
        }
        
        //Departure date
        if ($("#departDate").val() === "") {
            
        } else {
            $("#departDate").removeClass("invalid");
            $("#departDate").addClass("valid");
            $("#" + "departDate" + "Error").html("");
        }
        //Return date
        if (!data.oneWayTrip) {
            if ($("#returnDate").val() === "") {
               
            } else if ($("#departDate").val() !== "" && new Date(data.returnDate.full) < new Date(data.departDate.full)) {
                $("#" + "returnDate" + "Error").html("La fecha de vuelta debe ser mayor a la de ida");
                $("#returnDate").removeClass("valid");
                $("#returnDate").addClass("invalid");
                valid = false;
            } else {
                $("#returnDate").removeClass("invalid");
                $("#returnDate").addClass("valid");
                $("#" + "returnDate" + "Error").html("");
            }
        }
        //Passengers:
        var isPassengersNumbers=true;
        if( !/^([0-9]{0,})$/.test(data.numAdults)){
            $("#" + "numAdults" + "Error").html("Ingrese solo números");
            isPassengersNumbers=false;
            valid = false;
            $("#numAdults").removeClass("valid");
                $("#numAdults").addClass("invalid");
               
        }
        if( !/^([0-9]{0,})$/.test(data.numChildren)){
            $("#" + "numChildren" + "Error").html("Ingrese solo números");
            isPassengersNumbers=false;
            valid = false;
           
                $("#numChildren").removeClass("valid");
                $("#numChildren").addClass("invalid");
               
        }
        if( !/^([0-9]{0,})$/.test(data.numInfants)){
            $("#" + "numInfants" + "Error").html("Ingrese solo números");
            isPassengersNumbers=false;
            valid = false;
           
                $("#numInfants").removeClass("valid");
                $("#numInfants").addClass("invalid");
        }
       
        if(isPassengersNumbers){
            //Passengers: At least one must fly
            if (data.numAdults === 0 && data.numChildren === 0 && data.numInfants === 0) {
                $("#" + "numAdults" + "Error").html("Por favor ingrese al menos un pasajero (minimo un adulto)");
                $("#numAdults").removeClass("valid");
                $("#numAdults").addClass("invalid");
                $("#numChildren").removeClass("valid");
                $("#numChildren").addClass("invalid");
                $("#numInfants").removeClass("valid");
                $("#numInfants").addClass("invalid");
                valid = false;
            }
            //Passengers: Infants and children can't travel without adults
            else if (data.numAdults === 0) {
                $("#" + "numAdults" + "Error").html("No se pueden viajar sin adultos");
                $("#numAdults").removeClass("valid");
                $("#numAdults").addClass("invalid");
                valid = false;
            } else {
                $("#numAdults").removeClass("invalid");
                $("#numAdults").addClass("valid");
                $("#numChildren").removeClass("invalid");
                $("#numChildren").addClass("valid");
                $("#numInfants").removeClass("invalid");
                $("#numInfants").addClass("valid");
                $("#" + "numAdults" + "Error").html("");
            }
        }
    
}