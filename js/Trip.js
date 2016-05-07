/**
 * Trip object used to represent a one-way trip, composed of one or more flights.
 * 
 * @constructor
 * @param {array} flights Array of 1 or more Flight objects.
 * @returns {Trip}
 */
function Trip(flights) {
    this.flights = flights;
    this.origin = flights[0].origin;
    this.dest = flights[flights.length-1].dest;
    this.takeoffTime = flights[0].takeoffTime;
    this.landingTime = flights[flights.length-1].landingTime;
    this.cost = flights.reduce(
        function(total, currentFlight) {
            return total + currentFlight.cost;
        }, 0);
}

/**
 * Gets detailed Trip time in days, hours, minutes and seconds.
 * 
 * @returns {object}
 * @see http://stackoverflow.com/a/5744880/2333689
 * TODO this is the exact same behavior as Flight, consider using inheritance.
 */
Trip.prototype.getFlightTime = function() {
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
 * Gets trip time in hours an minutes.
 * 
 * @returns {object}
 * TODO this is the exact same behavior as Flight, consider using inheritance.
 */
Trip.prototype.getResumedFlightTime = function() {
    var fullTime = this.getFlightTime();
    return {hours: fullTime.days*24+fullTime.hours, minutes: fullTime.minutes};
};

/**
 * @returns {Number}
 */
Trip.prototype.getNumStopovers = function() {
    return this.flights.length - 2;
};

/**
 * @returns {Boolean}
 */
Trip.prototype.isDirectTrip = function() {
    return this.getNumStopovers() === 0;
};

/**
 * Gets a string representation of this trip.
 * 
 * @returns {String}
 */
Trip.prototype.toString = function() {
    return "[Trip from " + this.origin + " (departs " + this.takeoffTime.toString() + ") to " + this.dest + " (arrives " + this.landingTime + ") with " + this.getNumStopovers() + " stopovers, costing US$" + this.cost + "]";
};