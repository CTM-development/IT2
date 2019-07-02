//save the url links to the data download here
var files = ['http://it2wi1.if-lab.de/rest/mpr_fall1','http://it2wi1.if-lab.de/rest/mpr_fall2'];
var promises = [];

var dataSave;

//set scale of the svg canvas, change width and height here
var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = 1200 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;


//custom time parser
var parseTime = d3.timeParse('%d.%m.%Y %H:%M:%S');


//appending the svg 'canvas'
var svg = d3.select("#dataVis").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//load the data from url array 'files'
files.forEach(function (files) {
    promises.push(d3.json(files))
});

Promise.all(promises).then((result) => receiveData(result), function (error) {
    console.log('Something went wrong!!' + error);
});

//data was loaded without any errors
function receiveData(data) {
    console.log('data was received succefuly');
    console.log(data);
    visualiseData(data);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//actuall visualisation  ation work is done here


function visualiseData(data) {

    dataSave = data;

    //some test logs
    //console.log(data[0]);

    //formatting the data
    data[0].forEach(function (d) {
        d.datum = parseTime(d.datum);
        d.werte.Tavg_vibr = convertCommaFloats(d.werte.Tavg_vibr)
    });

    // setting the ranges for the x and y axes
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);


    //setting the domains for the x and y axes
    x.domain(d3.extent(data[0], function (d) { return d.datum; }));
    y.domain([0, d3.max(data[0], function (d) { return (d.werte.Tavg_vibr); })]);

    //appending the axes to the graph
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));







    // graph gets constructed here
    svg.append("path")
        .data([data[0]])
        .attr("class", "line")
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr("d", d3.line()
            .x(function (d, i) { console.log(d,i); return x(d.datum) })
            .y(function (d) { return y(d.werte.Tavg_vibr); }))
            




}






function convertCommaFloats(inpt) {
    let inptString = inpt.toString();

    inptString = inptString.replace(',', '.');

    let re = parseFloat(inptString);

    return re;

};