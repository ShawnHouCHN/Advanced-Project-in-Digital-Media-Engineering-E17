
var startDate = "20160101", endDate = "20161231";
// $(function() {
//     $('input[name="daterange"]').daterangepicker(function(start, end, label) {

//          alert(start);
//     });
// });

function time_update(date) {
  var t = d3.transition().duration(1000);

  g.selectAll(".voronoi").data(voronoi)
        .transition(t)        // apply a transition
        .style("fill", function(d, i) { return color(tmax_data[i][date]);
        });



};

function replay(data) {

  tmax_data.columns.forEach(function(date, index){
    setTimeout(function(){
      time_update(date);
      console.log(date);

      $(".clock").html(date);

    }, index * 1400);
  });
}



$(document).ready(function() {

  $('.search').val('Voronoi');

  $(".button").click(function(){
        
       replay(tmax_data);

        

    });

});