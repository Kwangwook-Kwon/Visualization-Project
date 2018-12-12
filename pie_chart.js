var pie_color = d3.scaleOrdinal()
pie_color = { "06:00-12:00": '#00BED1', "12:00-18:00": d3.color('#1675B6').brighter(1), "18:00-24:00": '#E6AB02', "00:00-06:00": '#666666' };

let cnt_00_06 = 0;
let cnt_06_12 = 0;
let cnt_12_18 = 0;
let cnt_18_24 = 0;
let nodes_00_06 = [];
let nodes_06_12 = [];
let nodes_12_18 = [];
let nodes_18_24 = [];
let dataset;
let pie_svg;
let toolTip = d3.select("body").append("div").attr("class", "toolTip");
d3.select("body").append('div').attr('class', 'pieArea')

function initial_draw_pie(selected_file) {
  d3.json("./Twitter_Data/RetweetNew/" + selected_file + ".json").then(initial_draw_pie_chart)
}

function update_pie(selected_file) {
  d3.json("./Twitter_Data/RetweetNew/" + selected_file + ".json").then(update_pie_chart)
}

function initial_draw_pie_chart(data) {

  prepare_pie_data(data)

  draw_pie_chart()
}

function update_pie_chart(data) {

  pie_svg.transition().duration(500).style('opacity', 0).transition().remove()

  cnt_00_06 = 0;
  cnt_06_12 = 0;
  cnt_12_18 = 0;
  cnt_18_24 = 0;
  nodes_00_06 = [];
  nodes_06_12 = [];
  nodes_12_18 = [];
  nodes_18_24 = [];
  prepare_pie_data(data)
  draw_pie_chart()
}

function prepare_pie_data(data) {
  key = Object.keys(data)

  for (i = 0; i < key.length; i++) {
    let time = data[key[i]].time.substring(11, 13);
    let id;
    if (data[key[i]].tweet != null)
      id = data[key[i]].tweet;
    else
      id = data[key[i]].id;

    if (time >= 0 && time < 6) {
      cnt_00_06++;
      nodes_00_06.push(id);
    } else if (time >= 6 && time < 12) {
      cnt_06_12++;
      nodes_06_12.push(id);
    } else if (time >= 12 && time < 18) {
      cnt_12_18++;
      nodes_12_18.push(id);
    } else if (time >= 18 && time < 24) {
      cnt_18_24++;
      nodes_18_24.push(id);
    }
  }
  dataset = [{ name: "00:00-06:00", total: cnt_00_06, percent: (cnt_00_06 / key.length) * 100, nodes: nodes_00_06 },
  { name: "06:00-12:00", total: cnt_06_12, percent: (cnt_06_12 / key.length) * 100, nodes: nodes_06_12 },
  { name: "12:00-18:00", total: cnt_12_18, percent: (cnt_12_18 / key.length) * 100, nodes: nodes_12_18 },
  { name: "18:00-24:00", total: cnt_18_24, percent: (cnt_18_24 / key.length) * 100, nodes: nodes_18_24 }];
}

function draw_pie_chart() {

  var width = 350,
    height = 350,
    radius = Math.min(width, height) / 2;

  var arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

  var pie = d3.pie()
    .sort(null)
    .startAngle(1.1 * Math.PI)
    .endAngle(3.1 * Math.PI)
    .value(function (d) { return d.total; });

  pie_svg = d3.select(".pieArea").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "piechart")

  var pie_g = pie_svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var g = pie_g.selectAll(".arc").append("g")
    .data(pie(dataset.filter(function (d) { return d.total > 0; })))
    .enter()

  g.append("path")
    .attr("id", d => "PIE" + d.data.name.substring(0, 2))
    .style("fill", function (d) { return pie_color[d.data.name]; })
    .transition()
    .delay(1000)
    .duration(1000)
    .attrTween('d', function (d) {
      var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
      return function (t) {
        d.endAngle = i(t);
        return arc(d)
      }
    });

  g.append("image")
    .attr("id", d => "PIE" + d.data.name.substring(0, 2))
    .attr("xlink:href", function (d) {
      if (d.data.name == "00:00-06:00")
        return "./image/moon.png";
      if (d.data.name == "06:00-12:00")
        return "./image/sunrise.png";
      if (d.data.name == "12:00-18:00")
        return "./image/sun.png";
      if (d.data.name == "18:00-24:00")
        return "./image/sunset.png";
    }).style("opacity", 0)
    .transition()
    .delay(1000)
    .duration(1000)
    .attr("height", 40)
    .attr("width", 40)
    .attr("transform", function (d) {
      let center = arc.centroid(d)
      return "translate(" + (+center[0] - 20) + "," + (center[1] - 20) + ")";
    }).transition().style("opacity", 1)

  g.selectAll("path, image").on("mousemove", function (d) {
    toolTip.style("left", d3.event.pageX + 10 + "px");
    toolTip.style("top", d3.event.pageY - 25 + "px");
    toolTip.style("display", "inline-block").moveToFront();
    toolTip.html((d.data.name) + "<br>" + (d.data.total) + "<br>" + (Math.ceil(d.data.percent)) + "%");
  });

  g.selectAll("path, image").on("mouseover", function (d) {
    d3.select('body').select("#nodes").selectAll('circle').style("opacity", 0.3)
    d.data.nodes.forEach(function (d) {
      d3.select('body').select("#nodes").select("#ID" + d).attr("r", 3).style("opacity", 1).attr("fill", function (d) {
        if (d.bot == 1)
          return d3.color('red').brighter(1);
        else
          return d3.color('blue').brighter(1);
      })
    });
  });

  g.selectAll("path, image").on("mouseout", function (d) {
    toolTip.style("display", "none");
    reset_nodes();
  });

}

function reset_pie(){
  pie_svg.selectAll("path")
  .style("fill", function (d) { return pie_color[d.data.name]; })

}