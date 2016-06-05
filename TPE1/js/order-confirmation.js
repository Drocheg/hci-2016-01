$(function () {
    //Make sure the user is supposed to be here, if not redirect to home
    if (!session.state.hasPayment || !session.state.hasPassengers || session.outboundFlight === null || (!session.search.oneWayTrip && session.inboundFlight === null)) {
        window.location = "index.html";
    }
    
    sessionStorage.sessionData = undefined; //He got reset --hard
});