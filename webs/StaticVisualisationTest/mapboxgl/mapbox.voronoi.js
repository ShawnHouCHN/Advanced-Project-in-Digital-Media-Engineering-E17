    mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhd25ob3VjaG4iLCJhIjoiY2o3Zjk0ZHFnMGFzazMzdDVrbmNpZHRtdSJ9.DSIktmYLgaYD8bktKOMv1A'
        
    //Setup mapbox-gl map
    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/dark-v9',
        center: [-96, 38.3],
        zoom: 3,  
    });
    
    map.addControl(new mapboxgl.NavigationControl());


    var container = map.getCanvasContainer();

    function getD3() {
      var bbox = document.getElementById("map").getBoundingClientRect();
      var center = map.getCenter();
      var zoom = map.getZoom();
      // 512 is hardcoded tile size, might need to be 256 or changed to suit your map config
      var scale = (512) * 0.5 / Math.PI * Math.pow(2, zoom);

      var d3projection = d3.geoMercator()
        .center([center.lng, center.lat])
        .translate([bbox.width/2, bbox.height/2])
        .scale(scale).precision(0.01);

      return d3projection;
    }


    // var projection = d3.geoMercator()
    //     .scale(850)
    //     .translate([width/2,height/2])
    //     .center([-106, 37.5])
    //     .precision(0.01);
    var d3Projection = getD3();

    var path = d3.geoPath()
        .projection(getD3())
        .pointRadius(0.5);


    var svg = d3.select(container).append("svg")
         .attr("width", window.innerWidth)
         .attr("height", window.innerHeight);



    d3.queue()
        .defer(d3.json, "./us-10m.json")
        .defer(d3.csv, "./stations_meta.csv")
        .defer(d3.csv, "./stations_values.csv")
        .await(ready);


    function ready(error, us, wstations, drecords) {
      if (error) {
        console.log(error);
      }

      var max_tem = d3.max(drecords, function(d) { return +d['20170601']; });
      var min_tem = d3.min(drecords, function(d) { return +d['20170601']; });

      var color = d3.scaleLinear().domain([min_tem, max_tem]).interpolate(d3.interpolateHcl).range(["#fcfcde","#f20c0e"]);

      var defs = svg.append("defs");
      defs.append("path")
          .datum(topojson.feature(us, us.objects.land))
          .attr("id", "land")
          .style("opacity", .1)
          .attr("d", path);

      defs.append("clipPath")
          .attr("id", "clip")
        .append("use")
          .attr("xlink:href", "#land");

      svg.append("use")
          .attr("xlink:href", "#land")
          .attr("class", "land");

      var coordinates = wstations.map(function(d) { return [+d.LON, +d.LAT]; });

      var voronoi = geoVoronoi(coordinates, geoDelaunay(coordinates)).geometries;

      var g = svg.append("g").attr("clip-path", "url(#clip)");
      g.selectAll(".voronoi")
          .data(voronoi)
          .enter().append("path")
          .attr("class", "voronoi")
          .style("fill", function(d, i) { return color(drecords[i]['20170601']) ; })
          .style("fill-opacity", .5)
          .attr("d", path)
          .append("title")
          .text(function(_, i) {
            var d = wstations[i];
            return d.NAME;
          });

      g.append("path")
          .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
          .attr("class", "states")
          .attr("d", path);

      g.selectAll(".voronoi-border")
          .data(voronoi.map(function(cell) {
            return {type: "LineString", coordinates: cell.coordinates[0]};
          }))
          .enter().append("path")
          .attr("class", "voronoi-border")
          .attr("d", path);

      // svg.append("path")
      //     .datum({type: "MultiPoint", coordinates: coordinates})
      //     .attr("class", "points")
      //     .attr("d", path);



    //   //MAPBOX GL MAKES IT INTERACTIVE'
    function update() {
        d3Projection = getD3();
        path.projection(d3Projection);
        svg.selectAll("path").attr("d", path);
    }

    
    map.on("viewreset", update);
    map.on("movestart", function(){
      svg.classed("hidden", true);
    }); 
    map.on("rotate", function(){
      svg.classed("hidden", true);
    }); 
    map.on("moveend", function(){
      update()
      svg.classed("hidden", false);
    });

    //map.resize();
    update()

    }
