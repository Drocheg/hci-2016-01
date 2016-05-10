/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


$(function() {
    var session = JSON.parse(sessionStorage.sessionData);
    $("#from").val(session.search.from);
    $("#to").val(session.search.to);
    $("#depart").val(session.search.depart);
    $("soloIda").prop('checked',session.search.isOneWayTrip);
    $("#return").val(session.search.return);
    $("#adults").val(session.search.adults);
    $("#infants").val(session.search.infants);
    $("#children").val(session.search.children);
});



//from to depart soloIda return adults children infants 