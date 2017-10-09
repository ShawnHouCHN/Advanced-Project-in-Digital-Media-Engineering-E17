
var startDate = "20160101", endDate = "20161231";
// $(function() {
//     $('input[name="daterange"]').daterangepicker(function(start, end, label) {

//          alert(start);
//     });
// });

function time_update_voro(date) {
  var t = d3.transition().duration(1000);

  g_voro.selectAll(".voronoi").data(voronoi).transition(t)        // apply a transition
        .style("fill", function(d, i) { return color_voro(tmax_data_voro[i][date]);
        });

};

function time_update_choro(date) {

  if(typeof(county_map.get('01001')[date]) === 'undefined'){
           console.log('END');
           return 0;
  }

  var t = d3.transition().duration(1000);
  $(".clock").html(date);
  svg_chor.selectAll(".counties").transition(t).filter(function(d) {
        var prev_tem = parseInt(d3.select(this).select("title").text());
          d.id=d.id.toString(); 
          if(d.id.length<5) {
            d.id='0'+ d.id.toString();
          }
          return (county_map.keys().indexOf(d.id) > 0 && Math.abs(prev_tem * 10 - +county_map.get(d.id)[date])/10 > 5);
        })
        .attr("fill", function(d, i) { 
          return color_chro(+county_map.get(d.id)[date]);
        })
        .delay(750)
        .on("end", function(){ 
          var y = date.toString().substr(0,4),m = date.toString().substr(4,2), d = date.toString().substr(6,2);
          var curr_date = new Date(y,m-1,d);
          var tom_date = new Date(curr_date.getTime() + (24 * 60 * 60 * 1000));
          //console.log(tom_date);
          time_update_choro(tom_date.toISOString().slice(0,10).replace(/-/g,""));
        });
}

function replay() {

  if ($('.search').find(":selected").val()=="Voronoi"){
    tmax_data_voro.columns.forEach(function(date, index){
     setTimeout(function(){
        time_update_voro(date);

        $(".clock").html(date);

      }, index * 1400);
    });
  }



  else if($('.search').find(":selected").val()=="Choropleth"){

      //tmax_data_chro.columns.forEach(function(date, index){
      //  d3.timer(function(){


          time_update_choro(startDate);

          //$(".clock").html(date);

       // }, index * 1400);
      //});    
  }
}



$(document).ready(function() {

  d3.select("#choropleth").attr('visibility','hidden');
  $('.search').val('Voronoi');

  $(".button").click(function(){
        
       replay();

    });

});

$('.search').dropdown({
 onChange: function(val) {
    if (val=="Voronoi"){
       d3.select("#choropleth").attr('visibility','hidden');
       d3.select("#voronoi").attr('visibility','visible');
    }else{
       d3.select("#choropleth").attr('visibility','visible');
       d3.select("#voronoi").attr('visibility','hidden');      
    }
 }
});