
//https://github.com/davidchambers/Base64.js

;(function () {
  var object = typeof exports != 'undefined' ? exports : this; // #8: web workers
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error;
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
  object.btoa = function (input) {
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next input index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      input.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = input.charCodeAt(idx += 3/4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  object.atob || (
  object.atob = function (input) {
    input = input.replace(/=+$/, '')
    if (input.length % 4 == 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = input.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  });

}());

/**
 * @license -------------------------------------------------------------------
 *   module: Base64Binary
 *      src: http://blog.danguer.com/2011/10/24/base64-binary-decoding-in-javascript/
 *  license: Simplified BSD License
 * -------------------------------------------------------------------
 * Copyright 2011, Daniel Guerrero. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     - Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     - Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var Base64Binary = {
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  /* will return a  Uint8Array type */
  decodeArrayBuffer: function(input) {
    var bytes = Math.ceil( (3*input.length) / 4.0);
    var ab = new ArrayBuffer(bytes);
    this.decode(input, ab);

    return ab;
  },

  decode: function(input, arrayBuffer) {
    //get last chars to see if are valid
    var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));
    var lkey2 = this._keyStr.indexOf(input.charAt(input.length-1));

    var bytes = Math.ceil( (3*input.length) / 4.0);
    if (lkey1 == 64) bytes--; //padding chars, so skip
    if (lkey2 == 64) bytes--; //padding chars, so skip

    var uarray;
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    var j = 0;

    if (arrayBuffer)
      uarray = new Uint8Array(arrayBuffer);
    else
      uarray = new Uint8Array(bytes);

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    for (i=0; i<bytes; i+=3) {
      //get the 3 octects in 4 ascii chars
      enc1 = this._keyStr.indexOf(input.charAt(j++));
      enc2 = this._keyStr.indexOf(input.charAt(j++));
      enc3 = this._keyStr.indexOf(input.charAt(j++));
      enc4 = this._keyStr.indexOf(input.charAt(j++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      uarray[i] = chr1;
      if (enc3 != 64) uarray[i+1] = chr2;
      if (enc4 != 64) uarray[i+2] = chr3;
    }

    return uarray;
  }
};

/**
 * @license -------------------------------------------------------------------
 *   module: WebAudioShim - Fix naming issues for WebAudioAPI supports
 *      src: https://github.com/Dinahmoe/webaudioshim
 *   author: Dinahmoe AB
 * -------------------------------------------------------------------
 * Copyright (c) 2012 DinahMoe AB
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

window.AudioContext = window.AudioContext || window.webkitAudioContext || null;
window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext || null;

(function (Context) {
  var isFunction = function (f) {
    return Object.prototype.toString.call(f) === "[object Function]" ||
      Object.prototype.toString.call(f) === "[object AudioContextConstructor]";
  };
  var contextMethods = [
    ["createGainNode", "createGain"],
    ["createDelayNode", "createDelay"],
    ["createJavaScriptNode", "createScriptProcessor"]
  ];
  ///
  var proto;
  var instance;
  var sourceProto;
  ///
  if (!isFunction(Context)) {
    return;
  }
  instance = new Context();
  if (!instance.destination || !instance.sampleRate) {
    return;
  }
  proto = Context.prototype;
  sourceProto = Object.getPrototypeOf(instance.createBufferSource());

  if (!isFunction(sourceProto.start)) {
    if (isFunction(sourceProto.noteOn)) {
      sourceProto.start = function (when, offset, duration) {
        switch (arguments.length) {
          case 0:
            throw new Error("Not enough arguments.");
          case 1:
            this.noteOn(when);
            break;
          case 2:
            if (this.buffer) {
              this.noteGrainOn(when, offset, this.buffer.duration - offset);
            } else {
              throw new Error("Missing AudioBuffer");
            }
            break;
          case 3:
            this.noteGrainOn(when, offset, duration);
        }
      };
    }
  }

  if (!isFunction(sourceProto.noteOn)) {
    sourceProto.noteOn = sourceProto.start;
  }

  if (!isFunction(sourceProto.noteGrainOn)) {
    sourceProto.noteGrainOn = sourceProto.start;
  }

  if (!isFunction(sourceProto.stop)) {
    sourceProto.stop = sourceProto.noteOff;
  }

  if (!isFunction(sourceProto.noteOff)) {
    sourceProto.noteOff = sourceProto.stop;
  }

  contextMethods.forEach(function (names) {
    var name1;
    var name2;
    while (names.length) {
      name1 = names.pop();
      if (isFunction(this[name1])) {
        this[names.pop()] = this[name1];
      } else {
        name2 = names.pop();
        this[name1] = this[name2];
      }
    }
  }, proto);
})(window.AudioContext);

/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

// Initialize the MIDI library.
(function (global) {
    'use strict';
    var midiIO, _requestMIDIAccess, MIDIAccess, _onReady, MIDIPort, MIDIInput, MIDIOutput, _midiProc;

    function Promise() {

    }

    Promise.prototype.then = function(accept, reject) {
        this.accept = accept;
        this.reject = reject;
    }

    Promise.prototype.succeed = function(access) {
        if (this.accept)
            this.accept(access);
    }

    Promise.prototype.fail = function(error) {
        if (this.reject)
            this.reject(error);
    }

    function _JazzInstance() {
        this.inputInUse = false;
        this.outputInUse = false;

        // load the Jazz plugin
        var o1 = document.createElement("object");
        o1.id = "_Jazz" + Math.random() + "ie";
        o1.classid = "CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90";

        this.activeX = o1;

        var o2 = document.createElement("object");
        o2.id = "_Jazz" + Math.random();
        o2.type="audio/x-jazz";
        o1.appendChild(o2);

        this.objRef = o2;

        var e = document.createElement("p");
        e.appendChild(document.createTextNode("This page requires the "));

        var a = document.createElement("a");
        a.appendChild(document.createTextNode("Jazz plugin"));
        a.href = "http://jazz-soft.net/";

        e.appendChild(a);
        e.appendChild(document.createTextNode("."));
        o2.appendChild(e);

        var insertionPoint = document.getElementById("MIDIPlugin");
        if (!insertionPoint) {
            // Create hidden element
            var insertionPoint = document.createElement("div");
            insertionPoint.id = "MIDIPlugin";
            insertionPoint.style.position = "absolute";
            insertionPoint.style.visibility = "hidden";
            insertionPoint.style.left = "-9999px";
            insertionPoint.style.top = "-9999px";
            document.body.appendChild(insertionPoint);
        }
        insertionPoint.appendChild(o1);

        if (this.objRef.isJazz)
            this._Jazz = this.objRef;
        else if (this.activeX.isJazz)
            this._Jazz = this.activeX;
        else
            this._Jazz = null;
        if (this._Jazz) {
            this._Jazz._jazzTimeZero = this._Jazz.Time();
            this._Jazz._perfTimeZero = window.performance.now();
        }
    }

    _requestMIDIAccess = function _requestMIDIAccess() {
        var access = new MIDIAccess();
        return access._promise;
    };

    // API Methods

    MIDIAccess = function() {
        this._jazzInstances = new Array();
        this._jazzInstances.push( new _JazzInstance() );
        this._promise = new Promise;

        if (this._jazzInstances[0]._Jazz) {
            this._Jazz = this._jazzInstances[0]._Jazz;
            window.setTimeout( _onReady.bind(this), 3 );
        } else {
            window.setTimeout( _onNotReady.bind(this), 3 );
        }
    };

    _onReady = function _onReady() {
        if (this._promise)
            this._promise.succeed(this);
    };

    function _onNotReady() {
        if (this._promise)
            this._promise.fail( { code: 1 } );
    };

    MIDIAccess.prototype.inputs = function(  ) {
        if (!this._Jazz)
              return null;
        var list=this._Jazz.MidiInList();
        var inputs = new Array( list.length );

        for ( var i=0; i<list.length; i++ ) {
            inputs[i] = new MIDIInput( this, list[i], i );
        }
        return inputs;
    }

    MIDIAccess.prototype.outputs = function(  ) {
        if (!this._Jazz)
            return null;
        var list=this._Jazz.MidiOutList();
        var outputs = new Array( list.length );

        for ( var i=0; i<list.length; i++ ) {
            outputs[i] = new MIDIOutput( this, list[i], i );
        }
        return outputs;
    };

    MIDIInput = function MIDIInput( midiAccess, name, index ) {
        this._listeners = [];
        this._midiAccess = midiAccess;
        this._index = index;
        this._inLongSysexMessage = false;
        this._sysexBuffer = new Uint8Array();
        this.id = "" + index + "." + name;
        this.manufacturer = "";
        this.name = name;
        this.type = "input";
        this.version = "";
        this.onmidimessage = null;

        var inputInstance = null;
        for (var i=0; (i<midiAccess._jazzInstances.length)&&(!inputInstance); i++) {
            if (!midiAccess._jazzInstances[i].inputInUse)
                inputInstance=midiAccess._jazzInstances[i];
        }
        if (!inputInstance) {
            inputInstance = new _JazzInstance();
            midiAccess._jazzInstances.push( inputInstance );
        }
        inputInstance.inputInUse = true;

        this._jazzInstance = inputInstance._Jazz;
        this._input = this._jazzInstance.MidiInOpen( this._index, _midiProc.bind(this) );
    };

    // Introduced in DOM Level 2:
    MIDIInput.prototype.addEventListener = function (type, listener, useCapture ) {
        if (type !== "midimessage")
            return;
        for (var i=0; i<this._listeners.length; i++)
            if (this._listeners[i] == listener)
                return;
        this._listeners.push( listener );
    };

    MIDIInput.prototype.removeEventListener = function (type, listener, useCapture ) {
        if (type !== "midimessage")
            return;
        for (var i=0; i<this._listeners.length; i++)
            if (this._listeners[i] == listener) {
                this._listeners.splice( i, 1 );  //remove it
                return;
            }
    };

    MIDIInput.prototype.preventDefault = function() {
        this._pvtDef = true;
    };

    MIDIInput.prototype.dispatchEvent = function (evt) {
        this._pvtDef = false;

        // dispatch to listeners
        for (var i=0; i<this._listeners.length; i++)
            if (this._listeners[i].handleEvent)
                this._listeners[i].handleEvent.bind(this)( evt );
            else
                this._listeners[i].bind(this)( evt );

        if (this.onmidimessage)
            this.onmidimessage( evt );

        return this._pvtDef;
    };

    MIDIInput.prototype.appendToSysexBuffer = function ( data ) {
        var oldLength = this._sysexBuffer.length;
        var tmpBuffer = new Uint8Array( oldLength + data.length );
        tmpBuffer.set( this._sysexBuffer );
        tmpBuffer.set( data, oldLength );
        this._sysexBuffer = tmpBuffer;
    };

    MIDIInput.prototype.bufferLongSysex = function ( data, initialOffset ) {
        var j = initialOffset;
        while (j<data.length) {
            if (data[j] == 0xF7) {
                // end of sysex!
                j++;
                this.appendToSysexBuffer( data.slice(initialOffset, j) );
                return j;
            }
            j++;
        }
        // didn't reach the end; just tack it on.
        this.appendToSysexBuffer( data.slice(initialOffset, j) );
        this._inLongSysexMessage = true;
        return j;
    };

    _midiProc = function _midiProc( timestamp, data ) {
        // Have to use createEvent/initEvent because IE10 fails on new CustomEvent.  Thanks, IE!
        var length = 0;
        var i,j;
        var isSysexMessage = false;

        // Jazz sometimes passes us multiple messages at once, so we need to parse them out
        // and pass them one at a time.

        for (i=0; i<data.length; i+=length) {
            if (this._inLongSysexMessage) {
                i = this.bufferLongSysex(data,i);
                if ( data[i-1] != 0xf7 ) {
                    // ran off the end without hitting the end of the sysex message
                    return;
                }
                isSysexMessage = true;
            } else {
                isSysexMessage = false;
                switch (data[i] & 0xF0) {
                    case 0x80:  // note off
                    case 0x90:  // note on
                    case 0xA0:  // polyphonic aftertouch
                    case 0xB0:  // control change
                    case 0xE0:  // channel mode
                        length = 3;
                        break;

                    case 0xC0:  // program change
                    case 0xD0:  // channel aftertouch
                        length = 2;
                        break;

                    case 0xF0:
                        switch (data[i]) {
                            case 0xf0:  // variable-length sysex.
                                i = this.bufferLongSysex(data,i);
                                if ( data[i-1] != 0xf7 ) {
                                    // ran off the end without hitting the end of the sysex message
                                    return;
                                }
                                isSysexMessage = true;
                                break;

                            case 0xF1:  // MTC quarter frame
                            case 0xF3:  // song select
                                length = 2;
                                break;

                            case 0xF2:  // song position pointer
                                length = 3;
                                break;

                            default:
                                length = 1;
                                break;
                        }
                        break;
                }
            }
            var evt = document.createEvent( "Event" );
            evt.initEvent( "midimessage", false, false );
            evt.receivedTime = parseFloat( timestamp.toString()) + this._jazzInstance._perfTimeZero;
            if (isSysexMessage || this._inLongSysexMessage) {
                evt.data = new Uint8Array( this._sysexBuffer );
                this._sysexBuffer = new Uint8Array(0);
                this._inLongSysexMessage = false;
            } else
                evt.data = new Uint8Array(data.slice(i, length+i));
            this.dispatchEvent( evt );
        }
    };

    MIDIOutput = function MIDIOutput( midiAccess, name, index ) {
        this._listeners = [];
        this._midiAccess = midiAccess;
        this._index = index;
        this.id = "" + index + "." + name;
        this.manufacturer = "";
        this.name = name;
        this.type = "output";
        this.version = "";

        var outputInstance = null;
        for (var i=0; (i<midiAccess._jazzInstances.length)&&(!outputInstance); i++) {
            if (!midiAccess._jazzInstances[i].outputInUse)
                outputInstance=midiAccess._jazzInstances[i];
        }
        if (!outputInstance) {
            outputInstance = new _JazzInstance();
            midiAccess._jazzInstances.push( outputInstance );
        }
        outputInstance.outputInUse = true;

        this._jazzInstance = outputInstance._Jazz;
        this._jazzInstance.MidiOutOpen(this.name);
    };

    function _sendLater() {
        this.jazz.MidiOutLong( this.data );    // handle send as sysex
    }

    MIDIOutput.prototype.send = function( data, timestamp ) {
        var delayBeforeSend = 0;
        if (data.length === 0)
            return false;

        if (timestamp)
            delayBeforeSend = Math.floor( timestamp - window.performance.now() );

        if (timestamp && (delayBeforeSend>1)) {
            var sendObj = new Object();
            sendObj.jazz = this._jazzInstance;
            sendObj.data = data;

            window.setTimeout( _sendLater.bind(sendObj), delayBeforeSend );
        } else {
            this._jazzInstance.MidiOutLong( data );
        }
        return true;
    };

    //init: create plugin
    if (!window.navigator.requestMIDIAccess)
        window.navigator.requestMIDIAccess = _requestMIDIAccess;

}(window));

// Polyfill window.performance.now() if necessary.
(function (exports) {
    var perf = {}, props;

    function findAlt() {
        var prefix = ['moz', 'webkit', 'o', 'ms'],
        i = prefix.length,
            //worst case, we use Date.now()
            props = {
                value: (function (start) {
                    return function () {
                        return Date.now() - start;
                    };
                }(Date.now()))
            };

        //seach for vendor prefixed version
        for (; i >= 0; i--) {
            if ((prefix[i] + "Now") in exports.performance) {
                props.value = function (method) {
                    return function () {
                        exports.performance[method]();
                    }
                }(prefix[i] + "Now");
                return props;
            }
        }

        //otherwise, try to use connectionStart
        if ("timing" in exports.performance && "connectStart" in exports.performance.timing) {
            //this pretty much approximates performance.now() to the millisecond
            props.value = (function (start) {
                return function() {
                    Date.now() - start;
                };
            }(exports.performance.timing.connectStart));
        }
        return props;
    }

    //if already defined, bail
    if (("performance" in exports) && ("now" in exports.performance))
        return;
    if (!("performance" in exports))
        Object.defineProperty(exports, "performance", {
            get: function () {
                return perf;
            }});
        //otherwise, performance is there, but not "now()"

    props = findAlt();
    Object.defineProperty(exports.performance, "now", props);
}(window));


/* Wrapper for accessing strings through sequential reads */
function Stream(str) {
  var position = 0;

  function read(length) {
    var result = str.substr(position, length);
    position += length;
    return result;
  }

  /* read a big-endian 32-bit integer */
  function readInt32() {
    var result = (
      (str.charCodeAt(position) << 24)
      + (str.charCodeAt(position + 1) << 16)
      + (str.charCodeAt(position + 2) << 8)
      + str.charCodeAt(position + 3));
    position += 4;
    return result;
  }

  /* read a big-endian 16-bit integer */
  function readInt16() {
    var result = (
      (str.charCodeAt(position) << 8)
      + str.charCodeAt(position + 1));
    position += 2;
    return result;
  }

  /* read an 8-bit integer */
  function readInt8(signed) {
    var result = str.charCodeAt(position);
    if (signed && result > 127) result -= 256;
    position += 1;
    return result;
  }

  function eof() {
    return position >= str.length;
  }

  /* read a MIDI-style variable-length integer
    (big-endian value in groups of 7 bits,
    with top bit set to signify that another byte follows)
  */
  function readVarInt() {
    var result = 0;
    while (true) {
      var b = readInt8();
      if (b & 0x80) {
        result += (b & 0x7f);
        result <<= 7;
      } else {
        /* b is the last byte */
        return result + b;
      }
    }
  }

  return {
    'eof': eof,
    'read': read,
    'readInt32': readInt32,
    'readInt16': readInt16,
    'readInt8': readInt8,
    'readVarInt': readVarInt
  }
}

/*
class to parse the .mid file format
(depends on stream.js)
*/
function MidiFile(data) {
  function readChunk(stream) {
    var id = stream.read(4);
    var length = stream.readInt32();
    return {
      'id': id,
      'length': length,
      'data': stream.read(length)
    };
  }

  var lastEventTypeByte;

  function readEvent(stream) {
    var event = {};
    event.deltaTime = stream.readVarInt();
    var eventTypeByte = stream.readInt8();
    if ((eventTypeByte & 0xf0) == 0xf0) {
      /* system / meta event */
      if (eventTypeByte == 0xff) {
        var subtypeByte = stream.readInt8();
        var length = stream.readVarInt();

        /* meta event */
        event.type = 'meta';
        event.status = subtypeByte;

        switch(subtypeByte) {
          case 0x00:
            event.subtype = 'sequenceNumber';
            if (length != 2) throw "Expected length for sequenceNumber event is 2, got " + length;
            event.number = stream.readInt16();
            return event;
          case 0x01:
            event.subtype = 'text';
            event.text = stream.read(length);
            return event;
          case 0x02:
            event.subtype = 'copyrightNotice';
            event.text = stream.read(length);
            return event;
          case 0x03:
            event.subtype = 'trackName';
            event.text = stream.read(length);
            return event;
          case 0x04:
            event.subtype = 'instrumentName';
            event.text = stream.read(length);
            return event;
          case 0x05:
            event.subtype = 'lyrics';
            event.text = stream.read(length);
            return event;
          case 0x06:
            event.subtype = 'marker';
            event.text = stream.read(length);
            return event;
          case 0x07:
            event.subtype = 'cuePoint';
            event.text = stream.read(length);
            return event;
          case 0x20:
            event.subtype = 'midiChannelPrefix';
            if (length != 1) throw "Expected length for midiChannelPrefix event is 1, got " + length;
            event.channel = stream.readInt8();
            return event;
          case 0x2f:
            event.subtype = 'endOfTrack';
            if (length != 0) throw "Expected length for endOfTrack event is 0, got " + length;
            return event;
          case 0x51:
            event.subtype = 'setTempo';
            if (length != 3) throw "Expected length for setTempo event is 3, got " + length;
            event.microsecondsPerBeat = (
              (stream.readInt8() << 16)
              + (stream.readInt8() << 8)
              + stream.readInt8()
            )
            return event;
          case 0x54:
            event.subtype = 'smpteOffset';
            if (length != 5) throw "Expected length for smpteOffset event is 5, got " + length;
            var hourByte = stream.readInt8();
            event.frameRate = {
              0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30
            }[hourByte & 0x60];
            event.hour = hourByte & 0x1f;
            event.min = stream.readInt8();
            event.sec = stream.readInt8();
            event.frame = stream.readInt8();
            event.subframe = stream.readInt8();
            return event;
          case 0x58:
            event.subtype = 'timeSignature';
            if (length != 4) throw "Expected length for timeSignature event is 4, got " + length;
            event.numerator = stream.readInt8();
            event.denominator = Math.pow(2, stream.readInt8());
            event.metronome = stream.readInt8();
            event.thirtyseconds = stream.readInt8();
            return event;
          case 0x59:
            event.subtype = 'keySignature';
            if (length != 2) throw "Expected length for keySignature event is 2, got " + length;
            event.key = stream.readInt8(true);
            event.scale = stream.readInt8();
            return event;
          case 0x7f:
            event.subtype = 'sequencerSpecific';
            event.data = stream.read(length);
            return event;
          default:
            // console.log("Unrecognised meta event subtype: " + subtypeByte);
            event.subtype = 'unknown'
            event.data = stream.read(length);
            return event;
        }
        event.data = stream.read(length);
        return event;
      } else if (eventTypeByte == 0xf0) {
        event.type = 'sysEx';
        var length = stream.readVarInt();
        event.data = stream.read(length);
        return event;
      } else if (eventTypeByte == 0xf7) {
        event.type = 'dividedSysEx';
        var length = stream.readVarInt();
        event.data = stream.read(length);
        return event;
      } else {
        throw "Unrecognised MIDI event type byte: " + eventTypeByte;
      }
    } else {
      /* channel event */
      var param1;
      if ((eventTypeByte & 0x80) == 0) {
        /* running status - reuse lastEventTypeByte as the event type.
          eventTypeByte is actually the first parameter
        */
        param1 = eventTypeByte;
        eventTypeByte = lastEventTypeByte;
      } else {
        param1 = stream.readInt8();
        lastEventTypeByte = eventTypeByte;
      }

      var eventType = eventTypeByte >> 4;
      event.channel = eventTypeByte & 0x0f;
      event.type = 'channel';
      event.status = eventTypeByte;

      switch (eventType) {
        case 0x08:
          event.subtype = 'noteOff';
          event.noteNumber = param1;
          event.velocity = stream.readInt8();
          return event;
        case 0x09:
          event.noteNumber = param1;
          event.velocity = stream.readInt8();
          if (event.velocity == 0) {
            event.subtype = 'noteOff';
          } else {
            event.subtype = 'noteOn';
          }
          return event;
        case 0x0a:
          event.subtype = 'noteAftertouch';
          event.noteNumber = param1;
          event.amount = stream.readInt8();
          return event;
        case 0x0b:
          event.subtype = 'controller';
          event.controllerType = param1;
          event.value = stream.readInt8();
          return event;
        case 0x0c:
          event.subtype = 'programChange';
          event.programNumber = param1;
          return event;
        case 0x0d:
          event.subtype = 'channelAftertouch';
          event.amount = param1;
          return event;
        case 0x0e:
          event.subtype = 'pitchBend';
          event.value = param1 + (stream.readInt8() << 7);
          return event;
        default:
          throw 'Unrecognised MIDI event type: ' + eventType
          /*
          console.log('Unrecognised MIDI event type: ' + eventType);
          stream.readInt8();
          event.subtype = 'unknown';
          return event;
          */
      }
    }
  }

  stream = Stream(data);
  var headerChunk = readChunk(stream);
  if (headerChunk.id != 'MThd' || headerChunk.length != 6) {
    throw "Bad .mid file - header not found";
  }
  var headerStream = Stream(headerChunk.data);
  var formatType = headerStream.readInt16();
  var trackCount = headerStream.readInt16();
  var timeDivision = headerStream.readInt16();

  if (timeDivision & 0x8000) {
    throw "Expressing time division in SMTPE frames is not supported yet"
  } else {
    ticksPerBeat = timeDivision;
  }

  var header = {
    'formatType': formatType,
    'trackCount': trackCount,
    'ticksPerBeat': ticksPerBeat
  }
  var tracks = [];
  for (var i = 0; i < header.trackCount; i++) {
    tracks[i] = [];
    var trackChunk = readChunk(stream);
    if (trackChunk.id != 'MTrk') {
      throw "Unexpected chunk - expected MTrk, got "+ trackChunk.id;
    }
    var trackStream = Stream(trackChunk.data);
    while (!trackStream.eof()) {
      var event = readEvent(trackStream);
      tracks[i].push(event);
      //console.log(event);
    }
  }

  return {
    'header': header,
    'tracks': tracks
  }
}

function Replayer(midiFile, timeWarp, eventProcessor, bpm) {
  function clone(o) {
    if (typeof o === 'object') {
      if (o == null) {
        return (o);
      } else {
        var res = typeof o.length === 'number' ? [] : {};
        for (var key in o) {
          res[key] = clone(o[key]);
        }
        return res;
      }
    } else {
      return o;
    }
  };

  var trackStates = [];
  var beatsPerMinute = bpm ? bpm : 120;
  var bpmOverride = bpm === +bpm;
  ///
  var ticksPerBeat = midiFile.header.ticksPerBeat;
  for (var i = 0; i < midiFile.tracks.length; i++) {
    trackStates[i] = {
      'nextEventIndex': 0,
      'ticksToNextEvent': (
        midiFile.tracks[i].length ?
          midiFile.tracks[i][0].deltaTime :
          null
      )
    };
  }

  var nextEventInfo;
  var samplesToNextEvent = 0;

  function getNextEvent() {
    var ticksToNextEvent = null;
    var nextEventTrack = null;
    var nextEventIndex = null;

    for (var i = 0; i < trackStates.length; i++) {
      if (
        trackStates[i].ticksToNextEvent != null
        && (ticksToNextEvent == null || trackStates[i].ticksToNextEvent < ticksToNextEvent)
      ) {
        ticksToNextEvent = trackStates[i].ticksToNextEvent;
        nextEventTrack = i;
        nextEventIndex = trackStates[i].nextEventIndex;
      }
    }
    if (nextEventTrack != null) {
      /* consume event from that track */
      var nextEvent = midiFile.tracks[nextEventTrack][nextEventIndex];
      if (midiFile.tracks[nextEventTrack][nextEventIndex + 1]) {
        trackStates[nextEventTrack].ticksToNextEvent += midiFile.tracks[nextEventTrack][nextEventIndex + 1].deltaTime;
      } else {
        trackStates[nextEventTrack].ticksToNextEvent = null;
      }
      trackStates[nextEventTrack].nextEventIndex += 1;
      /* advance timings on all tracks by ticksToNextEvent */
      for (var i = 0; i < trackStates.length; i++) {
        if (trackStates[i].ticksToNextEvent != null) {
          trackStates[i].ticksToNextEvent -= ticksToNextEvent
        }
      }
      return {
        'ticksToEvent': ticksToNextEvent,
        'event': nextEvent,
        'track': nextEventTrack
      }
    } else {
      return null;
    }
  };
  ///
  var packet;
  var temporal = [];
  var calcDuration = {}; // used to calculate duration of noteOn
  ///
  function processEvents() {
    function processNext() {
      var event = packet.event;
      var subtype = event.subtype;
      ///
      var beatsToGenerate = 0;
      var secondsToGenerate = 0;
      if (packet.ticksToEvent > 0) {
        beatsToGenerate = packet.ticksToEvent / ticksPerBeat;
        secondsToGenerate = beatsToGenerate / (beatsPerMinute / 60);
      }
      ///
      var currentTime = secondsToGenerate * 1000 * timeWarp || 0;
      ///
      switch(subtype) {
        case 'setTempo':
          if (!bpmOverride) { // tempo change events can occur anywhere in the middle and affect events that follow
            beatsPerMinute = 60000000 / event.microsecondsPerBeat;
          }
          break;
        case 'noteOn':
          var eid = event.channel + 'x' + event.noteNumber;
          calcDuration[eid] = {
            event: event,
            currentTime: currentTime
          };
          break;
        case 'noteOff':
          var eid = event.channel + 'x' + event.noteNumber;
          var map = calcDuration[eid];
          if (map) {
            map.event.duration = currentTime - map.currentTime;
            delete calcDuration[eid];
          }
          break;
      }
      ///
      temporal.push([packet, currentTime]);
      ///
      packet = getNextEvent();
    };
    ///
    if (packet = getNextEvent()) {
      while(packet) {
        processNext(true);
      }
    }
  };
  ///
  processEvents();
  ///
  return {
    getData: function() {
      return clone(temporal);
    }
  };
};

/*
  ----------------------------------------------------------
  MIDI.audioDetect : 2015-05-16
  ----------------------------------------------------------
  https://github.com/mudcube/MIDI.js
  ----------------------------------------------------------
  Probably, Maybe, No... Absolutely!
  Test to see what types of <audio> MIME types are playable by the browser.
  ----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};

(function(root) { 'use strict';

  var supports = {}; // object of supported file types
  var pending = 0; // pending file types to process
  ///
  function canPlayThrough(src) { // check whether format plays through
    pending ++;
    ///
    var body = document.body;
    var audio = new Audio();
    var mime = src.split(';')[0];
    audio.id = 'audio';
    audio.setAttribute('preload', 'auto');
    audio.setAttribute('audiobuffer', true);
    audio.addEventListener('error', function() {
      body.removeChild(audio);
      supports[mime] = false;
      pending --;
    }, false);
    audio.addEventListener('canplaythrough', function() {
      body.removeChild(audio);
      supports[mime] = true;
      pending --;
    }, false);
    audio.src = 'data:' + src;
    body.appendChild(audio);
  };

  root.audioDetect = function(onsuccess) {

    /// detect midi plugin
    if (navigator.requestMIDIAccess) {
      var toString = Function.prototype.toString;
      var isNative = toString.call(navigator.requestMIDIAccess).indexOf('[native code]') !== -1;
      if (isNative) { // has native midi support
        supports['webmidi'] = true;
      } else { // check for jazz plugin support
        for (var n = 0; navigator.plugins.length > n; n ++) {
          var plugin = navigator.plugins[n];
          if (plugin.name.indexOf('Jazz-Plugin') >= 0) {
            supports['webmidi'] = true;
          }
        }
      }
    }

    /// check whether <audio> tag is supported
    if (typeof Audio === 'undefined') {
      onsuccess(supports);
      return;
    } else {
      supports['audiotag'] = true;

      /// check for webaudio api support
      if (window.AudioContext || window.webkitAudioContext) {
        supports['webaudio'] = true;
      }

      /// check whether canPlayType is supported
      var audio = new Audio();
      if (audio.canPlayType) {

        /// see what we can learn from the browser
        var vorbis = audio.canPlayType('audio/ogg; codecs="vorbis"');
        vorbis = (vorbis === 'probably' || vorbis === 'maybe');
        var mpeg = audio.canPlayType('audio/mpeg');
        mpeg = (mpeg === 'probably' || mpeg === 'maybe');

        // maybe nothing is supported
        if (!vorbis && !mpeg) {
          onsuccess(supports);
          return;
        }

        /// or maybe something is supported
        if (vorbis) canPlayThrough('audio/ogg;base64,T2dnUwACAAAAAAAAAADqnjMlAAAAAOyyzPIBHgF2b3JiaXMAAAAAAUAfAABAHwAAQB8AAEAfAACZAU9nZ1MAAAAAAAAAAAAA6p4zJQEAAAANJGeqCj3//////////5ADdm9yYmlzLQAAAFhpcGguT3JnIGxpYlZvcmJpcyBJIDIwMTAxMTAxIChTY2hhdWZlbnVnZ2V0KQAAAAABBXZvcmJpcw9CQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBACAAAAYRqF1TCqDEEPKQ4QUY9AzoxBDDEzGHGNONKQMMogzxZAyiFssLqgQBKEhKwKAKAAAwBjEGGIMOeekZFIi55iUTkoDnaPUUcoolRRLjBmlEluJMYLOUeooZZRCjKXFjFKJscRUAABAgAMAQICFUGjIigAgCgCAMAYphZRCjCnmFHOIMeUcgwwxxiBkzinoGJNOSuWck85JiRhjzjEHlXNOSuekctBJyaQTAAAQ4AAAEGAhFBqyIgCIEwAwSJKmWZomipamiaJniqrqiaKqWp5nmp5pqqpnmqpqqqrrmqrqypbnmaZnmqrqmaaqiqbquqaquq6nqrZsuqoum65q267s+rZru77uqapsm6or66bqyrrqyrbuurbtS56nqqKquq5nqq6ruq5uq65r25pqyq6purJtuq4tu7Js664s67pmqq5suqotm64s667s2rYqy7ovuq5uq7Ks+6os+75s67ru2rrwi65r66os674qy74x27bwy7ouHJMnqqqnqq7rmarrqq5r26rr2rqmmq5suq4tm6or26os67Yry7aumaosm64r26bryrIqy77vyrJui67r66Ys67oqy8Lu6roxzLat+6Lr6roqy7qvyrKuu7ru+7JuC7umqrpuyrKvm7Ks+7auC8us27oxuq7vq7It/KosC7+u+8Iy6z5jdF1fV21ZGFbZ9n3d95Vj1nVhWW1b+V1bZ7y+bgy7bvzKrQvLstq2scy6rSyvrxvDLux8W/iVmqratum6um7Ksq/Lui60dd1XRtf1fdW2fV+VZd+3hV9pG8OwjK6r+6os68Jry8ov67qw7MIvLKttK7+r68ow27qw3L6wLL/uC8uq277v6rrStXVluX2fsSu38QsAABhwAAAIMKEMFBqyIgCIEwBAEHIOKQahYgpCCKGkEEIqFWNSMuakZM5JKaWUFEpJrWJMSuaclMwxKaGUlkopqYRSWiqlxBRKaS2l1mJKqcVQSmulpNZKSa2llGJMrcUYMSYlc05K5pyUklJrJZXWMucoZQ5K6iCklEoqraTUYuacpA46Kx2E1EoqMZWUYgupxFZKaq2kFGMrMdXUWo4hpRhLSrGVlFptMdXWWqs1YkxK5pyUzDkqJaXWSiqtZc5J6iC01DkoqaTUYiopxco5SR2ElDLIqJSUWiupxBJSia20FGMpqcXUYq4pxRZDSS2WlFosqcTWYoy1tVRTJ6XFklKMJZUYW6y5ttZqDKXEVkqLsaSUW2sx1xZjjqGkFksrsZWUWmy15dhayzW1VGNKrdYWY40x5ZRrrT2n1mJNMdXaWqy51ZZbzLXnTkprpZQWS0oxttZijTHmHEppraQUWykpxtZara3FXEMpsZXSWiypxNhirLXFVmNqrcYWW62ltVprrb3GVlsurdXcYqw9tZRrrLXmWFNtBQAADDgAAASYUAYKDVkJAEQBAADGMMYYhEYpx5yT0ijlnHNSKucghJBS5hyEEFLKnINQSkuZcxBKSSmUklJqrYVSUmqttQIAAAocAAACbNCUWByg0JCVAEAqAIDBcTRNFFXVdX1fsSxRVFXXlW3jVyxNFFVVdm1b+DVRVFXXtW3bFn5NFFVVdmXZtoWiqrqybduybgvDqKqua9uybeuorqvbuq3bui9UXVmWbVu3dR3XtnXd9nVd+Bmzbeu2buu+8CMMR9/4IeTj+3RCCAAAT3AAACqwYXWEk6KxwEJDVgIAGQAAgDFKGYUYM0gxphhjTDHGmAAAgAEHAIAAE8pAoSErAoAoAADAOeecc84555xzzjnnnHPOOeecc44xxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY0wAwE6EA8BOhIVQaMhKACAcAABACCEpKaWUUkoRU85BSSmllFKqFIOMSkoppZRSpBR1lFJKKaWUIqWgpJJSSimllElJKaWUUkoppYw6SimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaVUSimllFJKKaWUUkoppRQAYPLgAACVYOMMK0lnhaPBhYasBAByAwAAhRiDEEJpraRUUkolVc5BKCWUlEpKKZWUUqqYgxBKKqmlklJKKbXSQSihlFBKKSWUUkooJYQQSgmhlFRCK6mEUkoHoYQSQimhhFRKKSWUzkEoIYUOQkmllNRCSB10VFIpIZVSSiklpZQ6CKGUklJLLZVSWkqpdBJSKamV1FJqqbWSUgmhpFZKSSWl0lpJJbUSSkklpZRSSymFVFJJJYSSUioltZZaSqm11lJIqZWUUkqppdRSSiWlkEpKqZSSUmollZRSaiGVlEpJKaTUSimlpFRCSamlUlpKLbWUSkmptFRSSaWUlEpJKaVSSksppRJKSqmllFpJKYWSUkoplZJSSyW1VEoKJaWUUkmptJRSSymVklIBAEAHDgAAAUZUWoidZlx5BI4oZJiAAgAAQABAgAkgMEBQMApBgDACAQAAAADAAAAfAABHARAR0ZzBAUKCwgJDg8MDAAAAAAAAAAAAAACAT2dnUwAEAAAAAAAAAADqnjMlAgAAADzQPmcBAQA=');
        if (mpeg) canPlayThrough('audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');

        /// lets find out!
        var startTime = Date.now();
        var interval = setInterval(function() {
          var maxExecution = Date.now() - startTime > 5000;
          if (!pending || maxExecution) {
            clearInterval(interval);
            onsuccess(supports);
          }
        }, 1);
      } else {
        onsuccess(supports);
        return;
      }
    }
  };

})(MIDI);

/*
  ----------------------------------------------------------
  GeneralMIDI : 2012-01-06
  ----------------------------------------------------------
*/

(function(MIDI) { 'use strict';

  function asId(name) {
    return name.replace(/[^a-z0-9_ ]/gi, '').
            replace(/[ ]/g, '_').
            toLowerCase();
  };

  var GM = (function(arr) {
    var res = {};
    var byCategory = res.byCategory = {};
    var byId = res.byId = {};
    var byName = res.byName = {};
    ///
    for (var key in arr) {
      var list = arr[key];
      for (var n = 0, length = list.length; n < length; n++) {
        var instrument = list[n];
        if (instrument) {
          var id = parseInt(instrument.substr(0, instrument.indexOf(' ')), 10);
          var name = instrument.replace(id + ' ', '');
          var nameId = asId(name);
          var categoryId = asId(key);
          ///
          var spec = {
            id: nameId,
            name: name,
            program: --id,
            category: key
          };
          ///
          byId[id] = spec;
          byName[nameId] = spec;
          byCategory[categoryId] = byCategory[categoryId] || [];
          byCategory[categoryId].push(spec);
        }
      }
    }
    return res;
  })({
    'Piano': ['1 Acoustic Grand Piano', '2 Bright Acoustic Piano', '3 Electric Grand Piano', '4 Honky-tonk Piano', '5 Electric Piano 1', '6 Electric Piano 2', '7 Harpsichord', '8 Clavinet'],
    'Chromatic Percussion': ['9 Celesta', '10 Glockenspiel', '11 Music Box', '12 Vibraphone', '13 Marimba', '14 Xylophone', '15 Tubular Bells', '16 Dulcimer'],
    'Organ': ['17 Drawbar Organ', '18 Percussive Organ', '19 Rock Organ', '20 Church Organ', '21 Reed Organ', '22 Accordion', '23 Harmonica', '24 Tango Accordion'],
    'Guitar': ['25 Acoustic Guitar (nylon)', '26 Acoustic Guitar (steel)', '27 Electric Guitar (jazz)', '28 Electric Guitar (clean)', '29 Electric Guitar (muted)', '30 Overdriven Guitar', '31 Distortion Guitar', '32 Guitar Harmonics'],
    'Bass': ['33 Acoustic Bass', '34 Electric Bass (finger)', '35 Electric Bass (pick)', '36 Fretless Bass', '37 Slap Bass 1', '38 Slap Bass 2', '39 Synth Bass 1', '40 Synth Bass 2'],
    'Strings': ['41 Violin', '42 Viola', '43 Cello', '44 Contrabass', '45 Tremolo Strings', '46 Pizzicato Strings', '47 Orchestral Harp', '48 Timpani'],
    'Ensemble': ['49 String Ensemble 1', '50 String Ensemble 2', '51 Synth Strings 1', '52 Synth Strings 2', '53 Choir Aahs', '54 Voice Oohs', '55 Synth Choir', '56 Orchestra Hit'],
    'Brass': ['57 Trumpet', '58 Trombone', '59 Tuba', '60 Muted Trumpet', '61 French Horn', '62 Brass Section', '63 Synth Brass 1', '64 Synth Brass 2'],
    'Reed': ['65 Soprano Sax', '66 Alto Sax', '67 Tenor Sax', '68 Baritone Sax', '69 Oboe', '70 English Horn', '71 Bassoon', '72 Clarinet'],
    'Pipe': ['73 Piccolo', '74 Flute', '75 Recorder', '76 Pan Flute', '77 Blown Bottle', '78 Shakuhachi', '79 Whistle', '80 Ocarina'],
    'Synth Lead': ['81 Lead 1 (square)', '82 Lead 2 (sawtooth)', '83 Lead 3 (calliope)', '84 Lead 4 (chiff)', '85 Lead 5 (charang)', '86 Lead 6 (voice)', '87 Lead 7 (fifths)', '88 Lead 8 (bass + lead)'],
    'Synth Pad': ['89 Pad 1 (new age)', '90 Pad 2 (warm)', '91 Pad 3 (polysynth)', '92 Pad 4 (choir)', '93 Pad 5 (bowed)', '94 Pad 6 (metallic)', '95 Pad 7 (halo)', '96 Pad 8 (sweep)'],
    'Synth Effects': ['97 FX 1 (rain)', '98 FX 2 (soundtrack)', '99 FX 3 (crystal)', '100 FX 4 (atmosphere)', '101 FX 5 (brightness)', '102 FX 6 (goblins)', '103 FX 7 (echoes)', '104 FX 8 (sci-fi)'],
    'Ethnic': ['105 Sitar', '106 Banjo', '107 Shamisen', '108 Koto', '109 Kalimba', '110 Bagpipe', '111 Fiddle', '112 Shanai'],
    'Percussive': ['113 Tinkle Bell', '114 Agogo', '115 Steel Drums', '116 Woodblock', '117 Taiko Drum', '118 Melodic Tom', '119 Synth Drum'],
    'Sound effects': ['120 Reverse Cymbal', '121 Guitar Fret Noise', '122 Breath Noise', '123 Seashore', '124 Bird Tweet', '125 Telephone Ring', '126 Helicopter', '127 Applause', '128 Gunshot']
  });

  GM.getProgramSpec = function(program) {
    var spec;
    if (typeof program === 'string') {
      spec = GM.byName[asId(program)];
    } else {
      spec = GM.byId[program];
    }
    if (spec) {
      return spec;
    } else {
      MIDI.handleError('invalid program', arguments);
    }
  };


  /* getProgram | programChange
  --------------------------------------------------- */
  MIDI.getProgram = function(channelId) {
    return getParam('program', channelId);
  };

  MIDI.programChange = function(channelId, program, delay) {
    var spec = GM.getProgramSpec(program);
    if (spec && isFinite(program = spec.program)) {
      setParam('program', channelId, program, delay);
    }
  };


  /* getMono | setMono
  --------------------------------------------------- */
  MIDI.getMono = function(channelId) {
    return getParam('mono', channelId);
  };

  MIDI.setMono = function(channelId, truthy, delay) {
    if (isFinite(truthy)) {
      setParam('mono', channelId, truthy, delay);
    }
  };


  /* getOmni | setOmni
  --------------------------------------------------- */
  MIDI.getOmni = function(channelId) {
    return getParam('omni', channelId);
  };

  MIDI.setOmni = function(channelId, truthy, delay) {
    if (isFinite(truthy)) {
      setParam('omni', channelId, truthy, delay);
    }
  };


  /* getSolo | setSolo
  --------------------------------------------------- */
  MIDI.getSolo = function(channelId) {
    return getParam('solo', channelId);
  };

  MIDI.setSolo = function(channelId, truthy, delay) {
    if (isFinite(truthy)) {
      setParam('solo', channelId, truthy, delay);
    }
  };

  function getParam(param, channelId) {
    var channel = channels[channelId];
    if (channel) {
      return channel[param];
    }
  };

  function setParam(param, channelId, value, delay) {
    var channel = channels[channelId];
    if (channel) {
      if (delay) {
        setTimeout(function() { //- is there a better option?
          channel[param] = value;
        }, delay);
      } else {
        channel[param] = value;
      }
      ///
      var wrapper = MIDI.messageHandler[param] || messageHandler[param];
      if (wrapper) {
        wrapper(channelId, value, delay);
      }
    }
  };


  /* channels
  --------------------------------------------------- */
  var channels = (function() {
    var res = {};
    for (var number = 0; number <= 15; number++) {
      res[number] = {
        number: number,
        program: number,
        pitchBend: 0,
        mute: false,
        mono: false,
        omni: false,
        solo: false
      };
    }
    return res;
  })();


  /* note conversions
  --------------------------------------------------- */
  MIDI.keyToNote = {}; // C8  == 108
  MIDI.noteToKey = {}; // 108 ==  C8

  (function() {
    var A0 = 0x15; // first note
    var C8 = 0x6C; // last note
    var number2key = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    for (var n = A0; n <= C8; n++) {
      var octave = (n - 12) / 12 >> 0;
      var name = number2key[n % 12] + octave;
      MIDI.keyToNote[name] = n;
      MIDI.noteToKey[n] = name;
    }
  })();


  /* expose
  --------------------------------------------------- */
  MIDI.channels = channels;
  MIDI.GM = GM;


  /* handle message
  --------------------------------------------------- */
  MIDI.messageHandler = {}; // overrides

  var messageHandler = { // defaults
    program: function(channelId, program, delay) {
      if (MIDI.__api) {
        if (MIDI.player.isPlaying) {
          MIDI.player.pause();
          MIDI.loadProgram(program, MIDI.player.play);
        } else {
          MIDI.loadProgram(program);
        }
      }
    }
  };


  /* handle errors
  --------------------------------------------------- */
  MIDI.handleError = function(type, args) {
    if (console && console.error) {
      console.error(type, args);
    }
  };

})(MIDI);

/*
  ----------------------------------------------------------
  MIDI.Plugin : 2015-06-04
  ----------------------------------------------------------
  https://github.com/mudcube/MIDI.js
  ----------------------------------------------------------
  Inspired by javax.sound.midi (albeit a super simple version):
    http://docs.oracle.com/javase/6/docs/api/javax/sound/midi/package-summary.html
  ----------------------------------------------------------
  Technologies
  ----------------------------------------------------------
    Web MIDI API - no native support yet (jazzplugin)
    Web Audio API - firefox 25+, chrome 10+, safari 6+, opera 15+
    HTML5 Audio Tag - ie 9+, firefox 3.5+, chrome 4+, safari 4+, opera 9.5+, ios 4+, android 2.3+
  ----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};

MIDI.Soundfont = MIDI.Soundfont || {};
MIDI.player = MIDI.player || {};

(function(MIDI) { 'use strict';

  if (typeof console !== 'undefined' && console.log) {
    console.log('%c♥ MIDI.js 0.4.2 ♥', 'color: red;');
  }

  MIDI.DEBUG = true;
  MIDI.USE_XHR = true;
  MIDI.soundfontUrl = './soundfont/';

  /*
    MIDI.loadPlugin({
      audioFormat: 'mp3', // optionally can force to use MP3 (for instance on mobile networks)
      onsuccess: function() { },
      onprogress: function(state, percent) { },
      instrument: 'acoustic_grand_piano', // or 1 (default)
      instruments: [ 'acoustic_grand_piano', 'acoustic_guitar_nylon' ] // or multiple instruments
    });
  */

  MIDI.loadPlugin = function(opts, onsuccess, onerror, onprogress) {
    if (typeof opts === 'function') opts = {onsuccess: opts};
    opts = opts || {};
    opts.api = opts.api || MIDI.__api;

    function onDetect(supports) {
      var hash = location.hash;
      var api = '';

      /// use the most appropriate plugin if not specified
      if (supports[opts.api]) {
        api = opts.api;
      } else if (supports[hash.substr(1)]) {
        api = hash.substr(1);
      } else if (supports.webmidi) {
        api = 'webmidi';
      } else if (window.AudioContext) { // Chrome
        api = 'webaudio';
      } else if (window.Audio) { // Firefox
        api = 'audiotag';
      }

      if (connect[api]) {
        /// use audio/ogg when supported
        if (opts.audioFormat) {
          var audioFormat = opts.audioFormat;
        } else { // use best quality
          var audioFormat = supports['audio/ogg'] ? 'ogg' : 'mp3';
        }

        /// load the specified plugin
        MIDI.__api = api;
        MIDI.__audioFormat = audioFormat;
        MIDI.supports = supports;
        MIDI.loadProgram(opts);
      }
    };

    ///
    if (opts.soundfontUrl) {
      MIDI.soundfontUrl = opts.soundfontUrl;
    }

    /// Detect the best type of audio to use
    if (MIDI.supports) {
      onDetect(MIDI.supports);
    } else {
      MIDI.audioDetect(onDetect);
    }
  };

  /*
    MIDI.loadProgram('banjo', onsuccess, onerror, onprogress);
    MIDI.loadProgram({
      instrument: 'banjo',
      onsuccess: function(){},
      onerror: function(){},
      onprogress: function(state, percent){}
    })
  */

  MIDI.loadProgram = (function() {

    function asList(opts) {
      var res = opts.instruments || opts.instrument || MIDI.channels[0].program;
      if (typeof res !== 'object') {
        if (res === undefined) {
          res = [];
        } else {
          res = [res];
        }
      }
      /// program number -> id
      for (var i = 0; i < res.length; i ++) {
        var instrument = res[i];
        if (instrument === +instrument) { // is numeric
          if (MIDI.GM.byId[instrument]) {
            res[i] = MIDI.GM.byId[instrument].id;
          }
        }
      }
      return res;
    };

    return function(opts, onsuccess, onerror, onprogress) {
      opts = opts || {};
      if (typeof opts !== 'object') opts = {instrument: opts};
      if (onerror) opts.onerror = onerror;
      if (onprogress) opts.onprogress = onprogress;
      if (onsuccess) opts.onsuccess = onsuccess;
      ///
      opts.format = MIDI.__audioFormat;
      opts.instruments = asList(opts);
      ///
      connect[MIDI.__api](opts);
    };
  })();

  var connect = {
    webmidi: function(opts) {
      // cant wait for this to be standardized!
      MIDI.WebMIDI.connect(opts);
    },
    audiotag: function(opts) {
      // works ok, kinda like a drunken tuna fish, across the board
      // http://caniuse.com/audio
      requestQueue(opts, 'AudioTag');
    },
    webaudio: function(opts) {
      // works awesome! safari, chrome and firefox support
      // http://caniuse.com/web-audio
      requestQueue(opts, 'WebAudio');
    }
  };

  function requestQueue(opts, context) {
    var audioFormat = opts.format;
    var instruments = opts.instruments;
    var onprogress = opts.onprogress;
    var onerror = opts.onerror;
    ///
    var length = instruments.length;
    var pending = length;
    ///
    function onEnd() {
      onprogress && onprogress('load', 1.0);
      MIDI[context].connect(opts);
    };
    ///
    if (length) {
      for (var i = 0; i < length; i ++) {
        var programId = instruments[i];
        if (MIDI.Soundfont[programId]) { // already loaded
          !--pending && onEnd();
        } else { // needs to be requested
          sendRequest(instruments[i], audioFormat, function(evt, progress) {
            var fileProgress = progress / length;
            var queueProgress = (length - pending) / length;
            onprogress && onprogress('load', fileProgress + queueProgress, programId);
          }, function() {
            !--pending && onEnd();
          }, onerror);
        }
      }
    } else {
      onEnd();
    }
  };

  function sendRequest(programId, audioFormat, onprogress, onsuccess, onerror) {
    var soundfontPath = MIDI.soundfontUrl + programId + '-' + audioFormat + '.js';
    if (MIDI.USE_XHR) {
      galactic.util.request({
        url: soundfontPath,
        format: 'text',
        onerror: onerror,
        onprogress: onprogress,
        onsuccess: function(event, responseText) {
          var script = document.createElement('script');
          script.language = 'javascript';
          script.type = 'text/javascript';
          script.text = responseText;
          document.body.appendChild(script);
          onsuccess();
        }
      });
    } else {
      dom.loadScript.add({
        url: soundfontPath,
        verify: 'MIDI.Soundfont["' + programId + '"]',
        onerror: onerror,
        onsuccess: function() {
          onsuccess();
        }
      });
    }
  };

  MIDI.setDefaultPlugin = function(midi) {
    for (var key in midi) {
      MIDI[key] = midi[key];
    }
  };

})(MIDI);

/*
  ----------------------------------------------------------------------
  AudioTag <audio> - OGG or MPEG Soundbank
  ----------------------------------------------------------------------
  http://dev.w3.org/html5/spec/Overview.html#the-audio-element
  ----------------------------------------------------------------------
*/

(function(MIDI) { 'use strict';

  window.Audio && (function() {
    var midi = MIDI.AudioTag = { api: 'audiotag' };
    var noteToKey = {};
    var volume = 127; // floating point
    var buffer_nid = -1; // current channel
    var audioBuffers = []; // the audio channels
    var notesOn = []; // instrumentId + noteId that is currently playing in each 'channel', for routing noteOff/chordOff calls
    var notes = {}; // the piano keys
    for (var nid = 0; nid < 12; nid ++) {
      audioBuffers[nid] = new Audio();
    }

    function playChannel(channel, note) {
      if (!MIDI.channels[channel]) return;
      var instrument = MIDI.channels[channel].program;
      var instrumentId = MIDI.GM.byId[instrument].id;
      var note = notes[note];
      if (note) {
        var instrumentNoteId = instrumentId + '' + note.id;
        var nid = (buffer_nid + 1) % audioBuffers.length;
        var audio = audioBuffers[nid];
        notesOn[ nid ] = instrumentNoteId;
        if (!MIDI.Soundfont[instrumentId]) {
          MIDI.DEBUG && console.log('404', instrumentId);
          return;
        }
        audio.src = MIDI.Soundfont[instrumentId][note.id];
        audio.volume = volume / 127;
        audio.play();
        buffer_nid = nid;
      }
    };

    function stopChannel(channel, note) {
      if (!MIDI.channels[channel]) return;
      var instrument = MIDI.channels[channel].program;
      var instrumentId = MIDI.GM.byId[instrument].id;
      var note = notes[note];
      if (note) {
        var instrumentNoteId = instrumentId + '' + note.id;
        for (var i = 0, len = audioBuffers.length; i < len; i++) {
            var nid = (i + buffer_nid + 1) % len;
            var cId = notesOn[nid];
            if (cId && cId == instrumentNoteId) {
                audioBuffers[nid].pause();
                notesOn[nid] = null;
                return;
            }
        }
      }
    };
    ///
    midi.audioBuffers = audioBuffers;
    midi.messageHandler = {};
    ///
    midi.send = function(data, delay) { };
    midi.setController = function(channel, type, value, delay) { };
    midi.setVolume = function(channel, n) {
      volume = n; //- should be channel specific volume
    };

    midi.pitchBend = function(channel, program, delay) { };

    midi.noteOn = function(channel, note, velocity, delay) {
      var id = noteToKey[note];
      if (notes[id]) {
        if (delay) {
          return setTimeout(function() {
            playChannel(channel, id);
          }, delay * 1000);
        } else {
          playChannel(channel, id);
        }
      }
    };

    midi.noteOff = function(channel, note, delay) {
//      var id = noteToKey[note];
//      if (notes[id]) {
//        if (delay) {
//          return setTimeout(function() {
//            stopChannel(channel, id);
//          }, delay * 1000)
//        } else {
//          stopChannel(channel, id);
//        }
//      }
    };

    midi.chordOn = function(channel, chord, velocity, delay) {
      for (var idx = 0; idx < chord.length; idx ++) {
        var n = chord[idx];
        var id = noteToKey[n];
        if (notes[id]) {
          if (delay) {
            return setTimeout(function() {
              playChannel(channel, id);
            }, delay * 1000);
          } else {
            playChannel(channel, id);
          }
        }
      }
    };

    midi.chordOff = function(channel, chord, delay) {
      for (var idx = 0; idx < chord.length; idx ++) {
        var n = chord[idx];
        var id = noteToKey[n];
        if (notes[id]) {
          if (delay) {
            return setTimeout(function() {
              stopChannel(channel, id);
            }, delay * 1000);
          } else {
            stopChannel(channel, id);
          }
        }
      }
    };

    midi.stopAllNotes = function() {
      for (var nid = 0, length = audioBuffers.length; nid < length; nid++) {
        audioBuffers[nid].pause();
      }
    };

    midi.connect = function(opts) {
      MIDI.setDefaultPlugin(midi);
      ///
      for (var key in MIDI.keyToNote) {
        noteToKey[MIDI.keyToNote[key]] = key;
        notes[key] = {id: key};
      }
      ///
      opts.onsuccess && opts.onsuccess();
    };
  })();

})(MIDI);

/*
  ----------------------------------------------------------
  Web Audio API - OGG | MPEG Soundbank
  ----------------------------------------------------------
  http://webaudio.github.io/web-audio-api/
  ----------------------------------------------------------
*/

(function(MIDI) { 'use strict';

  window.AudioContext && (function() {

    var audioContext = null; // new AudioContext();
    var useStreamingBuffer = false; // !!audioContext.createMediaElementSource;
    var midi = MIDI.WebAudio = {api: 'webaudio'};
    var ctx; // audio context
    var sources = {};
    var effects = {};
    var masterVolume = 127;
    var audioBuffers = {};
    ///
    midi.audioBuffers = audioBuffers;
    midi.messageHandler = {};
    ///
    midi.send = function(data, delay) {

    };

    midi.setController = function(channelId, type, value, delay) {

    };

    midi.setVolume = function(channelId, volume, delay) {
      if (delay) {
        setTimeout(function() {
          masterVolume = volume;
        }, delay * 1000);
      } else {
        masterVolume = volume;
      }
    };

    midi.pitchBend = function(channelId, bend, delay) {
      var channel = MIDI.channels[channelId];
      if (channel) {
        if (delay) {
          setTimeout(function() {
            channel.pitchBend = bend;
          }, delay);
        } else {
          channel.pitchBend = bend;
        }
      }
    };

    midi.noteOn = function(channelId, noteId, velocity, delay) {
      delay = delay || 0;

      /// check whether the note exists
      var channel = MIDI.channels[channelId];
      var instrument = channel.program;
      var bufferId = instrument + 'x' + noteId;
      var buffer = audioBuffers[bufferId];
      if (buffer) {
        /// convert relative delay to absolute delay
        if (delay < ctx.currentTime) {
          delay += ctx.currentTime;
        }

        /// create audio buffer
        if (useStreamingBuffer) {
          var source = ctx.createMediaElementSource(buffer);
        } else { // XMLHTTP buffer
          var source = ctx.createBufferSource();
          source.buffer = buffer;
        }

        /// add effects to buffer
        if (effects) {
          var chain = source;
          for (var key in effects) {
            chain.connect(effects[key].input);
            chain = effects[key];
          }
        }

        /// add gain + pitchShift
        var gain = (velocity / 127) * (masterVolume / 127) * 2 - 1;
        source.connect(ctx.destination);
        source.playbackRate.value = 1; // pitch shift
        source.gainNode = ctx.createGain(); // gain
        source.gainNode.connect(ctx.destination);
        source.gainNode.gain.value = Math.min(1.0, Math.max(-1.0, gain));
        source.connect(source.gainNode);
        ///
        if (useStreamingBuffer) {
          if (delay) {
            return setTimeout(function() {
              buffer.currentTime = 0;
              buffer.play()
            }, delay * 1000);
          } else {
            buffer.currentTime = 0;
            buffer.play()
          }
        } else {
          source.start(delay || 0);
        }
        ///
        sources[channelId + 'x' + noteId] = source;
        ///
        return source;
      } else {
        MIDI.handleError('no buffer', arguments);
      }
    };

    midi.noteOff = function(channelId, noteId, delay) {
      delay = delay || 0;

      /// check whether the note exists
      var channel = MIDI.channels[channelId];
      var instrument = channel.program;
      var bufferId = instrument + 'x' + noteId;
      var buffer = audioBuffers[bufferId];
      if (buffer) {
        if (delay < ctx.currentTime) {
          delay += ctx.currentTime;
        }
        ///
        var source = sources[channelId + 'x' + noteId];
        if (source) {
          if (source.gainNode) {
            // @Miranet: 'the values of 0.2 and 0.3 could of course be used as
            // a 'release' parameter for ADSR like time settings.'
            // add { 'metadata': { release: 0.3 } } to soundfont files
            var gain = source.gainNode.gain;
            gain.linearRampToValueAtTime(gain.value, delay);
            gain.linearRampToValueAtTime(-1.0, delay + 0.3);
          }
          ///
          if (useStreamingBuffer) {
            if (delay) {
              setTimeout(function() {
                buffer.pause();
              }, delay * 1000);
            } else {
              buffer.pause();
            }
          } else {
            if (source.noteOff) {
              source.noteOff(delay + 0.5);
            } else {
              source.stop(delay + 0.5);
            }
          }
          ///
          delete sources[channelId + 'x' + noteId];
          ///
          return source;
        }
      }
    };

    midi.chordOn = function(channel, chord, velocity, delay) {
      var res = {};
      for (var n = 0, note, len = chord.length; n < len; n++) {
        res[note = chord[n]] = midi.noteOn(channel, note, velocity, delay);
      }
      return res;
    };

    midi.chordOff = function(channel, chord, delay) {
      var res = {};
      for (var n = 0, note, len = chord.length; n < len; n++) {
        res[note = chord[n]] = midi.noteOff(channel, note, delay);
      }
      return res;
    };

    midi.stopAllNotes = function() {
      for (var sid in sources) {
        var delay = 0;
        if (delay < ctx.currentTime) {
          delay += ctx.currentTime;
        }
        var source = sources[sid];
        source.gain.linearRampToValueAtTime(1, delay);
        source.gain.linearRampToValueAtTime(0, delay + 0.3);
        if (source.noteOff) { // old api
          source.noteOff(delay + 0.3);
        } else { // new api
          source.stop(delay + 0.3);
        }
        delete sources[sid];
      }
    };

    midi.setEffects = function(list) {
      if (ctx.tunajs) {
        for (var n = 0; n < list.length; n ++) {
          var data = list[n];
          var effect = new ctx.tunajs[data.type](data);
          effect.connect(ctx.destination);
          effects[data.type] = effect;
        }
      } else {
        MIDI.handleError('effects not installed.', arguments);
        return;
      }
    };

    midi.connect = function(opts) {
      MIDI.setDefaultPlugin(midi);
      midi.setContext(ctx || createAudioContext(), opts.onsuccess);
    };

    midi.getContext = function() {
      return ctx;
    };

    midi.setContext = function(newCtx, onsuccess, onprogress, onerror) {
      ctx = newCtx;

      /// tuna.js effects module - https://github.com/Dinahmoe/tuna
      if (typeof Tuna !== 'undefined') {
        if (!(ctx.tunajs instanceof Tuna)) {
          ctx.tunajs = new Tuna(ctx);
        }
      }

      /// loading audio files
      var urls = [];
      var notes = MIDI.keyToNote;
      for (var key in notes) {
        urls.push(key);
      }
      ///
      function waitForEnd(instrument) {
        for (var key in bufferPending) { // has pending items
          if (bufferPending[key]) {
            return;
          }
        }
        if (onsuccess) { // run onsuccess once
          onsuccess();
          onsuccess = null;
        }
      };

      function requestAudio(soundfont, programId, index, key) {
        var url = soundfont[key];
        if (url) {
          bufferPending[programId] ++;
          loadAudio(url, function(buffer) {
            buffer.id = key;
            var noteId = MIDI.keyToNote[key];
            audioBuffers[programId + 'x' + noteId] = buffer;
            ///
            if (--bufferPending[programId] === 0) {
              var percent = index / 87;
              soundfont.isLoaded = true;
              MIDI.DEBUG && console.log('loaded: ', instrument);
              waitForEnd(instrument);
            }
          }, function() {
            MIDI.handleError('audio could not load', arguments);
          });
        }
      };
      ///
      var bufferPending = {};
      var soundfonts = MIDI.Soundfont;
      for (var instrument in soundfonts) {
        var soundfont = soundfonts[instrument];
        if (soundfont.isLoaded) {
          continue;
        } else {
          var spec = MIDI.GM.byName[instrument];
          if (spec) {
            var programId = spec.program;
            ///
            bufferPending[programId] = 0;
            ///
            for (var index = 0; index < urls.length; index++) {
              var key = urls[index];
              requestAudio(soundfont, programId, index, key);
            }
          }
        }
      }
      ///
      setTimeout(waitForEnd, 1);
    };


    /* Load audio file: streaming | base64 | arraybuffer
    ---------------------------------------------------------------------- */
    function loadAudio(url, onsuccess, onerror) {
      if (useStreamingBuffer) {
        var audio = new Audio();
        audio.src = url;
        audio.controls = false;
        audio.autoplay = false;
        audio.preload = false;
        audio.addEventListener('canplay', function() {
          onsuccess && onsuccess(audio);
        });
        audio.addEventListener('error', function(err) {
          onerror && onerror(err);
        });
        document.body.appendChild(audio);
      } else if (url.indexOf('data:audio') === 0) { // Base64 string
        var base64 = url.split(',')[1];
        var buffer = Base64Binary.decodeArrayBuffer(base64);
        ctx.decodeAudioData(buffer, onsuccess, onerror);
      } else { // XMLHTTP buffer
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
          ctx.decodeAudioData(request.response, onsuccess, onerror);
        };
        request.send();
      }
    };

    function createAudioContext() {
      return new (window.AudioContext || window.webkitAudioContext)();
    };
  })();
})(MIDI);

/*
  ----------------------------------------------------------------------
  Web MIDI API - Native Soundbanks
  ----------------------------------------------------------------------
  http://webaudio.github.io/web-midi-api/
  ----------------------------------------------------------------------
*/

(function(MIDI) { 'use strict';

  var output = null;
  var channels = [];
  var midi = MIDI.WebMIDI = {api: 'webmidi'};

  midi.messageHandler = {};
  midi.messageHandler.program = function(channelId, program, delay) { // change patch (instrument)
    output.send([0xC0 + channelId, program], delay * 1000);
  };

  midi.send = function(data, delay) {
    output.send(data, delay * 1000);
  };

  midi.setController = function(channelId, type, value, delay) {
    output.send([channelId, type, value], delay * 1000);
  };

  midi.setVolume = function(channelId, volume, delay) { // set channel volume
    output.send([0xB0 + channelId, 0x07, volume], delay * 1000);
  };

  midi.pitchBend = function(channelId, program, delay) { // pitch bend
    output.send([0xE0 + channelId, program], delay * 1000);
  };

  midi.noteOn = function(channelId, note, velocity, delay) {
    output.send([0x90 + channelId, note, velocity], delay * 1000);
  };

  midi.noteOff = function(channelId, note, delay) {
    output.send([0x80 + channelId, note, 0], delay * 1000);
  };

  midi.chordOn = function(channelId, chord, velocity, delay) {
    for (var n = 0; n < chord.length; n ++) {
      var note = chord[n];
      output.send([0x90 + channelId, note, velocity], delay * 1000);
    }
  };

  midi.chordOff = function(channelId, chord, delay) {
    for (var n = 0; n < chord.length; n ++) {
      var note = chord[n];
      output.send([0x80 + channelId, note, 0], delay * 1000);
    }
  };

  midi.stopAllNotes = function() {
    output.cancel();
    for (var channelId = 0; channelId < 16; channelId ++) {
      output.send([0xB0 + channelId, 0x7B, 0]);
    }
  };

  midi.connect = function(opts) {
    var onsuccess = opts.onsuccess;
    var onerror = opts.onerror;
    ///
    MIDI.setDefaultPlugin(midi);
    ///
    function errFunction(err) { // well at least we tried!
      onerror && onerror(err);
      ///
      if (window.AudioContext) { // Chrome
        opts.api = 'webaudio';
      } else if (window.Audio) { // Firefox
        opts.api = 'audiotag';
      } else { // no support
        return;
      }
      ///
      MIDI.loadPlugin(opts);
    };
    ///
    navigator.requestMIDIAccess().then(function(access) {
      var pluginOutputs = access.outputs;
      if (typeof pluginOutputs == 'function') { // Chrome pre-43
        output = pluginOutputs()[0];
      } else { // Chrome post-43
        output = pluginOutputs[0];
      }
      if (output === undefined) { // no outputs
        errFunction();
      } else {
        onsuccess && onsuccess();
      }
    }, onerror);
  };

})(MIDI);


/*
  ----------------------------------------------------------
  MIDI.Player : 0.3.1 : 2015-03-26
  ----------------------------------------------------------
  https://github.com/mudcube/MIDI.js
  ----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};
if (typeof MIDI.Player === 'undefined') MIDI.Player = {};

(function() { 'use strict';

var midi = MIDI.Player;
midi.currentTime = 0;
midi.endTime = 0;
midi.restart = 0;
midi.playing = false;
midi.timeWarp = 1;
midi.startDelay = 0;
midi.BPM = 120;

midi.start =
midi.resume = function(onsuccess) {
    if (midi.currentTime < -1) {
      midi.currentTime = -1;
    }
    startAudio(midi.currentTime, null, onsuccess);
};

midi.pause = function() {
  var tmp = midi.restart;
  stopAudio();
  midi.restart = tmp;
};

midi.stop = function() {
  stopAudio();
  midi.restart = 0;
  midi.currentTime = 0;
};

midi.addListener = function(onsuccess) {
  onMidiEvent = onsuccess;
};

midi.removeListener = function() {
  onMidiEvent = undefined;
};

midi.clearAnimation = function() {
  if (midi.animationFrameId)  {
    cancelAnimationFrame(midi.animationFrameId);
  }
};

midi.setAnimation = function(callback) {
  var currentTime = 0;
  var tOurTime = 0;
  var tTheirTime = 0;
  //
  midi.clearAnimation();
  ///
  var frame = function() {
    midi.animationFrameId = requestAnimationFrame(frame);
    ///
    if (midi.endTime === 0) {
      return;
    }
    if (midi.playing) {
      currentTime = (tTheirTime === midi.currentTime) ? tOurTime - Date.now() : 0;
      if (midi.currentTime === 0) {
        currentTime = 0;
      } else {
        currentTime = midi.currentTime - currentTime;
      }
      if (tTheirTime !== midi.currentTime) {
        tOurTime = Date.now();
        tTheirTime = midi.currentTime;
      }
    } else { // paused
      currentTime = midi.currentTime;
    }
    ///
    var endTime = midi.endTime;
    var percent = currentTime / endTime;
    var total = currentTime / 1000;
    var minutes = total / 60;
    var seconds = total - (minutes * 60);
    var t1 = minutes * 60 + seconds;
    var t2 = (endTime / 1000);
    ///
    if (t2 - t1 < -1.0) {
      return;
    } else {
      callback({
        now: t1,
        end: t2,
        events: noteRegistrar
      });
    }
  };
  ///
  requestAnimationFrame(frame);
};

// helpers

midi.loadMidiFile = function(onsuccess, onprogress, onerror) {
  try {
    midi.replayer = new Replayer(MidiFile(midi.currentData), midi.timeWarp, null, midi.BPM);
    midi.data = midi.replayer.getData();
    midi.endTime = getLength();
    ///
    MIDI.loadPlugin({
//      instruments: midi.getFileInstruments(),
      onsuccess: onsuccess,
      onprogress: onprogress,
      onerror: onerror
    });
  } catch(event) {
    onerror && onerror(event);
  }
};

midi.loadFile = function(file, onsuccess, onprogress, onerror) {
  midi.stop();
  if (file.indexOf('base64,') !== -1) {
    var data = window.atob(file.split(',')[1]);
    midi.currentData = data;
    midi.loadMidiFile(onsuccess, onprogress, onerror);
  } else {
    var fetch = new XMLHttpRequest();
    fetch.open('GET', file);
    fetch.overrideMimeType('text/plain; charset=x-user-defined');
    fetch.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          var t = this.responseText || '';
          var ff = [];
          var mx = t.length;
          var scc = String.fromCharCode;
          for (var z = 0; z < mx; z++) {
            ff[z] = scc(t.charCodeAt(z) & 255);
          }
          ///
          var data = ff.join('');
          midi.currentData = data;
          midi.loadMidiFile(onsuccess, onprogress, onerror);
        } else {
          onerror && onerror('Unable to load MIDI file');
        }
      }
    };
    fetch.send();
  }
};

midi.getFileInstruments = function() {
  var instruments = {};
  var programs = {};
  for (var n = 0; n < midi.data.length; n ++) {
    var event = midi.data[n][0].event;
    if (event.type !== 'channel') {
      continue;
    }
    var channel = event.channel;
    switch(event.subtype) {
      case 'controller':
//        console.log(event.channel, MIDI.defineControl[event.controllerType], event.value);
        break;
      case 'programChange':
        programs[channel] = event.programNumber;
        break;
      case 'noteOn':
        var program = programs[channel];
        var gm = MIDI.GM.byId[isFinite(program) ? program : channel];
        instruments[gm.id] = true;
        break;
    }
  }
  var ret = [];
  for (var key in instruments) {
    ret.push(key);
  }
  return ret;
};

// Playing the audio

var eventQueue = []; // hold events to be triggered
var queuedTime; //
var startTime = 0; // to measure time elapse
var noteRegistrar = {}; // get event for requested note
var onMidiEvent = undefined; // listener
var scheduleTracking = function(channel, note, currentTime, offset, message, velocity, time) {
  return setTimeout(function() {
    var data = {
      channel: channel,
      note: note,
      now: currentTime,
      end: midi.endTime,
      message: message,
      velocity: velocity
    };
    //
    if (message === 128) {
      delete noteRegistrar[note];
    } else {
      noteRegistrar[note] = data;
    }
    if (onMidiEvent) {
      onMidiEvent(data);
    }
    midi.currentTime = currentTime;
    ///
    eventQueue.shift();
    ///
    if (eventQueue.length < 1000) {
      startAudio(queuedTime, true);
    } else if (midi.currentTime === queuedTime && queuedTime < midi.endTime) { // grab next sequence
      startAudio(queuedTime, true);
    }
  }, currentTime - offset);
};

var getContext = function() {
  if (MIDI.api === 'webaudio') {
    return MIDI.WebAudio.getContext();
  } else {
    midi.ctx = {currentTime: 0};
  }
  return midi.ctx;
};

var getLength = function() {
  var data =  midi.data;
  var length = data.length;
  var totalTime = 0.5;
  for (var n = 0; n < length; n++) {
    totalTime += data[n][1];
  }
  return totalTime;
};

var __now;
var getNow = function() {
    if (window.performance && window.performance.now) {
        return window.performance.now();
    } else {
    return Date.now();
  }
};

var startAudio = function(currentTime, fromCache, onsuccess) {
  if (!midi.replayer) {
    return;
  }
  if (!fromCache) {
    if (typeof currentTime === 'undefined') {
      currentTime = midi.restart;
    }
    ///
    midi.playing && stopAudio();
    midi.playing = true;
    midi.data = midi.replayer.getData();
    midi.endTime = getLength();
  }
  ///
  var note;
  var offset = 0;
  var messages = 0;
  var data = midi.data;
  var ctx = getContext();
  var length = data.length;
  //
  queuedTime = 0.5;
  ///
  var interval = eventQueue[0] && eventQueue[0].interval || 0;
  var foffset = currentTime - midi.currentTime;
  ///
  if (MIDI.api !== 'webaudio') { // set currentTime on ctx
    var now = getNow();
    __now = __now || now;
    ctx.currentTime = (now - __now) / 1000;
  }
  ///
  startTime = ctx.currentTime;
  ///
  for (var n = 0; n < length && messages < 100; n++) {
    var obj = data[n];
    if ((queuedTime += obj[1]) <= currentTime) {
      offset = queuedTime;
      continue;
    }
    ///
    currentTime = queuedTime - offset;
    ///
    var event = obj[0].event;
    if (event.type !== 'channel') {
      continue;
    }
    ///
    var channelId = event.channel;
    var channel = MIDI.channels[channelId];
    var delay = ctx.currentTime + ((currentTime + foffset + midi.startDelay) / 1000);
    var queueTime = queuedTime - offset + midi.startDelay;
    switch (event.subtype) {
      case 'controller':
        MIDI.setController(channelId, event.controllerType, event.value, delay);
        break;
      case 'programChange':
        MIDI.programChange(channelId, event.programNumber, delay);
        break;
      case 'pitchBend':
        MIDI.pitchBend(channelId, event.value, delay);
        break;
      case 'noteOn':
        if (channel.mute) break;
        note = event.noteNumber - (midi.MIDIOffset || 0);
        eventQueue.push({
            event: event,
            time: queueTime,
            source: MIDI.noteOn(channelId, event.noteNumber, event.velocity, delay),
            interval: scheduleTracking(channelId, note, queuedTime + midi.startDelay, offset - foffset, 144, event.velocity)
        });
        messages++;
        break;
      case 'noteOff':
        if (channel.mute) break;
        note = event.noteNumber - (midi.MIDIOffset || 0);
        eventQueue.push({
            event: event,
            time: queueTime,
            source: MIDI.noteOff(channelId, event.noteNumber, delay),
            interval: scheduleTracking(channelId, note, queuedTime, offset - foffset, 128, 0)
        });
        break;
      default:
        break;
    }
  }
  ///
  onsuccess && onsuccess(eventQueue);
};

var stopAudio = function() {
  var ctx = getContext();
  midi.playing = false;
  midi.restart += (ctx.currentTime - startTime) * 1000;
  // stop the audio, and intervals
  while (eventQueue.length) {
    var o = eventQueue.pop();
    window.clearInterval(o.interval);
    if (!o.source) continue; // is not webaudio
    if (typeof(o.source) === 'number') {
      window.clearTimeout(o.source);
    } else { // webaudio
      o.source.disconnect(0);
    }
  }
  // run callback to cancel any notes still playing
  for (var key in noteRegistrar) {
    var o = noteRegistrar[key]
    if (noteRegistrar[key].message === 144 && onMidiEvent) {
      onMidiEvent({
        channel: o.channel,
        note: o.note,
        now: o.now,
        end: o.end,
        message: 128,
        velocity: o.velocity
      });
    }
  }
  // reset noteRegistrar
  noteRegistrar = {};
};

})();

/*
  ----------------------------------------------------------
  MIDI.Synesthesia : 2015-05-30
  ----------------------------------------------------------
  Peacock   “Instruments to perform color-music: Two centuries of technological experimentation,” Leonardo, 21 (1988), 397-406.
  Gerstner  Karl Gerstner, The Forms of Color 1986.
  Klein   Colour-Music: The art of light, London: Crosby Lockwood and Son, 1927.
  Jameson   “Visual music in a visual programming language,” IEEE Symposium on Visual Languages, 1999, 111-118.
  Helmholtz Treatise on Physiological Optics, New York: Dover Books, 1962.
  Jones   The art of light & color, New York: Van Nostrand Reinhold, 1972.
  ----------------------------------------------------------
  Reference http://rhythmiclight.com/archives/ideas/colorscales.html
  ----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') var MIDI = {};

MIDI.Synesthesia = MIDI.Synesthesia || {};

(function(root) {
  var defs = {
    'Isaac Newton (1704)': {
      format: 'HSL',
      ref: 'Gerstner, p.167',
      english: ['red', null, 'orange', null, 'yellow', 'green', null, 'blue', null, 'indigo', null, 'violet'],
      0: [ 0, 96, 51 ], // C
      1: [ 0, 0, 0 ], // C#
      2: [ 29, 94, 52 ], // D
      3: [ 0, 0, 0 ], // D#
      4: [ 60, 90, 60 ], // E
      5: [ 135, 76, 32 ], // F
      6: [ 0, 0, 0 ], // F#
      7: [ 248, 82, 28 ], // G
      8: [ 0, 0, 0 ], // G#
      9: [ 302, 88, 26 ], // A
      10: [ 0, 0, 0 ], // A#
      11: [ 325, 84, 46 ] // B
    },
    'Louis Bertrand Castel (1734)': {
      format: 'HSL',
      ref: 'Peacock, p.400',
      english: ['blue', 'blue-green', 'green', 'olive green', 'yellow', 'yellow-orange', 'orange', 'red', 'crimson', 'violet', 'agate', 'indigo'],
      0: [ 248, 82, 28 ],
      1: [ 172, 68, 34 ],
      2: [ 135, 76, 32 ],
      3: [ 79, 59, 36 ],
      4: [ 60, 90, 60 ],
      5: [ 49, 90, 60 ],
      6: [ 29, 94, 52 ],
      7: [ 360, 96, 51 ],
      8: [ 1, 89, 33 ],
      9: [ 325, 84, 46 ],
      10: [ 273, 80, 27 ],
      11: [ 302, 88, 26 ]
    },
    'George Field (1816)': {
      format: 'HSL',
      ref: 'Klein, p.69',
      english: ['blue', null, 'purple', null, 'red', 'orange', null, 'yellow', null, 'yellow green', null, 'green'],
      0: [ 248, 82, 28 ],
      1: [ 0, 0, 0 ],
      2: [ 302, 88, 26 ],
      3: [ 0, 0, 0 ],
      4: [ 360, 96, 51 ],
      5: [ 29, 94, 52 ],
      6: [ 0, 0, 0 ],
      7: [ 60, 90, 60 ],
      8: [ 0, 0, 0 ],
      9: [ 79, 59, 36 ],
      10: [ 0, 0, 0 ],
      11: [ 135, 76, 32 ]
    },
    'D. D. Jameson (1844)': {
      format: 'HSL',
      ref: 'Jameson, p.12',
      english: ['red', 'red-orange', 'orange', 'orange-yellow', 'yellow', 'green', 'green-blue', 'blue', 'blue-purple', 'purple', 'purple-violet', 'violet'],
      0: [ 360, 96, 51 ],
      1: [ 14, 91, 51 ],
      2: [ 29, 94, 52 ],
      3: [ 49, 90, 60 ],
      4: [ 60, 90, 60 ],
      5: [ 135, 76, 32 ],
      6: [ 172, 68, 34 ],
      7: [ 248, 82, 28 ],
      8: [ 273, 80, 27 ],
      9: [ 302, 88, 26 ],
      10: [ 313, 78, 37 ],
      11: [ 325, 84, 46 ]
    },
    'Theodor Seemann (1881)': {
      format: 'HSL',
      ref: 'Klein, p.86',
      english: ['carmine', 'scarlet', 'orange', 'yellow-orange', 'yellow', 'green', 'green blue', 'blue', 'indigo', 'violet', 'brown', 'black'],
      0: [ 0, 58, 26 ],
      1: [ 360, 96, 51 ],
      2: [ 29, 94, 52 ],
      3: [ 49, 90, 60 ],
      4: [ 60, 90, 60 ],
      5: [ 135, 76, 32 ],
      6: [ 172, 68, 34 ],
      7: [ 248, 82, 28 ],
      8: [ 302, 88, 26 ],
      9: [ 325, 84, 46 ],
      10: [ 0, 58, 26 ],
      11: [ 0, 0, 3 ]
    },
    'A. Wallace Rimington (1893)': {
      format: 'HSL',
      ref: 'Peacock, p.402',
      english: ['deep red', 'crimson', 'orange-crimson', 'orange', 'yellow', 'yellow-green', 'green', 'blueish green', 'blue-green', 'indigo', 'deep blue', 'violet'],
      0: [ 360, 96, 51 ],
      1: [ 1, 89, 33 ],
      2: [ 14, 91, 51 ],
      3: [ 29, 94, 52 ],
      4: [ 60, 90, 60 ],
      5: [ 79, 59, 36 ],
      6: [ 135, 76, 32 ],
      7: [ 163, 62, 40 ],
      8: [ 172, 68, 34 ],
      9: [ 302, 88, 26 ],
      10: [ 248, 82, 28 ],
      11: [ 325, 84, 46 ]
    },
    'Bainbridge Bishop (1893)': {
      format: 'HSL',
      ref: 'Bishop, p.11',
      english: ['red', 'orange-red or scarlet', 'orange', 'gold or yellow-orange', 'yellow or green-gold', 'yellow-green', 'green', 'greenish-blue or aquamarine', 'blue', 'indigo or violet-blue', 'violet', 'violet-red', 'red'],
      0: [ 360, 96, 51 ],
      1: [ 1, 89, 33 ],
      2: [ 29, 94, 52 ],
      3: [ 50, 93, 52 ],
      4: [ 60, 90, 60 ],
      5: [ 73, 73, 55 ],
      6: [ 135, 76, 32 ],
      7: [ 163, 62, 40 ],
      8: [ 302, 88, 26 ],
      9: [ 325, 84, 46 ],
      10: [ 343, 79, 47 ],
      11: [ 360, 96, 51 ]
    },
    'H. von Helmholtz (1910)': {
      format: 'HSL',
      ref: 'Helmholtz, p.22',
      english: ['yellow', 'green', 'greenish blue', 'cayan-blue', 'indigo blue', 'violet', 'end of red', 'red', 'red', 'red', 'red orange', 'orange'],
      0: [ 60, 90, 60 ],
      1: [ 135, 76, 32 ],
      2: [ 172, 68, 34 ],
      3: [ 211, 70, 37 ],
      4: [ 302, 88, 26 ],
      5: [ 325, 84, 46 ],
      6: [ 330, 84, 34 ],
      7: [ 360, 96, 51 ],
      8: [ 10, 91, 43 ],
      9: [ 10, 91, 43 ],
      10: [ 8, 93, 51 ],
      11: [ 28, 89, 50 ]
    },
    'Alexander Scriabin (1911)': {
      format: 'HSL',
      ref: 'Jones, p.104',
      english: ['red', 'violet', 'yellow', 'steely with the glint of metal', 'pearly blue the shimmer of moonshine', 'dark red', 'bright blue', 'rosy orange', 'purple', 'green', 'steely with a glint of metal', 'pearly blue the shimmer of moonshine'],
      0: [ 360, 96, 51 ],
      1: [ 325, 84, 46 ],
      2: [ 60, 90, 60 ],
      3: [ 245, 21, 43 ],
      4: [ 211, 70, 37 ],
      5: [ 1, 89, 33 ],
      6: [ 248, 82, 28 ],
      7: [ 29, 94, 52 ],
      8: [ 302, 88, 26 ],
      9: [ 135, 76, 32 ],
      10: [ 245, 21, 43 ],
      11: [ 211, 70, 37 ]
    },
    'Adrian Bernard Klein (1930)': {
      format: 'HSL',
      ref: 'Klein, p.209',
      english: ['dark red', 'red', 'red orange', 'orange', 'yellow', 'yellow green', 'green', 'blue-green', 'blue', 'blue violet', 'violet', 'dark violet'],
      0: [ 0, 91, 40 ],
      1: [ 360, 96, 51 ],
      2: [ 14, 91, 51 ],
      3: [ 29, 94, 52 ],
      4: [ 60, 90, 60 ],
      5: [ 73, 73, 55 ],
      6: [ 135, 76, 32 ],
      7: [ 172, 68, 34 ],
      8: [ 248, 82, 28 ],
      9: [ 292, 70, 31 ],
      10: [ 325, 84, 46 ],
      11: [ 330, 84, 34 ]
    },
    'August Aeppli (1940)': {
      format: 'HSL',
      ref: 'Gerstner, p.169',
      english: ['red', null, 'orange', null, 'yellow', null, 'green', 'blue-green', null, 'ultramarine blue', 'violet', 'purple'],
      0: [ 0, 96, 51 ],
      1: [ 0, 0, 0 ],
      2: [ 29, 94, 52 ],
      3: [ 0, 0, 0 ],
      4: [ 60, 90, 60 ],
      5: [ 0, 0, 0 ],
      6: [ 135, 76, 32 ],
      7: [ 172, 68, 34 ],
      8: [ 0, 0, 0 ],
      9: [ 211, 70, 37 ],
      10: [ 273, 80, 27 ],
      11: [ 302, 88, 26 ]
    },
    'I. J. Belmont (1944)': {
      ref: 'Belmont, p.226',
      english: ['red', 'red-orange', 'orange', 'yellow-orange', 'yellow', 'yellow-green', 'green', 'blue-green', 'blue', 'blue-violet', 'violet', 'red-violet'],
      0: [ 360, 96, 51 ],
      1: [ 14, 91, 51 ],
      2: [ 29, 94, 52 ],
      3: [ 50, 93, 52 ],
      4: [ 60, 90, 60 ],
      5: [ 73, 73, 55 ],
      6: [ 135, 76, 32 ],
      7: [ 172, 68, 34 ],
      8: [ 248, 82, 28 ],
      9: [ 313, 78, 37 ],
      10: [ 325, 84, 46 ],
      11: [ 338, 85, 37 ]
    },
    'Steve Zieverink (2004)': {
      format: 'HSL',
      ref: 'Cincinnati Contemporary Art Center',
      english: ['yellow-green', 'green', 'blue-green', 'blue', 'indigo', 'violet', 'ultra violet', 'infra red', 'red', 'orange', 'yellow-white', 'yellow'],
      0: [ 73, 73, 55 ],
      1: [ 135, 76, 32 ],
      2: [ 172, 68, 34 ],
      3: [ 248, 82, 28 ],
      4: [ 302, 88, 26 ],
      5: [ 325, 84, 46 ],
      6: [ 326, 79, 24 ],
      7: [ 1, 89, 33 ],
      8: [ 360, 96, 51 ],
      9: [ 29, 94, 52 ],
      10: [ 62, 78, 74 ],
      11: [ 60, 90, 60 ]
    },
    'Circle of Fifths (Johnston 2003)': {
      format: 'RGB',
      ref: 'Joseph Johnston',
      english: ['yellow', 'blue', 'orange', 'teal', 'red', 'green', 'purple', 'light orange', 'light blue', 'dark orange', 'dark green', 'violet'],
      0: [ 255, 255, 0 ],
      1: [ 50, 0, 255 ],
      2: [ 255, 150, 0 ],
      3: [ 0, 210, 180 ],
      4: [ 255, 0, 0 ],
      5: [ 130, 255, 0 ],
      6: [ 150, 0, 200 ],
      7: [ 255, 195, 0 ],
      8: [ 30, 130, 255 ],
      9: [ 255, 100, 0 ],
      10: [ 0, 200, 0 ],
      11: [ 225, 0, 225 ]
    },
    'Circle of Fifths (Wheatman 2002)': {
      format: 'HEX',
      ref: 'Stuart Wheatman', // http://www.valleysfamilychurch.org/
      english: [],
      data: ['#122400', '#2E002E', '#002914', '#470000', '#002142', '#2E2E00', '#290052', '#003D00', '#520029', '#003D3D', '#522900', '#000080', '#244700', '#570057', '#004D26', '#7A0000', '#003B75', '#4C4D00', '#47008F', '#006100', '#850042', '#005C5C', '#804000', '#0000C7', '#366B00', '#80007F', '#00753B', '#B80000', '#0057AD', '#6B6B00', '#6600CC', '#008A00', '#B8005C', '#007F80', '#B35900', '#2424FF', '#478F00', '#AD00AD', '#00994D', '#F00000', '#0073E6', '#8F8F00', '#8A14FF', '#00AD00', '#EB0075', '#00A3A3', '#E07000', '#6B6BFF', '#5CB800', '#DB00DB', '#00C261', '#FF5757', '#3399FF', '#ADAD00', '#B56BFF', '#00D600', '#FF57AB', '#00C7C7', '#FF9124', '#9999FF', '#6EDB00', '#FF29FF', '#00E070', '#FF9999', '#7ABDFF', '#D1D100', '#D1A3FF', '#00FA00', '#FFA3D1', '#00E5E6', '#FFC285', '#C2C2FF', '#80FF00', '#FFA8FF', '#00E070', '#FFCCCC', '#C2E0FF', '#F0F000', '#EBD6FF', '#ADFFAD', '#FFD6EB', '#8AFFFF', '#FFEBD6', '#EBEBFF', '#E0FFC2', '#FFEBFF', '#E5FFF2', '#FFF5F5']
    },
    'Daniel Christopher (2013)': {
      format: 'HEX',
      english: [],
      0: '33669A',
      1: '009999',
      2: '079948',
      3: '6FBE44',
      4: 'F6EC13',
      5: 'FFCD05',
      6: 'F89838',
      7: 'EF3B39',
      8: 'CC3366',
      9: 'CB9AC6',
      10: '89509F',
      11: '5e2c95'
    }
  };

  root.map = function(type) {
    var res = {};
    var blend = function(a, b) {
      return [ // blend two colors and round results
        (a[0] * 0.5 + b[0] * 0.5 + 0.5) >> 0,
        (a[1] * 0.5 + b[1] * 0.5 + 0.5) >> 0,
        (a[2] * 0.5 + b[2] * 0.5 + 0.5) >> 0
      ];
    };
    ///
    var colors = defs[type] || defs['D. D. Jameson (1844)'];
    for (var note = 0, pcolor; note <= 88; note ++) { // creates mapping for 88 notes
      if (colors.data) {
        res[note] = {
          hsl: colors.data[note],
          hex: colors.data[note]
        };
      } else {
        var color = colors[(note + 9) % 12];
        ///
        var H, S, L;
        switch(colors.format) {
          case 'HEX':
            color = Color.Space(color, 'W3>HEX>RGB');
          case 'RGB':
            color = Color.Space(color, 'RGB>HSL');
            H = color.H >> 0;
            S = color.S >> 0;
            L = color.L >> 0;
            break;
          case 'HSL':
            H = color[0];
            S = color[1];
            L = color[2];
            break;
        }
        ///
        if (H === S && S === L) { // note color is unset
          color = blend(pcolor, colors[(note + 10) % 12]);
        }
        ///
//        var amount = L / 10;
//        var octave = note / 12 >> 0;
//        var octaveLum = L + amount * octave - 3.0 * amount; // map luminance to octave
        ///
        res[note] = {
          hsl: 'hsla(' + H + ',' + S + '%,' + L + '%, 1)',
          hex: Color.Space({H: H, S: S, L: L}, 'HSL>RGB>HEX>W3')
        };
        ///
        pcolor = color;
      }
    }
    return res;
  };

})(MIDI.Synesthesia);


/*
  -----------------------------------------------------------
  dom.loadScript.js : 0.1.4 : 2014/02/12 : http://mudcu.be
  -----------------------------------------------------------
  Copyright 2011-2014 Mudcube. All rights reserved.
  -----------------------------------------------------------
  /// No verification
  dom.loadScript.add("../js/jszip/jszip.js");
  /// Strict loading order and verification.
  dom.loadScript.add({
    strictOrder: true,
    urls: [
      {
        url: "../js/jszip/jszip.js",
        verify: "JSZip",
        onsuccess: function() {
          console.log(1)
        }
      },
      {
        url: "../inc/downloadify/js/swfobject.js",
        verify: "swfobject",
        onsuccess: function() {
          console.log(2)
        }
      }
    ],
    onsuccess: function() {
      console.log(3)
    }
  });
  /// Just verification.
  dom.loadScript.add({
    url: "../js/jszip/jszip.js",
    verify: "JSZip",
    onsuccess: function() {
      console.log(1)
    }
  });
*/

if (typeof(dom) === "undefined") var dom = {};

(function() { "use strict";

dom.loadScript = function() {
  this.loaded = {};
  this.loading = {};
  return this;
};

dom.loadScript.prototype.add = function(config) {
  var that = this;
  if (typeof(config) === "string") {
    config = { url: config };
  }
  var urls = config.urls;
  if (typeof(urls) === "undefined") {
    urls = [{
      url: config.url,
      verify: config.verify
    }];
  }
  /// adding the elements to the head
  var doc = document.getElementsByTagName("head")[0];
  ///
  var testElement = function(element, test) {
    if (that.loaded[element.url]) return;
    if (test && globalExists(test) === false) return;
    that.loaded[element.url] = true;
    //
    if (that.loading[element.url]) that.loading[element.url]();
    delete that.loading[element.url];
    //
    if (element.onsuccess) element.onsuccess();
    if (typeof(getNext) !== "undefined") getNext();
  };
  ///
  var hasError = false;
  var batchTest = [];
  var addElement = function(element) {
    if (typeof(element) === "string") {
      element = {
        url: element,
        verify: config.verify
      };
    }
    if (/([\w\d.\[\]\'\"])$/.test(element.verify)) { // check whether its a variable reference
      var verify = element.test = element.verify;
      if (typeof(verify) === "object") {
        for (var n = 0; n < verify.length; n ++) {
          batchTest.push(verify[n]);
        }
      } else {
        batchTest.push(verify);
      }
    }
    if (that.loaded[element.url]) return;
    var script = document.createElement("script");
    script.onreadystatechange = function() {
      if (this.readyState !== "loaded" && this.readyState !== "complete") return;
      testElement(element);
    };
    script.onload = function() {
      testElement(element);
    };
    script.onerror = function() {
      hasError = true;
      delete that.loading[element.url];
      if (typeof(element.test) === "object") {
        for (var key in element.test) {
          removeTest(element.test[key]);
        }
      } else {
        removeTest(element.test);
      }
    };
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", element.url);
    doc.appendChild(script);
    that.loading[element.url] = function() {};
  };
  /// checking to see whether everything loaded properly
  var removeTest = function(test) {
    var ret = [];
    for (var n = 0; n < batchTest.length; n ++) {
      if (batchTest[n] === test) continue;
      ret.push(batchTest[n]);
    }
    batchTest = ret;
  };
  var onLoad = function(element) {
    if (element) {
      testElement(element, element.test);
    } else {
      for (var n = 0; n < urls.length; n ++) {
        testElement(urls[n], urls[n].test);
      }
    }
    var istrue = true;
    for (var n = 0; n < batchTest.length; n ++) {
      if (globalExists(batchTest[n]) === false) {
        istrue = false;
      }
    }
    if (!config.strictOrder && istrue) { // finished loading all the requested scripts
      if (hasError) {
        if (config.error) {
          config.error();
        }
      } else if (config.onsuccess) {
        config.onsuccess();
      }
    } else { // keep calling back the function
      setTimeout(function() { //- should get slower over time?
        onLoad(element);
      }, 10);
    }
  };
  /// loading methods;  strict ordering or loose ordering
  if (config.strictOrder) {
    var ID = -1;
    var getNext = function() {
      ID ++;
      if (!urls[ID]) { // all elements are loaded
        if (hasError) {
          if (config.error) {
            config.error();
          }
        } else if (config.onsuccess) {
          config.onsuccess();
        }
      } else { // loading new script
        var element = urls[ID];
        var url = element.url;
        if (that.loading[url]) { // already loading from another call (attach to event)
          that.loading[url] = function() {
            if (element.onsuccess) element.onsuccess();
            getNext();
          }
        } else if (!that.loaded[url]) { // create script element
          addElement(element);
          onLoad(element);
        } else { // it's already been successfully loaded
          getNext();
        }
      }
    };
    getNext();
  } else { // loose ordering
    for (var ID = 0; ID < urls.length; ID ++) {
      addElement(urls[ID]);
      onLoad(urls[ID]);
    }
  }
};

dom.loadScript = new dom.loadScript();

function globalExists(path, root) {
  try {
    path = path.split('"').join('').split("'").join('').split(']').join('').split('[').join('.');
    var parts = path.split(".");
    var length = parts.length;
    var object = root || window;
    for (var n = 0; n < length; n ++) {
      var key = parts[n];
      if (object[key] == null) {
        return false;
      } else { //
        object = object[key];
      }
    }
    return true;
  } catch(e) {
    return false;
  }
};

})();

/// For NodeJS
if (typeof (module) !== "undefined" && module.exports) {
  module.exports = dom.loadScript;
}

/*
  ----------------------------------------------------------
  util.request : 0.1.1 : 2015-04-12 : https://mudcu.be
  ----------------------------------------------------------
  XMLHttpRequest - IE7+ | Chrome 1+ | Firefox 1+ | Safari 1.2+
  CORS - IE10+ | Chrome 3+ | Firefox 3.5+ | Safari 4+
  ----------------------------------------------------------
  util.request({
    url: './dir/something.extension',
    data: 'test!',
    format: 'text', // text | xml | json
    responseType: 'text', // arraybuffer | blob | document | json | text
    headers: {},
    withCredentials: true, // true | false
    ///
    onerror: function(evt, percent) {
      console.log(evt);
    },
    onsuccess: function(evt, responseText) {
      console.log(responseText);
    },
    onprogress: function(evt, percent) {
      percent = Math.round(percent * 100);
      loader.create('thread', 'loading... ', percent);
    }
  });


  https://mathiasbynens.be/demo/xhr-responsetype //- shim for responseType='json'

*/

if (typeof galactic === 'undefined') galactic = {};

(function(root) {

  var util = root.util || (root.util = {});

  util.request = function(opts, onsuccess, onerror, onprogress) { 'use strict';
    if (typeof opts === 'string') opts = {url: opts};
    ///
    var data = opts.data;
    var url = opts.url;
    var method = opts.method || (opts.data ? 'POST' : 'GET');
    var format = opts.format;
    var headers = opts.headers;
    var responseType = opts.responseType;
    var withCredentials = opts.withCredentials || false;
    ///
    var onprogress = onprogress || opts.onprogress;
    var onsuccess = onsuccess || opts.onsuccess;
    var onerror = onerror || opts.onerror;
    ///
    if (typeof NodeFS !== 'undefined' && root.loc.isLocalUrl(url)) {
      NodeFS.readFile(url, 'utf8', function(err, res) {
        if (err) {
          onerror && onerror(err);
        } else {
          onsuccess && onsuccess({responseText: res});
        }
      });
      return;
    }
    ///
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    ///
    if (headers) {
      for (var type in headers) {
        xhr.setRequestHeader(type, headers[type]);
      }
    } else if (data) { // set the default headers for POST
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    if (responseType) {
      xhr.responseType = responseType;
    }
    if (withCredentials) {
      xhr.withCredentials = true;
    }
    if (onerror && 'onerror' in xhr) {
      xhr.onerror = onerror;
    }
    if (onprogress && xhr.upload && 'onprogress' in xhr.upload) {
      if (data) {
        xhr.upload.onprogress = function(evt) {
          onprogress.call(xhr, evt, event.loaded / event.total);
        };
      } else {
        xhr.addEventListener('progress', function(evt) {
          var totalBytes = 0;
          if (evt.lengthComputable) {
            totalBytes = evt.total;
          } else if (xhr.totalBytes) {
            totalBytes = xhr.totalBytes;
          } else {
            var rawBytes = parseInt(xhr.getResponseHeader('Content-Length-Raw'));
            if (isFinite(rawBytes)) {
              xhr.totalBytes = totalBytes = rawBytes;
            } else {
              return;
            }
          }
          onprogress.call(xhr, evt, evt.loaded / totalBytes);
        });
      }
    }

    xhr.onreadystatechange = function(evt) {
      if (xhr.readyState === 4) { // The request is complete
        if (xhr.status === 200 || // Response OK
          xhr.status === 304 || // Not Modified
          xhr.status === 308 || // Permanent Redirect
          xhr.status === 0 && root.client.cordova // Cordova quirk
        ) {
          if (onsuccess) {
            var res;
            if (format === 'json') {
              try {
                res = JSON.parse(evt.target.response);
              } catch(err) {
                onerror && onerror.call(xhr, evt);
              }
            } else if (format === 'xml') {
              res = evt.target.responseXML;
            } else if (format === 'text') {
              res = evt.target.responseText;
            } else {
              res = evt.target.response;
            }
            ///
            onsuccess.call(xhr, evt, res);
          }
        } else {
          onerror && onerror.call(xhr, evt);
        }
      }
    };
    xhr.send(data);
    return xhr;
  };

  /// NodeJS
  if (typeof module !== 'undefined' && module.exports) {
    var NodeFS = require('fs');
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
    module.exports = root.util.request;
  }

})(galactic);
