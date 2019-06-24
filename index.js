var dataSet = [];
var files = ['http://it2wi1.if-lab.de/rest/mpr_fall1'];
var promises = [];

files.forEach(function (files) {
    promises.push(d3.json(files))
});

Promise.all(promises).then((result) => receiveData(result), function (error) {
    console.log('Something went wrong!!' + error);
})

function receiveData(data) {
    console.log('data was received succefuly');
    visData(data);
};

function visData(data){
    
};



