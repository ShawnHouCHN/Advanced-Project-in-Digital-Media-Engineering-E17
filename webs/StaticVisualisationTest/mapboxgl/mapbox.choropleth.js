
    var county_map = d3.map();

    var d3Projection = getD3();

    var path = d3.geoPath()
        .projection(getD3())
        .pointRadius(0.5);

    var svg_chor = d3.select(container).append("svg")
         .attr("id", "choropleth")
         .attr("width", window.innerWidth)
         .attr("height", window.innerHeight);

    d3.queue()
        .defer(d3.json, "mapboxgl/data/us-10m.json")
        .defer(d3.csv, "mapboxgl/data/county_values.csv", function(d) { county_map.set(d.FIPS, d); })
        .await(ready);

    var tmax_data_chro, choropleth, color_chro, g_chro;

    function ready(error, us, crecords) {
      if (error) {
        console.log(error);
      }

      tmax_data_chro=crecords;
      choropleth=topojson.feature(us, us.objects.counties).features;

      var max_tem = d3.max(crecords, function(d) { return +d['20160601']; });
      var min_tem = d3.min(crecords, function(d) { return +d['20160601']; });
      

      color_chro = d3.scaleLinear().domain([-200, 0, 400]).interpolate(d3.interpolateHcl).range(["#355ae0","#fcf4d9","#f20c0e"]).clamp(true);


      var defs = svg_chor.append("defs");

      var linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");
      var legendWidth=20, legendHeight=200;
      linearGradient.attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
      //Set the color for the start (0%)
      linearGradient.append("stop").attr("offset", "0%").attr("stop-color", "#355ae0"); //light blue
      linearGradient.append("stop").attr("offset", "40%").attr("stop-color", "#fcf4d9"); //light blue
      linearGradient.append("stop").attr("offset", "100%").attr("stop-color", "#f20c0e"); //dark blue

      var legendsvg = svg_chor.append("g").attr("class", "legendWrapper")
      legendsvg.append("rect")
      .attr("class", "legendRect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#linear-gradient)")
      .attr("transform", "translate(" + (window.innerWidth - 40) + "," + (50) + ")");


      var yScale = d3.scaleLinear()
         .range([0, legendHeight])
         .domain([-40,60]);
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

      g_chro=svg_chor.append("g");

      g_chro.selectAll(".counties") 
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("class", "counties")
        .attr("fill", function(d) { 
          d.id=d.id.toString();
          if(d.id.length<5) {
            d.id='0'+ d.id.toString();
          }
          //county is not in our list
          if(county_map.keys().indexOf(d.id) < 0){
            //console.log(d.id);
            return "black";
          }
          //
          return color_chro(+county_map.get(d.id)['20160601']); })
        .style("fill-opacity", function(d) { 
           if(county_map.keys().indexOf(d.id) < 0){
            //console.log(d.id);
            return 0;
          }else{
            return 0.5;
          }
        })
        .attr("d", path)
        .append("title");

      svg_chor.append("path")
          .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
          .attr("class", "states")
          .attr("d", path);



        //   //MAPBOX GL MAKES IT INTERACTIVE'
        function update() {
            d3Projection = getD3();
            path.projection(d3Projection);
            svg_chor.selectAll("path").attr("d", path);
        }

        
        map.on("viewreset", update);
        map.on("movestart", function(){
          svg_chor.classed("hidden", true);
        }); 
        map.on("rotate", function(){
          svg_chor.classed("hidden", true);
        }); 
        map.on("moveend", function(){
          update()
          svg_chor.classed("hidden", false);
        });

        //map.resize();
        update()

    };





