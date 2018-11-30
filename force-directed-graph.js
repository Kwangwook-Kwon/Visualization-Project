var width = 1200;
var height = 900;
var circle_radius = 2;
d3.select('body').append('svg').attr('width', width).attr('height', height)

let file_list = [];
//Read File list to array
d3.csv("tweet_list.json", function (data) {
  //console.log(data)
  file_list.push(data.number);
});
d3.json("./Twitter_Data/Metadata/131010.json", function (data) {
  for (let k = 0; k < data.length; k++) {
    if (data[k].id == 971857989211770880)
      console.log("True")
  }
  console.log(data)
})


let tweet_data = [];
let key = [];
d3.json("./Twitter_Data/RetweetNew/28000.json",

  function draw_force_directed_graph(data) {

    let key = Object.keys(data)
    //console.log(key)
    console.log(data)

    let nodes = d3.range(key.length).map(function (i) {
      return {
        id: key[i],
        depth:data[key[i]].depth,
        child:data[key[i]].child
      };
    });

    let links = d3.range(key.length).map(function (i) {
      return {
        source: data[key[i]].parent_tweet,
        target: key[i],
        depth:data[data[key[i]].parent_tweet].depth,
        child:data[data[key[i]].parent_tweet].child
      };
    });
    //console.log(links)

    var svg = d3.select('svg')
    var zoom_handler = d3.zoom().on("zoom",zoom_actions);
    zoom_handler(svg);
    //var g = svg.append("g").attr("class","everything")


    function zoom_actions(){
      svg.selectAll('g').attr("transform", d3.event.transform)
    }                    

    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      //.filter(function(d){return d.child > 0})
      .append("line")
      .attr("stroke-width", 1);

    var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      //.filter(function(d){return d.depth >2 || d.depth ==0;})
      .append("circle")
      .attr("r", circle_radius)
      .attr("fill", 'black')
      .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

    var simulation = d3.forceSimulation()
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("charge", d3.forceManyBody().strength(-10))
      .force("center", d3.forceCenter(width / 2, height / 2))
      //.force("collision", d3.forceCollide().radius(circle_radius+1))
      //.force("box_force", box_force)
      .nodes(nodes)
      .force("link", d3.forceLink(links).distance(10).strength(1).id(function (d) { return d.id; }))
      .on("tick", ticked)

    function ticked() {
      node
        .attr("cx", function (d) { return d.x ;})//= Math.max(circle_radius, Math.min(d.x, width - circle_radius)); })
        .attr("cy", function (d) { return d.y ;}) //= Math.max(circle_radius, Math.min(d.y, height - circle_radius)); });

      link
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });
    }
    function box_force() {
      for (var i = 0, n = nodes.length; i < n; ++i) {
        curr_node = nodes[i];
        curr_node.x = Math.max(circle_radius, Math.min(width - circle_radius, curr_node.x));
        curr_node.y = Math.max(circle_radius, Math.min(height - circle_radius, curr_node.y));
      }
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  })
