//save the url links to the data download here
var files = ['http://it2wi1.if-lab.de/rest/mpr_fall4', 'http://it2wi1.if-lab.de/rest/mpr_fall2'];
var promises = [];

var dataSave=[];

var winWidth = window.innerWidth;
var winHeight = window.innerHeight;

var margin = { top: 20, right: 10, bottom: 30, left: 60 },
    width = (winWidth /10)*4 - margin.left - margin.right,
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
        d.DATA = convertCommaFloats(d.werte.Tavg_vibr)
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
        .attr("width", '100%')
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // setting the ranges for the x and y axes
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);


    //setting the domains for the x and y axes
    x.domain([0,10]);
    y.domain([0, 0.25]);

    //custom axes
    var xAxis = d3.axisBottom(x)
        .ticks(10)

    var yAxis = d3.axisLeft(y)
        .ticks(10);

    //appending the axes to the graph
    graph.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", 'axis')
        .call(xAxis);


    graph.append("g")
        .attr("class", 'axis')
        .call(yAxis);

    var line = d3.line()
        .x(function (d, i) { 
            if(i<=0){console.log(d,i)};
            return x(i); })
        .y(function (d, i) { return y(d.DATA)});


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


    setInterval(function () {
        computeSlope(data[0]);

        var v = data.shift();
        data.push(v);
        redrawWithAnimation();

    }, 100)

}






function convertCommaFloats(inpt) {
    let inptString = inpt.toString();

    inptString = inptString.replace(',', '.');

    let re = parseFloat(inptString);

    return re;

};


function computeSlope(inpt){

    if(dataSave.length<10){
        dataSave.push(inpt);
    }
    else{
        dataSave.shift();
        dataSave.push(inpt);
    }
}