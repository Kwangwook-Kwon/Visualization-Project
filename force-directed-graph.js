let file_list = [];
//Read File list to array
d3.csv("tweet_list", function (data) {
  file_list.push(data.number);
});


let tweet_data = [];
let key = [];
d3.json("./Twitter_Data/RetweetNew/163819").then(draw_force_directed_graph)

function draw_force_directed_graph(data) {

  let key = Object.keys(data)
  console.log(key)
  console.log(data[key[0]])

  let nodes = d3.range(key.length).map(function (i) {
    return {
      index: i
    };
  });

  let links = d3.range(key.length - 1).map(function (i) {
    return {
      source: i,
      target: find_parent_tweet_index(i)
    };
  });

  function find_parent_tweet_index(i){
    //console.log(data[key[i]].parent_tweet)
    let parent = data[key[i]].parent_tweet;
    for(let k = 0 ; k< key.length; k++){
      if(parent == data[key[k]].tweet)
        return k; 
    }
  }

  let simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody())
    .force("link", d3.forceLink(links).distance(20).strength(1))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .on("tick", ticked);

  let canvas = document.querySelector("canvas"),
    context = canvas.getContext("2d"),
    width = canvas.width,
    height = canvas.height;

  d3.select(canvas)
    .call(d3.drag()
      .container(canvas)
      .subject(dragsubject)
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  function ticked() {
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);

    context.beginPath();
    links.forEach(drawLink);
    context.strokeStyle = "#aaa";
    context.stroke();

    context.beginPath();
    nodes.forEach(drawNode);
    context.fill();
    context.strokeStyle = "#fff";
    context.stroke();

    context.restore();
  }

  function dragsubject() {
    return simulation.find(d3.event.x - width / 2, d3.event.y - height / 2);
  }

  function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }

  function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }

  function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }

  function drawLink(d) {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
  }

  function drawNode(d) {
    context.moveTo(d.x + 3, d.y);
    context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
  }
}