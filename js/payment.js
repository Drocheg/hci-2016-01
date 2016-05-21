/**
 * Validates the specified credit card information. Puts the result on a hidden
 * input field.
 * 
 * @param {number} cardNumber
 * @param {string} expiry MM/YY
 * @param {number} cvv
 * @param {boolean} async Whether to run the validation asynchronously or not.
 * @returns {undefined}
 */
function validateCard(cardNumber, expiry, cvv, async) {
    var expiryBits = expiry.split("/");
    expiry = (expiryBits[0].length === 1 ? "0"+expiryBits[0] : expiryBits[0]) + (expiryBits[1].length === 1 ? "0"+expiryBits[1] : expiryBits[1]);
    $.ajax({
        type: "GET",
        url: "http://eiffel.itba.edu.ar/hci/service4/booking.groovy",
        dataType: 'json',
        data: {method: "validatecreditcard", number: cardNumber, exp_date: expiry, sec_code: cvv},
        async: async || true
    })
            .done(function (result) {
                var cardMsg = "",
                    expiryMsg = "",
                    cvvMsg = "";
                if(result.error) {
                    switch(result.error.code) { //TODO API sólo devuelve un error, si hay más de una cosa mal no lo va a decir
                        case 6:
                            cardMsg = "Por favor ingrese un número";
                            break;
                        case 7:
                            expiryMsg = "Por favor ingrese una fecha de vencimiento";
                            break;
                        case 8:
                            cvvMsg = "Por favor ingrese un código de seguridad";
                            break;
                        case 106:
                            cardMsg = "Por favor ingrese un número válido";
                            break;
                        case 107:
                            expiryMsg = "Por favor ingrese una fecha válida";
                            break;
                        case 108:
                            cvvMsg = "Por favor ingrese un código válido";
                            break;
//                        case 111:
//                            cvvMsg = "";
//                            break;
                        default:
                            Materialize.toast("Error validando su tarjeta, por favor intente de nuevo.", 5000);
                            console.log(result.error);
                            return;
                    }
                    if(cardMsg) {
                        $("label[for=cardNumber]").attr("data-error", cardMsg);
                        $("#cardNumber").removeClass("valid");
                        $("#cardNumber").addClass("invalid");
                        $("#cardNumberIcon").removeClass("green-text");
                        $("#cardNumberIcon").addClass("red-text");
                    }
                    else {
                        $("#cardNumber").removeClass("invalid");
                        $("#cardNumber").addClass("valid");
                        $("#cardNumberIcon").removeClass("red-text");
                        $("#cardNumberIcon").addClass("green-text");
                    }
                    if(expiryMsg) {
                        $("label[for=cardExpiry]").attr("data-error", expiryMsg);
                        $("#cardExpiry").removeClass("valid");
                        $("#cardExpiry").addClass("invalid");
                        $("#cardExpiryIcon").removeClass("green-text");
                        $("#cardExpiryIcon").addClass("red-text");
                    }
                    else {
                        $("#cardExpiry").removeClass("invalid");
                        $("#cardExpiry").addClass("valid");
                        $("#cardExpiryIcon").removeClass("red-text");
                        $("#cardExpiryIcon").addClass("green-text");
                    }
                    if(cvvMsg) {
                        $("label[for=cvv]").attr("data-error", cvvMsg);
                        $("#cvv").removeClass("valid");
                        $("#cvv").addClass("invalid");
                        $("#cvvIcon").removeClass("green-text");
                        $("#cvvIcon").addClass("red-text");
                    }
                    else {
                        $("#cvv").removeClass("invalid");
                        $("#cvv").addClass("valid");
                        $("#cvvIcon").removeClass("red-text");
                        $("#cvvIcon").addClass("green-text");
                    }
                    $("#isValidCard").val(false);
                }
                else {
                    $("#isValidCard").val(true);
                    $("#cardNumber").removeClass("invalid");
                    $("#cardNumber").addClass("valid");
                    $("#cardExpiry").removeClass("invalid");
                    $("#cardExpiry").addClass("valid");
                    $("#cvv").removeClass("invalid");
                    $("#cvv").addClass("valid");
                    $("#creditCardIcon").removeClass("red-text");
                    $("#creditCardIcon").addClass("green-text");
                    $("#cardExpiryIcon").removeClass("red-text");
                    $("#cardExpiryIcon").addClass("green-text");
                    $("#cvvIcon").removeClass("red-text");
                    $("#cvvIcon").addClass("green-text");
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown)
            {
                Materialize.toast("Connection error, please try again.", 5000);
                console.log("Connection error. Error data:");
                console.log("jqXHR: " + JSON.stringify(jqXHR));
                console.log("Text status: " + textStatus);
                console.log("Error thrown: " + errorThrown);
            });
}

/**
 * Gets the corresponding credit card type form according to the specified
 * credit card number.
 * 
 * @param {number} number The credit card number
 * @returns {String|null} The corresponding name or NULL if no match is found.
 */
function getCardType(number) {
    number = number.toString();
    var len = number.length;
    if (len < 13) {
        return null;
    }
    var firstTwoDigits = number.substr(0, 2);
    if ((firstTwoDigits === "34" || firstTwoDigits === "37") && len === 15) {
        return "American Express";
    } else if (firstTwoDigits === "36" && len === 16) {
        return "Diners";
    } else if ((firstTwoDigits === "51" || firstTwoDigits === "52" || firstTwoDigits === "53") && len === 16) {
        return "MasterCard";
    } else if (number.charAt(0) === '4' && (len === 13 || len === 16)) {
        return "Visa";
    } else {
        return null;
    }
}

/**
 * Makes sure all the required fields are completed (but not necessarily valid),
 * so the API can validate the info.
 * 
 * @returns {boolean}
 */
function cardCanBeValidated() {
    return $("#cardNumber").val() && isValidDate($("#cardExpiry").val()) && isValidCVV($("#cvv").val());
}

/**
 * Validates that a MM/YY formatted date is valid and corresponds to a future
 * date. <b>NOTE:</b> Adds 2000 to YY, i.e. will take 98 as 2098.
 * 
 * @param {string} dateStr
 * @returns {Boolean}
 */
function isValidDate(dateStr) {
    if(dateStr.match(/[0-9]{2}\/[0-9]{2}/) === null) {
        return false;
    }
    var bits = dateStr.split("/");
    var today = new Date();
    var m = (Number)(bits[0]), y = (Number)(bits[1]);
    if(y+2000 === today.getFullYear()) {
        return m >= today.getMonth() && m <= 12;
    }
    else {
        return m >= 1 && m <= 12;
    }
}

function isValidCVV(cvvStr) {
    return cvvStr.match(/[0-9]{3,4}/) !== null;
}


$(function () {
    var session = getSessionData();
    
    //Make sure the user is supposed to be here, if not redirect to home
    if(!session.state.hasPassengers || session.outboundFlight === null || (!session.search.oneWayTrip && session.inboundFlight === null)) {
        window.location = "index.html";
    }
    
    //Try to validate card immediately after typing it
    $("#cardNumber, #cardExpiry, #cvv").on("change", function (event) {
        if (cardCanBeValidated()) {
            validateCard($("#cardNumber").val(), $("#cardExpiry").val(), $("#cvv").val());
        }
    });
    
    //Ensure that, if pattern matches, it's a calid date
    $("#cardExpiry").on("change", function() {
        var $field = $(this);
        if(!isValidDate($field.val())) {
            $("label[for=cardExpiry]").attr("data-error", "Por favor ingrese una fecha válida");
            $field.removeClass("valid");
            $field.addClass("invalid");
        }
        else {
            $field.removeClass("invalid");
            $field.addClass("valid");
        }
//        if($field.val().match(/[0-9]{2}\/[0-9]{2}/) !== null) {
//        }
    });
    
    //Remove invalid class when losing focus, will validate again when submitting
//    $("#payment-form input").on("blur", function(){
//        var id = $(this).attr("id");
//        debugger;
//        $("label[for="+id+"]").removeClass("invalid");
//    });

    //Handle submit
    $("#payment-form").on("submit", function (event) {
        event.preventDefault();
        var $submitBtn = $("#payment-form button[type=submit]");
        $submitBtn.addClass("disabled");
        $submitBtn.html("Validando...");
        var data = {
            cardNumber: Number($("#cardNumber").val()),
            cardExpiry: $("#cardExpiry").val(),
            cardholderFirstName: $("#cardholderFirstName").val(),
            cardholderLastName: $("#cardholderLastName").val(),
            cvv: Number($("#cvv").val()),
            dni: Number($("#dni").val()),
            street: $("#street").val(),
            streetNumber: $("#streetNumber").val(),
            zip: $("#zip").val(),
            email: $("#email").val()
        };
        //Missing info?
        for (var entry in data) {
            if (data.hasOwnProperty(entry)) {
                if (data[entry].length === 0) {
                    Materialize.toast("Por favor complete todos los campos.", 5000);
                    $submitBtn.html("Confirmar >");
                    $submitBtn.removeClass("disabled");
                    return;
                }
            }
        }
        //All data is in, validate credit card if needed
        if($("#isValidCard").val() !== true) {
            validateCard(data.cardNumber, data.cardExpiry, data.cvv, false);    //NOT async
            if(!$("#isValidCard").val()) {
                $submitBtn.html("Confirmar >");
                $submitBtn.removeClass("disabled");
                return;
            }
        }
        //Valid, store
        session.payment = data;
        session.state.hasPayment = true;
        session.state.hasContact = true;
        setSessionData(session);
        //Done, go to next page
        window.location = session.state.hasPassengers ? "order-summary.html" : "passengers-information.html";
    });
    
    var session = getSessionData();
    
    if(session.state.hasPayment){
         $("#cardNumber").val(session.payment.cardNumber);
         $("#cardExpiry").val(session.payment.cardExpiry);
         $("#cardholderFirstName").val(session.payment.cardholderFirstName);
         $("#cardholderLastName").val(session.payment.cardholderLastName);
         $("#cvv").val(session.payment.cvv);
         $("#dni").val(session.payment.dni);
         $("#zip").val(session.payment.zip);
         $("#street").val(session.payment.street);
         $("#streetNumber").val(session.payment.streetNumber);
         $("#email").val(session.payment.email);
    }
    
    $("#backButton").on("click", function(event) {
        event.preventDefault();
        $("#backButton").addClass("disabled");
        window.history.back();  //Will go back to previous search (inbound trip if user searched for round trip, outbound trip if one way trip)
    });
});
