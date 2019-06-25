//save the url links to the data download here
var files = ['http://it2wi1.if-lab.de/rest/mpr_fall1'];
var promises = [];

//set base val variables for later use
var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = 1200 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var parseTime = d3.timeParse('%d.%m.%Y %H:%M:%S');

//set the graph line
var valueline = d3.line()
    .x(function(d) { return x(d.datum)})
    .y(function(d) { return y(d.werte.Tavg_temp); });


//appending the svg 'canvas'
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
         .append("g")
              .attr("transform",  "translate(" + margin.left + "," + margin.top + ")");
              
              
//load the data from url array <files>  
files.forEach(function (files) {
    promises.push(d3.json(files))
});


Promise.all(promises).then((result) => receiveData(result), function (error) {
    console.log('Something went wrong!!' + error);
})

function receiveData(data) {
    console.log('data was received succefuly');
    visualiseData(data);
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//actuall visualisation  ation work is done here
function visualiseData(data) {

    //some test logs
    console.log(data[0][12].datum);
    console.log(data[0]);  

    //formatting the data:
    data[0].forEach(function(d) {
        d.datum = parseTime(d.datum);
        d.werte.Tavg_temp= convertCommaFloats(d.werte.Tavg_temp)
    });
    

    x.domain(d3.extent(data[0], function(d) { return d.datum; }));
    y.domain([0, d3.max(data[0], function(d) { return (d.werte.Tavg_temp); })]);


    // Add the valueline path.
    svg.append("path")
    .data([data[0]])
    .attr("class", "line")
    .attr("d", valueline);

    // Add the X Axis
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    
 
};


function convertCommaFloats(inpt) {
    let inptString = inpt.toString();

    inptString = inptString.replace(',', '.');

    let re = parseFloat(inptString);

    return re;

};

/*function extractPosInArray(inpt){
    let inptString = inpt.toString();

    let c = inptString.slice(14,17);

    c= c.replace(':','');

    let re = c.parseFloat()/60;
    return re;
}
*/

//dead code for a question
/*d3.select('#svg_canvas').append('line')
    .attr('x1', '0')
    .attr('y1', '595')
    .attr('x2', '1195')
    .attr('y2', '595')
    .attr('id', 'x_axis');


d3.select('#header_div').append('p').text('hallo')

var newSvg = d3.select('body').append('svg')
    .attr('width', 200)
    .attr('height', 200);

    svgContainer= d3.select('g')
        .selectAll('g')
        .data(data[0])
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', function (d) {
            return ('translate(' + (data[0].indexOf(d) * 1200 / 310 + 0) + ',' + ((600 - 0.1 * Math.pow(convertCommaFloats(d.werte.Tavg_laut), 2)) + 0) + ')');
        })

    svgContainer.append('circle')
        .attr('r', 2)
        .style('fill', 'blue')

*/