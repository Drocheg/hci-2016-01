function validateCard(cardNumber, expMonth, expYear, cvv) {
    $.ajax({
        type: "GET",
        url: "http://eiffel.itba.edu.ar/hci/service4/booking.groovy",
        dataType: 'json',
        data: {method: "validatecreditcard", number: cardNumber, exp_date: expMonth+""+expYear, sec_code: cvv}
    })
    .done(function(result) {
        if(/*!error*/true) {    //TODO check API didn't throw error
            if(typeof successCallback !== undefined) {
                successCallback(result);
            }
        }
        else {
            if(typeof errorCallback !== undefined) {
                errorCallback(result);
            }
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown)
    {
        if(typeof failCallback !== undefined) {
            failCallback(jqXHR, textStatus, errorThrown);
        }
        else {
            API.defaultFailHandler(jqXHR, textStatus, errorThrown);
        }
    });
}

function getCardType(number) {
    var len = number.length;
    if(number.charAt(0) === '4' && (len === 13 || len === 16)) {
        return "Visa";
    }
    var firstTwoDigits = number.substr(0, 2);   //TODO use ints
    if((firstTwoDigits === "34" || firstTwoDigits === "37") && len === 15) {
        return "American Express";
    }
    else if(firstTwoDigits === "36" && len === 16) {
        return "Diners";
    }
    else if((firstTwoDigits === "51" || firstTwoDigits === "52" || firstTwoDigits === "53") && len === 16) {
        return "MasterCard";
    }
    else {
        return null;
    }
}

/**
 * Makes sure all the required fields are completed and valid (i.e. don't
 * contain letters in number fields), so the API can validate the info.
 * 
 * @returns {boolean}
 */
function cardCanBeValidated() {
    var num = $("#cardNumber").val(),
        mon = $("#cardExpiryMonth").val(),
        year = $("#cardExpiryYear").val(),
        cvv = $("#cvv").val();
    return 42; //TODO
}


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
    
    $("#cardNumber, #cardExpiryMonth, #cardExpiryYear, #cvv").on("change", function() {
        
    });
});