
data = [{
		label: 'Name',
		data: [{
				type: TimelineChart.TYPE.POINT,
				at: new Date([2015, 1, 1])
		}, {
				type: TimelineChart.TYPE.POINT,
				at: new Date([2015, 2, 1])
		}, {
				type: TimelineChart.TYPE.POINT,
				at: new Date([2015, 3, 1])
		}, {
				type: TimelineChart.TYPE.POINT,
				at: new Date([2015, 4, 1])
		}, {
				type: TimelineChart.TYPE.POINT,
				at: new Date([2015, 5, 1])
		}, {
				type: TimelineChart.TYPE.POINT,
				at: new Date([2015, 6, 1])
		}]
}, {
		label: 'Type',
		data: [{
				type: TimelineChart.TYPE.POINT,
				at: new Date([2015, 1, 11])
		}, {
				type: TimelineChart.TYPE.POINT,
				at: new Date([2015, 1, 15])
		}, {
				type: TimelineChart.TYPE.POINT,
				at: new Date([2015, 3, 10])
		}, {
				label: 'I\'m a label',
				type: TimelineChart.TYPE.INTERVAL,
				from: new Date([2015, 2, 1]),
				to: new Date([2015, 3, 1])
		}, {
				type: TimelineChart.TYPE.POINT,
				at: new Date([2015, 6, 1])
		}, {
				type: TimelineChart.TYPE.POINT,
				at: new Date([2015, 7, 1])
		}]
}, {
		label: 'Imp',
		data: [{
				label: 'Label 1',
				type: TimelineChart.TYPE.INTERVAL,
				from: new Date([2015, 1, 15]),
				to: new Date([2015, 3, 1])
		}, {
				label: 'Label 2',
				type: TimelineChart.TYPE.INTERVAL,
				from: new Date([2015, 4, 1]),
				to: new Date([2015, 5, 12])
		}]
}];


recordings = []

$.each($data, function(i,e) {
  if (e.data.length > 0) {
    d = {"label":e.label,"data":[]};
    $.each(e.data,function(ii,ee){
      d.data.push({
        label: "",
        type: TimelineChart.TYPE.INTERVAL,
        from: new Date(ee.t*1000),
        to: new Date(ee.t*1000 + ee.d),
        fn: e.label + "_" + String(ee.t) + ".wav"
      });
    });
    recordings.push(d)
  }
});



var tx, tl;
$("#chart").on("click","rect.interval",function(){
	console.log($(this).data("fn"))
	tx = new Audio("/txs/"+$(this).data("fn"));
	tx.play();
})

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function reset() {
	$("#chart").html("");
	$("#chart").css("height", 0);
	$("#chart").css("height", $("main").height() - 12);
	tl = new TimelineChart($("#chart")[0], recordings, {
		enableLiveTimer: true,
		timerTickInterval: 1000,
		hideGroupLabels: false
	}).onVizChange(e => console.log(e));
}


$(window).on("resize",function(){ window.setTimeout(1000,reset()) });
reset()

