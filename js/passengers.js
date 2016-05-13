/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(function() {  //Es alto copypasta de payment. Diego: Hay que agregar que pueden haber varios pasajeros. Hacemos que bajes infinito? Limite de pasajeros?
    $("#passengers-form").on("submit", function(event) {
        event.preventDefault();
        var data = {
            nombre: $("#nombre").val(),
            apellido: $("#apellido").val(),
            sexo: $("#sexo").val(),
            documento: $("#documento").val(),
            dia: $("#dia").val(),
            mes: $("#mes").val(),
            anio: $("#anio").val()
        };
        //Validar
        
        var session = getSessionData();
        session.passengers = data;      //THIS SHOULD BE AN ARRAY OF OBJECTS, even if it's just 1 object
        setSessionData(session);
    });
    
    
});