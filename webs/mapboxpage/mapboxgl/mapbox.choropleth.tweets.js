
var tweets_map = d3.map();

var svg_tweet = d3.select(container).append("svg")
         .attr("id", "tweets")
         .attr("width", window.innerWidth)
         .attr("height", window.innerHeight);

d3.queue()
    .defer(d3.csv, "mapboxgl/data/county_values_comb.csv", function(d) { tweets_map.set(d.FIPS, d); })
    .await(ready);

 var g_tweets, color_tweets, tweets_data_chro;

function ready(error, ctweets) {
  if (error) {
    console.log(error);
  }

  tweets_data_chro=ctweets;

  color_tweets = d3.scaleLinear().domain([-1, 0, 1]).interpolate(d3.interpolateHcl).range(["#355ae0","#f7f6f2","#f20c0e"]).clamp(true);


  var defs = svg_tweet.append("defs");

    var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");
    var legendWidth=20, legendHeight=200;
    linearGradient.attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    //Set the color for the start (0%)
    linearGradient.append("stop").attr("offset", "0%").attr("stop-color", "#355ae0"); //light blue
    linearGradient.append("stop").attr("offset", "50%").attr("stop-color", "#f7f6f2"); //light blue
    linearGradient.append("stop").attr("offset", "100%").attr("stop-color", "#f20c0e"); //dark blue

    var legendsvg = svg_tweet.append("g").attr("class", "legendWrapper")
    legendsvg.append("rect")
    .attr("class", "legendRect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#linear-gradient)")
    .attr("transform", "translate(" + (window.innerWidth - 40) + "," + (50) + ")");


    var yScale = d3.scaleLinear()
       .range([0, legendHeight])
       .domain([-1,1]);
       //.domain([d3.min(pt.legendSOM.colorData)/100, d3.max(pt.legendSOM.colorData)/100]);

    //Define y-axis
    var yAxis = d3.axisLeft(yScale)
        .ticks(5);  //Set rough # of ticks
        //.tickFormat(formatPercent)

    //Set up X axis
    legendsvg.append("g")
      .attr("class", "yxis")  //Assign "axis" class
      .attr("transform", "translate(" + (window.innerWidth - 50) + "," + (50) + ")")
      .style("stroke","red")
      .call(yAxis);

    g_tweets=svg_tweet.append("g");

    g_tweets=svg_tweet.selectAll(".counties") 
      .data(topojson.feature(usa_map, usa_map.objects.counties).features)
      .enter().append("path")
      .attr("class", "counties")
      .attr("fill", function(d) { 
        d.id=d.id.toString();
        if(d.id.length<5) {
          d.id='0'+ d.id.toString();
        }
        //county is not in our list
        if(tweets_map.keys().indexOf(d.id) < 0){
          //console.log(d.id);
          return "black";
        }
        //
        return color_tweets(+tweets_map.get(d.id)['20160601']); })
        .style("fill-opacity", function(d) { 
         if(tweets_map.keys().indexOf(d.id) < 0){
          //console.log(d.id);
          return 0;
        }else{
          return 0.5;
        }
      })
      .attr("d", path);

    svg_tweet.append("path")
        .datum(topojson.mesh(usa_map, usa_map.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("d", path);



      //   //MAPBOX GL MAKES IT INTERACTIVE'
      function update() {
          d3Projection = getD3();
          path.projection(d3Projection);
          svg_tweet.selectAll("path").attr("d", path);
      }

      
      map.on("viewreset", update);
      map.on("movestart", function(){
        svg_tweet.classed("hidden", true);
      }); 
      map.on("rotate", function(){
        svg_tweet.classed("hidden", true);
      }); 
      map.on("moveend", function(){
        update()
        svg_tweet.classed("hidden", false);
      });

      //map.resize();
      update()

};





