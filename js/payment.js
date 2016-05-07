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
        //All data is in, validate special fields
        //TODO validate credit card
        //TODO validate CVV
        //Valid, store
        sessionStorage.paymentInfo = JSON.stringify(data);
    });
});