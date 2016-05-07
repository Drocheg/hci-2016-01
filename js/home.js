$(function () {
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
        closeOnSelect: true
    };
    $('.datepicker').pickadate(datePickerOptions);
//    $('#returnDate').pickadate(datePickerOptions);
//    $('#departDate').pickadate(datePickerOptions);

    //Hide/show return date picker when clicking one-way only
    //http://stackoverflow.com/a/7031408
    $("#isOneWayTrip").on('change', function () {
        if ($(this).is(":checked")) {
            $("#returnDate").fadeOut();
            $("#returnDate").removeAttr("required");
            $("label[for=returnDate]").fadeOut();
        }
        else {
            $("#returnDate").fadeIn();
            $("label[for=returnDate]").fadeIn();
            $("#returnDate").attr("required", "required");
        }
    });
    
    //Handle flight search form submit
    $("#flightSearchForm").on("submit", function(event) {
        event.preventDefault();
        var data = {
            from: $("#from").val(),
            to: $("#to").val(),
            departDate: new Date($("input[name=departDate_submit]").val()),
            isOneWayTrip: $("#isOneWayTrip").is(":checked"),
            returnDate: $("#isOneWayTrip").is(":checked") ? new Date($("input[name=returnDate_submit]").val()) : null,
            numAdults: Number($("#numAdults").val()),
            numChildren: Number($("#numChildren").val()),
            numInfants: Number($("#numInfants").val())
        };
        //TODO validar info e ir a flights.html con estos parametros en texto, la página rellenará el formulario automáticamente
        //Y hará la búsqueda por API
        sessionStorage.dataz = JSON.stringify(data);
//        sessionStorage.dataz = data;
        console.log(JSON.parse(sessionStorage.dataz));
        window.location = "flys-1.html";
    });
});