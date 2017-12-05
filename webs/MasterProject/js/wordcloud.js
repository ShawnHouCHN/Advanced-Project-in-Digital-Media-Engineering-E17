var keywords_list = [{"name":"scalding","value":"hot"},{"name":"flaming","value":"hot"},{"name":"humid","value":"hot"},{"name":"hypothermic","value":"cold"},{"name":"shivering","value":"cold"},{"name":"scorched","value":"hot"},{"name":"nippy","value":"cold"},{"name":"balmy","value":"hot"},{"name":"steamy","value":"hot"},{"name":"frigorific","value":"cold"},{"name":"antarctic","value":"cold"},{"name":"wintry","value":"cold"},{"name":"ice-cold","value":"cold"},{"name":"shivery","value":"cold"},{"name":"sweltry","value":"hot"},{"name":"broiling","value":"hot"},{"name":"scorching","value":"hot"},{"name":"summery","value":"hot"},{"name":"icy-cold","value":"cold"},{"name":"siberian","value":"cold"},{"name":"arid","value":"hot"},{"name":"sweaty","value":"hot"},{"name":"tropical","value":"hot"},{"name":"hot","value":"hot"},{"name":"sweat-inducing","value":"hot"},{"name":"sweltering","value":"hot"},{"name":"bleak","value":"cold"},{"name":"ovenlike","value":"hot"},{"name":"stifling","value":"hot"},{"name":"glacial","value":"cold"},{"name":"heat-wave","value":"hot"},{"name":"steaming-hot","value":"hot"},{"name":"boiling-hot","value":"hot"},{"name":"baking-hot","value":"hot"},{"name":"afire","value":"hot"},{"name":"blistering","value":"hot"},{"name":"algid","value":"cold"},{"name":"chilled to the bone","value":"cold"},{"name":"snowy","value":"cold"},{"name":"white-hot","value":"hot"},{"name":"heatwave","value":"hot"},{"name":"arctic","value":"cold"},{"name":"blazing-hot","value":"hot"},{"name":"rimy","value":"cold"},{"name":"chilled-through","value":"cold"},{"name":"stinging-cold","value":"cold"},{"name":"freezing","value":"cold"},{"name":"warm","value":"hot"},{"name":"gelid","value":"cold"},{"name":"smoking","value":"hot"},{"name":"blizzardy","value":"cold"},{"name":"icy","value":"cold"},{"name":"conflagrant","value":"hot"},{"name":"sizzling","value":"hot"},{"name":"frozen-over","value":"cold"},{"name":"muggy","value":"hot"},{"name":"sub-zero","value":"cold"},{"name":"chilled","value":"cold"},{"name":"bitterly-cold","value":"cold"},{"name":"smoking-hot","value":"hot"},{"name":"frozen","value":"cold"},{"name":"torrid","value":"hot"},{"name":"blazing","value":"hot"},{"name":"red-hot","value":"hot"},{"name":"chilly","value":"cold"},{"name":"bitter-cold","value":"cold"},{"name":"parky","value":"cold"},{"name":"parching","value":"hot"},{"name":"numbing","value":"cold"},{"name":"numbing-cold","value":"cold"},{"name":"calescent","value":"hot"},{"name":"shiver-inducing","value":"cold"},{"name":"sultry","value":"hot"},{"name":"frosty","value":"cold"}];


d3.layout.cloud().size([500, 300])
            .words(keywords_list)
            .rotate(0)
            .fontSize(function(d) { return Math.floor(Math.random() * 16) + 5; })
            .on("end", draw)
            .start();

function draw(words) {
        d3.select("#wordcloud").append("svg")
                .attr("width", 800)
                .attr("height", 350)
                .attr("class", "wordcloud")
                .append("g")
                // without the transform, words words would get cutoff to the left and top, they would
                // appear outside of the SVG area
                .attr("transform", "translate(320,200)")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-family", "Georgia, Times, Times New Roman, serif;")
                .style("font-size", function(d) { return (Math.floor(Math.random() * 30) + 5) + "px"; })
                .style("fill", function(d, i) { 
                    if (d.value=="hot") return "#FF4500";
                    if (d.value=="cold") return "#0000CD"; })
                .style("fill-opacity", function(d,i) {return (1/keywords_list.length)*(keywords_list.length-i);})
                .style("font-weight", "bold")
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.name; });
};