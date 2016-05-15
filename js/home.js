$(function () {
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
            if('select' in arg) { //prevent closing on selecting month/year
                this.close();
            }
        }
    };
    $('.datepicker').pickadate(datePickerOptions);
//    $('#returnDate').pickadate(datePickerOptions);
//    $('#departDate').pickadate(datePickerOptions);

    //Hide/show return date picker when clicking one-way only
    //http://stackoverflow.com/a/7031408
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


    /* *************************************************************************
     *                      Suggestion boxes
     * ************************************************************************/
    //Hide boxes when to/from fields lose focus, and bring them back when
    //regaining focus
    $("#from").on("blur", function () {
        $("#fromSuggestions").hide();
    });
    $("#from").on("focus", function () {
        $("#fromSuggestions").show();
    });
    $("#to").on("blur", function () {
        $("#toSuggestions").hide();
    });
    $("#to").on("focus", function () {
        $("#toSuggestions").show();
    });
    //Update to/from fields when selecting an option
    //Why use mousedown and not click: http://stackoverflow.com/a/9335401/2333689
    //Why use 2nd parameter for on instead of putting selector directly: http://stackoverflow.com/a/15090957/2333689
    $("#fromSuggestions").on('mousedown', 'ul li', function (event) {
        $("#from").val($(this).data("value"));
        $("#fromSuggestions").hide();
        $("#from").trigger("input");    //Update angular's model watching this input field
    });
    $("#toSuggestions").on('mousedown', 'ul li', function (event) {
        $("#to").val($(this).data("value"));
        $("#toSuggestions").hide();
        $("#to").trigger("input");
    });

    //Handle flight search form submit
    $("#flightSearchForm").on("submit", function (event) {
        event.preventDefault();
        var data = {
            from: $("#from").val(),
            to: $("#to").val(),
            departDate: $("input[name=departDate_submit]").val(),
            oneWayTrip: $("#oneWayTrip").is(":checked"),
            returnDate: $("#oneWayTrip").is(":checked") ? $("input[name=returnDate_submit]").val() : null,
            numAdults: Number($("#numAdults").val()),
            numChildren: Number($("#numChildren").val()),
            numInfants: Number($("#numInfants").val())
        };
        
        var session = {};
        session.search = {};
        session.flights = {};
        session.preferences = {};
        session.search.from = data.from;
        session.search.to = data.to;
        session.search.oneWayTrip = data.oneWayTrip;
        session.search.depart = data.departDate;
        session.search.return = data.returnDate;
        if (!data.oneWayTrip && new Date(data.returnDate) < new Date(data.departDate) ) {
            Materialize.toast("Fecha vuelta deberia ser inferior a fecha ida.", 5000); //El calendario no debería permitirlo pero por las dudas
            return;
        }

        session.search.adults = data.numAdults;
        session.search.children = data.numChildren;
        session.search.infants = data.numInfants;
        //Tampoco se deberia poder que sean negativos
           
        if(data.numInfants > 0 && data.numAdults === 0){
             Materialize.toast("Los infantes no pueden viajar sin adultos.", 5000);
             return;
        }
        
        if (data.numAdults === 0 && data.numChildren === 0 && data.numInfants === 0) {
            Materialize.toast("Tiene que ingresar al menos un pasajero.", 5000);    //No se puede validar antes, sólo se puede validar de que los 3 tengan como mínimo 0 con HTML
            return;
        }
     
        
        
        //Valid, store data and go to next page
        setSessionData(session);
        window.location = "flights.html";
    });
});
