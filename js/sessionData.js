//This is a MODEL of what the sessionData object we store will look like.
//Avisar al grupo si se cambia, agrega o saca algo, todos dependemos de este objetito
var sessionData = {
    search: {
        from: "airport or city ID",
        to: "airport or cityID", 
        oneWayTrip: false,
        depart: "yyyy-mm-dd",           //Store as string, not date, gets serialized to ISO string in session
        return: "yyyy-mm-dd" || null,   //null in case of one-way trip
        adults: 3,
        children: 1,
        infants: 0,
        //what else?
    },
//    flights: { //Wouldnt be prettier if we had outboundFlight object and inboundFlight object? Variables would have shorter and clearer names
//        outboundFlights: [new Flight(), new Flight()],          //more than 1 flight if there are stopovers
//        inboundFlights: [new Flight(), new Flight()] || null,    //can be null if one-way trip, otherwise same as outboundFlights
//        total: 42,                                              //Can be calculated by adding flights' cost, provided for convenience
//        
//        //what else? If taxes are somewhere else and al the fligt info can be gathered from new Flight() then it should be fine
//    },
    flights: { //No los diferencie en outbound e inbound por el tema escalas, pensar que hacer
        departureTime: "",
        arrivalTime: "",
        adultCost: "$",
        childCost: "$",
        infantCost: "$",
        taxes: "$", //?
        flightNumber: 42
    
    },

    preferences: {
        currency: "currencyCode",       //Default to USD? Or current location?
        currencyExchangeRate: 42,       //Calculated with API using currency
        language: "en",                 //In case we support multi-language site (probably won't)
        //what else?
    },
    passengers: {
        adults: [ 
            {
                firstName: "Jorge",
                lastName: "Jorgez",
                sex: "M",
                birthday: "yyyy-mm-dd",
                DNI: 39393939393, //Podria ser otras cosas? Podria ser tipo de documento y despues el numero de ese tipo de documento.
            }
        ],
        children:[ 
            {
                firstName: "Jorge",
                lastName: "Jorgez",
                sex: "M",
                birthday: "yyyy-mm-dd",
                DNI: 39393939393, //Podria ser otras cosas? Podria ser tipo de documento y despues el numero de ese tipo de documento.
            }
        ],
        infants:[ 
            {
                firstName: "Jorge",
                lastName: "Jorgez",
                sex: "M",
                birthday: "yyyy-mm-dd",
                DNI: 39393939393, //Podria ser otras cosas? Podria ser tipo de documento y despues el numero de ese tipo de documento.
            }
        ]
    },
    payment: {
        //acá hay que poner # de tarjeta, vencimiento, etc. etc. etc.
        // Puse cosas, soy Flacu, esta bien?
        cardNumber: 1111222233334444,
        cardExpiry: "MM/YY",
        cardholderName: "Facundo Gonzalez F",
        cvv: 123 || 1234,
        dni: 38995760,
        email: "facundogonzalezf@gmail.com"
    },
    state: {
        hasOutboundFlight: false,               //Si ya seleccionó algún vuelo de ida
        hasInboundFlight: false || null,        //Si ya seleccionó algún vuelo de vuelta o NULL si es de sólo ida
        hasPassengers: false,                   //Si ya cargó la info de TODOS los pasajeros y es válida
        hasPayment: false,                      //Si ya cargó info de método de pago y es válida
    }
};

