recordings = []

$.each($data, function(i,e) {
  if (e.data.length > 0) {
    d = {"label":e.label,"data":[]};
    $.each(e.data,function(ii,ee){
      d.data.push({
        label: "",
        type: TimelineChart.TYPE.INTERVAL,
        from: new Date(ee.t),
        to: new Date(ee.t + ee.d),
        fn: e.label + "_" + String(ee.t) + ".wav"
      });
    });
    recordings.push(d)
  }
});



var tx, tl, st;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext(gain:6);

function playSound(buffer) {
  var source = context.createBufferSource(); // creates a sound source
  source.buffer = buffer;                    // tell the source which sound to play
  source.connect(context.destination);       // connect the source to the context's destination (the speakers)
  source.start(0);                           // play the source now
}

$("#chart").on("click","rect.interval",function(){
	console.log($(this).data("fn"))

	playSound("/txs/"+$(this).data("fn");

  /*if (typeof tx != "undefined") {
    tx.src = "/txs/"+$(this).data("fn");
    tx.currentTime = 0;
    tx.play();
  } else {
    tx = new Audio("/txs/"+$(this).data("fn"));
    tx.volume = 1;
    tx.play();
  }*/
})

function setst(e) {st = e}

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
		hideGroupLabels: true
  }).onVizChange(e => setst(e));
}


$(window).on("resize",function(){ window.setTimeout(1000,reset()) });
reset()

