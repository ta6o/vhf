var tx, tl, sl, rxs, state;
var ft = "";

navgrad = " background: #2196f3; background: -moz-linear-gradient(left, #2196f3 0%, #2196f3 50%, #4caf50 50%, #4caf50 100%); background: -webkit-linear-gradient(left, #2196f3 0%,#2196f3 50%,#4caf50 50%,#4caf50 100%); background: linear-gradient(to right, #2196f3 0%,#2196f3 50%,#4caf50 50%,#4caf50 100%); filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#2196f3', endColorstr='#4caf50',GradientType=1 ); background-repeat: no-repeat; background-size: 200% 100%; background-position: right 0% top 0%; transition-property: background-position; transition-delay: 0s; transition-timing-function: linear;"
navgrad = " background: #4caf50; background: -moz-linear-gradient(left, #4caf50 0%, #4caf50 50%, #2196f3 50%, #2196f3 100%); background: -webkit-linear-gradient(left, #4caf50 0%,#4caf50 50%,#2196f3 50%,#2196f3 100%); background: linear-gradient(to right, #4caf50 0%,#4caf50 50%,#2196f3 50%,#2196f3 100%); filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4caf50', endColorstr='#2196f3',GradientType=1 ); background-repeat: no-repeat; background-size: 200% 100%; background-position: right 0% top 0%; transition-property: background-position; transition-delay: 0s; transition-timing-function: linear;"

$(document).ready(function(){
  
  function dec2dms(D, lng){
    D = parseFloat(D);
    dir = (D<0?lng?'W':'S':lng?'E':'N');
    return (0|(D<0?D=-D:D))+"°"+ (0|D%1*60)+"'"+ ((0|D*60%1*6000)/100)+"\""+ dir;
  }

  function freq2chnl (f) {
    f = parseInt(parseFloat(f)*1000)
    if ( f % 50 == 0 ) {
      c = 0;
      f -= 156000
    } else {
      c = 60;
      f -= 156025
    }
    c += f / 50
    return c
  }

  function chnl2freq (c) {
    if ( c >= 60 ) {
      c -= 60;
      f = 156000
    } else {
      f = 156025
    }
    f += c * 50
    return f
  }


  function prepRx(data) {
    rx = []
    $.each(data, function(i,e) {
      if (e.data.length > 0) {
        c = freq2chnl(e.label)
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

  function stopPlaying() {
    context.close();
    $("nav").prop("disabled",false);
    $("nav").addClass("blue");
    $("nav").css("cssText","");
    $("rect.interval").removeClass("play");
    ft = ""
    $("small.info").html(x)
  }

  function playSound(url) {
    context.close();
    context = new AudioContext();
    gainNode = context.createGain();
    gainNode.gain.value = parseFloat(localStorage.gain) || 1.6;
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
          $("nav").prop("disabled",false);
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

  $("body").on("contextmenu",function(e){
    e.preventDefault();
  });

  $("#chart").on("contextmenu","rect.interval",function(e){
    e.preventDefault();
    ln = " "
    ln += $(this).data("fn").split("_")[0]
    ln += " MHz on "
    a = String(new Date(parseInt($(this).data("fn").split("_")[1].split(".")[0]))).split(" ")
    a.splice(3,1)
    ln += [a[0]+",",a[1],a[2],a[3]].join(" ")
    ln += " LT <span>"+String($(this).data("d")/1000)+"s</span>"
    ts = $(this).data("fn").split("_")[1].split(".")[0].substr(0,10)
    ln = ln.split(" on ")
    ago = Math.floor((new Date() - new Date(ts * 1000)) / (60 * 1000))
    days = Math.floor(ago / (60 * 24))
    ago %= (60*24)
    hrs = Math.floor(ago / (60))
    ago %= (60)
    mins = Math.floor(ago)
    ago = "";
    ago += days > 0 ? days+" days, " : ""
    ago += hrs > 0 ? hrs+" hours, " : ""
    ago += mins > 0 ? mins+" minutes ago" : ""
    if (ago.length == 0) ago = "just now"
    html = "<h5>Channel "+freq2chnl(ln[0])+" <small style='font-weight: normal;'>("+ln[0]+" )</small></h5>";
    html += "<p><b>"+ln[1].split("LT")[0]+"LT</b> ("+ago+")<br/>"
    html += "Duration:<b>"+ln[1].split("LT")[1]+"</b><br/>"
    stopPlaying();
    $.getJSON("/loginfo/"+ts,function(data){
        console.log(data)
      html += "Recorded at: ";
      html += " <b>"+dec2dms(data[1],false)+"</b>, ";
      html += "<b>"+dec2dms(data[2],true)+"</b></p>"
      $(".modal .modal-content").html(html)
      $(".modal").modal("open")
    })
  })

  $("a#update").on("click",function(){
    $.getJSON("/update",function(data){
      console.log(data)
      if (data[0] > 0) {
        reset();
      }
    })
  })

  $("#chart").on("click","rect.interval",function(e){

    if (e.detail == 1 && ft.length == 0) {
      $("rect.interval").removeClass("play");
      $(this).addClass("play");

            $("nav").prop("disabled",false);
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
      $("nav").prop("disabled",true)
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

    } else if ( e.detail == 2 ) {
      e.preventDefault();
      ts = $(this).data("fn").split("_")[1].split(".")[0].substr(0,10)
      ln = ft.split(" on ")
      ago = Math.floor((new Date() - new Date(ts * 1000)) / (60 * 1000))
      console.log(ago)
      days = Math.floor(ago / (60 * 24))
      ago %= (60*24)
      console.log(ago)
      hrs = Math.floor(ago / (60))
      ago %= (60)
      mins = Math.floor(ago)
      ago = "";
      ago += days > 0 ? days+" days, " : ""
      ago += hrs > 0 ? hrs+" hours, " : ""
      ago += mins > 0 ? mins+" minutes ago" : ""
      if (ago.length == 0) ago = "just now"
      html = "<h5>Channel "+freq2chnl(ln[0])+" <small style='font-weight: normal;'>("+ln[0]+" )</small></h5>";
      html += "<p><b>"+ln[1].split("LT")[0]+"LT</b> ("+ago+")<br/>"
      html += "Duration:<b>"+ln[1].split("LT")[1]+"</b><br/>"
      stopPlaying();
      $.getJSON("/loginfo/"+ts,function(data){
          console.log(data)
        html += "Recorded at: ";
        html += " <b>"+dec2dms(data[1],false)+"</b>, ";
        html += "<b>"+dec2dms(data[2],true)+"</b></p>"
        $(".modal .modal-content").html(html)
        $(".modal").modal("open")
      })
    }
  })


  function setst(e) {
    state = e;
    localStorage.setItem('state', JSON.stringify(e));
  }

  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  function reset() {
    state = JSON.parse(localStorage.state || "{}");
    $.getJSON("/txs/data.json",function(data) {
      rxs = prepRx(Object.values(data));
      $("#chart").html("");
      $("#chart").css("height", 0);
      $("#chart").css("height", $("main").height() - 12);
      $("#gain").css("height", $("main").height() - 32);
      setSlider();
      tl = new TimelineChart($("#chart")[0], rxs, {
        enableLiveTimer: false,
        haideGroupLabels: true
      }).onVizChange(e => setst(e)).setState(state,rxs);
      d3.select("svg").on("dblclick.zoom", null);
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
  $('.modal').modal();

  reset();

})
