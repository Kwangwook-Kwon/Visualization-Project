
const m0 = {
  id: "force-directed-graph@124",
  variables: [
    {
      inputs: ["md"],
      value: (function (md) {
        return (
          md`# D3 Force-Directed Graph

This network of character co-occurence in _Les Misérables_ is positioned by simulated forces using [d3-force](https://github.com/d3/d3-force). See also a [disconnected graph](/@mbostock/disjoint-force-directed-graph), and compare to [WebCoLa](/@mbostock/hello-cola).`
        )
      })
    },
    {
      name: "chart",
      inputs: ["data", "forceSimulation", "d3", "DOM", "width", "height", "color", "drag"],
      value: (function (data, forceSimulation, d3, DOM, width, height, color, drag) {
        const links = data.links.map(d => Object.create(d));
        const nodes = data.nodes.map(d => Object.create(d));
        const simulation = forceSimulation(nodes, links).on("tick", ticked);

        const svg = d3.select(DOM.svg(width, height))
          .attr("viewBox", [-width / 2, -height / 2, width, height]);

        const link = svg.append("g")
          .attr("stroke", "#999")
          .attr("stroke-opacity", 0.6)
          .selectAll("line")
          .data(links)
          .enter().append("line")
          .attr("stroke-width", d => Math.sqrt(d.value));

        const node = svg.append("g")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
          .selectAll("circle")
          .data(nodes)
          .enter().append("circle")
          .attr("r", 5)
          .attr("fill", color)
          .call(drag(simulation));

        node.append("title")
          .text(d => d.id);

        function ticked() {
          link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

          node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        }

        return svg.node();
      }
      )
    },
    {
      name: "forceSimulation",
      inputs: ["d3"],
      value: (function (d3) {
        return (
          function forceSimulation(nodes, links) {
            return d3.forceSimulation(nodes)
              .force("link", d3.forceLink(links).id(d => d.id))
              .force("charge", d3.forceManyBody())
              .force("center", d3.forceCenter());
          }
        )
      })
    },
    {
      name: "data",
      inputs: ["d3"],
      value: (function (d3) {
        return (
          d3.json("https://gist.githubusercontent.com/mbostock/4062045/raw/5916d145c8c048a6e3086915a6be464467391c62/miserables.json")
        )
      })
    },
    {
      name: "height",
      value: (function () {
        return (
          600
        )
      })
    },
    {
      name: "color",
      inputs: ["d3"],
      value: (function (d3) {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        return d => scale(d.group);
      }
      )
    },
    {
      name: "drag",
      inputs: ["d3"],
      value: (function (d3) {
        return (
          simulation => {

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

            return d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended);
          }
        )
      })
    },
    {
      name: "d3",
      inputs: ["require"],
      value: (function (require) {
        return (
          require("d3@5")
        )
      })
    }
  ]
};

const notebook = {
  id: "force-directed-graph@124",
  modules: [m0]
};

export default notebook;
