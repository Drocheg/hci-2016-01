//Promises for readying the autocomplete
var citiesPromise = $.Deferred(),
    airportsPromise = $.Deferred(),
    currenciesPromise = $.Deferred();

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
                currency: null
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
                installments: null,
                state: null,
                addressFloor: "-",
                addressApartment: "-",
                phone: null,
                availableInstallments: null,
                selectedInstallment: null,
                total: 0
            },
            state: {
                hasPassengers: false,
                hasPayment: false,
                hasContact: false
            },
            airlines: null,
            cities: null,
            airports: null,
            currencies: null
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

/**
 * Gets all available airlines and stores them in session to reference them later.
 * 
 * @returns {undefined}
 */
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

/**
 * Gets all available cities and stores them in session to reference them later.
 * 
 * @returns {undefined}
 */
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

/**
 * Gets all available airports and stores them in session to reference them later.
 * 
 * @returns {undefined}
 */
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

/**
 * Gets all available airlines and stores them in session to reference them later.
 * 
 * @returns {undefined}
 */
function getAllCurrencies() {
    countResults(
            "misc",
            {method: 'getcurrencies'},
            function (total) {
                APIrequest(
                        "misc",
                        {method: 'getcurrencies', page_size: total},
                        function (result) {
                            var session = getSessionData();
                            session.currencies = {};
                            for (var index in result.currencies) {
                                //Add a trailing space to the US currency cymbol
                                if(result.currencies[index].id === "USD") {
                                    result.currencies[index].symbol += " ";
                                }
                                session.currencies[result.currencies[index].id] = result.currencies[index];
                            }
                            setSessionData(session);
                            currenciesPromise.resolve();
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
    if(session.currencies === null) {
        getAllCurrencies();
    }
    else {
        currenciesPromise.resolve();
    }
});
