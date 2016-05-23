function resetInstallmentsSelector(message) {
    $("#installments").html('<option value="" disabled  selected>'+(message || "Ingrese tarjeta")+'</option>');
    $("#installments").attr('disabled', 'disabled');
    $("#installments").material_select();
}

/**
 * Validates the specified credit card information. Puts the result on a hidden
 * input field.
 * 
 * @param {number} cardNumber
 * @param {string} expiry MM/YY
 * @param {number} cvv
 * @returns {undefined}
 */
function validateCard(cardNumber, expiry, cvv) {
    var expiryBits = expiry.split("/");
    expiry = (expiryBits[0].length === 1 ? "0" + expiryBits[0] : expiryBits[0]) + (expiryBits[1].length === 1 ? "0" + expiryBits[1] : expiryBits[1]);
    resetInstallmentsSelector("Consiguiendo cuotas...");
    APIrequest(
            "booking",
            {method: "validatecreditcard", number: cardNumber, exp_date: expiry, sec_code: cvv},
            function () {
                $("#isValidCard").val(true);
                $("#cardNumber").removeClass("invalid");
                $("#cardNumber").addClass("valid");
                $("#cardExpiry").removeClass("invalid");
                $("#cardExpiry").addClass("valid");
                $("#cvv").removeClass("invalid");
                $("#cvv").addClass("valid");
//                $("#creditCardIcon").removeClass("red-text");
//                $("#creditCardIcon").addClass("green-text");
//                $("#cardExpiryIcon").removeClass("red-text");
//                $("#cardExpiryIcon").addClass("green-text");
//                $("#cvvIcon").removeClass("red-text");
//                $("#cvvIcon").addClass("green-text");
                getInstallments(cardNumber, "#installments");
            },
            function (errResult) {
                var cardMsg = "",
                        expiryMsg = "",
                        cvvMsg = "";
                switch (errResult.error.code) {
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
                    default:
                        Materialize.toast("Error validando su tarjeta, por favor intente de nuevo.", 5000);
                        console.log(errResult.error);
                        return;
                }
                if (cardMsg) {
                    $("label[for=cardNumber]").attr("data-error", cardMsg);
                    $("#cardNumber").removeClass("valid");
                    $("#cardNumber").addClass("invalid");
                    $("#cardNumberIcon").removeClass("green-text");
                    $("#cardNumberIcon").addClass("red-text");
                } else {
                    $("#cardNumber").removeClass("invalid");
                    $("#cardNumber").addClass("valid");
                    $("#cardNumberIcon").removeClass("red-text");
                    $("#cardNumberIcon").addClass("green-text");
                }
                if (expiryMsg) {
                    $("label[for=cardExpiry]").attr("data-error", expiryMsg);
                    $("#cardExpiry").removeClass("valid");
                    $("#cardExpiry").addClass("invalid");
                    $("#cardExpiryIcon").removeClass("green-text");
                    $("#cardExpiryIcon").addClass("red-text");
                } else {
                    $("#cardExpiry").removeClass("invalid");
                    $("#cardExpiry").addClass("valid");
                    $("#cardExpiryIcon").removeClass("red-text");
                    $("#cardExpiryIcon").addClass("green-text");
                }
                if (cvvMsg) {
                    $("label[for=cvv]").attr("data-error", cvvMsg);
                    $("#cvv").removeClass("valid");
                    $("#cvv").addClass("invalid");
                    $("#cvvIcon").removeClass("green-text");
                    $("#cvvIcon").addClass("red-text");
                } else {
                    $("#cvv").removeClass("invalid");
                    $("#cvv").addClass("valid");
                    $("#cvvIcon").removeClass("red-text");
                    $("#cvvIcon").addClass("green-text");
                }
                resetInstallmentsSelector("Introduzca tarjeta");
                $("#isValidCard").val(false);
            });
}


function getInstallments(creditCardNumber, destSelector) {
    var session = getSessionData();
    var params = {
        method: "getinstallments",
        flight_id: getFlightId(session.outboundFlight),
        adults: session.search.numAdults,
        children: session.search.numChildren,
        infants: session.search.numInfants,
        number: creditCardNumber
    };
    APIrequest(
            "booking",
            params,
            function (response) {
                var session = getSessionData();
                session.payment.availableInstallments = response;
                setSessionData(session);
                var html = "";
                $(response.installments).each(function (index, value) {
                    html += "<option value='" + index + "'>" + value.quantity + "</option>";
                });
                $(destSelector).html(html);
                $(destSelector).removeAttr("disabled");
                $(destSelector).material_select();
            },
            function (error) {
                Materialize.toast("API error: " + JSON.stringify(error));   //TODO shouldn't happen
            }
    );
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
    if (dateStr.match(/[0-9]{2}\/[0-9]{2}/) === null) {
        return false;
    }
    var bits = dateStr.split("/");
    var today = new Date();
    var m = (Number)(bits[0]), y = (Number)(bits[1]);
    if (y + 2000 === today.getFullYear()) {
        return m >= today.getMonth() && m <= 12;
    } else {
        return m >= 1 && m <= 12;
    }
}

function isValidCVV(cvvStr) {
    return cvvStr.match(/[0-9]{3,4}/) !== null;
}

function isEmpty(information, id) {
    if (information === "" || information === null) {
//            $("label[for="+id+"]").attr("data-error", "Por favor ingrese solo caracters validos");
        $("#" + id + "").removeClass("valid");
        $("#" + id + "").addClass("invalid");
        return true;
    } else {
        $("#" + id + "").removeClass("invalid");
        $("#" + id + "").addClass("valid");
        return false;
    }
}

$(function () {
    var session = getSessionData();

    //Make sure the user is supposed to be here, if not redirect to home
    if (!session.state.hasPassengers || session.outboundFlight === null || (!session.search.oneWayTrip && session.inboundFlight === null)) {
        window.location = "index.html";
    }
    
    //Autofill data
//    if (session.state.hasPayment) {
//        $("#cardNumber").val(session.payment.cardNumber);
//        $("#cardExpiry").val(session.payment.cardExpiry);
        $("#cardholderFirstName").val(session.payment.cardholderFirstName);
        $("#cardholderLastName").val(session.payment.cardholderLastName);
//        $("#cvv").val(session.payment.cvv);
        $("#id").val(session.payment.id);
        $("#zip").val(session.payment.zip);
        $("#street").val(session.payment.street);
        $("#streetNumber").val(session.payment.streetNumber);
//        $("#installments").val(session.payment.installments);
        $("#state").val(session.payment.state);
        $("#phone").val(session.payment.phone);
        $("#addressFloor").val(session.payment.addressFloor);
        $("#addressApartment").val(session.payment.addressApartment);
        $("#email").val(session.payment.email);
//    }

    //Try to validate card immediately after typing it
    $("#cardNumber, #cardExpiry, #cvv").on("change", function (event) {
        if (cardCanBeValidated()) {
            validateCard($("#cardNumber").val(), $("#cardExpiry").val(), $("#cvv").val());
        }
    });

    //Ensure that, if pattern matches, it's a calid date
    $("#cardExpiry").on("change", function () {
        var $field = $(this);
        if (!isValidDate($field.val())) {
            $("label[for=cardExpiry]").attr("data-error", "Por favor ingrese una fecha valida");
            $field.removeClass("valid");
            $field.addClass("invalid");
        } else {
            $field.removeClass("invalid");
            $field.addClass("valid");
        }
//        if($field.val().match(/[0-9]{2}\/[0-9]{2}/) !== null) {
//        }
    });

      $("#payment-form>div>div>input").change(function(){
        validateAllFields();
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
        var session = getSessionData();
        
        var $submitBtn = $("#payment-form button[type=submit]");
        $submitBtn.addClass("disabled");
        $submitBtn.html("Validando...");
        
        var data = {
            cardNumber: Number($("#cardNumber").val()),
            cardExpiry: $("#cardExpiry").val(),
            cardholderFirstName: $("#cardholderFirstName").val(),
            cardholderLastName: $("#cardholderLastName").val(),
            cvv: Number($("#cvv").val()),
            id: Number($("#id").val()),
            street: $("#street").val(),
            streetNumber: $("#streetNumber").val(),
            state: $("#state").val(),
            phone: $("#phone").val(),
            addressFloor: $("#addressFloor").val(),
            addressApartment: $("#addressApartment").val(),
            zip: $("#zip").val(),
            email: $("#email").val()
        };
        //Missing info?
        var valid = true;
        if (data.cardNumber === "" || data.cardNumber === null) {
            $("label[for="+"cardNumber"+"]").attr("data-error", "Ingrese el numero de la tarjeta");
            $("#" + "cardNumber" + "").removeClass("valid");
            $("#" + "cardNumber" + "").addClass("invalid");
            valid = false;
        }else if (!/^([0-9]{13,16})$/.test(data.cardNumber)) {
            $("label[for=cardNumber]").attr("data-error", "Ingrese la tarjeta con solo numeros");
            $("#cardNumber").removeClass("valid");
            $("#cardNumber").addClass("invalid");
            valid = false;
        } else {
            $("#" + "cardNumber" + "").removeClass("invalid");
            $("#" + "cardNumber" + "").addClass("valid");
        }
        
        if (data.cardExpiry === "" || data.cardExpiry === null) {
            $("label[for="+"cardExpiry"+"]").attr("data-error", "Ingrese la fecha de vencimiento");
            $("#" + "cardExpiry" + "").removeClass("valid");
            $("#" + "cardExpiry" + "").addClass("invalid");
            valid = false;
        }else if (!/^([0-9]{2}\/[0-9]{2})$/.test(data.cardExpiry)) {
            $("label[for=cardExpiry]").attr("data-error", "Ingrese la fecha con el formato MM/AA");
            $("#cardExpiry").removeClass("valid");
            $("#cardExpiry").addClass("invalid");
            valid = false;
        } else {
            $("#" + "cardExpiry" + "").removeClass("invalid");
            $("#" + "cardExpiry" + "").addClass("valid");
        }
        
        if ($("#cvv").val()=== "" || $("#cvv").val() === null) {
            $("label[for="+"cvv"+"]").attr("data-error", "Ingrese el codigo de seguridad");
            $("#" + "cvv" + "").removeClass("valid");
            $("#" + "cvv" + "").addClass("invalid");
            valid = false;
        }else if (!/^([0-9]{3,4})$/.test(data.cvv)) {
            $("label[for=cvv]").attr("data-error", "Ingrese 3 o 4 numeros para el codigo de seguridad");
            $("#cvv").removeClass("valid");
            $("#cvv").addClass("invalid");
            valid = false;
        } else {
            $("#" + "cvv" + "").removeClass("invalid");
            $("#" + "cvv" + "").addClass("valid");
        }
        
        //All data is in, validate credit card if needed
        if (valid) {
            if ($("#isValidCard").val() !== "true") {
                validateCard(data.cardNumber, data.cardExpiry, data.cvv, false);    //NOT async
                if (!$("#isValidCard").val()) {
                    $submitBtn.html("Confirmar >");
                    $submitBtn.removeClass("disabled");
                    valid = false;
                }
            }
        }

        

        var id = "";
        if (data.cardholderFirstName === "" || data.cardholderFirstName === null) {
            $("label[for="+"cardholderFirstName"+"]").attr("data-error", "Ingrese el nombre del titular");
            $("#" + "cardholderFirstName" + "").removeClass("valid");
            $("#" + "cardholderFirstName" + "").addClass("invalid");
            valid = false;
        }else if (!/^([A-zÀ-ÿ ]{1,})$/.test(data.cardholderFirstName)) {
            $("label[for=cardholderFirstName]").attr("data-error", "Ingrese el nombre sin usar numeros ni caracteres especiales");
            $("#cardholderFirstName").removeClass("valid");
            $("#cardholderFirstName").addClass("invalid");
            valid = false;
        } else {
            $("#" + "cardholderFirstName" + "").removeClass("invalid");
            $("#" + "cardholderFirstName" + "").addClass("valid");
        }
        
        if (data.cardholderLastName === "" || data.cardholderLastName === null) {
            $("label[for="+"cardholderLastName"+"]").attr("data-error", "Ingrese el apellido del titular");
            $("#" + "cardholderLastName" + "").removeClass("valid");
            $("#" + "cardholderLastName" + "").addClass("invalid");
            valid = false;
        }else if (!/^([A-zÀ-ÿ ]{1,})$/.test(data.cardholderLastName)) {
            $("label[for=cardholderLastName]").attr("data-error", "Ingrese el apellido sin usar numeros ni caracteres especiales");
            $("#cardholderLastName").removeClass("valid");
            $("#cardholderLastName").addClass("invalid");
            valid = false;
        } else {
            $("#" + "cardholderLastName" + "").removeClass("invalid");
            $("#" + "cardholderLastName" + "").addClass("valid");
        }
        
       
        if ($("#id").val() === "" || $("#id").val() === null) {
            $("label[for="+"id"+"]").attr("data-error", "Ingrese el documento del titular");
            $("#" + "id" + "").removeClass("valid");
            $("#" + "id" + "").addClass("invalid");
            valid = false;
        }else if (!/^([0-9]{1,8})$/.test(data.id)) {
            $("label[for=id]").attr("data-error", "Ingrese el documento compuesto por 1 a 8 numeros");
            $("#id").removeClass("valid");
            $("#id").addClass("invalid");
            valid = false;
        } else {
            $("#" + "id" + "").removeClass("invalid");
            $("#" + "id" + "").addClass("valid");
        }
        
        var id = "";
        
        id = "street";
        if (data.street === "" || data.street === null) {
            $("label[for="+id+"]").attr("data-error", "Ingrese la calle del titular");
            $("#" + id + "").removeClass("valid");
            $("#" + id + "").addClass("invalid");
            valid = false;
        }else if (!/^([0-9A-zÀ-ÿ ]{1,})$/.test(data.street)) {
            $("label[for="+id+"]").attr("data-error", "Ingrese la calle sin usar caracteres especiales");
            $("#"+id+"").removeClass("valid");
            $("#"+id+"").addClass("invalid");
            valid = false;
        } else {
            $("#" + ""+id+"" + "").removeClass("invalid");
            $("#" + ""+id+"" + "").addClass("valid");
        }
        
        id = "zip";
        if (data.zip === "" || data.zip === null) {
            $("label[for="+id+"]").attr("data-error", "Ingrese el codigo postal");
            $("#" + id + "").removeClass("valid");
            $("#" + id + "").addClass("invalid");
            valid = false;
        }else if (!/^([0-9]{1,})$/.test(data.zip)) {
            $("label[for="+id+"]").attr("data-error", "Ingrese el codigo postal con solo numeros");
            $("#"+id+"").removeClass("valid");
            $("#"+id+"").addClass("invalid");
            valid = false;
        } else {
            $("#" + ""+id+"" + "").removeClass("invalid");
            $("#" + ""+id+"" + "").addClass("valid");
        }
        
        id = "email";
        if (data.email === "" || data.email === null) {
            $("label[for="+id+"]").attr("data-error", "Ingrese el e-mail del titular");
            $("#" + id + "").removeClass("valid");
            $("#" + id + "").addClass("invalid");
            valid = false;
        }else if (!/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(data.email)) {
            $("label[for="+id+"]").attr("data-error", "Ingrese el e-mail con el formato ejemplo@miMailDeEjemplo.com");
            $("#"+id+"").removeClass("valid");
            $("#"+id+"").addClass("invalid");
            valid = false;
        } else {
           
            $("#" + ""+id+"" + "").removeClass("invalid");
            $("#" + ""+id+"" + "").addClass("valid");
        }
        
       
       
        id = "phone";
        if (data.phone === "" || data.phone === null ) {
            $("label[for="+id+"]").attr("data-error", "Ingrese el numero de telefono del titular");
            $("#" + id + "").removeClass("valid");
            $("#" + id + "").addClass("invalid");
            valid = false;
        }else if (!/^([0-9]{1,})$/.test(data.phone)) {
            $("label[for="+id+"]").attr("data-error", "Por favor ingrese el numero de telefono con solo numeros");
            $("#"+id+"").removeClass("valid");
            $("#"+id+"").addClass("invalid");
            valid = false;
        } else {
            $("#" + ""+id+"" + "").removeClass("invalid");
            $("#" + ""+id+"" + "").addClass("valid");
        }
       
        id = "streetNumber";
        if (data.streetNumber === "" || data.streetNumber === null) {
            $("label[for="+id+"]").attr("data-error", "Ingrese el numero de la calle del titular");
            $("#" + id + "").removeClass("valid");
            $("#" + id + "").addClass("invalid");
            valid = false;
        }else if (!/^([0-9]{1,})$/.test(data.streetNumber)) {
            $("label[for="+id+"]").attr("data-error", "Ingrese el numero de la calle con solo numeros");
            $("#"+id+"").removeClass("valid");
            $("#"+id+"").addClass("invalid");
            valid = false;
        } else {
            $("#" + ""+id+"" + "").removeClass("invalid");
            $("#" + ""+id+"" + "").addClass("valid");
        }
        
        id = "state";
        if (data.state === "" || data.state === null) {
            $("label[for="+id+"]").attr("data-error", "Ingrese la ciudad del titular");
            $("#" + id + "").removeClass("valid");
            $("#" + id + "").addClass("invalid");
            valid = false;
        }else if (!/^([A-zÀ-ÿ ]{1,})$/.test(data.state)) {
            $("label[for="+id+"]").attr("data-error", "Ingrese la ciudad con solo numeros");
            $("#"+id+"").removeClass("valid");
            $("#"+id+"").addClass("invalid");
            valid = false;
        } else {
            $("#" + ""+id+"" + "").removeClass("invalid");
            $("#" + ""+id+"" + "").addClass("valid");
        }
        
        id = "installments";
        if ($("#installments").val() === "" || $("#installments").val() === null) {
            $("label[for="+id+"]").attr("data-error", "Ingrese la cantidad de cuotas");
            $("#" + id + "").removeClass("valid");
            $("#" + id + "").addClass("invalid");
            valid = false;
        } else {
            data.selectedInstallment = session.payment.availableInstallments.installments[$("#installments").val()];
            $("#" + ""+id+"" + "").removeClass("invalid");
            $("#" + ""+id+"" + "").addClass("valid");
        }
        
        id = "addressFloor";
        if (data.addressFloor === "" || data.addressFloor === null) {
            
        }else if (!/^([0-9 ]{1,})$/.test(data.addressFloor)) {
            $("label[for="+id+"]").attr("data-error", "Ingrese el numero de piso con solo numeros");
            $("#"+id+"").removeClass("valid");
            $("#"+id+"").addClass("invalid");
            valid = false;
        } else {
            $("#" + ""+id+"" + "").removeClass("invalid");
            $("#" + ""+id+"" + "").addClass("valid");
        }
        
        id = "addressApartment";
        if (data.addressApartment === "" || data.addressApartment === null) {
            
        }else if (!/^([\-A-zÀ-ÿ ]{1,})$/.test(data.addressApartment)) {
            $("label[for="+id+"]").attr("data-error", "Ingrese el departamento sin numeros ni caracteres especiales");
            $("#"+id+"").removeClass("valid");
            $("#"+id+"").addClass("invalid");
            valid = false;
        } else {
            $("#" + ""+id+"" + "").removeClass("invalid");
            $("#" + ""+id+"" + "").addClass("valid");
        }
   

        //Valid, store
        if (!valid) {
            $submitBtn.html("Confirmar >");
            $submitBtn.removeClass("disabled");
            return;
        }
        
        for(var property in data) {
            session.payment[property] = data[property];
        }
        session.state.hasPayment = true;
        session.state.hasContact = true;
        setSessionData(session);
        //Done, go to next page
//        window.location = session.state.hasPassengers ? "order-summary.html" : "passengers-information.html";
        window.location = "order-summary.html";
    });

    $("#backButton").on("click", function (event) {
        event.preventDefault();
        $("#backButton").addClass("disabled");
        window.history.back();  //Will go back to previous search (inbound trip if user searched for round trip, outbound trip if one way trip)
    });
});


function validateAllFields(){
    
    var session = getSessionData();
    debugger;
   

    var data = {
        cardNumber: Number($("#cardNumber").val()),
        cardExpiry: $("#cardExpiry").val(),
        cardholderFirstName: $("#cardholderFirstName").val(),
        cardholderLastName: $("#cardholderLastName").val(),
        cvv: Number($("#cvv").val()),
        id: Number($("#id").val()),
        street: $("#street").val(),
        streetNumber: $("#streetNumber").val(),
        state: $("#state").val(),
        phone: $("#phone").val(),
        addressFloor: $("#addressFloor").val(),
        addressApartment: $("#addressApartment").val(),
        zip: $("#zip").val(),
        email: $("#email").val()
    };
    //Missing info?
    var valid = true;
    if (data.cardNumber === "" || data.cardNumber === null) {
         $("label[for="+id+"]").attr("data-error", "Ingrese el numero de la tarjeta");
        valid = false;
    }else if (!/^([0-9]{13,16})$/.test(data.cardNumber)) {
        $("label[for=cardNumber]").attr("data-error", "Ingrese la tarjeta con solo numeros");
        $("#cardNumber").removeClass("valid");
        $("#cardNumber").addClass("invalid");
        valid = false;
    } else {
        $("#" + "cardNumber" + "").removeClass("invalid");
        $("#" + "cardNumber" + "").addClass("valid");
    }

    if (data.cardExpiry === "" || data.cardExpiry === null) {
        $("label[for="+"cardExpiry"+"]").attr("data-error", "Ingrese la fecha de vencimiento");
        valid = false;
    }else if (!/^([0-9]{2}\/[0-9]{2})$/.test(data.cardExpiry)) {
        $("label[for=cardExpiry]").attr("data-error", "Ingrese la fecha con el formato MM/AA");
        $("#cardExpiry").removeClass("valid");
        $("#cardExpiry").addClass("invalid");
        valid = false;
    } else {
        $("#" + "cardExpiry" + "").removeClass("invalid");
        $("#" + "cardExpiry" + "").addClass("valid");
    }

    if ($("#cvv").val()=== "" || $("#cvv").val() === null) {
         $("label[for="+"cvv"+"]").attr("data-error", "Ingrese el codigo de seguridad");
        valid = false;
    }else if (!/^([0-9]{3,4})$/.test(data.cvv)) {
        $("label[for=cvv]").attr("data-error", "Ingrese 3 o 4 numeros para el codigo de seguridad");
        $("#cvv").removeClass("valid");
        $("#cvv").addClass("invalid");
        valid = false;
    } else {
        $("#" + "cvv" + "").removeClass("invalid");
        $("#" + "cvv" + "").addClass("valid");
    }

    //All data is in, validate credit card if needed
    if (valid) {
        if ($("#isValidCard").val() !== "true") {
            validateCard(data.cardNumber, data.cardExpiry, data.cvv, false);    //NOT async
            if (!$("#isValidCard").val()) {
                $submitBtn.html("Confirmar >");
                $submitBtn.removeClass("disabled");
                valid = false;
            }
        }
    }



    var id = "";
    if (data.cardholderFirstName === "" || data.cardholderFirstName === null) {
         $("label[for="+"cardholderFirstName"+"]").attr("data-error", "Ingrese el nombre del titular");
        valid = false;
    }else if (!/^([A-zÀ-ÿ ]{1,})$/.test(data.cardholderFirstName)) {
        $("label[for=cardholderFirstName]").attr("data-error", "Ingrese el nombre sin usar numeros ni caracteres especiales");
        $("#cardholderFirstName").removeClass("valid");
        $("#cardholderFirstName").addClass("invalid");
        valid = false;
    } else {
        $("#" + "cardholderFirstName" + "").removeClass("invalid");
        $("#" + "cardholderFirstName" + "").addClass("valid");
    }

    if (data.cardholderLastName === "" || data.cardholderLastName === null) {
         $("label[for="+"cardholderLastName"+"]").attr("data-error", "Ingrese el apellido del titular");
        valid = false;
    }else if (!/^([A-zÀ-ÿ ]{1,})$/.test(data.cardholderLastName)) {
        $("label[for=cardholderLastName]").attr("data-error", "Ingrese el apellido sin usar numeros ni caracteres especiales");
        $("#cardholderLastName").removeClass("valid");
        $("#cardholderLastName").addClass("invalid");
        valid = false;
    } else {
        $("#" + "cardholderLastName" + "").removeClass("invalid");
        $("#" + "cardholderLastName" + "").addClass("valid");
    }


    if ($("#id").val() === "" || $("#id").val() === null) {
         $("label[for="+"id"+"]").attr("data-error", "Ingrese el documento del titular");
        valid = false;
    }else if (!/^([0-9]{1,8})$/.test(data.id)) {
        $("label[for=id]").attr("data-error", "Ingrese el documento compuesto por 1 a 8 numeros");
        $("#id").removeClass("valid");
        $("#id").addClass("invalid");
        valid = false;
    } else {
        $("#" + "id" + "").removeClass("invalid");
        $("#" + "id" + "").addClass("valid");
    }

    var id = "";

    id = "street";
    if (data.street === "" || data.street === null) {
         $("label[for="+id+"]").attr("data-error", "Ingrese la calle del titular");
        valid = false;
    }else if (!/^([A-zÀ-ÿ ]{1,})$/.test(data.street)) {
        $("label[for="+id+"]").attr("data-error", "Ingrese la calle sin usar caracteres especiales");
        $("#"+id+"").removeClass("valid");
        $("#"+id+"").addClass("invalid");
        valid = false;
    } else {
        $("#" + ""+id+"" + "").removeClass("invalid");
        $("#" + ""+id+"" + "").addClass("valid");
    }

    id = "zip";
    if (data.zip === "" || data.zip === null) {
        $("label[for="+id+"]").attr("data-error", "Ingrese el codigo postal");
        valid = false;
    }else if (!/^([0-9]{1,})$/.test(data.zip)) {
        $("label[for="+id+"]").attr("data-error", "Ingrese el codigo postal con solo numeros");
        $("#"+id+"").removeClass("valid");
        $("#"+id+"").addClass("invalid");
        valid = false;
    } else {
        $("#" + ""+id+"" + "").removeClass("invalid");
        $("#" + ""+id+"" + "").addClass("valid");
    }
    debugger;
    id = "email";
    if (data.email === "" || data.email === null) {
         $("label[for="+id+"]").attr("data-error", "Ingrese el e-mail del titular");
        valid = false;
    }else if (!/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(data.email)) {
        $("label[for="+id+"]").attr("data-error", "Ingrese el e-mail con el formato ejemplo@miMailDeEjemplo.com");
        $("#"+id+"").removeClass("valid");
        $("#"+id+"").addClass("invalid");
        valid = false;
    } else {
        $("label[for="+id+"]").attr("data-error", "Ingrese el e-mail del titular");
        $("#" + ""+id+"" + "").removeClass("invalid");
        $("#" + ""+id+"" + "").addClass("valid");
    }



    id = "phone";
    if (data.phone === "" || data.phone === null ) {
         $("label[for="+id+"]").attr("data-error", "Ingrese el numero de telefono del titular");
        valid = false;
    }else if (!/^([0-9]{1,})$/.test(data.phone)) {
        $("label[for="+id+"]").attr("data-error", "Por favor ingrese el numero de telefono con solo numeros");
        $("#"+id+"").removeClass("valid");
        $("#"+id+"").addClass("invalid");
        valid = false;
    } else {
        $("#" + ""+id+"" + "").removeClass("invalid");
        $("#" + ""+id+"" + "").addClass("valid");
    }

    id = "streetNumber";
    if (data.streetNumber === "" || data.streetNumber === null) {
         $("label[for="+id+"]").attr("data-error", "Ingrese el numero de la calle del titular");
        valid = false;
    }else if (!/^([0-9]{1,})$/.test(data.streetNumber)) {
        $("label[for="+id+"]").attr("data-error", "Ingrese el numero de la calle con solo numeros");
        $("#"+id+"").removeClass("valid");
        $("#"+id+"").addClass("invalid");
        valid = false;
    } else {
        $("#" + ""+id+"" + "").removeClass("invalid");
        $("#" + ""+id+"" + "").addClass("valid");
    }

    id = "state";
    if (data.state === "" || data.state === null) {
         $("label[for="+id+"]").attr("data-error", "Ingrese la ciudad del titular");
        valid = false;
    }else if (!/^([A-zÀ-ÿ ]{1,})$/.test(data.state)) {
        $("label[for="+id+"]").attr("data-error", "Ingrese la ciudad con solo numeros");
        $("#"+id+"").removeClass("valid");
        $("#"+id+"").addClass("invalid");
        valid = false;
    } else {
        $("#" + ""+id+"" + "").removeClass("invalid");
        $("#" + ""+id+"" + "").addClass("valid");
    }

    id = "installments";
    if ($("#installments").val() === "" || $("#installments").val() === null) {
        $("label[for="+id+"]").attr("data-error", "Ingrese la cantidad de cuotas");
       
        valid = false;
    } else {
        data.selectedInstallment = session.payment.availableInstallments.installments[$("#installments").val()];
        $("#" + ""+id+"" + "").removeClass("invalid");
        $("#" + ""+id+"" + "").addClass("valid");
    }
    
    id = "addressFloor";
        if (data.addressFloor === "" || data.addressFloor === null) {
            
        }else if (!/^([0-9 ]{1,})$/.test(data.addressFloor)) {
            $("label[for="+id+"]").attr("data-error", "Ingrese el numero de piso con solo numeros");
            $("#"+id+"").removeClass("valid");
            $("#"+id+"").addClass("invalid");
            valid = false;
        } else {
            $("#" + ""+id+"" + "").removeClass("invalid");
            $("#" + ""+id+"" + "").addClass("valid");
        }
        
        id = "addressApartment";
        if (data.addressApartment === "" || data.addressApartment === null) {
            
        }else if (!/^([\-A-zÀ-ÿ ]{1,})$/.test(data.addressApartment)) {
            $("label[for="+id+"]").attr("data-error", "Ingrese el departamento sin numeros ni caracteres especiales");
            $("#"+id+"").removeClass("valid");
            $("#"+id+"").addClass("invalid");
            valid = false;
        } else {
            $("#" + ""+id+"" + "").removeClass("invalid");
            $("#" + ""+id+"" + "").addClass("valid");
        }
   
    
}