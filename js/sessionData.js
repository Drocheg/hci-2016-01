//TO GET THE OBJECT
var session = JSON.parse(sessionStorage.sessionData);   //will return UNDEFINED if it doesn't exist yet
//TO SAVE IT AGAIN (make sure you got it first)
sessionStorage.sessionData = JSON.stringify(session);



var sessionData = {
    search: {
        from: "airport or city ID",
        to: "airport or cityID", 
        isOneWayTrip: false,
        depart: new Date(),         //date includes date and time
        return: new Date() || null, //null in case of one-way trip
        adults: 3,
        children: 1,
        infants: 0,
        //what else?
    },
    flights: {
        outboundFlights: [new Flight(), new Flight()],          //more than 1 flight if there are stopovers
        inboundFlights: [new Flight(), new Fligh()] || null,    //can be null if one-way trip, otherwise same as outboundFlights
        total: 42,                                              //Can be calculated by adding flights' cost, provided for convenience
        //what else?
    },
    preferences: {
        currency: "currencyCode",       //Default to USD? Or current location?
        currencyExchangeRate: 42,       //Calculated with API using currency
        language: "en",                 //In case we support multi-language site (probably won't)
        //what else?
    },
    passengers: [
        {
            firstName: "Jorge",
            lastName: "Jorgez",
            sex: "M",
            birthday: new Date(),
            DNI: 39393939393, //Podria ser otras cosas? Podria ser tipo de documento y despues el numero de ese tipo de documento.
        }
    ]
};

