let menuView = d3.select('body').append('div').attr('class','menuArea')
d3.csv("tweet_list.json").then(combobox)

function combobox(data) {
    let select = menuView
        .append('select')
        .attr('class', 'select')
        .on('change', onchange_combobox)

    select
        .selectAll('option')
        .data(data).enter()
        .append('option')
        .text(function (d) { return d.number; })
        .attr('selected', function (d) {
            if (d.number == 28000)
                return 'selected';
        })
    initial_draw_tree(28000)
    initId(28000, true)
}

function onchange_combobox() {
    let selectValue = d3.select('select').property('value')
    select_update_tree(selectValue)
    initId(selectValue, false);
};