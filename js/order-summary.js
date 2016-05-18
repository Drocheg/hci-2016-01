/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(function () {
//                var session = getSessionData();
//                var html ="<h3>IDA</h3>";
//                for(var i=0; i<=getStopoversCount(session.outboundFlight);i++){ //Supongo que el 3 son las escalas
//                    html += "<h5>Vuelo numero "+i+1+"</h5> \
//                            <p>Numero de vuelo: "+getFlightNumber(session.outboundFlight)+"</p>\n\
//                            <p>Fecha: "+(getDepartureDateObj(session.outboundFlight)).getDate()+"/"+getDepartureDateObj(session.outboundFlight).getMonth()+"</p>\n\
//                            <p>Horario de salida: "+(getDepartureDateObj(session.outboundFlight)).getHours()+":"+getDepartureDateObj(session.outboundFlight).getMinutes()+"</p>\n\
//                            <P>Horario de llegada: "+(getArrivalDateObj(session.outboundFlight)).getHours()+":"+getArrivalDateObj(session.outboundFlight).getMinutes()+"</p>\n\
//                            <p>Duracion: "+getFlightDuration(session.outboundFlight)+"</p>\n\ ";  //Falta precio y cantidad de pasajeros
//                                                    //lo pongo despues que necesita codigo
//                    if(session.search.numAdults > 0){
//                    html += "<p> Precio por adultos: $"+getFlightPriceBreakdown(session.outboundFlight).adults.base_fare+"x"+session.search.numAdults+"</p>"; 
//                } 
//                 if(session.search.numChildren > 0){
//                    html += "<p> Precio por ninio: $"+getFlightPriceBreakdown(session.outboundFlight).children.base_fare+"x"+session.search.numChildren+"</p>"; 
//                } 
//                  if(session.search.numInfants > 0){
//                    html += "<p> Precio por infantes: $"+getFlightPriceBreakdown(session.outboundFlight).infants.base_fare+"x"+session.search.numInfants+"</p>"; 
//                } 
//                    html += "<p>Subtotal: "+getFlightPriceBreakdown(session.outboundFlight).total.fare+"</p>\n\
//                            <p>Cargos e impuestos: "+(getFlightPriceBreakdown(session.outboundFlight).total.charges+getFlightPriceBreakdown(session.outboundFlight).total.taxes)+"</p>\n\
//                            ";
//    }
//    html += "<h5><b>Total:</b></h5>";
//    $("#outbound").html(html);
//    
//    if(!session.search.OneWayTrip)
//    html = "<h3>VUELTA</h3>";
//    for(var i=0; i<=getStopoversCount(session.outboundFlight);i++){ //Supongo que el 3 son las escalas
//                    html += "<h5>Vuelo numero "+i+1+"</h5> \
//                            <p>Numero de vuelo: "+getFlightNumber(session.outboundFlight)+"</p>\n\
//                            <p>Fecha: "+(getDepartureDateObj(session.outboundFlight)).getDate()+"/"+getDepartureDateObj(session.outboundFlight).getMonth()+"</p>\n\
//                            <p>Horario de salida: "+(getDepartureDateObj(session.outboundFlight)).getHours()+":"+getDepartureDateObj(session.outboundFlight).getMinutes()+"</p>\n\
//                            <P>Horario de llegada: "+(getArrivalDateObj(session.outboundFlight)).getHours()+":"+getArrivalDateObj(session.outboundFlight).getMinutes()+"</p>\n\
//                            <p>Duracion: "+getFlightDuration(session.outboundFlight)+"</p>\n\ ";  //Falta precio y cantidad de pasajeros
//                                                    //lo pongo despues que necesita codigo
//                    if(session.search.numAdults > 0){
//                    html += "<p> Precio por adultos: $"+getFlightPriceBreakdown(session.outboundFlight).adults.base_fare+"x"+session.search.numAdults+"</p>"; 
//                } 
//                 if(session.search.numChildren > 0){
//                    html += "<p> Precio por ninio: $"+getFlightPriceBreakdown(session.outboundFlight).children.base_fare+"x"+session.search.numChildren+"</p>"; 
//                } 
//                  if(session.search.numInfants > 0){
//                    html += "<p> Precio por infantes: $"+getFlightPriceBreakdown(session.outboundFlight).infants.base_fare+"x"+session.search.numInfants+"</p>"; 
//                } 
//                    html += "<p>Subtotal: "+getFlightPriceBreakdown(session.outboundFlight).total.fare+"</p>\n\
//                            <p>Cargos e impuestos: "+(getFlightPriceBreakdown(session.outboundFlight).total.charges+getFlightPriceBreakdown(session.outboundFlight).total.taxes)+"</p>\n\
//                            ";
//    }                          //lo pongo despues que necesita codigo
//    html += "<h5><b>Total:</b></h5>";
//    $("#inbound").html(html);
//
//
//    $("#payment").html("\
//                            <h4>Información de pago</h4> \
//                            <p>Número de tarjeta: " + session.payment.cardNumber + "</p> \
//                            <p>Nombre de titular: " + session.payment.cardholderName + "</p> \
//                            <br> \
//                            <h5><b>Gran total: $27.998</b></h5> \
//                   ");
//    $("#contact").html("\
//                            <h4>Información de contacto</h4> \
//                            <p>Email: " + session.payment.email + "</p> \
//                    ");
//                $("#inbound").html("\
//                        <h4>Vuelta</h4> \
//                        <p>Vuelo: Delta #101</p> \
//                        <p>Fecha: " + session.search.departDate +"</p> \
//                        <p>Horario de salida: 09:15</p> \
//                        <p>Horario de llegada: 16:30(-1)</p> \
//                        <p>Escalas: 3</p> \
//                        <p>Duración: 4:30</p> \
//                        <p>Precio por adulto: $10.000</p> \
//                        <p>Cantidad de pasajeros: " +session.search.numAdults+" adultos; <br> "+session.search.childern+" ninios <br> "+session.search.numInfants+" infantes</p> \
//                        <p>Subtotal: $10.000</p> \
//                        <p>Cargos e impuestos: $3.999</p> \
//                        <br> \
//                        <p><b>Total: $13.999</b></p> \
//                        ");
//                $("#outbound").html("<h4>IDA</h4> \
//                                <p>Vuelo: Delta #110</p> \
//                                <p>Fecha: " + session.search.returnDate + "</p> \
//                                <p>Horario de salida: 21:15</p> \
//                                <p>Horario de llegada: 5:30(+1) 27/12/2016</p> \
//                                <p>Escalas: 3</p> \
//                                <p>Duración: 4:30</p> \
//                                <p>Precio por adulto: $20.000</p> \
//                                <p>Cantidad de pasajeros: " +session.search.numAdults+" adultos; <br> "+session.search.childern+" ninios <br> "+session.search.numInfants+" infantes</p> \
//                                <p>Subtotal: $10.000</p> \
//                                <p>Cargos e impuestos: $3.999</p> \
//                                <br> \
//                                <p><b>Total: $13.999</b></p>\
//                    ");

    $("#changeOutboundFlightBtn").on("click", function () {
        var session = getSessionData();
        var f = session.outboundFlight;
        session.payment.total -= getFlightTotal(f);
        session.state.hasOutboundFlight = false;
        session.outboundFlight = null;
        setSessionData(session);
        window.location = "flights.html";
    });

    $("#changeInboundFlightBtn").on("click", function () {        
        var session = getSessionData();
        var f = session.inboundFlight;
        session.payment.total -= getFlightTotal(f);
        session.state.hasInboundFlight = false;
        session.inboundFlight = null;
        setSessionData(session);
        window.location = "flights.html";
    });

    $("#changePassengersBtn").on("click", function () {
        var session = getSessionData();
        session.state.hasPassengers = false;
        setSessionData(session);
        window.location = "passengers-information.html";
    });

    $("#changePaymentBtn").on("click", function () {
        var session = getSessionData();
        session.state.hasPayment = false;
        setSessionData(session);
        window.location = "payment.html";
    });

    $("#changeContactBtn").on("click", function () {
        var session = getSessionData();
        session.state.hasContact = false;
        setSessionData(session);
        window.location = "payment.html";
    });
});


