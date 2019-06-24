
var files = ['http://it2wi1.if-lab.de/rest/mpr_fall1'];
var promises = [];

var newSvg = d3.select('body').append('svg')
    .attr('width', 200)
    .attr('height', 200);

d3.select('#header_div').append('p').text('hallo')

files.forEach(function (files) {
    promises.push(d3.json(files))
});


Promise.all(promises).then((result) => receiveData(result), function (error) {
    console.log('Something went wrong!!' + error);
})

function receiveData(data) {
    console.log('data was received succefuly');
    visualizeData(data);
};

function visualizeData(data) {
    console.log(data);
    console.log(data[0][12]);

    var canvas = d3.select('#svg_canvas')
        .selectAll('g')
        .data(data[0])
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', function (d) {
            return ('translate(' + (data[0].indexOf(d) * 1200 / 310 + 10) + ',' + ((600 - 0.5 * d.werte.Rpm) + 10) + ')');
        })

    canvas.append('circle')
        .attr('r', 2)
};



