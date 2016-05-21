//Promises for readying the autocomplete
var citiesPromise = $.Deferred(),
    airportsPromise = $.Deferred();

/**
 * Gets the stored session data, or the default data if nothing is stored.
 * 
 * @returns {Object}
 */
//TODO move to commonFunctions.js
function getSessionData() {
    //Initialize the sessionData object with defaults if not present
    if (typeof sessionStorage.sessionData === "undefined") {
        sessionStorage.sessionData = JSON.stringify({
            search: {
                from: {
                    name: null,
                    id: null
                },
                to: {
                    name: null,
                    id: null
                },
                oneWayTrip: null,
                departDate: {
                    pretty: null,
                    full: null
                },
                returnDate: {
                    pretty: null,
                    full: null
                },
                numAdults: 0,
                numChildren: 0,
                numInfants: 0,
                max_price: null,
                min_price: null,
                direction: null //outbound when current search is for an outbound trip, inbound when inbound, null otherwise
            },
            outboundFlight: null, //if there are stopovers, will be inside the flight object
            inboundFlight: null, //If NOT choosing a one-way trip, fill with the same structure as outbound
            preferences: {
                currency: "USD"
            },
            passengers: {
                adults: [
//                    {
////                        firstName: null,
////                        lastName: null,
////                        sex: null,
////                        birthday: null,
//                          documentType: null
////                        document: null      //TODO Podria ser otras cosas? Podria ser tipo de documento y despues el numero de ese tipo de documento.
//                    }
                ], //More if there is more than 1 adult
                children: [
//                    {
//                        firstName: null,
//                        lastName: null,
//                        sex: null,
//                        birthday: null,
//                        documentType: null
////                      document: null       //TODO Podria ser otras cosas? Podria ser tipo de documento y despues el numero de ese tipo de documento.
//                    }
                ], //More if there is more than 1 child
                infants: [
//                    {
//                        firstName: null,
//                        lastName: null,
//                        sex: null,
//                        birthday: null,
//                        documentType: null
////                      document: null       //TODO Podria ser otras cosas? Podria ser tipo de documento y despues el numero de ese tipo de documento.
//                    }
                ]      //More if there is more than 1 infant
            },
            payment: {
                cardNumber: null,
                cardExpiry: null,
                cardholderFirstName: null,
                cardholderLastName: null,
                cvv: null,
                idNum: null,
                id: null,
                email: null,
                zip: null,
                street: null,
                streetNumber: null,
                total: 0
            },
            state: {
                hasPassengers: false,
                hasPayment: false,
                hasContact: false
            },
            airlines: null,
            cities: null,
            airports: null
        });
    }
    return JSON.parse(sessionStorage.sessionData);
}

/**
 * Stores the specified object in sessionStorage. <b>WARNING: </b>Make sure you
 * have called <i>getSessionData()</i> before calling this, otherwise you could
 * lose data.
 * 
 * @param {object} sessionObj The session object to store.
 * @returns {undefined}
 */
function setSessionData(sessionObj) {
    sessionStorage.sessionData = JSON.stringify(sessionObj);
}

function getAllAirlines() {
    countResults(
            "misc",
            {method: "getairlines"},
            function (total) {
                APIrequest(
                        "misc",
                        {method: 'getairlines', page_size: total},
                        function (result) {
                            var session = getSessionData();
                            session.airlines = {};
                            for (var index in result.airlines) {
                                session.airlines[result.airlines[index].id] = result.airlines[index];
                            }
                            setSessionData(session);
                        }
                );
            });
}

function getAllCities() {
    countResults(
            "geo",
            {method: 'getcities'},
            function (total) {
                APIrequest(
                        "geo",
                        {method: 'getcities', page_size: total},
                        function (result) {
                            var session = getSessionData();
                            session.cities = result.cities;
                            setSessionData(session);
                            citiesPromise.resolve();
                        }
                );
            });
}

function getAllAirports() {
    countResults(
            "geo",
            {method: 'getairports'},
            function (total) {
                APIrequest(
                        "geo",
                        {method: 'getairports', page_size: total},
                        function (result) {
                            var session = getSessionData();
                            session.airports = result.airports;
                            setSessionData(session);
                            airportsPromise.resolve();
                        }
                );
            });
}

$(function () {  //Document.ready
    //Enable dynamic addition of <select>s
    $('select').material_select();
    //Is there local storage?
    if (typeof (window.Storage) === "undefined") {
        //TODO what to do without local storage? Nothing will work
    }
    var session = getSessionData();
    if (session.airlines === null) {
        getAllAirlines();
    }
    if (session.cities === null) {
        getAllCities();
    } else {
        citiesPromise.resolve();
    }
    if (session.airports === null) {
        getAllAirports();
    } else {
        airportsPromise.resolve();
    }
});
