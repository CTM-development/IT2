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
        d.datum = parseTime(d.datum);
        d.DATA = convertCommaFloats(d.werte.Tavg_temp);
        d.werte.Qualitaetsgrenze = convertCommaFloats(d.werte.Qualitaetsgrenze);
        d.werte.Tavg_temp = convertCommaFloats(d.werte.Tavg_temp);
    });
    visualiseData(data[0]);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//actuall visualisation  ation work is done here


function visualiseData(data) {

    //some test logs
    console.log(data);

    //appending the svg 'canvas'
    var graph = d3.select("#dataVis").append("svg")
        .attr("width", '50%')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var calcu = d3.select("#dataVis").append("svg")
        .attr("width", '50%')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + 5 + "," + margin.top + ")");


    // setting the ranges for the x and y axes
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);


    //setting the domains for the x and y axes
    x.domain([0, 30]);
    y.domain([0, 20 + d3.max(data, function (d) { return d.DATA; })]);

    //custom axes
    var xAxis = d3.axisBottom(x)
        .ticks(10)

    var yAxis = d3.axisLeft(y)
        .ticks(10);

    //custom axes for the calculated data graph
    var xAxisCalc = d3.axisBottom(x)
        .ticks(10)

    var yAxisCalc = d3.axisLeft(y)
        .tickValues([])
        .ticks(10);

    //appending the axes to the graphs
    graph.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", 'axis')
        .call(xAxis);

    graph.append("g")
        .attr("class", 'axis')
        .call(yAxis);

    graph.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1.25em")
        .attr('class', 'yLabel')
        .style("text-anchor", "middle")
        .text("Temperatur in grad celsius");

    //appending the 2 constants
    graph.append("svg:line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(75))
        .attr("y2", y(75))
        .style("stroke", "orange")
        .style("stroke-width", "4px");

    graph.append("svg:line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(90))
        .attr("y2", y(90))
        .style("stroke", "red")
        .style("stroke-width", "4px");

    calcu.append("svg:line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(75))
        .attr("y2", y(75))
        .style("stroke", "orange")
        .style("stroke-width", "4px");

    calcu.append("svg:line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(90))
        .attr("y2", y(90))
        .style("stroke", "red")
        .style("stroke-width", "4px");

    //calculated data graph
    calcu.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", 'axis')
        .call(xAxisCalc);

    calcu.append("g")
        .attr("class", 'axis')
        .call(yAxisCalc);


    var line = d3.line()
        .x(function (d, i) {
            if (i <= 0) {
            };
            if (i < 31) {
                return x(i);
            }
        })
        .y(function (d, i) { return y(d.DATA) });

    var calculatedLine = d3.line()
        .x(function (d, i) {
            if (i <= 0) {
            };
            if (i < 11) {
                return x(i);
            }
        })
        .y(function (d, i) { return y(d) });

    // graphline gets constructed here
    graph.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", line(data));



    function redrawWithAnimation() {
        // update with animation
        graph.selectAll(".line")
            .data([data]) // set the new data
            .attr("transform", "translate(0," + x(1) + ")") // set the transform to the right by x(1) pixels (6 for the scale we've set) to hide the new value
            .attr("d", line) // apply the new data values ... but the new value is hidden at this point off the right of the canvas
            .transition() // start a transition to bring the new value into view

            .duration(100) // for this demo we want a continual slide so set this to the same as the setInterval amount below
            .attr("transform", "translate(0," + x(0) + ")"); // animate a slide to the left back to x(0) pixels to reveal the new value

    }


    function drawCalcualtions(inpt) {

        d3.select('#cLine').remove();
        d3.select('#cLine').remove();
        d3.select('#cLine').remove();
        d3.select('#cLine').remove();
        d3.select('#cLine').remove();
        d3.select('#cLine').remove();

        calcu.append('svg:polygon')
            .attr('id', 'cLine')
            .attr('points', '0,' + y(inpt[1]) + ' ' + width + ',' + y(inpt[3]) + ' ' + width + ',' + y(inpt[2]))
            .attr('fill', "grey")
            .attr('fill-opacity', '0.3')

        calcu.append("svg:line")
            .attr("x1", 0)
            .attr('id', 'cLine')
            .attr("x2", width)
            .attr("y1", y(inpt[1]))
            .attr("y2", y(inpt[3])) //accurateSlope
            .style("stroke", "gray")
            .style("stroke-width", "2px");

        calcu.append("svg:line")
            .attr("x1", 0)
            .attr('id', 'cLine')
            .attr("x2", width)
            .attr("y1", y(inpt[0]))
            .attr("y2", y(inpt[2])) //averageSlope
            .style("stroke", "blue")
            .style("stroke-width", "4px");

        calcu.append("svg:line")
            .attr("x1", 0)
            .attr('id', 'cLine')
            .attr("x2", width)
            .attr("y1", y(inpt[0]))
            .attr("y2", y(inpt[4])) //averageSlope
            .style("stroke", "blue")
            .style("stroke-width", "4px");


    }


    setInterval(function () {

        var v = data.shift();
        data.push(v);

        redrawWithAnimation();


        computeOilQuality(data[0].werte.Tavg_temp, data[0].werte.Qualitaetsgrenze);


        drawCalcualtions(givePrediction(data.slice(0, 30)));
        drawValues(data[29]);

    }, 100)

}






function convertCommaFloats(inpt) {
    let inptString = inpt.toString();

    inptString = inptString.replace(',', '.');

    let re = parseFloat(inptString);

    return re;

};


function computeSlope(inpt, c) {

    if (c == 0) {
        return (inpt[inpt.length - 1].DATA / inpt[0].DATA);
    }
    else {
        return (inpt[inpt.length - 1].DATA / inpt[inpt.length - 2].DATA);
    }

}

function givePrediction(inpt) {



    var averageSlope = computeSlope(inpt, 0);
    var accurateSlope = computeSlope(inpt, 1);

    var cache = inpt[inpt.length - 1].DATA;
    for (var count = 1; count <= inpt.length; count++) {
        cache *= accurateSlope;
    }



    var startEnd = [];

    startEnd[0] = inpt[inpt.length - 1].DATA;
    startEnd[1] = inpt[inpt.length - 1].DATA;
    startEnd[2] = inpt[inpt.length - 1].DATA * averageSlope;
    startEnd[3] = cache;
    startEnd[4] = inpt[inpt.length - 1].DATA * averageSlope * 0.99;

    return startEnd;

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