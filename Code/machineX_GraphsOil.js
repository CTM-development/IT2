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
    var graph_l = d3.select("#dataVis").append("svg")
        .attr("width", '50%')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var graph_r = d3.select("#dataVis").append("svg")
        .attr("width", '50%')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + 5 + "," + margin.top + ")");
    axisUpdateExample1()

    // setting bases variables for dynamic axes
    var xScale = d3.scaleTime();
    var yScale = d3.scaleLinear();

    var xAxisCall = d3.axisBottom()
    var yAxisCall = d3.axisLeft()

    //appending the axes to the graphs
    initAxis();


    graph_l.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1.25em")
        .attr('class', 'yLabel')
        .style("text-anchor", "middle")
        .text("Temperatur in °C");

    //appending the 2 constants
    appendConstants();

    //calculated data graph
    graph_r.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", 'axis')
        .call(xAxisCalc);

    graph_r.append("g")
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


    // graphline gets constructed here
    graph_l.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", line(data));


    setInterval(function () {

        var v = data.slice(0, 10);
        data.push(v);

        redrawWithAnimation();

        axisUpdater(data);

        computeOilQuality(data[0].werte.Tavg_temp, data[0].werte.Qualitaetsgrenze);



        drawValues(data[29]);

    }, 10000)














    function axisUpdater(data) {

        setScale(data);
        updateAxis();

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

        function setScale(data) {

            xScale.domain([data[0].datum, data[29].datum]).range([0, width])
            yScale.domain([0, d3.max(data, function (d) { return d.DATA })]).range([height, 0])


        }
    }

    function axisUpdateExample1() {
        var svg = d3.select("#example1")

        var xScale = d3.scaleLinear()
        var yScale = d3.scaleLinear()

        var xAxisCall = d3.axisBottom()
        var yAxisCall = d3.axisLeft()


        setScale1()
        initAxis()


        setInterval(toggle(
            function () {
                setScale2()
                updateAxis()
            },
            function () {
                setScale1()
                updateAxis()

            }), 2000)

        function setScale1() {
            xScale.domain([0, 1000]).range([0, width - (margin.top + margin.bottom)])
            yScale.domain([0, 1000]).range([height - (margin.top + margin.bottom), 0])

        }

        function setScale2() {
            xScale.domain([0, 100]).range([0, width - (margin.top + margin.bottom)])
            yScale.domain([0, 100]).range([height - (margin.top + margin.bottom), 0])

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






























    function initAxis() {
        graph_l.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + [margin.left, height - margin.top] + ")")
            .call(xAxisCall)

        graph_l.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + [margin.left, margin.top] + ")")
            .call(yAxisCall)
    }


    function redrawWithAnimation() {
        // update with animation
        graph_l.selectAll(".line")
            .data([data]) // set the new data
            .attr("transform", "translate(0," + x(1) + ")") // set the transform to the right by x(1) pixels (6 for the scale we've set) to hide the new value
            .attr("d", line) // apply the new data values ... but the new value is hidden at this point off the right of the canvas
            .transition() // start a transition to bring the new value into view

            .duration(10000) // for this demo we want a continual slide so set this to the same as the setInterval amount below
            .attr("transform", "translate(0," + x(0) + ")"); // animate a slide to the left back to x(0) pixels to reveal the new value

    }



    function appendConstants() {
        graph_l.append("svg:line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(75))
            .attr("y2", y(75))
            .style("stroke", "orange")
            .style("stroke-width", "4px");

        graph_l.append("svg:line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(90))
            .attr("y2", y(90))
            .style("stroke", "red")
            .style("stroke-width", "4px");

        graph_r.append("svg:line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(75))
            .attr("y2", y(75))
            .style("stroke", "orange")
            .style("stroke-width", "4px");

        graph_r.append("svg:line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(90))
            .attr("y2", y(90))
            .style("stroke", "red")
            .style("stroke-width", "4px");

    }



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


function toggle() {
    var fn = arguments;
    var l = arguments.length;
    var i = 0;
    return function () {
        if (l <= i) i = 0;
        fn[i++]();
    }
}

