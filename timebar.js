var parseDate = d3.timeParse("%d-%b-%Y")
d3.select("body").append('div').attr('class', 'barArea')

function initial_draw_bar(selected_file, isFirst) {
    d3.json("./Twitter_Data/RetweetNew/" + selected_file + ".json").then(draw_bar_chart)

}

function draw_bar_chart(data) {

    d3.selectAll(".barChart").transition().duration(500).style('opacity', 0).transition().remove()

    let key = Object.keys(data)
    let date = [];
    let date_for_bot = [];
    let date_total = [];

    for (i = 0; i < key.length; i++) {
        let month = data[key[i]].time.substring(4, 7);
        date_total.push(data[key[i]].time.substring(8, 10) + "-" + data[key[i]].time.substring(4, 7) + "-2018");
        if (data[key[i]].bot == 0)
            date.push(data[key[i]].time.substring(8, 10) + "-" + data[key[i]].time.substring(4, 7) + "-2018");
        if (data[key[i]].bot == 1)
            date_for_bot.push(data[key[i]].time.substring(8, 10) + "-" + data[key[i]].time.substring(4, 7) + "-2018");
    }

    var margin = { top: 20, right: 20, bottom: 70, left: 40 },
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    var x = d3.scaleBand().rangeRound([0, width], .05).padding(0.1);
    var y = d3.scaleLinear().range([height, 0]);

    let dataset = d3.nest()
        .key(function (d) { return d; })
        .entries(date);

    let dataset_for_bot = d3.nest()
        .key(function (d) { return d; })
        .entries(date_for_bot);

    let dataset_total = d3.nest()
        .key(function (d) { return d; })
        .entries(date_total);

    dataset.forEach(function (d) {
        d.key = parseDate(d.key);
        d.values = d.values.length;
    })

    dataset_for_bot.forEach(function (d) {
        d.key = parseDate(d.key);
        d.values = d.values.length;
    })

    dataset_total.forEach(function (d) {
        d.key = parseDate(d.key);
        d.values = d.values.length;
    })

    var xAxis = d3.axisBottom()
        .scale(x)
        .tickFormat(d3.timeFormat("%Y-%m-%d"));

    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(10);

    var svg = d3.select(".barArea").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "barChart")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    x.domain(dataset_total.map(function (d) { return d.key; }));
    if (dataset.length > 0 && dataset_for_bot.length > 0)
        y.domain([0, d3.max(dataset, function (d) { return d.values; }) + d3.max(dataset_for_bot, function (d) { return d.values; })]);
    else if (dataset.length > 0)
        y.domain([0, d3.max(dataset, function (d) { return d.values; })])
    else if (dataset_for_bot.length > 0)
        y.domain([0, d3.max(dataset_for_bot, function (d) { return d.values; })])

    svg.append("g").attr('id', 'x-axis')
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)")
    svg.select('#x-axis').style('opacity', 0)
        .transition()
        .delay(600).duration(1000).style('opacity', 1)

    svg.append("g").attr('id', 'y-axis')
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Value")

    svg.select('#y-axis').style('opacity', 0)
        .transition()
        .delay(600).duration(1000).style('opacity', 1)

    svg.selectAll("bar")
        .data(dataset)
        .enter().append("rect")
        .style('opacity', 0)
        .transition()
        //.delay(function (d, i) {
        //    return i * 100;
        //})
        .duration(300)
        .attr('id', d => d.key + 'hum')
        .style("fill", "steelblue")
        .attr("x", function (d) { return x(d.key); })
        .attr("width", x.bandwidth())
        .attr("y", function (d) {
            for (let i = 0; i < dataset_for_bot.length; i++) {
                if (dataset_for_bot[i].key - d.key == 0 && y(dataset_for_bot[i].values) > 0) {
                    return y(d.values) - (height - y(dataset_for_bot[i].values));
                }
            }
            return y(d.values);
        })
        .attr("height", function (d) { return height - y(d.values); })
        .transition().delay(500).duration(1000).style('opacity', 1)


    svg.selectAll("bar")
        .data(dataset_for_bot)
        .enter().append("rect")
        .style('opacity', 0)
        .transition()
        //.delay(function (d, i) {
        //    return i * 100;
        //})
        .duration(300)
        .attr('id', d => d.key + 'bot')
        .style("fill", "#E31A1C")
        .attr("x", function (d) { return x(d.key); })
        .attr("width", x.bandwidth())
        .attr("y", function (d) { return y(d.values); })
        .attr("height", function (d) { return height - y(d.values) })
        .transition().delay(500).duration(1000).style('opacity', 1)

    svg.selectAll('rect').on('mouseover', function () {
        update_tree_from_bar(this.id);
    })

    svg.selectAll('rect').on('mouseleave', function () {
        reset_nodes();
    })

}
