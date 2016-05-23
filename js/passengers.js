/* 
 * TODO Todos los campos obligatorios. Msj que se entiendan
 */
$(function () {
    var session = getSessionData();
    //Make sure the user is supposed to be here, if not redirect to home
    if(session.outboundFlight === null || (!session.search.oneWayTrip && session.inboundFlight === null)) {
        window.location = "index.html";
    }
    

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
                var prefix = groups[index] + "-" + i + "-";
                


                var date = {
                    day: $("#" + prefix + "day").val(),
                    month: $("#" + prefix + "month").val(),
                    year: $("#" + prefix + "year").val()
                };
                var data = {
                    firstName: $("#" + prefix + "firstName").val(),
                    lastName: $("#" + prefix + "lastName").val(),
                    sex: $("#" + prefix + "sex").val(),
                    document: $("#" + prefix + "document").val(),
                    documentType: $("#" + prefix + "documentType").val()
                };
                var isDateRight = true;
              
                if(isEmpty(date.day,prefix + "day")){
                    $( "#" + prefix + 'day'+ 'Error').html("Ingrese la fecha de nacimiento"); 
                    dataIsValid = false;
                    isDateRight = false;
                }  else{
                    if(!/^([0-9]{1,2})$/.test(date.day)){
                        dataIsValid = false;
                        isDateRight = false;
                        $("#" + prefix + 'day').removeClass("valid");
                        $("#" + prefix + 'day').addClass("invalid"); 
                        $("#" + prefix + 'day'+ 'Error').html("Ingrese en el formato DD MM AAAA");
                    }
                }
                if(isEmpty(date.month, prefix + "month")){
                    $( "#" + prefix + 'day'+ 'Error').html("Ingrese la fecha de nacimiento"); 
                    dataIsValid = false;
                    isDateRight = false;
                }  else{
                    if(!/^([0-9]{1,2})$/.test(date.month)){
                        dataIsValid = false;
                        isDateRight = false;
                        $("#" + prefix + 'month').removeClass("valid");
                        $("#" + prefix + 'month').addClass("invalid"); 
                        $("#" + prefix + 'day'+ 'Error').html("Ingrese en el formato DD MM AAAA");
                    }
                }
                if(isEmpty(date.year, prefix + "year")){
                    $( "#" + prefix + 'day'+ 'Error').html("Ingrese la fecha de nacimiento"); 
                    dataIsValid = false;
                    isDateRight = false;
                } else{
                    if(!/^([0-9]{4})$/.test(date.year)){
                        dataIsValid = false;
                        isDateRight = false;
                        $("#" + prefix + 'year').removeClass("valid");
                        $("#" + prefix + 'year').addClass("invalid"); 
                        $("#" + prefix + 'day'+ 'Error').html("Ingrese en el formato DD MM AAAA");
                    }
                }  


                if(isDateRight){
                    if (!validateDate(date)) { //Valida si es una fecha
                        dataIsValid = false;
                        $("#" + prefix + 'day').removeClass("valid");
                        $("#" + prefix + 'day').addClass("invalid");
                        $("#" + prefix + 'month').removeClass("valid");
                        $("#" + prefix + 'month').addClass("invalid");
                        $("#" + prefix + 'year').removeClass("valid");
                        $("#" + prefix + 'year').addClass("invalid");
                        $( "#" + prefix + 'day'+ 'Error').html("No corresponde a una fecha"); 
                    } else {
                        data.birthday = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
                        if (!validateBirthday(data.birthday, index)) { //Valida si los groupos son lo que dice la fecha.
                            dataIsValid = false;
                            $("#" + prefix + 'day').removeClass("valid");
                            $("#" + prefix + 'day').addClass("invalid");
                            $("#" + prefix + 'month').removeClass("valid");
                            $("#" + prefix + 'month').addClass("invalid");
                            $("#" + prefix + 'year').removeClass("valid");
                            $("#" + prefix + 'year').addClass("invalid");
                            $( "#" + prefix + 'day'+ 'Error').html("No corresponde a la edad de un "+ spanishGroups[index]); 
                        } else {
                            $("#" + prefix + 'day').removeClass("invalid");
                            $("#" + prefix + 'day').addClass("valid");
                            $("#" + prefix + 'month').removeClass("invalid");
                            $("#" + prefix + 'month').addClass("valid");
                            $("#" + prefix + 'year').removeClass("invalid");
                            $("#" + prefix + 'year').addClass("valid");
                             $( "#" + prefix + 'day'+ 'Error').html(""); 
                        }
                    }
                }



                if(isEmpty(data.firstName, prefix + "firstName")){
                    $( "#" + prefix + 'firstName'+ 'Error').html("Ingrese el nombre del pasajero");

                    dataIsValid = false;
                }else{
                    if (!validateName(data.firstName)) {
                        dataIsValid = false;
                        $( "#" + prefix + 'firstName'+ 'Error').html("Ingrese el nombre sin usar números ni caracteres especiales");
                    }else{
                        $( "#" + prefix + 'firstName'+ 'Error').html("");  
                    }

                }
                 if(isEmpty(data.lastName, prefix + "lastName")){
                    $( "#" + prefix + 'lastName'+ 'Error').html("Ingrese el apellido del pasajero");

                    dataIsValid = false;
                }else{
                    if (!validateName(data.lastName)) {
                        dataIsValid = false;
                        $( "#" + prefix + 'lastName'+ 'Error').html("Ingrese el apellido sin usar números ni caracteres especiales");
                    }else{
                        $( "#" + prefix + 'lastName'+ 'Error').html("");  
                    }

                }
                
                if(data.sex!=="Masculino" && data.sex!=="Femenino"){
                     $( "#" + prefix + 'sex'+ 'Error').html("Ingrese el sexo del pasajero");
                    $("#"+prefix + "sex"+"").removeClass("valid");
                    $("#"+prefix + "sex"+"").addClass("invalid");
                    dataIsValid = false;
                } else {
                    $( "#" + prefix + 'sex'+ 'Error').html("");
                    $("#"+prefix + "sex"+"").removeClass("invalid");
                    $("#"+prefix + "sex"+"").addClass("valid");
                }
                
                $("#"+prefix + "sex"+"").material_select();
                if(isEmpty(data.document, prefix + "document")){
                     $( "#" + prefix + 'document'+ 'Error').html("Ingrese el documento del pasajero");
                    dataIsValid = false;
                }else{
                    if(!validateDNI(data.document)){
                         $( "#" + prefix + 'document'+ 'Error').html("El documento debe estar compuesto por entre 1 y 8 números");
                        dataIsValid=false;
                    }else{
                         $( "#" + prefix + 'document'+ 'Error').html("");
                    }
                }  
                if(isEmpty(data.documentType, prefix + "documentType")){
                    dataIsValid=false;
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
        $submitBtn.html("Siguiente <i class='material-icons right'>send</i>");
        $submitBtn.removeClass("disabled");
        if (!dataIsValid) {
            
            return;
        }
        var nextPage = session.state.hasPayment ? "order-summary.html" : "payment.html";
        session.state.hasPassengers = true;
        setSessionData(session);
//        window.location = nextPage;
       
        $submitBtn.trigger("focusout");
    
        window.location = "payment.html";
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
            var prefix = groups[index] + "-" + i + "-";
            //TODO que el select sea required
            //<input type='hidden' id=" + prefix + 'isValidDate' + " value='false' />\
                                

            var form = "<div class=card-panel>\
                            <span class='card-title'>"+spanishGroups[index] + " " + (i + 1) + " de " + value+"</span>\
                            <input type='hidden' id='"+ prefix +"groupNum' value='"+index+"' />\
                            <div class='row'>\
                                <div class='col s7 input-field'>\
                                    <i  class='material-icons prefix'>account_circle</i>\
                                    <label for=" + prefix + 'firstName' + " class='black-text' data-error='Por favor ingrese el nombre del pasajero'>Nombre</label>\
                                    <input data-field ="+ prefix +" id=" + prefix + 'firstName' + " type='text' pattern='^([A-zÀ-ÿ ]{1,})$' class='field validate'   placeholder=' ' >\
                                    <label id="+ prefix + 'firstName' + 'Error' + " class='red-text diegoSuperCoolLabel3'></label>\
                                </div>\
                                <div class='input-field col s2'> \
                                    <i class='material-icons prefix'>perm_contact_calendar</i>\
                                    <label for=" + prefix + 'day' + " class='black-text' data-error='' id='diegoBirthdayLabel'>Fecha de nacimiento</label>\
                                    <input data-field ="+ prefix + " id=" + prefix + 'day' + " type='text' pattern='[0-9]{1,2}' class='field validate'    placeholder='Dia'> \
                                    <label id="+ prefix + 'day' + 'Error' + " class='red-text diegoSuperCoolLabel3'></label>\
                                </div>\
                                <div class='input-field col s1'> \
                                    <label for=" + prefix + 'month' + " class='black-text'></label> \
                                    <input  data-field ="+ prefix + " id=" + prefix + 'month' + " type='text' pattern='[0-9]{1,2}' class='validate field'    placeholder='Mes'> \
                                    <label id="+ prefix + 'month' + 'Error' + " class='red-text diegoSuperCoolLabel3'></label>\
                                </div>\
                                <div class='input-field col s2'>\
                                    <label for=" + prefix + 'year' + " class='black-text'></label>\
                                    <input  data-field ="+ prefix + "  id=" + prefix + 'year' + " type='text' pattern='[0-9]{4}' class='validate field'    placeholder='Año'>\
                                    <label id="+ prefix + 'year' + 'Error' + " class='red-text diegoSuperCoolLabel3'></label>\
                                </div>\
                            </div>   \
                            <div class='row'>\
                                <div class='col s7 input-field'>\
                                    <i  class='material-icons prefix'>account_circle</i>\
                                    <label for=" + prefix + 'lastName' + " class='black-text' data data-error='Por favor ingrese el apellido del pasajero'>Apellido</label>\
                                    <input data-field ="+ prefix +" id=" + prefix + 'lastName' + " type='text' pattern='^([A-zÀ-ÿ ]{1,})$' class='validate field' placeholder=' '   >\
                                    <label id="+ prefix + 'lastName' + 'Error' + " class='red-text diegoSuperCoolLabel3'></label>\
                                </div>\
                                <div class='col s5 input-field'>\
                                    <i class='material-icons prefix diegoIcon'>perm_identity</i>\
                                    <label id="+ prefix + 'sex' + 'Error' + " class='red-text diegoGenderLabel'></label>\
                                    <select data-field ="+ prefix +" id=" + prefix + 'sex' + " class='validate field'   >\
                                        <option value=''>Elegir sexo</option>\
                                        <option value='Masculino'>Masculino</option>\
                                        <option value='Femenino'>Femenino</option>\
                                    </select>\
                                </div>\
                            </div>    \
                            <div class='row'>\
                                <div class='col s4 input-field'>\
                                    <i class='material-icons prefix diegoIcon'>picture_in_picture</i>\
                                    <select data-field ="+ prefix +" id=" + prefix + 'documentType' + " class='validate'   >\
                                        <option value='DNI'>DNI</option>\
                                        <option value='Pasaporte'>Pasaporte</option>\
                                    </select>\
                                </div>\
                                <div class='col s8 input-field'>\
                                    <i  class='material-icons prefix'>picture_in_picture</i>\
                                    <label id="+ prefix + 'document' + 'Error' + " class='red-text diegoSuperCoolLabel3'></label>\
                                    <label for=" + prefix + 'document' + " class='black-text' data-error='Por favor ingrese el documento del pasajero'>Documento</label>\
                                    <input data-field ="+ prefix +" id=" + prefix + 'document' + " type='text' pattern='^([0-9]{1,8})$' class='validate field' placeholder=' '   >\
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
    
//    $([session.search.numAdults, session.search.numChildren, session.search.numInfants]).each(function (index, value) {
//        for (var i = 0; i < value; i++)
//        {
//            
            
            $("#form").on("change", ".field", function(){
                debugger;
                var prefix = $(this).attr("data-field");
                var dataIsValid = true;


                var date = {
                    day: $("#" + prefix + "day").val(),
                    month: $("#" + prefix + "month").val(),
                    year: $("#" + prefix + "year").val()
                };
                var data = {
                    firstName: $("#" + prefix + "firstName").val(),
                    lastName: $("#" + prefix + "lastName").val(),
                    sex: $("#" + prefix + "sex").val(),
                    document: $("#" + prefix + "document").val(),
                    documentType: $("#" + prefix + "documentType").val()
                };
                if(date.year!=="" && !/^([0-9]{4})$/.test(date.year)){
                    dataIsValid = false;
                    $("#" + prefix + 'year').removeClass("valid");
                    $("#" + prefix + 'year').addClass("invalid"); 
                    $("#" + prefix + 'day'+ 'Error').html("Ingrese en el formato DD MM AAAA");
                }
                 if(date.month!=="" && !/^([0-9]{1,2})$/.test(date.month)){
                    dataIsValid = false;
                    $("#" + prefix + 'month').removeClass("valid");
                    $("#" + prefix + 'month').addClass("invalid"); 
                    $("#" + prefix + 'day'+ 'Error').html("Ingrese en el formato DD MM AAAA");
                }
                 if(date.day!=="" && !/^([0-9]{1,2})$/.test(date.day)){
                    dataIsValid = false;
                    $("#" + prefix + 'day').removeClass("valid");
                    $("#" + prefix + 'day').addClass("invalid"); 
                    $("#" + prefix + 'day'+ 'Error').html("Ingrese en el formato DD MM AAAA");
                }
                

                if(date.day!=="" && date.month!=="" && date.year!=="" && dataIsValid){
                    if (!validateDate(date)) { //Valida si es una fecha
                        dataIsValid = false;
                        
                        $("#" + prefix + 'day').removeClass("valid");
                        $("#" + prefix + 'day').addClass("invalid");
                        $("#" + prefix + 'month').removeClass("valid");
                        $("#" + prefix + 'month').addClass("invalid");
                        $("#" + prefix + 'year').removeClass("valid");
                        $("#" + prefix + 'year').addClass("invalid");
                        $("#" + prefix + 'day'+ 'Error').html("No corresponde a una fecha"); 
                    } else {
                        data.birthday = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
                        if (!validateBirthday(data.birthday, $(prefix+"groupNum").val())) { //Valida si los groupos son lo que dice la fecha.
                            dataIsValid = false;
                            
                            $("#" + prefix + 'day').removeClass("valid");
                            $("#" + prefix + 'day').addClass("invalid");
                            $("#" + prefix + 'month').removeClass("valid");
                            $("#" + prefix + 'month').addClass("invalid");
                            $("#" + prefix + 'year').removeClass("valid");
                            $("#" + prefix + 'year').addClass("invalid");
                            $( "#" + prefix + 'day'+ 'Error').html("No corresponde a la edad de un "+ spanishGroups[index]); 
                        } else {
                            $("#" + prefix + 'day').removeClass("invalid");
                            $("#" + prefix + 'day').addClass("valid");
                            $("#" + prefix + 'month').removeClass("invalid");
                            $("#" + prefix + 'month').addClass("valid");
                            $("#" + prefix + 'year').removeClass("invalid");
                            $("#" + prefix + 'year').addClass("valid");
                            $( "#" + prefix + 'day'+ 'Error').html(""); 
                        }
                    }
                }



                if(data.firstName!==""){
                    if (!validateName(data.firstName)) {
                        dataIsValid = false;
                        var id = prefix + "firstName";
                        $("#"+id+"").removeClass("valid");
                         $("#"+id+"").addClass("invalid");
                        $( "#" + prefix + 'firstName'+ 'Error').html("Ingrese el nombre sin usar números ni caracteres especiales");
                    }else{
                        $( "#" + prefix + 'firstName'+ 'Error').html("");  
                         var id = prefix + "firstName";
                          $("#"+id+"").removeClass("invalid");
                         $("#"+id+"").addClass("valid");
                    }

                }
                 if(data.lastName!==""){
                    if (!validateName(data.lastName)) {
                        dataIsValid = false;
                       var id = prefix + "lastName";
                        $("#"+id+"").removeClass("valid");
                         $("#"+id+"").addClass("invalid");
                        $( "#" + prefix + 'lastName'+ 'Error').html("Ingrese el apellido sin usar números ni caracteres especiales");
                    }else{
                        $( "#" + prefix + 'lastName'+ 'Error').html("");  
                         var id = prefix + "lastName";
                          $("#"+id+"").removeClass("invalid");
                         $("#"+id+"").addClass("valid");
                    }

                }
                
                 if(data.sex==="Masculino" || data.sex==="Femenino"){
                    $( "#" + prefix + 'sex'+ 'Error').html("");
                    $("#"+prefix + "sex"+"").removeClass("invalid");
                    $("#"+prefix + "sex"+"").addClass("valid");
                }
                
//                if(isEmpty(data.sex,prefix + "sex")){
////                    $( "#" + prefix + 'sex'+ 'Error').html("");
//                    dataIsValid = false;
//                }else{
//                    if(!data.sex){
//                         $( "#" + prefix + 'sex'+ 'Error').html("Ingrese el sexo del pasajero");
//                        $("#"+prefix + "sex"+"").removeClass("valid");
//                        $("#"+prefix + "sex"+"").addClass("invalid");
//                        dataIsValid = false;
//                    } else {
//                         $( "#" + prefix + 'sex'+ 'Error').html("");
//                        $("#"+prefix + "sex"+"").removeClass("invalid");
//                        $("#"+prefix + "sex"+"").addClass("valid");
//                    }
//                }  
//                $("#"+prefix + "sex"+"").material_select();
                if(data.document!==""){
                    if(!validateDNI(data.document)){
                         $( "#" + prefix + 'document'+ 'Error').html("El documento debe estar compuesto por entre 1 y 8 números");
                        dataIsValid=false;
                        var id = prefix + "document";
                        $("#"+id+"").removeClass("valid");
                         $("#"+id+"").addClass("invalid");
                    }else{
                         $( "#" + prefix + 'document'+ 'Error').html("");
                          var id = prefix + "document";
                          $("#"+id+"").removeClass("invalid");
                         $("#"+id+"").addClass("valid");
                    }
                }  
                
            });
//            $("#form").on("change", "#" + prefix + 'lastName', updateErrors());
//            $("#form").on("change", "#" + prefix + 'document', updateErrors());
//            $("#form").on("change", "#" + prefix + 'sex', updateErrors());
//            $("#form").on("change", "#" + prefix + 'day', updateErrors());
//            $("#form").on("change", "#" + prefix + 'month', updateErrors());
//            $("#form").on("change", "#" + prefix + 'year', updateErrors());
            
//            $("#form").on("change", "#" + prefix + 'firstName', function() {
//                
//                var idName = $(this).attr("id");
//                var val = $(this).val();
//                if(val===""){
//                    $( "#"+idName+ 'Error').html("Por favor ingrese el nombre del pasajero");
//                }else if(!/^([a-zA-Z ]{1,})$/.test(val)){
//                    $( "#"+idName+ 'Error').html("Tiene que ingresar un nombre con caracteres validos");
//                }  else{
//                    $( "#"+idName+ 'Error').html("");
//                }
//            });
//            
//            $("#form").on("change", "#" + prefix + 'lastName', function() {
//                var idName = $(this).attr("id");
//                var val = $(this).val();
//                if(val===""){
//                    $( "#"+idName+ 'Error').html("Por favor ingrese el apellido del pasajero");
//                }else if(!/^([a-zA-Z ]{1,})$/.test(val)){
//                    $( "#"+idName+ 'Error').html("Tiene que ingresar un apellido con caracteres validos");
//                }  else{
//                    $( "#"+idName+ 'Error').html("");
//                }
//            });
//            
//            $("#form").on("change", "#" + prefix + 'document', function() {
//                var idName = $(this).attr("id");
//                var val = $(this).val();
//                if(val===""){
//                    $( "#"+idName+ 'Error').html("Por favor ingrese el documento del pasajero");
//                }else if(!/^([0-9]{1,8})$/.test(val)){
//                    $( "#"+idName+ 'Error').html("Tiene que ingresar entre 1 y 8 números");
//                }  else{
//                    $( "#"+idName+ 'Error').html("");
//                }
//            });
//            
//            $("#form").on("change", "#" + prefix + 'day', function() {
////                var idName = $(this).attr("id");
//                var val = $(this).val();
//                var field = $(this).attr("data-field");
//                var day = $(field+'day').val();
//                var month = $(field+'month').val();
//                var year = $(field+'year').val();
//                if(val===""){
//                    $( "#"+field+'day'+ 'Error').html("Por favor ingrese la fecha de nacimiento");
//                }else if(!/^([a-zA-Z ]{1,})$/.test(val)){
//                    $( "#"+field+'day'+ 'Error').html("Tiene que ingresar la fecha en números");
//                }  else{
//                    $( "#"+field+'day'+ 'Error').html("");
//                }
//            }); 
//            
//            $("#form").on("change", "#" + prefix + 'day', function() {
//                var idName = $(this).attr("id");
//                var val = $(this).val();
//                var field = $(this).attr("data-field");
//                if(val===""){
//                    $( "#"+data-field+'day'+ 'Error').html("Por favor ingrese la fecha de nacimiento");
//                }else if(!/^([a-zA-Z ]{1,})$/.test(val)){
//                    $( "#"+data-field+'day'+ 'Error').html("Tiene que ingresar la fecha en números");
//                }  else{
//                    $( "#"+data-field+'day'+ 'Error').html("");
//                }
//            }); 
            
//            
//       }
//    });
    
    //Tiene que pasar antes que lo de despues. Semaforos? 
    //$("select[required]").css({display: "inline", height: 0, padding: 0, width: 0}); Ya no sirve creo



    //    if(session.state.hasPassengers){ //Para que siempre intente. Pero ahora pueden haber cosas null
    $([session.search.numAdults, session.search.numChildren, session.search.numInfants]).each(function (index, value) {
        for (var i = 0; i < value && i < session.passengers[groups[index]].length; i++)
        {
            var prefix = groups[index] + "-" + i + "-";
            $("#" + prefix + 'firstName').val(session.passengers[groups[index]][i].firstName);
            $("#" + prefix + 'lastName').val(session.passengers[groups[index]][i].lastName);
            $("#" + prefix + 'document').val(session.passengers[groups[index]][i].document);
            $("#" + prefix + 'documentType').val(session.passengers[groups[index]][i].documentType);
            $("#" + prefix + 'sex').val(session.passengers[groups[index]][i].sex);
            $("#" + prefix + 'sex').material_select(); //Creo que no sirve para nada
            var birthday = new Date(session.passengers[groups[index]][i].birthday);
            $("#" + prefix + 'day').val(birthday.getUTCDate());
            $("#" + prefix + 'month').val(birthday.getUTCMonth() + 1);
            $("#" + prefix + 'year').val(birthday.getFullYear());
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

function isEmpty(information, id){
    if (information === ""){
//        $("label[for="+id+"]").attr("data-error", "Por favor ingrese solo caracters validos");
            $("#"+id+"").removeClass("valid");
            $("#"+id+"").addClass("invalid");
            return true;
        } else {
            $("#"+id+"").removeClass("invalid");
            $("#"+id+"").addClass("valid");
            return false;
        }
}


function validateDNI(DNI) {
    return /^([0-9]{1,8})$/.test(DNI);
    
}

function validateName(name) {
    return /^([A-zÀ-ÿ ]{1,})$/.test(name);
    //http://stackoverflow.com/a/26900132/2333689 Para caracteres con acentos
}
//
//function changeError(idName,error){
//    
//    debugger;
//     
//    if($(idName).hasClass("invalid")){
//        $( idName+ 'Error').html(error);
//    }else{
//        $( idName+ 'Error').html("");
//    } 
//          
//}
