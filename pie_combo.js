d3.csv("tweet_list.json").then(combobox)

function combobox(data) {
    console.log("is it working?")
    let select = d3.select('body')
        .append('select')
        .attr('class', 'select')
        .on('change', onchange)

    select
        .selectAll('option')
        .data(data).enter()
        .append('option')
        .text(function (d) { return d.number; })
        .attr('selected', function (d) {
            if (d.number == 28000)
                return 'selected';
        })
    
    initId(28000)
    function onchange() {
        selectValue = d3.select('select').property('value')
        
        initId(selectValue)
    };
}
