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



var tx, tl, sl;
var gain = localStorage.gain || 1;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var gainNode = context.createGain();

function playSound(url) {
  context.close();
  context = new AudioContext();
  gainNode = context.createGain();
  gainNode.gain.value = gain;
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  console.log(url)

  request.onload = function(x) {
    context.decodeAudioData(request.response, function(buffer) {
			var source = context.createBufferSource();
      console.log(buffer.numberOfChannels)
			source.buffer = buffer;
			source.connect(gainNode);
			gainNode.connect(context.destination);
			source.start(0);
    }, onError);
  }
  request.send();
}

function onError() {
}

/*$("#chart").on("mouseover","rect.interval",function(){
	$(this).css("fill","#0c6")
})

$("#chart").on("mouseout","rect.interval",function(){
	$(this).css("fill","#000")
})*/

$("#chart").on("click","rect.interval",function(){
	console.log($(this).data("fn"))

	playSound("/txs/"+$(this).data("fn"));

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
	$("#gain").css("height", $("main").height() - 32);
  setSlider();
	tl = new TimelineChart($("#chart")[0], recordings, {
		enableLiveTimer: false,
		hideGroupLabels: true
  }).onVizChange(e => setst(e));
}

function setSlider(){
  $("#gain").html("");
  d3.select('#gain').call(
      sl = d3.slider()
      .value(10 - (localStorage.gain / 1.6 || 1))
      .orientation("vertical")
      .axis( d3.svg.axis().orient("right").ticks(10))
      .min(10).max(0).step(1)
			.on("slide", function(evt, value) {
        value = (10 - value) * 1.6;
				console.log(value);
				localStorage.gain = value;
			  gainNode.gain.value = localStorage.gain;
		})
	);
}

$(window).on("resize",function(){ window.setTimeout(1000,reset()) });
reset()

