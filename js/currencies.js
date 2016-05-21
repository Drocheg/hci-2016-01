$(function () {
    $.when(currenciesPromise).then(function () {
        var session = getSessionData();
        if(session.preferences.currency === null) {
            session.preferences.currency = session.currencies['USD'];       //Default to USD
            setSessionData(session);
        }
        
        var newHTML = "";
        for (var currCode in session.currencies) {
            newHTML += "<option value='" + currCode + "'" + (currCode === session.preferences.currency.id ? ' selected' : '') + ">" + session.currencies[currCode].description + " (" + currCode + ")</option>";
        }
        
        setTimeout(function() {
            $("#currencies select").html(newHTML);
    //        $("#currencies select").material_select("destroy");
            $("#currencies select").removeAttr("disabled");
            $("#currencies select").material_select();

            $("#currencies select").on("change", function () {
                var s = getSessionData();
                s.preferences.currency = session.currencies[$("#currencies select").val()];
                setSessionData(s);
                window.location.reload();       //TODO won't update
            });
        }, 500);
    });
});