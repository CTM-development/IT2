//save the url links to the data download here
var files = ['http://it2wi1.if-lab.de/rest/mpr_fall1'];
var promises = [];

var dataSave;

//set scale of the svg canvas, change width and height here
var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = 1200 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

// setting the ranges for the x and y axes
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

//custom time parser
var parseTime = d3.timeParse('%d.%m.%Y %H:%M:%S');


//get the graph line coordinates
var valuelineData = d3.line()
    .x(function (d) { console.log(d); return x(d.datum) })
    .y(function (d) { return y(d.werte.Tavg_vibr); });


//appending the svg 'canvas'
var svg = d3.select("body").append("svg")
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
    visualiseData(data);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//actuall visualisation  ation work is done here


function visualiseData(data){

    dataSave=data;

    //some test logs


    //formatting the data
    data[3].forEach(function (d) {
        d.datum = parseTime(d.datum);
        d.werte.Tavg_vibr = convertCommaFloats(d.werte.Tavg_vibr)
    });


    //setting the domains for the x and y axes
    x.domain(d3.extent(data[3], function (d) { return d.datum; }));
    y.domain([0, d3.max(data[3], function (d) { return (d.werte.Tavg_vibr); })]);

    svg.selectAll(".line")
    .data(data[0])
    .enter()
    .append("path")
      .attr("fill", "none")
      .attr("stroke",'blue' )
      .attr("stroke-width", 1.5)
      .attr("d", function(d){
        return d3.line()
          .x(function(d) { return x(d.datum); })
          .y(function(d) { return y(d.werte.Tavg_vibr); })
          (d.values)
      })

}











function convertCommaFloats(inpt) {
    let inptString = inpt.toString();

    inptString = inptString.replace(',', '.');

    let re = parseFloat(inptString);

    return re;

};