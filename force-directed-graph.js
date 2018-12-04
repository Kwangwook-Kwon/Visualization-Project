let tree_svg_width = 1000;
let tree_svg_height = 800;
let max_circle_radius = 2;
let tweet_data = [];
let key = [];
let max_depth = 0;

let svg = d3.select('body').append('svg').attr('width', tree_svg_width).attr('height', tree_svg_height).attr("id", "Tree")
let simulation = d3.forceSimulation()
let node, nodes, link, links
let zoom_handler
let input_data
let loaded = 0
let file_list = [];

function initial_draw_tree(selected_file) {
  d3.json("./Twitter_Data/RetweetNew/"+selected_file+".json").then(draw_force_directed_graph)
}

function select_update_tree(selected_file){
  d3.json("./Twitter_Data/RetweetNew/"+selected_file+".json").then(update_tree)
}

function draw_force_directed_graph(data) {
  input_data = data
  initialize_graph()
}


function initialize_graph() {
  loaded = 0

  let svg = d3.select('#Tree')
  let key = Object.keys(input_data)

  nodes = d3.range(key.length).map(function (i) {
    if (max_depth < input_data[key[i]].depth)
      max_depth = +input_data[key[i]].depth;
    return {
      id: key[i],
      depth: input_data[key[i]].depth,
      child: input_data[key[i]].child,
      parent: input_data[key[i]].parent_tweet,
      bot: input_data[key[i]].bot
    };
  });

  links = d3.range(key.length).map(function (i) {
    return {
      key: i,
      source: key[i],
      target: input_data[key[i]].parent_tweet,
      depth: input_data[key[i]].depth,
      child: input_data[key[i]].child,
      bot: input_data[key[i]].bot
    };
  }).filter(function (d) {
    return d.source != d.target;
  });

  simulation
    .nodes(nodes)
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force("charge", d3.forceManyBody().strength(function (d) {
      if (d.child == 0 && d.depth <= 2)
        return -1;
      else
        return -15;
    }))
    .force("center", d3.forceCenter(tree_svg_width / 2, tree_svg_height / 2))
    .force("link", d3.forceLink(links).distance(10).strength(1).id(function (d) { return d.id; }))
    .on("tick", ticked)

  link = svg.append("g")
    .attr("class", "links").attr('id', "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("id", d => 'ID' + d.source.id + 'to' + d.target.id)
    .attr("stroke-tree_svg_width", 1)
    .attr("stroke", '#999')
    .attr("opacity", 0.6)

  node = svg.append("g")
    .attr("class", "nodes").attr("id", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("id", d => 'ID' + d.id)
    .attr("r", function (d) {
      if (d.depth == 1)
        return max_circle_radius;
      else if (d.child == 0 && d.depth == 2)
        return 1;
      else
        return max_circle_radius;
    })
    .attr("fill", function (d) {
      if (d.bot == 1)
        return 'red';
      else
        return 'blue';
    })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))

  svg.append("rect").attr("id", "border")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", tree_svg_height)
    .attr("width", tree_svg_width)
    .style("stroke", 'black')
    .style("fill", "white")
    .style("stroke-width", 1);

  svg.append("g").attr("id", "loading").append("text")
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-size", 40)
    .attr('x', tree_svg_width / 2)
    .attr('y', tree_svg_height / 2)
    .text("Simulating...");

  d3.select("#loading").append("rect").attr("id", "bar")
    .attr('x', tree_svg_width / 2 - 200)
    .attr('y', (tree_svg_height / 2) + 30)
    .attr("height", 40)
    .attr("tree_svg_width", 0)

  d3.select("#loading").append("rect")
    .attr('x', tree_svg_width / 2 - 200)
    .attr('y', (tree_svg_height / 2) + 30)
    .attr("height", 40)
    .attr("width", 400)
    .style("fill", "none")
    .style("stroke-tree_svg_width", 1)
    .style("stroke", 'black')

  d3.select("#loading").append("text").attr("id", "progress")
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-size", 40)
    .attr('x', tree_svg_width / 2)
    .attr('y', (tree_svg_height / 2) + 50)
    .text("0 %");

  events();
}

function update_tree(data){
  input_data = data
  loaded = 0

  let svg = d3.select('#Tree')
  let key = Object.keys(input_data)
  nodes = []
  links = []
  node = []
  link = []
  d3.select("#nodes").remove()
  d3.select("#links").remove()
  d3.select("#loading").remove()


  nodes = d3.range(key.length).map(function (i) {
    if (max_depth < input_data[key[i]].depth)
      max_depth = +input_data[key[i]].depth;
    return {
      id: key[i],
      depth: input_data[key[i]].depth,
      child: input_data[key[i]].child,
      parent: input_data[key[i]].parent_tweet,
      bot: input_data[key[i]].bot
    };
  });

  links = d3.range(key.length).map(function (i) {
    return {
      key: i,
      source: key[i],
      target: input_data[key[i]].parent_tweet,
      depth: input_data[key[i]].depth,
      child: input_data[key[i]].child,
      bot: input_data[key[i]].bot
    };
  }).filter(function (d) {
    return d.source != d.target;
  });


  simulation
  .nodes(nodes)
  .force("x", d3.forceX())
  .force("y", d3.forceY())
  .force("charge", d3.forceManyBody().strength(function (d) {
    if (d.child == 0 && d.depth <= 2)
      return -1;
    else
      return -15;
  }))
  .force("center", d3.forceCenter(tree_svg_width / 2, tree_svg_height / 2))
  .force("link", d3.forceLink(links).distance(10).strength(1).id(function (d) { return d.id; }))
  .on("tick", ticked)
  .alpha(1).restart()


  link = svg.append("g")
    .attr("class", "links").attr('id', "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("id", d => 'ID' + d.source.id + 'to' + d.target.id)
    .attr("stroke-tree_svg_width", 1)
    .attr("stroke", '#999')
    .attr("opacity", 0.6)

  node = svg.append("g")
    .attr("class", "nodes").attr("id", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("id", d => 'ID' + d.id)
    .attr("r", function (d) {
      if (d.depth == 1)
        return max_circle_radius;
      else if (d.child == 0 && d.depth == 2)
        return 1;
      else
        return max_circle_radius;
    })
    .attr("fill", function (d) {
      if (d.bot == 1)
        return 'red';
      else
        return 'blue';
    })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))

  svg.select("#border")
    .transition()
    .style("fill", "none")

  svg.append("g").attr("id", "loading").append("text")
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-size", 40)
    .attr('x', tree_svg_width / 2)
    .attr('y', tree_svg_height / 2)
    .text("Simulating...");

  d3.select("#loading").append("rect").attr("id", "bar")
    .attr('x', tree_svg_width / 2 - 200)
    .attr('y', (tree_svg_height / 2) + 30)
    .attr("height", 40)
    .attr("tree_svg_width", 0)

  d3.select("#loading").append("rect")
    .attr('x', tree_svg_width / 2 - 200)
    .attr('y', (tree_svg_height / 2) + 30)
    .attr("height", 40)
    .attr("width", 400)
    .style("fill", "none")
    .style("stroke-tree_svg_width", 1)
    .style("stroke", 'black')

  d3.select("#loading").append("text").attr("id", "progress")
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-size", 40)
    .attr('x', tree_svg_width / 2)
    .attr('y', (tree_svg_height / 2) + 50)
    .text("0 %");

  events();

}

function zoom_actions() {
  svg.selectAll('g').attr("transform", d3.event.transform)
}

function ticked() {
  if ((100 - simulation.alpha() * 100) >= 98 || loaded == 1) {
    node
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; })

    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; })
    zoom_handler = d3.zoom().on("zoom", zoom_actions);
    zoom_handler(svg);
    loaded = 1
  }

  d3.select("#progress").transition().delay(0).text(Math.ceil(100 - simulation.alpha() * 100) + "%")
  d3.select("#bar").transition().delay(0).attr("width", Math.ceil(100 - simulation.alpha() * 100) * 4).style("fill", d3.interpolateCool(1 - simulation.alpha()))
  if (Math.ceil(100 - simulation.alpha() * 100) >= 99) {
    d3.selectAll("#loading").remove();
    d3.select("#border").style("fill", 'none')
  }
}

function events() {

  d3.selectAll('#nodes').selectAll('circle').on('mouseover', function () {
    d3.select(this).attr("r", 10)
    highlight_parent(this.id.slice(2));
  })

    .on('mouseleave', function () {
      d3.selectAll('#nodes').selectAll('circle').attr("r", function (d) {
        if (d.depth == 1)
          return max_circle_radius;
        else if (d.child == 0 && d.depth == 2)
          return 1;
        else
          return max_circle_radius;
      }).attr("fill", function (d) {
        if (d.bot == 1)
          return 'red';
        else
          return 'blue';
      })

      d3.selectAll('#links').selectAll('line').attr("stroke-tree_svg_width", 1)
        .attr("stroke", '#999')
        .attr("opacity", 0.6)
    })
}

function highlight_parent(id) {
  if (id == input_data[id].parent_tweet)
    return;
  else {
    d3.selectAll('#nodes').select('#ID' + input_data[id].parent_tweet).attr("r", 6)
    d3.selectAll('#nodes').select('#ID' + input_data[id].parent_tweet).moveToFront()
    d3.selectAll('#links').select('#ID' + id + 'to' + input_data[id].parent_tweet).moveToFront();
    d3.selectAll('#links').select('#ID' + id + 'to' + input_data[id].parent_tweet).attr("stroke", function (d) {
      if (d.bot == 1)
        return 'red';
      else
        return 'blue';
    }).attr("stroke-tree_svg_width", 5).attr("opacity", 1.0)
    highlight_parent(input_data[id].parent_tweet)
  }
}

d3.selection.prototype.moveToFront = function () {
  return this.each(function () {
    this.parentNode.appendChild(this);
  });
};

d3.selection.prototype.moveToBack = function () {
  return this.each(function () {
    var firstChild = this.parentNode.firstChild;
    if (firstChild) {
      this.parentNode.insertBefore(this, firstChild);
    }
  });
};

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
  if (!d3.event.active) simulation.alphaTarget(0.0001);
  d.fx = null;
  d.fy = null;
}
