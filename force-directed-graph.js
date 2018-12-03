let width = 1200;
let height = 900;
let max_circle_radius = 2;
let tweet_data = [];
let key = [];
let max_depth = 0;

d3.select('body').append('svg').attr('width', width).attr('height', height).attr("id", "Tree")

let file_list = [];
d3.csv("tweet_list.json", function (data) {
  file_list.push(data.number);
});

d3.json("./Twitter_Data/Metadata/131010.json", function (data) {
  for (let k = 0; k < data.length; k++) {
    if (data[k].id == 971857989211770880)
      console.log("True")
  }
})


d3.json("./Twitter_Data/RetweetNew/28000.json").then(draw_force_directed_graph)

function draw_force_directed_graph(data) {

  let key = Object.keys(data)

  let nodes = d3.range(key.length).map(function (i) {
    if (max_depth < data[key[i]].depth)
      max_depth = +data[key[i]].depth;
    return {
      id: key[i],
      depth: data[key[i]].depth,
      child: data[key[i]].child,
      parent: data[key[i]].parent_tweet
    };
  });

  let links = d3.range(key.length).map(function (i) {
    return {
      source: data[key[i]].parent_tweet,
      target: key[i],
      depth: data[data[key[i]].parent_tweet].depth,
      child: data[data[key[i]].parent_tweet].child
    };
  });

  let svg = d3.select('svg')
  let zoom_handler = d3.zoom().on("zoom", zoom_actions);
  zoom_handler(svg);

  function zoom_actions() {
    svg.selectAll('g').attr("transform", d3.event.transform)
  }

  let link = svg.append("g")
    .attr("class", "links").attr('id',"links")
    .selectAll("line")
    .data(links)
    .enter()    //.filter(function(d){return d.depth <=1 })
    .append("line")
    .attr("id", d => d.target)
    .attr("stroke-width", 1);

  let node = svg.append("g")
    .attr("class", "nodes").attr("id","nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("id", d => d.id)
    .attr("r", function (d) {
      if (d.depth == 1)
        return max_circle_radius;
      else if (d.child == 0 && d.depth == 2)
        return 1;
      else
        return max_circle_radius;
    })
    .attr("fill", function (d) {
      if (d.depth == 1)
        return 'red';
      else
        return 'black';
    })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))

  d3.forceSimulation()
    .nodes(nodes)
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force("charge", d3.forceManyBody().strength(function (d) {
      if (d.child == 0 && d.depth == 2)
        return -1;
      else
        return -15;
    }).distanceMax(1000).theta(1))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("link", d3.forceLink(links).distance(10).strength(1).id(function (d) { return d.id; }))
    .on("tick", ticked)

  function ticked() {
    events();
    node
      .attr("cx", function (d) { return d.x; })//= Math.max(max_circle_radius , Math.min(d.x, width - max_circle_radius )); })
      .attr("cy", function (d) { return d.y; })

    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });
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

function events() {
  console.log(this)

  d3.selectAll('#nodes').selectAll('circle').on('mouseover', function () {
    d3.select(this).attr("r",10).attr('fill','blue')
  })
  .on('mouseleave', function () {
    d3.select(this).attr("r", function (d) {
      if (d.depth == 1)
        return max_circle_radius;
      else if (d.child == 0 && d.depth == 2)
        return 1;
      else
        return max_circle_radius;
    }).attr("fill", function (d) {
      if (d.depth == 1)
        return 'red';
      else
        return 'black';
    })
  })
}