$(function () {
    //Redirect to home if no parameters are provided
    if(getGETparam("airlineId") === null || getGETparam("flightNum") === null) {
        window.location = "index.html";
    }
});