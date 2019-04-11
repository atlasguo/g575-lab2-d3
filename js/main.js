/* Javascript by Chenxiao (Atlas) Guo, 2019 */

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap()
{
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
		.center([0, 38])
		.rotate([98, 0])
		.parallels([37.00, 45.5])
        .scale(930)
		.translate([width / 2, height / 2]);

	var path = d3.geoPath()
		.projection(projection);


	//use Promise.all to parallelize asynchronous data loading
	var promises = [];
	promises.push(d3.csv("data/state.csv")); //load attributes from csv
	promises.push(d3.json("data/na_country.json")); //load background spatial data
	promises.push(d3.json("data/usa_state.json")); //load choropleth spatial data
	Promise.all(promises).then(callback);
	
	function callback(data)
	{
		csvData = data[0];
		na_country_data = data[1];
		usa_state_data = data[2];
		console.log(csvData);
		console.log(na_country_data);
		console.log(usa_state_data);

		//translate europe TopoJSON
		var na_country = topojson.feature(na_country_data, na_country_data.objects.na_country),
			usa_state = topojson.feature(usa_state_data, usa_state_data.objects.usa_state).features;

		//examine the results
		console.log(na_country);
		console.log(usa_state);

		//create graticule generator
        var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //create graticule background
        var gratBackground = map.append("path")
            .datum(graticule.outline()) //bind graticule background
            .attr("class", "gratBackground") //assign class for styling
            .attr("d", path); //project graticule
			
		//create graticule lines
		var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path);

		//add countries to map
		var countries = map.append("path")
			.datum(na_country)
			.attr("class", "countries")
			.attr("d", path);

		//add regions to map
		var regions = map.selectAll(".regions")
			.data(usa_state)
			.enter()
			.append("path")
			.attr("class", function (d)
			{
				return "regions " + d.properties.GEOID;
			})
			.attr("d", path);
	};
};

