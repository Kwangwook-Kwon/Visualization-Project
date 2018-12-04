let width = 1000;
let height = 800;
let max_circle_radius = 2;
let tweet_data = [];
let key = [];
let max_depth = 0;

let svg = d3.select('body').append('svg').attr('width', width).attr('height', height).attr("id", "Tree").attr("border", 1).attr("stroke-width", "20")
svg.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("height", height)
  .attr("width", width)
  .style("stroke", 'black')
  .style("fill", "none")
  .style("stroke-width", 1);

svg.append("g").attr("id", "loading").append("text")
  .attr("dy", "0.35em")
  .attr("text-anchor", "middle")
  .attr("font-family", "sans-serif")
  .attr("font-size", 40)
  .attr('x', width / 2)
  .attr('y', height / 2)
  .text("Simulating. One moment please…");

  svg.append("g").attr("id", "loading").append("text").attr("id","progress")
  .attr("dy", "0.35em")
  .attr("text-anchor", "middle")
  .attr("font-family", "sans-serif")
  .attr("font-size", 40)
  .attr('x', width / 2)
  .attr('y', (height / 2)+50)
  .text("0 %");

let file_list = [];
d3.csv("tweet_list.json", function (data) {
  file_list.push(data.number);
});



d3.json("./Twitter_Data/RetweetNew/28000.json").then(draw_force_directed_graph)

function draw_force_directed_graph(data) {

  let svg = d3.select('#Tree')
  let key = Object.keys(data)

  let nodes = d3.range(key.length).map(function (i) {
    if (max_depth < data[key[i]].depth)
      max_depth = +data[key[i]].depth;
    return {
      id: key[i],
      depth: data[key[i]].depth,
      child: data[key[i]].child,
      parent: data[key[i]].parent_tweet,
      bot: data[key[i]].bot
    };
  });

  let links = d3.range(key.length).map(function (i) {
    return {
      key: i,
      source: key[i],
      target: data[key[i]].parent_tweet,
      depth: data[key[i]].depth,
      child: data[key[i]].child,
      bot: data[key[i]].bot
    };
  }).filter(function (d) {
    return d.source != d.target;
  });
  console.log(links)

  let zoom_handler = d3.zoom().on("zoom", zoom_actions);
  zoom_handler(svg);

  function zoom_actions() {
    svg.selectAll('g').attr("transform", d3.event.transform)
  }


  let simulation = d3.forceSimulation()
    .nodes(nodes)
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force("charge", d3.forceManyBody().strength(function (d) {
      if (d.child == 0 && d.depth <= 2)
        return -1;
      else
        return -15;
    }))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("link", d3.forceLink(links).distance(10).strength(1).id(function (d) { return d.id; }))
    //.on("tick", ticked)

  for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
    simulation.tick();
    progress()
  }
  simulation.on("tick", ticked).tick()
  d3.selectAll("#loading").remove();

  let link = svg.append("g")
    .attr("class", "links").attr('id', "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("id", d => 'ID' + d.source.id + 'to' + d.target.id)
    .attr("stroke-width", 1)
    .attr("stroke", '#999')
    .attr("opacity", 0.6)

  let node = svg.append("g")
    .attr("class", "nodes").attr("id", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()//.filter(function(d){return (d.child > 0 )||(d.depth>2)})
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

  function ticked() {
    events();
    node
      .attr("cx", function (d) { return d.x; })//= Math.max(max_circle_radius , Math.min(d.x, width - max_circle_radius )); })
      .attr("cy", function (d) { return d.y; })

    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; })
      //d3.select("#progress").transition().delay(0).text("1234").transition().delay(0)
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
    if (!d3.event.active) simulation.alphaTarget(0.1)
    d.fx = null;
    d.fy = null;
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

        d3.selectAll('#links').selectAll('line').attr("stroke-width", 1)
          .attr("stroke", '#999')
          .attr("opacity", 0.6)
      })
  }

  function highlight_parent(id) {
    if (id == data[id].parent_tweet)
      return;
    else {
      console.log('#ID' + data[id].parent_tweet + 'to' + id)
      d3.selectAll('#nodes').select('#ID' + data[id].parent_tweet).attr("r", 6)
      d3.selectAll('#nodes').select('#ID' + data[id].parent_tweet).moveToFront()
      d3.selectAll('#links').select('#ID' + id + 'to' + data[id].parent_tweet).moveToFront();
      d3.selectAll('#links').select('#ID' + id + 'to' + data[id].parent_tweet).attr("stroke", function (d) {
        if (d.bot == 1)
          return 'red';
        else
          return 'blue';
      }).attr("stroke-width", 5).attr("opacity", 1.0)
      highlight_parent(data[id].parent_tweet)
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

  function progress() {
    d3.select("#progress").transition().delay(0).text("1234").transition().delay(0);
    return;
  }
}
