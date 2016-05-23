function getGeneralScore(friendliness, food, punctuality, millage_program, comfort, quality_price) {
    var score = 0;
    score = Number(friendliness) + Number(food) + Number(punctuality) + Number(millage_program) + Number(comfort) + Number(quality_price);
    score = score / 6;
    score = score.toFixed(0);
    return score;
}

// Validate that the user has checked one of the radio buttons
function isValidRadio(radioGroup, helperMsg) {
    var valid = false;
    for (var i = 0; i < radioGroup.length; i++) {
        if (radioGroup[i].checked) {
            return true;
        }
    }
//    Materialize.toast(helperMsg, 5000);
    radioGroup[0].focus();
    return false;
}

function radioFormValid(friend, food, punct, mileage, comfort, quality, recommend) {
    var valid = true;
   
        if(!isValidRadio(friend, "Campo amabilidad no esta completado")){
            valid = false;
            $("#friendlinessError").html("Campo amabilidad no esta completado");            
        }else{
            $("#friendlinessError").html("");            
        }
        if(!isValidRadio(food, "Campo amabilidad no esta completado")){
            valid = false;
            $("#foodError").html("Campo comida no esta completado");            
        }else{
            $("#foodError").html("");            
        }
        if(!isValidRadio(punct, "Campo amabilidad no esta completado")){
            valid = false;
            $("#punctualityError").html("Campo puntualidad no esta completado");            
        }else{
            $("#punctualityError").html("");            
        }
        if(!isValidRadio(mileage, "Campo amabilidad no esta completado")){
            valid = false;
            $("#millage_programError").html("Campo programa no esta completado");            
        }else{
            $("#millage_programError").html("");            
        }
        if(!isValidRadio(comfort, "Campo amabilidad no esta completado")){
            valid = false;
            $("#comfortError").html("Campo comodidad no esta completado");            
        }else{
            $("#comfortError").html("");            
        }
        if(!isValidRadio(quality, "Campo amabilidad no esta completado")){
            valid = false;
            $("#quality_priceError").html("Campo calidad no esta completado");            
        }else{
            $("#quality_priceError").html("");            
        }
         if(!isValidRadio(recommend, "Campo amabilidad no esta completado")){
            valid = false;
            $("#recommendError").html("Campo recomendado no esta completado");            
        }else{
            $("#recommendError").html("");            
        }
        
        if($("#comment").val()===""){
            valid = false;
            $("#comment").removeClass("valid");
            $("#comment").addClass("invalid");
             $("#commentError").html("Ingrese un comentario");
        }else{
            $("#comment").removeClass("invalid");
            $("#comment").addClass("valid");
             $("#commentError").html("");
        }
        
        
        return valid;
}

function submitReview(airlineID, flightNum, friend, food, punct, mileage, comfort, quality, recommend, comments) {
    $.ajax({
        type: "POST",
        url: "http://eiffel.itba.edu.ar/hci/service4/review.groovy?method=reviewairline",
        contentType: 'aplication/json',
        data: JSON.stringify({flight: {airline: {id: airlineID}, number: flightNum}, rating: {friendliness: friend, food: food, punctuality: punct, mileage_program: mileage, comfort: comfort, quality_price: quality}, yes_recommend: recommend, comments: comments})
    })
            .done(function (result) {
                if (result.error) {

                    Materialize.toast(JSON.stringify(result.error), 5000);
                } else {
                    if (result.review !== true) {
                               //TODO remove
                    } else {
                        window.location = "reviews.html?airlineId=" + airlineID + "&flightNum=" + flightNum;
                    }
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown)
            {
                Materialize.toast("Connection error, please try again.", 5000); //TODO translate
                console.log("Connection error. Error data:");
                console.log("jqXHR: " + JSON.stringify(jqXHR));
                console.log("Text status: " + textStatus);
                console.log("Error thrown: " + errorThrown);
            });
}

$(function () {
    if(getGETparam("airlineId") === null || getGETparam("flightNum") === null) {
        window.location = "index.html";
    }
    

    $(document).ready(function () {
        $('select').material_select();
    });

    $("#review-form>fieldset>input").change(function(){
       
   
        if(!isValidRadio($("input[name=friendliness]"), "Campo amabilidad no esta completado")){
            valid = false;
            
        }else{
            $("#friendlinessError").html("");            
        }
        if(!isValidRadio($("input[name=food]"), "Campo amabilidad no esta completado")){
            valid = false;
            
        }else{
            $("#foodError").html("");            
        }
        if(!isValidRadio($("input[name=punctuality]"), "Campo amabilidad no esta completado")){
            valid = false;
             
        }else{
            $("#punctualityError").html("");            
        }
        if(!isValidRadio($("input[name=millage_program]"), "Campo amabilidad no esta completado")){
            valid = false;
                       
        }else{
            $("#millage_programError").html("");            
        }
        if(!isValidRadio($("input[name=comfort]"), "Campo amabilidad no esta completado")){
            valid = false;
                     
        }else{
            $("#comfortError").html("");            
        }
        if(!isValidRadio($("input[name=quality_price]"), "Campo amabilidad no esta completado")){
            valid = false;
                    
        }else{
            $("#quality_priceError").html("");            
        }
         if(!isValidRadio($("input[name=recommend]"), "Campo amabilidad no esta completado")){
            valid = false;
                      
        }else{
            $("#recommendError").html("");            
        }
        
        if($("#comment").val()===""){
            valid = false;
           
        }else{
            $("#comment").removeClass("invalid");
            $("#comment").addClass("valid");
             $("#commentError").html("");
        }
   
   
    
    
    });

    $("#review-form").on("submit", function (event) {
        event.preventDefault();
        var $submitBtn = $("#review-form button[type=submit]");
        $submitBtn.html("Validando...");
        var session = getSessionData();
        if (!radioFormValid($("input[name=friendliness]"), $("input[name=food]"), $("input[name=punctuality]"), $("input[name=millage_program]"), $("input[name=comfort]"), $("input[name=quality_price]"), $("input[name=recommend]"))) {
            $submitBtn.html("Confirmar");
            return;
        }
        var data = {
            id: getGETparam('airlineId'),
            flightNum: getGETparam('flightNum'),
            friendliness: $("input[name=friendliness]:checked").val(),
            food: $("input[name=food]:checked").val(),
            punctuality: $("input[name=punctuality]:checked").val(),
            millage_program: $("input[name=millage_program]:checked").val(),
            comfort: $("input[name=comfort]:checked").val(),
            quality_price: $("input[name=quality_price]:checked").val(),
            recommendation: $("input[name=recommend]:checked").val(),
            comments: $("#comment").val()
        };
        data.general = getGeneralScore(data.friendliness, data.food, data.punctuality, data.millage_program, data.comfort, data.quality_price);
        debugger;
        submitReview(data.id, Number(data.flightNum), Number(data.friendliness), Number(data.food), Number(data.punctuality), Number(data.millage_program), Number(data.comfort), Number(data.quality_price), Boolean(data.recommendation), data.comments);
    });
});

