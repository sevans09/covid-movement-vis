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
      var margin = {top: 30, right: 30, bottom: 50, left: 45};
      width = 250;
      height = 250;
  
      function get_new_cases(data, i) {
        if (cases_dict.get(data)[i-1])
          return cases_dict.get(data)[i] - cases_dict.get(data)[i-1];
        else 
          return 0;
      }
  
      var bartip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-5, 0])
        .html(function(d, i) {
          return "Date: " + sliced_data[i] 
          + "<br>Total Cases: " + num_with_commas(cases[i])
          + "<br>New Cases: " + get_new_cases(data, i)
          + "<br>Deaths: " + num_with_commas(deaths[i]);
        })
  
      svg.call(bartip)
  
      // Bar chart SVG
      var svg2 = d3.select("#barchart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
  
      function get_slice_index(dates) {
        for (var num in dates) {;
          if (dates[num] == "2020-10-01") {
            console.log("SLICE", num);
            return num;
          }
        }
        return 0;
      }

      const start_idx = get_slice_index(dates_dict.get(data));
      var sliced_data = dates_dict.get(data).slice(start_idx)
      var x = d3.scaleBand()
        .range([ 0, width])
        .domain(sliced_data)
        .padding(0.2);
        
      svg2.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues(x.domain().filter( (d,i) => !(i % 7) )))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end")
          .style("font-size", "10px");
  
      // Add Y axis
      var cases = cases_dict.get(data).slice(start_idx);
      var deaths = deaths_dict.get(data).slice(start_idx);
      var max = 0;
      for (i = 0; i < cases.length; i++) {
        if (cases[i] > max)
          max = cases[i];
      }
      var y = d3.scaleLinear()
        .domain([0, max * 1.2])
        .range([ height, 0]);
      svg2.append("g")
        .call(d3.axisLeft(y));
  
      // Bars
      svg2.selectAll("mybar")
          .data(sliced_data)
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
          .data(sliced_data)
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
          return y(cases[i]); 
        })
        .attr("height", function(d, i) { 
          return height - y(cases[i]); 
        })
        .delay(function(d,i){
            return(i*50)
        })
        
  
      svg2.selectAll(".deaths")
        .transition()
        .duration(200)
        .attr("fill", "#c02c59")
        .attr("y", function(d, i) { 
          return y(deaths[i]); 
        })
        .attr("height", function(d, i) { 
          return height - y(deaths[i]); 
        })
        .delay(function(d,i){
            return(i*50)
        })
  
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