$(function () {

    //the minx, miny, maxx, maxy define the area to show photos from (minimum longitude, latitude, maximum longitude and latitude, respectively).
    //http://www.panoramio.com/map/get_panoramas.php?set=public&from=0&to=20&minx=-180&miny=-90&maxx=180&maxy=90&size=medium&mapfilter=true


    /* *************************************************************************
     *                      Suggestion boxes
     * ************************************************************************/
    //Hide boxes when to/from fields lose focus, and bring them back when
    //regaining focus
    $("#from").on("blur", function () {
        $("#fromSuggestions").hide();
    });
    $("#from").on("focus", function () {
        $("#fromSuggestions").show();
    });
    $("#to").on("blur", function () {
        $("#toSuggestions").hide();
    });
    $("#to").on("focus", function () {
        $("#toSuggestions").show();
    });
    //Update to/from fields when selecting an option
    //Why use mousedown and not click: http://stackoverflow.com/a/9335401/2333689
    //Why use 2nd parameter for on instead of putting selector directly: http://stackoverflow.com/a/15090957/2333689
    $("#fromSuggestions").on('mousedown', 'ul li', function (event) {
        $("#from").val($(this).data("value"));
        $("#fromSuggestions").hide();
        $("#from").trigger("input");    //Update angular's model watching this input field
    });
    $("#toSuggestions").on('mousedown', 'ul li', function (event) {
        $("#to").val($(this).data("value"));
        $("#toSuggestions").hide();
        $("#to").trigger("input");
    });

    /***********************************************************************
    *                            Deals
    ***********************************************************************/
});
