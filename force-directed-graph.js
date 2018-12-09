let tree_svg_width = 1000;
let tree_svg_height = 800;
let max_circle_radius = 2;
let tweet_data = [];
let key = [];
let max_depth = 0;
let zoom_check;

let tree_svg = d3.select('body').append('div').attr("id", "treearea").attr('class', 'treeArea').append('svg').attr('width', tree_svg_width).attr('height', tree_svg_height).attr("id", "Tree")
d3.select("#treearea").append('input').attr('type', 'checkbox').attr('id', 'treeCheckbox').on("change", change_tree_mode).style('position', 'absolute').style('left', '10px').style('top', '7px')
d3.select("#treearea").append('text').text('Zoom&Move').style('position', 'absolute').style('left', '30px').style('top', '5px').style('background', 'white')



tree_svg.append("rect").attr("id", "border")
  .attr("x", 0)
  .attr("y", 0)
  .attr("height", tree_svg_height)
  .attr("width", tree_svg_width)
  .style("stroke", 'black')
  .style("fill", "white")
  .style("stroke-width", 1);

let brush = d3.brush()
  .extent([[0, 0], [tree_svg_width, tree_svg_height]])
  .on("brush", brushed)
  .on("end", brushended);

let tooltip = d3.select("body")
  .append("div").attr("class", "toolTip").attr("id", "toolTip")

let simulation = d3.forceSimulation()
let node, nodes, link, links
let zoom_handler
let input_data
let loaded = 0
let file_list = [];

function initial_draw_tree(selected_file) {
  d3.json("./Twitter_Data/RetweetNew/" + selected_file + ".json").then(draw_force_directed_graph)
}

function select_update_tree(selected_file) {
  d3.json("./Twitter_Data/RetweetNew/" + selected_file + ".json").then(update_tree)
}

function draw_force_directed_graph(data) {
  input_data = data
  initialize_graph()
}


function initialize_graph() {
  loaded = 0
  key = Object.keys(input_data)

  prepare_data()

  simulation
    .nodes(nodes)
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force("charge", d3.forceManyBody().strength(function (d) {
      if (d.child == 0 && d.depth <= 2)
        return -1;
      else
        return -10;
    }))
    .force("center", d3.forceCenter(tree_svg_width / 2, tree_svg_height / 2))
    .force("link", d3.forceLink(links).distance(20).strength(1).id(function (d) { return d.id; }))
    .on("tick", ticked)

  draw_nodes_links()
}

function update_tree(data) {
  input_data = data
  loaded = 0
  tree_svg.selectAll("#brush").remove()
  key = Object.keys(input_data)
  nodes = []
  links = []
  node = []
  link = []
  d3.select("#nodes").remove()
  d3.select("#links").remove()
  d3.select("#loading").remove()

  tree_svg.on('.zoom', null);

  prepare_data()

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


  tree_svg.select("#border")
    .transition()
    .style("fill", "none")

  draw_nodes_links()
}

function prepare_data() {

  nodes = d3.range(key.length).map(function (i) {
    if (max_depth < input_data[key[i]].depth)
      max_depth = +input_data[key[i]].depth;
    return {
      id: key[i],
      depth: input_data[key[i]].depth,
      child: input_data[key[i]].child,
      parent: input_data[key[i]].parent_tweet,
      bot: input_data[key[i]].bot,
      time : input_data[key[i]].time
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

}

function draw_nodes_links() {

  link = tree_svg.append("g")
    .attr("class", "links").attr('id', "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("id", d => 'ID' + d.source.id + 'to' + d.target.id)
    .attr("stroke-tree_svg_width", 1)
    .attr("stroke", '#999')
    .attr("opacity", 0.6)

  node = tree_svg.append("g")
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

  tree_svg.append("g").attr("id", "loading").append("text")
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
    .attr("width", 1)

  d3.select("#loading").append("rect")
    .attr('x', tree_svg_width / 2 - 200)
    .attr('y', (tree_svg_height / 2) + 30)
    .attr("height", 40)
    .attr("width", 400)
    .style("fill", "none")
    .style("width", 1)
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
  if (zoom_check) {
    tree_svg.selectAll('g').attr("transform", d3.event.transform)
  } else {
    tree_svg.selectAll('g').attr("transform", null)
  }
}

function ticked() {
  let cur_alpha = simulation.alpha();
  if ((100 - cur_alpha * 100) >= 98 || loaded == 1) {
    node
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; })

    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; })
  }
  d3.select("#progress").transition().text(Math.ceil(100 - cur_alpha * 100) + "%")
  d3.select("#bar").attr("width", Math.ceil(100 - cur_alpha * 100) * 4).style("fill", d3.interpolateCool(1 - cur_alpha))
  if (Math.ceil(100 - cur_alpha * 100) >= 99 && loaded == 0) {
    d3.selectAll("#loading").remove();
    tree_svg.select("#border").style("fill", 'none')
    tree_svg.style('cursor', 'wait')
    if (zoom_check) {
      zoom_handler = d3.zoom().on("zoom", zoom_actions);
      zoom_handler(tree_svg);
      tree_svg.style('cursor', 'move')
      tree_svg.selectAll("#brush").remove()
    } else {
      tree_svg.append("g")
        .attr("class", "brush").attr("id", "brush")
        .call(brush);
      tree_svg.select('#brush').moveToBack()
      tree_svg.style('cursor', 'Crosshair')
      //tree_svg.select('#nodes').selectAll('circle').moveToFront()
    }
    loaded = 1;
  }
  //if (Math.ceil(100 - cur_alpha * 100) < 99) {
  //  tree_svg.selectAll("#brush").remove()
  //  tree_svg.style('cursor', 'wait')
  //}
}


function events() {

  d3.selectAll('#nodes').selectAll('circle').on('mouseover', function () {
    d3.select(this).attr("r", 10).moveToFront();

    let pie_id = get_pie_id(this.id.slice(2))
    d3.select('body').select(pie_id).style("fill", function (d) { return d3.color(pie_color(d.data.name)).darker(1); }).style("stroke", "black")

    highlight_parent(this.id.slice(2));
    tooltip.style("left", d3.event.pageX + 10 + "px");
    tooltip.style("top", function () {
      if (d3.event.pageY > tree_svg_height / 2)
        return d3.event.pageY + 30 + "px";
      else
        return d3.event.pageY - 80 + "px";
    })
    tooltip.style("display", "inline-block");
    tooltip.html(input_data[this.id.slice(2)].time + "<br>" + input_data[this.id.slice(2)].text + "<br>" + input_data[this.id.slice(2)].screen_name);
    tooltip.moveToFront();
  })

    .on('mouseleave', function () {
      reset_nodes();
      let pie_id = get_pie_id(this.id.slice(2))
      d3.select('body').select(pie_id).style("fill", function (d) { return pie_color(d.data.name); }).style("stroke", "white")

      d3.selectAll('#links').selectAll('line').attr("stroke-width", 1)
        .attr("stroke", '#999')
        .attr("opacity", 0.6)
      tooltip.style("display", "none");
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
    }).attr("stroke-width", 3).attr("opacity", 1.0)
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

function reset_nodes() {
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
  }).style("opacity", 1)
}

function get_pie_id(id) {
  let time = input_data[id].time.substring(11, 13)
  if (time >= 0 && time < 6) {
    return "#PIE00"
  } else if (time >= 6 && time < 12) {
    return "#PIE06"
  } else if (time >= 12 && time < 18) {
    return "#PIE12"
  } else if (time >= 18 && time < 24) {
    return "#PIE18"
  }
}


function change_tree_mode() {
  zoom_check = d3.select("#treeCheckbox").property("checked")
  zoom_handler = d3.zoom().on("zoom", zoom_actions);
  if (zoom_check && loaded) {
    zoom_handler = d3.zoom().on("zoom", zoom_actions);
    zoom_handler(tree_svg);
    tree_svg.style('cursor', 'move')
    tree_svg.selectAll('circle').attr('class','unbrushd')
    reset_nodes();
    update_pie_chart_from_tree(input_data, false)
    tree_svg.selectAll("#brush").remove()
  } else {
    tree_svg.append("g")
      .attr("class", "brush").attr("id", "brush").attr('transform', function () {
        console.log(tree_svg.select('#nodes').attr('transform'))
        return tree_svg.select('#nodes').attr('transform');
      })
      .call(brush);
    tree_svg.select('#brush').moveToBack()
    tree_svg.on('.zoom', null);
    tree_svg.style('cursor', 'crosshair')
  }
}

function brushed() {
  if (d3.event.selection != null) {

    // revert circles to initial style
    tree_svg.selectAll('circle').attr("class", "unbrushed");
    var brush_coords = d3.brushSelection(this);

    // style brushed circles
    tree_svg.selectAll('circle').filter(function () {

      let cx = d3.select(this).attr("cx"),
        cy = d3.select(this).attr("cy");

      return isBrushed(brush_coords, cx, cy);
    })
      .attr("class", "brushed").style('stroke', function (d) {
        if (d.bot == 1)
          return 'red';
        else
          return 'blue';
      })
  }
}
function isBrushed(brush_coords, cx, cy) {

  let x0 = brush_coords[0][0],
    x1 = brush_coords[1][0],
    y0 = brush_coords[0][1],
    y1 = brush_coords[1][1];

  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
}

function brushended() {
  console.log('end');
  let d_brushed =  d3.selectAll(".brushed").data();
  console.log(d_brushed)
  if (!d3.event.selection || d_brushed.length == 0 ) {
    console.log('There is no selection');
    update_pie_chart_from_tree(input_data, false)
    tree_svg.selectAll('circle').attr("class", "unbrushed");
  }else{
      update_pie_chart_from_tree(d_brushed, true) 
  }
}