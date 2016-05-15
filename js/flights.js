$(function() {
    $(document).ready(function() {
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
    
    //Autofill form
    var session = getSessionData();
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
    
    $("#searchButton").on("click", function(event) {
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
        if (data.numAdults === 0 && data.numChildren === 0 && data.numInfants === 0) {
            Materialize.toast("Tiene que ingresar al menos un pasajero.", 5000);    //No se puede validar antes, sólo se puede validar de que los 3 tengan como mínimo 0 con HTML
            return;
        }
        //Valid, store data and go to next page
        setSessionData(session);
        window.location = "flights.html"; //Como hago para recargar la pagina sino?
    });
});