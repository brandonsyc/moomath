window.onload = init;
var context;
var bufferLoader;

function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    
    var loader = this;
    
    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
                                       request.response,
                                       function(buffer) {
                                       if (!buffer) {
                                       alert('error decoding file data: ' + url);
                                       return;
                                       }
                                       loader.bufferList[index] = buffer;
                                       if (++loader.loadCount == loader.urlList.length)
                                       loader.onload(loader.bufferList);
                                       },
                                       function(error) {
                                       console.error('decodeAudioData error', error);
                                       }
                                       );
    }
    
    request.onerror = function() {
        alert('BufferLoader: XHR error');
    }
    
    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}

function init() {
    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    
    bufferLoader = new BufferLoader(
                                    context,
                                    [
                                     'https://nichodon.github.io/programs/0002/sounds/click1.wav',
                                     'https://nichodon.github.io/programs/0002/sounds/click2.wav',
                                     ],
                                    finishedLoading
                                    );
    
    bufferLoader.load();
}

var source1 = null;
var source2 = null;

var buffers = null;

var start = null;

function finishedLoading(bufferList) {
    // Create two sources and play them both together.
    source1 = context.createBufferSource();
    source2 = context.createBufferSource();
    source1.buffer = bufferList[0];
    source2.buffer = bufferList[1];
    
    source1.connect(context.destination);
    source2.connect(context.destination);
    source1.start(0);
    source2.start(0);
    
    buffers = bufferList;
    
    playBeat();
}

function playSound(buffer, time) {
    var source = context.createBufferSource();
    source.buffer = buffers[buffer];
    source.connect(context.destination);
    source.start(time);
}

function playMeasure(measure) {
    for (i = 0; i < 10; i++) {
        console.log("2");
        playSound(1,N+i/10.0);
    }
}

var N = 0;

function playBeat() {
    console.log("1");
    playMeasure(N);
    N += 1;
    setTimeout(playBeat, 900);
}
