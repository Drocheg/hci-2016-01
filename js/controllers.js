var app = angular.module('app', ['ui.materialize']);    //Include angular-materialize plugin
app.controller('controller', function ($scope, $http) {
    /* *************************************************************************
     *                          General functions
     * ************************************************************************/
    $scope.session = getSessionData();

    /**
     * Searches GET parameters to get the value of the parameter with the specified
     * name.
     * 
     * @param {String} paramName
     * @returns {String|null} The value of the parameter with the specified key, or
     * null if not found or if empty.
     * @author Cátedra de HCI
     */
    $scope.getGETparam = function (paramName) {
        var query = location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === paramName) {
                var decoded = decodeURIComponent(pair[1]);
                return decoded === "" ? null : decoded;
            }
        }
        return null;
    };

    /**
     * Converts a specified amount to the currently selected currency, including
     * the symbol.
     * 
     * @param {number} amount
     * @returns {string}
     */
    $scope.toSelectedCurrency = function (amount) {
        return $scope.session.preferences.currency.symbol + (amount / $scope.session.preferences.currency.ratio).toFixed(2);
//        return $filter("currency")(amount/$scope.session.preferences.currency.ratio, $scope.session.preferences.currency.symbol, 2);
    };

    /**
     * Makes an API call with the specified parameters.
     * 
     * @param {string} service A valid API service.
     * @param {object} params Parameters for the query, including the "method"
     * parameter.
     * @param {function} successCallback Callback to run on successful
     * completion of the request that returned without errors.
     * @param {function} errorCallback (Optional) Callback to run on successful
     * completion of the request that returned with errors. If none provided,
     * the error will be logged.
     * @param {function} failCallback (Optional) Callback to run on failure (e.g.
     * network error). If none provided, calls default fail handler.
     * @param {string} method (Optional) GET or POST. Defaults to GET.
     * @returns {undefined}
     */
    $scope.APIrequest = function (service, params, successCallback, errorCallback, failCallback, method) {
        $http({
            url: "http://eiffel.itba.edu.ar/hci/service4/" + service + ".groovy",
            method: method || "GET",
            params: params || {},
            cache: true,
            timeout: 10000
        }).then(
                //Request completed
                        function (response) {
                            if (response.data.error) {
                                if (typeof errorCallback !== 'undefined') {
                                    errorCallback(response.data);
                                } else {
                                    console.log("API returned an error: " + JSON.stringify(response.data.error));
                                }
                            } else {
                                successCallback(response.data);
                            }
                        },
                        //Request failed (e.g. network error)
                                function (response) {
                                    if (typeof failCallback !== 'undefined') {
                                        failCallback(response);
                                    } else {
                                        defaultFailHandler(response);
                                    }
                                }
                        );
                    };

            /* *************************************************************************
             *                          Interaction functions
             * ************************************************************************/
            $scope.pageNumber = 5;

            $scope.getFilledArray = function (size) {
                if (size === 0)
                    return [];
                var arr = new Array(size);
                for (var i = 1; i <= size; i++) {
                    arr[i - 1] = i;
                }
                return arr;
            };

            /* *************************************************************************
             *                          Review functions
             * ************************************************************************/
            $scope.reviewCount = 0;

            $scope.getFlightReviews = function (airlineID, flightNumber, pageSize, pageNum, orderBy, ascOrDesc) {
                debugger;
                var params = {method: "getairlinereviews", airline_id: airlineID, flight_number: flightNumber};
                //Optional parameters
                if (typeof pageSize !== 'undefined') {
                    params.page_size = pageSize;
                }
                if (typeof pageNum !== 'undefined') {
                    params.page = pageNum;
                }
                if (typeof orderBy !== 'undefined') {
                    params.sort_key = orderBy;
                }
                if (typeof ascOrDesc !== 'undefined') {
                    params.sort_order = ascOrDesc;
                }
                $scope.APIrequest(
                        "review",
                        params,
                        function (response) {
                            $scope.reviews = response.reviews;
                            $scope.reviewCount = response.total;
                        });
            };

            $scope.getFlightAverage = function (airlineID, flightNumber) {
                $scope.getFlightReviews(airlineID, flightNumber, 30, 1);
                var cantReview = $scope.reviewCount;
                var i = 1; //MAximo 15000 comentarios
                var sum = 0;
                do {
                    debugger;
                    $scope.getFlightReviews(airlineID, flightNumber, 30, i);
                    for (var j = 0; j < 30 && j < cantReview; j++) {
                        sum = sum + $scope.reviews[j].rating.overall;
                    }
                    cantReview = cantReview - 30;
                    i++;
                } while (cantReview > 0 && i <= 500);
                return sum / $scope.reviewCount;
            };

            /* *************************************************************************
             *                          Flight functions
             * ************************************************************************/
            $scope.deals = [];
            $scope.flights = null;

            //Watch sorting parameters and re-search as necessary
            $scope.$watchGroup(['criteria', 'order', 'resultsPerPage'], function () {
                $scope.searchFlights({sort_key: $scope.criteria, sort_order: $scope.order, page_size: $scope.resultsPerPage});
            });

            $scope.selectFlight = function (flight) {
                var d = getGETparam('direction');
                switch (d) {
                    case 'outbound':
                        setOutboundFlight(flight);
                        break;
                    case 'inbound':
                        setInboundFlight(flight);
                        break;
                    default:
                        Materialize.toast("Unrecognized state, not setting flight.");   //TODO shouldn't happen
                        break;
                }
                markSelectedFlight(flight, d);
                $("#nextStep > button").removeClass("disabled");
            };

            $scope.searchFlights = function (extraParamsObj) {
                $scope.flights = null;

                var params = {method: "getonewayflights"};
                //Get ALL required parameters from GET
                var requiredParams = ['from', 'to', 'dep_date', 'adults', 'children', 'infants'];
                for (var index in requiredParams) {
                    if (getGETparam(requiredParams[index]) === null) {
                        return;
                    }
                    params[requiredParams[index]] = getGETparam(requiredParams[index]);
                }
                //Add extra params, if supplied via parameter
                var extraParams = ['airline_id', 'max_price', 'min_price', 'stopovers', 'cabin_type', 'min_dep_time', 'max_dep_time', 'page', 'page_size', 'sort_key', 'sort_order'];
                for (var index in extraParams) {
                    if (extraParamsObj.hasOwnProperty(extraParams[index])) {
                        params[extraParams[index]] = extraParamsObj[extraParams[index]];
                    }
                }

                $scope.APIrequest(
                        "booking",
                        params,
                        function (response) {
                            //Remove previous tooltips
                            $('.tooltipped').tooltip('remove');
                            $scope.flights = response;
                            //Add news ones after a delay
                            setTimeout(function () {
                                $('.tooltipped').tooltip(/*{delay: 50}*/);          //Enable tooltips for +1's TODO make it work without timeout
                            }, 500);
                        },
                        function (response) {
                            console.log("API error getting flights: " + JSON.stringify(response.error));
                            $scope.flights = {total: 0, flights: []};
                        },
                        function (response) {
                            console.log("Network error getting flights: " + JSON.stringify(response));
                            $scope.flights = {total: 0, flights: []};
                        });
            };





            $scope.getDeals = function (origin) {
                $scope.APIrequest(
                        "booking",
                        {method: "getflightdeals", from: origin},
                        function (response) {
                            $scope.deals = response.deals;
                        });
            };

            $scope.goToDeal = function (deal, from) {
                Materialize.toast("Woooh! Look at that deal!!!", 5000);
                var session = getSessionData();
                var date = new Date();
                date.setDate(date.getDate() + 2);
                var year = date.getFullYear();
                var month = (1 + date.getMonth()).toString();
                month = month.length > 1 ? month : '0' + month;
                var day = date.getDate().toString();
                day = day.length > 1 ? day : '0' + day;
                var fullDate = year + "-" + month + "-" + day;
                session.search.departDate.pretty = "HardcodeadaFecha";
                session.search.departDate.full = fullDate;
                session.search.numAdults = 1; //Vamos a tener que cambiar esta parte.
                session.search.numInfants = 0;
                session.search.numChildren = 0;
                session.search.oneWayTrip = true; //Esto esta bien asi.
                session.search.max_price = deal.price;
                session.search.min_price = deal.price;
                session.search.to.name = deal.city.name;
                session.search.to.id = deal.city.id;
                session.search.from.id = from;
//                session.search.selectedFlight = null; //Lo maté, no existe más TODO borrar
//                session.search.direction = "outbound";
                session.outboundFlight = null;
                session.inboundFlight = null;
                setSessionData(session);
                window.location = "flights-deal.html?direction=outbound";   //TODO Diego maté session.search.direction, pasá todo por GET
            };



            $scope.getLastMinuteDeals = function (origin) {
                $scope.APIrequest(
                        "booking",
                        {method: "getlastminuteflightdeals", from: origin},
                        function (response) {
                            $scope.deals = [];
                            for (var index in response.deals) {
                                debugger
                                var session = getSessionData(); //TODO borrar?
                                var deal = response.deals[index];
                                var date = new Date();
                                date.setDate(date.getDate() + 2);
                                var year = date.getFullYear();
                                var month = (1 + date.getMonth()).toString();
                                month = month.length > 1 ? month : '0' + month;
                                var day = date.getDate().toString();
                                day = day.length > 1 ? day : '0' + day;
                                var fullDate = year + "-" + month + "-" + day;
                                var params = {
                                    method: "getonewayflights",
                                    from: origin,
                                    to: deal.city.id,
                                    dep_date: fullDate,
                                    adults: 1,
                                    children: 0,
                                    infants: 0,
                                    min_price: deal.price,
                                    max_price: deal.price
                                };
                                $scope.addDeal(params, response.deals[index]);

                            }
                        },
                        undefined,
                        function (response) {
                            defaultFailHandler(response, "Error de conexión consiguiendo promociones.");
                        });
            };

            $scope.addDeal = function (params, deal) {
                if ($scope.deals, length < 9) {
                    $scope.APIrequest(
                            "booking",
                            params,
                            function (response) {
                                if (response.flights.length !== 0) {

                                    $scope.deals.push(deal);
                                }
                            },
                            function (response) {
                                console.log("API error checking deal: " + JSON.stringify(response.error));

                            },
                            function (response) {
                                console.log("Network error checking deal: " + JSON.stringify(response));

                            });
                }

            }

            $scope.bookFlight = function (firstName, lastName, birthDate, idType, idNumber, installments, state, zip, street, streetNumber, phones, email, addressFloor, addressApartment) {
                $scope.APIrequest(
                        "booking",
                        {method: "getflightdeals",
                            first_name: firstName,
                            last_name: lastName,
                            birthDate: birthDate,
                            id_type: idType,
                            id_number: idNumber,
                            installments: installments,
                            state: state,
                            zip_code: zip,
                            street: street,
                            number: streetNumber,
                            phones: phones,
                            email: email,
                            floor: (typeof addressFloor === 'undefined' ? null : addressFloor),
                            apartment: (typeof addressApartment === 'undefined' ? null : addressApartment)},
                        function (response) {
                            if (response.data.booking === true) {
                                Materialize.toast("Reserva completada con éxito", 5000);
                            } else {
                                Materialize.toast("Error reservando su vuelo", 5000);
                            }
                        },
                        undefined,
                        undefined,
                        "POST");
            };

            $scope.buildFlickURL = function (imgObj) {
                var URL = "https://farm" + imgObj.farm + ".staticflickr.com/" + imgObj.server + "/" + imgObj.id + "_" + imgObj.secret + "_c.jpg";
                return URL;
            };

            $scope.getFlickrImg = function (query, destId) {
                $http({
                    url: "https://api.flickr.com/services/rest/",
                    method: "GET",
                    cache: true,
                    timeout: 10000,
                    params: {
                        method: "flickr.photos.search",
                        api_key: "9a5f81e1e267f943ba8bbc71ae056840",
                        text: query,
                        tags: "landscape",
                        media: "photos",
                        extra: "url_l",
                        format: "json",
                        nojsoncallback: 1
                    }
                }).then(function (response) {
                    if (response.data.stat !== "ok") {
                        defaultFailHandler(response.data, "Error consiguiendo imágenes.");
                        $("#" + destId).attr("src", "img/placeholder.png");
                    } else {
                        if (response.data.photos.photo.length === 0) {
                            $("#" + destId).attr("src", "img/placeholder.png");
                        } else {
                            $("#" + destId).attr("src", $scope.buildFlickURL(response.data.photos.photo[0]));
                        }
                    }
                });
            };

            $scope.goToDeal = function (deal, from) {
                var session = getSessionData();
                session.search.numAdults = 1;
                session.search.numInfants = 0;
                session.search.numChildren = 0;
                session.search.oneWayTrip = true;
                session.search.max_Price = deal.price;
                session.search.min_Price = deal.price;
                session.search.to.name = deal.city.name;
                session.search.to.id = deal.city.id;
                session.search.from.id = from;

                setSessionData(session);
                window.location = "flights-deal.html";
            };

            $scope.getLastMinuteDeals = function (origin) {
                $scope.APIrequest(
                        "booking",
                        {method: "getflightdeals", from: origin},
                        function (response) {
                            $scope.deals = response.deals;
                        });
            };

            $scope.bookFlight = function (firstName, lastName, birthDate, idType, idNumber, installments, state, zip, street, streetNumber, phones, email, addressFloor, addressApartment) {
                $scope.APIrequest(
                        "booking",
                        {method: "getflightdeals",
                            first_name: firstName,
                            last_name: lastName,
                            birthDate: birthDate,
                            id_type: idType,
                            id_number: idNumber,
                            installments: installments,
                            state: state,
                            zip_code: zip,
                            street: street,
                            number: streetNumber,
                            phones: phones,
                            email: email,
                            floor: (typeof addressFloor === 'undefined' ? null : addressFloor),
                            apartment: (typeof addressApartment === 'undefined' ? null : addressApartment)},
                        function (response) {
                            if (response.booking === true) {
                                Materialize.toast("Reserva completada con éxito", 5000);
                            } else {
                                Materialize.toast("Error reservando su vuelo", 5000);
                            }
                        },
                        undefined,
                        undefined,
                        "POST");
            };

            $scope.buildFlickURL = function (imgObj) {
                var URL = "https://farm" + imgObj.farm + ".staticflickr.com/" + imgObj.server + "/" + imgObj.id + "_" + imgObj.secret + "_c.jpg";
                return URL;
            };

            $scope.getFlickrImg = function (query, destId) {
                $http({
                    url: "https://api.flickr.com/services/rest/",
                    method: "GET",
                    cache: true,
                    timeout: 10000,
                    params: {
                        method: "flickr.photos.search",
                        api_key: "9a5f81e1e267f943ba8bbc71ae056840",
                        text: query,
                        tags: "landscape",
                        media: "photos",
                        extra: "url_l",
                        format: "json",
                        nojsoncallback: 1
                    }
                }).then(function (response) {
                    if (response.data.stat !== "ok") {
                        defaultFailHandler(response.data, "Error consiguiendo imágenes.");
                        $("#" + destId).attr("src", "img/placeholder.png");
                    } else {
                        if (response.data.photos.photo.length === 0) {
                            Materialize.toast("No se encontraron imágenes para " + query);
                            $("#" + destId).attr("src", "img/placeholder.png");
                        } else {
                            $("#" + destId).attr("src", $scope.buildFlickURL(response.data.photos.photo[0]));
                        }
                    }
                });
            };

            $scope.getFlickBannerImg = function (query, selector) {
                $http({
                    url: "https://api.flickr.com/services/rest/",
                    method: "GET",
                    params: {
                        method: "flickr.photos.search",
                        api_key: "9a5f81e1e267f943ba8bbc71ae056840",
                        text: query,
                        tags: "landscape",
                        media: "photos",
                        extra: "url_l",
                        format: "json",
                        nojsoncallback: 1
                    },
                    cache: true,
                    timeout: 10000
                }).then(function (response) {
                    if (response.data.stat !== "ok") {
                        defaultFailHandler(response.data, "Error consiguiendo imágenes.");
                        $("#" + destId).attr("src", "img/placeholder.png");
                    } else {
                        if (response.data.photos.photo.length === 0) {
                            $("#" + destId).attr("src", "img/placeholder.png");
                        } else {
                            $(selector).css("background", "url('" + $scope.buildFlickURL(response.data.photos.photo[0]) + "')");
                        }
                    }
                });
            };

            $scope.getOriginAirport = function (flight) {
                return flight.outbound_routes[0].segments[0].departure.airport;
            };

            $scope.getDepartureDateObj = function (flight) {
                var str = flight.outbound_routes[0].segments[0].departure.date.split(" ");
                var date = str[0].split("-"), time = str[1].split(":");
                return new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
            };

            $scope.getDestinationAirport = function (flight) {
                return flight.outbound_routes[0].segments[0].arrival.airport;
            };

            $scope.getArrivalDateObj = function (flight) {
                var str = flight.outbound_routes[0].segments[0].arrival.date.split(" ");
                var date = str[0].split("-"), time = str[1].split(":");
                return new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
            };

            $scope.getStopovers = function (flight) {
                return flight.outbound_routes[0].segments[0].stopovers;
            };

            $scope.getStopoversCount = function (flight) {
                return flight.outbound_routes[0].segments[0].stopovers.length;
            };

            $scope.isDirectFlight = function (flight) {
                return $scope.getStopovers(flight).length === 0;
            };

            $scope.getFlightTotal = function (flight) {
                return $scope.getFlightPriceBreakdown(flight).total.total;
            };

            $scope.getFlightPriceBreakdown = function (flight) {
                return flight.price;
            };

            $scope.getFlightAirlineName = function (flight) {
                return flight.outbound_routes[0].segments[0].airline.name;
            };

            $scope.getFlightAirlineID = function (flight) {
                if (typeof flight === 'undefined') {
                    return;
                }
                return flight.outbound_routes[0].segments[0].airline.id;
            };

            $scope.getFlightAirlineLogoURL = function (flight) {
                var session = getSessionData();
                return session.airlines[getFlightAirlineID(flight)].logo || "img/placeholder.png";
            };

            $scope.getFlightNumber = function (flight) {
                if (typeof flight === 'undefined') {
                    return;
                }
                return flight.outbound_routes[0].segments[0].number;
            };

            $scope.getFlightId = function (flight) {
                return flight.outbound_routes[0].segments[0].id;
            }

            $scope.getFlightDuration = function (flight) {
                return flight.outbound_routes[0].duration;
            };


            /* *************************************************************************
             *                          Passengers functions
             * ************************************************************************/
            //lel nothing
            $scope.order = 'asc';
            $scope.orderFromRating = 'asc';
            $scope.criteria = 'total';
            $scope.resultsPerPage = 30;
            /* *************************************************************************
             *                          math functions
             * ************************************************************************/
            $scope.getNumberOfPages = function (totalResults, resultsPerPage) {
                if (typeof totalResults === 'undefined' || totalResults === 0)
                    return 0;
                var numberOfPages = Number(totalResults) / Number(resultsPerPage);
                var nonCompletePage = Number(numberOfPages);
                numberOfPages = Number(numberOfPages).toFixed(0);
                if (numberOfPages < nonCompletePage) {
//                    debugger;  Me sacaron de quicio estos debuggers TODO kill with fire
                    numberOfPages = Number(numberOfPages) + 1;
                }
//                debugger;
                return Number(numberOfPages);
            };
        });
