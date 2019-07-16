//save the url links to the data download here
var files = ['http://it2wi1.if-lab.de/rest/mpr_fall1', 'http://it2wi1.if-lab.de/rest/mpr_fall2'];
var promises = [];

const scope = 30;

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
    let count = 0
    data[0].forEach(function (d) {
        d.date = parseTime(d.datum);
        d.DATA = convertCommaFloats(d.werte.Tavg_temp); // this is allways the value to be displayed
        d.qual = convertCommaFloats(d.werte.Qualitaetsgrenze);
        d.temp = convertCommaFloats(d.werte.Tavg_temp);
        d.rpm = convertCommaFloats(d.werte.Rpm);
        d.vib = computeOilQuality(d.werte.Tavg_vib);
        d.vol = convertCommaFloats(d.werte.Tavg_laut);
        d.newData = getNewDate(d);
        d.index = count;
        count++;

    });

    visualiseData(data[0]);
};




//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////


function visualiseData(data) {



    var graph_PastData = d3.select("#dataVis").append("svg")
        .attr("width", '50%')
        .attr('id', 'g1')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var graph_predictedData = d3.select("#dataVis").append("svg")
        .attr("width", '50%')
        .attr('id', 'g2')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + 0 + "," + margin.top + ")");

    givePrediction(data);

    console.log(data);

    axisUpdaterForActuallData(data);
    axisUpdaterForPrediction(data);

};




// this function changes the x- axis domain in every X seconds
function axisUpdaterForActuallData(data) {
    var svg = d3.select("#g1")

    var xScale = d3.scaleTime()
    var yScale = d3.scaleLinear()

    var xAxisCall = d3.axisBottom()
        .ticks(6)
    var yAxisCall = d3.axisLeft()
        .ticks(10)


    setScale1()
    initAxis()
    drawConstants();
    drawValues(data[scope].DATA);
    computeOilQuality(data[scope].DATA, data[scope].qual);
    giveTimePrediction(data);

    drawLine(data, xScale, yScale);

    setInterval(
        toggle(
            function () {

                changeData(data);

                setScale2()
                updateAxis()

                clearLineLeft();
                drawLine(data, xScale, yScale);

                computeOilQuality(data[scope].DATA, data[scope].qual);
                drawValues(data[scope].DATA);
                giveTimePrediction(data);

                drawConstants()


            },
            function () {

                changeData(data);

                setScale1()
                updateAxis()

                clearLineLeft();
                drawLine(data, xScale, yScale);

                computeOilQuality(data[scope].DATA, data[scope].qual);
                drawValues(data[scope].DATA);
                giveTimePrediction(data);

                drawConstants()


            })

        , 2000)

    function setScale1() {
        xScale.domain([data[0].date, data[scope].date]).range([0, width])
        yScale.domain([0, 20 + d3.max(data, function (d) { return d.DATA; })]).range([height - (margin.top + margin.bottom), 0])
        xAxisCall.scale(xScale)
        yAxisCall.scale(yScale)
    }

    function setScale2() {
        xScale.domain([data[0].date, data[scope].date]).range([0, width])
        yScale.domain([0, 20 + d3.max(data, function (d) { return d.DATA; })]).range([height - (margin.top + margin.bottom), 0])
        xAxisCall.scale(xScale)
        yAxisCall.scale(yScale)
    }

    function changeData(data) {

        let change;
        if (data[scope].index + scope > data.length) {
            change = data.splice(0, data.length - data[0].index);
        }
        else { change = data.splice(0, scope); }

        for (c of change) {
            data.push(c);
        }

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

    function drawConstants() {


        svg.select('g').append("line")
            .attr("x1", (0))
            .attr("x2", (width))
            .attr("y1", yScale(75))
            .attr("y2", yScale(75))
            .style("stroke", "orange")
            .style("stroke-width", "4px");

        svg.select('g').append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", yScale(150))
            .attr("y2", yScale(150))
            .style("stroke", "red")
            .style("stroke-width", "4px");
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function axisUpdaterForPrediction(data) {
    var svg = d3.select("#g2")

    var xScale = d3.scaleTime()
    var yScale = d3.scaleLinear()

    var xAxisCall = d3.axisBottom()
        .ticks(6)
    var yAxisCall = d3.axisLeft()
        .ticks(0)


    setScale1()
    initAxis()
    drawConstants()

    drawLine(data, xScale, yScale);

    setInterval(
        toggle(
            function () {


                setScale2()
                updateAxis()

                clearLineRight();
                drawLinePrediction(data, xScale, yScale);

                drawConstants()


            },
            function () {



                setScale1()
                updateAxis()

                clearLineRight();
                drawLinePrediction(data, xScale, yScale);

                drawConstants()

            })

        , 2000)

    function setScale1() {
        xScale.domain([data[0].newData, data[scope].newData]).range([0, width - (margin.top + margin.bottom)])
        yScale.domain([0, 20 + d3.max(data, function (d) { return d.DATA; })]).range([height - (margin.top + margin.bottom), 0])
        xAxisCall.scale(xScale)
        yAxisCall.scale(yScale)
    }

    function setScale2() {
        xScale.domain([data[0].newData, data[scope].newData]).range([0, width - (margin.top + margin.bottom)])
        yScale.domain([0, 20 + d3.max(data, function (d) { return d.DATA; })]).range([height - (margin.top + margin.bottom), 0])
        xAxisCall.scale(xScale)
        yAxisCall.scale(yScale)
    }

    function changeData(data) {

        let change;
        if (data[scope].index + scope > data.length) {
            change = data.splice(0, data.length - data[0].index);
        }
        else { change = data.splice(0, scope); }

        for (c of change) {
            data.push(c);
        }

    }


    function initAxis() {
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + [0, height - margin.top] + ")")
            .call(xAxisCall)

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + [0, margin.top] + ")")
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

    function drawConstants() {

        svg.select('g').append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", yScale(75))
            .attr("y2", yScale(75))
            .style("stroke", "orange")
            .style("stroke-width", "4px");

        svg.select('g').append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", yScale(150))
            .attr("y2", yScale(150))
            .style("stroke", "red")
            .style("stroke-width", "4px");
    }

}
//this function draws the graph
function drawLine(data, xScale, yScale) {

    var svg = d3.select("#g1")
    var lineGroup = svg.select('g');

    var line = d3.line()
        .x(function (d, i) {
            if (i <= scope) {
                return xScale(d.date);
            }
        })
        .y(function (d, i) { return yScale(d.DATA) });


    lineGroup.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", line(data));
}
function drawLinePrediction(data, xScale, yScale) {

    var svg = d3.select("#g2")
    var lineGroup = svg.select('g');

    var line = d3.line()
        .x(function (d, i) {
            if (i < scope) {
                return xScale(d.newData);
            }
        })
        .y(function (d, i) { return yScale(d.pre) });


    lineGroup.append("path")
        .data([data])
        .attr("class", "line")
        .style("stroke-dasharray", ("6, 9"))
        .attr("d", line(data));
}

function clearLineLeft() {
    var svg = d3.select("#g1")
    var lineGroup = svg.select('g');

    lineGroup.selectAll("*")
        .remove();
}
function clearLineRight() {
    var svg = d3.select("#g2")
    var lineGroup = svg.select('g');

    lineGroup.selectAll("*")
        .remove();
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
    if (inpt < 75) {
        d3.select('#infoText_currentTemp')
            .attr('fill', 'white')
            .text('Oil temperature: ' + inpt + '°C')
    }
    else {
        d3.select('#infoText_currentTemp')
            .attr('fill', 'red')
            .text('Oil temperature: ' + inpt + '°C')

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

function getNewDate(d) {
    let dd = d.date.getTime();

    return new Date(dd + 1000 * scope);

}

function givePrediction(data) {
    let calcValues = data.slice(0, data.length);

    let diff = [];
    let summ = 0;

    for (let c = 0; c < 10; c++) {
        diff[c] = calcValues[c].temp / calcValues[c].qual;
        summ += diff[c];
    }

    let avgCoefficient = summ / diff.length;

    for (d of data) {
        d.pre = 0;
    }

    for (let c = 0; c < data.length; c++) {
        data[c].pre = data[(c + scope) % data.length].DATA * avgCoefficient;
        console.log(data[c].pre)
    }

}

function giveTimePrediction(array) {

    let averageSlope = (array[scope].DATA-array[scope-20].DATA)/(25);

    let dangerzone = 150;
    let fx=array[scope].DATA;

    let timer=0;

    while(fx<dangerzone){
        fx+=averageSlope;
        timer++;
    }

    timer/=60;

    timer=timer.toFixed(2);


    d3.select('#infoText_prediction')
            .attr('fill', 'white')
            .text('Change Oil in approximatly: ' + timer + ' Minutes')
}