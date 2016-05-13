/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(function() {  //Es alto copypasta de payment. Diego: Hay que agregar que pueden haber varios pasajeros. Hacemos que bajes infinito? Limite de pasajeros?
//    $(document).ready(function() {
//       $('select').material_select();
//    });
   
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
    var session = getSessionData();
    var miHTML = "";
    var form ="<div class=\"row\">\
                                    <div class=\"col s12 input-field\">\
                                        <label for='nombre' class=\"black-text\">Nombre</label>\
                                        <input id=\"nombre\" type=\"text\" class=\"validate\">\
                                    </div>\
                                </div>\
                                <div class=\"row\">\
                                    <div class=\"col s12 input-field\">\
                                        <label for='apellido' class=\"black-text\">Apellido</label>\
                                        <input id=\"apellido\" type=\"text\" class=\"validate\">\
                                    </div>\
                                </div>   \
                                <div class=\"row\">\
                                    <div class=\"col s12 input-field\">\
                                        <select>\
                                            <option value='' disabled selected>Elegir sexo</option>\
                                            <option value='1'>Masculino</option>\
                                            <option value='2'>Femenino</option>\
                                        </select>\
                                    </div>\
                                </div>    \
                                <div class=\"row\">\
                                    <div class=\"input-field col s4\"> \
                                            <label for='dia' class=\"black-text\">Dia</label> <!-- No deberia poder ser negativo -->\
                                            <input id=\"dia\" type=\"number\" class=\"validate\"> \
                                        </div>\
                                        <div class=\"input-field col s4\">\
                                            <select>\
                                                <option value='' disabled selected>Mes</option>\
                                                <option value='1'>1</option>\
                                                <option value='2'>2</option>\
                                                <option value='3'>3</option>\
                                                <option value='4'>4</option>\
                                                <option value='5'>5</option>\
                                                <option value='6'>6</option>\
                                                <option value='7'>7</option>\
                                                <option value='8'>8</option>\
                                                <option value='9'>9</option>\
                                                <option value='10'>10</option>\
                                                <option value='11'>11</option>\
                                                <option value='12'>12</option>\
                                            </select>\
                                            <label class=\"black-text\">Mes</label>\
                                        </div>\
                                        <div class=\"input-field col s4\">\
                                            <label for='anio' class=\"black-text\">Año</label>\
                                            <input id=\"anio\" type=\"text\" class=\"validate\">\
                                        </div>\
                                </div> ";   
    
//      para adultos
    for(var i = 0; i < 1; i++) //session.search.adults
    {
//    miHTML += "este es mi form loco";
    miHTML += "Adulto "+(i+1)+" de "+session.search.adults;
    miHTML += form;
    }
//    for(var i = 0; i < sessionData.search.children; i++)
//        para niños
//    for(var i = 0; i < sessionData.search.infants; i++) para infantes

    $("#form").html(miHTML);
        
    
    
});

