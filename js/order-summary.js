/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(function () {
                var session = getSessionData();
                var html ="<h3>IDA</h3>";
                for(var i=1; i<4;i++){ //Supongo que el 3 son las escalas
                    html += "<h5>Vuelo numero "+i+"</h5> \
                            <p>Numero de vuelo:</p>\n\
                            <p>Fecha:</p>\n\
                            <p>Horario de salida:</p>\n\
                            <P>Horario de llegada:</p>\n\
                            <p>Duracion:</p>\n\ ";  //Falta precio y cantidad de pasajeros
                                                    //lo pongo despues que necesita codigo
                    if(session.search.adults > 0){
                    html += "<p> Precio por adulto: $200x"+session.search.adults+"</p>"; 
                } 
                 if(session.search.children > 0){
                    html += "<p> Precio por ninio: $200x"+session.search.children+"</p>"; 
                } 
                 if(session.search.infants > 0){
                    html += "<p> Precio por infantes: $200x"+session.search.infants+"</p>"; 
                } 
                    html += "<p>Subtotal:</p>\n\
                            <p>Cargos e impuestos:</p>\n\
                            ";
                 }                                  
                 html += "<h5><b>Total:</b></h5>";
                 $("#outbound").html(html);
                
                html = "<h3>VUELTA</h3>";
                for(var i=1; i<4;i++){ //Supongo que el 3 son las escalas
                    html += "<h5>Vuelo numero "+i+"</h5> \
                            <p>Numero de vuelo:</p>\n\
                            <p>Fecha:</p>\n\
                            <p>Horario de salida:</p>\n\
                            <P>Horario de llegada:</p>\n\
                            <p>Duracion:</p>\n\ ";  //Falta precio y cantidad de pasajeros
                 }                           //lo pongo despues que necesita codigo
                 html += "<h5><b>Total:</b></h5>";
                 $("#inbound").html(html);


                $("#payment").html("\
                            <h4>Información de pago</h4> \
                            <p>Número de tarjeta: " + session.payment.cardNumber + "</p> \
                            <p>Nombre de titular: "+ session.payment.cardholderName +"</p> \
                            <br> \
                            <h5><b>Gran total: $27.998</b></h5> \
                   ");
                $("#contact").html("\
                            <h4>Información de contacto</h4> \
                            <p>Email: " + session.payment.email +"</p> \
                    ");
//                $("#inbound").html("\
//                        <h4>Vuelta</h4> \
//                        <p>Vuelo: Delta #101</p> \
//                        <p>Fecha: " + session.search.departDate +"</p> \
//                        <p>Horario de salida: 09:15</p> \
//                        <p>Horario de llegada: 16:30(-1)</p> \
//                        <p>Escalas: 3</p> \
//                        <p>Duración: 4:30</p> \
//                        <p>Precio por adulto: $10.000</p> \
//                        <p>Cantidad de pasajeros: " +session.search.adults+" adultos; <br> "+session.search.childern+" ninios <br> "+session.search.infants+" infantes</p> \
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
//                                <p>Cantidad de pasajeros: " +session.search.adults+" adultos; <br> "+session.search.childern+" ninios <br> "+session.search.infants+" infantes</p> \
//                                <p>Subtotal: $10.000</p> \
//                                <p>Cargos e impuestos: $3.999</p> \
//                                <br> \
//                                <p><b>Total: $13.999</b></p>\
//                    ");
            });
            
