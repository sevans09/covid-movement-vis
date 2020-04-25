function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function make_bubbles(val, dem) {

  var margin = {top: 0, right: 50, bottom: 50, left: 50},
  $("#bubblediv").empty()
  console.log("hello")
  var width = $("#bubblediv").width()
  var height = $("#bubblediv").height()

  var max_income = 123000;
  var min_income = 23000;
  var max_pop = 1000000;
  var min_pop = 169;

  var min_max = {
    "income": {'min': min_income, 'max': max_income]},
    "pop"   : {'min': min_pop, 'max': max_pop}
  }

  var dem_text = {
    "income": "Median Income",
    "vote"  : "% Vote for Trump in 2016",
    "cases" : "Cases Per Capita"
  }

  var dem_pos = {
    "income": income_pos
  }

  function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  var move_dict = d3.map();
  og_data.forEach( function(d){ move_dict.set( d.fips, d.move_index) });

  var county_dict = d3.map();
  var sab_dict = d3.map();
  og_data.forEach( function(d){ 
    county_dict.set( d.fips, d.county);
    sab_dict.set(d.fips, d.sab);
  });

  var x = d3.scaleLinear()
    .domain( [min_max[dem].min, min_max[dem].max] )
    .range( [margin.left, width - margin.right] );

  var radquantize = d3.scaleQuantize()
      .domain([min_max['pop'].min, min_max['pop'].max])
      .range([2, 5])

  var xAxis = d3.axisBottom(x);

  var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-5, 0])
      .html(function(d) {
        return "County: " + toTitleCase(d.county) + " (" + d.sab + ")<br>Move Index: " + d.move + "<br>Population: " + numberWithCommas(d.pop) + "<br>Income: $" + numberWithCommas(d.income);
      })

 
  d3.json("./bubble/dem-data.json", function(error, data) {
    if (error) throw error;

 var bubbles = d3.select("#bubblediv").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("shape-rendering", "geometric-precision");

  bubbles.call(tip);


  var xAxisTitle = bubbles.append("text")
    .attr("class", "axisTitle")
    .text(dem_text[dem])

  xAxisTitle
    .attr("x", width - xAxisTitle.node().getBBox().width)
    .attr("y", ( height/2) - xAxisTitle.node().getBBox().height);

  var quantize = d3.scaleQuantize()
      .domain([0, 4])
      .range(d3.range(5).map(function(i) { 
          if (i == 0)
              return "#9adbb5";
          else if (i == 1)
              return "rgb(205, 235, 178)";
          else if (i == 2)
              return "#F6F5AE";
          else if (i == 3)
              return "rgb(253, 223, 158)";
          else
              return "rgb(211, 85, 65)";
      }))

  var y_dict = d3.map();


  y_pos = dem_pos[dem]

  y_pos.forEach( function(d){ y_dict.set( d.fips, (500) - d.y) });

    //add other demographics!
    var nodes = data.map(function(node, index) {
      return {
        index: index,
        move: move_dict.get(node.fips)[val-1],
        fips: node.fips, 
        pop: node.pop_2019,
        income: node.median_income,
        county: node.county,
        sab: node.sab,
        x: x(node.median_income),
        fx: x(node.median_income),
        r: radquantize(node.pop_2019),
        // y: y_dict.get(node.fips)
      };
    });

    bubbles.append("g")
      .attr("class", "x axis")
      .force("x", d3.forceX(function(d) { return x(d.income); }).strength(1))
      .force("y", d3.forceY(( height/2)))
      .attr("transform", "translate(0," + ( height/2)  + ")")
      .call(xAxis);

    var simulation = d3.forceSimulation(nodes)
      .force("collide", d3.forceCollide().radius(function(d){ return d.r}))
      .force("manyBody", d3.forceManyBody().strength(-1))
      
    for (var i = 500 - 1; i >= 0; i--) {
      console.log("tick")
      simulation.tick()
    }

    var circle = bubbles.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .style("fill", function(d) { return quantize(d.move); })
      .attr("cx", function(d) { return d.x} )
      .attr("cy", function(d) { return d.y} )
      .attr("r", function(d) { return d.r} )
      .style("opacity", 0.8)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
  });
}