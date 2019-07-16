//save the url links to the data download here
var files = ['http://it2wi1.if-lab.de/rest/mpr_fall1', 'http://it2wi1.if-lab.de/rest/mpr_fall2'];
var promises = [];



var winWidth = window.innerWidth;
var winHeight = window.innerHeight;

var margin = { top: 20, right: 10, bottom: 30, left: 60 },
    width = (winWidth / 10) * 4.65 - margin.left - margin.right,
    height = winHeight / 1.75 - margin.top - margin.bottom;


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

    //formatting the data
    data[0].forEach(function (d) {
        d.date = parseTime(d.datum);
        d.DATA = convertCommaFloats(d.werte.Tavg_temp); // this is always the value to be displayed
        d.qual = convertCommaFloats(d.werte.Qualitaetsgrenze);
        d.temp = convertCommaFloats(d.werte.Tavg_temp);
        d.rpm = convertCommaFloats(d.werte.Rpm);
        d.vib = computeOilQuality(d.werte.Tavg_vib);
        d.vol = convertCommaFloats(d.werte.Tavg_laut);
    });
    visualiseData(data[0]);
};




//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////


function visualiseData(data) {

    console.log(data, data.length);

    var graph = d3.select("#dataVis").append("svg")
        .attr("width", '50%')
        .attr('id', 'g1')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    axisUpdateExample1(data);

};

//this function draws the graph
function drawLine(data, xScale, yScale) {

    var svg = d3.select("#g1")
    var lineGroup = svg.select('g');

    var line = d3.line()
        .x(function (d, i) {
            if (true) {
                return xScale(d.date);
            }
        })
        .y(function (d, i) { return yScale(d.DATA) });


    lineGroup.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", line(data));
}

function clearLine() {
    var svg = d3.select("#g1")
    var lineGroup = svg.select('g');

    lineGroup.selectAll("*")
        .remove();
}


// this function changes the x- axis domain in every X seconds
function axisUpdateExample1(data) {
    var svg = d3.select("#g1")

    var xScale = d3.scaleTime()
    var yScale = d3.scaleLinear()

    var xAxisCall = d3.axisBottom()
    var yAxisCall = d3.axisLeft()


    setScale1()
    initAxis()

    drawLine(data, xScale, yScale);

    setInterval(function () {
        toggle(
            function () {
                setScale2()
                updateAxis()

                clearLine();
                drawLine(data, xScale, yScale);
            },
            function () {
                setScale1()
                updateAxis()

                clearLine();
                drawLine(data, xScale, yScale);

            })
    }, 2000)

    function setScale1() {
        xScale.domain([data[0].date, data[120].date]).range([0, width - (margin.top + margin.bottom)])
        yScale.domain([0, 20 + d3.max(data, function (d) { return d.DATA; })]).range([height - (margin.top + margin.bottom), 0])
        xAxisCall.scale(xScale)
        yAxisCall.scale(yScale)
    }

    function setScale2() {
        xScale.domain([data[0].date, data[240].date]).range([0, width - (margin.top + margin.bottom)])
        yScale.domain([0, 20 + d3.max(data, function (d) { return d.DATA; })]).range([height - (margin.top + margin.bottom), 0])
        xAxisCall.scale(xScale)
        yAxisCall.scale(yScale)
    }


    function initAxis() {
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + [margin.left, height - margin.top] + ")")
            .call(xAxisCall)

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + [margin.left, margin.top] + ")")
            .call(yAxisCall)
    }

    function updateAxis() {
        var t = d3.transition()
            .duration(500)

        svg.select(".x")
            .transition(t)
            .call(xAxisCall)

        svg.select(".y")
            .transition(t)
            .call(yAxisCall)

    }
}


function computeOilQuality(temp, quali) {

    var diff = temp / quali;
    diff = diff.toFixed(2);

    if (diff <= 1) {
        d3.select('#infoText_quali')
            .attr('fill', 'white')
            .text(' Oil quality is at 100%')

    }
    else {
        diff = 2 - diff;
        diff = diff.toFixed(2);
        d3.select('#infoText_quali')
            .attr('fill', 'red')
            .text('Oil quality is at ' + diff + '%')


    }
}


function drawValues(inpt) {
    if (inpt.DATA < 75) {
        d3.select('#infoText_currentTemp')
            .attr('fill', 'white')
            .text('Oil temperature: ' + inpt.DATA + '°C')
    }
    else {
        d3.select('#infoText_currentTemp')
            .attr('fill', 'red')
            .text('Oil temperature: ' + inpt.DATA + '°C')

    }
}

function convertCommaFloats(inpt) {
    let inptString = inpt.toString();

    inptString = inptString.replace(',', '.');

    let re = parseFloat(inptString);

    return re;

};

function toggle() {
    var fn = arguments;
    var l = arguments.length;
    var i = 0;
    return function () {
        if (l <= i) i = 0;
        fn[i++]();
    }
}