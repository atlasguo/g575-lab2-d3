/* Javascript by Chenxiao (Atlas) Guo, 2019 */

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){

    //map frame dimensions
    var width = 960,
        height = 460;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create projection
    var projection = d3.geoAlbers()
        .center([1, 47])
        .rotate([97, 8, 0])
        .parallels([37.00, 45.5])
        .scale(750)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
           .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [];
    promises.push(d3.csv("data/state.csv")); //load attributes from csv
    promises.push(d3.json("data/state.json")); //load background spatial data
    promises.push(d3.json("data/country.json")); //load background spatial data
    Promise.all(promises).then(callback);

    function callback(data)
    {
    	csvData = data[0];
    	state = data[1];
        country = data[2];
        console.log(csvData);
        console.log(state);
        console.log(country);

        //translate TopoJSON
        var usStates = topojson.feature(state, state.objects.state).features;
        var worldCountries = topojson.feature(country, country.objects.countries);

        //examine the results
        console.log(usStates);
        console.log(worldCountries);

        //create graticule generator
        var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines

        //add state to map
        var regions = map.selectAll(".regions")
            .data(usStates)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.geoid;
            })
            .attr("d", path);

        //add countries to map
        var countries = map.append("path")
            .datum(worldCountries)
            .attr("class", "countries")
            .attr("d", path);
    };

};
