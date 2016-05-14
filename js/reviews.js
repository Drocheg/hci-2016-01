/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


$(function() {
$(document).ready(function() {
$('select').material_select();
});

function getGeneralScore(friendliness, food, punctuality, millage_program, comfort, quality_price) {
    var score = 0;
    score = friendliness + food + punctuality + millage_program + comfort + quality_price;
    score = score/6;
    return score;
}

$("#review-form").on("submit", function(event) {
        event.preventDefault();
        var $submitBtn = $("#review-form button[type=submit]");
        $submitBtn.html("Validando...");
        var session = getSessionData();
        var data = {
                friendliness: $("#friendliness").val(),
                food: $("#food").val(),
                punctuality: $("#punctuality").val(),
                millage_program: $("#millage_program").val(),
                comfort: $("#comfort").val(),
                quality_price: $("#quality_price").val(),
                recommendation: $("#recommend").val(),
                comments: $("#comment").val(),
                general: getGeneralScore(this.friendliness, this.food, this.punctuality, this.millage_program, this.comfort, this.quality_price)
        };
        Materialize.toast(friendliness);
        
   });
});