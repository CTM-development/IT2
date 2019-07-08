//save the url links to the data download here
var files = ['http://it2wi1.if-lab.de/rest/mpr_fall1', 'http://it2wi1.if-lab.de/rest/mpr_fall2', 'http://it2wi1.if-lab.de/rest/mpr_fall3', 'http://it2wi1.if-lab.de/rest/mpr_fall4'];
var promises = [];

var dataSave;

//set scale of the svg canvas, change width and height here

var ticksY = 10;
var xUpperBound = 1.2;
var winWidth = window.innerWidth;
var winHeight = window.innerHeight;

var margin = { top: 20, right: 10, bottom: 30, left: 60 },
    width = winWidth / 2.2 - margin.left - margin.right,
    height = winHeight / 2.2 - margin.top - margin.bottom;


//custom time parser
var parseTime = d3.timeParse('%d.%m.%Y %H:%M:%S');




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
    visualiseData_1(data[0]);
    visualiseData_2(data[1]);
    visualiseData_3(data[2]);
    visualiseData_4(data[3]);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//actuall visualisation  ation work is done here


function visualiseData_1(data) {

    dataSave = data;

    //some test logs
    //console.log(data[0]);


    //appending the svg 'canvas'
    var svg = d3.select("#dataVis_1").append("svg")
        .attr("width", '100%')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");




    //formatting the data
    data.forEach(function (d) {
        d.datum = parseTime(d.datum);
        d.werte.DATA = convertCommaFloats(d.werte.Tavg_vibr)
    });

    // setting the ranges for the x and y axes
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);


    //setting the domains for the x and y axes
    x.domain(d3.extent(data, function (d) { return d.datum; }));
    y.domain([0, xUpperBound]);


    //custom axes
    var xAxis = d3.axisBottom(x)
        .ticks(3)

    var yAxis = d3.axisLeft(y)
        .ticks(ticksY);

    //appending the axes to the graph
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", 'axis')
        .call(xAxis);


    svg.append("g")
        .attr("class", 'axis')
        .call(yAxis);



    // Add X axis label:
    svg.append("text")
        .attr("class", "axisLable")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 5)
        .text("t in min");

    // Y axis label:
    svg.append("text")
        .attr("class", "axisLable")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top + 30)
        .text("vib")

    // graphline gets constructed here
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(d.werte.DATA);
            }))

    svg.append('path')
        .data([data])
        .attr("class", "line")
        .attr('id', 'RPM')
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(d.werte.Rpm / 1000);
            }))

    svg.append('path')
        .data([data])
        .attr("class", "line")
        .attr('id', 'temp')
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(convertCommaFloats(d.werte.Tavg_temp) / 100);
            }))

    svg.append('path')
        .data([data])
        .attr("class", "line")
        .attr('id', 'laut')
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(convertCommaFloats(d.werte.Tavg_laut) / 100);
            }))



}

function visualiseData_2(data) {

    dataSave = data;

    //some test logs
    //console.log(data[0]);


    //appending the svg 'canvas'
    var svg = d3.select("#dataVis_2").append("svg")
        .attr("width", '100%')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    //formatting the data
    data.forEach(function (d) {
        d.datum = parseTime(d.datum);
        d.werte.DATA = convertCommaFloats(d.werte.Tavg_vibr)
    });

    // setting the ranges for the x and y axes
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);


    //setting the domains for the x and y axes
    x.domain(d3.extent(data, function (d) { return d.datum; }));
    y.domain([0, xUpperBound]);



    //custom axes
    var xAxis = d3.axisBottom(x)
        .ticks(3)

    var yAxis = d3.axisLeft(y)
        .ticks(ticksY);

    //appending the axes to the graph
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", 'axis')
        .call(xAxis);


    svg.append("g")
        .attr("class", 'axis')
        .call(yAxis);

    // Add X axis label:
    svg.append("text")
        .attr("class", "axisLable")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 5)
        .text("t in min");

    // Y axis label:
    svg.append("text")
        .attr("class", "axisLable")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top + 30)
        .text("temp in C")

    // graphline gets constructed here
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(d.werte.DATA);
            }))

    svg.append('path')
        .data([data])
        .attr("class", "line")
        .attr('id', 'RPM')
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(d.werte.Rpm / 1000);
            }))

    svg.append('path')
        .data([data])
        .attr("class", "line")
        .attr('id', 'temp')
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(convertCommaFloats(d.werte.Tavg_temp) / 100);
            }))

    svg.append('path')
        .data([data])
        .attr("class", "line")
        .attr('id', 'laut')
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(convertCommaFloats(d.werte.Tavg_laut) / 100);
            }))



}
function visualiseData_3(data) {

    dataSave = data;

    //some test logs
    //console.log(data[0]);


    //appending the svg 'canvas'
    var svg = d3.select("#dataVis_3").append("svg")
        .attr("width", '100%')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");




    //formatting the data
    data.forEach(function (d) {
        d.datum = parseTime(d.datum);
        d.werte.DATA = convertCommaFloats(d.werte.Tavg_vibr)
    });

    // setting the ranges for the x and y axes
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);


    //setting the domains for the x and y axes
    x.domain(d3.extent(data, function (d) { return d.datum; }));
    y.domain([0, xUpperBound]);


    //custom axes
    var xAxis = d3.axisBottom(x)
        .ticks(3)

    var yAxis = d3.axisLeft(y)
        .ticks(ticksY);

    //appending the axes to the graph
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", 'axis')
        .call(xAxis);


    svg.append("g")
        .attr("class", 'axis')
        .call(yAxis);



    // Add X axis label:
    svg.append("text")
        .attr("class", "axisLable")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 5)
        .text("t in min");

    // Y axis label:
    svg.append("text")
        .attr("class", "axisLable")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top + 30)
        .text("vib")

    // graphline gets constructed here
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(d.werte.DATA);
            }))

    svg.append('path')
        .data([data])
        .attr("class", "line")
        .attr('id', 'RPM')
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(d.werte.Rpm / 1000);
            }))

    svg.append('path')
        .data([data])
        .attr("class", "line")
        .attr('id', 'temp')
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(convertCommaFloats(d.werte.Tavg_temp) / 100);
            }))

    svg.append('path')
        .data([data])
        .attr("class", "line")
        .attr('id', 'laut')
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(convertCommaFloats(d.werte.Tavg_laut) / 100);
            }))
}

function visualiseData_4(data) {

    dataSave = data;

    //some test logs
    //console.log(data[0]);


    //appending the svg 'canvas'
    var svg = d3.select("#dataVis_4").append("svg")
        .attr("width", '100%')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");




    //formatting the data
    data.forEach(function (d) {
        d.datum = parseTime(d.datum);
        d.werte.DATA = convertCommaFloats(d.werte.Tavg_vibr)
    });

    // setting the ranges for the x and y axes
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);


    //setting the domains for the x and y axes
    x.domain(d3.extent(data, function (d) { return d.datum; }));
    y.domain([0, xUpperBound]);


    //custom axes
    var xAxis = d3.axisBottom(x)
        .ticks(3)

    var yAxis = d3.axisLeft(y)
        .ticks(ticksY);

    //appending the axes to the graph
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", 'axis')
        .call(xAxis);


    svg.append("g")
        .attr("class", 'axis')
        .call(yAxis);



    // Add X axis label:
    svg.append("text")
        .attr("class", "axisLable")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 5)
        .text("t in min");

    // Y axis label:
    svg.append("text")
        .attr("class", "axisLable")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top + 30)
        .text("vib")

    // graphline gets constructed here
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(d.werte.DATA);
            }))

    svg.append('path')
        .data([data])
        .attr("class", "line")
        .attr('id', 'RPM')
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(d.werte.Rpm / 1000);
            }))

    svg.append('path')
        .data([data])
        .attr("class", "line")
        .attr('id', 'temp')
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(convertCommaFloats(d.werte.Tavg_temp) / 100);
            }))

    svg.append('path')
        .data([data])
        .attr("class", "line")
        .attr('id', 'laut')
        .attr("d", d3.line()
            .x(function (d, i) { return x(d.datum) })
            .y(function (d, i) {
                return y(convertCommaFloats(d.werte.Tavg_laut) / 100);
            }))



}



function convertCommaFloats(inpt) {
    let inptString = inpt.toString();

    inptString = inptString.replace(',', '.');

    let re = parseFloat(inptString);

    return re;

};


function computeDimensions(selection) {
    var node = selection.node();

    if (node instanceof SVGElement) {
        dimensions = node.getBBox();
    } else {
        dimensions = node.getBoundingClientRect();
    }

    console.log(dimensions);
}