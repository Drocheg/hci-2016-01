var flight = {
    "meta": {
        "uuid": "27a7bad8-7e8f-433b-b5a1-e4bc2a77e7f9",
        "time": "533.035ms"
    },
    "page": 1,
    "page_size": 30,
    "total": 2,
    "currency": {
        "id": "USD"
    },
    "flights": [
        {
            "price": {
                "adults": {
                    "base_fare": 278,
                    "quantity": 1
                },
                "children": null,
                "infants": null,
                "total": {
                    "charges": 11.12,
                    "taxes": 55.6,
                    "fare": 278,
                    "total": 344.72
                }
            },
            "outbound_routes": [
                {
                    "segments": [
                        {
                            "arrival": {
                                "date": "2016-12-25 07:09:00",
                                "airport": {
                                    "id": "TUC",
                                    "description": "Aeropuerto Benjamin Matienzo, San Miguel de Tucuman, Argentina",
                                    "time_zone": "-03:00",
                                    "city": {
                                        "id": "TUC",
                                        "name": "San Miguel de Tucuman, Tucuman",
                                        "country": {
                                            "id": "AR",
                                            "name": "Argentina"
                                        }
                                    }
                                }
                            },
                            "departure": {
                                "date": "2016-12-25 05:50:00",
                                "airport": {
                                    "id": "EZE",
                                    "description": "Aeropuerto Ezeiza Ministro Pistarini, Buenos Aires, Argentina",
                                    "time_zone": "-03:00",
                                    "city": {
                                        "id": "EZE",
                                        "name": "Buenos Aires, Ciudad de Buenos Aires",
                                        "country": {
                                            "id": "AR",
                                            "name": "Argentina"
                                        }
                                    }
                                }
                            },
                            "id": 94588,
                            "number": 8700,
                            "cabin_type": "ECONOMY",
                            "airline": {
                                "id": "8R",
                                "name": "SOL",
                                "rating": null
                            },
                            "duration": "01:19",
                            "stopovers": [
                            ]
                        }
                    ],
                    "duration": "01:19"
                }
            ]
        },
        {
            "price": {
                "adults": {
                    "base_fare": 232,
                    "quantity": 1
                },
                "children": null,
                "infants": null,
                "total": {
                    "charges": 13.92,
                    "taxes": 44.08,
                    "fare": 232,
                    "total": 290
                }
            },
            "outbound_routes": [
                {
                    "segments": [
                        {
                            "arrival": {
                                "date": "2016-12-25 13:17:00",
                                "airport": {
                                    "id": "TUC",
                                    "description": "Aeropuerto Benjamin Matienzo, San Miguel de Tucuman, Argentina",
                                    "time_zone": "-03:00",
                                    "city": {
                                        "id": "TUC",
                                        "name": "San Miguel de Tucuman, Tucuman",
                                        "country": {
                                            "id": "AR",
                                            "name": "Argentina"
                                        }
                                    }
                                }
                            },
                            "departure": {
                                "date": "2016-12-25 12:00:00",
                                "airport": {
                                    "id": "EZE",
                                    "description": "Aeropuerto Ezeiza Ministro Pistarini, Buenos Aires, Argentina",
                                    "time_zone": "-03:00",
                                    "city": {
                                        "id": "EZE",
                                        "name": "Buenos Aires, Ciudad de Buenos Aires",
                                        "country": {
                                            "id": "AR",
                                            "name": "Argentina"
                                        }
                                    }
                                }
                            },
                            "id": 94590,
                            "number": 5687,
                            "cabin_type": "ECONOMY",
                            "airline": {
                                "id": "LA",
                                "name": "Lan",
                                "rating": null
                            },
                            "duration": "01:17",
                            "stopovers": [
                            ]
                        }
                    ],
                    "duration": "01:17"
                }
            ]
        }
    ],
    "filters": [
        {
            "key": "airline",
            "values": [
                {
                    "id": "LA",
                    "name": "Lan",
                    "logo": "http://eiffel.itba.edu.ar/hci/service4/images/LA.png",
                    "count": 1
                },
                {
                    "id": "8R",
                    "name": "SOL",
                    "logo": "http://eiffel.itba.edu.ar/hci/service4/images/8R.png",
                    "count": 1
                }
            ]
        },
        {
            "key": "stopover",
            "values": [
                {
                    "id": 0,
                    "count": 2
                }
            ]
        },
        {
            "key": "price",
            "min": 290,
            "max": 344.72
        }
    ]
};