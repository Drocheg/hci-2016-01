$(function() {  //Document.ready
    //Enable the side navigation bar
    $('.button-collapse').sideNav();
    //Start the slider
    $('.slider').slider({
        full_width: true,
        height:600});
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