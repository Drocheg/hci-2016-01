/**
 * 
 * Object used for interacting with the provided API.
 * 
 * @returns {undefined}
 */
function API() {};

/**
 * Makes an API request.
 * 
 * @param {type} service
 * @param {type} action
 * @param {object} data The data to run the request with.
 * @param {function} beforeSendFn A function to run before sending the request.
 * @param {function} successCallback A function to run when the API returns, if
 * it returned without errors.
 * @param {function} errorCallback A function to run when the API returns, if
 * it returned with errors.
 * @param {function} failCallback A function to run if the request fails (e.g. due
 * to a network error). If not provided, will call the default fail handler.
 * @returns {undefined}
 */
API.request = function(service, action, data, beforeSendFn, successCallback, errorCallback, failCallback) {
    $.ajax({
        type: "POST",
        url: "http://eiffel.itba.edu.ar/hci/service4/"+service+".groovy?method="+action,
        dataType: 'json',
        data: data,
        beforeSend: beforeSendFn
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
};

/**
 * Default fail handler for API requests. Shows a generic toast to the user and
 * logs details about the error on the console.
 * 
 * @param {type} jqXHR
 * @param {type} textStatus
 * @param {type} errorThrown
 * @returns {undefined}
 */
API.defaultFailHandler = function(jqXHR, textStatus, errorThrown) {
    Materialize.toast("Connection error, please try again.", 5000);
    console.log("Connection error. Error data:");
    console.log("jqXHR: " + JSON.stringify(jqXHR));
    console.log("Text status: " + textStatus);
    console.log("Error thrown: " + errorThrown);
};

API.getAllFlightReviews = function(airlineID, flightNumber, callbackFn) {
    this.request("review",
                "getairlinereviews",
                {airline_id: airlineID, flight_number: flightNumber},
                undefined,
                function(result) {
                    callbackFn(result.reviews);
                }
                );
};