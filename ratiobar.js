let chart;

function initial_draw_ratio(selected_file, isFirst) {
    d3.json("Twitter_Data/RetweetNew/" + selected_file + ".json").then(draw_ratio_chart)

    //if (!isFirst) {
    //    d3.selectAll(".chart").remove();
    //}
}


let raio_area = d3.select("body").append('div').attr('class', 'ratioArea')

function update_ratio(data) {
    //chart.transition().duration(500).style('opacity', 0).transition().remove()
    update_chart(data)
}

function update_chart(data) {
    let key = Object.keys(data)
    let bot_cnt = 0;

    for (i = 0; i < key.length; i++) {
        if (data[key[i]].bot == 1) {
            bot_cnt++;
        }
    }


    var botData = [key.length, bot_cnt];

    let x = d3.scaleLinear()
        .domain([0, d3.max(botData)])
        .range([0, 300]);
    let xText = d3.scaleLinear()
        .domain([0, d3.max(botData)])
        .range([40, 340]);

    chart.selectAll("rect")
        .data(botData)
        .transition()
        .duration(1000)
        .attr("width", d => x(d))

    chart.selectAll("text")
        .data(botData)
        .attr("x", xText)
        .attr("y", 10)
        .attr("dx", -3)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(String)
}

function draw_ratio_chart(data) {
    raio_area.selectAll('svg').transition().duration(500).style('opacity', 0).transition().remove()

    let key = Object.keys(data)
    let bot_cnt = 0;

    for (i = 0; i < key.length; i++) {
        if (data[key[i]].bot == 1) {
            bot_cnt++;
        }
    }

    var botData = [key.length, bot_cnt];

    chart = d3.select(".ratioArea")
        .append("svg")
        .attr("class", "chart")
        .attr("width", 600)
        .attr("height", 30 * botData.length)

    let x = d3.scaleLinear()
        .domain([0, d3.max(botData)])
        .range([0, 300]);
    let xText = d3.scaleLinear()
        .domain([0, d3.max(botData)])
        .range([40, 340]);

    chart.append("image")
        .attr("id", "bot")
        .attr("xlink:href", "./image/bot_image.png")
        .attr("height", 30)
        .attr("width", 30)
        .style('opacity', 0)
        .transition().delay(500).duration(1000).style('opacity', 1)


    chart.append("image")
        .attr("id", "human")
        .attr("xlink:href", "./image/human_image.png")
        .attr("height", 30)
        .attr("width", 30)
        .attr("x", 350)
        .style('opacity', 0)
        .transition().delay(500).duration(1000).style('opacity', 1)

    chart.selectAll("rect")
        .data(botData)
        .enter().append("rect")
        .style('opacity', 0)
        .transition()
        .delay(function (d, i) {
            return i * 200;
        })
        .duration(300)
        .attr("width", d => x(d))
        .attr("height", 30)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("x", 40)
        .attr("align", "center")
        .style('fill', function (d, i) {
            if (i == 0) {
                return 'steelblue';
            } else {
                return '#E31A1C';
            }
        }).transition().delay(500).duration(1000).style('opacity', 1)

    chart.selectAll("text")
        .data(botData)
        .enter().append("text")
        .attr("x", xText)
        .attr("y", 10)
        .attr("dx", -3)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(String)
        .style('fill', function (d, i) {
            if (i == 0) {
                return 'white';
            } else {
                return 'white';
            }
        }).style('opacity', 0)
        .transition().delay(500).duration(1000).style('opacity', 1)

}
