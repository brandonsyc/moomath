"use strict";

var _get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);
  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);
    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;
    if (getter === undefined) {
      return undefined;
    }
    return getter.call(receiver);
  }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
  return typeof obj;
} : function(obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var _createClass = function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

(function(global, build) {
  global.METRO = {};

  build(global.METRO);
})(window, function(exports) {
  var getContext = function getContext() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    return new AudioContext();
  };

  var BufferLoader = function() {
    function BufferLoader(audioContext) {
      _classCallCheck(this, BufferLoader);

      this.context = audioContext;
      this.sources = [];
    }

    _createClass(BufferLoader, [{
      key: "addSource",
      value: function addSource(sources, call) {
        if (!call) {
          if (Array.isArray(sources)) {
            for (var i = 0; i < sources.length; i++) {
              this.sources.push(sources[i]);
            }
          } else {
            this.sources.push(sources);
          }
        } else {
          this.sources.push({
            url: sources,
            callback: call
          });
        }
      }
    }, {
      key: "sourcesLeft",
      value: function sourcesLeft() {
        return this.sourceCount > 0;
      }
    }, {
      key: "peekSource",
      value: function peekSource() {
        if (this.sourcesLeft()) {
          return this.sources[0];
        }
      }
    }, {
      key: "getSource",
      value: function getSource() {
        if (this.sourcesLeft()) {
          return this.sources.shift();
        }
      }
    }, {
      key: "loadSource",
      value: function loadSource() {
        if (!this.sourcesLeft()) {
          return;
        }

        var source = this.getSource();

        var request = new XMLHttpRequest();
        request.open("GET", source.url, true);
        request.responseType = "arraybuffer";

        var loader = this;

        request.onload = function() {
          loader.context.decodeAudioData(request.response, function(buffer) {
            if (!buffer) {
              throw new Error("Error decoding audio data.");
              return;
            }
            source.callback(buffer);
          }, function(error) {
            throw new Error("Error loading audio file.");
          });
        };

        request.onerror = function() {
          throw new Error("Could not connect to audio files.");
        };

        request.send();
      }
    }, {
      key: "loadAll",
      value: function loadAll() {
        while (this.sourcesLeft()) {
          this.loadSource();
        }
      }
    }, {
      key: "sourceCount",
      get: function get() {
        return this.sources.length;
      }
    }]);

    return BufferLoader;
  }();

  function extractFileName(url) {
    var name = url.substring(url.lastIndexOf('/') + 1);
    return name.substr(0, name.lastIndexOf('.')) || name;
  }

  var MetronomeAudioContext = function() {
    function MetronomeAudioContext() {
      _classCallCheck(this, MetronomeAudioContext);

      this.audioCtx = getContext();

      this.bufferLoader = new BufferLoader(this.audioCtx);
      this.samples = {};

      this.volumes = {};

      this.masterGainNode = this.createGain();
      this.masterGainNode.connect(this.destination);

      this.sampleCount = 0;
    }

    _createClass(MetronomeAudioContext, [{
      key: "createBufferSource",
      value: function createBufferSource() {
        return this.audioCtx.createBufferSource();
      }
    }, {
      key: "createGain",
      value: function createGain() {
        return this.audioCtx.createGain();
      }
    }, {
      key: "addSample",
      value: function addSample(url, name, _callback) {
        var that = this;
        name = name || extractFileName(url);
        _callback = _callback || function(name) {};

        this.samples[name] = {
          ready: false,
          buffer: null
        };
        this.bufferLoader.addSource({
          url: url,
          callback: function callback(buffer) {
            that.samples[name] = {
              ready: true,
              buffer: buffer
            };

            if (that.allSamplesReady() && that.onLoaded) that.onLoaded();
            _callback(name);
          }
        });
        this.bufferLoader.loadSource();
      }
    }, {
      key: "getVolumeNode",
      value: function getVolumeNode(vol) {
        var roundVol = parseInt(vol * 100) / 100;
        if (this.volumes[roundVol]) return this.volumes[roundVol];

        var newNode = this.createGain();
        newNode.connect(this.masterGainNode);

        newNode.gain.value = vol;
        this.volumes[roundVol] = newNode;

        return newNode;
      }
    }, {
      key: "allSamplesReady",
      value: function allSamplesReady() {
        for (var sample in this.samples) {
          if (!this.samples[sample].ready) return false;
        }
        return true;
      }
    }, {
      key: "getBuffer",
      value: function getBuffer(name) {
        return this.samples[name].buffer;
      }
    }, {
      key: "schedulePlay",
      value: function schedulePlay(name, time) {
        var isOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        if (modifiers === null || !((typeof modifiers === "undefined" ? "undefined" : _typeof(modifiers)) === 'object')) {
          modifiers = {};
        }
        modifiers.volume = modifiers.volume || 1;

        var source = this.createBufferSource();
        source.buffer = this.getBuffer(name);
        source.connect(this.getVolumeNode(modifiers.volume));

        source.start(time + (isOffset ? this.currentTime : 0));
        source.onended = markNodeFinishedConstructor(source, modifiers.onend);

        return source;
      }
    }, {
      key: "destination",
      get: function get() {
        return this.audioCtx.destination;
      }
    }, {
      key: "currentTime",
      get: function get() {
        return this.audioCtx.currentTime;
      }
    }]);

    return MetronomeAudioContext;
  }();

  function markNodeFinishedConstructor(node, other) {
    if (typeof other === "function") {
      return function() {
        node.finished = true;
        other();
      };
    } else {
      return function() {
        node.finished = true;
      };
    }
  }

  Array.prototype.removeIf = function(f) {
    for (var i = this.length - 1; i >= 0; i--) {
      if (f(this[i])) {
        this.splice(i, 1);
      }
    }
  };

  var MAXPLAYING = 500;
  var RESOLUTION = 1;

  var SchedulerContext = function() {
    function SchedulerContext(ctx) {
      _classCallCheck(this, SchedulerContext);

      this.audio = ctx || new MetronomeAudioContext();

      this.playing = [];
      this.referenceStart = this.audio.currentTime;
    }

    _createClass(SchedulerContext, [{
      key: "schedulePlay",
      value: function schedulePlay(name, time) {
        var modifiers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        this.playing.push(this.audio.schedulePlay(name, time + this.referenceStart, false, modifiers));

        if (this.playing.length > MAXPLAYING) {
          this.clearFinished();
          if (this.playing.length > MAXPLAYING) {
            this.stopAll();

            throw new Error("Maximum queued beats exceeded.");
          }
        }
      }
    }, {
      key: "play",
      value: function play(name) {
        var modifiers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        this.schedulePlay(name, 0, true, modifiers);
      }
    }, {
      key: "stopAll",
      value: function stopAll() {
        for (var i = 0; i < this.playing.length; i++) {
          this.playing[i].onended = null;
          this.playing[i].stop();
        }

        this._clearPlaying();
      }
    }, {
      key: "clearFinished",
      value: function clearFinished() {
        this.playing.removeIf(function(a) {
          return a.finished;
        });
      }
    }, {
      key: "_clearPlaying",
      value: function _clearPlaying() {
        this.playing = [];
      }
    }, {
      key: "setReference",
      value: function setReference(time) {
        var isOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        this.referenceStart = time + (isOffset ? this._currentTime : 0);
      }
    }, {
      key: "_currentTime",
      get: function get() {
        return this.audio.currentTime;
      }
    }]);

    return SchedulerContext;
  }();

  var BeatPlayer = function() {
    function BeatPlayer(beat, scheduler) {
      _classCallCheck(this, BeatPlayer);

      this.beat = beat;
      this.scheduler = scheduler;

      this.playing = false;
      this.R = {
        onstart: function onstart() {
          return;
        },
        onstop: function onstop() {
          return;
        },
        onallocate: function onallocate(x) {
          return;
        }
      };
    }

    _createClass(BeatPlayer, [{
      key: "start",
      value: function start() {
        if (this.playing) return;
        this.scheduler.setReference(0);

        this.beat.reset();
        this.R.onstart();
        this._allocateBeats();
        this.playing = true;
      }
    }, {
      key: "_allocateBeats",
      value: function _allocateBeats() {
        var _this = this;

        this.scheduler.clearFinished();

        var beats = this.beat.gobble(2 * RESOLUTION);
        var didDelegateRecall = false;

        for (var i = 0; i < beats.length; i++) {
          if (!didDelegateRecall && beats[i].time >= beats[0].time + 0.9 * RESOLUTION) {
            (function() {
              var that = _this;
              _this.scheduler.schedulePlay(beats[i].sound, beats[i].time, {
                onend: function onend() {
                  that._allocateBeats();
                },
                volume: beats[i].volume
              });
              didDelegateRecall = true;
            })();
          } else {
            this.scheduler.schedulePlay(beats[i].sound, beats[i].time, {
              volume: beats[i].volume
            });
          }
        }

        this.R.onallocate(beats);
      }
    }, {
      key: "stop",
      value: function stop() {
        this.scheduler.stopAll();
        this.playing = false;

        this.R.onstop();
      }
    }]);

    return BeatPlayer;
  }();

  var defaultBeatNameCount = 0;

  var Metronome = function() {
    function Metronome(context) {
      _classCallCheck(this, Metronome);

      this.audio = context || new MetronomeAudioContext();

      this.players = {};
      this.animator = null;
    }

    _createClass(Metronome, [{
      key: "playerExists",
      value: function playerExists(id) {
        return !!this.getPlayer(id);
      }
    }, {
      key: "setAnimator",
      value: function setAnimator(animator) {
        this.animator = animator;
      }
    }, {
      key: "getPlayer",
      value: function getPlayer(id) {
        return this.players[id];
      }
    }, {
      key: "addBeat",
      value: function addBeat(beat, id) {
        if (beat instanceof Beat) {
          if (!id) {
            id = '__' + defaultBeatNameCount;
            defaultBeatNameCount += 1;
          } else {
            id = id;
          }

          var scheduler = new SchedulerContext(this.audio);
          var player = new BeatPlayer(beat, scheduler);
          this.players[id] = player;
        }
      }
    }, {
      key: "stopPlayer",
      value: function stopPlayer(id) {
        this.getPlayer(id).stop();
      }
    }, {
      key: "startPlayer",
      value: function startPlayer(id) {
        this.getPlayer(id).start();
      }
    }, {
      key: "destroyPlayer",
      value: function destroyPlayer(id) {
        this.players[id] = undefined;
      }
    }, {
      key: "startAll",
      value: function startAll() {
        var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        if (delay == 0) {
          for (var id in this.players) {
            this.startPlayer(id);
          }
        } else {
          var that = this;
          return setTimeout(function() {
            that.startAll(0);
          }, delay * 1000);
        }
      }
    }, {
      key: "stopAll",
      value: function stopAll() {
        for (var id in this.players) {
          this.stopPlayer(id);
        }
      }
    }, {
      key: "mute",
      value: function mute() {
        this.volume = 0;
      }
    }, {
      key: "addSample",
      value: function addSample(name, url, callback) {
        this.audio.addSample(name, url, callback);
      }
    }, {
      key: "volume",
      set: function set(vol) {
        this.audio.masterGainNode.gain.value = vol;
      },
      get: function get() {
        return this.audio.masterGainNode.gain.value;
      }
    }]);

    return Metronome;
  }();

  var Beat = function() {
    function Beat() {
      _classCallCheck(this, Beat);

      // Every beat inherits from this

      this.lastBeatTime = 0;
    }

    _createClass(Beat, [{
      key: "gobble",
      value: function gobble(time) {
        var beats = [];
        var nextBeat = {
          time: 0
        };

        while (this.lastBeatTime > nextBeat.time - time) {
          nextBeat = this.next();
          if (!nextBeat) break;
          beats.push(Object.assign({}, nextBeat));
        }

        this.lastBeatTime = nextBeat.time;

        return beats;
      }
    }, {
      key: "gobbleMeasure",
      value: function gobbleMeasure() {
        var max = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 500;

        var beats = [];
        var nextBeat = {
          time: 0
        };

        do {
          nextBeat = this.next();
          beats.push(Object.assign({}, nextBeat));
        } while (!nextBeat.startMeasure && beats.length < 500);

        this.lastBeatTime = nextBeat.time;

        return beats;
      }
    }, {
      key: "_reset",
      value: function _reset() {
        this.lastBeatTime = 0;
      }
    }]);

    return Beat;
  }();

  function BPMFromInteronset(interonset) {
    return 60 / interonset;
  }

  function BPSFromInteronset(interonset) {
    return 1 / interonset;
  }

  function interonsetFromBPM(bpm) {
    return 60 / bpm;
  }

  function interonsetFromBPS(bps) {
    return 1 / bps;
  }

  function updateFrequencyFromBPM(bpm) {
    return Math.round(Math.max(RESOLUTION / interonsetFromBPM(bpm), 1));
  }

  function updateFrequencyFromBPS(bps) {
    return Math.round(Math.max(RESOLUTION / interonsetFromBPS(bps), 1));
  }

  var ConstantBeat = function(_Beat) {
    _inherits(ConstantBeat, _Beat);

    function ConstantBeat(config) {
      _classCallCheck(this, ConstantBeat);

      var _this2 = _possibleConstructorReturn(this, (ConstantBeat.__proto__ || Object.getPrototypeOf(ConstantBeat)).call(this));

      config = config || {};

      if (config.bpm !== undefined) {
        config.interonset = interonsetFromBPM(config.bpm);
      } else if (config.bps !== undefined) {
        config.interonset = interonsetFromBPS(config.bps);
      }

      _this2.sound = config.sound;

      _this2.interonset = config.interonset || 0.5;
      _this2.volume = config.volume || 1;

      _this2.count = 0;
      return _this2;
    }

    _createClass(ConstantBeat, [{
      key: "reset",
      value: function reset() {
        _get(ConstantBeat.prototype.__proto__ || Object.getPrototypeOf(ConstantBeat.prototype), "_reset", this).call(this);
        this.count = 0;
      }
    }, {
      key: "next",
      value: function next() {
        this.count += 1;
        return {
          time: this.interonset * (this.count - 1),
          sound: this.sound,
          volume: this.volume
        };
      }
    }, {
      key: "bpm",
      get: function get() {
        return BPMFromInteronset(this.interonset);
      },
      set: function set(bps) {
        this.interonset = interonsetFromBPM(bps);
      }
    }, {
      key: "bps",
      get: function get() {
        return BPSFromInteronset(this.interonset);
      }
    }]);

    return ConstantBeat;
  }(Beat);

  var ConstantTime = function(_Beat2) {
    _inherits(ConstantTime, _Beat2);

    function ConstantTime(config) {
      _classCallCheck(this, ConstantTime);

      var _this3 = _possibleConstructorReturn(this, (ConstantTime.__proto__ || Object.getPrototypeOf(ConstantTime)).call(this));

      config = config || {};

      if (config.bpm !== undefined) {
        config.interonset = interonsetFromBPM(config.bpm);
      } else if (config.bps !== undefined) {
        config.interonset = interonsetFromBPS(config.bps);
      }

      _this3.normalVolume = config.normalVolume || config.soundVolume || config.volume || 0.5;
      _this3.accentVolume = config.accentVolume || config.volume || 1;

      _this3.normal = config.sound || config.normal;
      _this3.accent = config.accent || _this3.normal;

      _this3.num = config.count || config.num || 4;

      _this3.interonset = config.interonset || 0.5;

      _this3.count = 0;
      return _this3;
    }

    _createClass(ConstantTime, [{
      key: "reset",
      value: function reset() {
        _get(ConstantTime.prototype.__proto__ || Object.getPrototypeOf(ConstantTime.prototype), "_reset", this).call(this);
        this.count = 0;
      }
    }, {
      key: "next",
      value: function next() {
        this.count += 1;
        if ((this.count - 1) % this.num === 0) {
          return {
            time: this.interonset * (this.count - 1),
            sound: this.accent,
            volume: this.accentVolume
          };
        } else {
          return {
            time: this.interonset * (this.count - 1),
            sound: this.normal,
            volume: this.normalVolume
          };
        }
      }
    }, {
      key: "bpm",
      get: function get() {
        return BPMFromInteronset(this.interonset);
      },
      set: function set(bps) {
        this.interonset = interonsetFromBPM(bps);
      }
    }, {
      key: "bps",
      get: function get() {
        return BPSFromInteronset(this.interonset);
      }
    }]);

    return ConstantTime;
  }(Beat);

  var Rhythm = function() {
    function Rhythm(beats) {
      var _empty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      _classCallCheck(this, Rhythm);

      if (!_empty && (!Array.isArray(beats) || beats.length <= 1)) {
        throw new Error("There must be at least two beats provided in an array.");
      }

      this.beats = beats;
      this.sort();
    }

    _createClass(Rhythm, [{
      key: "sort",
      value: function sort() {
        this.beats.sort(function(x, y) {
          return Math.sign(x.time - y.time);
        });
      }
    }, {
      key: "add",
      value: function add(beat) {
        if (Array.isArray(beat)) {
          this.beats = this.beats.concat(beat);
        } else {
          this.beats.push(beat);
        }

        this.sort();
      }
    }, {
      key: "duration",
      value: function duration() {
        return this.beats[this.beats.length - 1].time - this.beats[0].time;
      }
    }, {
      key: "count",
      value: function count() {
        return this.beats.length;
      }
    }, {
      key: "stretch",
      value: function stretch(f) {
        for (var i = 0; i < this.beats.length; i++) {
          this.beats[i].time = this.beats[i].time * f;
        }
      }
    }, {
      key: "squish",
      value: function squish(f) {
        this.stretch(1 / f);
      }
    }, {
      key: "increaseVolume",
      value: function increaseVolume(f) {
        for (var i = 0; i < this.beats.length; i++) {
          this.beats[i].volume += f;
        }
      }
    }, {
      key: "decreaseVolume",
      value: function decreaseVolume(f) {
        this.increaseVolume(-f);
      }
    }, {
      key: "multiplyVolume",
      value: function multiplyVolume(f) {
        for (var i = 0; i < this.beats.length; i++) {
          this.beats[i].volume *= f;
        }
      }
    }, {
      key: "divideVolume",
      value: function divideVolume(f) {
        this.multiplyVolume(1 / f);
      }
    }, {
      key: "shift",
      value: function shift(time) {
        for (var i = 0; i < this.beats.length; i++) {
          this.beats[i].time += time;
        }
      }
    }, {
      key: "concat",
      value: function concat(rhythm) {
        if (rhythm instanceof RhythmicMotif) {
          this.beats = this.beats.concat(rhythm);
        }
      }
    }, {
      key: "copy",
      value: function copy() {
        var p = new Rhythm([], true);

        for (var i = 0; i < this.beats.length; i++) {
          p.add(Object.assign({}, this.beats[i]));
        }

        return p;
      }
    }, {
      key: "apply",
      value: function apply(f) {
        var usereturn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        for (var i = 0; i < this.beats.length; i++) {
          if (usereturn) {
            this.beats[i] = f(this.beats[i]);
          } else {
            f(this.beats[i]);
          }
        }
      }
    }]);

    return Rhythm;
  }();

  function fixStartMeasure(rhythm) {
    rhythm.beats[0].startMeasure = true;
  }

  var GenericLoop = function(_Beat3) {
    _inherits(GenericLoop, _Beat3);

    function GenericLoop(rhythm) {
      var loop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      _classCallCheck(this, GenericLoop);

      var _this4 = _possibleConstructorReturn(this, (GenericLoop.__proto__ || Object.getPrototypeOf(GenericLoop)).call(this));

      _this4.rhythm = rhythm.copy();

      if (loop) fixStartMeasure(_this4.rhythm);
      _this4.loop = loop;
      _this4.count = 0;

      _this4.cycle = 0;
      return _this4;
    }

    _createClass(GenericLoop, [{
      key: "reset",
      value: function reset() {
        _get(GenericLoop.prototype.__proto__ || Object.getPrototypeOf(GenericLoop.prototype), "_reset", this).call(this);
        this.rhythm.shift(-this.cycle * this.rhythm.duration());

        this.count = 0;
        this.cycle = 0;
      }
    }, {
      key: "next",
      value: function next() {
        this.count += 1;

        if (this.loop && this.count == this.rhythm.beats.length) {
          this.count = 1;
          this.cycle += 1;

          this.rhythm.shift(this.rhythm.duration());
          return this.rhythm.beats[0];
        }

        return this.rhythm.beats[this.count - 1];
      }
    }, {
      key: "copy",
      value: function copy() {
        return new GenericLoop(this.rhythm, this.loop);
      }
    }]);

    return GenericLoop;
  }(Beat);

  var Animation = {
    SIMPLE: 0,
    LINEAR: 1
  };

  var getNewAnimationClass = function getNewAnimationClass(x, y) {
    switch (x) {
      case Animation.SIMPLE:
        return new SimpleMetronomeAnimation(y);
      case Animation.LINEAR:
        return new LinearMetronomeAnimation(y);
    }
  };

  var SimpleMetronomeAnimation = function() {
    function SimpleMetronomeAnimation(player) {
      _classCallCheck(this, SimpleMetronomeAnimation);

      this.player = player;
      this.animator = null;

      this.onnext = false;
      this.active = false;
      this.startTime = 0;
      this.allocatedBeats = [];
      this.lastBeatTime = 0;
      this.cooldown = 0;

      this.configure({});
    }

    _createClass(SimpleMetronomeAnimation, [{
      key: "setAnimator",
      value: function setAnimator(animator) {
        this.animator = animator;
      }
    }, {
      key: "configure",
      value: function configure(config) {
        this.xmin = config.xmin || 0;
        this.ymin = config.ymin || 0;

        this.xmax = config.xmax || (this.animator ? this.animator.canvas.width : 100);
        this.ymax = config.ymax || (this.animator ? this.animator.canvas.height : 100);

        this.length = config.length || 4;
      }
    }, {
      key: "onstart",
      value: function onstart() {
        this.allocatedBeats = [];
        this.lastBeatTime = -1;
        this.cooldown = 0;

        this.startTime = Date.now();
        this.active = true;
      }
    }, {
      key: "clearFinished",
      value: function clearFinished() {
        var _this5 = this;

        this.allocatedBeats.removeIf(function(x) {
          return x.time < _this5.time;
        });
      }
    }, {
      key: "onallocate",
      value: function onallocate(beats) {
        this.allocatedBeats = this.allocatedBeats.concat(beats);
        this.clearFinished();
      }
    }, {
      key: "onstop",
      value: function onstop() {
        this.allocatedBeats = [];

        this.active = false;
        this.onnext = false;
      }
    }, {
      key: "drawClick",
      value: function drawClick() {
        var c = this.animator.ctx;
        var centerX = (this.xmin + this.xmax) / 2;
        var centerY = (this.ymin + this.ymax) / 2;
        var radius = (this.xmax - this.xmin) / 10;

        c.beginPath();
        c.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        c.fillStyle = 'green';
        c.fill();
        c.lineWidth = 5;
        c.strokeStyle = '#003300';
        c.stroke();

        console.log(4);
      }
    }, {
      key: "animate",
      value: function animate() {
        if (!this.active) return;
        for (var i = 0; i < this.allocatedBeats.length; i++) {
          var beat = this.allocatedBeats[i];

          if (beat.time < this.time && beat.time > this.lastBeatTime) {
            this.lastBeatTime = beat.time;
            this.cooldown = this.length;

            this.drawClick();
            return;
          }
        }

        if (this.cooldown > 0) {
          this.cooldown--;
          this.drawClick();
        }
      }
    }, {
      key: "time",
      get: function get() {
        return (Date.now() - this.startTime) / 1000;
      }
    }]);

    return SimpleMetronomeAnimation;
  }();

  var LinearMetronomeAnimation = function() {
    function LinearMetronomeAnimation(player) {
      _classCallCheck(this, LinearMetronomeAnimation);

      this.active = false;
      this.player = player;

      this.beat = null;
      this.startTime = 0;
      this.measureTime = 0;
      this.animator = null;
      this.allocatedBeats = [];

      this.configure({});
    }

    _createClass(LinearMetronomeAnimation, [{
      key: "setAnimator",
      value: function setAnimator(animator) {
        this.animator = animator;
      }
    }, {
      key: "configure",
      value: function configure(config) {
        this.xmin = config.xmin || 0;
        this.ymin = config.ymin || 0;

        this.xmax = config.xmax || (this.animator ? this.animator.canvas.width : 100);
        this.ymax = config.ymax || (this.animator ? this.animator.canvas.height : 100);
      }
    }, {
      key: "onstart",
      value: function onstart() {
        this.beat = this.player.beat.copy();
        this.active = true;

        this.startTime = Date.now();

        this.getMeasure();
      }
    }, {
      key: "getMeasure",
      value: function getMeasure() {
        this.allocatedBeats = this.beat.gobbleMeasure(500);
      }
    }, {
      key: "onallocate",
      value: function onallocate(d) {
        return;
      }
    }, {
      key: "linePos",
      value: function linePos() {
        if (this.time < this.allocatedBeats[0].time) return -1;
      }
    }, {
      key: "animate",
      value: function animate() {
        if (this.allocatedBeats && this.time > this.allocatedBeats[this.allocatedBeats.length - 1].time) this.getMeasure();
        var lineX = this.linePos();
      }
    }, {
      key: "onstop",
      value: function onstop() {
        this.active = false;
      }
    }, {
      key: "time",
      get: function get() {
        return Date.now() - this.startTime;
      }
    }]);

    return LinearMetronomeAnimation;
  }();

  var MetronomeAnimator = function() {
    function MetronomeAnimator(metronome, canvas, ctx) {
      _classCallCheck(this, MetronomeAnimator);

      if (metronome instanceof Metronome) {
        metronome.setAnimator(this);
        this.metronome = metronome;

        this.canvas = canvas;
        this.ctx = ctx || canvas.getContext('2d');
      } else {
        throw new Error("First argument must be metronome.");
      }
    }

    _createClass(MetronomeAnimator, [{
      key: "getPlayer",
      value: function getPlayer(id) {
        return this.metronome.players[id];
      }
    }, {
      key: "setupAnimation",
      value: function setupAnimation(id, animationType) {
        var player = this.getPlayer(id);

        player.R.animationType = animationType;
        player.R.animation = getNewAnimationClass(animationType, player);

        this._setupAnimation(player);
        player.R.animation.setAnimator(this);
      }
    }, {
      key: "_setupAnimation",
      value: function _setupAnimation(player) {
        player.R.onstart = function() {
          player.R.animation.onstart();
        };
        player.R.onallocate = function(beats) {
          player.R.animation.onallocate(beats);
        };
        player.R.onstop = function() {
          player.R.animation.onstop();
        };
      }
    }, {
      key: "configureAnimation",
      value: function configureAnimation(id, config) {
        this.getPlayer(id).R.animation.configure(config);
      }
    }, {
      key: "clear",
      value: function clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }, {
      key: "animate",
      value: function animate() {
        this.clear();
        var player = void 0;
        for (var k in this.players) {
          player = this.players[k];
          if (player.R && player.R.animation) {
            player.R.animation.animate();
          }
        }
      }
    }, {
      key: "players",
      get: function get() {
        return this.metronome.players;
      }
    }]);

    return MetronomeAnimator;
  }();

  exports.BufferLoader = BufferLoader;
  exports.MetronomeAudioContext = MetronomeAudioContext;
  exports.SchedulerContext = SchedulerContext;
  exports.getContext = getContext;
  exports.Metronome = Metronome;
  exports.Beat = Beat;
  exports.ConstantBeat = ConstantBeat;
  exports.ConstantTime = ConstantTime;
  exports.Rhythm = Rhythm;
  exports.GenericLoop = GenericLoop;
  exports.MetronomeAnimator = MetronomeAnimator;
  exports.Animation = Animation;
  exports.MAXPLAYING = MAXPLAYING;
  exports.RESOLUTION = RESOLUTION;
});
