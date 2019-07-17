//save the url links to the data download here
var files = ['http://it2wi1.if-lab.de/rest/mpr_fall1', 'http://it2wi1.if-lab.de/rest/mpr_fall2'];
var promises = [];

const scope = 30;
const intervall= 1;

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

    console.log(data);

    dataUpdaterOil(data);
    dataUpdaterVibration(data);

};




// this function changes the x- axis domain in every X seconds
function dataUpdaterOil(data) {




    drawValuesTemp(data[scope].temp);



    computeOilQuality(data[scope].DATA, data[scope].qual);




    setInterval(
        toggle(
            function () {

                changeData(data);

                computeOilQuality(data[scope].DATA, data[scope].qual);

                drawValuesTemp(data[scope].temp);


            },
            function () {

                changeData(data);

                computeOilQuality(data[scope].DATA, data[scope].qual);

                drawValuesTemp(data[scope].temp);

            })

        , 1000)



    function changeData(data) {

        let change;
        if (data[scope].index + intervall > data.length) {
            change = data.splice(0, data.length - data[0].index);
        }
        else { change = data.splice(0, intervall); }

        for (c of change) {
            data.push(c);
        }

    }

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function dataUpdaterVibration(data) {

    drawValuesVibration(data[scope].vib);
    drawValuesSound(data[scope].vol);

    computeOilQuality(data[scope].DATA, data[scope].qual);


    setInterval(
        toggle(
            function () {


                drawValuesVibration(data[scope].vib);
                drawValuesSound(data[scope].vol);

                computeOilQuality(data[scope].DATA, data[scope].qual);



            },
            function () {



                drawValuesVibration(data[scope].vib);
                drawValuesSound(data[scope].vol);

                computeOilQuality(data[scope].DATA, data[scope].qual);


            })

        , 1000)



}





function computeOilQuality(temp, quali) {

    var diff = temp / quali;
    diff = diff.toFixed(2);

    if (diff <= 1) {
        d3.select('#oilT2')
            .attr('fill', 'green')
            .text(' Oil qual: 100%')

    }
    else if (diff > 0.70) {
        diff = 2 - diff;
        diff = diff.toFixed(2);
        d3.select('#oilT2')
            .attr('fill', 'orange')
            .text('Oil qual: ' + diff * 100 + '%')

    }
    else {
        diff = 2 - diff;
        diff = diff.toFixed(2);
        d3.select('#oilT2')
            .attr('fill', 'red')
            .text('Oil qual: ' + diff * 100 + '%')
    }

}


function drawValuesTemp(inpt) {

    if (inpt < 70) {
        d3.select('#oilT1')
            .attr('fill', 'green')
            .text('Oil temp: ' + inpt + '°C')
    }
    else {
        d3.select('#oilT1')
            .attr('fill', 'orange')
            .text('Oil temp: ' + inpt + '°C')

    }
}

function drawValuesVibration(inpt) {

    inpt = inpt.toFixed(3);
    if (inpt < 0.15) {
        d3.select('#vibT1')
            .attr('fill', 'green')
            .text('Vibration: ' + inpt + 'Hz')
    }
    else {
        d3.select('#vibT1')
            .attr('fill', 'orange')
            .text('Vibration: ' + inpt + 'Hz')

    }
}

function drawValuesSound(inpt) {

    if (inpt < 80) {
        d3.select('#vibT2')
            .attr('fill', 'green')
            .text('Sound lvl: ' + inpt + 'dB')
    }
    else {
        d3.select('#vibT2')
            .attr('fill', 'orange')
            .text('Sound lvl: ' + inpt + 'dB')

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
        .text('Change Oil in approximatly: ' + timer + ' Minutes')
}