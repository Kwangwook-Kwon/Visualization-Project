d3.select('body').append('svg').attr('width', 2000).attr('height',2000)

let file_list = [];
//Read File list to array
d3.csv("tweet_list", function (data) {
  file_list.push(data.number);
});


let tweet_data = [];
let key = [];
d3.json("./Twitter_Data/RetweetNew/163819",

function draw_force_directed_graph(data) {

  let key = Object.keys(data)
  console.log(key)
  console.log(data[key[0]])

  let nodes = d3.range(key.length).map(function (i) {
    return {
      id: i
    };
  });

  let links = d3.range(key.length).map(function (i) {
    return {
      source: i,
      target: find_parent_tweet_index(i),
      value : i
    };
  });

  function find_parent_tweet_index(i) {
    //console.log(data[key[i]].parent_tweet)
    let parent = data[key[i]].parent_tweet;
    for (let k = 0; k < key.length; k++) {
      if (parent == data[key[k]].tweet)
        return k;
    }
  }

  var svg = d3.select('svg')
  var color = d3.scaleOrdinal(d3.schemeCategory20);
  var simulation = d3.forceSimulation()
  .force("x", d3.forceX())
  .force("y", d3.forceY())
    //.force("link", d3.forceLink().id(function (d) { return d.id; }))
    //.force("link", d3.forceLink(links).distance(20).strength(1))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(600,600));
    console.log(simulation);

  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke-width", 2);

  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", 2)
    .attr("fill", function (d) { return color(d.group); })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  node.append("title")
    .text(function (d) { return d.id; });
  simulation
    .nodes(nodes)
    .on("tick", ticked);
  simulation//.force("link")
    //.links(links)
    .force("link", d3.forceLink(links).distance(10).strength(1))
  function ticked() {
    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });
    node
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; });
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