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
        
        var session = JSON.parse(sessionStorage.sessionData);   //will return UNDEFINED if it doesn't exist yet
        session.payment = data;
        sessionStorage.sessionData = JSON.stringify(session);
    });
    
    
});