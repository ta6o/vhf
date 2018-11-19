var tx, tl, sl;
var ft = "";

navgrad = " background: #2196f3; background: -moz-linear-gradient(left, #2196f3 0%, #2196f3 50%, #4caf50 50%, #4caf50 100%); background: -webkit-linear-gradient(left, #2196f3 0%,#2196f3 50%,#4caf50 50%,#4caf50 100%); background: linear-gradient(to right, #2196f3 0%,#2196f3 50%,#4caf50 50%,#4caf50 100%); filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#2196f3', endColorstr='#4caf50',GradientType=1 ); background-repeat: no-repeat; background-size: 200% 100%; background-position: right 0% top 0%; transition-property: background-position; transition-delay: 0s; transition-timing-function: linear;"
navgrad = " background: #4caf50; background: -moz-linear-gradient(left, #4caf50 0%, #4caf50 50%, #2196f3 50%, #2196f3 100%); background: -webkit-linear-gradient(left, #4caf50 0%,#4caf50 50%,#2196f3 50%,#2196f3 100%); background: linear-gradient(to right, #4caf50 0%,#4caf50 50%,#2196f3 50%,#2196f3 100%); filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4caf50', endColorstr='#2196f3',GradientType=1 ); background-repeat: no-repeat; background-size: 200% 100%; background-position: right 0% top 0%; transition-property: background-position; transition-delay: 0s; transition-timing-function: linear;"

function prepRx(data) {
  var rx = []
  $.each(data, function(i,e) {
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
      if ( c <= 28 || ( c >= 60 && c <= 88)) {
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
        rx.push(d)
      }
    }
  });
  return rx
}


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
        $("nav").prop("active",false);
        $("nav").addClass("blue");
        $("nav").css("cssText","");
        $("rect.interval").removeClass("play");
        ft = ""
        $("small.info").html(x)
      }
      $("nav").removeClass("blue");
			source.start(0);
    }, onError);
  }
  request.send();
}

function onError() {
}

$("#chart").on("mouseover","rect.interval",function(){
  if (ft == "") {
    x = " "
    x += $(this).data("fn").split("_")[0]
    x += " MHz on "
    a = String(new Date(parseInt($(this).data("fn").split("_")[1].split(".")[0]))).split(" ")
    a.splice(3,1)
    x += [a[0]+",",a[1],a[2],a[3]].join(" ")
    x += " LT <span>"+String($(this).data("d")/1000)+"s</span>"
    $("small.info").html(x)
  }
})

$("#chart").on("mouseout","rect.interval",function(){
  $("small.info").html(ft)
})

$("#chart").on("click","rect.interval",function(){

  $("rect.interval").removeClass("play");
  $(this).addClass("play");

        $("nav").prop("active",false);
        $("nav").addClass("blue");
        $("nav").css("cssText","");
        ft = ""
        $("small.info").html(ft)
  
  ft = " "
  ft += $(this).data("fn").split("_")[0]
  ft += " MHz on "
  a = String(new Date(parseInt($(this).data("fn").split("_")[1].split(".")[0]))).split(" ")
  a.splice(3,1)
  ft += [a[0]+",",a[1],a[2],a[3]].join(" ")
  ft += " LT <span>"+String($(this).data("d")/1000)+"s</span>"
  $("small.info").html(ft);

  $("nav").css("cssText",navgrad);
  $("nav").css("transition-duration",($(this).data("d")/1000)+"s");
  $("nav").prop("active",true)
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
  $.getJSON("/txs/data.json",function(data) {
      rx = prepRx(Object.values(data));
    $("#chart").html("");
    $("#chart").css("height", 0);
    $("#chart").css("height", $("main").height() - 12);
    $("#gain").css("height", $("main").height() - 32);
    setSlider();
    tl = new TimelineChart($("#chart")[0], rx, {
      enableLiveTimer: false,
      hideGroupLabels: true
    }).onVizChange(e => setst(e));
  })
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

