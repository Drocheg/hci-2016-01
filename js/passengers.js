/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * TODO hay que checkear edad = groupo | fecha nacimiento sea valida | documento valido? | nombre y apellido solo letras? | Todos los campos obligatorios.
 */
$(function() {  
    $(document).ready(function() {
       $('select').material_select();
    });
   
    $("#passengers-form").on("submit", function(event) {
        event.preventDefault();
        var $submitBtn = $("#passengers-form button[type=submit]");
        $submitBtn.addClass("disabled");
        $submitBtn.html("Validando...");
        var groups = ["adults","children","infants"];
        var session = getSessionData();
        //$([session.search.adults,session.search.children,session.search.infants]).each(function(index, value) {
        
        $([2,1,0]).each(function(index, value) { //Para testing
            session.passengers[groups[index]]=[]
           
            for(var i = 0; i < value; i++){
                var fecha = {
                    dia: $("#"+groups[index]+"-"+i+"-"+"dia").val(),
                    mes: $("#"+groups[index]+"-"+i+"-"+"mes").val(),
                    anio: $("#"+groups[index]+"-"+i+"-"+"anio").val()
                };
                var data = {
                    nombre: $("#"+groups[index]+"-"+i+"-"+"nombre").val(),
                    apellido: $("#"+groups[index]+"-"+i+"-"+"apellido").val(),
                    sexo: $("#"+groups[index]+"-"+i+"-"+"sexo").val(),
                    documento: $("#"+groups[index]+"-"+i+"-"+"documento").val()
                };
                
                //Validar
//                for (var entry in data) { //Sirve esto? No lo hace html?
//                    if (data.hasOwnProperty(entry)) {
//                        if (data[entry].length === 0) {
//                           // Materialize.toast("Por favor complete todos los campos.", 5000); 
//                            $submitBtn.html("Confirmar >");
//                            $submitBtn.removeClass("disabled");
//                            return;
//                        }
//                    }
//                }
               session.passengers[groups[index]].push(data);
            }  
        });
        setSessionData(session);
        window.location = "payment.html";
    });
    var session = getSessionData();
    var miHTML = "";
    var groups = ["adults","children","infants"];
    var spanishGroups = ["Adultos","Niños","Infantes"];
    //$([session.search.adults,session.search.children,session.search.infants]).each(function(index, value) {
    $([2,1,0]).each(function(index, value) { //Para testing
        for(var i = 0; i < value; i++) //session.search.adults. Lo hago para testing.
        {
            // miHTML += "este es mi form loco";
            miHTML += spanishGroups[index] + " "+(i+1)+" de "+value; //TODO que el select sea required
            
            var form ="<div class='row'>\
                                        <div class='col s12 input-field'>\
                                            <label for="+groups[index]+"-"+i+"-"+'nombre'+" class='black-text' data-error='Por favor ingrese el nombre del pasajero'>Nombre</label>\
                                            <input id="+groups[index]+"-"+i+"-"+'nombre'+" type='text' class='validate' required>\
                                        </div>\
                                    </div>\
                                    <div class='row'>\
                                        <div class='col s12 input-field'>\
                                            <label for="+groups[index]+"-"+i+"-"+'apellido'+" class='black-text' data data-error='Por favor ingrese el apellido del pasajero'>Apellido</label>\
                                            <input id="+groups[index]+"-"+i+"-"+'apellido'+" type='text' class='validate' required>\
                                        </div>\
                                    </div>   \
                                    <div class='row'>\
                                        <div class='col s12 input-field'>\
                                            <select id="+groups[index]+"-"+i+"-"+'sexo'+" class='validate' required>\
                                                <option value='' disabled selected>Elegir sexo</option>\
                                                <option value='Masculino'>Masculino</option>\
                                                <option value='Femenino'>Femenino</option>\
                                            </select>\
                                        </div>\
                                    </div>    \
                                    <div class='row'>\
                                        <div class='input-field col s4'> \
                                                <label for="+groups[index]+"-"+i+"-"+'dia'+" class='black-text'>Dia</label> <!-- No deberia poder ser negativo -->\
                                                <input id="+groups[index]+"-"+i+"-"+'dia'+" type='number' class='validate' required> \
                                            </div>\
                                            <div class='input-field col s4'>\
                                                <select id="+groups[index]+"-"+i+"-"+'mes'+" class='validate' required>\
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
                                                <label class='black-text'>Mes</label>\
                                            </div>\
                                            <div class='input-field col s4'>\
                                                <label for="+groups[index]+"-"+i+"-"+'anio'+" class='black-text'>Año</label>\
                                                <input id="+groups[index]+"-"+i+"-"+'anio'+" type='text' class='validate' required>\
                                            </div>\
                                            <div class='col s12 input-field'>\
                                            <label for="+groups[index]+"-"+i+"-"+'documento'+" class='black-text' data-error='Por favor ingrese el documento del pasajero'>Documento</label>\
                                            <input id="+groups[index]+"-"+i+"-"+'documento'+" type='text' class='validate' required>\
                                        </div>\
                                    </div> ";   
                miHTML += form;
        }
    });
    $("#form").html(miHTML);
      
});

