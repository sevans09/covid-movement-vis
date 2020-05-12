function donutChart(state) {
    var width = 400,
        height = 400,
        margin = {top: 10, right: 10, bottom: 10, left: 10},
        colour = d3.scaleOrdinal(d3.schemeCategory20c), // colour scheme
        // colour = d3.scaleOrdinal(["#dcc9e2","#d0aad2","#d08ac2","#dd63ae","#e33890","#d71c6c","#b70b4f","#8f023a","#67001f", "#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef"]),
        variable, // value in data that will dictate proportions on chart
        category, // compare data by
        padAngle, // effectively dictates the gap between slices
        floatFormat = d3.format('.4r'),
        cornerRadius, // sets how rounded the corners are on each slice
        percentFormat = d3.format(',.2%');

    function chart(selection){
        selection.each(function(data) {
            // generate chart

            // quantize(move_dict.get(d.id)[val-1]===========================================================================================
            // Set up constructors for making donut. See https://github.com/d3/d3-shape/blob/master/README.md
            var radius = Math.min(width, height) / 2;

            // creates a new pie generator
            var pie = d3.pie()
                .value(function(d) { return floatFormat(d[variable]); })
                .sort(null);

            // contructs and arc generator. This will be used for the donut. The difference between outer and inner
            // radius will dictate the thickness of the donut
            var arc = d3.arc()
                .outerRadius(radius * 0.8)
                .innerRadius(radius * 0.6)
                .cornerRadius(cornerRadius)
                .padAngle(padAngle);

            // this arc is used for aligning the text labels
            var outerArc = d3.arc()
                .outerRadius(radius * 0.9)
                .innerRadius(radius * 0.9);
            // ===========================================================================================

            // ===========================================================================================
            // append the svg object to the selection
            selection.selectAll("*").remove();
            var svg = selection.append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
              .append('g')
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
            // ===========================================================================================

            // ===========================================================================================
            // g elements to keep elements within svg modular
            svg.append('g').attr('class', 'slices');
            svg.append('g').attr('class', 'labelName');
            svg.append('g').attr('class', 'lines');
            // ===========================================================================================

            // ===========================================================================================
            // add and colour the donut slices
            var path = svg.select('.slices')
                .datum(data).selectAll('path')
                .data(pie)
              .enter().append('path')
                .attr('fill', function(d) { 
                    var county = getFips(d);
                    console.log(county);
                    var val = document.getElementById("myRange").value;
                    if (move_dict.get(county))
                        return quantize(move_dict.get(county)[val-1]);
                    else
                        return "#979797"; })
                // .attr('fill', '#979797')
                .attr('d', arc);
            
            // add tooltip to mouse events on slices and labels
            d3.selectAll('.slices path').call(toolTip);
            
            // Functions

            // calculates the angle for the middle of a slice
            function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }

            function getFips(data) {
                var county = data.data['County'];
                var states_with_county = new Array();
                Object.keys(names_and_county_dict)
                .forEach(function eachKey(key) { 
                    if (names_and_county_dict[key] == data.data['County'].toLowerCase()) {
                        states_with_county.push(key)
                    }
                });
                if (states_with_county.length > 1) {
                    for (i = 0; i < states_with_county.length; i++) {
                        if (states_dict.get(states_with_county[i]) == state) {
                            return states_with_county[i];
                        }
                    }
                }
                else {
                    return names_dict[county.toLowerCase()];
                }
            }

            // function that creates and adds the tool tip to a selected element
            function toolTip(selection) {

                // add tooltip (svg circle element) when mouse enters label or slice
                selection.on('mouseenter', function (data) {

                    svg.append('text')
                        .attr('class', 'toolCircle')
                        .attr('dy', -15) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
                        .html(toolTipHTML(data)) // add text to the circle.
                        .style('font-size', '1em')
                        .style('text-anchor', 'middle'); // centres text in tooltip

                    svg.append('circle')
                        .attr('class', 'toolCircle')
                        .attr('r', radius * 0.55) // radius of tooltip circle
                        .style('fill', function() {
                            console.log(data.data['County']);
                            var county = getFips(data);
                            var val = document.getElementById("myRange").value;
                            if (move_dict.get(county))
                                return quantize(move_dict.get(county)[val-1]);
                            else
                                return "#979797"; })
                                // colour based on category mouse is over
                        // .attr('fill', '#979797')
                        .style('fill-opacity', 0.35);

                    var fips_q = getFips(data);
                    highlight_single(fips_q);
                });

                // remove the tooltip when mouse leaves the slice/label
                selection.on('mouseout', function () {
                    unhighlight();
                    d3.selectAll('.toolCircle').remove();
                });

                selection.on('click', function(data) {
                    console.log("mouse click");
                    console.log(state);
                    console.log(data.data['County']);
                    var fips_q = getFips(data);
                    // var county = data.data['County'];
                    // var states_with_county = new Array();
                    // Object.keys(names_and_county_dict)
                    // .forEach(function eachKey(key) { 
                    //   if (names_and_county_dict[key] == data.data['County'].toLowerCase()) {
                    //     states_with_county.push(key)
                    //   }
                    // });
                    // if (states_with_county.length > 1) {
                    //     console.log(states_with_county);
                    //     for (i = 0; i < states_with_county.length; i++) {
                    //       if (states_dict.get(states_with_county[i]) == state) {
                    //           displayBar(states_with_county[i]);
                    //       }
                    //     }
                    // }
                    // else {
                    //     $("button#dropdown.dropbtn").hide();
                    //     var fips_q = names_dict[county.toLowerCase()];
                    
                    if (cases_dict.get(fips_q)) {
                        $( "#alertdiv" ).hide();
                        $( "#barchartdiv" ).show();
                        displayBar(fips_q);
                    }
                    else {
                        $( "#barchartdiv" ).hide( "slow" );
                        // Capitalize each word of the county
                        const upper = toTitleCase(county_dict.get(county))
                        $( "#alertdiv" ).show();
                        $( "#alertdiv" ).html("No case data for " + upper);
                    }
                })
            }

            function numberWithCommas(x) {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }


            // function to create the HTML string for the tool tip. Loops through each key in data object
            // and returns the html string key: value
            function toolTipHTML(data) {
    
                var tip = '',
                    i   = 0;

                data.data["Population"] = pop_dict.get(getFips(data));
                

                for (var key in data.data) {

                    // if value is a number, format it as a percentage
                    var value;
                    if (!isNaN(data.data[key])) {
                        if (data.data[key] % 1 == 0)
                            value = numberWithCommas(data.data[key]);
                        else
                            value = percentFormat(data.data[key]);
                    }
                    else {
                        value = data.data[key]
                    }
                    // var value = (!isNaN(parseFloat(data.data[key]))) ? percentFormat(data.data[key]) : data.data[key];

                    // leave off 'dy' attr for first tspan so the 'dy' attr on text element works. The 'dy' attr on
                    // tspan effectively imitates a line break.
                    if (i === 0) tip += '<tspan x="0">' + key + ': ' + value + '</tspan>';
                    else tip += '<tspan x="0" dy="1.2em">' + key + ': ' + value + '</tspan>';
                    i++;
                }

                return tip;
            }
            // ===========================================================================================

        });
    }

    // getter and setter functions. See Mike Bostocks post "Towards Reusable Charts" for a tutorial on how this works.
    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.margin = function(value) {
        if (!arguments.length) return margin;
        margin = value;
        return chart;
    };

    chart.radius = function(value) {
        if (!arguments.length) return radius;
        radius = value;
        return chart;
    };

    chart.padAngle = function(value) {
        if (!arguments.length) return padAngle;
        padAngle = value;
        return chart;
    };

    chart.cornerRadius = function(value) {
        if (!arguments.length) return cornerRadius;
        cornerRadius = value;
        return chart;
    };

    chart.colour = function(value) {
        if (!arguments.length) return colour;
        colour = value;
        return chart;
    };

    chart.variable = function(value) {
        if (!arguments.length) return variable;
        variable = value;
        return chart;
    };

    chart.category = function(value) {
        if (!arguments.length) return category;
        category = value;
        return chart;
    };

    return chart;
}
