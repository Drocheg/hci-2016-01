$(function() {
    $("#payment-form").on("submit", function(event) {
        event.preventDefault();
        var data = {
            cardNumber: $("#cardNumber").val(),
            cardExpiryMonth: $("#cardExpiryMonth").val(),
            cardExpiryYear: $("#cardExpiryYear").val(),
            cardholderName: $("#cardholderName").val(),
            cvv: $("#cvv").val(),
            dni: $("#dni").val(),
            email: $("#email").val()
        };
        //Validate
        for(var entry in data) {
            if(data.hasOwnProperty(entry)) {
                if(!data[entry]) {  //Empty or invalid value
                    Materialize.toast("Por favor complete todos los campos.", 5000);
                    return;
                }
            }
        }
        if(data.dni.toString().length != 8){  //Me pide que sea !==, que onda?
            Materialize.toast("Numero de DNI invalido, compruebe la longitud del mismo", 5000); //Copypasta de lo de juan. Esto no deberia pasar antes? Esta bien la validacion esta aca?
            return;
        }
        //All data is in, validate special fields
        //TODO validate credit card
        //TODO validate CVV
        //Valid, store
        var session = JSON.parse(sessionStorage.sessionData);   //will return UNDEFINED if it doesn't exist yet
        session.payment = data;
        sessionStorage.sessionData = JSON.stringify(session);
    });
});