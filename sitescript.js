// set of attributes for each player to be compared
var playerAttrSetArr = ["YDS","TD","INT"];
var playerAttrSetMaxValArr = {"YDS":4689,"TD":28,"INT":23};
var playerAttrSetMinValArr = [0,0,0];
var playerDictionary ={};
function start(){

  $(document).ready(function(){

  	   //populate the select boxes with the teams
		var teamsAndCodes = { "NFC" : {"dal":"Dallas Cowboys","nyg":"New York Giants","atl":"Atlanta Falcons","sea":"Seattle Seahawks","gb":"Green Bay Packers","det":"Detroit Lions","tb":"Tampa Bay Buccaneers","wsh":"Washington Redskins","min":"Minnesota Vikings","ari":"Arizona Cardinals","no":"New Orleans Saints","car":"Carolina Panthers","phi":"Philadelphia Eagles","la":"Los Angeles Rams","chi":"Chicago Bears","sf":"San Francisco 49ers"},
		"AFC" :{ "bal":"Baltimore Ravens","buf":"Buffalo Bills", "cin":"Cincinnati Bengals","cle":"Cleveland Browns","den":"Denver Broncos","hou":"Houston Texans","ind":"Indianapolis Colts","jax":"Jacksonville Jaguars","kc":"Kansas City Chiefs","mia":"Miami Dolphins","ne":"New England Patriots","nyj":"New York Jets","oak":"Oakland Raiders","pit":"Pittsburgh Steelers","sd":"San Diego Chargers","ten":"Tennessee Titans"}}

		var teamSelOptStr="";
		Object.keys(teamsAndCodes["NFC"]).forEach(function(teamCode){
		 	teamSelOptStr += "<option value='"+ teamCode.toUpperCase()+"'>"+teamsAndCodes["NFC"][teamCode]+"</option>";
		});
		Object.keys(teamsAndCodes["AFC"]).forEach(function(teamCode){
		 	teamSelOptStr += "<option value='"+ teamCode.toUpperCase()+"'>"+teamsAndCodes["AFC"][teamCode]+"</option>";
		});

		$(".playerTeam").html(teamSelOptStr);

  		drawTeamsOnUSMapGraph();
  		var yearOptionsStr ="";
  		for(var i=2002;i<=2016;i++){
  			yearOptionsStr += "<option>"+i+"</option>";
  		}
  		$(".yearSelPlayerProfile").html(yearOptionsStr);

		$(document).on("change",".yearSelPlayerProfile",function(){

		});


		$(document).on("change",".playerTeam",function(){
			
			var selectedyear = $(".yearSelPlayerProfile").val();
			var selectedTeam = $(this).val();
				var playerOptionsStr="";
				Object.keys(playerDictionary[selectedyear]).forEach(function(player){
					if(playerDictionary[selectedyear][player]["TEAM"] == selectedTeam){
						playerOptionsStr += "<option>"+player+"</option>";
					}
			 	});
			$(this).parents(".teamAndPlayerGrp").find(".playerSelPlayerProfile").html(playerOptionsStr);
		});

		$(document).on("change",".posSelPlayerProfile",function(){
			if($(this).val() == "select"){
				$(".teamAndPlayerSelRow").hide();
			}else{
				$(".teamAndPlayerSelRow").show();
				drawPlayerRadialGraph();
			}
		});

		$(document).on("click",".comparePlayerButt",function(){
			console.log("compare butt clicked");
			displayHelperRadiusPlot();
		});


    });
 }

//**** this one is to draw a Radial graph for the player attributes
 function drawPlayerRadialGraph(){
	var dataForPPRador =[];
	playerDictionary ={};
	var max=0.0;

	var curEle="";
	var selectedyear = $(".yearSelPlayerProfile").val();
		d3.json("./datasrc/leaders_"+$(".posSelPlayerProfile").val() +".json", function(error, dataFromJsonFile) {
				dataFromJsonFile.rows.forEach(function(obj) {
				    //console.log(obj);
				    if(obj["YEAR"] == selectedyear){
				    	if(!(playerDictionary.hasOwnProperty(obj["YEAR"])))
					    {
					    	playerDictionary[obj["YEAR"]] = {};
					    	playerDictionary[obj["YEAR"]][obj["PLAYER"]]= obj;
					    }
					    else
					    {
					    	playerDictionary[obj["YEAR"]][obj["PLAYER"]]= obj;
					    }
				    }
				});
				console.log(playerDictionary);	
				//here all the jsons regarding the players statistics are read
				var playerOptionsStr="";
				Object.keys(playerDictionary[selectedyear]).forEach(function(player){
					if(playerDictionary[selectedyear][player]["TEAM"] == $(".playerTeam").val() ){
						playerOptionsStr += "<option>"+player+"</option>";
					}
	
			 	});
				$(".playerSelPlayerProfile").html(playerOptionsStr);
		});
	
 }

function displayHelperRadiusPlot(){

		//$(".yearSelPlayerProfile").val("2016");
		var margin = {top: 100, right: 100, bottom: 100, left: 100},
		width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
		height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

		var yearOptionForRadiusMap = "";
	 	Object.keys(playerDictionary).forEach(function(year){
	 			yearOptionForRadiusMap += "<option>"+year+"</option>";
	 	});

	 	$(".yearSelPlayerProfile").html(yearOptionForRadiusMap);
	 	dataForPPRador =[];



		$(".playerSelPlayerProfile").each(function(){
			curEle = $(this);
			var innerObjArr = [];
				playerAttrSetArr.forEach(function(attrName) {
					var innerObj ={};
					innerObj["axis"] = attrName;
					var valStr = playerDictionary[$(".yearSelPlayerProfile").val()][curEle.val()][attrName];

					innerObj["value"] = parseFloat(valStr.replace(",", ""))/playerAttrSetMaxValArr[attrName];
					innerObj["max"] = playerAttrSetMaxValArr[attrName];
					innerObjArr.push(innerObj);
				});
				dataForPPRador.push(innerObjArr);
		});
		
		var color = d3.scale.ordinal()
			.range(["#EDC951","#CC333F","#00A0B0"]);
		var radarChartOptions = {
		  w: width/2,
		  h: height/2,
		  margin: margin,
		  maxValue: 1,
		  levels: 5,
		  roundStrokes: true,
		  color: color
		};

		//Call function to draw the Radar chart
		RadarChart(".radarChart", dataForPPRador, radarChartOptions);

		// RadarChart(".radarChart", data, radarChartOptions);

}

//** Worldmap with the teams placement */
function drawTeamsOnUSMapGraph(){

	//Width and height of map
	var width = 960;
	var height = 500;

	// D3 Projection
	var projection = d3.geo.albersUsa()
	.translate([width/2, height/2])    // translate to center of screen
	.scale([1000]);          // scale things down so see entire US

	// Define path generator
	var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
	.projection(projection);  // tell path generator to use albersUsa projection


	// Define linear scale for output
	var color = d3.scale.linear()
	.range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);

	var legendText = ["Cities Lived", "States Lived", "States Visited", "Nada"];

	//Create SVG element and append map to the SVG
	var svg = d3.select(".usmapwithteams")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

	// Append Div for tooltip to SVG
	var div = d3.select(".usmapwithteams")
	.append("div")   
	.attr("class", "tooltip")               
	.style("opacity", 0);

	// Load in my states data!
	d3.csv("./datasrc/stateslived.csv", function(data) {
		color.domain([0,1,2,3]); // setting the range of the input data

		// Load GeoJSON data and merge with states data
		d3.json("./datasrc/us-states.json", function(json) {

			// Loop through each state data value in the .csv file
			for (var i = 0; i < data.length; i++) {
				// Grab State Name
				var dataState = data[i].state;

				// Grab data value 
				var dataValue = data[i].visited;

					// Find the corresponding state inside the GeoJSON
					for (var j = 0; j < json.features.length; j++)  {
						var jsonState = json.features[j].properties.name;
						if (dataState == jsonState) {
							// Copy the data value into the JSON
							json.features[j].properties.visited = dataValue; 
							// Stop looking through the JSON
							break;
						}
					}
			}

			// Bind the data to the SVG and create one path per GeoJSON feature
			svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", "#fff")
			.style("stroke-width", "1")
			.style("fill", function(d) {
				// Get data value
				var value = d.properties.visited;
				if (value) {
					//If value exists…
					return color(value);
				} else {
					//If value is undefined…
					return "rgb(213,222,217)";
				}
			});


			// Map the cities I have lived in!
			d3.csv("./datasrc/cities-lived.csv", function(data) {
				svg.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("cx", function(d) {
					return projection([d.lon, d.lat])[0];
				})
				.attr("cy", function(d) {
					return projection([d.lon, d.lat])[1];
				})
				.attr("r", function(d) {
					return Math.sqrt(d.years) * 4;
				})
				.style("fill", "rgb(217,91,67)")	
				.style("opacity", 0.85)	
				// Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
				// http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
				.on("mouseover", function(d) {      
					div.transition()        
					.duration(200)      
					.style("opacity", .9);      
					div.text(d.place)
					.style("left", (d3.event.pageX) + "px")     
					.style("top", (d3.event.pageY - 28) + "px");    
				})   

				// fade out tooltip on mouse out               
				.on("mouseout", function(d) {       
					div.transition()        
					.duration(500)      
					.style("opacity", 0);   
				});
			});  

			/*// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
			var legend = d3.select(".usmapwithteams").append("svg")
			.attr("class", "legend")
			.attr("width", 140)
			.attr("height", 200)
			.selectAll("g")
			.data(color.domain().slice().reverse())
			.enter()
			.append("g")
			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

			legend.append("rect")
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

			legend.append("text")
			.data(legendText)
			.attr("x", 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.text(function(d) { return d; });*/
		});
	});
 }

 start();