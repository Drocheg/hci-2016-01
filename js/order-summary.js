var bookPromise = $.Deferred();
var magic = 0;
var expectedMagic = null;

function bookFlight(monsterObj) {
    $.ajax({
        type: "POST",
        url: "http://eiffel.itba.edu.ar/hci/service4/booking.groovy?method=bookflight",
        contentType: 'aplication/json',
        data: JSON.stringify(monsterObj)
    })
            .done(function (result) {
                if (result.error) {
                    Materialize.toast("ups", 5000);
                } else {
                    magic++;
                    if (magic === expectedMagic) {
                        bookPromise.resolve();
                    }
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown)
            {
                defaultFailHandler(null, "Error de booking");
            });
}



$(function () {
    var session = getSessionData();

    //Make sure the user is supposed to be here, if not redirect to home
    if (!session.state.hasPayment || !session.state.hasPassengers || session.outboundFlight === null || (!session.search.oneWayTrip && session.inboundFlight === null)) {
        window.location = "index.html";
    }

    $("#changeOutboundFlightBtn").on("click", function () {
        var session = getSessionData();
        clearOutboundFlight();
        window.location = "flights.html?from=" + session.search.from.id + "&to=" + session.search.to.id + "&dep_date=" + session.search.departDate.full + "&direction=outbound" + "&adults=" + session.search.numAdults + "&children=" + session.search.numChildren + "&infants=" + session.search.numInfants;
    });

    $("#changeInboundFlightBtn").on("click", function () {
        var session = getSessionData();
        clearInboundFlight();
        window.location = "flights.html?from=" + session.search.to.id + "&to=" + session.search.from.id + "&dep_date=" + session.search.returnDate.full + "&direction=inbound" + "&adults=" + session.search.numAdults + "&children=" + session.search.numChildren + "&infants=" + session.search.numInfants;
    });

    $("#changePassengersBtn").on("click", function () {
        var session = getSessionData();
        session.state.hasPassengers = false;
        setSessionData(session);
        window.location = "passengers-information.html";
    });

    $("#changePaymentBtn").on("click", function () {
        var session = getSessionData();
        session.state.hasPayment = false;
        setSessionData(session);
        window.location = "payment.html";
    });

    $("#changeContactBtn").on("click", function () {
        var session = getSessionData();
        session.state.hasContact = false;
        setSessionData(session);
        window.location = "payment.html";
    });

    $("#confirmBtn").on("click", function () {
        var session = getSessionData();
        passengersToProcess = session.passengers.adults.length + session.passengers.children.length + session.passengers.infants.length;

        var miArray = [];


        for (var index in session.passengers.adults) {
            var myB = new Date(session.passengers.adults[index].birthday);
            miArray.push({
                "first_name": session.passengers.adults[index].firstName,
                "last_name": session.passengers.adults[index].lastName,
                "birthdate": myB.getFullYear() + "-" + (myB.getMonth() + 1 < 10 ? "0" : "") + (myB.getMonth() + 1) + "-" + (myB.getDate() < 10 ? "0" : "") + myB.getDate(),
                "id_type": 1,
                "id_number": session.passengers.adults[index].document
            });
        }
        for (var index in session.passengers.children) {
            var myB = new Date(session.passengers.children[index].birthday);
            miArray.push({
                "first_name": session.passengers.children[index].firstName,
                "last_name": session.passengers.children[index].lastName,
                "birthdate": myB.getFullYear() + "-" + (myB.getMonth() + 1 < 10 ? "0" : "") + (myB.getMonth() + 1) + "-" + (myB.getDate() < 10 ? "0" : "") + myB.getDate(),
                "id_type": 1,
                "id_number": session.passengers.children[index].document
            });
        }
        for (var index in session.passengers.infants) {
            var myB = new Date(session.passengers.infants[index].birthday);
            miArray.push({
                "first_name": session.passengers.infants[index].firstName,
                "last_name": session.passengers.infants[index].lastName,
                "birthdate": myB.getFullYear() + "-" + (myB.getMonth() + 1 < 10 ? "0" : "") + (myB.getMonth() + 1) + "-" + (myB.getDate() < 10 ? "0" : "") + myB.getDate(),
                "id_type": 1,
                "id_number": session.passengers.infants[index].document
            });
        }

        var outboundBook = {
            "flight_id": getFlightId(session.outboundFlight),
            "passengers": miArray,
            "payment": {
                "installments": session.payment.selectedInstallment.quantity,
                "credit_card": {
                    "number": session.payment.id,
                    "expiration": session.payment.cardExpiry,
                    "security_code": session.payment.cvv,
                    "first_name": session.payment.cardholderFirstName,
                    "last_name": session.payment.cardholderLastName
                },
                "billing_address": {
                    "city": {
                        "id": "BUE",
                        "state": "Buenos Aires",
                        "country": {
                            "id": "AR"
                        }
                    },
                    "zip_code": session.payment.zip,
                    "street": session.payment.street,
                    "floor": session.payment.addressFloor,
                    "apartment": session.payment.addressApartment
                }
            },
            "contact": {
                "email": session.payment.email,
                "phones": [
                    session.payment.phone
                ]
            }
        };

        expectedMagic = session.search.oneWayTrip ? 1 : 2;
        bookFlight(outboundBook);
        if (!session.search.oneWayTrip) {
            var inboundBook = {
                "flight_id": getFlightId(session.inboundFlight),
                "passengers": miArray,
                "payment": {
                    "installments": session.payment.selectedInstallment.quantity,
                    "credit_card": {
                        "number": session.payment.id,
                        "expiration": session.payment.cardExpiry,
                        "security_code": session.payment.cvv,
                        "first_name": session.payment.cardholderFirstName,
                        "last_name": session.payment.cardholderLastName
                    },
                    "billing_address": {
                        "city": {
                            "id": "BUE",
                            "state": "Buenos Aires",
                            "country": {
                                "id": "AR"
                            }
                        },
                        "zip_code": session.payment.zip,
                        "street": session.payment.street,
                        "floor": session.payment.addressFloor,
                        "apartment": session.payment.addressApartment
                    }
                },
                "contact": {
                    "email": session.payment.email,
                    "phones": [
                        session.payment.phone
                    ]
                }
            };
            bookFlight(inboundBook);
        }


        $.when(bookPromise).then(function () {
            window.location = "order-confirmation.html";
        });
    });
});