let firstTweetTime = new Date(2200, 01, 01);
let lastTweetTime = new Date(1900, 01, 01);
let lineTimeDate = []
let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

function initial_draw_line(selected_file) {
    d3.json("./Twitter_Data/RetweetNew/" + selected_file + ".json").then(draw_line_graph)
  }


function draw_line_graph(data){
    lineData = data;
    key = Object.keys(lineData)

    lineTimeDate = d3.range(key.length).map(function (i) {
        let timeDate = lineData[key[i]].time.split(" ")
        let time_r = timeDate[3].split(':');
        let rawtime = new Date(timeDate[5], months.indexOf(timeDate[1]), timeDate[2], time_r[0], time_r[1] )

        return {
          id: key[i],
          time : rawtime,
          bot : lineData[key[i]].bot
        };
      });


}