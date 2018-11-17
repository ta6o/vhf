recordings = []

$.each($data, function(i,e) {
  if (e.data.length > 0) {
    f = parseInt(parseFloat(e.label) * 1000)
    if ( f % 50 == 0 ) {
      c = 0;
      f -= 156000
    } else {
      c = 60;
      f -= 156025
    }
    c += f / 50
    if ( c <= 28 || c >= 60) {
      d = {"label":String(c),"data":[]};
      $.each(e.data,function(ii,ee){
        d.data.push({
          label: "",
          type: TimelineChart.TYPE.INTERVAL,
          from: new Date(ee.t),
          to: new Date(ee.t + ee.d),
          d: ee.d,
          fn: e.label + "_" + String(ee.t) + ".wav"
        });
      });
      recordings.push(d)
    }
  }
});



var tx, tl, sl;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var gainNode = context.createGain();

function playSound(url) {
  context.close();
  context = new AudioContext();
  gainNode = context.createGain();
  gainNode.gain.value = localStorage.gain || 1.6;
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  console.log(url)

  request.onload = function(x) {
    context.decodeAudioData(request.response, function(buffer) {
			var source = context.createBufferSource();
			source.buffer = buffer;
			source.connect(gainNode);
			gainNode.connect(context.destination);
      source.onended = function() {
        $("rect.interval").removeClass("play");
      }
			source.start(0);
    }, onError);
  }
  request.send();
}

function onError() {
}

$("#chart").on("mouseover","rect.interval",function(){
  x = " "
  x += $(this).data("fn").split("_")[0]
  x += " MHz on "
  a = String(new Date(parseInt($(this).data("fn").split("_")[1].split(".")[0]))).split(" ")
  a.splice(3,1)
  x += [a[0]+",",a[1],a[2],a[3]].join(" ")
  x += " LT, "+String($(this).data("d")/1000)+"s"
  $("small.info").text(x)
})

$("#chart").on("mouseout","rect.interval",function(){
  $("small.info").text("")
})

$("#chart").on("click","rect.interval",function(){
  $("rect.interval").removeClass("play");
  $(this).addClass("play");
  /*play = $(this).clone().addClass("play").insertAfter($(this));
  width = play.attr("width")
  animation = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
  animation.setAttributeNS(null, 'id', 'play');
  animation.setAttributeNS(null, 'attributeName', 'width');
  animation.setAttributeNS(null, 'from', 0);
  animation.setAttributeNS(null, 'to', width);
  animation.setAttributeNS(null, 'dur', String(play.data("d")/1000)+"s");
  animation.setAttributeNS(null, 'fill', 'freeze');
  play.append(animation)
  console.log(String(play.data("d")/1000)+"s")
  $("#play")[0].beginElement()*/
  //console.log(width)
  //play.css("transition","transform "+play.data("d") / 1000 + "s linear 0");
  //play.attr("width",width);
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

