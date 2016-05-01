/**
 * Flight object used to represent single flights. A trip may consist of
 * several flights.
 * 
 * @constructor
 * @param {string} originAirport The code of the origin airport.
 * @param {string} destinationAirport The code of the destination airport.
 * @param {Date} takeoffTime Take-off time, with a timezone.
 * @param {Date} landingTime Landing time, with a timezone.
 * @param {number} cost The cost, in USD.
 * @returns {Flight}
 */
function Flight(originAirport, destinationAirport, takeoffTime, landingTime, cost) {
    this.origin = originAirport;
    this.dest = destinationAirport;
    this.takeoffTime = takeoffTime;
    this.landingTime = landingTime;
    this.cost = cost;
}

/**
 * Gets detailed flight time in days, hours, minutes and seconds.
 * 
 * @returns {object}
 * @see http://stackoverflow.com/a/5744880/2333689
 */
Flight.prototype.getFlightTime = function() {
    var diff = this.landingTime.getTime() - this.takeoffTime.getTime(); //milliseconds
    var days = Math.floor(diff/1000/60/60/24);
    diff -= days*1000*60*60*24;
    var hours = Math.floor(diff/1000/60/60);
    diff -= hours*1000*60*60;
    var minutes = Math.floor(diff/1000/60);
    diff -= minutes*1000*60;
    var seconds = Math.floor(diff/1000);
    return {days: days, hours: hours, minutes: minutes, seconds: seconds};
};

/**
 * Gets flight time in hours an minutes.
 * 
 * @returns {object}
 */
Flight.prototype.getResumedFlightTime = function() {
    var fullTime = this.getFlightTime();
    return {hours: fullTime.days*24+fullTime.hours, minutes: fullTime.minutes};
};

/**
 * Gets a string representation of this flight.
 * 
 * @returns {String}
 */
Flight.prototype.toString = function() {
    return "[Flight from " + this.origin + " (departs " + this.takeoffTime.toString() + ") to " + this.dest + " (arrives " + this.landingTime + "), costing US$" + this.cost + "]";
};