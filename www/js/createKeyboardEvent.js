//jshint ignore:start

void

function () { //closure

  var global = this,
    _initKeyboardEvent_type = (function (e) {
      try {
        e.initKeyboardEvent(
          "keyup" // in DOMString typeArg
          , false // in boolean canBubbleArg
          , false // in boolean cancelableArg
          , global // in views::AbstractView viewArg
          , "+" // [test]in DOMString keyIdentifierArg | webkit event.keyIdentifier | IE9 event.key
          , 3 // [test]in unsigned long keyLocationArg | webkit event.keyIdentifier | IE9 event.location
          , true // [test]in boolean ctrlKeyArg | webkit event.shiftKey | old webkit event.ctrlKey | IE9 event.modifiersList
          , false // [test]shift | alt
          , true // [test]shift | alt
          , false // meta
          , false // altGraphKey
        );



        /*
        // Safari and IE9 throw Error here due keyCode, charCode and which is readonly
        // Uncomment this code block if you need legacy properties
        delete e.keyCode;
        _Object_defineProperty(e, {writable: true, configurable: true, value: 9})
        delete e.charCode;
        _Object_defineProperty(e, {writable: true, configurable: true, value: 9})
        delete e.which;
        _Object_defineProperty(e, {writable: true, configurable: true, value: 9})
        */

        return ((e["keyIdentifier"] || e["key"]) == "+" && (e["location"]) || e["keyLocation"] == 3) && (
          e.ctrlKey ?
          e.altKey ? // webkit
          1 :
          3 :
          e.shiftKey ?
          2 // webkit
          :
          4 // IE9
        ) || 9 // FireFox|w3c
        ;
      } catch (__e__) {
        _initKeyboardEvent_type = 0
      }
    })(document.createEvent("KeyboardEvent"))

    ,
    _keyboardEvent_properties_dictionary = {
      "char": "",
      "key": "",
      "location": 0,
      "ctrlKey": false,
      "shiftKey": false,
      "altKey": false,
      "metaKey": false,
      "repeat": false,
      "locale": "",

      "detail": 0,
      "bubbles": false,
      "cancelable": false,

      //legacy properties
      "keyCode": 0,
      "charCode": 0,
      "which": 0
    }

    ,
    own = Function.prototype.call.bind(Object.prototype.hasOwnProperty)

    ,
    _Object_defineProperty = Object.defineProperty || function (obj, prop, val) {
      if ("value" in val) {
        obj[prop] = val["value"];
      }
    };

  function crossBrowser_initKeyboardEvent(type, dict) {
    var e;
    if (_initKeyboardEvent_type) {
      e = document.createEvent("KeyboardEvent");
    } else {
      e = document.createEvent("Event");
    }
    var _prop_name, localDict = {};

    for (_prop_name in _keyboardEvent_properties_dictionary)
      if (own(_keyboardEvent_properties_dictionary, _prop_name)) {
        localDict[_prop_name] = (own(dict, _prop_name) && dict || _keyboardEvent_properties_dictionary)[_prop_name];
      }

    var _ctrlKey = localDict["ctrlKey"],
      _shiftKey = localDict["shiftKey"],
      _altKey = localDict["altKey"],
      _metaKey = localDict["metaKey"],
      _altGraphKey = localDict["altGraphKey"]

      ,
      _modifiersListArg = _initKeyboardEvent_type > 3 ? (
        (_ctrlKey ? "Control" : "") +
        (_shiftKey ? " Shift" : "") +
        (_altKey ? " Alt" : "") +
        (_metaKey ? " Meta" : "") +
        (_altGraphKey ? " AltGraph" : "")
      ).trim() : null

      ,
      _key = localDict["key"] + "",
      _char = localDict["char"] + "",
      _location = localDict["location"],
      _keyCode = localDict["keyCode"] || (localDict["keyCode"] = _key && _key.charCodeAt(0) || 0),
      _charCode = localDict["charCode"] || (localDict["charCode"] = _char && _char.charCodeAt(0) || 0)

      ,
      _bubbles = localDict["bubbles"],
      _cancelable = localDict["cancelable"]

      ,
      _repeat = localDict["repeat"],
      _locale = localDict["locale"],
      _view = global;

    localDict["which"] || (localDict["which"] = localDict["keyCode"]);

    if ("initKeyEvent" in e) { //FF
      //https://developer.mozilla.org/en/DOM/event.initKeyEvent
      e.initKeyEvent(type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode);
    } else if (_initKeyboardEvent_type && "initKeyboardEvent" in e) { //https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
      if (_initKeyboardEvent_type == 1) { // webkit
        //http://stackoverflow.com/a/8490774/1437207
        //https://bugs.webkit.org/show_bug.cgi?id=13368
        e.initKeyboardEvent(type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _shiftKey, _altKey, _metaKey, _altGraphKey);
      } else if (_initKeyboardEvent_type == 2) { // old webkit
        //http://code.google.com/p/chromium/issues/detail?id=52408
        e.initKeyboardEvent(type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode);
      } else if (_initKeyboardEvent_type == 3) { // webkit
        e.initKeyboardEvent(type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _altKey, _shiftKey, _metaKey, _altGraphKey);
      } else if (_initKeyboardEvent_type == 4) { // IE9
        //http://msdn.microsoft.com/en-us/library/ie/ff975297(v=vs.85).aspx
        e.initKeyboardEvent(type, _bubbles, _cancelable, _view, _key, _location, _modifiersListArg, _repeat, _locale);
      } else { // FireFox|w3c
        //http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent-initKeyboardEvent
        //https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
        e.initKeyboardEvent(type, _bubbles, _cancelable, _view, _char, _key, _location, _modifiersListArg, _repeat, _locale);
      }
    } else {
      e.initEvent(type, _bubbles, _cancelable)
    }

    for (_prop_name in _keyboardEvent_properties_dictionary)
      if (own(_keyboardEvent_properties_dictionary, _prop_name)) {
        if (e[_prop_name] != localDict[_prop_name]) {
          try {
            delete e[_prop_name];
            _Object_defineProperty(e, _prop_name, {
              writable: true,
              "value": localDict[_prop_name]
            });
          } catch (e) {
            //Some properties is read-only
          }

        }
      }

    return e;
  }

  //export
  global.createKeyboardEvent = crossBrowser_initKeyboardEvent;

}.call(this);