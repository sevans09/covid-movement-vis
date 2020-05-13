function makeDonut(state, width, height) {
    var donut = donutChart(state)
        .width(width)
        .height(height)
        .cornerRadius(3) // sets how rounded the corners are on each slice
        .padAngle(0.015) // effectively dictates the gap between slices
        .variable('Percentage')
        .category('County');

    d3.csv('donut/test.csv', function(error, data) {
        newdata = data.filter(function(d) {
            if (d.State == state) {
                return d;
            }
        })
        if (error) throw error;
        d3.select('#barchart')
            .datum(newdata) // bind data to the div
            .call(donut); // draw chart in div
    });
}
