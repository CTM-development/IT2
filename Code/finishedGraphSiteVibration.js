//save the url links to the data download here
var files = ['http://it2wi1.if-lab.de/rest/mpr_fall4', 'http://it2wi1.if-lab.de/rest/mpr_fall2'];
var promises = [];

const scope = 30;
const intervall = 1;

var lastDate;

var fluctuationsCounter = 0;

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
        d.DATA = convertCommaFloats(d.werte.Tavg_vibr); // this is allways the value to be displayed
        d.qual = convertCommaFloats(d.werte.Qualitaetsgrenze);
        d.temp = convertCommaFloats(d.werte.Tavg_temp);
        d.rpm = convertCommaFloats(d.werte.Rpm);
        d.vib = convertCommaFloats(d.werte.Tavg_vibr);
        d.vol = convertCommaFloats(d.werte.Tavg_laut);
        d.newData = getNewDate(d);

        d.optimalVib = convertCommaFloats(data[1][count].werte.Tavg_vibr);

        d.index = count;
        count++;

    });
    

    data[1].forEach(function (d) {
        d.date = parseTime(d.datum);
        d.DATA = convertCommaFloats(d.werte.Tavg_vibr); // this is allways the value to be displayed
        d.qual = convertCommaFloats(d.werte.Qualitaetsgrenze);
        d.temp = convertCommaFloats(d.werte.Tavg_temp);
        d.rpm = convertCommaFloats(d.werte.Rpm);
        d.vib = convertCommaFloats(d.werte.Tavg_vibr);
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

    var graph_PastData2 = d3.select("#dataVis2").append("svg")
        .attr("width", '50%')
        .attr('id', 'g2_1')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var graph_predictedData2 = d3.select("#dataVis2").append("svg")
        .attr("width", '50%')
        .attr('id', 'g2_2')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + 0 + "," + margin.top + ")");

    givePrediction(data);
    givePredictionSound(data);
    detectFluctuations(data);

    console.log(data);

    axisUpdaterForActuallData(data);
    axisUpdaterForPrediction(data);

    axisUpdaterForActuallData2(data);
    axisUpdaterForPrediction2(data);

    lastDate= data[data.length-40].date;
    console.log(lastDate)

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

    drawValuesVibration(data[scope].vib);
    drawValuesSound(data[scope].vol);
    drawFluctuationCounter(data);

    drawLine(data, xScale, yScale);

    setInterval(
        toggle(
            function () {

                changeData(data);

                setScale2()
                updateAxis()

                clearLineLeft();
                drawLine(data, xScale, yScale);

                drawValuesVibration(data[scope].vib);
                drawValuesSound(data[scope].vol);
                drawFluctuationCounter(data);

                drawConstants()


            },
            function () {

                changeData(data);

                setScale1()
                updateAxis()

                clearLineLeft();
                drawLine(data, xScale, yScale);


                drawValuesVibration(data[scope].vib);
                drawValuesSound(data[scope].vol);
                drawFluctuationCounter(data);


                drawConstants()


            })

        , 250)

    function setScale1() {
        xScale.domain([data[0].date, data[scope].date]).range([0, width])
        yScale.domain([0, 0.02 + d3.max(data, function (d) { return d.DATA; })]).range([height - (margin.top + margin.bottom), 0])
        xAxisCall.scale(xScale)
        yAxisCall.scale(yScale)
    }

    function setScale2() {
        xScale.domain([data[0].date, data[scope].date]).range([0, width])
        yScale.domain([0, 0.02 + d3.max(data, function (d) { return d.DATA; })]).range([height - (margin.top + margin.bottom), 0])
        xAxisCall.scale(xScale)
        yAxisCall.scale(yScale)
    }

    function changeData(data) {

        let change;
        if (data[intervall].index + intervall > data.length) {
            change = data.splice(0, data.length - data[0].index);
        }
        else { change = data.splice(0, intervall); }

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
            .attr("y1", yScale(0.15))
            .attr("y2", yScale(0.15))
            .style("stroke", "orange")
            .style("stroke-width", "4px");

        svg.select('g').append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", yScale(0.4))
            .attr("y2", yScale(0.4))
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

    drawLinePrediction(data, xScale, yScale);

    setInterval(
        toggle(
            function () {
                givePrediction(data);
                detectFluctuations(data)


                setScale2()
                updateAxis()

                clearLineRight();
                drawLinePrediction(data, xScale, yScale);

                drawConstants()



            },
            function () {

                givePrediction(data);
                detectFluctuations(data)


                setScale1()
                updateAxis()

                clearLineRight();
                drawLinePrediction(data, xScale, yScale);

                drawConstants()

            })

        , 250)

    function setScale1() {
        xScale.domain([data[0].newData, data[scope].newData]).range([0, width - (margin.top + margin.bottom)])
        yScale.domain([0, 0.02 + d3.max(data, function (d) { return d.DATA; })]).range([height - (margin.top + margin.bottom), 0])
        xAxisCall.scale(xScale)
        yAxisCall.scale(yScale)
    }

    function setScale2() {
        xScale.domain([data[0].newData, data[scope].newData]).range([0, width - (margin.top + margin.bottom)])
        yScale.domain([0, 0.02 + d3.max(data, function (d) { return d.DATA; })]).range([height - (margin.top + margin.bottom), 0])
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
            .attr("x2", width - 50)
            .attr("y1", yScale(0.15))
            .attr("y2", yScale(0.15))
            .style("stroke", "orange")
            .style("stroke-width", "4px");

        svg.select('g').append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", yScale(0.4))
            .attr("y2", yScale(0.4))
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
        .y(function (d, i) { return yScale(d.vib) });


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
    else if (diff > 0.7) {
        diff = 2 - diff;
        diff = diff.toFixed(2);
        d3.select('#infoText_quali')
            .attr('fill', 'green')
            .text('Oil quality is at ' + diff * 100 + '%')
    }
    else {
        diff = 2 - diff;
        diff = diff.toFixed(2);
        d3.select('#infoText_quali')
            .attr('fill', 'red')
            .text('Oil quality is at ' + diff * 100 + '%')

    }
}


function drawValuesVibration(inpt) {

    inpt = inpt.toFixed(3);
    if (inpt < 0.15) {
        d3.select('#infoTextVib')
            .attr('fill', 'white')
            .text('Vibration at: ' + inpt + 'Hz')
    }
    else if (inpt < 0.4) {
        d3.select('#infoTextVib')
            .attr('fill', 'orange')
            .text('Vibration at: ' + inpt + 'Hz')

    }
    else {
        d3.select('#infoTextVib')
            .attr('fill', 'red')
            .text('Vibration at: ' + inpt + 'Hz')

    }
}
function drawValuesSound(inpt) {


    if (inpt < 80) {
        d3.select('#infoTextVol')
            .attr('fill', 'white')
            .text('Volume at: ' + inpt + 'dB')
    }
    else if (inpt < 117) {
        d3.select('#infoTextVol')
            .attr('fill', 'orange')
            .text('Volume at: ' + inpt + 'dB')

    }
    else {
        d3.select('#infoTextVol')
            .attr('fill', 'red')
            .text('Volume at: ' + inpt + 'dB')

    }
}

function drawFluctuationCounter(data) {

    
    if(data[0]==lastDate){
        fluctuationsCounter=0;
    }
    if (true) {
        if (fluctuationsCounter < 3) {
            d3.select('#infoText_prediction')
                .attr('fill', 'green')
                .text('Fluctuations detected ' + Math.ceil(fluctuationsCounter/3))
        }
        else if (fluctuationsCounter < 5) {
            d3.select('#infoText_prediction')
                .attr('fill', 'orange')
                .text('Fluctuations detected ' + Math.ceil(fluctuationsCounter/3))

        }
        else {
            d3.select('#infoText_prediction')
                .attr('fill', 'red')
                .text('Fluctuations detected ' + Math.ceil(fluctuationsCounter/3))

        }
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

    let avgInclineSumm = 0;

    for (let c = 10; c > 0; c--) {
        avgInclineSumm += (data[scope].DATA - data[scope - c].DATA) / (c);
    }

    let avgIncline = avgInclineSumm / 15;

    for (d of data) {
        d.pre = 0;
    }
    data[0].pre = data[scope].vib;

    for (let c = 1; c < data.length; c++) {
        data[c].pre = data[c - 1].pre + avgIncline;

    }

}

function giveTimePrediction(array) {

    let averageSlope = (array[scope].DATA - array[scope - 20].DATA) / (25);

    let dangerzone = 150;
    let fx = array[scope].DATA;

    let timer = 0;

    while (fx < dangerzone) {
        fx += averageSlope;
        timer++;
    }

    timer /= 60;

    timer = timer.toFixed(2);


    d3.select('#infoText_prediction')
        .attr('fill', 'white')
        .text('Vibration reaching dangerzone in aprox ' + timer + ' Minutes')
}

















//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////







function axisUpdaterForActuallData2(data) {
    var svg = d3.select("#g2_1")

    var xScale = d3.scaleTime()
    var yScale = d3.scaleLinear()

    var xAxisCall = d3.axisBottom()
        .ticks(6)
    var yAxisCall = d3.axisLeft()
        .ticks(10)


    setScale1()
    initAxis()
    drawConstants2();



    drawLine2(data, xScale, yScale);

    setInterval(
        toggle(
            function () {

                givePredictionSound(data);

                setScale2()
                updateAxis()

                clearLineLeft2();
                drawLine2(data, xScale, yScale);



                drawConstants2()


            },
            function () {

                givePredictionSound(data);

                setScale1()
                updateAxis()

                clearLineLeft2();
                drawLine2(data, xScale, yScale);




                drawConstants2()


            })

        , 250)

    function setScale1() {
        xScale.domain([data[0].date, data[scope].date]).range([0, width])
        yScale.domain([0, 20 + d3.max(data, function (d) { return d.vol; })]).range([height - (margin.top + margin.bottom), 0])
        xAxisCall.scale(xScale)
        yAxisCall.scale(yScale)
    }

    function setScale2() {
        xScale.domain([data[0].date, data[scope].date]).range([0, width])
        yScale.domain([0, 20 + d3.max(data, function (d) { return d.vol; })]).range([height - (margin.top + margin.bottom), 0])
        xAxisCall.scale(xScale)
        yAxisCall.scale(yScale)
    }

    function changeData(data) {

        let change;
        if (data[intervall].index + intervall > data.length) {
            change = data.splice(0, data.length - data[0].index);
        }
        else { change = data.splice(0, intervall); }

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

    function drawConstants2() {


        svg.select('g').append("line")
            .attr("x1", (0))
            .attr("x2", (width))
            .attr("y1", yScale(80))
            .attr("y2", yScale(80))
            .style("stroke", "orange")
            .style("stroke-width", "4px");

        svg.select('g').append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", yScale(117))
            .attr("y2", yScale(117))
            .style("stroke", "red")
            .style("stroke-width", "4px");
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function axisUpdaterForPrediction2(data) {
    var svg = d3.select("#g2_2")

    var xScale = d3.scaleTime()
    var yScale = d3.scaleLinear()

    var xAxisCall = d3.axisBottom()
        .ticks(6)
    var yAxisCall = d3.axisLeft()
        .ticks(0)


    setScale1()
    initAxis()
    drawConstants2()

    drawLinePrediction(data, xScale, yScale);

    setInterval(
        toggle(
            function () {



                setScale2()
                updateAxis()

                clearLineRight2();
                drawLinePrediction2(data, xScale, yScale);

                drawConstants2()



            },
            function () {




                setScale1()
                updateAxis()

                clearLineRight2();
                drawLinePrediction2(data, xScale, yScale);

                drawConstants2()

            })

        , 250)

    function setScale1() {
        xScale.domain([data[0].newData, data[scope].newData]).range([0, width - (margin.top + margin.bottom)])
        yScale.domain([0, 20 + d3.max(data, function (d) { return d.vol; })]).range([height - (margin.top + margin.bottom), 0])
        xAxisCall.scale(xScale)
        yAxisCall.scale(yScale)
    }

    function setScale2() {
        xScale.domain([data[0].newData, data[scope].newData]).range([0, width - (margin.top + margin.bottom)])
        yScale.domain([0, 20 + d3.max(data, function (d) { return d.vol; })]).range([height - (margin.top + margin.bottom), 0])
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

    function drawConstants2() {

        svg.select('g').append("line")
            .attr("x1", 0)
            .attr("x2", width - 50)
            .attr("y1", yScale(80))
            .attr("y2", yScale(80))
            .style("stroke", "orange")
            .style("stroke-width", "4px");

        svg.select('g').append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", yScale(117))
            .attr("y2", yScale(117))
            .style("stroke", "red")
            .style("stroke-width", "4px");
    }

}
//this function draws the graph
function drawLine2(data, xScale, yScale) {

    var svg = d3.select("#g2_1")
    var lineGroup = svg.select('g');

    var line = d3.line()
        .x(function (d, i) {
            if (i <= scope) {
                return xScale(d.date);
            }
        })
        .y(function (d, i) { return yScale(d.vol) });


    lineGroup.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", line(data));
}
function drawLinePrediction2(data, xScale, yScale) {


    var svg = d3.select("#g2_2")
    var lineGroup = svg.select('g');

    var line = d3.line()
        .x(function (d, i) {
            if (i < scope) {
                return xScale(d.newData);
            }
        })
        .y(function (d, i) { return yScale(d.preSound) });


    lineGroup.append("path")
        .data([data])
        .attr("class", "line")
        .style("stroke-dasharray", ("6, 9"))
        .attr("d", line(data));
}

function clearLineLeft2() {
    var svg = d3.select("#g2_1")
    var lineGroup = svg.select('g');

    lineGroup.selectAll("*")
        .remove();
}
function clearLineRight2() {

    var svg = d3.select("#g2_2")
    var lineGroup = svg.select('g');

    lineGroup.selectAll("*")
        .remove();
}

function givePredictionSound(data) {

    let avgInclineSumm = 0;

    for (let c = 10; c > 0; c--) {
        avgInclineSumm += (data[scope].vol - data[scope - c].vol) / (c);
    }

    let avgIncline = avgInclineSumm / 15;

    for (d of data) {
        d.preSound = 0;
    }
    data[0].preSound = data[scope].vol;

    for (let c = 1; c < data.length; c++) {
        data[c].preSound = data[c - 1].preSound + avgIncline;

    }

}


function detectFluctuations(data) {

    let inclineArray = [];

    for (let c = 10; c >= 0; c--) {
        inclineArray[c] = (data[scope - c].vib - data[scope - (c + 1)].vib) / (2);
    }

    let wantedSumm = inclineArray[0] * inclineArray.length;

    let calculatedSumm = 0;

    for (ele of inclineArray) {
        calculatedSumm += ele;
    }

    if (!(wantedSumm - 0.04 < calculatedSumm && wantedSumm + 0.04 > calculatedSumm)) {
        fluctuationsCounter++;
    }
    


}