/**
 * Updates the outgoing/incoming boxes on the flights page to show info of the
 * specified flight.
 * 
 * @param {object} flight
 * @param {string} direction "outbound" or "inbound"
 * @returns {undefined}
 */
function markSelectedFlight(flight, direction) {
    if (flight === null) {
        return;
    }
    var id;
    switch (direction) {
        case "outbound":
            id = "selectedOutboundFlight";
            break;
        case "inbound":
            id = "selectedInboundFlight";
            break;
        default:
            console.log("Flight direction not stored in session, I don't know which box to put the flight in. Aborting.");  //TODO validate and remove
            return;
    }
    var html = '<div class="card-panel green lighten-4">';
    //Airline code and flight number        
    html += '<div class="col s2"><p><img src="' + getFlightAirlineLogoURL(flight) + '" />  ' + getFlightAirlineID(flight) + " " + getFlightNumber(flight) + '</p></div>';
    //Departure airport and time, arrival airport and time
    var depDate = getDepartureDateObj(flight);
    var arrDate = getArrivalDateObj(flight);
    var depTimeStr = (depDate.getHours() < 10 ? "0" : "") + depDate.getHours() + ":" + (depDate.getMinutes() < 10 ? "0" : "") + depDate.getMinutes();
    var arrTimeStr = (arrDate.getHours() < 10 ? "0" : "") + arrDate.getHours() + ":" + (arrDate.getMinutes() < 10 ? "0" : "") + arrDate.getMinutes();
    html += '<div class="col s4 center"><p>' + depTimeStr + ' - ' + getOriginAirport(flight).id + '  <span class="material-icons">send</span>  ' + arrTimeStr + ' - ' + getDestinationAirport(flight).id + '</p></div>';
    //Stopovers
    html += '<div class="col s2"><p><i class="material-icons">flight</i>  ' + (getStopoversCount(flight) === 0 ? 'Directo' : getStopoversCount(flight) + ' Escalas') + '</p></div>';
    //Duration
    html += '<div class="col s2 center"><p><i class="material-icons">timer</i>  ' + getFlightDuration(flight) + '</p></div>';
    //Cost
    html += '<div class="col s2 center"><p><b>' + toSelectedCurrency(getFlightTotal(flight)) + '</b></p></div>';
    html += '</div>';
    $("#" + id).html(html);
    $("#" + id + " > div.card-panel").addClass("activated");
    //Update total (angular isn't picking up the changes)
    $("#total").html(toSelectedCurrency(getSessionData().payment.total));
    enableNextStepBtn();
}

/**
 * Enables the button to advance to the next page, if the user's current state
 * allows it.
 * 
 * @returns {undefined}
 */
function enableNextStepBtn() {
    var s = getSessionData();
    var enable = false;
    if (s.search.oneWayTrip) {
        if (s.outboundFlight !== null) {
            enable = true;
        }
    } else {
        if (getGETparam('direction') === 'outbound' && s.outboundFlight !== null) {
            enable = true;
        } else if (getGETparam('direction') === 'inbound' /*&& s.outboundFlight !== null*/ && s.inboundFlight !== null) {
            enable = true;
        }
    }
    if (enable) {
        $("#nextStep button").removeAttr("disabled");
        $("#nextStep button").removeClass("disabled");
    }
}

/**
 * Gets the next page the user should visit, given they are on the flights page,
 * based on their current state.
 * 
 * @returns {string} The next page; flights or passenger info.
 */
function nextPage() {
    var session = getSessionData();
    var nextPage = "index.html";        //Fall back to home if nothing is chosen
    if (!session.search.oneWayTrip && session.inboundFlight === null) {
        nextPage = "flights.html?from=" + getGETparam("to") + "&to=" + getGETparam("from") + "&dep_date=" + session.search.returnDate.full + "&direction=inbound" + "&adults=" + getGETparam("adults") + "&children=" + getGETparam("adults") + "&infants=" + getGETparam("infants");
    } else {
//        nextPage = session.state.hasPassengers ? (session.state.hasPayment ? "order-summary.html" : "payment.html") : "passengers-information.html";
        nextPage = "passengers-information.html";
    }
    return nextPage;
}

$(function () {
    //Validate GET parameters
    var requiredParams = ['from', 'to', 'dep_date', 'adults', 'children', 'infants'];
    for (var index in requiredParams) {
        if (getGETparam(requiredParams[index]) === null) {        //Redirect users to home on invalid parameters
            window.location = "index.html";
        }
    }

    if (getGETparam("direction") === "outbound") {       //If there's a flight already selected for this direction, clear it
        clearOutboundFlight();
        clearInboundFlight();
    } else if (getGETparam("direction") === "inbound") {
        clearInboundFlight();   //TODO redundant, clear inbound flight either case
    }

    var session = getSessionData();

    //Mark current total
    $("#total").html(toSelectedCurrency(session.payment.total));

    //Mark any selected flights
    markSelectedFlight(session.outboundFlight, 'outbound');
    markSelectedFlight(session.inboundFlight, 'inbound');

    $("#flights").on("click", ".selectFlightBtn", function () {
        //Re-enable all other buttons
        $(".selectFlightBtn").html("Seleccionar");
        $(".selectFlightBtn").removeClass("disabled");
        //Disable this one
        $(this).html("Seleccionado");
        $(this).addClass("disabled");
    });

    $("#nextStep").on("click", "> button", function () {
        //TODO NOW handle changes (i.e. if came back from order summary and changed outbound, must choose inbound again)
        window.location = nextPage();
    });
});