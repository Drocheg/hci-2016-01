function getGeneralScore(friendliness, food, punctuality, millage_program, comfort, quality_price) {
    var score = 0;
    score = Number(friendliness) + Number(food) + Number(punctuality) + Number(millage_program) + Number(comfort) + Number(quality_price);
    score = score / 6;
    score = score.toFixed(0);
    return score;
}

function submitReview(airlineID, flightNum, friend, food, punct, mileage, comfort, quality, recommend, comments) {
    $.ajax({
        type: "POST",
        url: "http://eiffel.itba.edu.ar/hci/service4/review.groovy?method=reviewairline",
        contentType: 'aplication/json', //TODO SACAR CABLEADO DE ID
        data: JSON.stringify({flight: {airline: {id: "AR"}, number: flightNum}, rating: {friendliness: friend, food: food, punctuality: punct, mileage_program: mileage, comfort: comfort, quality_price: quality}, yes_recommend: recommend, comments: comments})  //TODO yes_recommend false rompe
    })
            .done(function (result) {
                if (result.error) {
                    Materialize.toast("Error, decile a Juan esto:");      //TODO remove
                    Materialize.toast(JSON.stringify(result.error));
                } else {
                    if (result.review !== true) {
                        Materialize.toast("Error, decile a Juen");       //TODO remove
                    } else {
                        Materialize.toast("Review subida vieja");       //TODO remove
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

function getGETParams() {
    var str = window.location.search.substr(1);
    return str !== null && str !== "" ? URLStringToObj(str) : {};
}

function URLStringToObj(str) {
    var params = {};
    var prmarr = str.split("&");
    for (var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

$(function () {
    $(document).ready(function() {
       $('select').material_select();
    });


    $("#review-form").on("submit", function (event) {
        event.preventDefault();
        var $submitBtn = $("#review-form button[type=submit]");
        $submitBtn.html("Validando...");
        var session = getSessionData();
        var params = getGETParams();
        var data = {
            id: params.airlineID,
            flightNum: params.flightNumber,
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