function handleClick(fips) {
  unhighlight();
  if (cases_dict.get(fips)) {
    $( "#alertdiv" ).hide();
    $( "#barchartdiv" ).show();
    displayBar(fips);
  }
  else {
    $( "#barchartdiv" ).hide( "slow" );
    $( "#alertdiv" ).show();
    upper = toTitleCase(county_dict.get(fips));
    $( "#alertdiv" ).html("No case data for " + upper + " County");
  }
  highlight_single(fips);
}

function displayBar(data) {
    selected_state = null;
    selected_fips = data;
    console.log("selected fips", selected_fips);
    $("#barchart").empty();
      // var margin = {top: 30, right: 30, bottom: 50, left: 40};
      // width = 250;
      // height = 250;

      var margin = {top: 30, right: 30, bottom: 70, left: 40};
      var width = 300  - margin.left - margin.right;
      var height = 300 - margin.top - margin.bottom;
      var margin2 = {top: 230, right: 30, bottom: 30, left: 40}
      var height2 = 300 - margin2.top - margin2.bottom;
  
      function get_new_cases(data, i) {
        if (cases_dict.get(data)[i-1])
          return cases_dict.get(data)[i] - cases_dict.get(data)[i-1];
        else 
          return 0;
      }

        
      // Add Y axis
      var cases = cases_dict.get(data);
      var max = 0;
      for (i = 0; i < cases.length; i++) {
        if (cases[i] > max)
          max = cases[i];
      }
  
      var bartip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-5, 0])
        .html(function(d, i) {
          return "Date: " + dates_dict.get(data)[i] 
          + "<br>Total Cases: " + num_with_commas(cases_dict.get(data)[i])
          + "<br>New Cases: " + get_new_cases(data, i)
          + "<br>Deaths: " + num_with_commas(deaths_dict.get(data)[i]);
        })
  
      svg.call(bartip)
  
      // Bar chart SVG
      var svg2 = d3.select("#barchart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
        // .append("g")
        // .attr("transform",
        //       "translate(" + margin.left + "," + margin.top + ")");
  
      var x = d3.scaleBand()
        .range([ 0, width])
        .domain(dates_dict.get(data))
        .padding(0.2);

      var x2 = d3.scaleBand()
        .range([ 0, width])
        .domain(dates_dict.get(data))
        .padding(0.2);

      
      var y = d3.scaleLinear()
        .domain([0, max * 1.2])
        .range([ height, 0]);
      // svg2.append("g")
      //   .call(d3.axisLeft(y));

      var y2 = d3.scaleLinear()
        .domain([0, max * 1.2])
        .range([ height, 0]);

      var brush = d3.brushX()
        .extent([
          [0, 0],
          [width, height2]
        ])
        .on("brush", brushed);
  
      var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([
          [0, 0],
          [width, height]
        ])
        .extent([
          [0, 0],
          [width, height]
        ])
        .on("zoom", zoomed);
        

      svg2.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
  
      var focus = svg2.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
      var context = svg2.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
  

      // x tick marks
      focus.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues(x.domain().filter( (d,i) => !(i % 7) )))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end")
          .style("font-size", "10px");

      focus.append("g")
        .call(d3.axisLeft(y));
        
  
      // Bars
      svg2.selectAll("mybar")
          .data(dates_dict.get(data))
          .enter()
          .append("rect")
            .attr("class", "cases")
            .attr("x", function(d) { 
              return x(d); 
              })
            .attr("width", x.bandwidth())
            .attr("fill", "#979797")
            .attr("height", function(d) { 
              return height - y(0); 
            })
            .attr("y", function(d) { 
              return y(0); 
            })
            .on("mouseover", bartip.show)
            .on("mouseout", bartip.hide)
        
      svg2.selectAll("mybar")
          .data(dates_dict.get(data))
          .enter()
          .append("rect")
            .attr("class", "deaths")
            .attr("x", function(d) { 
              return x(d); 
              })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { 
              return height - y(0); 
            })
            .attr("y", function(d) { 
              return y(0); 
            })
  
      // Animation
      svg2.selectAll(".cases")
        .transition()
        .duration(200)
        .attr("y", function(d, i) { 
          return y(cases_dict.get(data)[i]); 
        })
        .attr("height", function(d, i) { 
          return height - y(cases_dict.get(data)[i]); 
        })
        .delay(function(d,i){
            return(i*50)
        })
        
  
      svg2.selectAll(".deaths")
        .transition()
        .duration(200)
        .attr("fill", "#c02c59")
        .attr("y", function(d, i) { 
          return y(deaths_dict.get(data)[i]); 
        })
        .attr("height", function(d, i) { 
          return height - y(deaths_dict.get(data)[i]); 
        })
        .delay(function(d,i){
            return(i*50)
        })

      var focus_group = focus.append("g");
      focus_group.attr("clip-path", "url(#clip)");

      var brushRects = focus_group.selectAll('.cases')
        .data(cases_dict.get(data));

    //********* Brush Bar Chart ****************
    var brushRects1 = brushRects.enter();

    brushRects1.append('rect')
      .attr('class', 'bar mainBars')
      .attr('x', function(d, i) {
        return x2(i);
      })
      .attr('y', function(d, i) {
        return y2(i);
      })
      .attr('height', function(d, i) {
        return height2 - y2(i);
      })
      .attr('opacity', 0.85)
      .attr('width', 10)
      .attr("transform", "translate(" + 4 + ",0)")
      .style('fill', 'lightblue')
      .style('stroke', 'gray');

    //append brush xAxis2
    context.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(d3.axisBottom(x2).tickValues(x2.domain().filter( (d,i) => !(i % 7) )));

    context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());

    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  
        // get bounds of selection
        var s = d3.event.selection,
            nD = [];
        x2.domain().forEach((d)=>{
          var pos = x2(d) + x2.bandwidth()/2;
          if (pos > s[0] && pos < s[1]){
            nD.push(d);
          }
        });
        
        x.domain(nD);
        
        focus.selectAll(".mainBars")
          .style("opacity", function(d){
            return x.domain().indexOf(d) === -1 ? 0 : 100;
          })
          .attr("x", function(d, i) {
            return x(d)+ x.bandwidth()/2 - 5;
          })
          .attr("y", function(d) {
            return y(d);
          })
          .attr('height', function(d, i) {
            return height - y(d);
          })
          .attr('opacity', 1.0)
          .attr('width', 10);
  
          
        focus.select(".x.axis").call(d3.axisBottom(x).tickValues(x.domain().filter( (d,i) => !(i % 7) )));
        svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
          .scale(width / (s[1] - s[0]))
          .translate(-s[0], 0));
      }

      function zoomed() {

      }

  
      // Capitalize each word of the county
      const county = toTitleCase(county_dict.get(data));
      const state = toTitleCase(states_dict.get(data));
      console.log(state);
      const title = county + ", " + state;
      
      // Title
      svg2.append("text")
        .attr("x", (width / 2))             
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .text(title);
  
      // add legend   
      var legend = svg2.append("g")
          .attr("class", "legend")
          .attr("x", 5)
          .attr("y", 150)
          .attr("height", 100)
          .attr("width", 100);
          // .attr('transform', 'translate(-20,50)');
  
      var colors = ["#979797",  "#c02c59"];
      var text_strings = ["Cases", "Deaths"]
  
      var legendRect = legend.selectAll('rect').data(colors);
  
      console.log("bar");
      legendRect.enter()
          .append("rect")
          .attr("x", 10)
          .attr("width", 10)
          .attr("height", 10)
          .attr("y", function(d, i) {
              return i * 15 + 10;
          })
          .style("fill", function(d) {
              console.log(d);
              return d;
          });
  
      var legendText = legend.selectAll('text').data(text_strings);
  
      legendText.enter()
          .append("text")
          .style("font-size", "10px")
          .attr("x", 25)
          .attr("y", function(d, i) {
              return i * 15 + 19;
          })
          .text(function(d) {
              return d;
          });
    }