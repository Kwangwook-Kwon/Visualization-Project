function initial_draw_ratio(selected_file, isFirst) {
    d3.json("./Twitter_Data/RetweetNew/" + selected_file + ".json").then(draw_ratio_chart)

    if (!isFirst) {
      d3.selectAll(".chart").remove();
    }
}

function draw_ratio_chart(data) {

    let key = Object.keys(data)
    let bot_cnt = 0;

    for(i=0;i<key.length;i++) {
        if(data[key[i]].bot == 1) {
            bot_cnt++;
        }
    }

    var botData = [key.length, bot_cnt]; // here are the data values; v1 = total, v2 = current value
    console.log(botData)
  
    var chart = d3.select("body").append('div').attr('class', 'ratioArea').append("svg") // creating the svg object inside the container div
        .attr("class", "chart")
        .attr("width", 300) // bar has a fixed width
        .attr("height", 30 * botData.length);
  
    var x = d3.scaleLinear() // takes the fixed width and creates the percentage from the data values
        .domain([0, d3.max(botData)])
        .range([0, 300]); 
    
    chart.selectAll("rect") // this is what actually creates the bars
        .data(botData)
        .enter().append("rect")
        .attr("width", x)
        .attr("height", 30)
        .attr("rx", 5) // rounded corners
        .attr("ry", 5);
    
    chart.selectAll("text") // adding the text labels to the bar
        .data(botData)
        .enter().append("text")
        .attr("x", x)
        .attr("y", 10) // y position of the text inside bar
        .attr("dx", -3) // padding-right
        .attr("dy", ".35em") // vertical-align: middle
        .attr("text-anchor", "end") // text-align: right
        .text(String);
}
    