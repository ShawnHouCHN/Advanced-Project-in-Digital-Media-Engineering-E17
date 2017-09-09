
    var width = 1260,
        height = 700;

    var projection = d3.geoMercator()
        .rotate([100, 0])
        .center([5, 37.7])
        .scale(800);

    var svg = d3.select("#usa-map").append("svg")
        .attr("width", width)
        .attr("height", height);
    
    var g = svg.append("g")
        .attr("clip-path", "url(#myClip)")

    var voronoi = d3.voronoi().size([width, height]),
        voronoiData = voronoi(stateData.map(function(d) {return projection(d.capital);})).polygons();

    stateData.forEach(function(d, i) {
        d.vorShape = []
        for (n=0; n<voronoiData[i].length; n++) {d.vorShape.push(voronoiData[i][n])}
        d.projected = d.geometry.coordinates[0].map(projection) 
    })

    var clip = svg.append("clipPath")
        .attr("id", "myClip")
        .selectAll("path")
        .data(stateData)
        .enter().append("path")
        .attr("d", function(d) {return "M" + d.projected});    

    var states = g.selectAll("g")
        .data(stateData)
        .enter().append("g")
        .attr("id", function(d) {return d.name})



        
    states.each(function(p) {
        const ihsl = d3.interpolateHslLong('#ccc', 'green');
         
        d3.select(this).append("polygon")
                .attr("points", shapeTweenSides(p.projected, p.vorShape, true))
                .style('fill', ihsl(.25))
                .style('stroke', 'white')
                .style('stroke-width', '2px')

        d3.select(this).append("circle")
            .attr("cx", projection(p.capital)[0])
            .attr("cy", projection(p.capital)[1])
            .attr("r", 2);

       

    })

    