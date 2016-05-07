$(function() {  //Document.ready
    //Enable the side navigation bar
    $('.button-collapse').sideNav();
    //Initialize select drop-downs, if any
    $('select').material_select();
    //Initialize RETURN date picker
    $('#return').pickadate({
        min: new Date(),    //Can't travel in the past =(
        selectMonths: true, //Creates a dropdown to control month
        selectYears: 2      //Creates a dropdown of 2 years to control year
      });
    //Initialize DEPART date picker
    $('#depart').pickadate({
        min: new Date(),    //Can't travel in the past =(
        selectMonths: true, //Creates a dropdown to control month
        selectYears: 2,      //Creates a dropdown of 2 years to control year
        //Spanish translation https://github.com/amsul/pickadate.js/blob/3.5.6/lib/translations/es_ES.js
        monthsFull: [ 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre' ],
        monthsShort: [ 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic' ],
        weekdaysFull: [ 'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado' ],
        weekdaysShort: [ 'dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb' ],
        today: 'hoy',
        clear: 'borrar',
        close: 'cerrar',
        firstDay: 1,
        format: 'dddd d !de mmmm !de yyyy',
        formatSubmit: 'yyyy/mm/dd',
        //When picking a date, close this selector and open the second one with the same date as minimum
        onSet: function() {
            console.log("Chose depart date: "+this.get('select', 'yyyy-mm-dd'));
            this.close();   //Close current selector
            //TODO hacer que el selector de regreso se abra automaticamente con fecha minima seleccionada
//            //Re-initialize the return date picker with the new parameters
//            $('#return').pickadate({
//                min: new Date(this.get('select', 'yyyy-mm-dd')),
//                selectMonths: true, //Creates a dropdown to control month
//                selectYears: 2      //Creates a dropdown of 2 years to control year
//              });
            
//            returnDate.set({min: this.get('value')}); //Set min date for the return trip
//            returnDate.open();    //Open the return selector
        }
      });
});