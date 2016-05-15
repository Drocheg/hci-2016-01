//TODO move these functions to session.js

/**
 * Gets the stored session data, or the default data if nothing is stored.
 * 
 * @returns {Object}
 */
function getSessionData() {
    //Initialize the sessionData object with defaults if not present
    if (typeof sessionStorage.sessionData === "undefined") {
        sessionStorage.sessionData = JSON.stringify({
            search: {
                from: null,
                to: null,
                oneWayTrip: null,
                depart: null, //Store as string, not date, gets serialized to ISO string in session
                return: null,
                adults: null,
                children: null,
                infants: null,
                selectedFlight: null,
                direction: null //outbound when current search is for an outbound trip, inbound when inbound, null otherwise
            },
            outboundFlight: null, //if there are stopovers, will be inside the flight object
            inboundFlight: null, //If NOT choosing a one-way trip, fill with the same structure as outbound
            preferences: {
                currency: "USD"
            },
            passengers: {
                adults: [{
                        firstName: null,
                        lastName: null,
                        sex: null,
                        birthday: null,
                        DNI: null      //TODO Podria ser otras cosas? Podria ser tipo de documento y despues el numero de ese tipo de documento.
                    }], //More if there is more than 1 adult
                children: [{
                        firstName: null,
                        lastName: null,
                        sex: null,
                        birthday: null,
                        DNI: null      //TODO Podria ser otras cosas? Podria ser tipo de documento y despues el numero de ese tipo de documento.
                    }], //More if there is more than 1 child
                infants: [{
                        firstName: null,
                        lastName: null,
                        sex: null,
                        birthday: null,
                        DNI: null      //TODO Podria ser otras cosas? Podria ser tipo de documento y despues el numero de ese tipo de documento.
                    }]      //More if there is more than 1 infant
            },
            payment: {
                cardNumber: null,
                cardExpiry: null,
                cardholderName: null,
                cvv: null,
                dni: null,
                email: null,
                total: 0
            },
            state: {
                hasOutboundFlight: false,
                hasInboundFlight: false,
                hasPassengers: false,
                hasPayment: false
            }
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

$(function () {  //Document.ready
    //Enable dynamic addition of <select>s
    $('select').material_select();
    //Is there local storage?
    if (typeof (window.Storage) === "undefined") {
        //TODO what to do without local storage? Nothing will work
    }
});