$(function () {


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

//    //Handle flight search form submit
//    $("#flightSearchForm").on("submit", function (event) {
//        event.preventDefault();
//        var data = {
//            from: $("#from").val(),
//            to: $("#to").val(),
//            departDate: $("input[name=departDate_submit]").val(),
//            oneWayTrip: $("#oneWayTrip").is(":checked"),
//            returnDate: $("#oneWayTrip").is(":checked") ? $("input[name=returnDate_submit]").val() : null,
//            numAdults: Number($("#numAdults").val()),
//            numChildren: Number($("#numChildren").val()),
//            numInfants: Number($("#numInfants").val())
//        };
//        
//        var session = getSessionData();
//        session.search.from = data.from;
//        session.search.to = data.to;
//        session.search.oneWayTrip = data.oneWayTrip;
//        session.search.depart = data.departDate;
//        session.search.return = data.returnDate;
//        session.search.direction = "outbound";
//        if (!data.oneWayTrip && new Date(data.returnDate) < new Date(data.departDate) ) {
//            Materialize.toast("Fecha vuelta deberia ser inferior a fecha ida.", 5000); //El calendario no debería permitirlo pero por las dudas
//            return;
//        }
//
//        session.search.adults = data.numAdults;
//        session.search.children = data.numChildren;
//        session.search.infants = data.numInfants;
//        //Tampoco se deberia poder que sean negativos
//           
//        if(data.numInfants > 0 && data.numAdults === 0){
//             Materialize.toast("Los infantes no pueden viajar sin adultos.", 5000);
//             return;
//        }
//        
//        if (data.numAdults === 0 && data.numChildren === 0 && data.numInfants === 0) {
//            Materialize.toast("Tiene que ingresar al menos un pasajero.", 5000);    //No se puede validar antes, sólo se puede validar de que los 3 tengan como mínimo 0 con HTML
//            return;
//        }
//     
//        
//        
//        //Valid, store data and go to next page
//        setSessionData(session);
//        window.location = "flights.html";
//    });
});
