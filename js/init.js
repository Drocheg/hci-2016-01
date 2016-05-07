$(function () {  //Document.ready
    //Enable the side navigation bar
    $('.button-collapse').sideNav();
    //Initialize select drop-downs, if any
    $('select').material_select();
    //Is there local storage?
    if(typeof (window.Storage) === "undefined") {
        //TODO what to do without local storage?
    }
});