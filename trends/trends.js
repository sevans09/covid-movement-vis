/* BEGIN BUBBLE SHIT */
var max_income = 123000;
var min_income = 18000;
var max_pop = 1000000;
var min_pop = 169;
var min_vote = 0;
var max_vote = 1;
var min_unemp = 0;
var max_unemp = .26;

var min_max = {
  "income": {'min': min_income, 'max': max_income},
  "pop"   : {'min': min_pop, 'max': max_pop},
  "vote"  : {'min': min_vote, 'max': max_vote},
  "unemp" : {'min': min_unemp, 'max': max_unemp}
}

var dem_title = {
  "income": "Median Income",
  "vote"  : "% GOP Vote 2016",
  "unemp" : "Unemployment Rate"
}

var dem_label = {
  "income": "Income: $",
  "vote"  : "% GOP Vote: ",
  "unemp" : "Unemployment"
}

var dem_pos = {
  "income": income_pos,
  "vote"  : pos_vote,
  "unemp" : unemp_pos
}

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

var move_dict = d3.map();
og_data.forEach( function(d){ move_dict.set( d.fips, d.move_index) });

var county_dict = d3.map();
var sab_dict = d3.map();
og_data.forEach( function(d){ 
  county_dict.set( d.fips, d.county);
  sab_dict.set(d.fips, d.sab);
});

var pop_dict = d3.map()
dem_data.forEach( function(d){ 
  pop_dict.set( d.fips, d.pop_2019);
});

var unemp_dict = d3.map()
unemp_data.forEach( function(d) {
  unemp_dict.set(d.id, d.rate);
});


function get_rad_range(width) {
  if (width >= 900) {
    return [3,8]
  }
  else if (width >= 600) {
    return [2,5]
  }
  return [1.5,3]
}

function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

percentFormat = d3.format(',.2%');

function get_x_value(dem, data) {
  if (dem == "income") {
      return numberWithCommas(data.income);
    }
  else if (dem == "unemp") {
    return percentFormat(data.unemp);
  }
  return (dem == "vote") ? percentFormat(data.vote) : data.cases;
}

function get_node_x(dem, node) {
    if (dem == "income") {
      return node.median_income
    }
    else if (dem == "unemp")
      return node.unemp
    return (dem == "vote") ? node.per_gop : node.cpc
}

function get_d_x(dem, node) {
    if (dem == "income") {
      return node.income
    }
    else if (dem == "unemp") {
      return node.unemp
    }
    return (dem == "vote") ? node.vote : node.cpc
}

function get_move(d) {
  var val = document.getElementById("myRange").value;
  return move_dict.get(d.fips)[val-1]
}

function make_x_axis(dem) {

  var margin = {top: 300, right: 250, bottom: 50, left: 50};
  var width = $("#maps").width()
  var height = $("#maps").height()

  pos = $("#maps").position().top;

  var bubbles = d3.select(".bubble_svg")

  var x = d3.scaleLinear()
  .domain( [min_max[dem].min, min_max[dem].max] )
  .range( [margin.left, width - margin.right] );

  var xAxis = d3.axisBottom(x);

  var xAxisTitle = bubbles.append("text")
    .attr("class", "axisTitle")
    .text(dem_title[dem]);

  xAxisTitle
    .attr("x", width - xAxisTitle.node().getBBox().width - width/4.5)
    .attr("y", ( height/2) - xAxisTitle.node().getBBox().height - height/5)

  bubbles.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height/2)  + ")")
    .call(xAxis);
}

function update_demographic(dem, val) {
  console.log("update");
  console.log(dem);
  var margin = {top: 300, right: 250, bottom: 50, left: 50};
  var t = d3.transition()
        .duration(750);

  var width = $("#maps").width()
  var height = $("#maps").height()

  var bubbles = d3.select(".bubble_svg")

  bubbles.select(".axisTitle").remove()
  bubbles.select("g.x.axis").remove()
  bubbles.select(".d3-tip").remove()

  var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-5, 0])
      .html(function(d) {
        return "County: " + toTitleCase(d.county) 
        + " (" + d.sab + ")<br>Move Index: " + get_move(d)
        + "<br>Population: " + numberWithCommas(d.pop) 
        + "<br>" + dem_label[dem] + ": " + get_x_value(dem, d);
  })

  bubbles.call(tip);

  var x = d3.scaleLinear()
    .domain([min_max[dem].min, min_max[dem].max] )
    .range([margin.left, width - margin.right]);

  var y_dict = d3.map();
  y_pos = dem_pos[dem];
  y_pos.forEach( function(d){ y_dict.set(d.fips, 250 - d.y )});

  var circle = bubbles.selectAll("circle")
    .attr("x", function(d) { return x(get_d_x(dem, d))})
    .attr("y", function(d) { return y_dict.get(d.fips)})
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .transition(t)
      .attr("cx", function(d) { return x(get_d_x(dem, d))})
      .attr("cy", function(d) { return y_dict.get(d.fips)})
      .attr("transform", "translate(0," + height/2 + ")")

  make_x_axis(dem)
}

// to be used with swapmap to replace map with bubbles
function make_bubbles_rep(us, val, dem) {
  console.log(dem);
  console.log("swap map");

  var margin = {top: 300, right: 250, bottom: 50, left: 50};
  d3.select(".bubble_svg").remove();
  var width = $("#maps").width()
  var height = $("#maps").height()

  pos = $("#maps").position().top;

  rad_range = get_rad_range(width)
 
  var x = d3.scaleLinear()
    .domain( [min_max[dem].min, min_max[dem].max] )
    .range( [margin.left, width - margin.right]);

  var radquantize = d3.scaleQuantize()
      .domain([min_max['pop'].min, min_max['pop'].max])
      .range(rad_range)

  d3.json("./bubble/dem-data.json", function(error, data) {
    if (error) throw error;

  var bubbles = d3.select("#maps").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "bubble_svg")
    .attr("shape-rendering", "geometric-precision");

  $("#maps").css("visibility", "visible");


  var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-5, 0])
      .html(function(d) {
        return "County: " + toTitleCase(d.county) 
        + " (" + d.sab + ")<br>Move Index: " + get_move(d)
        + "<br>Population: " + numberWithCommas(d.pop) 
        + "<br>" + dem_label[dem] + ": " + get_x_value(dem, d);
  })

  bubbles.call(tip);

  var y_dict = d3.map();
  y_pos = dem_pos[dem]
  y_pos.forEach( function(d){ y_dict.set(d.fips, 250 - d.y )});

  //add education metric
  var nodes = data.map(function(node, index) {
      return {
        index: index,
        fips: node.fips, 
        pop: node.pop_2019,
        income: node.median_income,
        county: node.county,
        sab: node.sab,
        vote: node.per_gop,
        unemp: unemp_dict.get(node.fips),
        x: x(get_node_x(dem, node)),
        fx: x(get_node_x(dem, node)),
        r: radquantize(node.pop_2019),
        y: y_dict.get(node.fips)
      };
    });

    // var simulation = d3.forceSimulation(nodes)
    //   .force("x", d3.forceX(function(d) { return d.x; }).strength(1))
    //   .force("collide", d3.forceCollide().radius(function(d){ return d.r}))
    //   .force("manyBody", d3.forceManyBody().strength(-1))
    //   .tick();

    var circle = bubbles.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .style("fill", function(d) { return quantize(move_dict.get(d.fips)[val-1]); })
      .attr("cx", function(d) { return x(get_d_x(dem, d))} )
      .attr("cy", function(d) { return y_dict.get(d.fips)} )
      .attr("r", function(d) { return d.r} )
      .style("opacity", function(d) {
        return ((d.y + height/2) <= d.r || (d.y + height/2) >= (height - d.r)) ?  0 : 0.75})
      .attr("transform", "translate(0," + height/2 + ")")
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .on('click', function(d) { handleClick(d.fips) })

    make_x_axis(dem)

    if (selected_fips != null)
      highlight_single(selected_fips);
  });

}
