var sampleData = {
    "facility_variables": {
        "overview": [],
        "sectors": [
            {
                "subgroups": [
                    {
                        "name": "All",
                        "slug": "all"
                    },
                    {
                        "name": "Subsector 2",
                        "slug": "ss2"
                    }
                ],
                "name": "Health",
                "columns": [
                    {
                        "descriptive_name": "name",
                        "description": "name",
                        "display_order": 0,
                        "name": "name",
                        "clickable": false,
                        "slug": "name",
                        "subgroups": [
                            "all"
                        ]
                    },
                    {
                        "descriptive_name": "s1v1",
                        "description": "s2v1",
                        "display_order": 1,
                        "name": "s1v1",
                        "clickable": false,
                        "slug": "s1v1",
                        "subgroups": [
                            "all",
                            "ss2"
                        ]
                    },
                    {
                        "descriptive_name": "s1v3",
                        "description": "s2v3",
                        "display_order": 2,
                        "name": "s1v3",
                        "clickable": false,
                        "slug": "s1v3",
                        "subgroups": [
                            "all",
                            "ss2"
                        ]
                    },
                    {
                        "descriptive_name": "s1v5",
                        "description": "s2v5",
                        "display_order": 3,
                        "name": "s1v5",
                        "clickable": false,
                        "slug": "s1v5",
                        "subgroups": [
                            "all",
                            "ss2"
                        ]
                    }
                ],
                "slug": "health"
            },
            {
                "subgroups": [
                    {
                        "name": "All",
                        "slug": "all"
                    },
                    {
                        "name": "Subsector 1",
                        "slug": "ss1"
                    }
                ],
                "name": "Education",
                "columns": [
                    {
                        "descriptive_name": "name",
                        "description": "name",
                        "display_order": 0,
                        "name": "name",
                        "clickable": false,
                        "slug": "name",
                        "subgroups": [
                            "all"
                        ]
                    },
                    {
                        "descriptive_name": "s1v1",
                        "description": "s1v1",
                        "display_order": 1,
                        "name": "s1v1",
                        "clickable": false,
                        "slug": "s1v1",
                        "subgroups": [
                            "all",
                            "ss1"
                        ]
                    },
                    {
                        "descriptive_name": "s1v3",
                        "description": "s1v3",
                        "display_order": 2,
                        "name": "s1v3",
                        "clickable": false,
                        "slug": "s1v3",
                        "subgroups": [
                            "all",
                            "ss1"
                        ]
                    },
                    {
                        "descriptive_name": "s1v5",
                        "description": "s1v5",
                        "display_order": 3,
                        "name": "s1v5",
                        "clickable": false,
                        "slug": "s1v5",
                        "subgroups": [
                            "all",
                            "ss1"
                        ]
                    }
                ],
                "slug": "education"
            },
            {
                "subgroups": [
                    {
                        "name": "All",
                        "slug": "all"
                    },
                    {
                        "name": "Subsector 1",
                        "slug": "ss1"
                    },
                    {
                        "name": "Subsector 2",
                        "slug": "ss2"
                    }
                ],
                "name": "Water",
                "columns": [
                    {
                        "descriptive_name": "name",
                        "description": "name",
                        "display_order": 0,
                        "name": "name",
                        "clickable": false,
                        "slug": "name",
                        "subgroups": [
                            "all"
                        ]
                    },
                    {
                        "descriptive_name": "s3v1",
                        "description": "s3v1",
                        "display_order": 1,
                        "name": "s3v1",
                        "clickable": false,
                        "slug": "s3v1",
                        "subgroups": [
                            "all",
                            "ss1"
                        ]
                    },
                    {
                        "descriptive_name": "s3v3",
                        "description": "s3v3",
                        "display_order": 2,
                        "name": "s3v3",
                        "clickable": false,
                        "slug": "s3v3",
                        "subgroups": [
                            "all",
                            "ss2"
                        ]
                    },
                    {
                        "descriptive_name": "s3v5",
                        "description": "s3v5",
                        "display_order": 3,
                        "name": "s3v5",
                        "clickable": false,
                        "slug": "s3v5",
                        "subgroups": [
                            "all",
                            "ss1"
                        ]
                    }
                ],
                "slug": "water"
            }
        ]
    },
    "data": {
        "facilities": {
            "31": {
                "sector": "Education",
                "name": "name1",
                "students": 110,
                "tsr_should_be": 0.23,
                "teachers": 25,
                "ts_ratio": 0.22727272727272727,
                "s1v6": 0.41,
                "s1v4": 0.35,
                "s1v5": 0.18,
                "s1v2": 7.65,
                "s1v3": 3.88,
                "s1v1": 8.5
            },
            "32": {
                "sector": "Education",
                "name": "name1",
                "students": 95,
                "tsr_should_be": 0.37,
                "teachers": 35,
                "ts_ratio": 0.3684210526315789,
                "s1v6": 8.33,
                "s1v4": 9.23,
                "s1v5": 3.73,
                "s1v2": 6.33,
                "s1v3": 6.33,
                "s1v1": 4.4
            },
            "33": {
                "sector": "Education",
                "name": "name1",
                "students": 60,
                "tsr_should_be": 0.58,
                "teachers": 35,
                "ts_ratio": 0.5833333333333334,
                "s1v6": 3.28,
                "s1v4": 9.26,
                "s1v5": 7.73,
                "s1v2": 6.28,
                "s1v3": 0.33,
                "s1v1": 5.83
            },
            "34": {
                "sector": "Education",
                "name": "name1",
                "students": 90,
                "tsr_should_be": 0.5,
                "teachers": 45,
                "ts_ratio": 0.5,
                "s1v6": 8.06,
                "s1v4": 2.82,
                "s1v5": 5.3,
                "s1v2": 7.98,
                "s1v3": 2.46,
                "s1v1": 3.01
            },
            "35": {
                "sector": "Education",
                "name": "name1",
                "students": 100,
                "tsr_should_be": 0.3,
                "teachers": 30,
                "ts_ratio": 0.3,
                "s1v6": 0.62,
                "s1v4": 4.18,
                "s1v5": 0.42,
                "s1v2": 9,
                "s1v3": 6.35,
                "s1v1": 1.17
            },
            "36": {
                "sector": "Education",
                "name": "name1",
                "students": 70,
                "tsr_should_be": 0.57,
                "teachers": 40,
                "ts_ratio": 0.5714285714285714,
                "s1v6": 2.54,
                "s1v4": 5.83,
                "s1v5": 6.33,
                "s1v2": 1.55,
                "s1v3": 7.14,
                "s1v1": 0.44
            },
            "37": {
                "sector": "Education",
                "name": "name1",
                "students": 70,
                "tsr_should_be": 0.64,
                "teachers": 45,
                "ts_ratio": 0.6428571428571429,
                "s1v6": 6.94,
                "s1v4": 5.67,
                "s1v5": 7.86,
                "s1v2": 5.05,
                "s1v3": 7.09,
                "s1v1": 9.28
            },
            "38": {
                "sector": "Education",
                "name": "name1",
                "students": 140,
                "tsr_should_be": 0.14,
                "teachers": 20,
                "ts_ratio": 0.14285714285714285,
                "s1v6": 1.1,
                "s1v4": 6.81,
                "s1v5": 6.73,
                "s1v2": 8.39,
                "s1v3": 9.98,
                "s1v1": 2.95
            },
            "39": {
                "sector": "Education",
                "name": "name1",
                "students": 75,
                "tsr_should_be": 0.07,
                "teachers": 5,
                "ts_ratio": 0.06666666666666667,
                "s1v6": 6.27,
                "s1v4": 0.62,
                "s1v5": 9.06,
                "s1v2": 9.66,
                "s1v3": 5.11,
                "s1v1": 4.84
            },
            "40": {
                "sector": "Education",
                "name": "name1",
                "students": 65,
                "tsr_should_be": 0.23,
                "teachers": 15,
                "ts_ratio": 0.23076923076923078,
                "s1v6": 7.55,
                "s1v4": 7.01,
                "s1v5": 8.86,
                "s1v2": 4.58,
                "s1v3": 0.87,
                "s1v1": 9.95
            },
            "41": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 1.8,
                "s2v3": 9.45,
                "s2v2": 5.37,
                "s2v5": 4.97,
                "s2v4": 2.46,
                "s2v6": 2.35
            },
            "42": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 5.45,
                "s2v3": 8.32,
                "s2v2": 3.58,
                "s2v5": 4.21,
                "s2v4": 0.48,
                "s2v6": 3.27
            },
            "43": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 1.81,
                "s2v3": 9.21,
                "s2v2": 8.49,
                "s2v5": 5.92,
                "s2v4": 5.74,
                "s2v6": 4.15
            },
            "44": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 2.18,
                "s2v3": 7.41,
                "s2v2": 0.54,
                "s2v5": 1.33,
                "s2v4": 3.42,
                "s2v6": 5.67
            },
            "45": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 3.7,
                "s2v3": 4.34,
                "s2v2": 8,
                "s2v5": 2.96,
                "s2v4": 4.35,
                "s2v6": 6.39
            },
            "46": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 9.32,
                "s2v3": 8.04,
                "s2v2": 9.98,
                "s2v5": 1.73,
                "s2v4": 5.19,
                "s2v6": 9.54
            },
            "47": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 4.78,
                "s2v3": 6.33,
                "s2v2": 0.51,
                "s2v5": 4.41,
                "s2v4": 1.57,
                "s2v6": 7.54
            },
            "48": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 0.71,
                "s2v3": 4.93,
                "s2v2": 9.18,
                "s2v5": 9.01,
                "s2v4": 5.23,
                "s2v6": 0.41
            },
            "49": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 4.46,
                "s2v3": 3.26,
                "s2v2": 3.16,
                "s2v5": 5.64,
                "s2v4": 0.16,
                "s2v6": 8.08
            },
            "50": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 2.48,
                "s2v3": 1.29,
                "s2v2": 3.05,
                "s2v5": 3.75,
                "s2v4": 7.55,
                "s2v6": 2.03
            },
            "51": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 0.36,
                "s3v5": 6.77,
                "s3v6": 3.82,
                "s3v1": 0.1,
                "s3v2": 8.56,
                "s3v3": 1.91
            },
            "52": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 3.75,
                "s3v5": 9.09,
                "s3v6": 7.29,
                "s3v1": 5.45,
                "s3v2": 9.98,
                "s3v3": 7.56
            },
            "53": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 7.28,
                "s3v5": 2,
                "s3v6": 6.49,
                "s3v1": 1.4,
                "s3v2": 4.75,
                "s3v3": 9.37
            },
            "54": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 1.67,
                "s3v5": 0.06,
                "s3v6": 0.76,
                "s3v1": 6.6,
                "s3v2": 5.01,
                "s3v3": 2.41
            },
            "55": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 0.63,
                "s3v5": 8.06,
                "s3v6": 5.32,
                "s3v1": 5.24,
                "s3v2": 8.72,
                "s3v3": 7.8
            },
            "56": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 3.37,
                "s3v5": 6.96,
                "s3v6": 3.78,
                "s3v1": 7.02,
                "s3v2": 8.02,
                "s3v3": 7.52
            },
            "57": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 9.07,
                "s3v5": 7.12,
                "s3v6": 6.29,
                "s3v1": 3.01,
                "s3v2": 2.49,
                "s3v3": 7.67
            },
            "58": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 5.64,
                "s3v5": 1.26,
                "s3v6": 9.34,
                "s3v1": 7.34,
                "s3v2": 9.24,
                "s3v3": 3.31
            },
            "59": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 2.71,
                "s3v5": 3.54,
                "s3v6": 2.31,
                "s3v1": 6.09,
                "s3v2": 1.1,
                "s3v3": 0.33
            },
            "60": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 6.31,
                "s3v5": 1.07,
                "s3v6": 2.81,
                "s3v1": 1.36,
                "s3v2": 9.49,
                "s3v3": 6.52
            }
        },
        "stateName": "State1",
        "profileData": {},
        "lgaName": "LGA2"
    }
};

var sectors2 = sampleData.facility_variables.sectors;

var sl = sectors2.length, sli = 0;
var data2 = _.map(sampleData.data.facilities, function(i, key){
    return _.extend({}, i, {
        '_uid': key,
        'sector': sectors2[sli++ % sl].slug
    });
});

var data = [];
var sectors = [], _sectors = ["Agriculture", "Education", "Health", "Water"];
_.each(_sectors, function(s){
    sectors.push({
        name: s,
        slug: s.toLowerCase()
    });
});
_.times(40, function(i){
    data.push({
        sector: sectors[i%4].slug,
        something: i%3==0
    });
});

var reqPath = "health",
		urlRoot = "/nmis~/",
		stateName = "Enugu",
		state = {
			name: "Enugu",
			slug: "enugu"
		},
		lga = {
			name: "Isi-Uzo",
			slug: "isi_uzo",
			latLng: "7.687256,6.745281"
		},
		profileData = [[["LGA Chairman", {"source": "LGA Management Survey, 2011 (LGA)", "value": "Doctor Sam C Ugwu"}], ["LGA Secretary", {"source": "LGA Management Survey, 2011 (LGA)", "value": "Sylvester O Ugwuagbo"}], ["Population (2006)", {"source": "Population Census, 2006 (LGA)", "value": "148597"}], ["Area (square km)", {"source": "GADM, 2011 (National)", "value": "327.1"}], ["Distance from capital (km)", {"source": "LGA Management Survey, 2011 (LGA)", "value": "45"}]]][0],
		lgaName = "Isi-Uzo",
		lgaUniqueSlug = "enugu_isi_uzo";

var sectorData = [
    {
        "subgroups": [
            {
                "display_order": 26,
                "name": "General",
                "slug": "general"
            }
        ],
        "name": "Water",
        "columns": [
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Functional",
                "name": "Functional",
                "display_style": "checkmark_true",
                "display_order": 4,
                "description": "The water source can be either functional, or not functional.",
                "clickable": true,
                "slug": "water_functional",
                "subgroups": [
                    "general"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Reason for breakdown",
                "name": "Reason Broken",
                "display_order": 5,
                "description": "This is the reason that the water source is not functional.",
                "clickable": true,
                "slug": "breakdown",
                "subgroups": [
                    "general"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "iconify_png_url": "./images/status_icons/global/",
                "descriptive_name": "Lift Mechanism",
                "name": "Lift Mechanism",
                "display_order": 6,
                "description": "The primary/main lift mechanism for the water source. A lift mechanism is the way water is brought to the surface for people to use and can include a variety of methods, such as diesel pumps, hand pumps, animal powered pumps etc. ",
                "clickable": true,
                "slug": "lift_mechanism",
                "subgroups": [
                    "general"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/false/",
                "descriptive_name": "Fees for use",
                "name": "Fees for use",
                "display_style": "checkmark_true",
                "display_order": 7,
                "description": "The water source requires payment in order for someone to use/draw water.",
                "clickable": true,
                "slug": "pay_for_water_yn",
                "subgroups": [
                    "general"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Distribution Type",
                "name": "Distribution Type",
                "display_order": 8,
                "description": "The distribution type refers to whether this water source is distributed at a single point, or multiple points. For multiple point distributions, the type also classifies whether the water points served by the water source are roughly within 100 meters, within 1000 meters (1 km), or beyond 1 kilometer.",
                "clickable": true,
                "slug": "distribution_type",
                "subgroups": [
                    "general"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Community",
                "name": "Community",
                "display_order": 0,
                "description": "The community this water source is in.",
                "clickable": true,
                "slug": "community",
                "subgroups": [
                    "general"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Ward",
                "name": "Ward",
                "display_order": 1,
                "description": "The ward this water source is in.",
                "clickable": true,
                "slug": "ward",
                "subgroups": [
                    "general"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Type of water source",
                "name": "Type",
                "display_order": 2,
                "description": "The type/kind of water source, such as borehole, protected dug well, developed/protected spring water, or a rainwater harvesting scheme.",
                "clickable": true,
                "slug": "water_source_type",
                "subgroups": [
                    "general"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Improved",
                "name": "Improved",
                "display_style": "checkmark_true",
                "display_order": 3,
                "description": "The water source can be either improved, or unimproved.",
                "clickable": true,
                "slug": "is_improved",
                "subgroups": [
                    "general"
                ]
            }
        ],
        "slug": "water"
    },
    {
        "subgroups": [
            {
                "display_order": 15,
                "name": "Snapshot",
                "slug": "snapshot"
            },
            {
                "display_order": 16,
                "name": "Access",
                "slug": "access"
            },
            {
                "display_order": 17,
                "name": "Participation",
                "slug": "participation"
            },
            {
                "display_order": 18,
                "name": "Infrastructure: Water and Sanitation",
                "slug": "water_and_sanitation"
            },
            {
                "display_order": 19,
                "name": "Infrastructure: Building Structure",
                "slug": "building_structure"
            },
            {
                "display_order": 20,
                "name": "Infrastructure: Health and Safety",
                "slug": "health_and_safety"
            },
            {
                "display_order": 21,
                "name": "Infrastructure: Learning Environment",
                "slug": "learning_environment"
            },
            {
                "display_order": 22,
                "name": "Furniture",
                "slug": "furniture"
            },
            {
                "display_order": 23,
                "name": "Adequacy of Staffing",
                "slug": "adequacy_of_staffing"
            },
            {
                "display_order": 24,
                "name": "Institutional Development",
                "slug": "institutional_development"
            },
            {
                "display_order": 25,
                "name": "Curriculum Issues",
                "slug": "curriculum"
            }
        ],
        "name": "Education",
        "columns": [
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Proportion of children with basic numeracy skills (TBD)",
                "name": "Proportion of children who can do basic numeracy (TBD)",
                "display_style": "checkmark_true",
                "display_order": 37,
                "description": "This is the proportion of children at the school who demonstrate  adequate ability to perform and understand basic maths.\n",
                "clickable": true,
                "slug": "pupil_tchr_ratio",
                "subgroups": [
                    "learning_outcomes"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Proportion of children with life skills (TBD)",
                "name": "Proportion of children who can do life skills (TBD)",
                "display_style": "checkmark_true",
                "display_order": 38,
                "description": "This is the proportion of children at the school who demonstrate  adequate ability to acquire knowledge and to develop attitudes and skills which support the adoption of healthy behaviours.",
                "clickable": true,
                "slug": "pupil_tchr_ratio",
                "subgroups": [
                    "learning_outcomes"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Provides exercise books to students",
                "name": "Exercise books provided",
                "display_style": "checkmark_true",
                "display_order": 32,
                "description": "The school gives its students exercise books",
                "clickable": true,
                "slug": "provide_exercise_books_yn",
                "subgroups": [
                    "curriculum"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Provides pens/pencils to students",
                "name": "Pens/pencils provided",
                "display_style": "checkmark_true",
                "display_order": 33,
                "description": "The school gives its students pens and pencils",
                "clickable": true,
                "slug": "provide_pens_yn",
                "subgroups": [
                    "curriculum"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Teachers guide for every subject",
                "name": "Teaching guidebook for every teacher for every subject",
                "display_style": "checkmark_true",
                "display_order": 34,
                "description": "Teachers at the school have a Ministry of Education issued/approved teacher's guide or syllabus for all subjects",
                "clickable": true,
                "slug": "teacher_guide_yn",
                "subgroups": [
                    "curriculum"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Functioning library",
                "name": "Functioning Library",
                "display_style": "checkmark_true",
                "display_order": 35,
                "description": "The school has a room or building that houses books and other materials students and staff can access.",
                "clickable": true,
                "slug": "functioning_library_yn",
                "subgroups": [
                    "curriculum"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Proportion of children with basic literacy ",
                "name": "Proportion of children who can do basic literacy (TBD)",
                "display_style": "checkmark_true",
                "display_order": 36,
                "description": "This is the proportion of children at the school who demonstrate  adequate ability to read and write.\n",
                "clickable": true,
                "slug": "pupil_tchr_ratio",
                "subgroups": [
                    "learning_outcomes"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Total number of teachers",
                "name": "Total number of teachers",
                "display_order": 27,
                "description": "This is the total number of teachers in each school.",
                "clickable": true,
                "slug": "num_tchrs_total",
                "subgroups": [
                    "adequacy_of_staffing"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Pupil to bench ratio",
                "name": "Pupil to bench ratio",
                "display_order": 28,
                "description": "This is the ratio of the number of students at the school to the number of benches available at the school.",
                "clickable": true,
                "slug": "pupil_bench_ratio",
                "subgroups": [
                    "furniture"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Pupil to desk ratio",
                "name": "Pupil to desk ratio",
                "display_order": 29,
                "description": "This is the ratio of the number of students at the school to the number of desks avaiable ",
                "clickable": true,
                "slug": "pupil_desk_ratio",
                "subgroups": [
                    "furniture"
                ]
            },
            {
                "click_actions": [
                    "piechart_false",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/false/",
                "descriptive_name": "Delayed teacher payments in the past 12 months",
                "name": "Delayed teacher payments in the past 12 months",
                "display_style": "checkmark_false",
                "display_order": 30,
                "description": "Teachers were not paid on time at least once in the last 12 months",
                "clickable": true,
                "slug": "tchr_pay_delay",
                "subgroups": [
                    "institutional_development"
                ]
            },
            {
                "click_actions": [
                    "piechart_false",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/false/",
                "descriptive_name": "Multi-grade classrooms",
                "name": "Multi-grade classrooms",
                "display_style": "checkmark_false",
                "display_order": 25,
                "description": "The school has classrooms that are used for more than one class on a regular basis.  ",
                "clickable": true,
                "slug": "multigrade_classrms",
                "subgroups": [
                    "learning_environment"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Teachers who participated in training in the past 12 months",
                "name": "Teachers who participated in training in the past 12 months",
                "display_order": 26,
                "description": "This is the  number of teachers at the school who attended a training or were sent for training in the past 12 months",
                "clickable": true,
                "slug": "num_tchrs_attended_training",
                "subgroups": [
                    "adequacy_of_staffing"
                ]
            },
            {
                "click_actions": [
                    "piechart_false",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/false/",
                "descriptive_name": "Double shifts",
                "name": "Double shifts",
                "display_style": "checkmark_false",
                "display_order": 24,
                "description": "The school teaches in shifts throughout the day. If the school operates in a single shift, only one group of students is being taught during the day. If another group of students comes after the first group has finished and uses the same classrooms and facilities, the school operates in double shifts.  Schools can have morning and afternoon shifts or they can have shifts that overlap. ",
                "clickable": true,
                "slug": "two_shifts_yn",
                "subgroups": [
                    "learning_environment"
                ]
            },
            {
                "click_actions": [
                    "piechart_false",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/false/",
                "descriptive_name": "Missed teacher payments in past 12 months",
                "name": "Missed teacher payments in the past 12 months",
                "display_style": "checkmark_false",
                "display_order": 31,
                "description": "Teachers were not paid at all at least once in the last 12 months",
                "clickable": true,
                "slug": "tchr_pay_miss",
                "subgroups": [
                    "institutional_development"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Pupil to toilet ratio",
                "name": "Pupil to toilet ratio",
                "display_order": 18,
                "description": "This is the proportion of students to toilets at each school.",
                "clickable": true,
                "slug": "pupil_toilet_ratio_facility",
                "subgroups": [
                    "water_and_sanitation"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Dispensary/health clinic",
                "name": "Dispensary / Health Clinic",
                "display_style": "checkmark_true",
                "display_order": 19,
                "description": "The school has a health clinic for students and staff. The aim behind this indicator is to find out whether the school is prepared to manage very basic injuries that happen to students or staff. A school is counted as having a health clinic if the respondnet explicitly said there is a health clinic for students and staff.  ",
                "clickable": true,
                "slug": "access_clinic_dispensary",
                "subgroups": [
                    "health_and_safety"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "First aid kit ONLY (not a health clinic)",
                "name": "First-aid kit only (no health clinic)",
                "display_style": "checkmark_true",
                "display_order": 20,
                "description": "The school has a first aid kit that can be used for students and staff.  The aim behind this indicator is to find out whether the school is is prepared to manage very basic injuries that happen to students or staff. A school is counted as having a first aid kit if the respondnet explicitly said there is a first aid kit for students and staff. The school does not have a health clinic but just a first aid kit.",
                "clickable": true,
                "slug": "access_first_aid",
                "subgroups": [
                    "health_and_safety"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Wall/fence in good condition",
                "name": "Wall/fence in good condition",
                "display_style": "checkmark_true",
                "display_order": 21,
                "description": "The school's boundary wall or fence or some other demarcation of the school area is in good condition. Assessment of the condition of the  school's fences/boundary walls condition is not based on a measurement but on the respondent's knowledge of and subjective judgement of the fence/wall condition.",
                "clickable": true,
                "slug": "wall_fence_good_condi",
                "subgroups": [
                    "health_and_safety"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Pupil to classroom ratio",
                "name": "Pupil to classroom ratio",
                "display_order": 22,
                "description": "This is the ratio of the number of students at the school to the number of classrooms available.",
                "clickable": true,
                "slug": "pupil_classrm_ratio",
                "subgroups": [
                    "learning_environment"
                ]
            },
            {
                "click_actions": [
                    "piechart_false",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/false/",
                "descriptive_name": "Teach outside because there are not enough classrooms",
                "name": "Teach outside because there are not enough classrooms",
                "display_style": "checkmark_false",
                "display_order": 23,
                "description": "The school does not have enough classrooms and as a result some classes are held outside.",
                "clickable": true,
                "slug": "class_held_outside",
                "subgroups": [
                    "learning_environment"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Gender separated toilets",
                "name": "Gender-separated toilet(s)",
                "display_style": "checkmark_true",
                "display_order": 17,
                "description": "School has separate toilets for boys and girls. Gender separated toilets are defined as those that are only for women or girls and other facilities only for men or boys. If  toilets are shared and are for use by women, girls, men and boys then the school does not have gender separated toilets. ",
                "clickable": true,
                "slug": "gender_separated_toilets_yn",
                "subgroups": [
                    "water_and_sanitation"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Access to improved sanitation/toilet",
                "name": "Access to improved sanitation/toilet",
                "display_style": "checkmark_true",
                "display_order": 16,
                "description": "School had access to improved sanitation/toilets for at least three weeks in the month before data was collected. It is assumed that improved sanitation reduces the risk of contact with waste and thus leads to a reduction in certain diseases. Improved sanitation is defined as sewers or septic tanks, poor-flush latrines and simple pit or ventilated improved pit latrines that are not for public use and are meant for use by staff and students.",
                "clickable": true,
                "slug": "education_improved_sanitation",
                "subgroups": [
                    "water_and_sanitation"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Textbook to pupil ratio",
                "name": "Textbook to pupil ratio",
                "display_order": 11,
                "description": "This is the ratio of the number of textbooks at the schools to the number of textbooks.",
                "clickable": true,
                "slug": "textbook_to_pupil_ratio",
                "subgroups": [
                    "snapshot",
                    "curriculum"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Follows the national UBE curriculum",
                "name": "Follow the national UBE curriculum",
                "display_style": "checkmark_true",
                "display_order": 12,
                "description": "The school uses the Ministry of Education issued/approved curriculum for all subjects",
                "clickable": true,
                "slug": "natl_curriculum_yn",
                "subgroups": [
                    "snapshot"
                ]
            },
            {
                "click_actions": [
                    "piechart_false",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/false/",
                "descriptive_name": "More than 1km from nearest secondary school",
                "name": "Farther than 1km from nearest secondary school",
                "display_style": "checkmark_false",
                "display_order": 13,
                "description": "The primary school is more than 1 km from the nearest secondary school. This indicator measures how easily students can access secondary education. The assumption is that students are more likely to attend secondary schools if they are easily accessible and are not located very far away from where the primary school or catchment area is.",
                "clickable": true,
                "slug": "school_1kmplus_secondary_school",
                "subgroups": [
                    "access"
                ]
            },
            {
                "click_actions": [
                    "piechart_false",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/false/",
                "descriptive_name": "More than 20% of students living more than 3km away from school",
                "name": "More than 20% students living farther than 3km from school",
                "display_style": "checkmark_false",
                "display_order": 14,
                "description": "The school has>20% students who live more than 3kms away. This indicator measures how easily students can access a school. The assumption is that students are more likely to attend school if they do not live very far away from the school or if the school is within a reasonable distance from where the population it serves live.",
                "clickable": true,
                "slug": "students_living_3kmplus_school",
                "subgroups": [
                    "access"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Ratio boys to girls ",
                "name": "Ratio boys to girls",
                "display_order": 15,
                "description": "The ratio of boys to girls enrolled at the school. The indicator is a ratio of the number of  enrolled boys to enrolled girls, regardless of ages. It measures the equality of educational opportunity, measured in terms of school enrolment, for boys and girls",
                "clickable": true,
                "slug": "male_to_female_student_ratio",
                "subgroups": [
                    "participation"
                ]
            },
            {
                "descriptive_name": "School name",
                "description": "School Name",
                "display_order": 0,
                "name": "Name",
                "clickable": false,
                "slug": "school_name",
                "subgroups": [
                    "snapshot",
                    "access",
                    "participation",
                    "water_and_sanitation",
                    "building_structure",
                    "health_and_safety",
                    "learning_environment",
                    "furniture",
                    "adequacy_of_staffing",
                    "institutional_development",
                    "curriculum"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Access to power",
                "name": "Access to power",
                "display_style": "checkmark_true",
                "display_order": 1,
                "description": "School had power for at least three weeks in the month before the data was collected. Access to power is defined as having power for at least three weeks in the month before the data was collected. This indicator measures how consistent and reliable the school's power source is.   If there was always at least one working power source in the month before data collection and if the school had power for 5 or more hours a day then the school is considered as having reliable and consistent power. ",
                "clickable": true,
                "slug": "power_access",
                "subgroups": [
                    "building_structure"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Number of classrooms needing minor repair",
                "name": "Classroom(s) that need minor repairs",
                "display_order": 2,
                "description": "Number of classrooms at the school that are in need of only minor repairs ",
                "clickable": true,
                "slug": "num_classrms_need_min_repairs",
                "subgroups": [
                    "building_structure"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Roof in good condition",
                "name": "Roof in good condition",
                "display_style": "checkmark_true",
                "display_order": 3,
                "description": "School buildings have rooves that are described as being in good condition. Assessment of the school buildings rooves' condition is not based on a measurement but on the respondent's knowledge of and subjective judgement of the rooves condition.",
                "clickable": true,
                "slug": "covered_roof_good_condi",
                "subgroups": [
                    "building_structure"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Pupitl to teacher ratio",
                "name": "Pupil to teacher ratio",
                "display_order": 4,
                "description": "The ratio of pupils to teachers at the school",
                "clickable": true,
                "slug": "pupil_tchr_ratio",
                "subgroups": [
                    "adequacy_of_staffing"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Teacher to non-teaching staff ratio",
                "name": "Teacher to non-teaching staff",
                "display_order": 5,
                "description": "This is the ratio of staff at the school who teach (teachers who are in permanent or temporary/part-time positions and both qualified and unqualified teachers) and do not teach (non-teaching staff are the number of male and female staff who do not teach and are classified as pay scale grade 7 and up).  ",
                "clickable": true,
                "slug": "teacher_nonteachingstaff_ratio",
                "subgroups": [
                    "adequacy_of_staffing"
                ]
            },
            {
                "click_actions": [
                    "piechart_false",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/false/",
                "descriptive_name": "Farther than 1km from catchment area",
                "name": "Farther than 1km from catchment area",
                "display_style": "checkmark_false",
                "display_order": 6,
                "description": "The school is more than 1 km from the catchment area/areas it is supposed to serve. This indicator measures how easily students can access a school.",
                "clickable": true,
                "slug": "school_1kmplus_catchment_area",
                "subgroups": [
                    "snapshot",
                    "access"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Access to potable water",
                "name": "Access to potable water",
                "display_style": "checkmark_true",
                "display_order": 7,
                "description": "School had potable water, without interruption, for at least three weeks in the past month. The indicator monitors access to safe water sources based on the assumption that\nsuch sources are more likely to provide safe water and reduce the incidence of diseases caused by drinking/using unsafe water.",
                "clickable": true,
                "slug": "potable_water",
                "subgroups": [
                    "snapshot",
                    "water_and_sanitation"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Number of classrooms needing major repair",
                "name": "Classroom(s) that need major repairs",
                "display_order": 8,
                "description": "Number of classrooms at the school that are in need of major repair. ",
                "clickable": true,
                "slug": "num_classrms_need_maj_repairs",
                "subgroups": [
                    "snapshot",
                    "building_structure"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Chalkboards in every classroom",
                "name": "Chalkboards in every classroom",
                "display_style": "checkmark_true",
                "display_order": 9,
                "description": "Every classroom at the school has a chalkboard",
                "clickable": true,
                "slug": "chalkboard_each_classroom_yn",
                "subgroups": [
                    "snapshot",
                    "furniture"
                ]
            },
            {
                "click_actions": [
                    "tabulate"
                ],
                "descriptive_name": "Qualified teachers (with NCE)",
                "name": "Qualified teachers (with NCE)",
                "display_order": 10,
                "description": "This is the number of teachers at the school who have an NCE",
                "clickable": true,
                "slug": "num_tchrs_with_nce",
                "subgroups": [
                    "snapshot",
                    "adequacy_of_staffing"
                ]
            }
        ],
        "slug": "education"
    },
    {
        "subgroups": [
            {
                "display_order": 0,
                "name": "Snapshot",
                "slug": "snapshot"
            },
            {
                "display_order": 1,
                "name": "Staffing",
                "slug": "staffing"
            },
            {
                "display_order": 2,
                "name": "Maternal Health: Antenatal",
                "slug": "maternal_antenatal"
            },
            {
                "display_order": 3,
                "name": "Maternal Health: Obstetrics (1)",
                "slug": "maternal_obstetrics1"
            },
            {
                "display_order": 4,
                "name": "Maternal Health: Obstetrics (2)",
                "slug": "maternal_obstetrics2"
            },
            {
                "display_order": 5,
                "name": "Maternal Health: Family Planning",
                "slug": "maternal_famplan"
            },
            {
                "display_order": 6,
                "name": "Child Nutrition",
                "slug": "child_nutrition"
            },
            {
                "display_order": 7,
                "name": "Child Immunization",
                "slug": "child_immunization"
            },
            {
                "display_order": 8,
                "name": "Malaria",
                "slug": "malaria"
            },
            {
                "display_order": 9,
                "name": "Medicines",
                "slug": "medicines"
            },
            {
                "display_order": 10,
                "name": "Diagnostics",
                "slug": "diagnostics"
            },
            {
                "display_order": 11,
                "name": "Infrastructure",
                "slug": "infrastructure"
            },
            {
                "display_order": 12,
                "name": "Tuberculosis",
                "slug": "TB"
            },
            {
                "display_order": 13,
                "name": "HIV",
                "slug": "HIV"
            },
            {
                "display_order": 14,
                "name": "Curative Care",
                "slug": "curative_care"
            }
        ],
        "name": "Health",
        "columns": [
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Mobile Coverage",
                "name": "Mobile Coverage",
                "display_style": "checkmark_true",
                "display_order": 92,
                "description": "Facility has a currently functioning mobile coverage on the premises.",
                "clickable": true,
                "slug": "mobile_signal_funct_yn",
                "subgroups": [
                    "infrastructure"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Power",
                "name": "Power",
                "display_style": "checkmark_true",
                "display_order": 93,
                "description": "Facility has access to a power source that is currently functional.",
                "clickable": true,
                "slug": "power_access_and_functional",
                "subgroups": [
                    "infrastructure"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "TB testing",
                "name": "TB testing",
                "display_style": "checkmark_true",
                "display_order": 94,
                "description": "Facility offers testing of tuberculosis with microscopy.",
                "clickable": true,
                "slug": "lab_tests_tb_microscopy_calc",
                "subgroups": [
                    "TB"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "TB treatment",
                "name": "TB treatment",
                "display_style": "checkmark_true",
                "display_order": 95,
                "description": "Facility offers treatment of tuberculosis.",
                "clickable": true,
                "slug": "tb_treatment_yn",
                "subgroups": [
                    "TB"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "HIV Testing",
                "name": "HIV Testing",
                "display_style": "checkmark_true",
                "display_order": 96,
                "description": "Facility offers testing of HIV.",
                "clickable": true,
                "slug": "lab_tests_hiv_testing_calc",
                "subgroups": [
                    "HIV"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "PMTCT",
                "name": "PMTCT",
                "display_style": "checkmark_true",
                "display_order": 97,
                "description": "Facility offers PMTCT services.",
                "clickable": true,
                "slug": "hiv_tx_srvcs_pmtct_services_calc",
                "subgroups": [
                    "HIV"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "ARV Treatment",
                "name": "ARV Treatment",
                "display_style": "checkmark_true",
                "display_order": 98,
                "description": "Facility offers anti-retroviral (ARV) drugs to treat HIV/AIDS.",
                "clickable": true,
                "slug": "hiv_treatment_yn",
                "subgroups": [
                    "HIV"
                ]
            },
            {
                "click_actions": [
                    "piechart_false",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/false/",
                "descriptive_name": "Drug Stock Outs",
                "name": "Drug Stock Outs",
                "display_style": "checkmark_false",
                "display_order": 99,
                "description": "Facility has had a stockout of essental medications (antimalarials, antidiarrheals or antibiotics) for at least one week in the month prior to data collection.",
                "clickable": true,
                "slug": "essential_meds_stockout",
                "subgroups": [
                    "curative_care"
                ]
            },
            {
                "click_actions": [
                    "piechart_false",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/false/",
                "descriptive_name": "User fees",
                "name": "User fees",
                "display_style": "checkmark_false",
                "display_order": 100,
                "description": "Facility charges fees for health services.",
                "clickable": true,
                "slug": "health_no_user_fees",
                "subgroups": [
                    "curative_care"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "IV treatments available",
                "name": "IV treatments available",
                "display_style": "checkmark_true",
                "display_order": 101,
                "description": "Facility has IV treatments available.",
                "clickable": true,
                "slug": "iv_medications_yn",
                "subgroups": [
                    "curative_care"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "24/7 Curative Care",
                "name": "24/7 Curative Care",
                "display_style": "checkmark_true",
                "display_order": 102,
                "description": "Facility offers curative care 24 hours a day, 7 days a week.",
                "clickable": true,
                "slug": "facility_open_247_yn",
                "subgroups": [
                    "curative_care"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Inpatient Care",
                "name": "Inpatient Care",
                "display_style": "checkmark_true",
                "display_order": 103,
                "description": "Facility offers inpatient care.",
                "clickable": true,
                "slug": "inpatient_care_yn",
                "subgroups": [
                    "curative_care"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Potable water",
                "name": "Potable water",
                "display_style": "checkmark_true",
                "display_order": 90,
                "description": "Facility has access to potable water source that is currently functional.",
                "clickable": true,
                "slug": "potable_water_access",
                "subgroups": [
                    "infrastructure"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Toilets/latrines",
                "name": "Toilets/latrines",
                "display_style": "checkmark_true",
                "display_order": 91,
                "description": "Facility had access to toilets/latrines for at least three weeks in the month prior to data collection.",
                "clickable": true,
                "slug": "improved_sanitation_and_functional",
                "subgroups": [
                    "infrastructure"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "No user fees for malaria treatment",
                "name": "No user fees for malaria treatment",
                "display_style": "checkmark_true",
                "display_order": 64,
                "description": "Facility does not charge any user fees for malaria treatment",
                "clickable": true,
                "slug": "paid_services_malaria_treatment",
                "subgroups": [
                    "malaria"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Antimalarials",
                "name": "Antimalarials",
                "display_style": "checkmark_true",
                "display_order": 65,
                "description": "Facility has antimalarial drugs available.",
                "clickable": true,
                "slug": "medication_anti_malarials",
                "subgroups": [
                    "medicines"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Antibiotics",
                "name": "Antibiotics",
                "display_style": "checkmark_true",
                "display_order": 66,
                "description": "Facility has oral antibiotics available.",
                "clickable": true,
                "slug": "oral_antibiotics_calc",
                "subgroups": [
                    "medicines"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Antihistamines",
                "name": "Antihistamines",
                "display_style": "checkmark_true",
                "display_order": 67,
                "description": "Facility has antihistamines available.",
                "clickable": true,
                "slug": "medication_antihistamines",
                "subgroups": [
                    "medicines"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Anticonvulsant",
                "name": "Anticonvulsant",
                "display_style": "checkmark_true",
                "display_order": 68,
                "description": "Facility has anticonvulsants available.",
                "clickable": true,
                "slug": "emoc_parenteral_anticonvulsant",
                "subgroups": [
                    "medicines"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Mebendazole",
                "name": "Mebendazole",
                "display_style": "checkmark_true",
                "display_order": 69,
                "description": "Facility has mebendazole available.",
                "clickable": true,
                "slug": "child_health_mebendazole",
                "subgroups": [
                    "medicines"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Iron",
                "name": "Iron",
                "display_style": "checkmark_true",
                "display_order": 70,
                "description": "Facility has iron tablets available.",
                "clickable": true,
                "slug": "medication_iron_tablets",
                "subgroups": [
                    "medicines"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Folic Acid",
                "name": "Folic Acid",
                "display_style": "checkmark_true",
                "display_order": 71,
                "description": "Facility has folic acid available.",
                "clickable": true,
                "slug": "medication_folic_acid",
                "subgroups": [
                    "medicines"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "IV fluid",
                "name": "IV fluid",
                "display_style": "checkmark_true",
                "display_order": 72,
                "description": "Facility has IV fluids available.",
                "clickable": true,
                "slug": "medication_iv_fluid",
                "subgroups": [
                    "medicines"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "IV antibiotics",
                "name": "IV antibiotics",
                "display_style": "checkmark_true",
                "display_order": 73,
                "description": "Facility has IV antibiotics available.",
                "clickable": true,
                "slug": "iv_antibiotics_yn_calc",
                "subgroups": [
                    "medicines"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Uterotonics",
                "name": "Uterotonics",
                "display_style": "checkmark_true",
                "display_order": 74,
                "description": "Facility has IV or IM uterotonics.",
                "clickable": true,
                "slug": "uterotonics_yn_calc",
                "subgroups": [
                    "medicines"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "BP machine",
                "name": "BP machine",
                "display_style": "checkmark_true",
                "display_order": 75,
                "description": "Facility has a blood pressure (BP) machine.",
                "clickable": true,
                "slug": "equipment_bp_machine",
                "subgroups": [
                    "basic_equipment"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Thermometer",
                "name": "Thermometer",
                "display_style": "checkmark_true",
                "display_order": 76,
                "description": "Facility has a thermometer.",
                "clickable": true,
                "slug": "equipment_thermometr",
                "subgroups": [
                    "basic_equipment"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Weighing scale",
                "name": "Weighing scale",
                "display_style": "checkmark_true",
                "display_order": 77,
                "description": "Facility has a weighing scale.",
                "clickable": true,
                "slug": "scale_yn",
                "subgroups": [
                    "basic_equipment"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Sterilizer",
                "name": "Sterilizer",
                "display_style": "checkmark_true",
                "display_order": 78,
                "description": "Facility has a sterilizer.",
                "clickable": true,
                "slug": "equipment_sterilizer",
                "subgroups": [
                    "basic_equipment"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Latex gloves",
                "name": "Latex gloves",
                "display_style": "checkmark_true",
                "display_order": 79,
                "description": "Facility has latex gloves available.",
                "clickable": true,
                "slug": "supplies_available_latex_gloves",
                "subgroups": [
                    "basic_equipment"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Ice pack",
                "name": "Ice pack",
                "display_style": "checkmark_true",
                "display_order": 80,
                "description": "Facility has ice packs for cold storage.",
                "clickable": true,
                "slug": "vaccines_icepack_calc",
                "subgroups": [
                    "basic_equipment"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Refrigerator",
                "name": "Refrigerator",
                "display_style": "checkmark_true",
                "display_order": 81,
                "description": "Faciilty has a refrigerator for cold storage.",
                "clickable": true,
                "slug": "equipment_refrigerator",
                "subgroups": [
                    "basic_equipment"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Oxygen",
                "name": "Oxygen",
                "display_style": "checkmark_true",
                "display_order": 82,
                "description": "Facility has an oxygen tank.",
                "clickable": true,
                "slug": "compr_oc_oxygen_tank",
                "subgroups": [
                    "basic_equipment"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Power",
                "name": "Power",
                "display_style": "checkmark_true",
                "display_order": 83,
                "description": "Facility has access to a power source that is currently functional.",
                "clickable": true,
                "slug": "power_access_and_functional",
                "subgroups": [
                    "basic_equipment"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Malaria testing (microscopy or RDT)",
                "name": "Malaria testing (microscopy or RDT)",
                "display_style": "checkmark_true",
                "display_order": 84,
                "description": "Facility offers either malaria rapid diagnostic test (RDT) or malaria microscopy.",
                "clickable": true,
                "slug": "malaria_testing",
                "subgroups": [
                    "diagnostics"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Urinalysis",
                "name": "Urinalysis",
                "display_style": "checkmark_true",
                "display_order": 85,
                "description": "Facility can perform urinalysis.",
                "clickable": true,
                "slug": "lab_tests_urine_testing_calc",
                "subgroups": [
                    "diagnostics"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Pregnancy test",
                "name": "Pregnancy test",
                "display_style": "checkmark_true",
                "display_order": 86,
                "description": "Facility offers pregnancy testing.",
                "clickable": true,
                "slug": "lab_tests_pregnancy_calc",
                "subgroups": [
                    "diagnostics"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "stool",
                "name": "stool",
                "display_style": "checkmark_true",
                "display_order": 87,
                "description": "Facility offers laboratory testing of stool.",
                "clickable": true,
                "slug": "lab_tests_stool_calc",
                "subgroups": [
                    "diagnostics"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Hemoglobin",
                "name": "Hemoglobin",
                "display_style": "checkmark_true",
                "display_order": 88,
                "description": "Facility can perform measurement of a patient's hemoglobin.",
                "clickable": true,
                "slug": "lab_tests_hemoglobin_testing_calc",
                "subgroups": [
                    "diagnostics"
                ]
            },
            {
                "descriptive_name": "Lab technicians",
                "description": "Number of full-time lab technicians on staff at the facility.",
                "display_order": 89,
                "name": "Lab technicians",
                "clickable": true,
                "slug": "num_lab_techs_fulltime",
                "subgroups": [
                    "diagnostics"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Insecticide Treated Nets",
                "name": "Insecticide Treated Nets",
                "display_style": "checkmark_true",
                "display_order": 62,
                "description": "Facility has insecticide treated bednets (ITNs) available.",
                "clickable": true,
                "slug": "has_itns",
                "subgroups": [
                    "malaria"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Malaria prevention during pregnancy",
                "name": "Malaria prevention during pregnancy",
                "display_style": "checkmark_true",
                "display_order": 63,
                "description": "Facility has available sulphadoxine pyrimethamine (SP or fansidar) for prevention of malaria during pregancy.",
                "clickable": true,
                "slug": "malaria_treatment_sulphadoxine",
                "subgroups": [
                    "malaria"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "ACT",
                "name": "ACT",
                "display_style": "checkmark_true",
                "display_order": 61,
                "description": "Facility has artemisinin-based combination therapy (ACT) available.",
                "clickable": true,
                "slug": "malaria_treatment_artemisinin",
                "subgroups": [
                    "malaria"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Tetanus",
                "name": "Tetanus",
                "display_style": "checkmark_true",
                "display_order": 53,
                "description": "Facility offers tetanus vaccination.",
                "clickable": true,
                "slug": "child_health_tetanus_immun_calc",
                "subgroups": [
                    "child_immunization"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Hep B",
                "name": "Hep B",
                "display_style": "checkmark_true",
                "display_order": 54,
                "description": "Facility offers hepatitis B vaccination.",
                "clickable": true,
                "slug": "child_health_hepb_immunization_calc",
                "subgroups": [
                    "child_immunization"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "BCG",
                "name": "BCG",
                "display_style": "checkmark_true",
                "display_order": 55,
                "description": "Facility offers BCG vaccination.",
                "clickable": true,
                "slug": "child_health_bcg_immunization_calc",
                "subgroups": [
                    "child_immunization"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Yellow Fever",
                "name": "Yellow Fever",
                "display_style": "checkmark_true",
                "display_order": 56,
                "description": "Facility offers yellow fever vaccination.",
                "clickable": true,
                "slug": "child_health_yellow_fever_immun_calc",
                "subgroups": [
                    "child_immunization"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "CSM",
                "name": "CSM",
                "display_style": "checkmark_true",
                "display_order": 57,
                "description": "Facility offers CSM vaccination.",
                "clickable": true,
                "slug": "child_health_csm_immunization_calc",
                "subgroups": [
                    "child_immunization"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Ice pack",
                "name": "Ice pack",
                "display_style": "checkmark_true",
                "display_order": 58,
                "description": "Facility has ice packs for cold storage.",
                "clickable": true,
                "slug": "vaccines_icepack_calc",
                "subgroups": [
                    "child_immunization"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Refrigerator",
                "name": "Refrigerator",
                "display_style": "checkmark_true",
                "display_order": 59,
                "description": "Faciilty has a refrigerator for cold storage.",
                "clickable": true,
                "slug": "equipment_refrigerator",
                "subgroups": [
                    "child_immunization"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "RDT or Microscopy",
                "name": "RDT or Microscopy",
                "display_style": "checkmark_true",
                "display_order": 60,
                "description": "Facility offers testing for malaria either with rapid diagnostic tests (RDTs) or microscopy.",
                "clickable": true,
                "slug": "malaria_testing",
                "subgroups": [
                    "malaria"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Growth monitoring",
                "name": "Growth monitoring",
                "display_style": "checkmark_true",
                "display_order": 48,
                "description": "Facility offers growth monitoring of children.",
                "clickable": true,
                "slug": "child_health_growth_monitor",
                "subgroups": [
                    "child_nutrition"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Hemoglobin Kit",
                "name": "Hemoglobin Kit",
                "display_style": "checkmark_true",
                "display_order": 49,
                "description": "Facility can perform measurement of a patient's hemoglobin.",
                "clickable": true,
                "slug": "lab_tests_hemoglobin_testing_calc",
                "subgroups": [
                    "child_nutrition"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Measles",
                "name": "Measles",
                "display_style": "checkmark_true",
                "display_order": 50,
                "description": "Facility offers measles vaccination.",
                "clickable": true,
                "slug": "child_health_measles_immun_calc",
                "subgroups": [
                    "child_immunization"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Polio",
                "name": "Polio",
                "display_style": "checkmark_true",
                "display_order": 51,
                "description": "Facility offers oral polio vaccination.",
                "clickable": true,
                "slug": "child_health_opv_immuization_calc",
                "subgroups": [
                    "child_immunization"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "DPT3",
                "name": "DPT3",
                "display_style": "checkmark_true",
                "display_order": 52,
                "description": "Facility offers DPT3 vaccination.",
                "clickable": true,
                "slug": "child_health_dpt_immunization_calc",
                "subgroups": [
                    "child_immunization"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Blood Transfusion",
                "name": "Blood Transfusion",
                "display_style": "checkmark_true",
                "display_order": 39,
                "description": "Facility has the capacity to perform safe blood transfusion.",
                "clickable": true,
                "slug": "compr_oc_blood_transfusions",
                "subgroups": [
                    "maternal_obstetrics2"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Cesarian section",
                "name": "Cesarian section",
                "display_style": "checkmark_true",
                "display_order": 40,
                "description": "Facility has the capacity to perform c-section.",
                "clickable": true,
                "slug": "compr_oc_c_sections",
                "subgroups": [
                    "maternal_obstetrics1"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Condoms",
                "name": "Condoms",
                "display_style": "checkmark_true",
                "display_order": 41,
                "description": "Facility has condoms available.",
                "clickable": true,
                "slug": "condoms_yn",
                "subgroups": [
                    "maternal_famplan"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Oral contraceptives",
                "name": "Oral contraceptives",
                "display_style": "checkmark_true",
                "display_order": 42,
                "description": "Facility has oral contraceptive pills available.",
                "clickable": true,
                "slug": "family_planning_pill_calc_calc",
                "subgroups": [
                    "maternal_famplan"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Injectables",
                "name": "Injectables",
                "display_style": "checkmark_true",
                "display_order": 43,
                "description": "Facility has injectable contraceptive methods available.",
                "clickable": true,
                "slug": "family_planning_injectables_calc_calc",
                "subgroups": [
                    "maternal_famplan"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "IUD",
                "name": "IUD",
                "display_style": "checkmark_true",
                "display_order": 44,
                "description": "Facility has intrauterine devices for long-term contraception available.",
                "clickable": true,
                "slug": "family_planning_iud_calc",
                "subgroups": [
                    "maternal_famplan"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Implant",
                "name": "Implant",
                "display_style": "checkmark_true",
                "display_order": 45,
                "description": "Facility has contraceptive implants available.",
                "clickable": true,
                "slug": "family_planning_implants_calc",
                "subgroups": [
                    "maternal_famplan"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Permanent methods",
                "name": "Permanent methods",
                "display_style": "checkmark_true",
                "display_order": 46,
                "description": "Facility offers permanent contraceptive methods (i.e., tubal ligation, vasectomy).",
                "clickable": true,
                "slug": "sterilization_yn_calc",
                "subgroups": [
                    "maternal_famplan"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Weighing scale",
                "name": "Weighing scale",
                "display_style": "checkmark_true",
                "display_order": 47,
                "description": "Facility has a weighing scale.",
                "clickable": true,
                "slug": "scale_yn",
                "subgroups": [
                    "child_nutrition"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Delivery Services 24/7",
                "name": "Delivery Services 24/7",
                "display_style": "checkmark_true",
                "display_order": 38,
                "description": "Facility can perform deliveries 24 hours a day, seven days a week.",
                "clickable": true,
                "slug": "maternal_health_delivery_services_24_7",
                "subgroups": [
                    "maternal_obstetrics1"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Skilled birth attendant 4",
                "name": "Skilled birth attendant 4",
                "display_style": "checkmark_true",
                "display_order": 34,
                "description": "Facility has at least four skilled birth attendants (doctor, midwife or nurse-midwife) on staff.",
                "clickable": true,
                "slug": "at_least_four_skilled_birth_attendants",
                "subgroups": [
                    "maternal_obstetrics2"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Vacuum Extractor",
                "name": "Vacuum Extractor",
                "display_style": "checkmark_true",
                "display_order": 35,
                "description": "Facility has a vacuum extractor.",
                "clickable": true,
                "slug": "emoc_vacuum_extractor",
                "subgroups": [
                    "maternal_obstetrics1"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Forceps",
                "name": "Forceps",
                "display_style": "checkmark_true",
                "display_order": 36,
                "description": "Facility has obstetric forceps (for deliveries).",
                "clickable": true,
                "slug": "emoc_forceps",
                "subgroups": [
                    "maternal_obstetrics1"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Power",
                "name": "Power",
                "display_style": "checkmark_true",
                "display_order": 37,
                "description": "Facility has access to a power source that is currently functional.",
                "clickable": true,
                "slug": "power_access_and_functional",
                "subgroups": [
                    "maternal_obstetrics1"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Parenteral anti-convulsants",
                "name": "Parenteral anti-convulsants",
                "display_style": "checkmark_true",
                "display_order": 30,
                "description": "Facility has IV or IM anticonvulsants.",
                "clickable": true,
                "slug": "emoc_parenteral_anticonvulsant",
                "subgroups": [
                    "maternal_obstetrics2"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Skilled birth attendant 1",
                "name": "Skilled birth attendant 1",
                "display_style": "checkmark_true",
                "display_order": 31,
                "description": "Facility has at least one skilled birth attendant (doctor, midwife or nurse-midwife) on staff.",
                "clickable": true,
                "slug": "skilled_birth_attendant",
                "subgroups": [
                    "maternal_obstetrics2"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Skilled birth attendant 2",
                "name": "Skilled birth attendant 2",
                "display_style": "checkmark_true",
                "display_order": 32,
                "description": "Facility has at least two skilled birth attendants (doctor, midwife or nurse-midwife) on staff.",
                "clickable": true,
                "slug": "at_least_two_skilled_birth_attendants",
                "subgroups": [
                    "maternal_obstetrics2"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Skilled birth attendant 3",
                "name": "Skilled birth attendant 3",
                "display_style": "checkmark_true",
                "display_order": 33,
                "description": "Facility has at least three skilled birth attendants (doctor, midwife or nurse-midwife) on staff.",
                "clickable": true,
                "slug": "at_least_three_skilled_birth_attendants",
                "subgroups": [
                    "maternal_obstetrics2"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Uterotonics",
                "name": "Uterotonics",
                "display_style": "checkmark_true",
                "display_order": 28,
                "description": "Facility has uterotonics available.",
                "clickable": true,
                "slug": "uterotonics_yn_calc",
                "subgroups": [
                    "maternal_obstetrics2"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Antishock garment",
                "name": "Antishock garment",
                "display_style": "checkmark_true",
                "display_order": 29,
                "description": "Facility has an anti-shock garment.",
                "clickable": true,
                "slug": "antishock_garment_yn",
                "subgroups": [
                    "maternal_obstetrics2"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "IV Antibiotics",
                "name": "IV Antibiotics",
                "display_style": "checkmark_true",
                "display_order": 27,
                "description": "Facility has IV antibiotics available.",
                "clickable": true,
                "slug": "iv_antibiotics_yn_calc",
                "subgroups": [
                    "maternal_obstetrics1"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Mobile Coverage",
                "name": "Mobile Coverage",
                "display_style": "checkmark_true",
                "display_order": 26,
                "description": "Facility has a currently functioning mobile coverage on the premises.",
                "clickable": true,
                "slug": "mobile_signal_funct_yn",
                "subgroups": [
                    "maternal_obstetrics1"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Iron",
                "name": "Iron",
                "display_style": "checkmark_true",
                "display_order": 18,
                "description": "Facility has iron tablets available.",
                "clickable": true,
                "slug": "medication_iron_tablets",
                "subgroups": [
                    "maternal_antenatal"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Folic Acid",
                "name": "Folic Acid",
                "display_style": "checkmark_true",
                "display_order": 19,
                "description": "Facility has folic acid available.",
                "clickable": true,
                "slug": "medication_folic_acid",
                "subgroups": [
                    "maternal_antenatal"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Weighing scale",
                "name": "Weighing scale",
                "display_style": "checkmark_true",
                "display_order": 20,
                "description": "Facility has a weighing scale.",
                "clickable": true,
                "slug": "scale_yn",
                "subgroups": [
                    "maternal_antenatal"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "BP machine",
                "name": "BP machine",
                "display_style": "checkmark_true",
                "display_order": 21,
                "description": "Facility has a blood pressure (BP) machine.",
                "clickable": true,
                "slug": "equipment_bp_machine",
                "subgroups": [
                    "maternal_antenatal"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "PMTCT",
                "name": "PMTCT",
                "display_style": "checkmark_true",
                "display_order": 22,
                "description": "Facility offers PMTCT services.",
                "clickable": true,
                "slug": "hiv_tx_srvcs_pmtct_services_calc",
                "subgroups": [
                    "maternal_antenatal"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Hemoglobin Measurement",
                "name": "Hemoglobin Measurement",
                "display_style": "checkmark_true",
                "display_order": 23,
                "description": "Facility can perform measurement of a patient's hemoglobin.",
                "clickable": true,
                "slug": "lab_tests_hemoglobin_testing_calc",
                "subgroups": [
                    "maternal_antenatal"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Urinalysis",
                "name": "Urinalysis",
                "display_style": "checkmark_true",
                "display_order": 24,
                "description": "Facility can perform urinalysis.",
                "clickable": true,
                "slug": "lab_tests_urine_testing_calc",
                "subgroups": [
                    "maternal_antenatal"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Access to Emergency Transport",
                "name": "Access to Emergency Transport",
                "display_style": "checkmark_true",
                "display_order": 25,
                "description": "Facility has access to emergency transport that is currently functional.",
                "clickable": true,
                "slug": "emergency_transport_currently_functioning",
                "subgroups": [
                    "maternal_obstetrics1"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "SP (IPT for Malaria)",
                "name": "SP (IPT for Malaria)",
                "display_style": "checkmark_true",
                "display_order": 16,
                "description": "Facility provides antenatal care including sulphadoxine pyrimethamine (SP or fansidar) for the prevention of malaria during pregancy.",
                "clickable": true,
                "slug": "sulpha_and_antenatal",
                "subgroups": [
                    "maternal_antenatal"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Insecticide Treated Nets",
                "name": "Insecticide Treated Nets",
                "display_style": "checkmark_true",
                "display_order": 17,
                "description": "Facility has insecticide treated bednets (ITNs) available.",
                "clickable": true,
                "slug": "has_itns",
                "subgroups": [
                    "maternal_antenatal"
                ]
            },
            {
                "descriptive_name": "Doctors",
                "description": "Number of full-time doctors on staff at the facility.",
                "display_order": 13,
                "name": "Doctors",
                "clickable": true,
                "slug": "num_doctors_fulltime",
                "subgroups": [
                    "staffing"
                ]
            },
            {
                "descriptive_name": "Lab technicians",
                "description": "Number of full-time lab technicians on staff at the facility.",
                "display_order": 14,
                "name": "Lab technicians",
                "clickable": true,
                "slug": "num_lab_techs_fulltime",
                "subgroups": [
                    "staffing"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Salaried staff paid during last period",
                "name": "Salaried staff paid during last period",
                "display_style": "checkmark_true",
                "display_order": 15,
                "description": "Salary staff at the facility were paid their salaries during the last payment/financial period before data was collected.",
                "clickable": true,
                "slug": "staff_paid_lastmth_yn",
                "subgroups": [
                    "staffing"
                ]
            },
            {
                "descriptive_name": "Midwives and Nurse-midwives",
                "description": "Number of full-time midwives and nurse-midwives on staff at the facility.",
                "display_order": 12,
                "name": "Midwives and Nurse-midwives",
                "clickable": true,
                "slug": "num_nursemidwives_fulltime",
                "subgroups": [
                    "staffing"
                ]
            },
            {
                "descriptive_name": "Nurses",
                "description": "Number of full-time nurses on staff at the facility.",
                "display_order": 11,
                "name": "Nurses",
                "clickable": true,
                "slug": "num_nurses_fulltime",
                "subgroups": [
                    "staffing"
                ]
            },
            {
                "descriptive_name": "CHEWs and JCHEWs",
                "description": "Number of full-time community health extension workers (CHEWs) and junior community health extension workers (JCHEWs) on staff at the facility.",
                "display_order": 10,
                "name": "CHEWs and JCHEWs",
                "clickable": true,
                "slug": "num_chews_total",
                "subgroups": [
                    "staffing",
                    ""
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Power",
                "name": "Power",
                "display_style": "checkmark_true",
                "display_order": 8,
                "description": "Facility has access to a power source that is currently functional.",
                "clickable": true,
                "slug": "power_access_and_functional",
                "subgroups": [
                    "snapshot"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Comprehensive EmOC",
                "name": "Comprehensive EmOC",
                "display_style": "checkmark_true",
                "display_order": 9,
                "description": "Facility offers comprehensive  emergency obstetric care 24 hours a day, seven days a week. This includes all the components of Basic Emergency Obstetric Care with the addition of the ability to perform Caesarian Section and blood transfusion",
                "clickable": true,
                "slug": "comprehensive_obstetrics_yn",
                "subgroups": [
                    "snapshot"
                ]
            },
            {
                "descriptive_name": "CHOs, CHEWs and JCHEWs",
                "description": "Number of full-time community health officers (CHOs), community health extension workers (CHEWs) and junior community health extension workers (JCHEWs) on staff at the facility.",
                "display_order": 7,
                "name": "CHOs, CHEWs and JCHEWs",
                "clickable": true,
                "slug": "num_chews_and_chos",
                "subgroups": [
                    "snapshot"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "24/7 Curative Care",
                "name": "24/7 Curative Care",
                "display_style": "checkmark_true",
                "display_order": 2,
                "description": "Facility offers curative care 24 hours a day, 7 days a week.",
                "clickable": true,
                "slug": "facility_open_247_yn",
                "subgroups": [
                    "snapshot"
                ]
            },
            {
                "click_actions": [
                    "piechart_false",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/false/",
                "descriptive_name": "Drug Stock Outs",
                "name": "Drug Stock Outs",
                "display_style": "checkmark_false",
                "display_order": 3,
                "description": "Facility has had a stockout of essental medications (antimalarials, antidiarrheals or antibiotics) for at least one week in the month prior to data collection.",
                "clickable": true,
                "slug": "essential_meds_stockout",
                "subgroups": [
                    "snapshot"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Skilled birth attendant",
                "name": "Skilled birth attendant",
                "display_style": "checkmark_true",
                "display_order": 6,
                "description": "Facility has at least one skilled birth attendant (doctor, midwife or nurse-midwife) on staff.",
                "clickable": true,
                "slug": "skilled_birth_attendant",
                "subgroups": [
                    "snapshot"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Adequate Staffing",
                "name": "Adequate Staffing",
                "display_style": "checkmark_true",
                "display_order": 5,
                "description": "The facility's staffing meets Nigerian minimum standards for a facility of its type.",
                "clickable": true,
                "slug": "n/a",
                "subgroups": [
                    "snapshot"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Access to Emergency Transport",
                "name": "Access to Emergency Transport",
                "display_style": "checkmark_true",
                "display_order": 4,
                "description": "Facility has access to emergency transport that is currently functional.",
                "clickable": true,
                "slug": "emergency_transport_currently_functioning",
                "subgroups": [
                    "snapshot"
                ]
            },
            {
                "descriptive_name": "Name",
                "name": "Name",
                "display_order": 0,
                "clickable": false,
                "slug": "facility_name",
                "subgroups": [
                    "snapshot",
                    "staffing",
                    "",
                    "maternal_antenatal",
                    "maternal_obstetrics1",
                    "maternal_obstetrics2",
                    "maternal_famplan",
                    "child_nutrition",
                    "child_immunization",
                    "malaria",
                    "medicines",
                    "basic_equipment",
                    "diagnostics",
                    "infrastructure",
                    "TB",
                    "HIV",
                    "curative_care"
                ]
            },
            {
                "click_actions": [
                    "piechart_true",
                    "iconify"
                ],
                "iconify_png_url": "./images/status_icons/true/",
                "descriptive_name": "Delivery Services 24/7",
                "name": "Delivery Services 24/7",
                "display_style": "checkmark_true",
                "display_order": 1,
                "description": "Facility can perform deliveries 24 hours a day, seven days a week.",
                "clickable": true,
                "slug": "maternal_health_delivery_services_24_7",
                "subgroups": [
                    "snapshot"
                ]
            }
        ],
        "slug": "health"
    }
];