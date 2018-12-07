var pie_color = d3.scaleOrdinal()
.range(['#ff9896', '#aec7e8', '#ffbb78', '#c5b0d5']);


function initId(selected_file, isFirst) {
  d3.json("./Twitter_Data/RetweetNew/" + selected_file + ".json").then(draw_pie_chart)

  if (!isFirst) {
    d3.selectAll(".piechart").remove();
  }
}

function draw_pie_chart(data) {

  let key = Object.keys(data)

  let cnt_00_06 = 0;
  let cnt_06_12 = 0;
  let cnt_12_18 = 0;
  let cnt_18_24 = 0;
  let nodes_00_06 = [];
  let nodes_06_12 = [];
  let nodes_12_18 = [];
  let nodes_18_24 = [];


  for (i = 0; i < key.length; i++) {
    let time = data[key[i]].time.substring(11, 13);

    if (time >= 0 && time < 6) {
      cnt_00_06++;
      nodes_00_06.push(key[i]);
    } else if (time >= 6 && time < 12) {
      cnt_06_12++;
      nodes_06_12.push(key[i]);
    } else if (time >= 12 && time < 18) {
      cnt_12_18++;
      nodes_12_18.push(key[i]);
    } else if (time >= 18 && time < 24) {
      cnt_18_24++;
      nodes_18_24.push(key[i]);
    }
  }
  var dataset = [{ name: "00:00-06:00", total: cnt_00_06, percent: (cnt_00_06 / key.length) * 100, nodes: nodes_00_06 },
  { name: "06:00-12:00", total: cnt_06_12, percent: (cnt_06_12 / key.length) * 100, nodes: nodes_06_12 },
  { name: "12:00-18:00", total: cnt_12_18, percent: (cnt_12_18 / key.length) * 100, nodes: nodes_12_18 },
  { name: "18:00-24:00", total: cnt_18_24, percent: (cnt_18_24 / key.length) * 100, nodes: nodes_18_24 }];


  var width = 500,
    height = 500,
    radius = Math.min(width, height) / 2;

  var arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

  var pie = d3.pie()
    .sort(null)
    .startAngle(1.1 * Math.PI)
    .endAngle(3.1 * Math.PI)
    .value(function (d) { return d.total; });

  var svg = d3.select("body").append('div').attr('class', 'pieArea').append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "piechart")
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var div = d3.select("body").append("div").attr("class", "toolTip");

  var g = svg.selectAll(".arc")
    .data(pie(dataset))
    .enter().append("g")
    .attr("class", "arc")

  g.append("path")
    .attr("id", d => "PIE"+d.data.name.substring(0,2))
    .style("fill", function (d) { return pie_color(d.data.name); })
    .transition().delay(function (d, i) {
      return i * 500;
    }).duration(500)
    .attrTween('d', function (d) {
      var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
      return function (t) {
        d.endAngle = i(t);
        return arc(d)
      }
    });

  g.append("text")
    .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .transition()
    .delay(1000)
    .text(function (d) { return d.data.name; });

  d3.selectAll("path").on("mousemove", function (d) {
    div.style("left", d3.event.pageX + 10 + "px");
    div.style("top", d3.event.pageY - 25 + "px");
    div.style("display", "inline-block");
    div.html((d.data.name) + "<br>" + (d.data.total) + "<br>" + (d.data.percent) + "%");
  });

  d3.selectAll("path").on("mouseover", function (d) {
    d.data.nodes.forEach(function(d){
      d3.select('body').select("#nodes").select("#ID"+d).attr("r",3).attr("fill", function (d) {
        if (d.bot == 1)
          return d3.color('red').brighter(1);
        else
          return d3.color('blue').brighter(1);
      })
      //console.log(d3.select('body').select("#nodes").select("#ID"+d))
    });
    d3.select(this).style("fill",function(d){return d3.color(pie_color(d.data.name)).darker(1);}).style("stroke","black")
  });

  d3.selectAll("path").on("mouseout", function (d) {
    div.style("display", "none");
    reset_nodes();
    d3.select(this).style("fill",function(d){return d3.color(pie_color(d.data.name));}).style("stroke","white")
  });

  function type(d) {
    d.total = +d.total;
    return d;
  }

}