/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * TODO Todos los campos obligatorios. Msj que se entiendan
 */
$(function () {
   
    
    var session = getSessionData();
    session.search.numAdults=2;
    setSessionData(session);

    //Try to validate date immediately??? TODO Borrar esto o hacerlo. Sirve aca?

//    $('select').change(function(){
//        $(this[name=""]).attr('disabled', 'disabled');
//        $(this).material_select();
//    });

    $("#passengers-form").on("submit", function (event) {
        event.preventDefault();
        var $submitBtn = $("#passengers-form button[type=submit]");
        $submitBtn.addClass("disabled");
        $submitBtn.html("Validando...");
        var groups = ["adults", "children", "infants"];
        var spanishGroups = ["Adultos", "Niños", "Infantes"];
        var session = getSessionData();
        var dataIsValid = true;
        $([session.search.numAdults, session.search.numChildren, session.search.numInfants]).each(function (index, value) {
            //Si se hace corte se ahorra tiempo pero no se podrian poner los carteles.            
//            if(!dataIsValid){
//                return;
//            }
            session.passengers[groups[index]] = [];

            for (var i = 0; i < value; i++) {
                var date = {
                    day: $("#" + groups[index] + "-" + i + "-" + "day").val(),
                    month: $("#" + groups[index] + "-" + i + "-" + "month").val(),
                    year: $("#" + groups[index] + "-" + i + "-" + "year").val()
                };
                var data = {
                    firstName: $("#" + groups[index] + "-" + i + "-" + "firstName").val(),
                    lastName: $("#" + groups[index] + "-" + i + "-" + "lastName").val(),
                    sex: $("#" + groups[index] + "-" + i + "-" + "sex").val(),
                    document: $("#" + groups[index] + "-" + i + "-" + "document").val(),
                    documentType: $("#" + groups[index] + "-" + i + "-" + "documentType").val()
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
                //Al pedo? Ya hago Patter antes.
                if (!validateName(data.firstName)) {
                    dataIsValid = false;

                }

                if (!validateName(data.lastName)) {
                    dataIsValid = false;

                }
                //Validar documento
//                if(!validateDNI(data.DNI)){
//                    dataIsValid=false;
//                    
//                }

                //TODO los msj no anda -.-
                if (!validateDate(date)) { //Valida si es una fecha
                    dataIsValid = false;
                    $("label[for=" + groups[index] + "-" + i + "-" + 'day' + "]").attr("data-error", "Datos no corresponden a un Fecha");
                    $("#" + groups[index] + "-" + i + "-" + 'day').removeClass("valid");
                    $("#" + groups[index] + "-" + i + "-" + 'day').addClass("invalid");
                    $("#" + groups[index] + "-" + i + "-" + 'month').removeClass("valid");
                    $("#" + groups[index] + "-" + i + "-" + 'month').addClass("invalid");
                    $("#" + groups[index] + "-" + i + "-" + 'year').removeClass("valid");
                    $("#" + groups[index] + "-" + i + "-" + 'year').addClass("invalid");
                } else {
                    data.birthday = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
                    if (!validateBirthday(data.birthday, index)) { //Valida si los groupos son lo que dice la fecha.
                        dataIsValid = false;
                        $("label[for=" + groups[index] + "-" + i + "-" + 'day' + "]").attr("data-error", "La edad no corresponde a un " + spanishGroups[index]);
                        $("#" + groups[index] + "-" + i + "-" + 'day').removeClass("valid");
                        $("#" + groups[index] + "-" + i + "-" + 'day').addClass("invalid");
                        $("#" + groups[index] + "-" + i + "-" + 'month').removeClass("valid");
                        $("#" + groups[index] + "-" + i + "-" + 'month').addClass("invalid");
                        $("#" + groups[index] + "-" + i + "-" + 'year').removeClass("valid");
                        $("#" + groups[index] + "-" + i + "-" + 'year').addClass("invalid");
                    } else {
                        $("#" + groups[index] + "-" + i + "-" + 'day').removeClass("invalid");
                        $("#" + groups[index] + "-" + i + "-" + 'day').addClass("valid");
                        $("#" + groups[index] + "-" + i + "-" + 'month').removeClass("invalid");
                        $("#" + groups[index] + "-" + i + "-" + 'month').addClass("valid");
                        $("#" + groups[index] + "-" + i + "-" + 'year').removeClass("invalid");
                        $("#" + groups[index] + "-" + i + "-" + 'year').addClass("valid");
                    }
                }



//TODO que te avise que esta mal y porque. Me copie de juan, pero creo que solo tien sentido doble si hago lo de validar antes. Que vamos a ahcr igual seguro.
//                if($("#"+groups[index]+"-"+i+"-"+'isValidDate').val() !== true) {
//                    validateDate(date, index);    
//                    if(!$("#"+groups[index]+"-"+i+"-"+'isValidDate').val()) {
//                        $submitBtn.html("Confirmar >");
//                        $submitBtn.removeClass("disabled");
//                        return;
//                    }
//                }

                session.passengers[groups[index]].push(data);
            }
        });

        if (!dataIsValid) {
            $submitBtn.html("Confirmar >");
            $submitBtn.removeClass("disabled");
            return;
        }
        var nextPage = session.state.hasPayment ? "order-summary.html" : "payment.html";
        session.state.hasPassengers = true;
        setSessionData(session);
        window.location = nextPage;
    });

    $("#backButton").on("click", function (event) {
        event.preventDefault();
        $("#backButton").addClass("disabled");
        window.history.back();
    });


    var session = getSessionData();
    var miHTML = "";
    var groups = ["adults", "children", "infants"];
    var spanishGroups = ["Adultos", "Niños", "Infantes"];
    $([session.search.numAdults, session.search.numChildren, session.search.numInfants]).each(function (index, value) {
        for (var i = 0; i < value; i++)
        {

            miHTML += spanishGroups[index] + " " + (i + 1) + " de " + value; //TODO que el select sea required

            var form = "<div class=card-panel>\
                            <div class='row'>\
                                <input type='hidden' id=" + groups[index] + "-" + i + "-" + 'isValidDate' + " value='false' />\
                                <div class='col s6 input-field'>\
                                    <label for=" + groups[index] + "-" + i + "-" + 'firstName' + " class='black-text' data-error='Por favor ingrese el nombre del pasajero'>Nombre</label>\
                                    <input id=" + groups[index] + "-" + i + "-" + 'firstName' + " type='text' pattern='^([a-zA-Z ]{1,})$' class='validate' required>\
                                </div>\
                                <div class='col s6 input-field'>\
                                    <label for=" + groups[index] + "-" + i + "-" + 'lastName' + " class='black-text' data data-error='Por favor ingrese el apellido del pasajero'>Apellido</label>\
                                    <input id=" + groups[index] + "-" + i + "-" + 'lastName' + " type='text' pattern='^([a-zA-Z ]{1,})$' class='validate' required>\
                                </div>\
                            </div>   \
                            <div class='row'>\
                                <div class='input-field col s4'> \
                                    <label for=" + groups[index] + "-" + i + "-" + 'day' + " class='black-text' data-error=''>Dia</label>\
                                    <input id=" + groups[index] + "-" + i + "-" + 'day' + " type='text' pattern='[0-9]{1,2}' class='validate' required> \
                                </div>\
                                <div class='input-field col s4'> \
                                    <label for=" + groups[index] + "-" + i + "-" + 'month' + " class='black-text'>Month</label> \
                                    <input id=" + groups[index] + "-" + i + "-" + 'month' + " type='text' pattern='[0-9]{1,2}' class='validate' required> \
                                </div>\
                                <div class='input-field col s4'>\
                                    <label for=" + groups[index] + "-" + i + "-" + 'year' + " class='black-text'>Año</label>\
                                    <input id=" + groups[index] + "-" + i + "-" + 'year' + " type='text' pattern='[0-9]{4}' class='validate' required>\
                                </div>\
                            </div>    \
                            <div class='row'>\
                                <div class='col s3 input-field'>\
                                    <select id=" + groups[index] + "-" + i + "-" + 'documentType' + " class='validate' required>\
                                        <option value='DNI'>DNI</option>\
                                        <option value='Pasaporte'>Pasaporte</option>\
                                    </select>\
                                </div>\
                                <div class='col s5 input-field'>\
                                    <label for=" + groups[index] + "-" + i + "-" + 'document' + " class='black-text' data-error='Por favor ingrese el documento del pasajero'>Documento</label>\
                                    <input id=" + groups[index] + "-" + i + "-" + 'document' + " type='text' pattern='^([0-9]{1,8})$' class='validate' required>\
                                </div>\
                                <div class='col s4 input-field'>\
                                    <select id=" + groups[index] + "-" + i + "-" + 'sex' + " class='validate' required>\
                                        <option value=''>Elegir sexo</option>\
                                        <option value='Masculino'>Masculino</option>\
                                        <option value='Femenino'>Femenino</option>\
                                    </select>\
                                </div>\
                            </div>\
                             <div class='row'>\
                             </div>\
                             <div class='row'>\
                             </div>\
                        </div>\  ";
            miHTML += form;
        }
    });


    $("#form").html(miHTML);


    $('select').val("");
    $("select option:selected").attr('disabled', 'disabled');
    //Tiene que pasar antes que lo de despues. Semaforos? 
    //$("select[required]").css({display: "inline", height: 0, padding: 0, width: 0}); Ya no sirve creo

    //    if(session.state.hasPassengers){ //Para que siempre intente. Pero ahora pueden haber cosas null
    $([session.search.numAdults, session.search.numChildren, session.search.numInfants]).each(function (index, value) {
        for (var i = 0; i < value && i < session.passengers[groups[index]].length; i++)
        {
            $("#" + groups[index] + "-" + i + "-" + 'firstName').val(session.passengers[groups[index]][i].firstName);
            $("#" + groups[index] + "-" + i + "-" + 'lastName').val(session.passengers[groups[index]][i].lastName);
            $("#" + groups[index] + "-" + i + "-" + 'document').val(session.passengers[groups[index]][i].document);
            $("#" + groups[index] + "-" + i + "-" + 'documentType').val(session.passengers[groups[index]][i].documentType);
            $("#" + groups[index] + "-" + i + "-" + 'sex').val(session.passengers[groups[index]][i].sex);
            $("#" + groups[index] + "-" + i + "-" + 'sex').material_select(); //Creo que no sirve para nada
            var birthday = new Date(session.passengers[groups[index]][i].birthday);
            $("#" + groups[index] + "-" + i + "-" + 'day').val(birthday.getUTCDate());
            $("#" + groups[index] + "-" + i + "-" + 'month').val(birthday.getUTCMonth() + 1);
            $("#" + groups[index] + "-" + i + "-" + 'year').val(birthday.getFullYear());
        }

    });

//    } 

    $('select').material_select();
});

function validateDate(date) { //TODO testear.
    // Check the ranges of month and year
    if (date.month == 0 || date.month > 12)
        return false;

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (date.year % 400 == 0 || (date.year % 100 != 0 && date.year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return date.day > 0 && date.day <= monthLength[date.month - 1];
}



function validateBirthday(birthday, index) {

    if (birthday > Date.now()) {
        return false;
    }
    var age = _calculateAge(birthday);
    if (index === 2 && age >= 2) {
        return false;
    }
    if (index === 1 && (age >= 12 || age < 2)) {//TODO 18?
        return false;
    }
    if (index === 0 && age < 11) {
        return false;
    }
    return true;
}

function _calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function validateDNI(DNI) {
    return /^([0-9]{1,8})$/.test(DNI);
}

function validateName(name) {
    return /^([a-zA-Z ]{1,})$/.test(name);
}
