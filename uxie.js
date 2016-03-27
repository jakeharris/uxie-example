require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

// The wrong number of parameters was supplied
// to a function.
function ParameterCountError(msg) {
  'use strict';
  Error.captureStackTrace(this, this.constructor)
  this.name = 'ParameterCountError'
  this.message = msg
}

// The function wasn't complete, or an
// interface method should have been overridden
// that was not.
function NotImplementedError(msg) {
  'use strict';
  Error.captureStackTrace(this, this.constructor)
  this.name = 'NotImplementedError'
  this.message = msg
}


// The function wasn't complete, or an
// interface method should have been overridden
// that was not.
function TriggerConflictError(msg) {
  'use strict';
  Error.captureStackTrace(this, this.constructor)
  this.name = 'TriggerConflictError'
  this.message = msg
}

ParameterCountError.prototype = Object.create(Error.prototype)
ParameterCountError.prototype.constructor = ParameterCountError

NotImplementedError.prototype = Object.create(Error.prototype)
NotImplementedError.prototype.constructor = NotImplementedError

TriggerConflictError.prototype = Object.create(Error.prototype)
TriggerConflictError.prototype.constructor = TriggerConflictError

module.exports.ParameterCountError = ParameterCountError
module.exports.NotImplementedError = NotImplementedError
module.exports.TriggerConflictError = TriggerConflictError
},{}],2:[function(require,module,exports){
module.exports = EventFactoryFactory

var ParameterCountError = require('../errors').ParameterCountError,
    TemporalEventFactory = require('./temporal-event-factory'),
    PhysicalEventFactory = require('./physical-event-factory')

// I'm sure this is confusing, but it was necessary for leaving this customizable.

// EventFactoryFactories produce EventFactories. EventFactories produce Events.
// EventFactoryFactories figure out what kind of EventFactories to produce based on
// config.json. If one does not exist, it will use defaults (DefaultEventTypesFactory).
// If you create a config.json, but would like to use the default handlers for certain kinds of
// events, read the README/check out the Github.

// You should need nothing here unless you are trying to create custom event handlers.


// A Factory for EventFactories! That's not confusing!
function EventFactoryFactory (typeMap, customTypes) {
  'use strict';
  if(typeof typeMap === 'undefined')
    this.typeMap = EventFactoryFactory.DEFAULT_TYPE_MAP
  else if (typeof customTypes === 'undefined') 
    throw new ParameterCountError('Because a custom type map is supplied, you must also supply an array containing constructors for your custom types.')
  else if (typeof typeMap !== 'object')
    throw new TypeError('The type map must be a traditional Javascript object.')
  else
    this.typeMap = typeMap
}

EventFactoryFactory.prototype = Object.create(Object.prototype)
EventFactoryFactory.prototype.constructor = EventFactoryFactory

// Returns an array of all required EventFactories.
EventFactoryFactory.prototype.generate = function () {
  var factories = {}
  
  for(var k in this.typeMap)
    factories[k] = new this.typeMap[k]()
  
  this.types = factories
  return this.types
}

// Returns the factory for the given event type, if one is mapped.
// e.g. 'temporal', 'physical'; NOT 'wait', 'click'
EventFactoryFactory.prototype.getFactoryFor = function (type) {
  if(type === undefined) 
    throw new ParameterCountError('An event type (string) must be supplied.')
  if(typeof type !== 'string')
    throw new TypeError('The event type name must be a string. Received: ' + typeof type + '.')
  if(this.typeMap[type] === undefined)
    throw new Error('No factory exists of the given event type. Received: ' + type + '.')
    
  return this.types[type]
}

// Contains default mappings for basic time-based and physical-interaction-based events.
EventFactoryFactory.DEFAULT_TYPE_MAP = { 'temporal': TemporalEventFactory, 'physical': PhysicalEventFactory }
},{"../errors":1,"./physical-event-factory":4,"./temporal-event-factory":5}],3:[function(require,module,exports){
module.exports = EventFactory

var ParameterCountError = require('../errors').ParameterCountError,
    NotImplementedError = require('../errors').NotImplementedError

function EventFactory(name) {
  'use strict';
  throw new NotImplementedError('This class is abstract by design. Extend this class (via proper use of prototypes -- see TemporalEventFactory for an example) if you want things to work out.')
}

EventFactory.prototype.record = function () {
  throw new NotImplementedError('This class is abstract by design. Extend this class (via proper use of prototypes -- see TemporalEventFactory for an example) if you want things to work out.')
}
EventFactory.prototype.save = function () {
  throw new NotImplementedError('This class is abstract by design. Extend this class (via proper use of prototypes -- see TemporalEventFactory for an example) if you want things to work out.')
}
EventFactory.prototype.generate = function (type) {
  throw new NotImplementedError('This class is abstract by design. Extend this class (via proper use of prototypes -- see TemporalEventFactory for an example) if you want things to work out.')
}

},{"../errors":1}],4:[function(require,module,exports){
module.exports = PhysicalEventFactory

var ParameterCountError = require('../errors').ParameterCountError,
    EventFactory = require('./event-factory'),
    Event = require('../event')

// Factory for the creation of location-based Events (clicking, hovering, etc.)
function PhysicalEventFactory() {
  'use strict';
}

PhysicalEventFactory.prototype = Object.create(EventFactory.prototype)
PhysicalEventFactory.prototype.constructor = PhysicalEventFactory

PhysicalEventFactory.prototype.record = function (e) {
  if(this.constructor.name === 'PhysicalEventFactory') {
    throw new Error('This method is only stored here; it should be copied to an Event object for actual use.') 
  }
  
  this.elementDown = e
}
PhysicalEventFactory.prototype.save = function (e) {
  if(this.constructor.name === 'PhysicalEventFactory') {
    throw new Error('This method is only stored here; it should be copied to an Event object for actual use.') 
  }
  
  this.elementUp = e
}
// TODO: add user id generation. perhaps to EventFactory prototype?
PhysicalEventFactory.prototype.generate = function (type) {
  return new Event(type, this.record, this.save)
}
},{"../errors":1,"../event":6,"./event-factory":3}],5:[function(require,module,exports){
module.exports = TemporalEventFactory

var ParameterCountError = require('../errors').ParameterCountError,
    EventFactory = require('./event-factory'),
    Event = require('../event')

// Factory for the creation of time-based Events (waiting, etc.)
function TemporalEventFactory() {
  'use strict';
}

TemporalEventFactory.prototype = Object.create(EventFactory.prototype)
TemporalEventFactory.prototype.constructor = TemporalEventFactory

TemporalEventFactory.prototype.record = function () {
  if(this.constructor.name === 'TemporalEventFactory') {
    throw new Error('This method is only stored here; it should be copied to an Event object for actual use.') 
  }
  this.startTime = new Date().getTime()
}
TemporalEventFactory.prototype.save = function () {
  if(this.constructor.name === 'TemporalEventFactory') {
    throw new Error('This method is only stored here; it should be copied to an Event object for actual use.') 
  }
  
  this.endTime = new Date().getTime()
}
// TODO: add user id generation. perhaps to EventFactory prototype?
TemporalEventFactory.prototype.generate = function (type) {
  return new Event(type, this.record, this.save)
}
},{"../errors":1,"../event":6,"./event-factory":3}],6:[function(require,module,exports){
'using strict';
module.exports = Event

var ParameterCountError = require('../src/errors').ParameterCountError

function Event (type, record, save, uid) {
  if(type === undefined)
    throw new ParameterCountError('Events must have a type (string).')
  if(typeof type !== 'string')
    throw new TypeError('The event type must be a string. Received: ' + typeof type)
  if(record === undefined)
    throw new ParameterCountError('Events must have a record method with which they can begin recording relevant data.')
  if(typeof record !== 'function')
    throw new TypeError('The record parameter must be a function. Received: ' + typeof record)
  if(save === undefined)
    throw new ParameterCountError('Events must have a save method with which they can save their contents.')
  if(typeof save !== 'function')
    throw new TypeError('The save parameter must be a function. Received: ' + typeof save)
  if(uid !== undefined && typeof uid !== 'string')
    throw new TypeError('The user\'s id must be a string. Received: ' + typeof uid)
  this.type = type
  this.record = record
  this.save = save
  if(uid !== undefined) this.uid = uid
  else this.uid = null
}


},{"../src/errors":1}],"Uxie":[function(require,module,exports){
module.exports = Uxie

var EventFactoryFactory = require('./event-types/event-factory-factory'),
    EventFactory = require('./event-types/event-factory'),
    Event = require('./event'),
    ParameterCountError = require('./errors').ParameterCountError

var DEFAULT_TRIGGER_MAP = {
      'temporal': [
        'wait', 'scroll' 
      ],
      'physical': [
        'click', 'touch'
      ]
    }

function Uxie (opts) {
  'use strict';
  if(opts && opts.typeMap !== undefined) {
    // should only ever be run here. this function is just for keeping
    // things tidy, not really for code reuse.
    this.validateParameters(opts)

    this.factories = new EventFactoryFactory(opts.typeMap, opts.customTypes)
    this.triggerMap = opts.triggerMap
  }
  else {
    this.factories = new EventFactoryFactory()
    this.triggerMap = DEFAULT_TRIGGER_MAP
  }
  
  if(opts && opts.submission !== undefined)
    if(typeof opts.submission !== 'object')
      throw new TypeError('Submission configuration must be a formal object. Received: ' + typeof opts.submission)
    else 
      this.submission = opts.submission
  else
    this.submission = Uxie.DEFAULT_SUBMISSION_CONFIGURATION
  
  this.generateUID()
  this.generateTriggerList()
  this.generateTriggerDictionary()
  this.factories.generate()

  for(var t in this.triggerList) {
    var eventType = this.triggerList[t]
    this.addEventListener(eventType)
  }
  
  if(this.triggerList.indexOf('wait') !== -1) {
    this.waitInterval = 0 // just some integer so it exists
    this.waitLength = Uxie.DEFAULT_WAIT_LENGTH
  }
}

Uxie.prototype = Object.create(Object.prototype)
Uxie.prototype.constructor = Uxie

// Ensures all relevant inputs are sound.
Uxie.prototype.validateParameters = function (opts) {
  if(typeof opts.typeMap !== 'object') 
      throw new TypeError('opts.typeMap must be a traditional JavaScript object. A value of type ' + typeof opts.typeMap + ' was supplied.')
  if(Object.keys(opts.typeMap).length === 0)
    throw new TypeError('opts.typeMap was empty. If you didn\'t intend to supply a custom typeMap, remove this. You don\'t need to supply a typeMap if you would just like to use the defaults.')
  for(var k in opts.typeMap) {
    if(k === undefined || k === '')
      throw new TypeError('Each type in the typeMap must have a colloquial name; otherwise it doesn\'t serve much purpose. :P') 
    if(typeof opts.typeMap[k] !== 'function')
      throw new TypeError('Each type in the typeMap must be a function that can construct Events. Entry with name "' + k + '" did not have a such a matching function.')
    if(!(opts.typeMap[k].prototype instanceof EventFactory))
      throw new TypeError('Each type in the typeMap must implement the EventFactory class. Entry with name "' + k + '" did not.')
  }
  if(opts.triggerMap === undefined)
    throw new SyntaxError('If a typeMap is supplied, you must also supply a triggerMap; there should be no case where editing only one was sufficient.')
  if(typeof opts.triggerMap !== 'object')
    throw new TypeError('opts.triggerMap must be a traditional JavaScript object. A value of type ' + typeof opts.triggerMap + ' was supplied.')
  if(Object.keys(opts.triggerMap).length === 0)
    throw new TypeError('opts.triggerMap was empty. Check out the Github if you need help writing a proper triggerMap.')

  if(typeof opts.customTypes === 'undefined')
    opts.customTypes = []
  for(var k in opts.typeMap)
    if(typeof opts.typeMap[k] === 'undefined' && !opts.customTypes.indexOf(opts.typeMap[k]) !== -1)
      throw new SyntaxError('opts.typeMap contains a mapping to a custom EventFactory type, but the constructor for that type wasn\'t supplied in opts.customTypes.\nInvalid type name: ' + k + ' (' + opts.typeMap[k] + ')')
}

// Grab the trigger type's corresponding EventFactory
Uxie.prototype.getFactoryFor = function (trigger) {
  for(var k in this.triggerMap)
    for(var v in this.triggerMap[k])
      if(this.triggerMap[k][v] === trigger)
        return this.factories.types[k]
  throw new Error('Couldn\'t find an EventFactory for the given trigger.\nGiven trigger: ' + trigger + '\nTrigger map: ' + this.triggerMap)
}

// Generates the list of configured triggers for convenience.
Uxie.prototype.generateTriggerList = function () {
  this.triggerList = []
  for(var k in this.triggerMap)
    for(var v in this.triggerMap[k]) 
      if(this.triggerList.indexOf(v) === -1)
        this.triggerList.push(this.triggerMap[k][v])
}

// Generates a dictionary mapping event types to their factory types for convenience.
Uxie.prototype.generateTriggerDictionary = function () {
  this.triggerDictionary = {}
  for(var k in this.triggerMap)
    for(var v in this.triggerMap[k])
      this.triggerDictionary[this.triggerMap[k][v]] = k
}

// Returns a string denoting the Factory that should handle this event type.
Uxie.prototype.getFactoryTypeFor = function (type) {
  if(type === undefined)
    throw new ParameterCountError('An event type (string) must be supplied.')
  if(typeof type !== 'string')
    throw new TypeError('The given type must be a string. Received: ' + typeof type + '.')
  if(this.triggerList.indexOf(type) === -1)
    throw new Error('No event type with that name exists. Received: ' + type + '.')
    
  return this.triggerDictionary[type]
}

// Add an event listener to the window object.
Uxie.prototype.addEventListener = function (eventType, handler) {
  // we're gonna assume the window object exists. otherwise
  // this isn't very helpful ;)
  
  // because of this, this would be a good place for abstraction --
  // if I/people think this tool could be useful for other things,
  // we can allow an option to determine what global stuff we're using,
  // if any, instead of the window object (event handler abstraction)
  
  // similarly, this is a good place to think about establishing
  // an abstraction for *triggering* events, since they
  // may not always be in-browser events, and they may be custom
  // events in whatever environment they're run in...etc.

  if(handler === undefined)
    window.addEventListener(eventType, Uxie.DEFAULT_EVENT_LISTENER.bind(this, eventType))
  else
    window.addEventListener(eventType, handler.bind(this))
}

// Submit an event to the console/database/whatever.
// Needs more flexibility.
Uxie.prototype.submit = function (event) {
  if(event === undefined) 
    throw new ParameterCountError('Submission requires an Event.')
  if(!(event instanceof Event))
    throw new TypeError('Only submission of Events is allowed. Received: ' + event + ', which is not an instance of Event.')
    
  switch(this.submission.mode) {
    case 'console':
      if(event.startTime !== undefined)
        console.log('Event (' + event.type + ') runtime: ' + (event.endTime - event.startTime) + 'ms')
      else if (event.elementDown !== undefined) {
        console.log('Event (' + event.type + ') triggered on: \n')
        console.log(event.elementDown)
      }
      break;
    case 'json-console':
      console.log(JSON.stringify(event))
      break;
    case 'json':
      var json = JSON.stringify(event),
          xhr = new XMLHttpRequest()
      
      xhr.open('post', this.submission.url, true)
      
      xhr.setRequestHeader("content-type", "application/json")
      xhr.setRequestHeader("content-length", json.length)
      xhr.setRequestHeader("connection", "close")

      xhr.timeout = 2000
      
      xhr.send()
  }
  
}

// Generate a user id for the session.
// Used for building user stories in other tools.
Uxie.prototype.generateUID = function () {
  var canCookie = ((typeof document !== 'undefined') && (typeof document.cookie !== 'undefined'))
  
  // if we have access to cookies, read the UID cookie, if one exists.
  // if one doesn't exist, generate one and save it in a cookie.
  if(canCookie) {
    var cookie = document.cookie.replace(/(?:(?:^|.*;\s*)uid\s*\=\s*([^;]*).*$)|^.*$/, '$1')
    if(cookie.length > 0)
      this.uid = cookie
    else this.uid = Math.random().toString(36).slice(2)
  }
  // if we don't have access to cookies, our user stories won't work
  // very well, but we'll assume you have some other method of taking
  // care of business.
  else {
    this.uid = Math.random().toString(36).slice(2)
  }
}

Uxie.DEFAULT_TRIGGER_MAP = DEFAULT_TRIGGER_MAP
Uxie.DEFAULT_SUBMISSION_CONFIGURATION = {
  'mode':'console'
}
Uxie.SUPPORTED_SUBMISSION_MODES = [ 'console', 'json-console', 'json']
Uxie.DEFAULT_EVENT_LISTENER = function (eventType, e) {
  clearTimeout(this.waitInterval)
  if(this.currentEvent !== undefined) {
    this.currentEvent.save(e)
    this.submit(this.currentEvent)
  }
  this.currentEvent = this.factories.getFactoryFor(this.getFactoryTypeFor(eventType)).generate(eventType)
  this.currentEvent.record(e)
  if(eventType !== 'wait') {
    this.waitInterval = setTimeout(function () {
      var we = this.factories.getFactoryFor(this.getFactoryTypeFor('wait')).generate('wait')
      window.dispatchEvent(new CustomEvent('wait', { detail: we }))
    }.bind(this), Uxie.DEFAULT_WAIT_LENGTH)
  }
}
Uxie.DEFAULT_WAIT_LENGTH = 50 // in ms (30ms was too small, as sometimes this elapses between scroll events on a rapid scroll)
},{"./errors":1,"./event":6,"./event-types/event-factory":3,"./event-types/event-factory-factory":2}]},{},["Uxie"]);
