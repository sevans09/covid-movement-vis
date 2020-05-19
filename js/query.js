function handleQuery() {
    $('#queriedCounty').blur();
    var query = $("#queriedCounty").val();
    $("#barchart").empty();
    var states_with_county = [];
  
    Object.keys(names_and_county_dict)
    .forEach(function eachKey(key) { 
      if (names_and_county_dict[key] == query.toLowerCase()) {
        states_with_county.push(key)
      }
    });
  
    if (states_with_county.length > 1) {
      $( "#alertdiv" ).hide();
      $( "#barchartdiv" ).show();
      addDropdown(states_with_county);
    }
    else {
      $("button#dropdown.dropbtn").hide();
      var fips_q = names_dict[query.toLowerCase()];
      
      if (cases_dict.get(fips_q)) {
        highlight_single(fips_q);
        $( "#alertdiv" ).hide();
        $( "#barchartdiv" ).show();
        displayBar(fips_q);
      }
      else if (typeof(fips_q) == "undefined") {
        console.log('fips undef')
        $( "#alertdiv" ).show();
        $( "#alertdiv" ).html("County does not exist");     
      }
      else  {
        highlight_single(fips_q);
        $( "#barchartdiv" ).hide( "slow" );
          // Capitalize each word of the county
          console.log("type is",typeof(county_dict.get(query)))
          console.log('fips q', fips_q)
            console.log("fips not undef")
            const upper = toTitleCase(county_dict.get(fips_q))
            $( "#alertdiv" ).show();
            $( "#alertdiv" ).html("No case data for " + upper);
          // }
      }
    }
}
  
function handleStateQuery() {
    $('#queriedState').blur();
    selected_state = $("#queriedState").val();
    var query = $("#queriedState").val();
    console.log(state_names_dict[toTitleCase(query)]);
    if (state_names_dict[toTitleCase(query)]) {
      $("#alertdiv").hide();
      $("#barchart").empty();
      $("#barchartdiv").show();
  
      makeDonut(toTitleCase(query), 320, 320);
    }
    else {
      $( "#barchartdiv" ).hide( "slow" );
      $( "#alertdiv" ).show();
      $( "#alertdiv" ).html("State does not exist");
    }
  }
  
  $("#queriedCounty").on('keyup', function (e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        document.getElementById('queriedState').value = "";
        handleQuery();
      }
  });
  
  $("#queriedState").on('keyup', function (e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        document.getElementById('queriedCounty').value = "";
        handleStateQuery();
      }
});

function highlight_move(move_index) {
    var val = document.getElementById("myRange").value;
    if(document.getElementById("toggleButton").value=="MAP") {
      svg.selectAll(".counties path")
        .style("opacity", function(d) {
          return in_move_range(move_index, d.id, val) ? 1.2 : 0.3
        })
        .style("stroke", function(d) {
          return in_move_range(move_index, d.id, val) ? "white" : "transparent"
        });
    } else {
      var bubbles = d3.select(".bubble_svg")
      bubbles.selectAll("circle")
        .style("opacity", function(d) {
          return in_move_range(move_index, d.fips, val) ? 0.75 : 0.2
        })
        .style("stroke", function(d) {
          return in_move_range(move_index, d.fips, val) ? "black" : "white"
        })
    }
}
  
function unhighlight() {
    selected_fips = null;
    console.log("testing");
    var val = document.getElementById("myRange").value;
    if(document.getElementById("toggleButton").value=="MAP") {
      svg.selectAll(".counties path")
        .transition()
        .duration(500)
        .style("opacity", 0.95)
        .style("stroke", "transparent")
    }
    else {
      var bubbles = d3.select(".bubble_svg")
      bubbles.selectAll("circle")
        .transition()
        .duration(500)
        .style("opacity", 0.75)
        .style("stroke", "transparent")
  
    }
}

function highlight_single(county) {
    console.log(county);
    var val = document.getElementById("myRange").value;
    if(document.getElementById("toggleButton").value=="MAP") {
      console.log("map");
      svg.selectAll(".counties path")
        .transition()
        .duration(500)
        .style("opacity", function(d) {
          return (county == d.id) ? 1.2 : 0.3
        })
        .style("stroke", function(d) {
          return county == d.id ? "black" : "transparent"
        });
    } else {
      console.log("bubbles");
      var bubbles = d3.select(".bubble_svg")
      bubbles.selectAll("circle")
        .transition()
        .duration(500)
        .style("opacity", function(d) {
          return (county == d.fips) ? 0.75 : 0.2
        })
        .style("stroke", function(d) {
          return (county == d.fips) ? "black" : "transparent"
        })
    }
    console.log("done");
  }