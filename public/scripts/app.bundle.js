(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<svg width=\"16px\" height=\"16px\" viewBox=\"0 0 16 16\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <!-- Generator: Sketch 39.1 (31720) - http://www.bohemiancoding.com/sketch -->\n    <defs/>\n    <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g id=\"Artboard\" fill=\"#D00032\">\n            <g id=\"Group\">\n                <path d=\"M0,8 C0,12.418278 3.581722,16 8,16 C12.418278,16 16,12.418278 16,8 C16,4.89580324 14.2154684,2.11256098 11.4682644,0.789110134 L10.6002482,2.59092808 C12.661769,3.58405472 14,5.6712248 14,8 C14,11.3137085 11.3137085,14 8,14 C4.6862915,14 2,11.3137085 2,8 C2,5.65296151 3.35941993,3.55225774 5.44569583,2.56903563 L4.59307587,0.759881355 C1.81273067,2.07020511 0,4.87140735 0,8 Z\" id=\"Oval\"/>\n                <polygon id=\"Combined-Shape\" points=\"7 8.58578644 7 0 9 0 9 8.58578644 10.2928932 7.29289322 11 6.58578644 12.4142136 8 11.7071068 8.70710678 8.70710678 11.7071068 8 12.4142136 7.64644661 12.0606602 7.29289322 11.7071068 4.29289322 8.70710678 3.58578644 8 5 6.58578644 5.70710678 7.29289322\"/>\n            </g>\n        </g>\n    </g>\n</svg>\n";

},{}],2:[function(require,module,exports){
'use strict';

annotationMapper.$inject = ["$rootScope", "annotationUI", "store"];
var angular = require('angular');

var events = require('./events');

function getExistingAnnotation(annotationUI, id) {
  return annotationUI.getState().annotations.find(function (annot) {
    return annot.id === id;
  });
}

// Wraps the annotation store to trigger events for the CRUD actions
// @ngInject
function annotationMapper($rootScope, annotationUI, store) {
  function loadAnnotations(annotations, replies) {
    annotations = annotations.concat(replies || []);

    var loaded = [];
    annotations.forEach(function (annotation) {
      var existing = getExistingAnnotation(annotationUI, annotation.id);
      if (existing) {
        $rootScope.$broadcast(events.ANNOTATION_UPDATED, annotation);
        return;
      }
      loaded.push(annotation);
    });

    $rootScope.$broadcast(events.ANNOTATIONS_LOADED, loaded);
  }

  function unloadAnnotations(annotations) {
    var unloaded = annotations.map(function (annotation) {
      var existing = getExistingAnnotation(annotationUI, annotation.id);
      if (existing && annotation !== existing) {
        annotation = angular.copy(annotation, existing);
      }
      return annotation;
    });
    $rootScope.$broadcast(events.ANNOTATIONS_UNLOADED, unloaded);
  }

  function createAnnotation(annotation) {
    $rootScope.$broadcast(events.BEFORE_ANNOTATION_CREATED, annotation);
    return annotation;
  }

  function deleteAnnotation(annotation) {
    return store.annotation.delete({
      id: annotation.id,
    }).then(function () {
      $rootScope.$broadcast(events.ANNOTATION_DELETED, annotation);
      return annotation;
    });
  }

  return {
    loadAnnotations: loadAnnotations,
    unloadAnnotations: unloadAnnotations,
    createAnnotation: createAnnotation,
    deleteAnnotation: deleteAnnotation,
  };
}


module.exports = annotationMapper;

},{"./events":52,"angular":"angular"}],3:[function(require,module,exports){
'use strict';

/**
 * Utility functions for querying annotation metadata.
 */

/** Extract a URI, domain and title from the given domain model object.
 *
 * @param {object} annotation An annotation domain model object as received
 *   from the server-side API.
 * @returns {object} An object with three properties extracted from the model:
 *   uri, domain and title.
 *
 */
function documentMetadata(annotation) {
  var uri = annotation.uri;
  var domain = new URL(uri).hostname;
  var title = domain;

  if (annotation.document && annotation.document.title) {
    title = annotation.document.title[0];
  }

  if (domain === 'localhost') {
    domain = '';
  }

  return {
    uri: uri,
    domain: domain,
    title: title,
  };
}

/**
 * Return the domain and title of an annotation for display on an annotation
 * card.
 */
function domainAndTitle(annotation) {
  return {
    domain: domainTextFromAnnotation(annotation),
    titleText: titleTextFromAnnotation(annotation),
    titleLink: titleLinkFromAnnotation(annotation),
  };
}

function titleLinkFromAnnotation(annotation) {
  var titleLink = annotation.uri;

  if (titleLink && !(titleLink.indexOf('http://') === 0 || titleLink.indexOf('https://') === 0)) {
    // We only link to http(s) URLs.
    titleLink = null;
  }

  if (annotation.links && annotation.links.incontext) {
    titleLink = annotation.links.incontext;
  }

  return titleLink;
}

function domainTextFromAnnotation(annotation) {
  var document = documentMetadata(annotation);

  var domainText = '';
  if (document.uri && document.uri.indexOf('file://') === 0 && document.title) {
    var parts = document.uri.split('/');
    var filename = parts[parts.length - 1];
    if (filename) {
      domainText = filename;
    }
  } else if (document.domain && document.domain !== document.title) {
    domainText = document.domain;
  }

  return domainText;
}

function titleTextFromAnnotation(annotation) {
  var document = documentMetadata(annotation);

  var titleText = document.title;
  if (titleText.length > 30) {
    titleText = titleText.slice(0, 30) + '…';
  }

  return titleText;
}

/** Return `true` if the given annotation is a reply, `false` otherwise. */
function isReply(annotation) {
  return (annotation.references || []).length > 0;
}

/** Return `true` if the given annotation is new, `false` otherwise.
 *
 * "New" means this annotation has been newly created client-side and not
 * saved to the server yet.
 */
function isNew(annotation) {
  return !annotation.id;
}

/**
 * Return `true` if `annotation` has a selector.
 *
 * An annotation which has a selector refers to a specific part of a document,
 * as opposed to a Page Note which refers to the whole document or a reply,
 * which refers to another annotation.
 */
function hasSelector(annotation) {
  return !!(annotation.target &&
            annotation.target.length > 0 &&
            annotation.target[0].selector);
}

/** Return `true` if the given annotation is not yet anchored. */
function isWaitingToAnchor(annotation) {
  return hasSelector(annotation) && (typeof annotation.$orphan === 'undefined');
}

/** Return `true` if the given annotation is an orphan. */
function isOrphan(annotation) {
  return hasSelector(annotation) && annotation.$orphan;
}

/** Return `true` if the given annotation is a page note. */
function isPageNote(annotation) {
  return !hasSelector(annotation) && !isReply(annotation);
}

/** Return `true` if the given annotation is a top level annotation, `false` otherwise. */
function isAnnotation(annotation) {
  return !!(hasSelector(annotation) && !isOrphan(annotation));
}

/** Return a numeric key that can be used to sort annotations by location.
 *
 * @return {number} - A key representing the location of the annotation in
 *                    the document, where lower numbers mean closer to the
 *                    start.
 */
function location(annotation) {
  if (annotation) {
    var targets = annotation.target || [];
    for (var i = 0; i < targets.length; i++) {
      var selectors = targets[i].selector || [];
      for (var k = 0; k < selectors.length; k++) {
        if (selectors[k].type === 'TextPositionSelector') {
          return selectors[k].start;
        }
      }
    }
  }
  return Number.POSITIVE_INFINITY;
}

module.exports = {
  documentMetadata: documentMetadata,
  domainAndTitle: domainAndTitle,
  isAnnotation: isAnnotation,
  isNew: isNew,
  isOrphan: isOrphan,
  isPageNote: isPageNote,
  isReply: isReply,
  isWaitingToAnchor: isWaitingToAnchor,
  location: location,
};

},{}],4:[function(require,module,exports){
var AnnotationSync, extend,
  slice = [].slice;

extend = require('extend');

module.exports = AnnotationSync = (function() {
  AnnotationSync.prototype.options = {
    formatter: function(annotation) {
      return annotation;
    },
    parser: function(annotation) {
      return annotation;
    },
    merge: function(local, remote) {
      var k, v;
      for (k in remote) {
        v = remote[k];
        local[k] = v;
      }
      return local;
    },
    emit: function() {
      var args, event;
      event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      throw new Error('options.emit unspecified for AnnotationSync.');
    },
    on: function(event, handler) {
      throw new Error('options.on unspecified for AnnotationSync.');
    }
  };

  AnnotationSync.prototype.cache = null;

  function AnnotationSync(bridge, options) {
    var event, func, handler, method, onConnect, ref, ref1;
    this.bridge = bridge;
    this.options = extend(true, {}, this.options, options);
    this.cache = {};
    this._on = this.options.on;
    this._emit = this.options.emit;
    ref = this._eventListeners;
    for (event in ref) {
      handler = ref[event];
      this._on(event, handler.bind(this));
    }
    ref1 = this._channelListeners;
    for (method in ref1) {
      func = ref1[method];
      this.bridge.on(method, func.bind(this));
    }
    onConnect = (function(_this) {
      return function(channel) {
        return _this._syncCache(channel);
      };
    })(this);
    this.bridge.onConnect(onConnect);
  }

  AnnotationSync.prototype.sync = function(annotations) {
    var a;
    annotations = (function() {
      var i, len, results1;
      results1 = [];
      for (i = 0, len = annotations.length; i < len; i++) {
        a = annotations[i];
        results1.push(this._format(a));
      }
      return results1;
    }).call(this);
    this.bridge.call('sync', annotations, (function(_this) {
      return function(err, annotations) {
        var i, len, results1;
        if (annotations == null) {
          annotations = [];
        }
        results1 = [];
        for (i = 0, len = annotations.length; i < len; i++) {
          a = annotations[i];
          results1.push(_this._parse(a));
        }
        return results1;
      };
    })(this));
    return this;
  };

  AnnotationSync.prototype._channelListeners = {
    'beforeCreateAnnotation': function(body, cb) {
      var annotation;
      annotation = this._parse(body);
      delete this.cache[annotation.$$tag];
      this._emit('beforeAnnotationCreated', annotation);
      this.cache[annotation.$$tag] = annotation;
      return cb(null, this._format(annotation));
    },
    'createAnnotation': function(body, cb) {
      var annotation;
      annotation = this._parse(body);
      delete this.cache[annotation.$$tag];
      this._emit('annotationCreated', annotation);
      this.cache[annotation.$$tag] = annotation;
      return cb(null, this._format(annotation));
    },
    'updateAnnotation': function(body, cb) {
      var annotation;
      annotation = this._parse(body);
      delete this.cache[annotation.$$tag];
      this._emit('beforeAnnotationUpdated', annotation);
      this._emit('annotationUpdated', annotation);
      this.cache[annotation.$$tag] = annotation;
      return cb(null, this._format(annotation));
    },
    'deleteAnnotation': function(body, cb) {
      var annotation;
      annotation = this._parse(body);
      delete this.cache[annotation.$$tag];
      this._emit('annotationDeleted', annotation);
      return cb(null, this._format(annotation));
    },
    'loadAnnotations': function(bodies, cb) {
      var a, annotations;
      annotations = (function() {
        var i, len, results1;
        results1 = [];
        for (i = 0, len = bodies.length; i < len; i++) {
          a = bodies[i];
          results1.push(this._parse(a));
        }
        return results1;
      }).call(this);
      this._emit('annotationsLoaded', annotations);
      return cb(null, annotations);
    },
    'sync': function(bodies, cb) {
      var annotations, b;
      annotations = (function() {
        var i, len, results1;
        results1 = [];
        for (i = 0, len = bodies.length; i < len; i++) {
          b = bodies[i];
          results1.push(this._format(this._parse(b)));
        }
        return results1;
      }).call(this);
      this._emit('sync', annotations);
      return cb(null, annotations);
    }
  };

  AnnotationSync.prototype._eventListeners = {
    'beforeAnnotationCreated': function(annotation) {
      if (annotation.$$tag != null) {
        return;
      }
      return this._mkCallRemotelyAndParseResults('beforeCreateAnnotation')(annotation);
    },
    'annotationCreated': function(annotation) {
      if (!((annotation.$$tag != null) && this.cache[annotation.$$tag])) {
        return;
      }
      return this._mkCallRemotelyAndParseResults('createAnnotation')(annotation);
    },
    'annotationUpdated': function(annotation) {
      if (!((annotation.$$tag != null) && this.cache[annotation.$$tag])) {
        return;
      }
      return this._mkCallRemotelyAndParseResults('updateAnnotation')(annotation);
    },
    'annotationDeleted': function(annotation) {
      var onFailure;
      if (!((annotation.$$tag != null) && this.cache[annotation.$$tag])) {
        return;
      }
      onFailure = (function(_this) {
        return function(err) {
          if (!err) {
            return delete _this.cache[annotation.$$tag];
          }
        };
      })(this);
      return this._mkCallRemotelyAndParseResults('deleteAnnotation', onFailure)(annotation);
    },
    'annotationsLoaded': function(annotations) {
      var a, bodies;
      bodies = (function() {
        var i, len, results1;
        results1 = [];
        for (i = 0, len = annotations.length; i < len; i++) {
          a = annotations[i];
          if (!a.$$tag) {
            results1.push(this._format(a));
          }
        }
        return results1;
      }).call(this);
      if (!bodies.length) {
        return;
      }
      return this.bridge.call('loadAnnotations', bodies);
    },
    'annotationsUnloaded': function(annotations) {
      var self;
      self = this;
      return annotations.forEach(function(annotation) {
        delete self.cache[annotation.$$tag];
        return self._mkCallRemotelyAndParseResults('deleteAnnotation')(annotation);
      });
    }
  };

  AnnotationSync.prototype._syncCache = function(channel) {
    var a, annotations, t;
    annotations = (function() {
      var ref, results1;
      ref = this.cache;
      results1 = [];
      for (t in ref) {
        a = ref[t];
        results1.push(this._format(a));
      }
      return results1;
    }).call(this);
    if (annotations.length) {
      return channel.call('loadAnnotations', annotations);
    }
  };

  AnnotationSync.prototype._mkCallRemotelyAndParseResults = function(method, callBack) {
    return (function(_this) {
      return function(annotation) {
        var wrappedCallback;
        wrappedCallback = function(failure, results) {
          if (failure == null) {
            _this._parseResults(results);
          }
          return typeof callBack === "function" ? callBack(failure, results) : void 0;
        };
        return _this.bridge.call(method, _this._format(annotation), wrappedCallback);
      };
    })(this);
  };

  AnnotationSync.prototype._parseResults = function(results) {
    var bodies, body, i, j, len, len1;
    for (i = 0, len = results.length; i < len; i++) {
      bodies = results[i];
      bodies = [].concat(bodies);
      for (j = 0, len1 = bodies.length; j < len1; j++) {
        body = bodies[j];
        if (body !== null) {
          this._parse(body);
        }
      }
    }
  };

  AnnotationSync.prototype._tag = function(ann, tag) {
    if (ann.$$tag) {
      return ann;
    }
    tag = tag || window.btoa(Math.random());
    Object.defineProperty(ann, '$$tag', {
      value: tag
    });
    this.cache[tag] = ann;
    return ann;
  };

  AnnotationSync.prototype._parse = function(body) {
    var local, merged, remote;
    local = this.cache[body.tag];
    remote = this.options.parser(body.msg);
    if (local != null) {
      merged = this.options.merge(local, remote);
    } else {
      merged = remote;
    }
    return this._tag(merged, body.tag);
  };

  AnnotationSync.prototype._format = function(ann) {
    this._tag(ann);
    return {
      tag: ann.$$tag,
      msg: this.options.formatter(ann)
    };
  };

  return AnnotationSync;

})();


},{"extend":126}],5:[function(require,module,exports){
'use strict';

AnnotationUIController.$inject = ["$rootScope", "$scope", "annotationUI"];
var events = require('./events');

/** Watch the UI state and update scope properties. */
// @ngInject
function AnnotationUIController($rootScope, $scope, annotationUI) {
  annotationUI.subscribe(function () {
    var state = annotationUI.getState();

    $scope.selectedAnnotations = state.selectedAnnotationMap;

    if (state.selectedAnnotationMap) {
      $scope.selectedAnnotationsCount =
        Object.keys(state.selectedAnnotationMap).length;
    } else {
      $scope.selectedAnnotationsCount = 0;
    }

    $scope.focusedAnnotations = state.focusedAnnotationMap;
  });

  $scope.$on(events.ANNOTATION_DELETED, function (event, annotation) {
    annotationUI.removeSelectedAnnotation(annotation.id);
  });
}

module.exports = AnnotationUIController;

},{"./events":52}],6:[function(require,module,exports){
'use strict';

AnnotationUISync.$inject = ["$rootScope", "$window", "annotationUI", "bridge"];
var uiConstants = require('./ui-constants');

/**
 * Uses a channel between the sidebar and the attached frames to ensure
 * the interface remains in sync.
 *
 * @name AnnotationUISync
 * @param {$window} $window An Angular window service.
 * @param {Bridge} bridge
 * @param {AnnotationUI} annotationUI An instance of the AnnotatonUI service
 * @description
 * Listens for incoming events over the bridge concerning the annotation
 * interface and updates the applications internal state. It also ensures
 * that the messages are broadcast out to other frames.
 */
// @ngInject
function AnnotationUISync($rootScope, $window, annotationUI, bridge) {
  function lookupByTag(tag) {
    return annotationUI.getState().annotations.find(function (annot) {
      return annot.$$tag === tag;
    });
  }

  function findIDsForTags(tags) {
    var ids = [];
    tags.forEach(function (tag) {
      var annot = lookupByTag(tag);
      if (annot && annot.id) {
        ids.push(annot.id);
      }
    });
    return ids;
  }

  var channelListeners = {
    showAnnotations: function (tags) {
      var ids = findIDsForTags(tags || []);
      annotationUI.selectAnnotations(ids);
      annotationUI.selectTab(uiConstants.TAB_ANNOTATIONS);
    },
    focusAnnotations: function (tags) {
      annotationUI.focusAnnotations(tags || []);
    },
    toggleAnnotationSelection: function (tags) {
      var ids = findIDsForTags(tags || []);
      annotationUI.toggleSelectedAnnotations(ids);
    },
    setVisibleHighlights: function (state) {
      if (typeof state !== 'boolean') {
        state = true;
      }
      if (annotationUI.getState().visibleHighlights !== state) {
        annotationUI.setShowHighlights(state);
        bridge.call('setVisibleHighlights', state);
      }
    },
    sidebarOpened: function () {
      $rootScope.$broadcast('sidebarOpened');
    },
  };

  for (var channel in channelListeners) {
    if (Object.prototype.hasOwnProperty.call(channelListeners, channel)) {
      var listener = channelListeners[channel];
      bridge.on(channel, listener);
    }
  }

  var onConnect = function (channel, source) {
    if (source === $window.parent) {
      // The host initializes its own state
      return;
    } else {
      // Synchronize the state of guests
      channel.call('setVisibleHighlights', annotationUI.getState().visibleHighlights);
    }
  };

  bridge.onConnect(onConnect);
}

module.exports = AnnotationUISync;

},{"./ui-constants":88}],7:[function(require,module,exports){
'use strict';

/**
 * AnnotationUI is the central store of state for the sidebar application,
 * managed using [Redux](http://redux.js.org/).
 *
 * State management in Redux apps work as follows:
 *
 *  1. All important application state is stored in a single, immutable object.
 *  2. The user interface is a presentation of this state. Interaction with the
 *     UI triggers updates by creating `actions`.
 *  3. Actions are plain JS objects which describe some event that happened in
 *     the application. Updates happen by passing actions to a `reducer`
 *     function which takes the current application state, the action and
 *     returns the new application state.
 *
 *     The process of updating the app state using an action is known as
 *     'dispatching' the action.
 *  4. Other parts of the app can subscribe to changes in the app state.
 *     This is used to to update the UI etc.
 *
 * "middleware" functions can wrap the dispatch process in order to implement
 *  logging, trigger side effects etc.
 *
 * Tests for a given action consist of:
 *
 *  1. Checking that the UI (or other event source) dispatches the correct
 *     action when something happens.
 *  2. Checking that given an initial state, and an action, a reducer returns
 *     the correct resulting state.
 *  3. Checking that the UI correctly presents a given state.
 */

var redux = require('redux');

// `.default` is needed because 'redux-thunk' is built as an ES2015 module
var thunk = require('redux-thunk').default;

var reducers = require('./reducers');
var annotationsReducer = require('./reducers/annotations');
var selectionReducer = require('./reducers/selection');
var viewerReducer = require('./reducers/viewer');
var util = require('./reducers/util');

/**
 * Redux middleware which triggers an Angular change-detection cycle
 * if no cycle is currently in progress.
 *
 * This ensures that Angular UI components are updated after the UI
 * state changes in response to external inputs (eg. WebSocket messages,
 * messages arriving from other frames in the page, async network responses).
 *
 * See http://redux.js.org/docs/advanced/Middleware.html
 */
function angularDigestMiddleware($rootScope) {
  return function (next) {
    return function (action) {
      next(action);

      // '$$phase' is set if Angular is in the middle of a digest cycle already
      if (!$rootScope.$$phase) {
        // $applyAsync() is similar to $apply() but provides debouncing.
        // See http://stackoverflow.com/questions/30789177
        $rootScope.$applyAsync(function () {});
      }
    };
  };
}

// @ngInject
module.exports = function ($rootScope, settings) {
  var enhancer = redux.applyMiddleware(
    // The `thunk` middleware handles actions which are functions.
    // This is used to implement actions which have side effects or are
    // asynchronous (see https://github.com/gaearon/redux-thunk#motivation)
    thunk,
    angularDigestMiddleware.bind(null, $rootScope)
  );
  var store = redux.createStore(reducers.update, reducers.init(settings),
    enhancer);

  // Expose helper functions that create actions as methods of the
  // `annotationUI` service to make using them easier from app code. eg.
  //
  // Instead of:
  //   annotationUI.dispatch(annotations.actions.addAnnotations(annotations))
  // You can use:
  //   annotationUI.addAnnotations(annotations)
  //
  var actionCreators = redux.bindActionCreators(Object.assign({},
    annotationsReducer.actions,
    selectionReducer.actions,
    viewerReducer.actions
  ), store.dispatch);

  // Expose selectors as methods of the `annotationUI` to make using them easier
  // from app code.
  //
  // eg. Instead of:
  //   selection.isAnnotationSelected(annotationUI.getState(), id)
  // You can use:
  //   annotationUI.isAnnotationSelected(id)
  var selectors = util.bindSelectors({
    isAnnotationSelected: selectionReducer.isAnnotationSelected,
    hasSelectedAnnotations: selectionReducer.hasSelectedAnnotations,

    annotationExists: annotationsReducer.annotationExists,
    savedAnnotations: annotationsReducer.savedAnnotations,

    isSidebar: viewerReducer.isSidebar,
  }, store.getState);

  return Object.assign(store, actionCreators, selectors);
};
module.exports.$inject = ["$rootScope", "settings"];

},{"./reducers":69,"./reducers/annotations":68,"./reducers/selection":70,"./reducers/util":71,"./reducers/viewer":72,"redux":144,"redux-thunk":138}],8:[function(require,module,exports){
'use strict';

AnnotationViewerController.$inject = ["$location", "$routeParams", "$scope", "annotationUI", "rootThread", "streamer", "store", "streamFilter", "annotationMapper"];
var angular = require('angular');

/**
 * Fetch all annotations in the same thread as `id`.
 *
 * @return Promise<Array<Annotation>>
 */
function fetchThread(store, id) {
  var annot;
  return store.annotation.get({id: id}).then(function (annot) {
    if (annot.references && annot.references.length) {
      // This is a reply, fetch the top-level annotation
      return store.annotation.get({id: annot.references[0]});
    } else {
      return annot;
    }
  }).then(function (annot_) {
    annot = annot_;
    return store.search({references: annot.id});
  }).then(function (searchResult) {
    return [annot].concat(searchResult.rows);
  });
}

// @ngInject
function AnnotationViewerController (
  $location, $routeParams, $scope,
  annotationUI, rootThread, streamer, store, streamFilter, annotationMapper
) {
  annotationUI.setAppIsSidebar(false);

  var id = $routeParams.id;

  // Provide no-ops until these methods are moved elsewere. They only apply
  // to annotations loaded into the stream.
  $scope.focus = angular.noop;

  $scope.search.update = function (query) {
    $location.path('/stream').search('q', query);
  };

  annotationUI.subscribe(function () {
    $scope.rootThread = rootThread.thread(annotationUI.getState());
  });

  $scope.setCollapsed = function (id, collapsed) {
    annotationUI.setCollapsed(id, collapsed);
  };

  this.ready = fetchThread(store, id).then(function (annots) {
    annotationMapper.loadAnnotations(annots);

    var topLevelAnnot = annots.filter(function (annot) {
      return (annot.references || []).length === 0;
    })[0];

    if (!topLevelAnnot) {
      return;
    }

    streamFilter
      .setMatchPolicyIncludeAny()
      .addClause('/references', 'one_of', topLevelAnnot.id, true)
      .addClause('/id', 'equals', topLevelAnnot.id, true);
    streamer.setConfig('filter', { filter: streamFilter.getFilter() });
    streamer.connect();

    annots.forEach(function (annot) {
      annotationUI.setCollapsed(annot.id, false);
    });

    if (topLevelAnnot.id !== id) {
      annotationUI.highlightAnnotations([id]);
    }
  });
}

module.exports = AnnotationViewerController;

},{"angular":"angular"}],9:[function(require,module,exports){
'use strict';

var scrollIntoView = require('scroll-into-view');

var events = require('./events');
var parseAccountID = require('./filter/persona').parseAccountID;
var scopeTimeout = require('./util/scope-timeout');
var uiConstants = require('./ui-constants');

function authStateFromUserID(userid) {
  if (userid) {
    var parsed = parseAccountID(userid);
    return {
      status: 'logged-in',
      userid: userid,
      username: parsed.username,
      provider: parsed.provider,
    };
  } else {
    return {status: 'logged-out'};
  }
}

// @ngInject
module.exports = function AppController(
  $controller, $document, $location, $rootScope, $route, $scope,
  $window, annotationUI, auth, drafts, features, groups,
  serviceUrl, session, settings, streamer
) {
  $controller('AnnotationUIController', {$scope: $scope});

  // This stores information about the current user's authentication status.
  // When the controller instantiates we do not yet know if the user is
  // logged-in or not, so it has an initial status of 'unknown'. This can be
  // used by templates to show an intermediate or loading state.
  $scope.auth = {status: 'unknown'};

  // Allow all child scopes to look up feature flags as:
  //
  //     if ($scope.feature('foo')) { ... }
  $scope.feature = features.flagEnabled;

  // Allow all child scopes access to the session
  $scope.session = session;

  // App dialogs
  $scope.accountDialog = {visible: false};
  $scope.shareDialog = {visible: false};
  $scope.helpPanel = {visible: false};

  // Check to see if we're in the sidebar, or on a standalone page such as
  // the stream page or an individual annotation page.
  $scope.isSidebar = $window.top !== $window;

  $scope.serviceUrl = serviceUrl;

  $scope.sortKey = function () {
    return annotationUI.getState().sortKey;
  };

  $scope.sortKeysAvailable = function () {
    return annotationUI.getState().sortKeysAvailable;
  };

  $scope.setSortKey = annotationUI.setSortKey;

  // Reload the view when the user switches accounts
  $scope.$on(events.USER_CHANGED, function (event, data) {
    $scope.auth = authStateFromUserID(data.userid);
    $scope.accountDialog.visible = false;

    if (!data || !data.initialLoad) {
      $route.reload();
    }
  });

  session.load().then(function (state) {
    // When the authentication status of the user is known,
    // update the auth info in the top bar and show the login form
    // after first install of the extension.
    $scope.auth = authStateFromUserID(state.userid);

    if (!state.userid && settings.openLoginForm) {
      $scope.login();
    }
  });

  /** Scroll to the view to the element matching the given selector */
  function scrollToView(selector) {
    // Add a timeout so that if the element has just been shown (eg. via ngIf)
    // it is added to the DOM before we try to locate and scroll to it.
    scopeTimeout($scope, function () {
      scrollIntoView($document[0].querySelector(selector));
    }, 0);
  }

  // Start the login flow. This will present the user with the login dialog.
  $scope.login = function () {
    $scope.accountDialog.visible = true;
    scrollToView('login-form');
  };

  // Display the dialog for sharing the current page
  $scope.share = function () {
    $scope.shareDialog.visible = true;
    scrollToView('share-dialog');
  };

  // Prompt to discard any unsaved drafts.
  var promptToLogout = function () {
    // TODO - Replace this with a UI which doesn't look terrible.
    var text = '';
    if (drafts.count() === 1) {
      text = 'You have an unsaved annotation.\n' +
        'Do you really want to discard this draft?';
    } else if (drafts.count() > 1) {
      text = 'You have ' + drafts.count() + ' unsaved annotations.\n' +
        'Do you really want to discard these drafts?';
    }
    return (drafts.count() === 0 || $window.confirm(text));
  };

  // Log the user out.
  $scope.logout = function () {
    if (!promptToLogout()) {
      return;
    }
    drafts.unsaved().forEach(function (draft) {
      $rootScope.$emit(events.ANNOTATION_DELETED, draft);
    });
    drafts.discard();
    $scope.accountDialog.visible = false;
    auth.logout();
  };

  $scope.clearSelection = function () {
    var selectedTab = annotationUI.getState().selectedTab;
    if (!annotationUI.getState().selectedTab || annotationUI.getState().selectedTab === uiConstants.TAB_ORPHANS) {
      selectedTab = uiConstants.TAB_ANNOTATIONS;
    }

    annotationUI.clearSelectedAnnotations();
    annotationUI.selectTab(selectedTab);
  };

  $scope.search = {
    query: function () {
      return annotationUI.getState().filterQuery;
    },
    update: function (query) {
      annotationUI.setFilterQuery(query);
    },
  };

  $scope.countPendingUpdates = streamer.countPendingUpdates;
  $scope.applyPendingUpdates = streamer.applyPendingUpdates;
};
module.exports.$inject = ["$controller", "$document", "$location", "$rootScope", "$route", "$scope", "$window", "annotationUI", "auth", "drafts", "features", "groups", "serviceUrl", "session", "settings", "streamer"];

},{"./events":52,"./filter/persona":54,"./ui-constants":88,"./util/scope-timeout":92,"scroll-into-view":153}],10:[function(require,module,exports){
'use strict';

configureLocation.$inject = ["$locationProvider"];
setupCrossFrame.$inject = ["crossframe"];
configureHttp.$inject = ["$httpProvider", "jwtInterceptorProvider"];
setupHttp.$inject = ["$http", "streamer"];
configureRoutes.$inject = ["$routeProvider"];
var queryString = require('query-string');

require('./polyfills');

var raven;

// Initialize Raven. This is required at the top of this file
// so that it happens early in the app's startup flow
var configParam = queryString.parse(window.location.search).config || 'null';
var settings = require('./settings')(document);
Object.assign(settings, JSON.parse(configParam));
if (settings.raven) {
  raven = require('./raven');
  raven.init(settings.raven);
}

// Disable Angular features that are not compatible with CSP.
//
// See https://docs.angularjs.org/api/ng/directive/ngCsp
//
// The `ng-csp` attribute must be set on some HTML element in the document
// _before_ Angular is require'd for the first time.
document.body.setAttribute('ng-csp', '');

var angular = require('angular');

// autofill-event relies on the existence of window.angular so
// it must be require'd after angular is first require'd
require('autofill-event');

// Setup Angular integration for Raven
if (settings.raven) {
  raven.angularModule(angular);
} else {
  angular.module('ngRaven', []);
}

// Fetch external state that the app needs before it can run. This includes the
// authenticated user state, the API endpoint URLs and WebSocket connection.
var resolve = {
  // @ngInject
  sessionState: ["session", function (session) {
    return session.load();
  }],
};

// @ngInject
function configureLocation($locationProvider) {
  // Use HTML5 history
  return $locationProvider.html5Mode(true);
}

// @ngInject
var VIEWER_TEMPLATE = require('../../templates/client/viewer.html');

function configureRoutes($routeProvider) {
  $routeProvider.when('/a/:id',
    {
      controller: 'AnnotationViewerController',
      template: VIEWER_TEMPLATE,
      reloadOnSearch: false,
      resolve: resolve,
    });
  $routeProvider.when('/viewer',
    {
      controller: 'WidgetController',
      template: VIEWER_TEMPLATE,
      reloadOnSearch: false,
      resolve: resolve,
    });
  $routeProvider.when('/stream',
    {
      controller: 'StreamController',
      template: VIEWER_TEMPLATE,
      reloadOnSearch: false,
      resolve: resolve,
    });
  return $routeProvider.otherwise({
    redirectTo: '/viewer',
  });
}

// @ngInject
function setupCrossFrame(crossframe) {
  return crossframe.connect();
}

// @ngInject
function configureHttp($httpProvider, jwtInterceptorProvider) {
  // Use the Pyramid XSRF header name
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-Token';
  // Setup JWT tokens for API requests
  $httpProvider.interceptors.push('jwtInterceptor');
  jwtInterceptorProvider.tokenGetter = require('./auth').tokenGetter;
}

// @ngInject
function setupHttp($http, streamer) {
  $http.defaults.headers.common['X-Client-Id'] = streamer.clientId;
}

function processAppOpts() {
  if (settings.liveReloadServer) {
    require('./live-reload-client').connect(settings.liveReloadServer);
  }
}

module.exports = angular.module('h', [
  // Angular addons which export the Angular module name
  // via module.exports
  require('angular-jwt'),
  require('angular-resource'),
  require('angular-route'),
  require('angular-sanitize'),
  require('angular-toastr'),

  // Angular addons which do not export the Angular module
  // name via module.exports
  ['angulartics', require('angulartics')][0],
  ['angulartics.google.analytics', require('angulartics/src/angulartics-ga')][0],
  ['ngTagsInput', require('ng-tags-input')][0],
  ['ui.bootstrap', require('./vendor/ui-bootstrap-custom-tpls-0.13.4')][0],

  // Local addons
  'ngRaven',
])

  .controller('AnnotationUIController', require('./annotation-ui-controller'))
  .controller('AnnotationViewerController', require('./annotation-viewer-controller'))
  .controller('StreamController', require('./stream-controller'))
  .controller('WidgetController', require('./widget-controller'))

  // The root component for the application
  .directive('hypothesisApp', require('./directive/app'))

  // UI components and helpers
  .directive('annotation', require('./directive/annotation').directive)
  .directive('annotationShareDialog', require('./directive/annotation-share-dialog'))
  .directive('annotationThread', require('./directive/annotation-thread'))
  .directive('dropdownMenuBtn', require('./directive/dropdown-menu-btn'))
  .directive('excerpt', require('./directive/excerpt').directive)
  .directive('formInput', require('./directive/form-input'))
  .directive('formValidate', require('./directive/form-validate'))
  .directive('groupList', require('./directive/group-list').directive)
  .directive('helpLink', require('./directive/help-link'))
  .directive('helpPanel', require('./directive/help-panel'))
  .directive('hAutofocus', require('./directive/h-autofocus'))
  .directive('hOnTouch', require('./directive/h-on-touch'))
  .directive('hTooltip', require('./directive/h-tooltip'))
  .directive('loggedoutMessage', require('./directive/loggedout-message'))
  .directive('loginControl', require('./directive/login-control'))
  .directive('loginForm', require('./directive/login-form').directive)
  .directive('markdown', require('./directive/markdown'))
  .directive('publishAnnotationBtn', require('./directive/publish-annotation-btn'))
  .directive('searchStatusBar', require('./directive/search-status-bar'))
  .directive('shareDialog', require('./directive/share-dialog'))
  .directive('sidebarTutorial', require('./directive/sidebar-tutorial').directive)
  .directive('searchInput', require('./directive/search-input'))
  .directive('selectionTabs', require('./directive/selection-tabs'))
  .directive('sortDropdown', require('./directive/sort-dropdown'))
  .directive('spinner', require('./directive/spinner'))
  .directive('statusButton', require('./directive/status-button'))
  .directive('svgIcon', require('./directive/svg-icon'))
  .directive('tagEditor', require('./directive/tag-editor'))
  .directive('threadList', require('./directive/thread-list'))
  .directive('timestamp', require('./directive/timestamp'))
  .directive('topBar', require('./directive/top-bar'))
  .directive('windowScroll', require('./directive/window-scroll'))

  .service('annotationMapper', require('./annotation-mapper'))
  .service('annotationUI', require('./annotation-ui'))
  .service('auth', require('./auth').service)
  .service('bridge', require('./bridge'))
  .service('crossframe', require('./cross-frame'))
  .service('drafts', require('./drafts'))
  .service('features', require('./features'))
  .service('flash', require('./flash'))
  .service('formRespond', require('./form-respond'))
  .service('groups', require('./groups'))
  .service('host', require('./host'))
  .service('localStorage', require('./local-storage'))
  .service('permissions', require('./permissions'))
  .service('queryParser', require('./query-parser'))
  .service('rootThread', require('./root-thread'))
  .service('searchFilter', require('./search-filter'))
  .service('serviceUrl', require('./service-url'))
  .service('session', require('./session'))
  .service('streamer', require('./streamer'))
  .service('streamFilter', require('./stream-filter'))
  .service('tags', require('./tags'))
  .service('unicode', require('./unicode'))
  .service('viewFilter', require('./view-filter'))

  .factory('store', require('./store'))

  .value('AnnotationSync', require('./annotation-sync'))
  .value('AnnotationUISync', require('./annotation-ui-sync'))
  .value('Discovery', require('./discovery'))
  .value('ExcerptOverflowMonitor', require('./directive/excerpt-overflow-monitor'))
  .value('VirtualThreadList', require('./virtual-thread-list'))
  .value('raven', require('./raven'))
  .value('settings', settings)
  .value('time', require('./time'))
  .value('urlEncodeFilter', require('./filter/url').encode)

  .config(configureHttp)
  .config(configureLocation)
  .config(configureRoutes)

  .run(setupCrossFrame)
  .run(setupHttp);

processAppOpts();

var appEl = document.querySelector('hypothesis-app');
angular.bootstrap(appEl, ['h'], {strictDi: true});

},{"../../templates/client/viewer.html":122,"./annotation-mapper":2,"./annotation-sync":4,"./annotation-ui":7,"./annotation-ui-controller":5,"./annotation-ui-sync":6,"./annotation-viewer-controller":8,"./auth":11,"./bridge":12,"./cross-frame":14,"./directive/annotation":18,"./directive/annotation-share-dialog":16,"./directive/annotation-thread":17,"./directive/app":19,"./directive/dropdown-menu-btn":20,"./directive/excerpt":22,"./directive/excerpt-overflow-monitor":21,"./directive/form-input":23,"./directive/form-validate":24,"./directive/group-list":25,"./directive/h-autofocus":26,"./directive/h-on-touch":27,"./directive/h-tooltip":28,"./directive/help-link":29,"./directive/help-panel":30,"./directive/loggedout-message":31,"./directive/login-control":32,"./directive/login-form":33,"./directive/markdown":34,"./directive/publish-annotation-btn":35,"./directive/search-input":36,"./directive/search-status-bar":37,"./directive/selection-tabs":38,"./directive/share-dialog":39,"./directive/sidebar-tutorial":40,"./directive/sort-dropdown":41,"./directive/spinner":42,"./directive/status-button":43,"./directive/svg-icon":44,"./directive/tag-editor":45,"./directive/thread-list":46,"./directive/timestamp":47,"./directive/top-bar":48,"./directive/window-scroll":49,"./discovery":50,"./drafts":51,"./features":53,"./filter/url":55,"./flash":56,"./form-respond":57,"./groups":59,"./host":60,"./live-reload-client":61,"./local-storage":62,"./permissions":65,"./polyfills":"/h/static/scripts/polyfills.js","./query-parser":66,"./raven":67,"./root-thread":75,"./search-filter":77,"./service-url":78,"./session":79,"./settings":80,"./store":81,"./stream-controller":82,"./stream-filter":83,"./streamer":84,"./tags":86,"./time":87,"./unicode":89,"./vendor/ui-bootstrap-custom-tpls-0.13.4":94,"./view-filter":95,"./virtual-thread-list":96,"./widget-controller":98,"angular":"angular","angular-jwt":"angular-jwt","angular-resource":"angular-resource","angular-route":"angular-route","angular-sanitize":"angular-sanitize","angular-toastr":"angular-toastr","angulartics":123,"angulartics/src/angulartics-ga":"angulartics/src/angulartics-ga","autofill-event":124,"ng-tags-input":"ng-tags-input","query-string":135}],11:[function(require,module,exports){
'use strict';

/**
 * Provides functions for retrieving and caching API tokens required by
 * API requests and logging out of the API.
 */

fetchToken.$inject = ["$http", "session", "settings"];
fetchOrReuseToken.$inject = ["$http", "jwtHelper", "session", "settings"];
tokenGetter.$inject = ["$http", "config", "jwtHelper", "session", "settings"];
authService.$inject = ["flash", "session"];
var INITIAL_TOKEN = {
  // The user ID which the current cached token is valid for
  userid: undefined,
  // Promise for the API token for 'userid'.
  // This is initialized when fetchOrReuseToken() is called and
  // reset when logging out via logout()
  token: undefined,
};

var cachedToken = INITIAL_TOKEN;

/**
 * Fetches a new API token for the current logged-in user.
 *
 * @return {Promise} - A promise for a new JWT token.
 */
// @ngInject
function fetchToken($http, session, settings) {
  var tokenUrl = new URL('token', settings.apiUrl).href;

  // Explicitly include the CSRF token in the headers. This won't be done
  // automatically in the extension as this will be a cross-domain request, and
  // Angular's CSRF support doesn't operate automatically cross-domain.
  var headers = {};
  headers[$http.defaults.xsrfHeaderName] = session.state.csrf;

  var config = {
    headers: headers,
    // Skip JWT authorization for the token request itself.
    skipAuthorization: true,
  };

  return $http.get(tokenUrl, config).then(function (response) {
    return response.data;
  });
}

/**
 * Fetches or returns a cached JWT API token for the current user.
 *
 * @return {Promise} - A promise for a JWT API token for the current
 *                     user.
 */
// @ngInject
function fetchOrReuseToken($http, jwtHelper, session, settings) {
  function refreshToken() {
    return fetchToken($http, session, settings).then(function (token) {
      return token;
    });
  }

  var userid;

  return session.load()
    .then(function (data) {
      userid = data.userid;
      if (userid === cachedToken.userid && cachedToken.token) {
        return cachedToken.token;
      } else {
        cachedToken = {
          userid: userid,
          token: refreshToken(),
        };
        return cachedToken.token;
      }
    })
    .then(function (token) {
      if (jwtHelper.isTokenExpired(token)) {
        cachedToken = {
          userid: userid,
          token: refreshToken(),
        };
        return cachedToken.token;
      } else {
        return token;
      }
    });
}

/**
 * JWT token fetcher function for use with 'angular-jwt'
 *
 * angular-jwt should be configured to use this function as its
 * tokenGetter implementation.
 */
// @ngInject
function tokenGetter($http, config, jwtHelper, session, settings) {
  // Only send the token on requests to the annotation storage service
  if (config.url.slice(0, settings.apiUrl.length) === settings.apiUrl) {
    return fetchOrReuseToken($http, jwtHelper, session, settings);
  } else {
    return null;
  }
}

function clearCache() {
  cachedToken = INITIAL_TOKEN;
}

// @ngInject
function authService(flash, session) {
  /**
   * Log out from the API and clear any cached tokens.
   *
   * @return {Promise<void>} - A promise for when logout has completed.
   */
  function logout() {
    return session.logout({}).$promise
      .then(function() {
        clearCache();
      })
      .catch(function(err) {
        flash.error('Log out failed!');
        throw err;
      });
  }

  return {
    logout: logout,
  };
}

module.exports = {
  tokenGetter: tokenGetter,
  clearCache: clearCache,
  service: authService,
};

},{}],12:[function(require,module,exports){
var Bridge, RPC, extend,
  slice = [].slice;

extend = require('extend');

RPC = require('./frame-rpc');

module.exports = Bridge = (function() {
  Bridge.prototype.links = null;

  Bridge.prototype.channelListeners = null;

  Bridge.prototype.onConnectListeners = null;

  function Bridge() {
    this.links = [];
    this.channelListeners = {};
    this.onConnectListeners = [];
  }

  Bridge.prototype.destroy = function() {
    var i, len, link, ref, results1;
    ref = this.links;
    results1 = [];
    for (i = 0, len = ref.length; i < len; i++) {
      link = ref[i];
      results1.push(link.channel.destroy());
    }
    return results1;
  };

  Bridge.prototype.createChannel = function(source, origin, token) {
    var channel, connect, connected, listeners, ready;
    channel = null;
    connected = false;
    ready = (function(_this) {
      return function() {
        var cb, i, len, ref, results1;
        if (connected) {
          return;
        }
        connected = true;
        ref = _this.onConnectListeners;
        results1 = [];
        for (i = 0, len = ref.length; i < len; i++) {
          cb = ref[i];
          results1.push(cb.call(null, channel, source));
        }
        return results1;
      };
    })(this);
    connect = (function(_this) {
      return function(_token, cb) {
        if (_token === token) {
          cb();
          return ready();
        }
      };
    })(this);
    listeners = extend({
      connect: connect
    }, this.channelListeners);
    channel = new RPC(window, source, origin, listeners);
    channel.call('connect', token, ready);
    this.links.push({
      channel: channel,
      window: source
    });
    return channel;
  };

  Bridge.prototype.call = function() {
    var _makeDestroyFn, args, cb, method, promises, resultPromise;
    method = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    cb = null;
    if (typeof args[args.length - 1] === 'function') {
      cb = args[args.length - 1];
      args = args.slice(0, -1);
    }
    _makeDestroyFn = (function(_this) {
      return function(c) {
        return function(error) {
          var l;
          c.destroy();
          _this.links = (function() {
            var i, len, ref, results1;
            ref = this.links;
            results1 = [];
            for (i = 0, len = ref.length; i < len; i++) {
              l = ref[i];
              if (l.channel !== c) {
                results1.push(l);
              }
            }
            return results1;
          }).call(_this);
          throw error;
        };
      };
    })(this);
    promises = this.links.map(function(l) {
      var p;
      p = new Promise(function(resolve, reject) {
        var err, error1, ref, timeout;
        timeout = setTimeout((function() {
          return resolve(null);
        }), 1000);
        try {
          return (ref = l.channel).call.apply(ref, [method].concat(slice.call(args), [function(err, result) {
            clearTimeout(timeout);
            if (err) {
              return reject(err);
            } else {
              return resolve(result);
            }
          }]));
        } catch (error1) {
          err = error1;
          return reject(err);
        }
      });
      return p["catch"](_makeDestroyFn(l.channel));
    });
    resultPromise = Promise.all(promises);
    if (cb != null) {
      resultPromise = resultPromise.then(function(results) {
        return cb(null, results);
      })["catch"](function(error) {
        return cb(error);
      });
    }
    return resultPromise;
  };

  Bridge.prototype.on = function(method, callback) {
    if (this.channelListeners[method]) {
      throw new Error("Listener '" + method + "' already bound in Bridge");
    }
    this.channelListeners[method] = callback;
    return this;
  };

  Bridge.prototype.off = function(method) {
    delete this.channelListeners[method];
    return this;
  };

  Bridge.prototype.onConnect = function(callback) {
    this.onConnectListeners.push(callback);
    return this;
  };

  return Bridge;

})();


},{"./frame-rpc":58,"extend":126}],13:[function(require,module,exports){
'use strict';

/** Default state for new threads, before applying filters etc. */
var DEFAULT_THREAD_STATE = {
  /**
   * The ID of this thread. This will be the same as the annotation ID for
   * created annotations or the `$$tag` property for new annotations.
   */
  id: undefined,
  /**
   * The Annotation which is displayed by this thread.
   *
   * This may be null if the existence of an annotation is implied by the
   * `references` field in an annotation but the referenced parent annotation
   * does not exist.
   */
  annotation: undefined,
  /** The parent thread ID */
  parent: undefined,
  /** True if this thread is collapsed, hiding replies to this annotation. */
  collapsed: false,
  /** True if this annotation matches the current filters. */
  visible: true,
  /** Replies to this annotation. */
  children: [],
  /**
    * The total number of children of this annotation,
    * including any which have been hidden by filters.
    */
  totalChildren: 0,
  /**
   * The highlight state of this annotation:
   *  undefined - Do not (de-)emphasize this annotation
   *  'dim' - De-emphasize this annotation
   *  'highlight' - Emphasize this annotation
   */
  highlightState: undefined,
};

/**
 * Returns a persistent identifier for an Annotation.
 * If the Annotation has been created on the server, it will have
 * an ID assigned, otherwise we fall back to the local-only '$$tag'
 * property.
 */
function id(annotation) {
  return annotation.id || annotation.$$tag;
}

/**
 * Link the annotation with ID `id` to its parent thread.
 *
 * @param {string} id
 * @param {Array<string>} parents - IDs of parent annotations, from the
 *        annotation's `references` field.
 */
function setParentID(threads, id, parents) {
  if (threads[id].parent || !parents.length) {
    // Parent already assigned, do not try to change it.
    return;
  }
  var parentID = parents[parents.length-1];
  if (!threads[parentID]) {
    // Parent does not exist. This may be a reply to an annotation which has
    // been deleted. Create a placeholder Thread with no annotation to
    // represent the missing annotation.
    threads[parentID] = Object.assign({}, DEFAULT_THREAD_STATE, {
      id: parentID,
      children: [],
    });
    setParentID(threads, parentID, parents.slice(0,-1));
  }

  var grandParentID = threads[parentID].parent;
  while (grandParentID) {
    if (grandParentID === id) {
      // There is a loop in the `references` field, abort.
      return;
    } else {
      grandParentID = threads[grandParentID].parent;
    }
  }

  threads[id].parent = parentID;
  threads[parentID].children.push(threads[id]);
}

/**
 * Creates a thread of annotations from a list of annotations.
 *
 * Given a flat list of annotations and replies, this generates a hierarchical
 * thread, using the `references` field of an annotation to link together
 * annotations and their replies. The `references` field is a possibly
 * incomplete ordered list of the parents of an annotation, from furthest to
 * nearest ancestor.
 *
 * @param {Array<Annotation>} annotations - The input annotations to thread.
 * @return {Thread} - The input annotations threaded into a tree structure.
 */
function threadAnnotations(annotations) {
  // Map of annotation ID -> container
  var threads = {};

  // Build mapping of annotation ID -> thread
  annotations.forEach(function (annotation) {
    threads[id(annotation)] = Object.assign({}, DEFAULT_THREAD_STATE, {
      id: id(annotation),
      annotation: annotation,
      children: [],
    });
  });

  // Set each thread's parent based on the references field
  annotations.forEach(function (annotation) {
    if (!annotation.references) {
      return;
    }
    setParentID(threads, id(annotation), annotation.references);
  });

  // Collect the set of threads which have no parent as
  // children of the thread root
  var roots = [];
  Object.keys(threads).forEach(function (id) {
    if (!threads[id].parent) {
      // Top-level threads are collapsed by default
      threads[id].collapsed = true;
      roots.push(threads[id]);
    }
  });

  var root = {
    annotation: undefined,
    children: roots,
    visible: true,
    collapsed: false,
    totalChildren: roots.length,
  };

  return root;
}

/**
 * Returns a copy of `thread` with the thread
 * and each of its children transformed by mapFn(thread).
 *
 * @param {Thread} thread
 * @param {(Thread) => Thread} mapFn
 */
function mapThread(thread, mapFn) {
  return Object.assign({}, mapFn(thread), {
    children: thread.children.map(function (child) {
      return mapThread(child, mapFn);
    }),
  });
}

/**
 * Return a sorted copy of an array of threads.
 *
 * @param {Array<Thread>} threads - The list of threads to sort
 * @param {(Annotation,Annotation) => boolean} compareFn
 * @return {Array<Thread>} Sorted list of threads
 */
function sort(threads, compareFn) {
  return threads.slice().sort(function (a, b) {
    // Threads with no annotation always sort to the top
    if (!a.annotation || !b.annotation) {
      if (!a.annotation && !b.annotation) {
        return 0;
      } else {
        return !a.annotation ? -1 : 1;
      }
    }

    if (compareFn(a.annotation, b.annotation)) {
      return -1;
    } else if (compareFn(b.annotation, a.annotation)) {
      return 1;
    } else {
      return 0;
    }
  });
}

/**
 * Return a copy of `thread` with siblings of the top-level thread sorted according
 * to `compareFn` and replies sorted by `replyCompareFn`.
 */
function sortThread(thread, compareFn, replyCompareFn) {
  var children = thread.children.map(function (child) {
    return sortThread(child, replyCompareFn, replyCompareFn);
  });

  return Object.assign({}, thread, {
    children: sort(children, compareFn),
  });
}

/**
 * Return a copy of @p thread with the `replyCount` and `depth` properties
 * updated.
 */
function countRepliesAndDepth(thread, depth) {
  var children = thread.children.map(function (c) {
    return countRepliesAndDepth(c, depth + 1);
  });
  return Object.assign({}, thread, {
    children: children,
    depth: depth,
    replyCount: children.reduce(function (total, child) {
      return total + 1 + child.replyCount;
    }, 0),
  });
}

/** Return true if a thread has any visible children. */
function hasVisibleChildren(thread) {
  return thread.children.some(function (child) {
    return child.visible || hasVisibleChildren(child);
  });
}

/**
 * Default options for buildThread()
 */
var defaultOpts = {
  /** List of currently selected annotation IDs */
  selected: [],
  /**
   * List of IDs of annotations that should be shown even if they
   * do not match the current filter.
   */
  forceVisible: undefined,
  /**
   * Predicate function that returns true if an annotation should be
   * displayed.
   */
  filterFn: undefined,
  /**
   * A filter function which should return true if a given annotation and
   * its replies should be displayed.
   */
  threadFilterFn: undefined,
  /**
   * Mapping of annotation IDs to expansion states.
   */
  expanded: {},
  /** List of highlighted annotation IDs */
  highlighted: [],
  /**
   * Less-than comparison function used to compare annotations in order to sort
   * the top-level thread.
   */
  sortCompareFn: function (a, b) {
    return a.id < b.id;
  },
  /**
   * Less-than comparison function used to compare annotations in order to sort
   * replies.
   */
  replySortCompareFn: function (a, b) {
    return a.created < b.created;
  },
};

/**
 * Project, filter and sort a list of annotations into a thread structure for
 * display by the <annotation-thread> directive.
 *
 * buildThread() takes as inputs a flat list of annotations,
 * the current visibility filters and sort function and returns
 * the thread structure that should be rendered.
 *
 * @param {Array<Annotation>} annotations - A list of annotations and replies
 * @param {Options} opts
 * @return {Thread} - The root thread, whose children are the top-level
 *                    annotations to display.
 */
function buildThread(annotations, opts) {
  opts = Object.assign({}, defaultOpts, opts);

  var thread = threadAnnotations(annotations);

  // Mark annotations as visible or hidden depending on whether
  // they are being edited and whether they match the current filter
  // criteria
  var shouldShowThread = function (annotation) {
    if (opts.forceVisible && opts.forceVisible.indexOf(id(annotation)) !== -1) {
      return true;
    }
    if (opts.filterFn && !opts.filterFn(annotation)) {
      return false;
    }
    return true;
  };

  // When there is a selection, only include top-level threads (annotations)
  // that are selected
  if (opts.selected.length > 0) {
    thread = Object.assign({}, thread, {
      children: thread.children.filter(function (child) {
        return opts.selected.indexOf(child.id) !== -1;
      }),
    });
  }

  // Set the visibility and highlight states of threads
  thread = mapThread(thread, function (thread) {
    var highlightState;
    if (opts.highlighted.length > 0) {
      var isHighlighted = thread.annotation &&
        opts.highlighted.indexOf(thread.id) !== -1;
      highlightState = isHighlighted ? 'highlight' : 'dim';
    }

    return Object.assign({}, thread, {
      highlightState: highlightState,
      visible: thread.visible &&
               thread.annotation &&
               shouldShowThread(thread.annotation),
    });
  });

  // Expand any threads which:
  // 1) Have been explicitly expanded OR
  // 2) Have children matching the filter
  thread = mapThread(thread, function (thread) {
    var id = thread.id;

    // If the thread was explicitly expanded or collapsed, respect that option
    if (opts.expanded.hasOwnProperty(id)) {
      return Object.assign({}, thread, {collapsed: !opts.expanded[id]});
    }

    var hasUnfilteredChildren = opts.filterFn && hasVisibleChildren(thread);

    return Object.assign({}, thread, {
      collapsed: thread.collapsed &&
                 !hasUnfilteredChildren,
    });
  });

  // Remove top-level threads which contain no visible annotations
  thread.children = thread.children.filter(function (child) {
    return child.visible || hasVisibleChildren(child);
  });

  // Get annotations which are of type notes or annotations depending
  // on the filter.
  if (opts.threadFilterFn) {
    thread.children = thread.children.filter(opts.threadFilterFn);
  }

  // Sort the root thread according to the current search criteria
  thread = sortThread(thread, opts.sortCompareFn, opts.replySortCompareFn);

  // Update `replyCount` and `depth` properties
  thread = countRepliesAndDepth(thread, -1);

  return thread;
}

module.exports = buildThread;

},{}],14:[function(require,module,exports){
var CrossFrame,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

module.exports = CrossFrame = (function() {
  CrossFrame.$inject = ['$rootScope', '$document', '$window', 'store', 'annotationUI', 'Discovery', 'bridge', 'AnnotationSync', 'AnnotationUISync'];

  function CrossFrame($rootScope, $document, $window, store, annotationUI, Discovery, bridge, AnnotationSync, AnnotationUISync) {
    var addFrame, createAnnotationSync, createAnnotationUISync, createDiscovery;
    this.frames = [];
    createDiscovery = function() {
      var options;
      options = {
        server: true
      };
      return new Discovery($window, options);
    };
    createAnnotationSync = function() {
      var options, whitelist;
      whitelist = ['$orphan', '$highlight', 'target', 'document', 'uri'];
      options = {
        formatter: function(annotation) {
          var formatted, k, v;
          formatted = {};
          for (k in annotation) {
            v = annotation[k];
            if (indexOf.call(whitelist, k) >= 0) {
              formatted[k] = v;
            }
          }
          return formatted;
        },
        parser: function(annotation) {
          var k, parsed, v;
          parsed = {};
          for (k in annotation) {
            v = annotation[k];
            if (indexOf.call(whitelist, k) >= 0) {
              parsed[k] = v;
            }
          }
          return parsed;
        },
        merge: function(local, remote) {
          annotationUI.updateAnchorStatus(local.id, local.$$tag, remote.$orphan);
          return local;
        },
        emit: function() {
          var args;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return $rootScope.$apply(function() {
            var ref;
            return (ref = $rootScope.$broadcast).call.apply(ref, [$rootScope].concat(slice.call(args)));
          });
        },
        on: function(event, handler) {
          return $rootScope.$on(event, function() {
            var args, event;
            event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            return handler.apply(this, args);
          });
        }
      };
      return new AnnotationSync(bridge, options);
    };
    createAnnotationUISync = function(annotationSync) {
      return new AnnotationUISync($rootScope, $window, annotationUI, bridge);
    };
    addFrame = (function(_this) {
      return function(channel) {
        return channel.call('getDocumentInfo', function(err, info) {
          var documentFingerprint, searchUris;
          if (err) {
            return channel.destroy();
          } else {
            searchUris = [info.uri];
            documentFingerprint = null;
            if (info.metadata && info.metadata.documentFingerprint) {
              documentFingerprint = info.metadata.documentFingerprint;
              searchUris = info.metadata.link.map(function(link) {
                return link.href;
              });
            }
            return $rootScope.$apply(function() {
              return _this.frames.push({
                channel: channel,
                uri: info.uri,
                searchUris: searchUris,
                documentFingerprint: documentFingerprint
              });
            });
          }
        });
      };
    })(this);
    this.connect = function() {
      var annotationSync, annotationUISync, discovery, onDiscoveryCallback;
      discovery = createDiscovery();
      bridge.onConnect(addFrame);
      annotationSync = createAnnotationSync();
      annotationUISync = createAnnotationUISync(annotationSync);
      onDiscoveryCallback = function(source, origin, token) {
        return bridge.createChannel(source, origin, token);
      };
      discovery.startDiscovery(onDiscoveryCallback);
      return this.call = bridge.call.bind(bridge);
    };
    this.call = function() {
      throw new Error('connect() must be called before call()');
    };
  }

  return CrossFrame;

})();


},{}],15:[function(require,module,exports){
'use strict';

// cached date formatting instance.
// See https://github.com/hypothesis/h/issues/2820#issuecomment-166285361
var formatter;

/**
 * Returns a standard human-readable representation
 * of a date and time.
 */
function format(date) {
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return formatter.format(date);
  } else {
    // IE < 11, Safari <= 9.0.
    // In English, this generates the string most similar to
    // the toLocaleDateString() result above.
    return date.toDateString() + ' ' + date.toLocaleTimeString();
  }
}

module.exports = {
  format: format,
};

},{}],16:[function(require,module,exports){
'use strict';

var angular = require('angular');

var scopeTimeout = require('../util/scope-timeout');

module.exports = function () {
  return {
    bindToController: true,
    controllerAs: 'vm',
    restrict: 'E',
    template: require('../../../templates/client/annotation_share_dialog.html'),
    // @ngInject
    controller: ["$scope", "$element", function ($scope, $element) {
      var shareLinkInput = $element.find('input')[0];

      $scope.$watch('vm.isOpen', function (isOpen) {
        if (isOpen) {
          // Focus the input and select it once the dialog has become visible
          scopeTimeout($scope, function () {
            shareLinkInput.focus();
            shareLinkInput.select();
          });

          var hideListener = function (event) {
            $scope.$apply(function () {
              if (!$element[0].contains(event.target)) {
                document.removeEventListener('click', hideListener);
                this.onClose();
              }
            }.bind(this));
          }.bind(this);

          // Stop listening for clicks outside the dialog once it is closed.
          // The setTimeout() here is to ignore the initial click that opens
          // the dialog.
          scopeTimeout($scope, function () {
            document.addEventListener('click', hideListener);
          }, 0);
        }
      }.bind(this));

      this.copyToClipboard = function (event) {
        var $container = angular.element(event.currentTarget).parent();
        var shareLinkInput = $container.find('input')[0];

        try {
          shareLinkInput.select();

          // In some browsers, execCommand() returns false if it fails,
          // in others, it may throw an exception instead.
          if (!document.execCommand('copy')) {
            throw new Error('Copying link failed');
          }

          this.copyToClipboardMessage = 'Link copied to clipboard!';
        } catch (ex) {
          this.copyToClipboardMessage = 'Select and copy to share.';
        } finally {
          setTimeout(function () {
            this.copyToClipboardMessage = null;
            $scope.$digest();
          }.bind(this),
            1000);
        }
      }.bind(this);
    }],
    scope: {
      group: '<',
      uri: '<',
      isPrivate: '<',
      isOpen: '<',
      onClose: '&',
    },
  };
};

},{"../../../templates/client/annotation_share_dialog.html":100,"../util/scope-timeout":92,"angular":"angular"}],17:[function(require,module,exports){
'use strict';

function hiddenCount(thread) {
  var isHidden = thread.annotation && !thread.visible;
  return thread.children.reduce(function (count, reply) {
    return count + hiddenCount(reply);
  }, isHidden ? 1 : 0);
}

function visibleCount(thread) {
  var isVisible = thread.annotation && thread.visible;
  return thread.children.reduce(function (count, reply) {
    return count + visibleCount(reply);
  }, isVisible ? 1 : 0);
}

function showAllChildren(thread, showFn) {
  thread.children.forEach(function (child) {
    showFn({thread: child});
    showAllChildren(child, showFn);
  });
}

function showAllParents(thread, showFn) {
  while (thread.parent && thread.parent.annotation) {
    showFn({thread: thread.parent});
    thread = thread.parent;
  }
}

// @ngInject
function AnnotationThreadController() {
  // Flag that tracks whether the content of the annotation is hovered,
  // excluding any replies.
  this.annotationHovered = false;

  this.toggleCollapsed = function () {
    this.onChangeCollapsed({
      id: this.thread.id,
      collapsed: !this.thread.collapsed,
    });
  };

  this.threadClasses = function () {
    return {
      'annotation-thread': true,
      'annotation-thread--reply': this.thread.depth > 0,
      'annotation-thread--top-reply': this.thread.depth === 1,
    };
  };

  this.threadToggleClasses = function () {
    return {
      'annotation-thread__collapse-toggle': true,
      'is-open': !this.thread.collapsed,
      'is-hovered': this.annotationHovered,
    };
  };

  this.annotationClasses = function () {
    return {
      annotation: true,
      'annotation--reply': this.thread.depth > 0,
      'is-collapsed': this.thread.collapsed,
      'is-highlighted': this.thread.highlightState === 'highlight',
      'is-dimmed': this.thread.highlightState === 'dim',
    };
  };

  /**
   * Show this thread and any of its children
   */
  this.showThreadAndReplies = function () {
    showAllParents(this.thread, this.onForceVisible);
    this.onForceVisible({thread: this.thread});
    showAllChildren(this.thread, this.onForceVisible);
  };

  this.isTopLevelThread = function () {
    return !this.thread.parent;
  };

  /**
   * Return the total number of annotations in the current
   * thread which have been hidden because they do not match the current
   * search filter.
   */
  this.hiddenCount = function () {
    return hiddenCount(this.thread);
  };

  this.shouldShowReply = function (child) {
    return visibleCount(child) > 0;
  };
}

/**
 * Renders a thread of annotations.
 */
module.exports = function () {
  return {
    restrict: 'E',
    bindToController: true,
    controllerAs: 'vm',
    controller: AnnotationThreadController,
    scope: {
      /** The annotation thread to render. */
      thread: '<',
      /**
       * Specify whether document information should be shown
       * on annotation cards.
       */
      showDocumentInfo: '<',
      /** Called when the user clicks on the expand/collapse replies toggle. */
      onChangeCollapsed: '&',
      /**
       * Called when the user clicks the button to show this thread or
       * one of its replies.
       */
      onForceVisible: '&',
    },
    template: require('../../../templates/client/annotation_thread.html'),
  };
};

},{"../../../templates/client/annotation_thread.html":101}],18:[function(require,module,exports){
/* eslint consistent-this: ["error", "vm"] */

'use strict';

AnnotationController.$inject = ["$document", "$q", "$rootScope", "$scope", "$timeout", "$window", "annotationUI", "annotationMapper", "drafts", "flash", "features", "groups", "permissions", "serviceUrl", "session", "store", "streamer"];
var annotationMetadata = require('../annotation-metadata');
var events = require('../events');
var memoize = require('../util/memoize');
var persona = require('../filter/persona');

var isNew = annotationMetadata.isNew;
var isReply = annotationMetadata.isReply;

/** Return a human-readable error message for the given server error.
 *
 * @param {object} reason The error object from the server. Should have
 * `status` and, if `status` is not `0`, `statusText` and (optionally)
 * `data.reason` properties.
 *
 * @returns {string}
 */
function errorMessage(reason) {
  var message;
  if (reason.status <= 0) {
    message = 'Service unreachable.';
  } else {
    message = reason.status + ' ' + reason.statusText;
    if (reason.data && reason.data.reason) {
      message = message + ': ' + reason.data.reason;
    }
  }
  return message;
}

/**
 * Return a copy of `annotation` with changes made in the editor applied.
 */
function updateModel(annotation, changes, permissions) {
  return Object.assign({}, annotation, {
    // Explicitly copy across the non-enumerable local tag for the annotation
    $$tag: annotation.$$tag,

    // Apply changes from the draft
    tags: changes.tags,
    text: changes.text,
    permissions: changes.isPrivate ?
      permissions.private() : permissions.shared(annotation.group),
  });
}

// @ngInject
function AnnotationController(
  $document, $q, $rootScope, $scope, $timeout, $window, annotationUI,
  annotationMapper, drafts, flash, features, groups, permissions, serviceUrl,
  session, store, streamer) {

  var vm = this;
  var newlyCreatedByHighlightButton;

  /** Save an annotation to the server. */
  function save(annot) {
    var saved;
    if (annot.id) {
      saved = store.annotation.update({id: annot.id}, annot);
    } else {
      saved = store.annotation.create({}, annot);
    }
    return saved.then(function (savedAnnot) {
      // Copy across internal properties which are not part of the annotation
      // model saved on the server
      savedAnnot.$$tag = annot.$$tag;
      Object.keys(annot).forEach(function (k) {
        if (k[0] === '$') {
          savedAnnot[k] = annot[k];
        }
      });
      return savedAnnot;
    });
  }

  /**
    * Initialize this AnnotationController instance.
    *
    * Initialize the `vm` object and any other variables that it needs,
    * register event listeners, etc.
    *
    * All initialization code intended to run when a new AnnotationController
    * instance is instantiated should go into this function, except defining
    * methods on `vm`. This function is called on AnnotationController
    * instantiation after all of the methods have been defined on `vm`, so it
    * can call the methods.
    */
  function init() {
    // The remaining properties on vm are read-only properties for the
    // templates.

    vm.serviceUrl = serviceUrl;

    /** Give the template access to the feature flags. */
    vm.feature = features.flagEnabled;

    /** Determines whether controls to expand/collapse the annotation body
     * are displayed adjacent to the tags field.
     */
    vm.canCollapseBody = false;

    /** Determines whether the annotation body should be collapsed. */
    vm.collapseBody = true;

    /** True if the annotation is currently being saved. */
    vm.isSaving = false;

    /** True if the 'Share' dialog for this annotation is currently open. */
    vm.showShareDialog = false;

    /**
      * `true` if this AnnotationController instance was created as a result of
      * the highlight button being clicked.
      *
      * `false` if the annotation button was clicked, or if this is a highlight
      * or annotation that was fetched from the server (as opposed to created
      * new client-side).
      */
    newlyCreatedByHighlightButton = vm.annotation.$highlight || false;

    // New annotations (just created locally by the client, rather then
    // received from the server) have some fields missing. Add them.
    vm.annotation.user = vm.annotation.user || session.state.userid;
    vm.annotation.group = vm.annotation.group || groups.focused().id;
    if (!vm.annotation.permissions) {
      vm.annotation.permissions = permissions.default(vm.annotation.group);
    }
    vm.annotation.text = vm.annotation.text || '';
    if (!Array.isArray(vm.annotation.tags)) {
      vm.annotation.tags = [];
    }

    // Automatically save new highlights to the server when they're created.
    // Note that this line also gets called when the user logs in (since
    // AnnotationController instances are re-created on login) so serves to
    // automatically save highlights that were created while logged out when you
    // log in.
    saveNewHighlight();

    // If this annotation is not a highlight and if it's new (has just been
    // created by the annotate button) or it has edits not yet saved to the
    // server - then open the editor on AnnotationController instantiation.
    if (!newlyCreatedByHighlightButton) {
      if (isNew(vm.annotation) || drafts.get(vm.annotation)) {
        vm.edit();
      }
    }
  }

  /** Save this annotation if it's a new highlight.
   *
   * The highlight will be saved to the server if the user is logged in,
   * saved to drafts if they aren't.
   *
   * If the annotation is not new (it has already been saved to the server) or
   * is not a highlight then nothing will happen.
   *
   */
  function saveNewHighlight() {
    if (!isNew(vm.annotation)) {
      // Already saved.
      return;
    }

    if (!vm.isHighlight()) {
      // Not a highlight,
      return;
    }

    if (vm.annotation.user) {
      // User is logged in, save to server.
      // Highlights are always private.
      vm.annotation.permissions = permissions.private();
      save(vm.annotation).then(function(model) {
        model.$$tag = vm.annotation.$$tag;
        $rootScope.$broadcast(events.ANNOTATION_CREATED, model);
      });
    } else {
      // User isn't logged in, save to drafts.
      drafts.update(vm.annotation, vm.state());
    }
  }

  /**
    * @ngdoc method
    * @name annotation.AnnotationController#authorize
    * @param {string} action The action to authorize.
    * @returns {boolean} True if the action is authorized for the current user.
    * @description Checks whether the current user can perform an action on
    * the annotation.
    */
  vm.authorize = function(action) {
    // TODO: this should use auth instead of permissions but we might need
    // an auth cache or the JWT -> userid decoding might start to be a
    // performance bottleneck and we would need to get the id token into the
    // session, which we should probably do anyway (and move to opaque bearer
    // tokens for the access token).
    return permissions.permits(action, vm.annotation, session.state.userid);
  };

  /**
    * @ngdoc method
    * @name annotation.AnnotationController#delete
    * @description Deletes the annotation.
    */
  vm.delete = function() {
    return $timeout(function() {  // Don't use confirm inside the digest cycle.
      var msg = 'Are you sure you want to delete this annotation?';
      if ($window.confirm(msg)) {
        var onRejected = function(reason) {
          flash.error(
            errorMessage(reason), 'Deleting annotation failed');
        };
        $scope.$apply(function() {
          annotationMapper.deleteAnnotation(vm.annotation).then(
            null, onRejected);
        });
      }
    }, true);
  };

  /**
    * @ngdoc method
    * @name annotation.AnnotationController#edit
    * @description Switches the view to an editor.
    */
  vm.edit = function() {
    if (!drafts.get(vm.annotation)) {
      drafts.update(vm.annotation, vm.state());
    }
  };

  /**
   * @ngdoc method
   * @name annotation.AnnotationController#editing.
   * @returns {boolean} `true` if this annotation is currently being edited
   *   (i.e. the annotation editor form should be open), `false` otherwise.
   */
  vm.editing = function() {
    return drafts.get(vm.annotation) && !vm.isSaving;
  };

  /**
    * @ngdoc method
    * @name annotation.AnnotationController#group.
    * @returns {Object} The full group object associated with the annotation.
    */
  vm.group = function() {
    return groups.get(vm.annotation.group);
  };

  /**
    * @ngdoc method
    * @name annotation.AnnotaitonController#hasContent
    * @returns {boolean} `true` if this annotation has content, `false`
    *   otherwise.
    */
  vm.hasContent = function() {
    return vm.state().text.length > 0 || vm.state().tags.length > 0;
  };

  /**
    * @returns {boolean} True if this annotation has quotes
    */
  vm.hasQuotes = function() {
    return vm.annotation.target.some(function(target) {
      return target.selector && target.selector.some(function(selector) {
        return selector.type === 'TextQuoteSelector';
      });
    });
  };

  vm.id = function() {
    return vm.annotation.id;
  };

  /**
    * @ngdoc method
    * @name annotation.AnnotationController#isHighlight.
    * @returns {boolean} true if the annotation is a highlight, false otherwise
    */
  vm.isHighlight = function() {
    if (newlyCreatedByHighlightButton) {
      return true;
    } else if (isNew(vm.annotation)) {
      return false;
    } else {
      // Once an annotation has been saved to the server there's no longer a
      // simple property that says whether it's a highlight or not.  For
      // example there's no vm.annotation.highlight: true.  Instead a highlight is
      // defined as an annotation that isn't a page note or a reply and that
      // has no text or tags.
      var isPageNote = (vm.annotation.target || []).length === 0;
      return (!isPageNote && !isReply(vm.annotation) && !vm.hasContent());
    }
  };

  /**
    * @ngdoc method
    * @name annotation.AnnotationController#isShared
    * @returns {boolean} True if the annotation is shared (either with the
    * current group or with everyone).
    */
  vm.isShared = function() {
    return !vm.state().isPrivate;
  };

  // Save on Meta + Enter or Ctrl + Enter.
  vm.onKeydown = function (event) {
    if (event.keyCode === 13 && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      vm.save();
    }
  };

  vm.toggleCollapseBody = function(event) {
    event.stopPropagation();
    vm.collapseBody = !vm.collapseBody;
  };

  /**
    * @ngdoc method
    * @name annotation.AnnotationController#reply
    * @description
    * Creates a new message in reply to this annotation.
    */
  vm.reply = function() {
    var references = (vm.annotation.references || []).concat(vm.annotation.id);
    var group = vm.annotation.group;
    var replyPermissions;
    if (session.state.userid) {
      replyPermissions = vm.state().isPrivate ?
        permissions.private() : permissions.shared(group);
    }
    annotationMapper.createAnnotation({
      group: group,
      references: references,
      permissions: replyPermissions,
      uri: vm.annotation.uri,
    });
  };

  /**
    * @ngdoc method
    * @name annotation.AnnotationController#revert
    * @description Reverts an edit in progress and returns to the viewer.
    */
  vm.revert = function() {
    drafts.remove(vm.annotation);
    if (isNew(vm.annotation)) {
      $rootScope.$broadcast(events.ANNOTATION_DELETED, vm.annotation);
    }
  };

  vm.save = function() {
    if (!vm.annotation.user) {
      flash.info('Please log in to save your annotations.');
      return Promise.resolve();
    }
    if (!vm.hasContent() && vm.isShared()) {
      flash.info('Please add text or a tag before publishing.');
      return Promise.resolve();
    }

    var updatedModel = updateModel(vm.annotation, vm.state(), permissions);

    // Optimistically switch back to view mode and display the saving
    // indicator
    vm.isSaving = true;

    return save(updatedModel).then(function (model) {
      Object.assign(updatedModel, model);

      vm.isSaving = false;

      var event = isNew(vm.annotation) ?
        events.ANNOTATION_CREATED : events.ANNOTATION_UPDATED;
      drafts.remove(vm.annotation);

      $rootScope.$broadcast(event, updatedModel);
    }).catch(function (reason) {
      vm.isSaving = false;
      vm.edit();
      flash.error(
        errorMessage(reason), 'Saving annotation failed');
    });
  };

  /**
    * @ngdoc method
    * @name annotation.AnnotationController#setPrivacy
    *
    * Set the privacy settings on the annotation to a predefined
    * level. The supported levels are 'private' which makes the annotation
    * visible only to its creator and 'shared' which makes the annotation
    * visible to everyone in the group.
    *
    * The changes take effect when the annotation is saved
    */
  vm.setPrivacy = function(privacy) {
    // When the user changes the privacy level of an annotation they're
    // creating or editing, we cache that and use the same privacy level the
    // next time they create an annotation.
    // But _don't_ cache it when they change the privacy level of a reply.
    if (!isReply(vm.annotation)) {
      permissions.setDefault(privacy);
    }
    drafts.update(vm.annotation, {
      tags: vm.state().tags,
      text: vm.state().text,
      isPrivate: privacy === 'private',
    });
  };

  vm.tagStreamURL = function(tag) {
    return serviceUrl('search.tag', {tag: tag});
  };

  vm.target = function() {
    return vm.annotation.target;
  };

  // Note: We fetch the feature flag outside the `isOrphan` method to avoid a
  // lookup on every $digest cycle
  var indicateOrphans = features.flagEnabled('orphans_tab');

  vm.isOrphan = function() {
    return vm.annotation.$orphan && indicateOrphans;
  };

  vm.updated = function() {
    return vm.annotation.updated;
  };

  vm.user = function() {
    return vm.annotation.user;
  };

  vm.username = function() {
    return persona.username(vm.annotation.user);
  };

  vm.isDeleted = function () {
    return streamer.hasPendingDeletion(vm.annotation.id);
  };

  vm.isReply = function () {
    return isReply(vm.annotation);
  };

  vm.links = function () {
    if (vm.annotation.links) {
      return {incontext: vm.annotation.links.incontext ||
                         vm.annotation.links.html ||
                         '',
              html: vm.annotation.links.html};
    } else {
      return {incontext: '', html: ''};
    }
  };

  /**
   * Sets whether or not the controls for expanding/collapsing the body of
   * lengthy annotations should be shown.
   */
  vm.setBodyCollapsible = function (canCollapse) {
    if (canCollapse === vm.canCollapseBody) {
      return;
    }
    vm.canCollapseBody = canCollapse;

    // This event handler is called from outside the digest cycle, so
    // explicitly trigger a digest.
    $scope.$digest();
  };

  vm.setText = function (text) {
    drafts.update(vm.annotation, {
      isPrivate: vm.state().isPrivate,
      tags: vm.state().tags,
      text: text,
    });
  };

  vm.setTags = function (tags) {
    drafts.update(vm.annotation, {
      isPrivate: vm.state().isPrivate,
      tags: tags,
      text: vm.state().text,
    });
  };

  vm.state = function () {
    var draft = drafts.get(vm.annotation);
    if (draft) {
      return draft;
    }
    return {
      tags: vm.annotation.tags,
      text: vm.annotation.text,
      isPrivate: permissions.isPrivate(vm.annotation.permissions,
        vm.annotation.user),
    };
  };

  var documentMeta = memoize(annotationMetadata.domainAndTitle);
  vm.documentMeta = function () {
    return documentMeta(vm.annotation);
  };

  init();
}

// @ngInject
function annotation() {
  return {
    restrict: 'E',
    bindToController: true,
    controller: AnnotationController,
    controllerAs: 'vm',
    scope: {
      annotation: '<',
      showDocumentInfo: '<',
      onReplyCountClick: '&',
      replyCount: '<',
      isCollapsed: '<',
    },
    template: require('../../../templates/client/annotation.html'),
  };
}

module.exports = {
  // These private helper functions aren't meant to be part of the public
  // interface of this module. They've been exported temporarily to enable them
  // to be unit tested.
  // FIXME: The code should be refactored to enable unit testing without having
  // to do this.
  updateModel: updateModel,

  // These are meant to be the public API of this module.
  directive: annotation,
  Controller: AnnotationController,
};

},{"../../../templates/client/annotation.html":99,"../annotation-metadata":3,"../events":52,"../filter/persona":54,"../util/memoize":91}],19:[function(require,module,exports){
'use strict';

var AppController = require('../app-controller');

module.exports = function () {
  return {
    restrict: 'E',
    controller: AppController,
    scope: {},
    template: require('../../../templates/client/app.html'),
  };
};

},{"../../../templates/client/app.html":102,"../app-controller":9}],20:[function(require,module,exports){
'use strict';

// @ngInject
DropdownMenuBtnController.$inject = ["$scope", "$timeout"];
function DropdownMenuBtnController($scope, $timeout) {
  this.onClick = function () {
    $scope.onClick();
  };

  this.toggleDropdown = function($event) {
    $event.stopPropagation();
    $timeout(function () {
      $scope.onToggleDropdown();
    }, 0);
  };
}

module.exports = function () {
  return {
    controller: DropdownMenuBtnController,
    controllerAs: 'vm',
    restrict: 'E',
    scope: {
      isDisabled: '<',
      label: '<',
      dropdownMenuLabel: '@',
      onClick: '&',
      onToggleDropdown: '&',
    },
    template: require('../../../templates/client/dropdown_menu_btn.html'),
  };
};

},{"../../../templates/client/dropdown_menu_btn.html":103}],21:[function(require,module,exports){
'use strict';

function toPx(val) {
  return val.toString() + 'px';
}

/**
 * Interface used by ExcerptOverflowMonitor to retrieve the state of the
 * <excerpt> and report when the state changes.
 *
 * interface Excerpt {
 *   getState(): State;
 *   contentHeight(): number | undefined;
 *   onOverflowChanged(): void;
 * }
 */

/**
 * A helper for the <excerpt> component which handles determinination of the
 * overflow state and content styling given the current state of the component
 * and the height of its contents.
 *
 * When the state of the excerpt or its content changes, the component should
 * call check() to schedule an async update of the overflow state.
 *
 * @param {Excerpt} excerpt - Interface used to query the current state of the
 *        excerpt and notify it when the overflow state changes.
 * @param {(callback) => number} requestAnimationFrame -
 *        Function called to schedule an async recalculation of the overflow
 *        state.
 */
function ExcerptOverflowMonitor(excerpt, requestAnimationFrame) {
  var pendingUpdate = false;

  // Last-calculated overflow state
  var prevOverflowing;

  function update() {
    var state = excerpt.getState();

    if (!pendingUpdate) {
      return;
    }

    pendingUpdate = false;

    var overflowing = false;
    if (state.enabled) {
      var hysteresisPx = state.overflowHysteresis || 0;
      overflowing = excerpt.contentHeight() >
        (state.collapsedHeight + hysteresisPx);
    }
    if (overflowing === prevOverflowing) {
      return;
    }

    prevOverflowing = overflowing;
    excerpt.onOverflowChanged(overflowing);
  }

  /**
   * Schedule a deferred check of whether the content is collapsed.
   */
  function check() {
    if (pendingUpdate) {
      return;
    }
    pendingUpdate = true;
    requestAnimationFrame(update);
  }

  /**
   * Returns an object mapping CSS properties to values that should be applied
   * to an excerpt's content element in order to truncate it based on the
   * current overflow state.
   */
  function contentStyle() {
    var state = excerpt.getState();
    if (!state.enabled) {
      return {};
    }

    var maxHeight = '';
    if (prevOverflowing) {
      if (state.collapse) {
        maxHeight = toPx(state.collapsedHeight);
      } else if (state.animate) {
        // Animating the height change requires that the final
        // height be specified exactly, rather than relying on
        // auto height
        maxHeight = toPx(excerpt.contentHeight());
      }
    } else if (typeof prevOverflowing === 'undefined' &&
               state.collapse) {
      // If the excerpt is collapsed but the overflowing state has not yet
      // been computed then the exact max height is unknown, but it will be
      // in the range [state.collapsedHeight, state.collapsedHeight +
      // state.overflowHysteresis]
      //
      // Here we guess that the final content height is most likely to be
      // either less than `collapsedHeight` or more than `collapsedHeight` +
      // `overflowHysteresis`, in which case it will be truncated to
      // `collapsedHeight`.
      maxHeight = toPx(state.collapsedHeight);
    }

    return {
      'max-height': maxHeight,
    };
  }

  this.contentStyle = contentStyle;
  this.check = check;
}

module.exports = ExcerptOverflowMonitor;

},{}],22:[function(require,module,exports){
'use strict';

excerpt.$inject = ["ExcerptOverflowMonitor"];
function ExcerptController() {
  if (this.collapse === undefined) {
    this.collapse = true;
  }

  if (this.animate === undefined) {
    this.animate = true;
  }

  if (this.enabled === undefined) {
    this.enabled = true;
  }

  this.isExpandable = function () {
    return this.overflowing && this.collapse;
  };

  this.isCollapsible = function () {
    return this.overflowing && !this.collapse;
  };

  this.toggle = function (event) {
    // When the user clicks a link explicitly to toggle the collapsed state,
    // the event is not propagated.
    event.stopPropagation();
    this.collapse = !this.collapse;
  };

  this.expand = function () {
    // When the user expands the excerpt 'implicitly' by clicking at the bottom
    // of the collapsed excerpt, the event is allowed to propagate. For
    // annotation cards, this causes clicking on a quote to scroll the view to
    // the selected annotation.
    this.collapse = false;
  };

  this.showInlineControls = function () {
    return this.overflowing && this.inlineControls;
  };

  this.bottomShadowStyles = function () {
    return {
      'excerpt__shadow': true,
      'excerpt__shadow--transparent': this.inlineControls,
      'is-hidden': !this.isExpandable(),
    };
  };
}

/**
 * @ngdoc directive
 * @name excerpt
 * @restrict E
 * @description This directive truncates the height of its contents to a
 *              specified number of lines and provides controls for expanding
 *              and collapsing the resulting truncated element.
 */
// @ngInject
function excerpt(ExcerptOverflowMonitor) {
  return {
    bindToController: true,
    controller: ExcerptController,
    controllerAs: 'vm',
    link: function (scope, elem, attrs, ctrl) {
      // Test if the element or any of its parents have been hidden by
      // an 'ng-show' directive
      function isElementHidden() {
        var el = elem[0];
        while (el) {
          if (el.classList.contains('ng-hide')) {
            return true;
          }
          el = el.parentElement;
        }
        return false;
      }

      var overflowMonitor = new ExcerptOverflowMonitor({
        getState: function () {
          return {
            enabled: ctrl.enabled,
            animate: ctrl.animate,
            collapsedHeight: ctrl.collapsedHeight,
            collapse: ctrl.collapse,
            overflowHysteresis: ctrl.overflowHysteresis,
          };
        },
        contentHeight: function () {
          var contentElem = elem[0].querySelector('.excerpt');
          if (!contentElem) {
            return null;
          }
          return contentElem.scrollHeight;
        },
        onOverflowChanged: function (overflowing) {
          ctrl.overflowing = overflowing;
          if (ctrl.onCollapsibleChanged) {
            ctrl.onCollapsibleChanged({collapsible: overflowing});
          }
          // Even though this change happens outside the framework, we use
          // $digest() rather than $apply() here to avoid a large number of full
          // digest cycles if many excerpts update their overflow state at the
          // same time. The onCollapsibleChanged() handler, if any, is
          // responsible for triggering any necessary digests in parent scopes.
          scope.$digest();
        },
      }, window.requestAnimationFrame);

      ctrl.contentStyle = overflowMonitor.contentStyle;

      // Listen for document events which might affect whether the excerpt
      // is overflowing, even if its content has not changed.
      elem[0].addEventListener('load', overflowMonitor.check, false /* capture */);
      window.addEventListener('resize', overflowMonitor.check);
      scope.$on('$destroy', function () {
        window.removeEventListener('resize', overflowMonitor.check);
      });

      // Watch for changes to the visibility of the excerpt.
      // Unfortunately there is no DOM API for this, so we rely on a digest
      // being triggered after the visibility changes.
      scope.$watch(isElementHidden, function (hidden) {
        if (!hidden) {
          overflowMonitor.check();
        }
      });

      // Watch input properties which may affect the overflow state
      scope.$watch('vm.contentData', overflowMonitor.check);
      scope.$watch('vm.enabled', overflowMonitor.check);

      // Trigger an initial calculation of the overflow state.
      //
      // This is performed asynchronously so that the content of the <excerpt>
      // has settled - ie. all Angular directives have been fully applied and
      // the DOM has stopped changing. This may take several $digest cycles.
      overflowMonitor.check();
    },
    scope: {
      /** Whether or not expansion should be animated. Defaults to true. */
      animate: '<?',
      /**
       * The data which is used to generate the excerpt's content.
       * When this changes, the excerpt will recompute whether the content
       * is overflowing.
       */
      contentData: '<',
      /** Whether or not truncation should be enabled */
      enabled: '<?',
      /**
       * Specifies whether controls to expand and collapse
       * the excerpt should be shown inside the <excerpt> component.
       * If false, external controls can expand/collapse the excerpt by
       * setting the 'collapse' property.
       */
      inlineControls: '<',
      /** Sets whether or not the excerpt is collapsed. */
      collapse: '=?',
      /**
       * Called when the collapsibility of the excerpt (that is, whether or
       * not the content height exceeds the collapsed height), changes.
       *
       * Note: This function is *not* called from inside a digest cycle,
       * the caller is responsible for triggering any necessary digests.
       */
      onCollapsibleChanged: '&?',
      /** The height of this container in pixels when collapsed.
       */
      collapsedHeight: '<',
      /**
       * The number of pixels by which the height of the excerpt's content
       * must extend beyond the collapsed height in order for truncation to
       * be activated. This prevents the 'More' link from being shown to expand
       * the excerpt if it has only been truncated by a very small amount, such
       * that expanding the excerpt would reveal no extra lines of text.
       */
      overflowHysteresis: '<?',
    },
    restrict: 'E',
    transclude: true,
    template: require('../../../templates/client/excerpt.html'),
  };
}

module.exports = {
  directive: excerpt,
  Controller: ExcerptController,
};

},{"../../../templates/client/excerpt.html":104}],23:[function(require,module,exports){
module.exports = function() {
  return {
    link: function(scope, elem, attr, arg) {
      var errorClassName, fieldClassName, model, render, resetResponse, toggleClass, validator;
      model = arg[0], validator = arg[1];
      if (!model) {
        return;
      }
      fieldClassName = 'form-field';
      errorClassName = 'form-field-error';
      render = model.$render;
      resetResponse = function(value) {
        model.$setValidity('response', true);
        return value;
      };
      toggleClass = function(addClass) {
        elem.toggleClass(errorClassName, addClass);
        return elem.parent().toggleClass(errorClassName, addClass);
      };
      model.$parsers.unshift(resetResponse);
      model.$render = function() {
        toggleClass(model.$invalid && model.$dirty);
        return render();
      };
      if (validator != null) {
        validator.addControl(model);
        scope.$on('$destroy', function() {
          return validator.removeControl(model);
        });
      }
      return scope.$watch(function() {
        if ((model.$modelValue != null) || model.$pristine) {
          toggleClass(model.$invalid && model.$dirty);
        }
      });
    },
    require: ['?ngModel', '^?formValidate'],
    restrict: 'C'
  };
};


},{}],24:[function(require,module,exports){
module.exports = function() {
  return {
    controller: function() {
      var controls;
      controls = {};
      return {
        addControl: function(control) {
          if (control.$name) {
            return controls[control.$name] = control;
          }
        },
        removeControl: function(control) {
          if (control.$name) {
            return delete controls[control.$name];
          }
        },
        submit: function() {
          var _, control, results;
          results = [];
          for (_ in controls) {
            control = controls[_];
            control.$setViewValue(control.$viewValue);
            results.push(control.$render());
          }
          return results;
        }
      };
    },
    link: function(scope, elem, attr, ctrl) {
      return elem.on('submit', function() {
        return ctrl.submit();
      });
    }
  };
};


},{}],25:[function(require,module,exports){
'use strict';

// @ngInject
GroupListController.$inject = ["$scope", "$window", "groups"];
groupList.$inject = ["$window", "groups", "serviceUrl"];
function GroupListController($scope, $window, groups) {
  $scope.leaveGroup = function (groupId) {
    var groupName = groups.get(groupId).name;
    var message = 'Are you sure you want to leave the group "' +
      groupName + '"?';
    if ($window.confirm(message)) {
      groups.leave(groupId);
    }
  };

  $scope.focusGroup = function (groupId) {
    groups.focus(groupId);
  };
}

/**
 * @ngdoc directive
 * @name groupList
 * @restrict E
 * @description Displays a list of groups of which the user is a member.
 */
// @ngInject
function groupList($window, groups, serviceUrl) {
  return {
    controller: GroupListController,
    link: function ($scope) {
      $scope.groups = groups;

      $scope.createNewGroup = function() {
        $window.open(serviceUrl('groups.new'), '_blank');
      };
    },
    restrict: 'E',
    scope: {
      auth: '<',
    },
    template: require('../../../templates/client/group_list.html'),
  };
}

module.exports = {
  directive: groupList,
  Controller: GroupListController,
};

},{"../../../templates/client/group_list.html":105}],26:[function(require,module,exports){
'use strict';

/** An attribute directive that focuses an <input> when it's linked by Angular.
 *
 * The HTML5 autofocus attribute automatically puts the keyboard focus in an
 * <input> on page load. But this doesn't work for <input>s that are
 * rendered by JavaScript/Angular after page load, for example an <input> that
 * is shown/hidden by JavaScript when an ng-if condition becomes true.
 *
 * To automatically put the keyboard focus on such an input when it's linked by
 * Angular, attach this directive to it as an attribute:
 *
 *   <input ng-if="..." h-autofocus>
 *
*/
module.exports = function() {
  return {
    restrict: 'A',
    link: function($scope, $element) {
      $element[0].focus();
    },
  };
};

},{}],27:[function(require,module,exports){
'use strict';

/**
 * Install an event handler on an element.
 *
 * The event handler follows the same behavior as the ng-<event name>
 * directives that Angular includes. This means:
 *
 *  - The handler function is passed an object with an $event property
 *  - The handler function is executed in the context of `$scope.$apply()`
 *
 * @param {Element} element
 * @param {Array<string>} events
 * @param {Function} handler
 */
function addEventHandler($scope, element, events, handler) {
  var callback = function (event) {
    $scope.$apply(function () {
      handler($scope, {$event: event});
    });
  };
  events.forEach(function (name) {
    element.addEventListener(name, callback);
  });
}

/**
 * A directive which adds an event handler for mouse press or touch to
 * a directive. This is similar to `ng-click` etc. but reacts either on
 * mouse press OR touch.
 */
// @ngInject
module.exports = function ($parse) {
  return {
    restrict: 'A',
    link: function ($scope, $element, $attrs) {
      var fn = $parse($attrs.hOnTouch, null /* interceptor */);
      addEventHandler(
        $scope,
        $element[0],
        ['click', 'mousedown', 'touchstart'],
        fn
      );
    },
  };
};
module.exports.$inject = ["$parse"];

},{}],28:[function(require,module,exports){
'use strict';

var theTooltip;

/**
 * A custom tooltip similar to the one used in Google Docs which appears
 * instantly when activated on a target element.
 *
 * The tooltip is displayed and hidden by setting its target element.
 *
 *  var tooltip = new Tooltip(document.body);
 *  tooltip.setState({target: aWidget}); // Show tooltip
 *  tooltip.setState({target: null}); // Hide tooltip
 *
 * The tooltip's label is derived from the target element's 'aria-label'
 * attribute.
 *
 * @param {Element} rootElement - The container for the tooltip.
 */
function Tooltip(rootElement) {
  this.setState = function (state) {
    this.state = Object.freeze(Object.assign({}, this.state, state));
    this.render();
  };

  this.render = function () {
    var TOOLTIP_ARROW_HEIGHT = 7;

    if (!this.state.target) {
      this._el.style.visibility = 'hidden';
      return;
    }

    var target = this.state.target;
    var label = target.getAttribute('aria-label');
    this._labelEl.textContent = label;

    var tooltipRect = this._el.getBoundingClientRect();

    var targetRect = target.getBoundingClientRect();
    var top;

    if (this.state.direction === 'up') {
      top = targetRect.bottom + TOOLTIP_ARROW_HEIGHT;
    } else {
      top = targetRect.top - tooltipRect.height - TOOLTIP_ARROW_HEIGHT;
    }
    var left = targetRect.right - tooltipRect.width;

    this._el.classList.toggle('tooltip--up', this.state.direction === 'up');
    this._el.classList.toggle('tooltip--down', this.state.direction === 'down');

    Object.assign(this._el.style, {
      visibility: '',
      top: top + 'px',
      left: left + 'px',
    });
  };

  this._el = rootElement.ownerDocument.createElement('div');
  this._el.innerHTML = '<span class="tooltip-label js-tooltip-label"></span>';
  this._el.className = 'tooltip';

  rootElement.appendChild(this._el);
  this._labelEl = this._el.querySelector('.js-tooltip-label');

  this.setState({
    direction: 'down',
  });
}

/**
 * Attribute directive which displays a custom tooltip when hovering the
 * associated element.
 *
 * The associated element should use the `aria-label` attribute to specify
 * the tooltip instead of the `title` attribute, which would trigger the
 * display of the browser's native tooltip.
 *
 * Example: '<button aria-label="Tooltip label" h-tooltip></button>'
 */
module.exports = function () {
  if (!theTooltip) {
    theTooltip = new Tooltip(document.body);
  }

  return {
    restrict: 'A',
    link: function ($scope, $element) {
      var el = $element[0];

      el.addEventListener('mouseover', function () {
        var direction = el.getAttribute('tooltip-direction') || 'down';
        theTooltip.setState({
          direction: direction,
          target: el,
        });
      });

      el.addEventListener('mouseout', function () {
        theTooltip.setState({target: null});
      });

      // Hide the tooltip if the element is removed whilst the tooltip is active
      $scope.$on('$destroy', function () {
        if (theTooltip.state.target === el) {
          theTooltip.setState({target: null});
        }
      });
    },
  };
};

},{}],29:[function(require,module,exports){
'use strict';

module.exports = function () {
  return {
    bindToController: true,
    controllerAs: 'vm',
    restrict: 'E',
    template: require('../../../templates/client/help_link.html'),
    controller: function () {},
    scope: {
      version: '<',
      userAgent: '<',
      url: '<',
      documentFingerprint: '<',
      auth: '<',
      dateTime: '<',
    },
  };
};

},{"../../../templates/client/help_link.html":106}],30:[function(require,module,exports){
'use strict';

/**
 * @ngdoc directive
 * @name helpPanel
 * @description Displays product version and environment info
 */
// @ngInject
module.exports = function () {
  return {
    bindToController: true,
    controllerAs: 'vm',
    // @ngInject
    controller: ["$scope", "$window", "crossframe", "serviceUrl", function ($scope, $window, crossframe, serviceUrl) {
      this.userAgent = $window.navigator.userAgent;
      this.version = '0.44.0';  // replaced by versionify
      this.dateTime = new Date();
      this.serviceUrl = serviceUrl;

      $scope.$watchCollection(
        function () {
          return crossframe.frames;
        },
        function (frames) {
          if (frames.length === 0) {
            return;
          }
          this.url = frames[0].uri;
          this.documentFingerprint = frames[0].documentFingerprint;
        }.bind(this)
      );
    }],
    restrict: 'E',
    template: require('../../../templates/client/help_panel.html'),
    scope: {
      auth: '<',
      onClose: '&',
    },
  };
};

},{"../../../templates/client/help_panel.html":107}],31:[function(require,module,exports){
'use strict';

module.exports = function () {
  return {
    bindToController: true,
    controllerAs: 'vm',
    //@ngInject
    controller: ["serviceUrl", function (serviceUrl) {
      this.serviceUrl = serviceUrl;
    }],
    restrict: 'E',
    scope: {
      /**
       * Called when the user clicks on the "Log in" text.
       */
      onLogin: '&',
    },
    template: require('../../../templates/client/loggedout_message.html'),
  };
};

},{"../../../templates/client/loggedout_message.html":108}],32:[function(require,module,exports){
'use strict';

module.exports = function () {
  return {
    bindToController: true,
    controllerAs: 'vm',
    //@ngInject
    controller: ["serviceUrl", function (serviceUrl) {
      this.serviceUrl = serviceUrl;
    }],
    restrict: 'E',
    scope: {
      /**
       * An object representing the current authentication status.
       */
      auth: '<',
      /**
       * Called when the user clicks on the "About this version" text.
       */
      onShowHelpPanel: '&',
      /**
       * Called when the user clicks on the "Log in" text.
       */
      onLogin: '&',
      /**
       * Called when the user clicks on the "Log out" text.
       */
      onLogout: '&',
      /**
       * Whether or not to use the new design for the control.
       *
       * FIXME: should be removed when the old design is deprecated.
       */
      newStyle: '<',
    },
    template: require('../../../templates/client/login_control.html'),
  };
};

},{"../../../templates/client/login_control.html":109}],33:[function(require,module,exports){
'use strict';

Controller.$inject = ["$scope", "$timeout", "flash", "session", "formRespond", "serviceUrl"];
var angular = require('angular');

// @ngInject
function Controller($scope, $timeout, flash, session, formRespond, serviceUrl) {
  var pendingTimeout = null;

  function success(data) {
    if (data.userid) {
      $scope.$emit('auth', null, data);
    }

    angular.copy({}, $scope.model);

    if ($scope.form) {
      $scope.form.$setPristine();
    }
  }

  function failure(form, response) {
    var errors;
    var reason;

    try {
      errors = response.data.errors;
      reason = response.data.reason;
    } catch (e) {
      reason = 'Oops, something went wrong on the server. ' +
        'Please try again later!';
    }

    return formRespond(form, errors, reason);
  }

  function timeout() {
    angular.copy({}, $scope.model);

    if ($scope.form) {
      $scope.form.$setPristine();
    }

    flash.info('For your security, ' +
               'the forms have been reset due to inactivity.');
  }

  function cancelTimeout() {
    if (!pendingTimeout) {
      return;
    }
    $timeout.cancel(pendingTimeout);
    pendingTimeout = null;
  }

  this.serviceUrl = serviceUrl;

  this.submit = function submit(form) {
    formRespond(form);
    if (!form.$valid) {
      return;
    }

    $scope.$broadcast('formState', form.$name, 'loading');

    var handler = session[form.$name];
    var _failure = angular.bind(this, failure, form);
    var res = handler($scope.model, success, _failure);

    res.$promise.finally(function() {
      return $scope.$broadcast('formState', form.$name, '');
    });
  };

  if (!$scope.model) {
    $scope.model = {};
  }

  // Stop the inactivity timeout when the scope is destroyed.
  var removeDestroyHandler = $scope.$on('$destroy', function () {
    cancelTimeout(pendingTimeout);
    $scope.$emit('auth', 'cancel');
  });

  // Skip the cancel when destroying the scope after a successful auth.
  $scope.$on('auth', removeDestroyHandler);

  // Reset the auth forms afterfive minutes of inactivity.
  $scope.$watchCollection('model', function(value) {
    cancelTimeout(pendingTimeout);
    if (value && !angular.equals(value, {})) {
      pendingTimeout = $timeout(timeout, 300000);
    }
  });
}

module.exports = {
  directive: function () {
    return {
      bindToController: true,
      controller: Controller,
      controllerAs: 'vm',
      restrict: 'E',
      scope: {
        onClose: '&',
      },
      template: require('../../../templates/client/login_form.html'),
    };
  },
  Controller: Controller,
};

},{"../../../templates/client/login_form.html":110,"angular":"angular"}],34:[function(require,module,exports){
'use strict';

var debounce = require('lodash.debounce');

var commands = require('../markdown-commands');
var mediaEmbedder = require('../media-embedder');
var renderMarkdown = require('../render-markdown');
var scopeTimeout = require('../util/scope-timeout');

/**
 * @ngdoc directive
 * @name markdown
 * @restrict A
 * @description
 * This directive controls both the rendering and display of markdown, as well as
 * the markdown editor.
 */
// @ngInject
module.exports = function($sanitize) {
  return {
    controller: function () {},
    link: function(scope, elem) {
      var input = elem[0].querySelector('.js-markdown-input');
      var output = elem[0].querySelector('.js-markdown-preview');

      /**
       * Transform the editor's input field with an editor command.
       */
      function updateState(newStateFn) {
        var newState = newStateFn({
          text: input.value,
          selectionStart: input.selectionStart,
          selectionEnd: input.selectionEnd,
        });

        input.value = newState.text;
        input.selectionStart = newState.selectionStart;
        input.selectionEnd = newState.selectionEnd;

        // The input field currently loses focus when the contents are
        // changed. This re-focuses the input field but really it should
        // happen automatically.
        input.focus();
      }

      function focusInput() {
        // When the visibility of the editor changes, focus it.
        // A timeout is used so that focus() is not called until
        // the visibility change has been applied (by adding or removing
        // the relevant CSS classes)
        scopeTimeout(scope, function () {
          input.focus();
        }, 0);
      }

      scope.insertBold = function() {
        updateState(function (state) {
          return commands.toggleSpanStyle(state, '**', '**', 'Bold');
        });
      };

      scope.insertItalic = function() {
        updateState(function (state) {
          return commands.toggleSpanStyle(state, '*', '*', 'Italic');
        });
      };

      scope.insertMath = function() {
        updateState(function (state) {
          var before = state.text.slice(0, state.selectionStart);

          if (before.length === 0 ||
              before.slice(-1) === '\n' ||
              before.slice(-2) === '$$') {
            return commands.toggleSpanStyle(state, '$$', '$$', 'Insert LaTeX');
          } else {
            return commands.toggleSpanStyle(state, '\\(', '\\)',
                                                'Insert LaTeX');
          }
        });
      };

      scope.insertLink = function() {
        updateState(function (state) {
          return commands.convertSelectionToLink(state);
        });
      };

      scope.insertIMG = function() {
        updateState(function (state) {
          return commands.convertSelectionToLink(state,
            commands.LinkType.IMAGE_LINK);
        });
      };

      scope.insertList = function() {
        updateState(function (state) {
          return commands.toggleBlockStyle(state, '* ');
        });
      };

      scope.insertNumList = function() {
        updateState(function (state) {
          return commands.toggleBlockStyle(state, '1. ');
        });
      };

      scope.insertQuote = function() {
        updateState(function (state) {
          return commands.toggleBlockStyle(state, '> ');
        });
      };

      // Keyboard shortcuts for bold, italic, and link.
      elem.on('keydown', function(e) {
        var shortcuts = {
          66: scope.insertBold,
          73: scope.insertItalic,
          75: scope.insertLink,
        };

        var shortcut = shortcuts[e.keyCode];
        if (shortcut && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          shortcut();
        }
      });

      scope.preview = false;
      scope.togglePreview = function () {
        scope.preview = !scope.preview;
      };

      var handleInputChange = debounce(function () {
        scope.$apply(function () {
          scope.onEditText({text: input.value});
        });
      }, 100);
      input.addEventListener('input', handleInputChange);

      // Re-render the markdown when the view needs updating.
      scope.$watch('text', function () {
        output.innerHTML = renderMarkdown(scope.text || '', $sanitize);
        mediaEmbedder.replaceLinksWithEmbeds(output);
      });

      scope.showEditor = function () {
        return !scope.readOnly && !scope.preview;
      };

      // Exit preview mode when leaving edit mode
      scope.$watch('readOnly', function () {
        scope.preview = false;
      });

      scope.$watch('showEditor()', function (show) {
        if (show) {
          input.value = scope.text || '';
          focusInput();
        }
      });
    },

    restrict: 'E',
    scope: {
      readOnly: '<',
      text: '<?',
      onEditText: '&',
    },
    template: require('../../../templates/client/markdown.html'),
  };
};
module.exports.$inject = ["$sanitize"];

},{"../../../templates/client/markdown.html":111,"../markdown-commands":63,"../media-embedder":64,"../render-markdown":73,"../util/scope-timeout":92,"lodash.debounce":130}],35:[function(require,module,exports){
'use strict';

/**
 * @ngdoc directive
 * @name publishAnnotationBtn
 * @description Displays a combined privacy/selection post button to post
 *              a new annotation
 */
// @ngInject
module.exports = function () {
  return {
    bindToController: true,
    controller: function () {
      this.showDropdown = false;
      this.privateLabel = 'Only Me';

      this.publishDestination = function () {
        return this.isShared ? this.group.name : this.privateLabel;
      };

      this.groupType = function () {
        return this.group.public ? 'public' : 'group';
      };

      this.setPrivacy = function (level) {
        this.onSetPrivacy({level: level});
      };
    },
    controllerAs: 'vm',
    restrict: 'E',
    scope: {
      group: '<',
      canPost: '<',
      isShared: '<',
      onCancel: '&',
      onSave: '&',
      onSetPrivacy: '&',
    },
    template: require('../../../templates/client/publish_annotation_btn.html'),
  };
};

},{"../../../templates/client/publish_annotation_btn.html":112}],36:[function(require,module,exports){
'use strict';

// @ngInject
SearchInputController.$inject = ["$element", "$http", "$scope"];
function SearchInputController($element, $http, $scope) {
  var self = this;
  var button = $element.find('button');
  var input = $element.find('input')[0];
  var form = $element.find('form')[0];

  button.on('click', function () {
    input.focus();
  });

  $scope.$watch(
    function () { return $http.pendingRequests.length; },
    function (count) { self.loading = count > 0; }
  );

  form.onsubmit = function (e) {
    e.preventDefault();
    self.onSearch({$query: input.value});
  };

  this.inputClasses = function () {
    return {'is-expanded': self.alwaysExpanded || self.query};
  };

  this.$onChanges = function (changes) {
    if (changes.query) {
      input.value = changes.query.currentValue;
    }
  };
}

// @ngInject
module.exports = function () {
  return {
    bindToController: true,
    controller: SearchInputController,
    controllerAs: 'vm',
    restrict: 'E',
    scope: {
      // Specifies whether the search input field should always be expanded,
      // regardless of whether the it is focused or has an active query.
      //
      // If false, it is only expanded when focused or when 'query' is non-empty
      alwaysExpanded: '<',
      query: '<',
      onSearch: '&',
    },
    template: require('../../../templates/client/search_input.html'),
  };
};

},{"../../../templates/client/search_input.html":113}],37:[function(require,module,exports){
'use strict';

var uiConstants = require('../ui-constants');

// @ngInject
module.exports = function () {
  return {
    bindToController: true,
    controllerAs: 'vm',
    controller: function () {
      this.TAB_ANNOTATIONS = uiConstants.TAB_ANNOTATIONS;
      this.TAB_NOTES = uiConstants.TAB_NOTES;
      this.TAB_ORPHANS = uiConstants.TAB_ORPHANS;
    },
    restrict: 'E',
    scope: {
      filterActive: '<',
      filterMatchCount: '<',
      onClearSelection: '&',
      searchQuery: '<',
      selectedTab: '<',
      selectionCount: '<',
      totalAnnotations: '<',
      totalNotes: '<',
    },
    template: require('../../../templates/client/search_status_bar.html'),
  };
};

},{"../../../templates/client/search_status_bar.html":114,"../ui-constants":88}],38:[function(require,module,exports){
'use strict';

var uiConstants = require('../ui-constants');

module.exports = function () {
  return {
    bindToController: true,
    controllerAs: 'vm',
    //@ngInject
    controller: ["$element", "annotationUI", "features", function ($element, annotationUI, features) {
      this.TAB_ANNOTATIONS = uiConstants.TAB_ANNOTATIONS;
      this.TAB_NOTES = uiConstants.TAB_NOTES;
      this.TAB_ORPHANS = uiConstants.TAB_ORPHANS;

      this.selectTab = function (type) {
        annotationUI.clearSelectedAnnotations();
        annotationUI.selectTab(type);
      };

      this.orphansTabFlagEnabled = function () {
        return features.flagEnabled('orphans_tab');
      };

      this.showAnnotationsUnavailableMessage = function () {
        return this.selectedTab === this.TAB_ANNOTATIONS &&
          this.totalAnnotations === 0 &&
          !this.isWaitingToAnchorAnnotations;
      };

      this.showNotesUnavailableMessage = function () {
        return this.selectedTab === this.TAB_NOTES &&
          this.totalNotes === 0;
      };
    }],
    restrict: 'E',
    scope: {
      isLoading: '<',
      isWaitingToAnchorAnnotations: '<',
      selectedTab: '<',
      totalAnnotations: '<',
      totalNotes: '<',
      totalOrphans: '<',
    },
    template: require('../../../templates/client/selection_tabs.html'),
  };
};

},{"../../../templates/client/selection_tabs.html":115,"../ui-constants":88}],39:[function(require,module,exports){
'use strict';

ShareDialogController.$inject = ["$scope", "$element", "crossframe"];
var VIA_PREFIX = 'https://via.hypothes.is/';

// @ngInject
function ShareDialogController($scope, $element, crossframe) {
  var self = this;

  function updateViaLink(frames) {
    if (!frames.length) {
      self.viaPageLink = '';
      return;
    }

    // Check to see if we are on a via page. If so, we just return the URI.
    if (frames[0].uri.indexOf(VIA_PREFIX) === 0) {
      self.viaPageLink = frames[0].uri;
    } else {
      self.viaPageLink = VIA_PREFIX + frames[0].uri;
    }
  }

  var viaInput = $element[0].querySelector('.js-via');
  viaInput.focus();
  viaInput.select();

  $scope.$watchCollection(function () { return crossframe.frames; },
    updateViaLink);
}

module.exports = function () {
  return {
    restrict: 'E',
    bindToController: true,
    controller: ShareDialogController,
    controllerAs: 'vm',
    scope: {
      onClose: '&',
    },
    template: require('../../../templates/client/share_dialog.html'),
  };
};

},{"../../../templates/client/share_dialog.html":116}],40:[function(require,module,exports){
'use strict';

// @ngInject
SidebarTutorialController.$inject = ["session"];
function SidebarTutorialController(session) {
  this.showSidebarTutorial = function () {
    if (session.state.preferences) {
      if (session.state.preferences.show_sidebar_tutorial) {
        return true;
      }
    }
    return false;
  };

  this.dismiss = function () {
    session.dismiss_sidebar_tutorial();
  };
}

/**
 * @ngdoc directive
 * @name sidebarTutorial
 * @description Displays a short tutorial in the sidebar.
 */
// @ngInject
module.exports = {
  directive: function () {
    return {
      bindToController: true,
      controller: SidebarTutorialController,
      controllerAs: 'vm',
      restrict: 'E',
      scope: {},
      template: require('../../../templates/client/sidebar_tutorial.html'),
    };
  },
  Controller: SidebarTutorialController,
};

},{"../../../templates/client/sidebar_tutorial.html":117}],41:[function(require,module,exports){
'use strict';

module.exports = function () {
  return {
    controller: function () {},
    restrict: 'E',
    scope: {
      /** The name of the currently selected sort key. */
      sortKey: '<',
      /** A list of possible keys that the user can opt to sort by. */
      sortKeysAvailable: '<',
      /** Called when the user changes the sort key. */
      onChangeSortKey: '&',
    },
    template: require('../../../templates/client/sort_dropdown.html'),
  };
};

},{"../../../templates/client/sort_dropdown.html":118}],42:[function(require,module,exports){
'use strict';

module.exports = ['$animate', function($animate) {
  return {
    link: function(scope, elem) {
      // ngAnimate conflicts with the spinners own CSS
      $animate.enabled(false, elem);
    },
    restrict: 'C',
    template: '<span><span></span></span>',
  };
}];

},{}],43:[function(require,module,exports){
module.exports = [
  '$compile', function($compile) {
    var STATE_ATTRIBUTE, STATE_LOADING, STATE_SUCCESS, template;
    STATE_ATTRIBUTE = 'status-button-state';
    STATE_LOADING = 'loading';
    STATE_SUCCESS = 'success';
    template = '<span class="btn-with-message">\n  <span class="btn-message btn-message-loading">\n    <span class="btn-icon spinner"></span>\n  </span>\n  <span class="btn-message btn-message-success">\n    <span class="btn-message-text">Saved!</span> <i class="btn-message-icon h-icon-check"></i>\n  </span>\n</span>';
    return {
      link: function(scope, placeholder, attr, ctrl, transclude) {
        var elem, targetForm;
        targetForm = attr.statusButton;
        if (!targetForm) {
          throw new Error('status-button attribute should provide a form name');
        }
        elem = angular.element(template).attr(STATE_ATTRIBUTE, '');
        $compile(elem)(scope);
        placeholder.after(elem);
        transclude(scope, function(clone) {
          return elem.append(clone);
        });
        return scope.$on('formState', function(event, formName, formState) {
          if (formName !== targetForm) {
            return;
          }
          if (formState !== STATE_LOADING && formState !== STATE_SUCCESS) {
            formState = '';
          }
          return elem.attr(STATE_ATTRIBUTE, formState);
        });
      },
      transclude: 'element'
    };
  }
];


},{}],44:[function(require,module,exports){
'use strict';

/**
 * The <svg-icon> component renders SVG icons using inline <svg> tags,
 * enabling their appearance to be customized via CSS.
 *
 * This matches the way we do icons on the website, see
 * https://github.com/hypothesis/h/pull/3675
 */

// The list of supported icons
SvgIconController.$inject = ["$element"];
var icons = {
  refresh: require('../../images/icons/refresh.svg'),
};

// @ngInject
function SvgIconController($element) {
  if (!icons[this.name]) {
    throw new Error('Unknown icon: ' + this.name);
  }
  $element[0].innerHTML = icons[this.name];
}

module.exports = function () {
  return {
    bindToController: true,
    controllerAs: 'vm',
    restrict: 'E',
    controller: SvgIconController,
    scope: {
      /** The name of the icon to load. */
      name: '<',
    },
  };
};

},{"../../images/icons/refresh.svg":1}],45:[function(require,module,exports){
'use strict';

// @ngInject
TagEditorController.$inject = ["tags"];
function TagEditorController(tags) {
  this.onTagsChanged = function () {
    tags.store(this.tagList);

    var newTags = this.tagList.map(function (item) { return item.text; });
    this.onEditTags({tags: newTags});
  };

  this.autocomplete = function (query) {
    return Promise.resolve(tags.filter(query));
  };

  this.$onChanges = function (changes) {
    if (changes.tags) {
      this.tagList = changes.tags.currentValue.map(function (tag) {
        return {text: tag};
      });
    }
  };
}

module.exports = function () {
  return {
    bindToController: true,
    controller: TagEditorController,
    controllerAs: 'vm',
    restrict: 'E',
    scope: {
      tags: '<',
      onEditTags: '&',
    },
    template: require('../../../templates/client/tag_editor.html'),
  };
};

},{"../../../templates/client/tag_editor.html":119}],46:[function(require,module,exports){
'use strict';

ThreadListController.$inject = ["$scope", "VirtualThreadList"];
var events = require('../events');
var metadata = require('../annotation-metadata');

/**
 * Component which displays a virtualized list of annotation threads.
 */

var scopeTimeout = require('../util/scope-timeout');

/**
 * Returns the height of the thread for an annotation if it exists in the view
 * or undefined otherwise.
 */
function getThreadHeight(id) {
  var threadElement = document.getElementById(id);
  if (!threadElement) {
    return null;
  }

  // Get the height of the element inside the border-box, excluding
  // top and bottom margins.
  var elementHeight = threadElement.getBoundingClientRect().height;

  var style = window.getComputedStyle(threadElement);

  // Get the bottom margin of the element. style.margin{Side} will return
  // values of the form 'Npx', from which we extract 'N'.
  var marginHeight = parseFloat(style.marginTop) +
                     parseFloat(style.marginBottom);

  return elementHeight + marginHeight;
}

// @ngInject
function ThreadListController($scope, VirtualThreadList) {
  // `visibleThreads` keeps track of the subset of all threads matching the
  // current filters which are in or near the viewport and the view then renders
  // only those threads, using placeholders above and below the visible threads
  // to reserve space for threads which are not actually rendered.
  var self = this;
  var visibleThreads = new VirtualThreadList($scope, window, this.thread);
  visibleThreads.on('changed', function (state) {
    self.virtualThreadList = {
      visibleThreads: state.visibleThreads,
      offscreenUpperHeight: state.offscreenUpperHeight + 'px',
      offscreenLowerHeight: state.offscreenLowerHeight + 'px',
    };

    scopeTimeout($scope, function () {
      state.visibleThreads.forEach(function (thread) {
        var height = getThreadHeight(thread.id);
        if (!height) {
          return;
        }
        visibleThreads.setThreadHeight(thread.id, height);
      });
    }, 50);
  });

  /**
   * Return the vertical scroll offset for the document in order to position the
   * annotation thread with a given `id` or $$tag at the top-left corner
   * of the view.
   */
  function scrollOffset(id) {
    // Note: This assumes that the element occupies the entire height of the
    // containing document. It would be preferable if only the contents of the
    // <thread-list> itself scrolled.
    var maxYOffset = document.body.clientHeight - window.innerHeight;
    return Math.min(maxYOffset, visibleThreads.yOffsetOf(id));
  }

  /** Scroll the annotation with a given ID or $$tag into view. */
  function scrollIntoView(id) {
    var estimatedYOffset = scrollOffset(id);
    window.scroll(0, estimatedYOffset);

    // As a result of scrolling the sidebar, the target scroll offset for
    // annotation `id` might have changed as a result of:
    //
    // 1. Heights of some cards above `id` changing from an initial estimate to
    //    an actual measured height after the card is rendered.
    // 2. The height of the document changing as a result of any cards heights'
    //    changing. This may affect the scroll offset if the original target
    //    was near to the bottom of the list.
    //
    // So we wait briefly after the view is scrolled then check whether the
    // estimated Y offset changed and if so, trigger scrolling again.
    scopeTimeout($scope, function () {
      var newYOffset = scrollOffset(id);
      if (newYOffset !== estimatedYOffset) {
        scrollIntoView(id);
      }
    }, 200);
  }

  $scope.$on(events.BEFORE_ANNOTATION_CREATED, function (event, annotation) {
    if (annotation.$highlight || metadata.isReply(annotation)) {
      return;
    }
    self.onClearSelection();
    scrollIntoView(annotation.$$tag);
  });

  this.$onChanges = function (changes) {
    if (changes.thread) {
      visibleThreads.setRootThread(changes.thread.currentValue);
    }
  };

  this.$onDestroy = function () {
    visibleThreads.detach();
  };
}

module.exports = function () {
  return {
    bindToController: true,
    controller: ThreadListController,
    controllerAs: 'vm',
    restrict: 'E',
    scope: {
      /** The root thread to be displayed by the thread list. */
      thread: '<',
      showDocumentInfo: '<',

      /**
       * Called when the user clicks a link to show an annotation that does not
       * match the current filter.
       */
      onForceVisible: '&',
      /** Called when the user focuses an annotation by hovering it. */
      onFocus: '&',
      /** Called when a user selects an annotation. */
      onSelect: '&',
      /** Called when a user toggles the expansion state of an annotation thread. */
      onChangeCollapsed: '&',
      /** Called to clear the current selection. */
      onClearSelection: '&',
    },
    template: require('../../../templates/client/thread_list.html'),
  };
};

},{"../../../templates/client/thread_list.html":120,"../annotation-metadata":3,"../events":52,"../util/scope-timeout":92}],47:[function(require,module,exports){
'use strict';

TimestampController.$inject = ["$scope", "time"];
var dateUtil = require('../date-util');

// @ngInject
function TimestampController($scope, time) {

  // A fuzzy, relative (eg. '6 days ago') format of the timestamp.
  this.relativeTimestamp = null;

  // A formatted version of the timestamp (eg. 'Tue 22nd Dec 2015, 16:00')
  this.absoluteTimestamp = '';

  var cancelTimestampRefresh;
  var self = this;

  function updateTimestamp() {
    self.relativeTimestamp = time.toFuzzyString(self.timestamp);
    self.absoluteTimestamp = dateUtil.format(new Date(self.timestamp));

    if (self.timestamp) {
      if (cancelTimestampRefresh) {
        cancelTimestampRefresh();
      }
      cancelTimestampRefresh = time.decayingInterval(self.timestamp, function () {
        updateTimestamp();
        $scope.$digest();
      });
    }
  }

  this.$onChanges = function (changes) {
    if (changes.timestamp) {
      updateTimestamp();
    }
  };

  this.$onDestroy = function () {
    if (cancelTimestampRefresh) {
      cancelTimestampRefresh();
    }
  };
}

module.exports = function () {
  return {
    bindToController: true,
    controller: TimestampController,
    controllerAs: 'vm',
    restrict: 'E',
    scope: {
      className: '<',
      href: '<',
      timestamp: '<',
    },
    template: ['<a class="{{vm.className}}" target="_blank" ng-title="vm.absoluteTimestamp"',
               ' href="{{vm.href}}"',
               '>{{vm.relativeTimestamp}}</a>'].join(''),
  };
};

},{"../date-util":15}],48:[function(require,module,exports){
'use strict';

module.exports = function () {
  return {
    controller: function () {},
    restrict: 'E',
    scope: {
      auth: '<',
      isSidebar: '<',
      onShowHelpPanel: '&',
      onLogin: '&',
      onLogout: '&',
      onSharePage: '&',
      searchController: '<',
      accountDialog: '<',
      shareDialog: '<',
      sortKey: '<',
      sortKeysAvailable: '<',
      onChangeSortKey: '&',
      pendingUpdateCount: '<',
      onApplyPendingUpdates: '&',
    },
    template: require('../../../templates/client/top_bar.html'),
  };
};

},{"../../../templates/client/top_bar.html":121}],49:[function(require,module,exports){
'use strict';

module.exports = function () {
  return {
    link: function (scope, elem, attr) {
      var active = true;
      var html = elem.prop('ownerDocument').documentElement;
      var view = elem.prop('ownerDocument').defaultView;

      function onScroll() {
        var clientHeight = html.clientHeight;
        var scrollHeight = html.scrollHeight;
        if (view.scrollY + clientHeight >= scrollHeight - clientHeight) {
          if (active) {
            active = false;
            scope.$apply(attr.windowScroll);
          }
        } else {
          active = true;
        }
      }

      view.addEventListener('scroll', onScroll, false);

      scope.$on('$destroy', function () {
        view.removeEventListener('scroll', onScroll);
      });
    },
  };
};

},{}],50:[function(require,module,exports){
var Discovery,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Discovery = (function() {
  Discovery.prototype.server = false;

  Discovery.prototype.origin = '*';

  Discovery.prototype.onDiscovery = null;

  Discovery.prototype.requestInProgress = false;

  function Discovery(target, options) {
    this.target = target;
    if (options == null) {
      options = {};
    }
    this._onMessage = bind(this._onMessage, this);
    this.stopDiscovery = bind(this.stopDiscovery, this);
    if (options.server) {
      this.server = options.server;
    }
    if (options.origin) {
      this.origin = options.origin;
    }
  }

  Discovery.prototype.startDiscovery = function(onDiscovery) {
    if (this.onDiscovery) {
      throw new Error('Discovery is already in progress, call .stopDiscovery() first');
    }
    this.onDiscovery = onDiscovery;
    this.target.addEventListener('message', this._onMessage, false);
    this._beacon();
  };

  Discovery.prototype.stopDiscovery = function() {
    this.onDiscovery = null;
    this.target.removeEventListener('message', this._onMessage);
  };

  Discovery.prototype._beacon = function() {
    var beaconMessage, child, i, len, parent, queue, ref;
    beaconMessage = this.server ? '__cross_frame_dhcp_offer' : '__cross_frame_dhcp_discovery';
    queue = [this.target.top];
    while (queue.length) {
      parent = queue.shift();
      if (parent !== this.target) {
        parent.postMessage(beaconMessage, this.origin);
      }
      ref = parent.frames;
      for (i = 0, len = ref.length; i < len; i++) {
        child = ref[i];
        queue.push(child);
      }
    }
  };

  Discovery.prototype._onMessage = function(event) {
    var data, discovered, match, messageType, origin, ref, reply, source, token;
    source = event.source, origin = event.origin, data = event.data;
    if (origin === 'null' || origin.match('moz-extension:') || window.location.protocol === 'moz-extension:') {
      origin = '*';
    }
    match = typeof data.match === "function" ? data.match(/^__cross_frame_dhcp_(discovery|offer|request|ack)(?::(\d+))?$/) : void 0;
    if (!match) {
      return;
    }
    messageType = match[1];
    token = match[2];
    ref = this._processMessage(messageType, token, origin), reply = ref.reply, discovered = ref.discovered, token = ref.token;
    if (reply) {
      source.postMessage('__cross_frame_dhcp_' + reply, origin);
    }
    if (discovered) {
      this.onDiscovery.call(null, source, origin, token);
    }
  };

  Discovery.prototype._processMessage = function(messageType, token, origin) {
    var discovered, reply;
    reply = null;
    discovered = false;
    if (this.server) {
      if (messageType === 'discovery') {
        reply = 'offer';
      } else if (messageType === 'request') {
        token = this._generateToken();
        reply = 'ack' + ':' + token;
        discovered = true;
      } else if (messageType === 'offer' || messageType === 'ack') {
        throw new Error("A second Discovery server has been detected at " + origin + ".\nThis is unsupported and will cause unexpected behaviour.");
      }
    } else {
      if (messageType === 'offer') {
        if (!this.requestInProgress) {
          this.requestInProgress = true;
          reply = 'request';
        }
      } else if (messageType === 'ack') {
        this.requestInProgress = false;
        discovered = true;
      }
    }
    return {
      reply: reply,
      discovered: discovered,
      token: token
    };
  };

  Discovery.prototype._generateToken = function() {
    return ('' + Math.random()).replace(/\D/g, '');
  };

  return Discovery;

})();


},{}],51:[function(require,module,exports){
'use strict';

/**
 * Return true if a given `draft` is empty and can be discarded without losing
 * any user input
 */
function isEmpty(draft) {
  if (!draft) {
    return true;
  }
  return !draft.text && draft.tags.length === 0;
}

/**
 * The drafts service provides temporary storage for unsaved edits to new or
 * existing annotations.
 *
 * A draft consists of:
 *
 * 1. `model` which is the original annotation domain model object which the
 *    draft is associated with. Domain model objects are never returned from
 *    the drafts service, they're only used to identify the correct draft to
 *    return.
 *
 * 2. `isPrivate` (boolean), `tags` (array of objects) and `text` (string)
 *    which are the user's draft changes to the annotation. These are returned
 *    from the drafts service by `drafts.get()`.
 *
 */
function DraftStore() {
  this._drafts = [];

  /**
   * Returns true if 'draft' is a draft for a given
   * annotation.
   *
   * Annotations are matched by ID or local tag.
   */
  function match(draft, model) {
    return (draft.model.$$tag && model.$$tag === draft.model.$$tag) ||
           (draft.model.id && model.id === draft.model.id);
  }

  /**
   * Returns the number of drafts - both unsaved new annotations, and unsaved
   * edits to saved annotations - currently stored.
   */
  this.count = function count() {
    return this._drafts.length;
  };

  /**
   * Returns a list of local tags of new annotations for which unsaved drafts
   * exist.
   *
   * @return {Array<{$$tag: string}>}
   */
  this.unsaved = function unsaved() {
    return this._drafts.filter(function(draft) {
      return !draft.model.id;
    }).map(function(draft) {
      return draft.model;
    });
  };

  /** Retrieve the draft changes for an annotation. */
  this.get = function get(model) {
    for (var i = 0; i < this._drafts.length; i++) {
      var draft = this._drafts[i];
      if (match(draft, model)) {
        return {
          isPrivate: draft.isPrivate,
          tags: draft.tags,
          text: draft.text,
        };
      }
    }
    return null;
  };

  /**
   * Returns the draft changes for an annotation, or null if no draft exists
   * or the draft is empty.
   */
  this.getIfNotEmpty = function (model) {
    var draft = this.get(model);
    return isEmpty(draft) ? null : draft;
  };

  /**
   * Update the draft version for a given annotation, replacing any
   * existing draft.
   */
  this.update = function update(model, changes) {
    var newDraft = {
      model: {id: model.id, $$tag: model.$$tag},
      isPrivate: changes.isPrivate,
      tags: changes.tags,
      text: changes.text,
    };
    this.remove(model);
    this._drafts.push(newDraft);
  };

  /** Remove the draft version of an annotation. */
  this.remove = function remove(model) {
    this._drafts = this._drafts.filter(function(draft) {
      return !match(draft, model);
    });
  };

  /** Remove all drafts. */
  this.discard = function discard() {
    this._drafts = [];
  };
}

module.exports = function() {
  return new DraftStore();
};

},{}],52:[function(require,module,exports){
'use strict';

/**
 * This module defines the set of global events that are dispatched
 * on $rootScope
 */
module.exports = {
  // Session state changes

  /** The list of groups changed */
  GROUPS_CHANGED: 'groupsChanged',
  /** The logged-in user changed */
  USER_CHANGED: 'userChanged',
  /**
   * The session state was updated.
   */
  SESSION_CHANGED: 'sessionChanged',

  // UI state changes

  /** The currently selected group changed */
  GROUP_FOCUSED: 'groupFocused',

  // Annotation events

  /** A new annotation has been created locally. */
  BEFORE_ANNOTATION_CREATED: 'beforeAnnotationCreated',

  /** Annotations were anchored in a connected document. */
  ANNOTATIONS_SYNCED: 'sync',

  /** An annotation was created on the server and assigned an ID. */
  ANNOTATION_CREATED: 'annotationCreated',

  /** An annotation was either deleted or unloaded. */
  ANNOTATION_DELETED: 'annotationDeleted',

  /** An annotation has been updated. */
  ANNOTATION_UPDATED: 'annotationUpdated',

  /** A set of annotations were loaded from the server. */
  ANNOTATIONS_LOADED: 'annotationsLoaded',

  /** An annotation is unloaded. */
  ANNOTATIONS_UNLOADED: 'annotationsUnloaded',
};

},{}],53:[function(require,module,exports){
/**
 * Provides access to feature flag states for the current
 * Hypothesis user.
 *
 * This service is a thin wrapper around the feature flag data in
 * the session state.
 *
 * Users of this service should assume that the value of any given flag can
 * change at any time and should write code accordingly. Feature flags should
 * not be cached, and should not be interrogated only at setup time.
 */
'use strict';

// @ngInject
features.$inject = ["$log", "session"];
function features($log, session) {
  /**
   * Returns true if the flag with the given name is enabled for the current
   * user.
   *
   * Returns false if session data has not been fetched for the current
   * user yet or if the feature flag name is unknown.
   */
  function flagEnabled(flag) {
    // trigger a refresh of session data, if it has not been
    // refetched within a cache timeout managed by the session service
    // (see CACHE_TTL in session.js)
    session.load();

    if (!session.state.features) {
      // features data has not yet been fetched
      return false;
    }

    var features = session.state.features;
    if (!(flag in features)) {
      $log.warn('looked up unknown feature', flag);
      return false;
    }
    return features[flag];
  }

  return {
    flagEnabled: flagEnabled,
  };
}

module.exports = features;

},{}],54:[function(require,module,exports){
'use strict';

/**
 * Parses H account names of the form 'acct:<username>@<provider>'
 * into a {username, provider} object or null if the input does not
 * match the expected form.
 */
function parseAccountID(user) {
  if (!user) {
    return null;
  }
  var match = user.match(/^acct:([^@]+)@(.+)/);
  if (!match) {
    return null;
  }
  return {
    username: match[1],
    provider: match[2],
  };
}

/**
 * Returns the username part of an account ID or an empty string.
 */
function username(user) {
  var account = parseAccountID(user);
  if (!account) {
    return '';
  }
  return account.username;
}

module.exports = {
  parseAccountID: parseAccountID,
  username: username,
};

},{}],55:[function(require,module,exports){
'use strict';

/**
 * URL encode a string, dealing appropriately with null values.
 */
function encode(str) {
  if (str) {
    return window.encodeURIComponent(str);
  }
  return '';
}

module.exports = {
  encode: encode,
};

},{}],56:[function(require,module,exports){
module.exports = [
  'toastr', function(toastr) {
    return {
      info: angular.bind(toastr, toastr.info),
      success: angular.bind(toastr, toastr.success),
      warning: angular.bind(toastr, toastr.warning),
      error: angular.bind(toastr, toastr.error)
    };
  }
];


},{}],57:[function(require,module,exports){
var hasProp = {}.hasOwnProperty;

module.exports = function() {
  return function(form, errors, reason) {
    var error, field, results;
    form.$setValidity('response', !reason);
    form.responseErrorMessage = reason;
    results = [];
    for (field in errors) {
      if (!hasProp.call(errors, field)) continue;
      error = errors[field];
      if (!reason && field === '') {
        form.$setValidity('response', false);
        form.responseErrorMessage = error;
        continue;
      }
      form[field].$setValidity('response', false);
      results.push(form[field].responseErrorMessage = error);
    }
    return results;
  };
};


},{}],58:[function(require,module,exports){
'use strict';

/* eslint-disable */

/** This software is released under the MIT license:

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
 */

/**
 * This is a modified copy of index.js from
 * https://github.com/substack/frame-rpc (see git log for the modifications),
 * upstream license above.
 */

var VERSION = '1.0.0';

module.exports = RPC;

function RPC (src, dst, origin, methods) {
    if (!(this instanceof RPC)) return new RPC(src, dst, origin, methods);
    var self = this;
    this.src = src;
    this.dst = dst;
    
    if (origin === '*') {
        this.origin = '*';
    }
    else {
        var uorigin = new URL(origin);
        this.origin = uorigin.protocol + '//' + uorigin.host;
    }
    
    this._sequence = 0;
    this._callbacks = {};
    
    this._onmessage = function (ev) {
        if (self._destroyed) return;
        if (self.origin !== '*' && ev.origin !== self.origin) return;
        if (!ev.data || typeof ev.data !== 'object') return;
        if (ev.data.protocol !== 'frame-rpc') return;
        if (!Array.isArray(ev.data.arguments)) return;
        self._handle(ev.data);
    };
    this.src.addEventListener('message', this._onmessage);
    this._methods = (typeof methods === 'function'
        ? methods(this)
        : methods
    ) || {};
}

RPC.prototype.destroy = function () {
    this._destroyed = true;
    this.src.removeEventListener('message', this._onmessage);
};

RPC.prototype.call = function (method) {
    var args = [].slice.call(arguments, 1);
    return this.apply(method, args);
};

RPC.prototype.apply = function (method, args) {
    if (this._destroyed) return;
    var seq = this._sequence ++;
    if (typeof args[args.length - 1] === 'function') {
        this._callbacks[seq] = args[args.length - 1];
        args = args.slice(0, -1);
    }
    this.dst.postMessage({
        protocol: 'frame-rpc',
        version: VERSION,
        sequence: seq,
        method: method, 
        arguments: args
    }, this.origin);
};

RPC.prototype._handle = function (msg) {
    var self = this;
    if (self._destroyed) return;
    if (msg.hasOwnProperty('method')) {
        if (!this._methods.hasOwnProperty(msg.method)) return;
        var args = msg.arguments.concat(function () {
            self.dst.postMessage({
                protocol: 'frame-rpc',
                version: VERSION,
                response: msg.sequence,
                arguments: [].slice.call(arguments)
            }, self.origin);
        });
        this._methods[msg.method].apply(this._methods, args);
    }
    else if (msg.hasOwnProperty('response')) {
        var cb = this._callbacks[msg.response];
        delete this._callbacks[msg.response];
        if (cb) cb.apply(null, msg.arguments);
    }
};

},{}],59:[function(require,module,exports){
/**
 * @ngdoc service
 * @name  groups
 *
 * @description Provides access to the list of groups that the user is currently
 *              a member of and the currently selected group in the UI.
 *
 *              The list of groups is initialized from the session state
 *              and can then later be updated using the add() and remove()
 *              methods.
 */
'use strict';

groups.$inject = ["localStorage", "serviceUrl", "session", "$rootScope", "$http"];
var STORAGE_KEY = 'hypothesis.groups.focus';

var events = require('./events');

// @ngInject
function groups(localStorage, serviceUrl, session, $rootScope, $http) {
  // The currently focused group. This is the group that's shown as selected in
  // the groups dropdown, the annotations displayed are filtered to only ones
  // that belong to this group, and any new annotations that the user creates
  // will be created in this group.
  var focusedGroup;

  function all() {
    return session.state.groups || [];
  }

  // Return the full object for the group with the given id.
  function get(id) {
    var gs = all();
    for (var i = 0, max = gs.length; i < max; i++) {
      if (gs[i].id === id) {
        return gs[i];
      }
    }
    return null;
  }

  /** Leave the group with the given ID.
   * Returns a promise which resolves when the action completes.
   */
  function leave(id) {
    var response = $http({
      method: 'POST',
      url: serviceUrl('groups.leave', {id: id}),
    });

    // the groups list will be updated in response to a session state
    // change notification from the server. We could improve the UX here
    // by optimistically updating the session state

    return response;
  }


  /** Return the currently focused group. If no group is explicitly focused we
   * will check localStorage to see if we have persisted a focused group from
   * a previous session. Lastly, we fall back to the first group available.
   */
  function focused() {
    if (focusedGroup) {
      return focusedGroup;
    }
    var fromStorage = get(localStorage.getItem(STORAGE_KEY));
    if (fromStorage) {
      focusedGroup = fromStorage;
      return focusedGroup;
    }
    return all()[0];
  }

  /** Set the group with the passed id as the currently focused group. */
  function focus(id) {
    var prevFocused = focused();
    var g = get(id);
    if (g) {
      focusedGroup = g;
      localStorage.setItem(STORAGE_KEY, g.id);
      if (prevFocused.id !== g.id) {
        $rootScope.$broadcast(events.GROUP_FOCUSED, g.id);
      }
    }
  }

  // reset the focused group if the user leaves it
  $rootScope.$on(events.GROUPS_CHANGED, function () {
    if (focusedGroup) {
      focusedGroup = get(focusedGroup.id);
      if (!focusedGroup) {
        $rootScope.$broadcast(events.GROUP_FOCUSED, focused());
      }
    }
  });

  return {
    all: all,
    get: get,

    leave: leave,

    focused: focused,
    focus: focus,
  };
}

module.exports = groups;

},{"./events":52}],60:[function(require,module,exports){

/**
 * @ngdoc service
 * @name host
 *
 * @description
 * The `host` service relays the instructions the sidebar needs to send
 * to the host document. (As opposed to all guests)
 * It uses the bridge service to talk to the host.
 */
var hasProp = {}.hasOwnProperty;

module.exports = [
  '$window', 'bridge', function($window, bridge) {
    var callHost, channel, channelListeners, host, listener;
    host = {
      showSidebar: function() {
        return callHost('show');
      },
      hideSidebar: function() {
        return callHost('hide');
      }
    };
    callHost = function(method) {
      var channel, i, len, ref, ref1, results, window;
      ref = bridge.links;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        ref1 = ref[i], channel = ref1.channel, window = ref1.window;
        if (!(window === $window.parent)) {
          continue;
        }
        channel.call(method);
        break;
      }
      return results;
    };
    channelListeners = {
      back: function() {
        return host.hideSidebar();
      },
      open: function() {
        return host.showSidebar();
      }
    };
    for (channel in channelListeners) {
      if (!hasProp.call(channelListeners, channel)) continue;
      listener = channelListeners[channel];
      bridge.on(channel, listener);
    }
    return host;
  }
];


},{}],61:[function(require,module,exports){
'use strict';

/* eslint no-console: "off" */

var queryString = require('query-string');

var Socket = require('./websocket');

/**
 * Return a URL with a cache-busting query string parameter added.
 *
 * @param {string} url - The original asset URL
 * @return {string} The URL with a cache-buster added.
 */
function cacheBustURL(url) {
  var newUrl = url;
  var cacheBuster = queryString.parse({timestamp: Date.now()});
  if (url.indexOf('?') !== -1) {
    newUrl += '&' + cacheBuster;
  } else {
    newUrl += '?' + cacheBuster;
  }
  return newUrl;
}

/**
 * Return true if a URL matches a list of paths of modified assets.
 *
 * @param {string} url - The URL of the stylesheet, script or other resource.
 * @param {Array<string>} changed - List of paths of modified assets.
 */
function didAssetChange(url, changed) {
  return changed.some(function (path) {
    return url.indexOf(path) !== -1;
  });
}

/**
 * Reload a stylesheet or media element if it references a file
 * in a list of changed assets.
 *
 * @param {Element} element - An HTML <link> tag or media element.
 * @param {Array<string>} changed - List of paths of modified assets.
 */
function maybeReloadElement(element, changed) {
  var parentElement = element.parentNode;
  var newElement = element.cloneNode();
  var srcKeys = ['href', 'src'];
  srcKeys.forEach(function (key) {
    if (key in element && didAssetChange(element[key], changed)) {
      newElement[key] = cacheBustURL(element[key]);
    }
  });
  parentElement.replaceChild(newElement, element);
}

function reloadExternalStyleSheets(changed) {
  var linkTags = [].slice.apply(document.querySelectorAll('link'));
  linkTags.forEach(function (tag) {
    maybeReloadElement(tag, changed);
  });
}

/**
 * Connect to the live-reload server at @p url.
 *
 * @param {string} url - The URL of the live reload server. If undefined,
 *                       the 'livereloadserver' query string parameter is
 *                       used.
 */
function connect(url) {
  var conn = new Socket(url);
  conn.on('open', function () {
    console.log('Live reload client listening');
  });
  conn.on('message', function (event) {
    var message = JSON.parse(event.data);
    if (message.type === 'assets-changed') {
      var scriptsOrTemplatesChanged = message.changed.some(function (path) {
        return path.match(/\.(html|js)$/);
      });
      var stylesChanged = message.changed.some(function (path) {
        return path.match(/\.css$/);
      });
      if (scriptsOrTemplatesChanged) {
        // Ask the host page to reload the client (eg. by reloading itself).
        window.top.postMessage({type:'reloadrequest'}, '*');
        return;
      }
      if (stylesChanged) {
        reloadExternalStyleSheets(message.changed);
      }
    }
  });
  conn.on('error', function (err) {
    console.error('Error connecting to live reload server:', err);
  });
}

module.exports = {
  connect: connect,
};

},{"./websocket":97,"query-string":135}],62:[function(require,module,exports){
module.exports = [
  '$window', function($window) {
    var storage;
    storage = (function() {
      var error, key, memoryStorage;
      key = 'hypothesis.testKey';
      try {
        $window.localStorage.setItem(key, key);
        $window.localStorage.removeItem(key);
        return $window.localStorage;
      } catch (error) {
        memoryStorage = {};
        return {
          getItem: function(key) {
            if (key in memoryStorage) {
              return memoryStorage[key];
            } else {
              return null;
            }
          },
          setItem: function(key, value) {
            return memoryStorage[key] = value;
          },
          removeItem: function(key) {
            return delete memoryStorage[key];
          }
        };
      }
    })();
    return {
      getItem: function(key) {
        return storage.getItem(key);
      },
      getObject: function(key) {
        var json;
        json = storage.getItem(key);
        if (json) {
          return JSON.parse(json);
        }
        return null;
      },
      setItem: function(key, value) {
        return storage.setItem(key, value);
      },
      setObject: function(key, value) {
        var repr;
        repr = JSON.stringify(value);
        return storage.setItem(key, repr);
      },
      removeItem: function(key) {
        return storage.removeItem(key);
      }
    };
  }
];


},{}],63:[function(require,module,exports){
'use strict';

/**
 * Commands for toggling markdown formatting of a selection
 * in an input field.
 *
 * All of the functions in this module take as input the current state
 * of the input field, parameters for the operation to perform and return the
 * new state of the input field.
 */

/**
 * Describes the state of a plain text input field.
 *
 * interface EditorState {
 *   text: string;
 *   selectionStart: number;
 *   selectionEnd: number;
 * }
 */

/**
 * Types of Markdown link that can be inserted with
 * convertSelectionToLink()
 */
var LinkType = {
  ANCHOR_LINK: 0,
  IMAGE_LINK: 1,
};

/**
 * Replace text in an input field and return the new state.
 *
 * @param {EditorState} state - The state of the input field.
 * @param {number} pos - The start position of the text to remove.
 * @param {number} length - The number of characters to remove.
 * @param {string} text - The replacement text to insert at `pos`.
 * @return {EditorState} - The new state of the input field.
 */
function replaceText(state, pos, length, text) {
  var newSelectionStart = state.selectionStart;
  var newSelectionEnd = state.selectionEnd;

  if (newSelectionStart >= pos + length) {
    // 1. Selection is after replaced text:
    //    Increment (start, end) by difference in length between original and
    //    replaced text
    newSelectionStart += text.length - length;
    newSelectionEnd += text.length - length;
  } else if (newSelectionEnd <= pos) {
    // 2. Selection is before replaced text: Leave selection unchanged
  } else if (newSelectionStart <= pos &&
             newSelectionEnd >= pos + length) {
    // 3. Selection fully contains replaced text:
    //    Increment end by difference in length between original and replaced
    //    text
    newSelectionEnd += text.length - length;
  } else if (newSelectionStart < pos &&
             newSelectionEnd < pos + length) {
    // 4. Selection overlaps start but not end of replaced text:
    //    Decrement start to start of replacement text
    newSelectionStart = pos;
  } else if (newSelectionStart < pos + length &&
             newSelectionEnd > pos + length) {
    // 5. Selection overlaps end but not start of replaced text:
    //    Increment end by difference in length between original and replaced
    //    text
    newSelectionEnd += text.length - length;
  } else if (pos < newSelectionStart &&
             pos + length > newSelectionEnd) {
    // 6. Replaced text fully contains selection:
    //    Expand selection to replaced text
    newSelectionStart = pos;
    newSelectionEnd = pos + length;
  }

  return {
    text: state.text.slice(0, pos) + text + state.text.slice(pos + length),
    selectionStart: newSelectionStart,
    selectionEnd: newSelectionEnd,
  };
}

/**
 * Convert the selected text into a Markdown link.
 *
 * @param {EditorState} state - The current state of the input field.
 * @param {LinkType} linkType - The type of link to insert.
 * @return {EditorState} - The new state of the input field.
 */
function convertSelectionToLink(state, linkType) {
  if (typeof linkType === 'undefined') {
    linkType = LinkType.ANCHOR_LINK;
  }

  var selection = state.text.slice(state.selectionStart, state.selectionEnd);

  var linkPrefix = '';
  if (linkType === LinkType.IMAGE_LINK) {
    linkPrefix = '!';
  }

  var newState;
  if (selection.match(/[a-z]+:\/\/.*/)) {
    // Selection is a URL, wrap it with a link and use the selection as
    // the target.
    var dummyLabel = 'Description';
    newState = replaceText(state, state.selectionStart, selection.length,
      linkPrefix + '[' + dummyLabel + '](' + selection + ')');
    newState.selectionStart = state.selectionStart + linkPrefix.length + 1;
    newState.selectionEnd = newState.selectionStart + dummyLabel.length;
    return newState;
  } else {
    // Selection is not a URL, wrap it with a link and use the selection as
    // the label. Change the selection to the dummy link.
    var beforeURL = linkPrefix + '[' + selection + '](';
    var dummyLink = 'http://insert-your-link-here.com';
    newState = replaceText(state, state.selectionStart, selection.length,
      beforeURL + dummyLink + ')');
    newState.selectionStart = state.selectionStart + beforeURL.length;
    newState.selectionEnd = newState.selectionStart + dummyLink.length;
    return newState;
  }
}

/**
 * Toggle Markdown-style formatting around a span of text.
 *
 * @param {EditorState} state - The current state of the input field.
 * @param {string} prefix - The prefix to add or remove
 *                          before the selection.
 * @param {string?} suffix - The suffix to add or remove after the selection,
 *                           defaults to being the same as the prefix.
 * @param {string} placeholder - The text to insert between 'prefix' and
 *                               'suffix' if the input text is empty.
 * @return {EditorState} The new state of the input field.
 */
function toggleSpanStyle(state, prefix, suffix, placeholder) {
  if (typeof suffix === 'undefined') {
    suffix = prefix;
  }

  var selectionPrefix = state.text.slice(state.selectionStart - prefix.length,
    state.selectionStart);
  var selectionSuffix = state.text.slice(state.selectionEnd,
    state.selectionEnd + prefix.length);
  var newState = state;

  if (state.selectionStart === state.selectionEnd && placeholder) {
    newState = replaceText(state, state.selectionStart, 0, placeholder);
    newState.selectionStart = newState.selectionEnd - placeholder.length;
  }

  if (selectionPrefix === prefix && selectionSuffix === suffix) {
    newState = replaceText(newState, newState.selectionStart - prefix.length,
                           prefix.length, '');
    newState = replaceText(newState, newState.selectionEnd, suffix.length, '');
  } else {
    newState = replaceText(newState, newState.selectionStart, 0, prefix);
    newState = replaceText(newState, newState.selectionEnd, 0, suffix);
  }

  return newState;
}

function startOfLine(str, pos) {
  var start = str.lastIndexOf('\n', pos);
  if (start < 0) {
    return 0;
  } else {
    return start + 1;
  }
}

function endOfLine(str, pos) {
  var end = str.indexOf('\n', pos);
  if (end < 0) {
    return str.length;
  } else {
    return end;
  }
}

/**
 * Transform lines between two positions in an input field.
 *
 * @param {EditorState} state - The initial state of the input field
 * @param {number} start - The start position within the input text
 * @param {number} end - The end position within the input text
 * @param {(EditorState, number) => EditorState} callback
 *  - Callback which is invoked with the current state of the input and
 *    the start of the current line and returns the new state of the input.
 */
function transformLines(state, start, end, callback) {
  var lineStart = startOfLine(state.text, start);
  var lineEnd = endOfLine(state.text, start);

  while (lineEnd <= endOfLine(state.text, end)) {
    var isLastLine = lineEnd === state.text.length;
    var currentLineLength = lineEnd - lineStart;

    state = callback(state, lineStart, lineEnd);

    var newLineLength = endOfLine(state.text, lineStart) - lineStart;
    end += newLineLength - currentLineLength;

    if (isLastLine) {
      break;
    }
    lineStart = lineStart + newLineLength + 1;
    lineEnd = endOfLine(state.text, lineStart);
  }
  return state;
}

/**
 * Toggle Markdown-style formatting around a block of text.
 *
 * @param {EditorState} state - The current state of the input field.
 * @param {string} prefix - The prefix to add or remove before each line
 *                          of the selection.
 * @return {EditorState} - The new state of the input field.
 */
function toggleBlockStyle(state, prefix) {
  var start = state.selectionStart;
  var end = state.selectionEnd;

  // Test whether all lines in the selected range already have the style
  // applied
  var blockHasStyle = true;
  transformLines(state, start, end, function (state, lineStart) {
    if (state.text.slice(lineStart, lineStart + prefix.length) !== prefix) {
      blockHasStyle = false;
    }
    return state;
  });

  if (blockHasStyle) {
    // Remove the formatting.
    return transformLines(state, start, end, function (state, lineStart) {
      return replaceText(state, lineStart, prefix.length, '');
    });
  } else {
    // Add the block style to any lines which do not already have it applied
    return transformLines(state, start, end, function (state, lineStart) {
      if (state.text.slice(lineStart, lineStart + prefix.length) === prefix) {
        return state;
      } else {
        return replaceText(state, lineStart, 0, prefix);
      }
    });
  }
}

module.exports = {
  toggleSpanStyle: toggleSpanStyle,
  toggleBlockStyle: toggleBlockStyle,
  convertSelectionToLink: convertSelectionToLink,
  LinkType: LinkType,
};

},{}],64:[function(require,module,exports){
'use strict';

/**
 * Return an iframe DOM element with the given src URL.
 */
function iframe(src) {
  var iframe_ = document.createElement('iframe');
  iframe_.src = src;
  iframe_.classList.add('annotation-media-embed');
  iframe_.setAttribute('frameborder', '0');
  iframe_.setAttribute('allowfullscreen', '');
  return iframe_;
}

/**
 * Return a YouTube embed (<iframe>) DOM element for the given video ID.
 */
function youTubeEmbed(id) {
  return iframe('https://www.youtube.com/embed/' + id);
}

function vimeoEmbed(id) {
  return iframe('https://player.vimeo.com/video/' + id);
}

/**
 * A list of functions that return an "embed" DOM element (e.g. an <iframe>)
 * for a given link.
 *
 * Each function either returns `undefined` if it can't generate an embed for
 * the link, or a DOM element if it can.
 *
 */
var embedGenerators = [

  // Matches URLs like https://www.youtube.com/watch?v=rw6oWkCojpw
  function iframeFromYouTubeWatchURL(link) {
    if (link.hostname !== 'www.youtube.com') {
      return null;
    }

    if (!/\/watch\/?/.test(link.pathname)) {
      return null;
    }

    var groups = /[&\?]v=([^&#]+)/.exec(link.search);
    if (groups) {
      return youTubeEmbed(groups[1]);
    }
    return null;
  },

  // Matches URLs like https://youtu.be/rw6oWkCojpw
  function iframeFromYouTubeShareURL(link) {
    if (link.hostname !== 'youtu.be') {
      return null;
    }

    var groups = /^\/([^\/]+)\/?$/.exec(link.pathname);
    if (groups) {
      return youTubeEmbed(groups[1]);
    }
    return null;
  },

  // Matches URLs like https://vimeo.com/149000090
  function iFrameFromVimeoLink(link) {
    if (link.hostname !== 'vimeo.com') {
      return null;
    }

    var groups = /^\/([^\/\?#]+)\/?$/.exec(link.pathname);
    if (groups) {
      return vimeoEmbed(groups[1]);
    }
    return null;
  },

  // Matches URLs like https://vimeo.com/channels/staffpicks/148845534
  function iFrameFromVimeoChannelLink(link) {
    if (link.hostname !== 'vimeo.com') {
      return null;
    }

    var groups = /^\/channels\/[^\/]+\/([^\/?#]+)\/?$/.exec(link.pathname);
    if (groups) {
      return vimeoEmbed(groups[1]);
    }
    return null;
  },
];

/**
 * Return an embed element for the given link if it's an embeddable link.
 *
 * If the link is a link for a YouTube video or other embeddable media then
 * return an embed DOM element (for example an <iframe>) for that media.
 *
 * Otherwise return undefined.
 *
 */
function embedForLink(link) {
  var embed;
  var j;
  for (j = 0; j < embedGenerators.length; j++) {
    embed = embedGenerators[j](link);
    if (embed) {
      return embed;
    }
  }
  return null;
}

/** Replace the given link element with an embed.
 *
 * If the given link element is a link to an embeddable media and if its link
 * text is the same as its href then it will be replaced in the DOM with an
 * embed (e.g. an <iframe>) of the same media.
 *
 * If the link text is different from the href, then the link will be left
 * untouched. We want to convert links like these from the Markdown source into
 * embeds:
 *
 *     https://vimeo.com/channels/staffpicks/148845534
 *     <https://vimeo.com/channels/staffpicks/148845534>
 *
 * But we don't want to convert links like this:
 *
 *     [Custom link text](https://vimeo.com/channels/staffpicks/148845534)
 *
 * because doing so would destroy the user's custom link text, and leave users
 * with no way to just insert a media link without it being embedded.
 *
 * If the link is not a link to an embeddable media it will be left untouched.
 *
 */
function replaceLinkWithEmbed(link) {
  if (link.href !== link.textContent) {
    return;
  }

  var embed = embedForLink(link);
  if (embed) {
    link.parentElement.replaceChild(embed, link);
  }
}


/**
 * Replace all embeddable link elements beneath the given element with embeds.
 *
 * All links to YouTube videos or other embeddable media will be replaced with
 * embeds of the same media.
 *
 */
function replaceLinksWithEmbeds(element) {
  var links = element.getElementsByTagName('a');

  // `links` is a "live list" of the <a> element children of `element`.
  // We want to iterate over `links` and replace some of them with embeds,
  // but we can't modify `links` while looping over it so we need to copy it to
  // a nice, normal array first.
  links = Array.prototype.slice.call(links, 0);

  var i;
  for (i = 0; i < links.length; i++) {
    replaceLinkWithEmbed(links[i]);
  }
}

module.exports = {
  replaceLinksWithEmbeds: replaceLinksWithEmbeds,
};

},{}],65:[function(require,module,exports){
var STORAGE_KEY,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

STORAGE_KEY = 'hypothesis.privacy';


/**
 * @ngdoc service
 * @name  Permissions
 *
 * @description
 * This service can set default permissions to annotations properly and
 * offers some utility functions regarding those.
 */

module.exports = [
  'session', 'localStorage', function(session, localStorage) {
    var ADMIN_PARTY, ALL_PERMISSIONS, GROUP_WORLD, _acl;
    ALL_PERMISSIONS = {};
    GROUP_WORLD = 'group:__world__';
    ADMIN_PARTY = [
      {
        allow: true,
        principal: GROUP_WORLD,
        action: ALL_PERMISSIONS
      }
    ];
    _acl = function(context) {
      var action, parts, ref, role, roles;
      parts = (function() {
        var ref, results;
        ref = context.permissions || [];
        results = [];
        for (action in ref) {
          roles = ref[action];
          results.push((function() {
            var i, len, results1;
            results1 = [];
            for (i = 0, len = roles.length; i < len; i++) {
              role = roles[i];
              results1.push({
                allow: true,
                principal: role,
                action: action
              });
            }
            return results1;
          })());
        }
        return results;
      })();
      if (parts.length) {
        return (ref = Array.prototype).concat.apply(ref, parts);
      } else {
        return ADMIN_PARTY;
      }
    };
    return {

      /**
       * @ngdoc method
       * @name permissions#private
       *
       * Sets permissions for a private annotation
       * Typical use: annotation.permissions = permissions.private()
       */
      "private": function() {
        if (!session.state.userid) {
          return null;
        } else {
          return {
            read: [session.state.userid],
            update: [session.state.userid],
            "delete": [session.state.userid],
            admin: [session.state.userid]
          };
        }
      },

      /**
       * @ngdoc method
       * @name permissions#shared
       *
       * @param {String} [group] Group to make annotation shared in.
       *
       * Sets permissions for a shared annotation
       * Typical use: annotation.permissions = permissions.shared(group)
       */
      shared: function(group) {
        if (!session.state.userid) {
          return null;
        }
        if (group != null) {
          group = 'group:' + group;
        } else {
          group = GROUP_WORLD;
        }
        return {
          read: [group],
          update: [session.state.userid],
          "delete": [session.state.userid],
          admin: [session.state.userid]
        };
      },
      "default": function(group) {
        var defaultLevel;
        defaultLevel = localStorage.getItem(STORAGE_KEY);
        if ((defaultLevel !== 'private') && (defaultLevel !== 'shared')) {
          defaultLevel = 'shared';
        }
        if (defaultLevel === 'private') {
          return this["private"]();
        } else {
          return this.shared(group);
        }
      },
      setDefault: function(private_or_shared) {
        return localStorage.setItem(STORAGE_KEY, private_or_shared);
      },

      /**
       * @ngdoc method
       * @name permissions#isShared
       *
       * @param {Object} permissions
       * @param {String} [group]
       *
       * This function determines whether the permissions allow shared visibility
       */
      isShared: function(permissions, group) {
        if (group != null) {
          group = 'group:' + group;
        } else {
          group = GROUP_WORLD;
        }
        return indexOf.call((permissions != null ? permissions.read : void 0) || [], group) >= 0;
      },

      /**
       * @ngdoc method
       * @name permissions#isPrivate
       *
       * @param {Object} permissions
       * @param {String} user
       *
       * @returns {boolean} True if the annotation is private to the user.
       */
      isPrivate: function(permissions, user) {
        return user && angular.equals((permissions != null ? permissions.read : void 0) || [], [user]);
      },

      /**
       * @ngdoc method
       * @name permissions#permits
       *
       * @param {String} action action to authorize (read|update|delete|admin)
       * @param {Object} context to permit action on it or not
       * @param {String} user the userId
       *
       * User access-level-control function
       * TODO: this should move to the auth service and take multiple principals
       */
      permits: function(action, context, user) {
        var ace, acl, i, len, ref, ref1;
        acl = _acl(context);
        for (i = 0, len = acl.length; i < len; i++) {
          ace = acl[i];
          if ((ref = ace.principal) !== user && ref !== GROUP_WORLD) {
            continue;
          }
          if ((ref1 = ace.action) !== action && ref1 !== ALL_PERMISSIONS) {
            continue;
          }
          return ace.allow;
        }
        return false;
      }
    };
  }
];


},{}],66:[function(require,module,exports){
var QueryParser,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = QueryParser = (function() {
  function QueryParser() {
    this.populateFilter = bind(this.populateFilter, this);
  }

  QueryParser.prototype.rules = {
    user: {
      path: '/user',
      and_or: 'or'
    },
    text: {
      path: '/text',
      and_or: 'and'
    },
    tag: {
      path: '/tags',
      and_or: 'and'
    },
    quote: {
      path: '/quote',
      and_or: 'and'
    },
    uri: {
      formatter: function(uri) {
        return uri.toLowerCase();
      },
      path: '/uri',
      and_or: 'or',
      options: {
        es: {
          query_type: 'match',
          cutoff_frequency: 0.001,
          and_or: 'and'
        }
      }
    },
    since: {
      formatter: function(past) {
        var seconds;
        seconds = (function() {
          switch (past) {
            case '5 min':
              return 5 * 60;
            case '30 min':
              return 30 * 60;
            case '1 hour':
              return 60 * 60;
            case '12 hours':
              return 12 * 60 * 60;
            case '1 day':
              return 24 * 60 * 60;
            case '1 week':
              return 7 * 24 * 60 * 60;
            case '1 month':
              return 30 * 24 * 60 * 60;
            case '1 year':
              return 365 * 24 * 60 * 60;
          }
        })();
        return new Date(new Date().valueOf() - seconds * 1000);
      },
      path: '/created',
      and_or: 'and',
      operator: 'ge'
    },
    any: {
      and_or: 'and',
      path: ['/quote', '/tags', '/text', '/uri', '/user'],
      options: {
        es: {
          query_type: 'multi_match',
          match_type: 'cross_fields',
          and_or: 'and',
          fields: ['quote', 'tags', 'text', 'uri.parts', 'user']
        }
      }
    }
  };

  QueryParser.prototype.populateFilter = function(filter, query) {
    var and_or, case_sensitive, category, i, len, mapped_field, oper_part, results, rule, t, term, terms, val, value, value_part;
    results = [];
    for (category in query) {
      value = query[category];
      if (this.rules[category] == null) {
        continue;
      }
      terms = value.terms;
      if (!terms.length) {
        continue;
      }
      rule = this.rules[category];
      case_sensitive = rule.case_sensitive != null ? rule.case_sensitive : false;
      and_or = rule.and_or != null ? rule.and_or : 'or';
      mapped_field = rule.path != null ? rule.path : '/' + category;
      if (and_or === 'or') {
        oper_part = rule.operator != null ? rule.operator : 'match_of';
        value_part = [];
        for (i = 0, len = terms.length; i < len; i++) {
          term = terms[i];
          t = rule.formatter ? rule.formatter(term) : term;
          value_part.push(t);
        }
        results.push(filter.addClause(mapped_field, oper_part, value_part, case_sensitive, rule.options));
      } else {
        oper_part = rule.operator != null ? rule.operator : 'matches';
        results.push((function() {
          var j, len1, results1;
          results1 = [];
          for (j = 0, len1 = terms.length; j < len1; j++) {
            val = terms[j];
            value_part = rule.formatter ? rule.formatter(val) : val;
            results1.push(filter.addClause(mapped_field, oper_part, value_part, case_sensitive, rule.options));
          }
          return results1;
        })());
      }
    }
    return results;
  };

  return QueryParser;

})();


},{}],67:[function(require,module,exports){
'use strict';

/**
 * This module configures Raven for reporting crashes
 * to Sentry.
 *
 * Logging requires the Sentry DSN and Hypothesis
 * version to be provided via the app's settings object.
 *
 * It also exports an Angular module via angularModule() which integrates
 * error logging into any Angular application that it is added to
 * as a dependency.
 */

var Raven = require('raven-js');

// This is only used in apps where Angular is used,
// but is required globally due to
// https://github.com/thlorenz/proxyquireify/issues/40
//
// Fortunately it does not pull in Angular as a dependency but returns
// a function that takes it as an input argument.
var angularPlugin = require('raven-js/plugins/angular');

/**
 * Returns the input URL if it is an HTTP URL or the filename part of the URL
 * otherwise.
 *
 * @param {string} url - The script URL associated with an exception stack
 *                       frame.
 */
function convertLocalURLsToFilenames(url) {
  if (!url) {
    return url;
  }

  if (url.match(/https?:/)) {
    return url;
  }

  // Strip the query string (which is used as a cache buster)
  // and extract the filename from the URL
  return url.replace(/\?.*/,'').split('/').slice(-1)[0];
}

/**
 * Return a transformed version of `data` with local URLs replaced
 * with filenames.
 *
 * In environments where the client is served from a local URL,
 * eg. chrome-extension://<ID>/scripts/bundle.js, the script URL
 * and the sourcemap it references will not be accessible to Sentry.
 *
 * Therefore on the client we replace references to such URLs with just
 * the filename part and then as part of the release process, upload both
 * the source file and the source map to Sentry.
 *
 * Using just the filename allows us to upload a single set of source files
 * and sourcemaps for a release though a given release of H might be served
 * from multiple actual URLs (eg. different browser extensions).
 */
function translateSourceURLs(data) {
  try {
    var frames = data.exception.values[0].stacktrace.frames;
    frames.forEach(function (frame) {
      frame.filename = convertLocalURLsToFilenames(frame.filename);
    });
    data.culprit = frames[0].filename;
  } catch (err) {
    console.warn('Failed to normalize error stack trace', err, data);
  }
  return data;
}

function init(config) {
  Raven.config(config.dsn, {
    release: '0.44.0',  // replaced by versionify
    dataCallback: translateSourceURLs,
  }).install();
  installUnhandledPromiseErrorHandler();
}

function setUserInfo(info) {
  if (info) {
    Raven.setUserContext(info);
  } else {
    Raven.setUserContext();
  }
}

/**
 * Initializes and returns the Angular module which provides
 * a custom wrapper around Angular's $exceptionHandler service,
 * logging any exceptions passed to it using Sentry.
 *
 * This must be invoked _after_ Raven is configured using init().
 */
function angularModule(angular) {
  var prevCallback = Raven._globalOptions.dataCallback;
  angularPlugin(Raven, angular);

  // Hack: Ensure that both our data callback and the one provided by
  // the Angular plugin are run when submitting errors.
  //
  // The Angular plugin replaces any previously installed
  // data callback with its own which does not in turn call the
  // previously registered callback that we registered when calling
  // Raven.config().
  //
  // See https://github.com/getsentry/raven-js/issues/522
  var angularCallback = Raven._globalOptions.dataCallback;
  Raven.setDataCallback(function (data) {
    return angularCallback(prevCallback(data));
  });
  return angular.module('ngRaven');
}

/**
 * Report an error to Sentry.
 *
 * @param {Error} error - An error object describing what went wrong
 * @param {string} when - A string describing the context in which
 *                        the error occurred.
 * @param {Object} [context] - A JSON-serializable object containing additional
 *                             information which may be useful when
 *                             investigating the error.
 */
function report(error, when, context) {
  if (!(error instanceof Error)) {
    // If the passed object is not an Error, raven-js
    // will serialize it using toString() which produces unhelpful results
    // for objects that do not provide their own toString() implementations.
    //
    // If the error is a plain object or non-Error subclass with a message
    // property, such as errors returned by chrome.extension.lastError,
    // use that instead.
    if (typeof error === 'object' && error.message) {
      error = error.message;
    }
  }

  var extra = Object.assign({ when: when }, context);
  Raven.captureException(error, { extra: extra });
}

/**
 * Installs a handler to catch unhandled rejected promises.
 *
 * For this to work, the browser or the Promise polyfill must support
 * the unhandled promise rejection event (Chrome >= 49). On other browsers,
 * the rejections will simply go unnoticed. Therefore, app code _should_
 * always provide a .catch() handler on the top-most promise chain.
 *
 * See https://github.com/getsentry/raven-js/issues/424
 * and https://www.chromestatus.com/feature/4805872211460096
 *
 * It is possible that future versions of Raven JS may handle these events
 * automatically, in which case this code can simply be removed.
 */
function installUnhandledPromiseErrorHandler() {
  window.addEventListener('unhandledrejection', function (event) {
    if (event.reason) {
      report(event.reason, 'Unhandled Promise rejection');
    }
  });
}

module.exports = {
  init: init,
  angularModule: angularModule,
  setUserInfo: setUserInfo,
  report: report,
};

},{"raven-js":"raven-js","raven-js/plugins/angular":137}],68:[function(require,module,exports){
/**
 * State management for the set of annotations currently loaded into the
 * sidebar.
 */

'use strict';

var arrayUtil = require('../util/array-util');
var metadata = require('../annotation-metadata');
var uiConstants = require('../ui-constants');

var selection = require('./selection');
var util = require('./util');

/**
 * Return a copy of `current` with all matching annotations in `annotations`
 * removed.
 */
function excludeAnnotations(current, annotations) {
  var ids = {};
  var tags = {};
  annotations.forEach(function (annot) {
    if (annot.id) {
      ids[annot.id] = true;
    }
    if (annot.$$tag) {
      tags[annot.$$tag] = true;
    }
  });
  return current.filter(function (annot) {
    var shouldRemove = (annot.id && (annot.id in ids)) ||
                       (annot.$$tag && (annot.$$tag in tags));
    return !shouldRemove;
  });
}

function findByID(annotations, id) {
  return annotations.find(function (annot) {
    return annot.id === id;
  });
}

function findByTag(annotations, tag) {
  return annotations.find(function (annot) {
    return annot.$$tag === tag;
  });
}

/**
 * Initialize the status flags and properties of a new annotation.
 */
function initializeAnnot(annotation) {
  if (annotation.id) {
    return annotation;
  }

  // Currently the user ID, permissions and group of new annotations are
  // initialized in the <annotation> component controller because the session
  // state and focused group are not stored in the Redux store. Once they are,
  // that initialization should be moved here.

  return Object.assign({}, annotation, {
    // Copy $$tag explicitly because it is non-enumerable.
    //
    // FIXME: change $$tag to $tag and make it enumerable so annotations can be
    // handled more simply in the sidebar.
    $$tag: annotation.$$tag,
    // New annotations must be anchored
    $orphan: false,
  });
}

function init() {
  return {
    annotations: [],
  };
}

var update = {
  ADD_ANNOTATIONS: function (state, action) {
    var updatedIDs = {};
    var updatedTags = {};

    var added = [];
    var unchanged = [];
    var updated = [];

    action.annotations.forEach(function (annot) {
      var existing;
      if (annot.id) {
        existing = findByID(state.annotations, annot.id);
      }
      if (!existing && annot.$$tag) {
        existing = findByTag(state.annotations, annot.$$tag);
      }

      if (existing) {
        // Merge the updated annotation with the private fields from the local
        // annotation
        updated.push(Object.assign({}, existing, annot));
        if (annot.id) {
          updatedIDs[annot.id] = true;
        }
        if (existing.$$tag) {
          updatedTags[existing.$$tag] = true;
        }
      } else {
        added.push(initializeAnnot(annot));
      }
    });

    state.annotations.forEach(function (annot) {
      if (!updatedIDs[annot.id] && !updatedTags[annot.$$tag]) {
        unchanged.push(annot);
      }
    });

    return {annotations: added.concat(updated).concat(unchanged)};
  },

  REMOVE_ANNOTATIONS: function (state, action) {
    var annots = excludeAnnotations(state.annotations, action.annotations);
    var selectedTab = state.selectedTab;
    if (selectedTab === uiConstants.TAB_ORPHANS &&
        arrayUtil.countIf(annots, metadata.isOrphan) === 0) {
      selectedTab = uiConstants.TAB_ANNOTATIONS;
    }

    var tabUpdateFn = selection.update.SELECT_TAB;
    return Object.assign(
      {annotations: annots},
      tabUpdateFn(state, selection.actions.selectTab(selectedTab))
    );
  },

  CLEAR_ANNOTATIONS: function () {
    return {annotations: []};
  },

  UPDATE_ANCHOR_STATUS: function (state, action) {
    var annotations = state.annotations.map(function (annot) {
      var match = (annot.id && annot.id === action.id) ||
                  (annot.$$tag && annot.$$tag === action.tag);
      if (match) {
        return Object.assign({}, annot, {
          $orphan: action.isOrphan,
          $$tag: action.tag,
        });
      } else {
        return annot;
      }
    });
    return {annotations: annotations};
  },
};

var actions = util.actionTypes(update);

/** Add annotations to the currently displayed set. */
function addAnnotations(annotations, now) {
  now = now || new Date();

  // Add dates to new annotations. These are ignored by the server but used
  // when sorting unsaved annotation cards.
  annotations = annotations.map(function (annot) {
    if (annot.id) { return annot; }
    return Object.assign({
      // Copy $$tag explicitly because it is non-enumerable.
      //
      // FIXME: change $$tag to $tag and make it enumerable so annotations
      // can be handled more simply in the sidebar.
      $$tag: annot.$$tag,
      // Date.prototype.toISOString returns a 0-offset (UTC) ISO8601
      // datetime.
      created: now.toISOString(),
      updated: now.toISOString(),
    }, annot);
  });

  return function (dispatch, getState) {
    var added = annotations.filter(function (annot) {
      return !findByID(getState().annotations, annot.id);
    });

    dispatch({
      type: actions.ADD_ANNOTATIONS,
      annotations: annotations,
    });

    if (!getState().isSidebar) {
      return;
    }

    // If anchoring fails to complete in a reasonable amount of time, then
    // we assume that the annotation failed to anchor. If it does later
    // successfully anchor then the status will be updated.
    var ANCHORING_TIMEOUT = 500;

    var anchoringAnnots = added.filter(metadata.isWaitingToAnchor);
    if (anchoringAnnots.length) {
      setTimeout(function () {
        arrayUtil
          .filterMap(anchoringAnnots, function (annot) {
            return findByID(getState().annotations, annot.id);
          })
          .filter(metadata.isWaitingToAnchor)
          .forEach(function (orphan) {
            dispatch({
              type: actions.UPDATE_ANCHOR_STATUS,
              id: orphan.id,
              tag: orphan.$$tag,
              isOrphan: true,
            });
          });
      }, ANCHORING_TIMEOUT);
    }
  };
}

/** Remove annotations from the currently displayed set. */
function removeAnnotations(annotations) {
  return {
    type: actions.REMOVE_ANNOTATIONS,
    annotations: annotations,
  };
}

/** Set the currently displayed annotations to the empty set. */
function clearAnnotations() {
  return {type: actions.CLEAR_ANNOTATIONS};
}

/**
 * Updating the local tag and anchoring status of an annotation.
 *
 * @param {string|null} id - Annotation ID
 * @param {string} tag - The local tag assigned to this annotation to link
 *        the object in the page and the annotation in the sidebar
 * @param {boolean} isOrphan - True if the annotation failed to anchor
 */
function updateAnchorStatus(id, tag, isOrphan) {
  return {
    type: actions.UPDATE_ANCHOR_STATUS,
    id: id,
    tag: tag,
    isOrphan: isOrphan,
  };
}

/**
 * Return all loaded annotations which have been saved to the server.
 *
 * @param {state} - The global app state
 */
function savedAnnotations(state) {
  return state.annotations.filter(function (ann) {
    return !metadata.isNew(ann);
  });
}

/** Return true if the annotation with a given ID is currently loaded. */
function annotationExists(state, id) {
  return state.annotations.some(function (annot) {
    return annot.id === id;
  });
}

module.exports = {
  init: init,
  update: update,
  actions: {
    addAnnotations: addAnnotations,
    clearAnnotations: clearAnnotations,
    removeAnnotations: removeAnnotations,
    updateAnchorStatus: updateAnchorStatus,
  },

  // Selectors
  annotationExists: annotationExists,
  savedAnnotations: savedAnnotations,
};

},{"../annotation-metadata":3,"../ui-constants":88,"../util/array-util":90,"./selection":70,"./util":71}],69:[function(require,module,exports){
'use strict';

/**
 * This module defines the main update function (or 'reducer' in Redux's
 * terminology) that handles app state updates. For an overview of how state
 * management in Redux works, see the comments at the top of `annotation-ui.js`
 *
 * Each sub-module in this folder defines:
 *
 *  - An `init` function that returns the initial state relating to some aspect
 *    of the application
 *  - An `update` object mapping action types to a state update function for
 *    that action
 *  - A set of action creators - functions that return actions that can then
 *    be passed to `store.dispatch()`
 *  - A set of selectors - Utility functions that calculate some derived data
 *    from the state
 */

var annotations = require('./annotations');
var selection = require('./selection');
var viewer = require('./viewer');
var util = require('./util');

function init(settings) {
  return Object.assign(
    {},
    annotations.init(),
    selection.init(settings),
    viewer.init()
  );
}

var update = util.createReducer(Object.assign(
  annotations.update,
  selection.update,
  viewer.update
));

module.exports = {
  init: init,
  update: update,
};

},{"./annotations":68,"./selection":70,"./util":71,"./viewer":72}],70:[function(require,module,exports){
/**
 * This module handles state related to the current sort, search and filter
 * settings in the UI, including:
 *
 * - The set of annotations that are currently focused (hovered) or selected
 * - The selected tab
 * - The current sort order
 * - The current filter query
 */

'use strict';

var immutable = require('seamless-immutable');

var uiConstants = require('../ui-constants');

var util = require('./util');

/**
* Default starting tab.
*/
var TAB_DEFAULT = uiConstants.TAB_ANNOTATIONS;

 /**
  * Default sort keys for each tab.
  */
var TAB_SORTKEY_DEFAULT = {};
TAB_SORTKEY_DEFAULT[uiConstants.TAB_ANNOTATIONS] = 'Location';
TAB_SORTKEY_DEFAULT[uiConstants.TAB_NOTES] = 'Oldest';
TAB_SORTKEY_DEFAULT[uiConstants.TAB_ORPHANS] = 'Location';

/**
 * Available sort keys for each tab.
 */
var TAB_SORTKEYS_AVAILABLE = {};
TAB_SORTKEYS_AVAILABLE[uiConstants.TAB_ANNOTATIONS] = ['Newest', 'Oldest', 'Location'];
TAB_SORTKEYS_AVAILABLE[uiConstants.TAB_NOTES] = ['Newest', 'Oldest'];
TAB_SORTKEYS_AVAILABLE[uiConstants.TAB_ORPHANS] = ['Newest', 'Oldest', 'Location'];

function initialSelection(settings) {
  var selection = {};
  if (settings.annotations) {
    selection[settings.annotations] = true;
  }
  return freeze(selection);
}

function freeze(selection) {
  if (Object.keys(selection).length) {
    return immutable(selection);
  } else {
    return null;
  }
}

function toSet(list) {
  return list.reduce(function (set, key) {
    set[key] = true;
    return set;
  }, {});
}

function init(settings) {
  return {
    // Contains a map of annotation tag:true pairs.
    focusedAnnotationMap: null,

    // Contains a map of annotation id:true pairs.
    selectedAnnotationMap: initialSelection(settings),

    // Map of annotation IDs to expanded/collapsed state. For annotations not
    // present in the map, the default state is used which depends on whether
    // the annotation is a top-level annotation or a reply, whether it is
    // selected and whether it matches the current filter.
    expanded: initialSelection(settings) || {},

    // Set of IDs of annotations that have been explicitly shown
    // by the user even if they do not match the current search filter
    forceVisible: {},

    // IDs of annotations that should be highlighted
    highlighted: [],

    filterQuery: null,

    selectedTab: TAB_DEFAULT,

    // Key by which annotations are currently sorted.
    sortKey: TAB_SORTKEY_DEFAULT[TAB_DEFAULT],
    // Keys by which annotations can be sorted.
    sortKeysAvailable: TAB_SORTKEYS_AVAILABLE[TAB_DEFAULT],
  };
}

var update = {
  CLEAR_SELECTION: function () {
    return {filterQuery: null, selectedAnnotationMap: null};
  },

  SELECT_ANNOTATIONS: function (state, action) {
    return {selectedAnnotationMap: action.selection};
  },

  FOCUS_ANNOTATIONS: function (state, action) {
    return {focusedAnnotationMap: action.focused};
  },

  SET_FORCE_VISIBLE: function (state, action) {
    return {forceVisible: action.forceVisible};
  },

  SET_EXPANDED: function (state, action) {
    return {expanded: action.expanded};
  },

  HIGHLIGHT_ANNOTATIONS: function (state, action) {
    return {highlighted: action.highlighted};
  },

  SELECT_TAB: function (state, action) {
    // Do nothing if the "new tab" is not a valid tab.
    if ([uiConstants.TAB_ANNOTATIONS,
        uiConstants.TAB_NOTES,
        uiConstants.TAB_ORPHANS].indexOf(action.tab) === -1) {
      return {};
    }
    // Shortcut if the tab is already correct, to avoid resetting the sortKey
    // unnecessarily.
    if (state.selectedTab === action.tab) {
      return {};
    }
    return {
      selectedTab: action.tab,
      sortKey: TAB_SORTKEY_DEFAULT[action.tab],
      sortKeysAvailable: TAB_SORTKEYS_AVAILABLE[action.tab],
    };
  },

  SET_FILTER_QUERY: function (state, action) {
    return {
      filterQuery: action.query,
      forceVisible: {},
      expanded: {},
    };
  },

  SET_SORT_KEY: function (state, action) {
    return {sortKey: action.key};
  },
};

var actions = util.actionTypes(update);

function select(annotations) {
  return {
    type: actions.SELECT_ANNOTATIONS,
    selection: freeze(annotations),
  };
}

/**
 * Set the currently selected annotation IDs.
 */
function selectAnnotations(ids) {
  return select(toSet(ids));
}

/** Toggle whether annotations are selected or not. */
function toggleSelectedAnnotations(ids) {
  return function (dispatch, getState) {
    var selection = Object.assign({}, getState().selectedAnnotationMap);
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      if (selection[id]) {
        delete selection[id];
      } else {
        selection[id] = true;
      }
    }
    dispatch(select(selection));
  };
}

/**
 * Sets whether a given annotation should be visible, even if it does not
 * match the current search query.
 *
 * @param {string} id - Annotation ID
 * @param {boolean} visible
 */
function setForceVisible(id, visible) {
  // FIXME: This should be converted to a plain action and accessing the state
  // should happen in the update() function
  return function (dispatch, getState) {
    var forceVisible = Object.assign({}, getState().forceVisible);
    forceVisible[id] = visible;
    dispatch({
      type: actions.SET_FORCE_VISIBLE,
      forceVisible: forceVisible,
    });
  };
}

/**
 * Sets which annotations are currently focused.
 *
 * @param {Array<string>} Tags of annotations to focus
 */
function focusAnnotations(tags) {
  return {
    type: actions.FOCUS_ANNOTATIONS,
    focused: freeze(toSet(tags)),
  };
}

function setCollapsed(id, collapsed) {
  // FIXME: This should be converted to a plain action and accessing the state
  // should happen in the update() function
  return function (dispatch, getState) {
    var expanded = Object.assign({}, getState().expanded);
    expanded[id] = !collapsed;
    dispatch({
      type: actions.SET_EXPANDED,
      expanded: expanded,
    });
  };
}

/**
 * Highlight annotations with the given `ids`.
 *
 * This is used to indicate the specific annotation in a thread that was
 * linked to for example.
 */
function highlightAnnotations(ids) {
  return {
    type: actions.HIGHLIGHT_ANNOTATIONS,
    highlighted: ids,
  };
}


/** Set the type annotations to be displayed. */
function selectTab(type) {
  return {
    type: actions.SELECT_TAB,
    tab: type,
  };
}

/** Set the query used to filter displayed annotations. */
function setFilterQuery(query) {
  return {
    type: actions.SET_FILTER_QUERY,
    query: query,
  };
}

/** Sets the sort key for the annotation list. */
function setSortKey(key) {
  return {
    type: actions.SET_SORT_KEY,
    key: key,
  };
}

/**
 * Returns true if the annotation with the given `id` is selected.
 */
function isAnnotationSelected(state, id) {
  return (state.selectedAnnotationMap || {}).hasOwnProperty(id);
}

/**
 * Return true if any annotations are currently selected.
 */
function hasSelectedAnnotations(state) {
  return !!state.selectedAnnotationMap;
}

/** De-select an annotation. */
function removeSelectedAnnotation(id) {
  // FIXME: This should be converted to a plain action and accessing the state
  // should happen in the update() function
  return function (dispatch, getState) {
    var selection = Object.assign({}, getState().selectedAnnotationMap);
    if (!selection || !id) {
      return;
    }
    delete selection[id];
    dispatch(select(selection));
  };
}

/** De-select all annotations. */
function clearSelectedAnnotations() {
  return {type: actions.CLEAR_SELECTION};
}

module.exports = {
  init: init,
  update: update,

  actions: {
    clearSelectedAnnotations: clearSelectedAnnotations,
    focusAnnotations: focusAnnotations,
    highlightAnnotations: highlightAnnotations,
    removeSelectedAnnotation: removeSelectedAnnotation,
    selectAnnotations: selectAnnotations,
    selectTab: selectTab,
    setCollapsed: setCollapsed,
    setFilterQuery: setFilterQuery,
    setForceVisible: setForceVisible,
    setSortKey: setSortKey,
    toggleSelectedAnnotations: toggleSelectedAnnotations,
  },

  // Selectors
  hasSelectedAnnotations: hasSelectedAnnotations,
  isAnnotationSelected: isAnnotationSelected,
};

},{"../ui-constants":88,"./util":71,"seamless-immutable":154}],71:[function(require,module,exports){
'use strict';

/**
 * Return an object where each key in `updateFns` is mapped to the key itself.
 */
function actionTypes(updateFns) {
  return Object.keys(updateFns).reduce(function (types, key) {
    types[key] = key;
    return types;
  }, {});
}

/**
 * Given an object which maps action names to update functions, this returns
 * a reducer function that can be passed to the redux `createStore` function.
 */
function createReducer(updateFns) {
  return function (state, action) {
    var fn = updateFns[action.type];
    if (!fn) {
      return state;
    }
    return Object.assign({}, state, fn(state, action));
  };
}

/**
 * Takes an object mapping keys to selector functions and the `getState()`
 * function from the store and returns an object with the same keys but where
 * the values are functions that call the original functions with the `state`
 * argument set to the current value of `getState()`
 */
function bindSelectors(selectors, getState) {
  return Object.keys(selectors).reduce(function (bound, key) {
    var selector = selectors[key];
    bound[key] = function () {
      var args = [].slice.apply(arguments);
      args.unshift(getState());
      return selector.apply(null, args);
    };
    return bound;
  }, {});
}

module.exports = {
  actionTypes: actionTypes,
  bindSelectors: bindSelectors,
  createReducer: createReducer,
};

},{}],72:[function(require,module,exports){
'use strict';

var util = require('./util');

/**
 * This module defines actions and state related to the display mode of the
 * sidebar.
 */

function init() {
  return {
    // Flag that indicates whether the app is the sidebar and connected to
    // a page where annotations are being shown in context
    isSidebar: true,

    visibleHighlights: false,
  };
}

var update = {
  SET_SIDEBAR: function (state, action) {
    return {isSidebar: action.isSidebar};
  },
  SET_HIGHLIGHTS_VISIBLE: function (state, action) {
    return {visibleHighlights: action.visible};
  },
};

var actions = util.actionTypes(update);

/** Set whether the app is the sidebar */
function setAppIsSidebar(isSidebar) {
  return {type: actions.SET_SIDEBAR, isSidebar: isSidebar};
}

/**
 * Sets whether annotation highlights in connected documents are shown
 * or not.
 */
function setShowHighlights(show) {
  return {type: actions.SET_HIGHLIGHTS_VISIBLE, visible: show};
}

/**
 * Returns true if the app is being used as the sidebar in the annotation
 * client, as opposed to the standalone annotation page or stream views.
 */
function isSidebar(state) {
  return state.isSidebar;
}

module.exports = {
  init: init,
  update: update,
  actions: {
    setAppIsSidebar: setAppIsSidebar,
    setShowHighlights: setShowHighlights,
  },

  // Selectors
  isSidebar: isSidebar,
};

},{"./util":71}],73:[function(require,module,exports){
'use strict';

var escapeHtml = require('escape-html');
var katex = require('katex');
var showdown = require('showdown');

function targetBlank() {
  function filter(text) {
    return text.replace(/<a href=/g, '<a target="_blank" href=');
  }
  return [{type: 'output', filter: filter}];
}

var converter;

function renderMarkdown(markdown) {
  if (!converter) {
    // see https://github.com/showdownjs/showdown#valid-options
    converter = new showdown.Converter({
      extensions: [targetBlank],
      simplifiedAutoLink: true,
      // Since we're using simplifiedAutoLink we also use
      // literalMidWordUnderscores because otherwise _'s in URLs get
      // transformed into <em>'s.
      // See https://github.com/showdownjs/showdown/issues/211
      literalMidWordUnderscores: true,
    });
  }
  return converter.makeHtml(markdown);
}

function mathPlaceholder(id) {
  return '{math:' + id.toString() + '}';
}

/**
 * Parses a string containing mixed markdown and LaTeX in between
 * '$$..$$' or '\( ... \)' delimiters and returns an object containing a
 * list of math blocks found in the string, plus the input string with math
 * blocks replaced by placeholders.
 */
function extractMath(content) {
  var mathBlocks = [];
  var pos = 0;
  var replacedContent = content;

  while (true) { // eslint-disable-line no-constant-condition
    var blockMathStart = replacedContent.indexOf('$$', pos);
    var inlineMathStart = replacedContent.indexOf('\\(', pos);

    if (blockMathStart === -1 && inlineMathStart === -1) {
      break;
    }

    var mathStart;
    var mathEnd;
    if (blockMathStart !== -1 &&
        (inlineMathStart === -1 || blockMathStart < inlineMathStart)) {
      mathStart = blockMathStart;
      mathEnd = replacedContent.indexOf('$$', mathStart + 2);
    } else {
      mathStart = inlineMathStart;
      mathEnd = replacedContent.indexOf('\\)', mathStart + 2);
    }

    if (mathEnd === -1) {
      break;
    } else {
      mathEnd = mathEnd + 2;
    }

    var id = mathBlocks.length + 1;
    var placeholder = mathPlaceholder(id);
    mathBlocks.push({
      id: id,
      expression: replacedContent.slice(mathStart + 2, mathEnd - 2),
      inline: inlineMathStart !== -1,
    });

    var replacement;
    if (inlineMathStart !== -1) {
      replacement = placeholder;
    } else {
      // Add new lines before and after math blocks so that they render
      // as separate paragraphs
      replacement = '\n\n' + placeholder + '\n\n';
    }

    replacedContent = replacedContent.slice(0, mathStart) +
                      replacement +
                      replacedContent.slice(mathEnd);
    pos = mathStart + replacement.length;
  }

  return {
    mathBlocks: mathBlocks,
    content: replacedContent,
  };
}

function insertMath(html, mathBlocks) {
  return mathBlocks.reduce(function (html, block) {
    var renderedMath;
    try {
      if (block.inline) {
        renderedMath = katex.renderToString(block.expression);
      } else {
        // '\displaystyle {}' results in full-height fonts being used
        // for blocks.
        renderedMath = katex.renderToString('\\displaystyle {' + block.expression + '}');
      }
    } catch (err) {
      renderedMath = escapeHtml(block.expression);
    }
    return html.replace(mathPlaceholder(block.id), renderedMath);
  }, html);
}

function renderMathAndMarkdown(markdown, sanitizeFn) {
  // KaTeX takes care of escaping its input, so we want to avoid passing its
  // output through the HTML sanitizer. Therefore we first extract the math
  // blocks from the input, render and sanitize the remaining markdown and then
  // render and re-insert the math blocks back into the output.
  var mathInfo = extractMath(markdown);
  var markdownHTML = sanitizeFn(renderMarkdown(mathInfo.content));
  var mathAndMarkdownHTML = insertMath(markdownHTML, mathInfo.mathBlocks);
  return mathAndMarkdownHTML;
}

module.exports = renderMathAndMarkdown;

},{"escape-html":125,"katex":"katex","showdown":"showdown"}],74:[function(require,module,exports){
'use strict';

var retry = require('retry');

/**
 * Retry a Promise-returning operation until it succeeds or
 * fails after a set number of attempts.
 *
 * @param {Function} opFn - The operation to retry
 * @param {Object} options - The options object to pass to retry.operation()
 *
 * @return A promise for the first successful result of the operation, if
 *         it succeeds within the allowed number of attempts.
 */
function retryPromiseOperation(opFn, options) {
  return new Promise(function (resolve, reject) {
    var operation = retry.operation(options);
    operation.attempt(function () {
      opFn().then(function (result) {
        operation.retry();
        resolve(result);
      }).catch(function (err) {
        if (!operation.retry(err)) {
          reject(err);
        }
      });
    });
  });
}

module.exports = {
  retryPromiseOperation: retryPromiseOperation,
};

},{"retry":150}],75:[function(require,module,exports){
'use strict';

RootThread.$inject = ["$rootScope", "annotationUI", "drafts", "features", "searchFilter", "viewFilter"];
var buildThread = require('./build-thread');
var events = require('./events');
var memoize = require('./util/memoize');
var metadata = require('./annotation-metadata');
var uiConstants = require('./ui-constants');

function truthyKeys(map) {
  return Object.keys(map).filter(function (k) {
    return !!map[k];
  });
}

// Mapping from sort order name to a less-than predicate
// function for comparing annotations to determine their sort order.
var sortFns = {
  'Newest': function (a, b) {
    return a.updated > b.updated;
  },
  'Oldest': function (a, b) {
    return a.updated < b.updated;
  },
  'Location': function (a, b) {
    return metadata.location(a) < metadata.location(b);
  },
};

/**
 * Root conversation thread for the sidebar and stream.
 *
 * This performs two functions:
 *
 * 1. It listens for annotations being loaded, created and unloaded and
 *    dispatches annotationUI.{addAnnotations|removeAnnotations} actions.
 * 2. Listens for changes in the UI state and rebuilds the root conversation
 *    thread.
 *
 * The root thread is then displayed by viewer.html
 */
// @ngInject
function RootThread($rootScope, annotationUI, drafts, features, searchFilter, viewFilter) {

  /**
   * Build the root conversation thread from the given UI state.
   *
   * @param state - The current UI state (loaded annotations, sort mode,
   *        filter settings etc.)
   */
  function buildRootThread(state) {
    var sortFn = sortFns[state.sortKey];

    var filterFn;
    if (state.filterQuery) {
      var filters = searchFilter.generateFacetedFilter(state.filterQuery);
      filterFn = function (annot) {
        return viewFilter.filter([annot], filters).length > 0;
      };
    }

    var threadFilterFn;
    if (state.isSidebar && !state.filterQuery) {
      if (!features.flagEnabled('orphans_tab')) {
        threadFilterFn = function (thread) {
          if (!thread.annotation) {
            return false;
          }
          if (state.selectedTab === uiConstants.TAB_NOTES) {
            return metadata.isPageNote(thread.annotation);
          } else {
            return metadata.isAnnotation(thread.annotation) || metadata.isOrphan(thread.annotation);
          }
        };
      } else {
        threadFilterFn = function (thread) {
          if (!thread.annotation) {
            return false;
          }
          if (metadata.isWaitingToAnchor(thread.annotation)) {
            return false;
          }
          switch (state.selectedTab) {
          case uiConstants.TAB_ANNOTATIONS:
            return metadata.isAnnotation(thread.annotation);
          case uiConstants.TAB_ORPHANS:
            return metadata.isOrphan(thread.annotation);
          case uiConstants.TAB_NOTES:
            return metadata.isPageNote(thread.annotation);
          default:
            throw new Error('Invalid selected tab');
          }
        };
      }
    }

    // Get the currently loaded annotations and the set of inputs which
    // determines what is visible and build the visible thread structure
    return buildThread(state.annotations, {
      forceVisible: truthyKeys(state.forceVisible),
      expanded: state.expanded,
      highlighted: state.highlighted,
      selected: truthyKeys(state.selectedAnnotationMap || {}),
      sortCompareFn: sortFn,
      filterFn: filterFn,
      threadFilterFn: threadFilterFn,
    });
  }

  function deleteNewAndEmptyAnnotations() {
    annotationUI.getState().annotations.filter(function (ann) {
      return metadata.isNew(ann) && !drafts.getIfNotEmpty(ann);
    }).forEach(function (ann) {
      drafts.remove(ann);
      $rootScope.$broadcast(events.ANNOTATION_DELETED, ann);
    });
  }

  // Listen for annotations being created or loaded
  // and show them in the UI.
  //
  // Note: These events could all be converted into actions that are handled by
  // the Redux store in annotationUI.
  var loadEvents = [events.ANNOTATION_CREATED,
                    events.ANNOTATION_UPDATED,
                    events.ANNOTATIONS_LOADED];
  loadEvents.forEach(function (event) {
    $rootScope.$on(event, function (event, annotation) {
      annotationUI.addAnnotations([].concat(annotation));
    });
  });

  $rootScope.$on(events.BEFORE_ANNOTATION_CREATED, function (event, ann) {
    // When a new annotation is created, remove any existing annotations
    // that are empty.
    deleteNewAndEmptyAnnotations();

    annotationUI.addAnnotations([ann]);

    // If the annotation is of type note or annotation, make sure
    // the appropriate tab is selected. If it is of type reply, user
    // stays in the selected tab.
    if (metadata.isPageNote(ann)) {
      annotationUI.selectTab(uiConstants.TAB_NOTES);
    } else if (metadata.isAnnotation(ann)) {
      annotationUI.selectTab(uiConstants.TAB_ANNOTATIONS);
    }

    (ann.references || []).forEach(function (parent) {
      annotationUI.setCollapsed(parent, false);
    });
  });

  // Remove any annotations that are deleted or unloaded
  $rootScope.$on(events.ANNOTATION_DELETED, function (event, annotation) {
    annotationUI.removeAnnotations([annotation]);
    annotationUI.removeSelectedAnnotation(annotation);
  });
  $rootScope.$on(events.ANNOTATIONS_UNLOADED, function (event, annotations) {
    annotationUI.removeAnnotations(annotations);
  });

  // Once the focused group state is moved to the app state store, then the
  // logic in this event handler can be moved to the annotations reducer.
  $rootScope.$on(events.GROUP_FOCUSED, function (event, focusedGroupId) {
    var updatedAnnots = annotationUI.getState().annotations.filter(function (ann) {
      return metadata.isNew(ann) && !metadata.isReply(ann);
    }).map(function (ann) {
      return Object.assign(ann, {
        // FIXME - $$tag is currently a non-enumerable property so it has to be
        // copied explicitly
        $$tag: ann.$$tag,
        group: focusedGroupId,
      });
    });
    if (updatedAnnots.length > 0) {
      annotationUI.addAnnotations(updatedAnnots);
    }
  });

  /**
   * Build the root conversation thread from the given UI state.
   * @return {Thread}
   */
  this.thread = memoize(buildRootThread);
}

module.exports = RootThread;

},{"./annotation-metadata":3,"./build-thread":13,"./events":52,"./ui-constants":88,"./util/memoize":91}],76:[function(require,module,exports){
'use strict';

var EventEmitter = require('tiny-emitter');
var inherits = require('inherits');

/**
 * Client for the Hypothesis search API.
 *
 * SearchClient handles paging through results, canceling search etc.
 *
 * @param {Object} searchFn - Function for querying the search API
 * @param {Object} opts - Search options
 * @constructor
 */
function SearchClient(searchFn, opts) {
  opts = opts || {};

  var DEFAULT_CHUNK_SIZE = 200;
  this._searchFn = searchFn;
  this._chunkSize = opts.chunkSize || DEFAULT_CHUNK_SIZE;
  if (typeof opts.incremental !== 'undefined') {
    this._incremental = opts.incremental;
  } else {
    this._incremental = true;
  }
  this._canceled = false;
}
inherits(SearchClient, EventEmitter);

SearchClient.prototype._getBatch = function (query, offset) {
  var searchQuery = Object.assign({
    limit: this._chunkSize,
    offset: offset,
    sort: 'created',
    order: 'asc',
    _separate_replies: true,
  }, query);

  var self = this;
  this._searchFn(searchQuery).then(function (results) {
    if (self._canceled) {
      return;
    }

    var chunk = results.rows.concat(results.replies || []);
    if (self._incremental) {
      self.emit('results', chunk);
    } else {
      self._results = self._results.concat(chunk);
    }

    var nextOffset = offset + results.rows.length;
    if (results.total > nextOffset) {
      self._getBatch(query, nextOffset);
    } else {
      if (!self._incremental) {
        self.emit('results', self._results);
      }
      self.emit('end');
    }
  }).catch(function (err) {
    if (self._canceled) {
      return;
    }
    self.emit('error', err);
  }).then(function () {
    if (self._canceled) {
      return;
    }
    self.emit('end');
  });
};

/**
 * Perform a search against the Hypothesis API.
 *
 * Emits a 'results' event with an array of annotations as they become
 * available (in incremental mode) or when all annotations are available
 * (in non-incremental mode).
 *
 * Emits an 'error' event if the search fails.
 * Emits an 'end' event once the search completes.
 */
SearchClient.prototype.get = function (query) {
  this._results = [];
  this._getBatch(query, 0);
};

/**
 * Cancel the current search and emit the 'end' event.
 * No further events will be emitted after this.
 */
SearchClient.prototype.cancel = function () {
  this._canceled = true;
  this.emit('end');
};

module.exports = SearchClient;

},{"inherits":127,"tiny-emitter":158}],77:[function(require,module,exports){
var SearchFilter;

module.exports = SearchFilter = (function() {
  function SearchFilter() {}

  SearchFilter.prototype._splitTerm = function(term) {
    var data, filter;
    filter = term.slice(0, term.indexOf(":"));
    if (filter == null) {
      return [null, term];
    }
    if (filter === 'group' || filter === 'quote' || filter === 'result' || filter === 'since' || filter === 'tag' || filter === 'text' || filter === 'uri' || filter === 'user') {
      data = term.slice(filter.length + 1);
      return [filter, data];
    } else {
      return [null, term];
    }
  };

  SearchFilter.prototype._tokenize = function(searchtext) {
    var _removeQuoteCharacter, data, filter, i, index, len, ref, token, tokens;
    if (!searchtext) {
      return [];
    }
    _removeQuoteCharacter = function(text) {
      var end, start;
      start = text.slice(0, 1);
      end = text.slice(-1);
      if ((start === '"' || start === "'") && (start === end)) {
        text = text.slice(1, text.length - 1);
      }
      return text;
    };
    tokens = searchtext.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
    tokens = tokens.map(_removeQuoteCharacter);
    for (index = i = 0, len = tokens.length; i < len; index = ++i) {
      token = tokens[index];
      ref = this._splitTerm(token), filter = ref[0], data = ref[1];
      if (filter != null) {
        tokens[index] = filter + ':' + (_removeQuoteCharacter(data));
      }
    }
    return tokens;
  };

  SearchFilter.prototype.toObject = function(searchtext) {
    var addToObj, data, filter, filterToBackendFilter, i, len, obj, ref, term, terms;
    obj = {};
    filterToBackendFilter = function(filter) {
      if (filter === 'tag') {
        return 'tags';
      } else {
        return filter;
      }
    };
    addToObj = function(key, data) {
      if (obj[key] != null) {
        return obj[key].push(data);
      } else {
        return obj[key] = [data];
      }
    };
    if (searchtext) {
      terms = this._tokenize(searchtext);
      for (i = 0, len = terms.length; i < len; i++) {
        term = terms[i];
        ref = this._splitTerm(term), filter = ref[0], data = ref[1];
        if (filter == null) {
          filter = 'any';
          data = term;
        }
        addToObj(filterToBackendFilter(filter), data);
      }
    }
    return obj;
  };

  SearchFilter.prototype.generateFacetedFilter = function(searchtext) {
    var any, filter, i, len, quote, result, since, t, tag, term, terms, text, time, uri, user;
    any = [];
    quote = [];
    result = [];
    since = [];
    tag = [];
    text = [];
    uri = [];
    user = [];
    if (searchtext) {
      terms = this._tokenize(searchtext);
      for (i = 0, len = terms.length; i < len; i++) {
        term = terms[i];
        filter = term.slice(0, term.indexOf(":"));
        if (filter == null) {
          filter = "";
        }
        switch (filter) {
          case 'quote':
            quote.push(term.slice(6));
            break;
          case 'result':
            result.push(term.slice(7));
            break;
          case 'since':
            time = term.slice(6).toLowerCase();
            if (time.match(/^\d+$/)) {
              since.push(time);
            }
            if (time.match(/^\d+sec$/)) {
              t = /^(\d+)sec$/.exec(time)[1];
              since.push(t);
            }
            if (time.match(/^\d+min$/)) {
              t = /^(\d+)min$/.exec(time)[1];
              since.push(t * 60);
            }
            if (time.match(/^\d+hour$/)) {
              t = /^(\d+)hour$/.exec(time)[1];
              since.push(t * 60 * 60);
            }
            if (time.match(/^\d+day$/)) {
              t = /^(\d+)day$/.exec(time)[1];
              since.push(t * 60 * 60 * 24);
            }
            if (time.match(/^\d+week$/)) {
              t = /^(\d+)week$/.exec(time)[1];
              since.push(t * 60 * 60 * 24 * 7);
            }
            if (time.match(/^\d+month$/)) {
              t = /^(\d+)month$/.exec(time)[1];
              since.push(t * 60 * 60 * 24 * 30);
            }
            if (time.match(/^\d+year$/)) {
              t = /^(\d+)year$/.exec(time)[1];
              since.push(t * 60 * 60 * 24 * 365);
            }
            break;
          case 'tag':
            tag.push(term.slice(4));
            break;
          case 'text':
            text.push(term.slice(5));
            break;
          case 'uri':
            uri.push(term.slice(4));
            break;
          case 'user':
            user.push(term.slice(5));
            break;
          default:
            any.push(term);
        }
      }
    }
    return {
      any: {
        terms: any,
        operator: 'and'
      },
      quote: {
        terms: quote,
        operator: 'and'
      },
      result: {
        terms: result,
        operator: 'min'
      },
      since: {
        terms: since,
        operator: 'and'
      },
      tag: {
        terms: tag,
        operator: 'and'
      },
      text: {
        terms: text,
        operator: 'and'
      },
      uri: {
        terms: uri,
        operator: 'or'
      },
      user: {
        terms: user,
        operator: 'or'
      }
    };
  };

  return SearchFilter;

})();


},{}],78:[function(require,module,exports){
'use strict';

serviceUrl.$inject = ["settings"];
var urlUtil = require('./util/url-util');

/**
 * A map of all route names to relative URLs on the Hypothesis service that
 * the client links to.
 *
 * The URLs are relative to the `serviceUrl` URL in the app's settings.
 */
var ROUTES = {
  'account.settings': 'account/settings',
  'forgot-password': 'forgot-password',
  'groups.leave': 'groups/:id/leave',
  'groups.new': 'groups/new',
  'help': 'docs/help',
  'signup': 'signup',
  'search.tag': 'stream?q=tag::tag',
  'user': 'u/:user',
};

/**
 * A service which maps route names to URLs on the Hypothesis annotation
 * service.
 */
// @ngInject
function serviceUrl(settings) {
  return function (route, params) {
    params = params || {};

    var path = ROUTES[route];
    if (!path) {
      throw new Error('Unknown route ' + route);
    }
    var url = urlUtil.replaceURLParams(path, params);

    var unused = Object.keys(url.params);
    if (unused.length > 0) {
      throw new Error('Unknown route parameters: ' + unused.join(', '));
    }

    return settings.serviceUrl + url.url;
  };
}

module.exports = serviceUrl;

},{"./util/url-util":93}],79:[function(require,module,exports){
'use strict';

session.$inject = ["$http", "$resource", "$rootScope", "flash", "raven", "settings"];
var angular = require('angular');

var events = require('./events');
var retryUtil = require('./retry-util');

var CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function sessionActions(options) {
  var actions = {
    login: {
      method: 'POST',
      params: { __formid__: 'login' },
    },

    logout: {
      method: 'POST',
      params: { __formid__: 'logout' },
    },

    _load: { method: 'GET' },

    dismiss_sidebar_tutorial: {
      method: 'POST',
      params: { path: 'dismiss_sidebar_tutorial' },
    },
  };

  Object.keys(actions).forEach(function (action) {
    Object.assign(actions[action], options);
  });

  return actions;
}


/**
 * @ngdoc service
 * @name session
 * @description
 * Access to the application session and account actions. This service gives
 * other parts of the application access to parts of the server-side session
 * state (such as current authenticated userid, CSRF token, etc.).
 *
 * In addition, this service also provides helper methods for mutating the
 * session state, by, e.g. logging in, logging out, etc.
 *
 * @ngInject
 */
function session($http, $resource, $rootScope, flash, raven, settings) {
  // Headers sent by every request made by the session service.
  var headers = {};
  var actions = sessionActions({
    headers: headers,
    transformResponse: process,
    withCredentials: true,
  });
  var endpoint = new URL('app/:path', settings.serviceUrl).href;
  var resource = $resource(endpoint, {}, actions);

  // Blank initial model state
  resource.state = {};

  // Cache the result of _load()
  var lastLoad;
  var lastLoadTime;

  /**
   * @name session.load()
   * @description Fetches the session data from the server.
   * @returns A promise for the session data.
   *
   * The data is cached for CACHE_TTL across all actions of the session
   * service: that is, a call to login() will update the session data and a call
   * within CACHE_TTL milliseconds to load() will return that data rather than
   * triggering a new request.
   */
  resource.load = function () {
    if (!lastLoadTime || (Date.now() - lastLoadTime) > CACHE_TTL) {

      // The load attempt is automatically retried with a backoff.
      //
      // This serves to make loading the app in the extension cope better with
      // flakey connectivity but it also throttles the frequency of calls to
      // the /app endpoint.
      lastLoadTime = Date.now();
      lastLoad = retryUtil.retryPromiseOperation(function () {
        return resource._load().$promise;
      }).then(function (session) {
        lastLoadTime = Date.now();
        return session;
      }).catch(function (err) {
        lastLoadTime = null;
        throw err;
      });
    }
    return lastLoad;
  };

  /**
   * @name session.update()
   *
   * @description Update the session state using the provided data.
   *              This is a counterpart to load(). Whereas load() makes
   *              a call to the server and then updates itself from
   *              the response, update() can be used to update the client
   *              when new state has been pushed to it by the server.
   */
  resource.update = function (model) {
    var isInitialLoad = !resource.state.csrf;

    var userChanged = model.userid !== resource.state.userid;
    var groupsChanged = !angular.equals(model.groups, resource.state.groups);

    // Copy the model data (including the CSRF token) into `resource.state`.
    angular.copy(model, resource.state);

    // Set up subsequent requests to send the CSRF token in the headers.
    if (resource.state.csrf) {
      headers[$http.defaults.xsrfHeaderName] = resource.state.csrf;
    }

    lastLoad = Promise.resolve(resource.state);
    lastLoadTime = Date.now();

    $rootScope.$broadcast(events.SESSION_CHANGED, {
      initialLoad: isInitialLoad,
    });

    if (userChanged) {
      $rootScope.$broadcast(events.USER_CHANGED, {
        initialLoad: isInitialLoad,
        userid: model.userid,
      });

      // associate error reports with the current user in Sentry
      if (resource.state.userid) {
        raven.setUserInfo({
          id: resource.state.userid,
        });
      } else {
        raven.setUserInfo(undefined);
      }
    }

    if (groupsChanged) {
      $rootScope.$broadcast(events.GROUPS_CHANGED, {
        initialLoad: isInitialLoad,
      });
    }

    // Return the model
    return model;
  };

  function process(data, headersGetter, status) {
    if (status < 200 || status >= 500) {
      return null;
    }

    data = angular.fromJson(data);

    // Lift response data
    var model = data.model || {};
    if (typeof data.errors !== 'undefined') {
      model.errors = data.errors;
    }
    if (typeof data.reason !== 'undefined') {
      model.reason = data.reason;
    }

    // Fire flash messages.
    for (var type in data.flash) {
      if (data.flash.hasOwnProperty(type)) {
        var msgs = data.flash[type];
        for (var i = 0, len = msgs.length; i < len; i++) {
          flash[type](msgs[i]);
        }
      }
    }

    return resource.update(model);
  }

  return resource;
}

module.exports = session;

},{"./events":52,"./retry-util":74,"angular":"angular"}],80:[function(require,module,exports){
'use strict';

/**
 * Return application configuration information from the host page.
 *
 * Exposes shared application settings, read from script tags with the
 * class `settingsClass` which contain JSON content.
 *
 * If there are multiple such tags, the configuration from each is merged.
 *
 * @param {Document|Element} document - The root element to search for
 *                                      <script> settings tags.
 * @param {string} settingsClass - The class name to match on <script> tags.
 */
function settings(document, settingsClass) {
  if (!settingsClass) {
    settingsClass = 'js-hypothesis-settings';
  }
  var settingsElements =
    document.querySelectorAll('script.' + settingsClass);

  var config = {};
  for (var i=0; i < settingsElements.length; i++) {
    Object.assign(config, JSON.parse(settingsElements[i].textContent));
  }
  return config;
}

module.exports = settings;

},{}],81:[function(require,module,exports){
'use strict';

store.$inject = ["$http", "settings"];
var get = require('lodash.get');

var retryUtil = require('./retry-util');
var urlUtil = require('./util/url-util');

/**
 * Return a shallow clone of `obj` with all client-only properties removed.
 * Client-only properties are marked by a '$' prefix.
 */
function stripInternalProperties(obj) {
  var result = {};

  for (var k in obj) {
    if (obj.hasOwnProperty(k) && k[0] !== '$') {
      result[k] = obj[k];
    }
  }

  return result;
}


function forEachSorted(obj, iterator, context) {
  var keys = Object.keys(obj).sort();
  for (var i = 0; i < keys.length; i++) {
    iterator.call(context, obj[keys[i]], keys[i]);
  }
  return keys;
}


function serializeValue(v) {
  if (typeof v === 'object') {
    return v instanceof Date ? v.toISOString() : JSON.stringify(v);
  }
  return v;
}


function encodeUriQuery(val) {
  return encodeURIComponent(val).replace(/%20/g, '+');
}


// Serialize an object containing parameters into a form suitable for a query
// string.
//
// This is an almost identical copy of the default Angular parameter serializer
// ($httpParamSerializer), with one important change. In Angular 1.4.x
// semicolons are not encoded in query parameter values. This is a problem for
// us as URIs around the web may well contain semicolons, which our backend will
// then proceed to parse as a delimiter in the query string. To avoid this
// problem we use a very conservative encoder, found above.
function serializeParams(params) {
  if (!params) {
    return '';
  }
  var parts = [];
  forEachSorted(params, function(value, key) {
    if (value === null || typeof value === 'undefined') {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(function(v) {
        parts.push(encodeUriQuery(key)  + '=' + encodeUriQuery(serializeValue(v)));
      });
    } else {
      parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(serializeValue(value)));
    }
  });

  return parts.join('&');
}

/**
 * Creates a function that will make an API call to a named route.
 *
 * @param $http - The Angular HTTP service
 * @param links - Object or promise for an object mapping named API routes to
 *                URL templates and methods
 * @param route - The dotted path of the named API route (eg. `annotation.create`)
 */
function createAPICall($http, links, route) {
  return function (params, data) {
    return links.then(function (links) {
      var descriptor = get(links, route);
      var url = urlUtil.replaceURLParams(descriptor.url, params);
      var req = {
        data: data ? stripInternalProperties(data) : null,
        method: descriptor.method,
        params: url.params,
        paramSerializer: serializeParams,
        url: url.url,
      };
      return $http(req);
    }).then(function (result) {
      return result.data;
    });
  };
}

/**
 * API client for the Hypothesis REST API.
 *
 * Returns an object that with keys that match the routes in
 * the Hypothesis API (see http://h.readthedocs.io/en/latest/api/).
 */
// @ngInject
function store($http, settings) {
  var links = retryUtil.retryPromiseOperation(function () {
    return $http.get(settings.apiUrl);
  }).then(function (response) {
    return response.data.links;
  });

  return {
    search: createAPICall($http, links, 'search'),
    annotation: {
      create: createAPICall($http, links, 'annotation.create'),
      delete: createAPICall($http, links, 'annotation.delete'),
      get: createAPICall($http, links, 'annotation.read'),
      update: createAPICall($http, links, 'annotation.update'),
    },
  };
}

module.exports = store;

},{"./retry-util":74,"./util/url-util":93,"lodash.get":131}],82:[function(require,module,exports){
var StreamController, angular;

angular = require('angular');

module.exports = StreamController = (function() {
  StreamController.$inject = ['$scope', '$location', '$route', '$rootScope', '$routeParams', 'annotationUI', 'queryParser', 'rootThread', 'searchFilter', 'store', 'streamer', 'streamFilter', 'annotationMapper'];

  function StreamController($scope, $location, $route, $rootScope, $routeParams, annotationUI, queryParser, rootThread, searchFilter, store, streamer, streamFilter, annotationMapper) {
    var fetch, lastQuery, load, offset, terms;
    annotationUI.setAppIsSidebar(false);
    offset = 0;
    fetch = function(limit) {
      var options, query, searchParams;
      options = {
        offset: offset,
        limit: limit
      };
      searchParams = searchFilter.toObject($routeParams.q);
      query = angular.extend(options, searchParams);
      query._separate_replies = true;
      return store.search(query).then(load)["catch"](function(err) {
        return console.error(err);
      });
    };
    load = function(arg) {
      var replies, rows;
      rows = arg.rows, replies = arg.replies;
      offset += rows.length;
      return annotationMapper.loadAnnotations(rows, replies);
    };
    lastQuery = $routeParams.q;
    $scope.$on('$routeUpdate', function() {
      if ($routeParams.q !== lastQuery) {
        annotationUI.clearAnnotations();
        return $route.reload();
      }
    });
    streamFilter.resetFilter().setMatchPolicyIncludeAll();
    terms = searchFilter.generateFacetedFilter($routeParams.q);
    queryParser.populateFilter(streamFilter, terms);
    streamer.setConfig('filter', {
      filter: streamFilter.getFilter()
    });
    streamer.connect();
    fetch(20);
    $scope.setCollapsed = function(id, collapsed) {
      return annotationUI.setCollapsed(id, collapsed);
    };
    $scope.forceVisible = function(id) {
      return annotationUI.setForceVisible(id, true);
    };
    Object.assign($scope.search, {
      query: function() {
        return $routeParams.q || '';
      },
      update: function(q) {
        return $location.search({
          q: q
        });
      }
    });
    annotationUI.subscribe(function() {
      return $scope.rootThread = rootThread.thread(annotationUI.getState());
    });
    annotationUI.setSortKey('Newest');
    $scope.isStream = true;
    $scope.loadMore = fetch;
  }

  return StreamController;

})();


},{"angular":"angular"}],83:[function(require,module,exports){
var StreamFilter;

module.exports = StreamFilter = (function() {
  StreamFilter.prototype.strategies = ['include_any', 'include_all', 'exclude_any', 'exclude_all'];

  StreamFilter.prototype.filter = {
    match_policy: 'include_any',
    clauses: [],
    actions: {
      create: true,
      update: true,
      "delete": true
    }
  };

  function StreamFilter() {}

  StreamFilter.prototype.getFilter = function() {
    return this.filter;
  };

  StreamFilter.prototype.getMatchPolicy = function() {
    return this.filter.match_policy;
  };

  StreamFilter.prototype.getClauses = function() {
    return this.filter.clauses;
  };

  StreamFilter.prototype.getActions = function() {
    return this.filter.actions;
  };

  StreamFilter.prototype.getActionCreate = function() {
    return this.filter.actions.create;
  };

  StreamFilter.prototype.getActionUpdate = function() {
    return this.filter.actions.update;
  };

  StreamFilter.prototype.getActionDelete = function() {
    return this.filter.actions["delete"];
  };

  StreamFilter.prototype.setMatchPolicy = function(policy) {
    this.filter.match_policy = policy;
    return this;
  };

  StreamFilter.prototype.setMatchPolicyIncludeAny = function() {
    this.filter.match_policy = 'include_any';
    return this;
  };

  StreamFilter.prototype.setMatchPolicyIncludeAll = function() {
    this.filter.match_policy = 'include_all';
    return this;
  };

  StreamFilter.prototype.setMatchPolicyExcludeAny = function() {
    this.filter.match_policy = 'exclude_any';
    return this;
  };

  StreamFilter.prototype.setMatchPolicyExcludeAll = function() {
    this.filter.match_policy = 'exclude_all';
    return this;
  };

  StreamFilter.prototype.setActions = function(actions) {
    this.filter.actions = actions;
    return this;
  };

  StreamFilter.prototype.setActionCreate = function(action) {
    this.filter.actions.create = action;
    return this;
  };

  StreamFilter.prototype.setActionUpdate = function(action) {
    this.filter.actions.update = action;
    return this;
  };

  StreamFilter.prototype.setActionDelete = function(action) {
    this.filter.actions["delete"] = action;
    return this;
  };

  StreamFilter.prototype.noClauses = function() {
    this.filter.clauses = [];
    return this;
  };

  StreamFilter.prototype.addClause = function(field, operator, value, case_sensitive, options) {
    if (case_sensitive == null) {
      case_sensitive = false;
    }
    if (options == null) {
      options = {};
    }
    this.filter.clauses.push({
      field: field,
      operator: operator,
      value: value,
      case_sensitive: case_sensitive,
      options: options
    });
    return this;
  };

  StreamFilter.prototype.resetFilter = function() {
    this.setMatchPolicyIncludeAny();
    this.setActionCreate(true);
    this.setActionUpdate(true);
    this.setActionDelete(true);
    this.noClauses();
    return this;
  };

  return StreamFilter;

})();


},{}],84:[function(require,module,exports){
'use strict';

Streamer.$inject = ["$rootScope", "annotationMapper", "annotationUI", "features", "groups", "session", "settings"];
var uuid = require('node-uuid');

var events = require('./events');
var Socket = require('./websocket');

/**
 * Open a new WebSocket connection to the Hypothesis push notification service.
 * Only one websocket connection may exist at a time, any existing socket is
 * closed.
 *
 * @param $rootScope - Scope used to $apply() app state changes
 *                     resulting from WebSocket messages, in order to update
 *                     appropriate watchers.
 * @param annotationMapper - The local annotation store
 * @param groups - The local groups store
 * @param session - Provides access to read and update the session state
 * @param settings - Application settings
 */
// @ngInject
function Streamer($rootScope, annotationMapper, annotationUI, features, groups,
                  session, settings) {
  // The randomly generated session UUID
  var clientId = uuid.v4();

  // The socket instance for this Streamer instance
  var socket;

  // Client configuration messages, to be sent each time a new connection is
  // established.
  var configMessages = {};

  // The streamer maintains a set of pending updates and deletions which have
  // been received via the WebSocket but not yet applied to the contents of the
  // app.
  //
  // This state should be managed as part of the global app state in
  // annotationUI, but that is currently difficult because applying updates
  // requires filtering annotations against the focused group (information not
  // currently stored in the app state) and triggering events in order to update
  // the annotations displayed in the page.

  // Map of ID -> updated annotation for updates that have been received over
  // the WS but not yet applied
  var pendingUpdates = {};
  // Set of IDs of annotations which have been deleted but for which the
  // deletion has not yet been applied
  var pendingDeletions = {};

  function handleAnnotationNotification(message) {
    var action = message.options.action;
    var annotations = message.payload;

    switch (action) {
    case 'create':
    case 'update':
    case 'past':
      annotations.forEach(function (ann) {
        // In the sidebar, only save pending updates for annotations in the
        // focused group, since we only display annotations from the focused
        // group and reload all annotations and discard pending updates
        // when switching groups.
        if (ann.group === groups.focused().id || !annotationUI.isSidebar()) {
          pendingUpdates[ann.id] = ann;
        }
      });
      break;
    case 'delete':
      annotations.forEach(function (ann) {
        // Discard any pending but not-yet-applied updates for this annotation
        delete pendingUpdates[ann.id];

        // If we already have this annotation loaded, then record a pending
        // deletion. We do not check the group of the annotation here because a)
        // that information is not included with deletion notifications and b)
        // even if the annotation is from the current group, it might be for a
        // new annotation (saved in pendingUpdates and removed above), that has
        // not yet been loaded.
        if (annotationUI.annotationExists(ann.id)) {
          pendingDeletions[ann.id] = true;
        }
      });
      break;
    }

    if (!features.flagEnabled('defer_realtime_updates') ||
        !annotationUI.isSidebar()) {
      applyPendingUpdates();
    }
  }

  function handleSessionChangeNotification(message) {
    session.update(message.model);
  }

  function handleSocketOnError (event) {
    console.warn('Error connecting to H push notification service:', event);

    // In development, warn if the connection failure might be due to
    // the app's origin not having been whitelisted in the H service's config.
    //
    // Unfortunately the error event does not provide a way to get at the
    // HTTP status code for HTTP -> WS upgrade requests.
    var websocketHost = new URL(settings.websocketUrl).hostname;
    if (['localhost', '127.0.0.1'].indexOf(websocketHost) !== -1) {
      console.warn('Check that your H service is configured to allow ' +
                   'WebSocket connections from ' + window.location.origin);
    }
  }

  function handleSocketOnMessage (event) {
    // Wrap message dispatches in $rootScope.$apply() so that
    // scope watches on app state affected by the received message
    // are updated
    $rootScope.$apply(function () {
      var message = JSON.parse(event.data);
      if (!message) {
        return;
      }

      if (message.type === 'annotation-notification') {
        handleAnnotationNotification(message);
      } else if (message.type === 'session-change') {
        handleSessionChangeNotification(message);
      } else {
        console.warn('received unsupported notification', message.type);
      }
    });
  }

  function sendClientConfig () {
    Object.keys(configMessages).forEach(function (key) {
      if (configMessages[key]) {
        socket.send(configMessages[key]);
      }
    });
  }

  /**
   * Send a configuration message to the push notification service.
   * Each message is associated with a key, which is used to re-send
   * configuration data to the server in the event of a reconnection.
   */
  function setConfig(key, configMessage) {
    configMessages[key] = configMessage;
    if (socket && socket.isConnected()) {
      socket.send(configMessage);
    }
  }

  var _connect = function () {
    var url = settings.websocketUrl;

    // If we have no URL configured, don't do anything.
    if (!url) {
      return;
    }

    socket = new Socket(url);

    socket.on('open', sendClientConfig);
    socket.on('error', handleSocketOnError);
    socket.on('message', handleSocketOnMessage);

    // Configure the client ID
    setConfig('client-id', {
      messageType: 'client_id',
      value: clientId,
    });
  };

  var connect = function () {
    if (socket) {
      return;
    }

    _connect();
  };

  var reconnect = function () {
    if (socket) {
      socket.close();
    }

    _connect();
  };

  function applyPendingUpdates() {
    var updates = Object.values(pendingUpdates);
    var deletions = Object.keys(pendingDeletions).map(function (id) {
      return {id: id};
    });

    if (updates.length) {
      annotationMapper.loadAnnotations(updates);
    }
    if (deletions.length) {
      annotationMapper.unloadAnnotations(deletions);
    }

    pendingUpdates = {};
    pendingDeletions = {};
  }

  function countPendingUpdates() {
    return Object.keys(pendingUpdates).length +
           Object.keys(pendingDeletions).length;
  }

  function hasPendingDeletion(id) {
    return pendingDeletions.hasOwnProperty(id);
  }

  function removePendingUpdates(event, anns) {
    if (!Array.isArray(anns)) {
      anns = [anns];
    }
    anns.forEach(function (ann) {
      delete pendingUpdates[ann.id];
      delete pendingDeletions[ann.id];
    });
  }

  function clearPendingUpdates() {
    pendingUpdates = {};
    pendingDeletions = {};
  }

  var updateEvents = [
    events.ANNOTATION_DELETED,
    events.ANNOTATION_UPDATED,
    events.ANNOTATIONS_UNLOADED,
  ];

  updateEvents.forEach(function (event) {
    $rootScope.$on(event, removePendingUpdates);
  });
  $rootScope.$on(events.GROUP_FOCUSED, clearPendingUpdates);

  this.applyPendingUpdates = applyPendingUpdates;
  this.countPendingUpdates = countPendingUpdates;
  this.hasPendingDeletion = hasPendingDeletion;
  this.clientId = clientId;
  this.configMessages = configMessages;
  this.connect = connect;
  this.reconnect = reconnect;
  this.setConfig = setConfig;
}

module.exports = Streamer;

},{"./events":52,"./websocket":97,"node-uuid":132}],85:[function(require,module,exports){
'use strict';

var metadata = require('./annotation-metadata');
var countIf = require('./util/array-util').countIf;

/**
 * Return a count of the number of Annotations, Page Notes, Orphans and
 * annotations still being anchored in a set of `annotations`
 */
function tabCounts(annotations, opts) {
  opts = opts || {separateOrphans: false};

  var counts = {
    notes: countIf(annotations, metadata.isPageNote),
    annotations: countIf(annotations, metadata.isAnnotation),
    orphans: countIf(annotations, metadata.isOrphan),
    anchoring: countIf(annotations, metadata.isWaitingToAnchor),
  };

  if (opts.separateOrphans) {
    return counts;
  } else {
    return Object.assign({}, counts, {
      annotations: counts.annotations + counts.orphans,
      orphans: 0,
    });
  }
}

module.exports = tabCounts;

},{"./annotation-metadata":3,"./util/array-util":90}],86:[function(require,module,exports){
module.exports = [
  'localStorage', function(localStorage) {
    var TAGS_LIST_KEY, TAGS_MAP_KEY;
    TAGS_LIST_KEY = 'hypothesis.user.tags.list';
    TAGS_MAP_KEY = 'hypothesis.user.tags.map';
    return {
      filter: function(query) {
        var filterFn, savedTags;
        savedTags = localStorage.getObject(TAGS_LIST_KEY);
        if (savedTags == null) {
          savedTags = [];
        }
        filterFn = function(e) {
          return e.toLowerCase().indexOf(query.toLowerCase()) > -1;
        };
        return savedTags.filter(filterFn);
      },
      store: function(tags) {
        var compareFn, i, len, savedTags, tag, tagsList;
        savedTags = localStorage.getObject(TAGS_MAP_KEY);
        if (savedTags == null) {
          savedTags = {};
        }
        for (i = 0, len = tags.length; i < len; i++) {
          tag = tags[i];
          if (savedTags[tag.text] != null) {
            savedTags[tag.text].count += 1;
            savedTags[tag.text].updated = Date.now();
          } else {
            savedTags[tag.text] = {
              text: tag.text,
              count: 1,
              updated: Date.now()
            };
          }
        }
        localStorage.setObject(TAGS_MAP_KEY, savedTags);
        tagsList = [];
        for (tag in savedTags) {
          tagsList[tagsList.length] = tag;
        }
        compareFn = function(t1, t2) {
          if (savedTags[t1].count !== savedTags[t2].count) {
            return savedTags[t2].count - savedTags[t1].count;
          } else {
            if (t1 < t2) {
              return -1;
            }
            if (t1 > t2) {
              return 1;
            }
            return 0;
          }
        };
        tagsList = tagsList.sort(compareFn);
        return localStorage.setObject(TAGS_LIST_KEY, tagsList);
      }
    };
  }
];


},{}],87:[function(require,module,exports){
'use strict';

var minute = 60;
var hour = minute * 60;

function lessThanThirtySecondsAgo(date, now) {
  return ((now - date) < 30 * 1000);
}

function lessThanOneMinuteAgo(date, now) {
  return ((now - date) < 60 * 1000);
}

function lessThanOneHourAgo(date, now) {
  return ((now - date) < (60 * 60 * 1000));
}

function lessThanOneDayAgo(date, now) {
  return ((now - date) < (24 * 60 * 60 * 1000));
}

function thisYear(date, now) {
  return date.getFullYear() === now.getFullYear();
}

function delta(date, now) {
  return Math.round((now - date) / 1000);
}

function nSec(date, now) {
  return '{} secs'.replace('{}', Math.floor(delta(date, now)));
}

function nMin(date, now) {
  var n = Math.floor(delta(date, now) / minute);
  var template = '{} min';

  if (n > 1) {
    template = template + 's';
  }

  return template.replace('{}', n);
}

function nHr(date, now) {
  var n = Math.floor(delta(date, now) / hour);
  var template = '{} hr';

  if (n > 1) {
    template = template + 's';
  }

  return template.replace('{}', n);
}

// Cached DateTimeFormat instances,
// because instantiating a DateTimeFormat is expensive.
var formatters = {};

/**
 * Efficiently return `date` formatted with `options`.
 *
 * This is a wrapper for Intl.DateTimeFormat.format() that caches
 * DateTimeFormat instances because they're expensive to create.
 * Calling Date.toLocaleDateString() lots of times is also expensive in some
 * browsers as it appears to create a new formatter for each call.
 *
 * @returns {string}
 *
 */
function format(date, options, Intl) {
  // If the tests have passed in a mock Intl then use it, otherwise use the
  // real one.
  if (typeof Intl === 'undefined') {
    Intl = window.Intl;
  }

  if (Intl && Intl.DateTimeFormat) {
    var key = JSON.stringify(options);
    var formatter = formatters[key];

    if (!formatter) {
      formatter = formatters[key] = new Intl.DateTimeFormat(undefined,
                                                            options);
    }

    return formatter.format(date);
  } else {
    // IE < 11, Safari <= 9.0.
    return date.toDateString();
  }
}

function dayAndMonth(date, now, Intl) {
  return format(date, {month: 'short', day: 'numeric'}, Intl);
}

function dayAndMonthAndYear(date, now, Intl) {
  return format(date, {day: 'numeric', month: 'short', year: 'numeric'}, Intl);
}

var BREAKPOINTS = [
  {
    test: lessThanThirtySecondsAgo,
    format: function () {return 'Just now';},
    nextUpdate: 1,
  },
  {
    test: lessThanOneMinuteAgo,
    format: nSec,
    nextUpdate: 1,
  },
  {
    test: lessThanOneHourAgo,
    format: nMin,
    nextUpdate: minute,
  },
  {
    test: lessThanOneDayAgo,
    format: nHr,
    nextUpdate: hour,
  },
  {
    test: thisYear,
    format: dayAndMonth,
    nextUpdate: null,
  },
  {
    test: function () {return true;},
    format: dayAndMonthAndYear,
    nextUpdate: null,
  },
];

function getBreakpoint(date, now) {

  // Turn the given ISO 8601 string into a Date object.
  date = new Date(date);

  var breakpoint;
  for (var i = 0; i < BREAKPOINTS.length; i++) {
    breakpoint = BREAKPOINTS[i];
    if (breakpoint.test(date, now)) {
      return breakpoint;
    }
  }

  return null;
}

function nextFuzzyUpdate(date) {
  if (!date) {
    return null;
  }

  var secs = getBreakpoint(date, new Date()).nextUpdate;

  if (secs === null) {
    return null;
  }

  // We don't want to refresh anything more often than 5 seconds
  secs = Math.max(secs, 5);

  // setTimeout limit is MAX_INT32=(2^31-1) (in ms),
  // which is about 24.8 days. So we don't set up any timeouts
  // longer than 24 days, that is, 2073600 seconds.
  secs = Math.min(secs, 2073600);

  return secs;
}

/**
 * Starts an interval whose frequency decays depending on the relative
 * age of 'date'.
 *
 * This can be used to refresh parts of a UI whose
 * update frequency depends on the age of a timestamp.
 *
 * @return {Function} A function that cancels the automatic refresh.
 */
function decayingInterval(date, callback) {
  var timer;
  var update = function () {
    var fuzzyUpdate = nextFuzzyUpdate(date);
    if (fuzzyUpdate === null) {
      return;
    }
    var nextUpdate = (1000 * fuzzyUpdate) + 500;
    timer = setTimeout(function () {
      callback(date);
      update();
    }, nextUpdate);
  };
  update();

  return function () {
    clearTimeout(timer);
  };
}

/**
 * Formats a date as a string relative to the current date.
 *
 * @param {number} date - The absolute timestamp to format.
 * @return {string} A 'fuzzy' string describing the relative age of the date.
 */
function toFuzzyString(date, Intl) {
  if (!date) {
    return '';
  }
  var now = new Date();

  return getBreakpoint(date, now).format(new Date(date), now, Intl);
}

module.exports = {
  decayingInterval: decayingInterval,
  nextFuzzyUpdate: nextFuzzyUpdate,
  toFuzzyString: toFuzzyString,
};

},{}],88:[function(require,module,exports){
'use strict';

/**
 * uiConstants is a set of globally used constants across the application.
 */

module.exports = {
  TAB_ANNOTATIONS: 'annotation',
  TAB_NOTES: 'note',
  TAB_ORPHANS: 'orphan',
};

},{}],89:[function(require,module,exports){
var COMBINING_MARKS, unorm;

unorm = require('unorm');

COMBINING_MARKS = /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C01-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C82\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D02\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u192B\u1930-\u193B\u19B0-\u19C0\u19C8\u19C9\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1DC0-\u1DE6\u1DFC-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]/g;

module.exports = function() {
  return {
    normalize: function(str) {
      return unorm.nfkd(str);
    },
    fold: function(str) {
      return str.replace(COMBINING_MARKS, '');
    }
  };
};


},{"unorm":"unorm"}],90:[function(require,module,exports){
'use strict';

/**
 * Return the number of elements in `ary` for which `predicate` returns true.
 *
 * @param {Array} ary
 * @param {Function} predicate
 */
function countIf(ary, predicate) {
  return ary.reduce(function (count, item) {
    return predicate(item) ? count + 1 : count;
  }, 0);
}

/**
 * Create a new array with the result of calling `mapFn` on every element in
 * `ary`.
 *
 * Only truthy values are included in the resulting array.
 *
 * @param {Array} ary
 * @param {Function} mapFn
 */
function filterMap(ary, mapFn) {
  return ary.reduce(function (newArray, item) {
    var mapped = mapFn(item);
    if (mapped) {
      newArray.push(mapped);
    }
    return newArray;
  }, []);
}

module.exports = {
  countIf: countIf,
  filterMap: filterMap,
};

},{}],91:[function(require,module,exports){
'use strict';

/**
 * A simple memoization function which caches the last result of
 * a single-argument function.
 *
 * The argument to the input function may be of any type and is compared
 * using reference equality.
 */
function memoize(fn) {
  if (fn.length !== 1) {
    throw new Error('Memoize input must be a function of one argument');
  }

  var lastArg;
  var lastResult;

  return function (arg) {
    if (arg === lastArg) {
      return lastResult;
    }
    lastArg = arg;
    lastResult = fn(arg);
    return lastResult;
  };
}

module.exports = memoize;

},{}],92:[function(require,module,exports){
'use strict';

/**
 * Sets a timeout which is linked to the lifetime of an Angular scope.
 *
 * When the scope is destroyed, the timeout will be cleared if it has
 * not already fired.
 *
 * The callback is not invoked within a $scope.$apply() context. It is up
 * to the caller to do that if necessary.
 *
 * @param {Scope} $scope - An Angular scope
 * @param {Function} fn - Callback to invoke with setTimeout
 * @param {number} delay - Delay argument to pass to setTimeout
 */
module.exports = function ($scope, fn, delay, setTimeoutFn, clearTimeoutFn) {
  setTimeoutFn = setTimeoutFn || setTimeout;
  clearTimeoutFn = clearTimeoutFn || clearTimeout;

  var removeDestroyHandler;
  var id = setTimeoutFn(function () {
    removeDestroyHandler();
    fn();
  }, delay);
  removeDestroyHandler = $scope.$on('$destroy', function () {
    clearTimeoutFn(id);
  });
};

},{}],93:[function(require,module,exports){
'use strict';

/**
 * Replace parameters in a URL template with values from a `params` object.
 *
 * Returns an object containing the expanded URL and a dictionary of unused
 * parameters.
 *
 *   replaceURLParams('/things/:id', {id: 'foo', q: 'bar'}) =>
 *     {url: '/things/foo', params: {q: 'bar'}}
 */
function replaceURLParams(url, params) {
  var unusedParams = {};
  for (var param in params) {
    if (params.hasOwnProperty(param)) {
      var value = params[param];
      var urlParam = ':' + param;
      if (url.indexOf(urlParam) !== -1) {
        url = url.replace(urlParam, encodeURIComponent(value));
      } else {
        unusedParams[param] = value;
      }
    }
  }
  return {url: url, params: unusedParams};
}

module.exports = {
  replaceURLParams: replaceURLParams,
};

},{}],94:[function(require,module,exports){
/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.13.4 - 2015-09-03
 * License: MIT
 */
angular.module("ui.bootstrap", ["ui.bootstrap.tpls","ui.bootstrap.dropdown","ui.bootstrap.position"]);
angular.module("ui.bootstrap.tpls", []);
angular.module('ui.bootstrap.dropdown', ['ui.bootstrap.position'])

.constant('dropdownConfig', {
  openClass: 'open'
})

.service('dropdownService', ['$document', '$rootScope', function($document, $rootScope) {
  var openScope = null;

  this.open = function(dropdownScope) {
    if (!openScope) {
      $document.bind('click', closeDropdown);
      $document.bind('keydown', keybindFilter);
    }

    if (openScope && openScope !== dropdownScope) {
      openScope.isOpen = false;
    }

    openScope = dropdownScope;
  };

  this.close = function(dropdownScope) {
    if (openScope === dropdownScope) {
      openScope = null;
      $document.unbind('click', closeDropdown);
      $document.unbind('keydown', keybindFilter);
    }
  };

  var closeDropdown = function(evt) {
    // This method may still be called during the same mouse event that
    // unbound this event handler. So check openScope before proceeding.
    if (!openScope) { return; }

    if (evt && openScope.getAutoClose() === 'disabled')  { return ; }

    var toggleElement = openScope.getToggleElement();
    if (evt && toggleElement && toggleElement[0].contains(evt.target)) {
      return;
    }

    var dropdownElement = openScope.getDropdownElement();
    if (evt && openScope.getAutoClose() === 'outsideClick' &&
      dropdownElement && dropdownElement[0].contains(evt.target)) {
      return;
    }

    openScope.isOpen = false;

    if (!$rootScope.$$phase) {
      openScope.$apply();
    }
  };

  var keybindFilter = function(evt) {
    if (evt.which === 27) {
      openScope.focusToggleElement();
      closeDropdown();
    } else if (openScope.isKeynavEnabled() && /(38|40)/.test(evt.which) && openScope.isOpen) {
      evt.preventDefault();
      evt.stopPropagation();
      openScope.focusDropdownEntry(evt.which);
    }
  };
}])

.controller('DropdownController', ['$scope', '$attrs', '$parse', 'dropdownConfig', 'dropdownService', '$animate', '$position', '$document', '$compile', '$templateRequest', function($scope, $attrs, $parse, dropdownConfig, dropdownService, $animate, $position, $document, $compile, $templateRequest) {
  var self = this,
    scope = $scope.$new(), // create a child scope so we are not polluting original one
    templateScope,
    openClass = dropdownConfig.openClass,
    getIsOpen,
    setIsOpen = angular.noop,
    toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop,
    appendToBody = false,
    keynavEnabled = false,
    selectedOption = null,
    body = $document.find('body');

  this.init = function(element) {
    self.$element = element;

    if ($attrs.isOpen) {
      getIsOpen = $parse($attrs.isOpen);
      setIsOpen = getIsOpen.assign;

      $scope.$watch(getIsOpen, function(value) {
        scope.isOpen = !!value;
      });
    }

    appendToBody = angular.isDefined($attrs.dropdownAppendToBody);
    keynavEnabled = angular.isDefined($attrs.keyboardNav);

    if (appendToBody && self.dropdownMenu) {
      body.append(self.dropdownMenu);
      body.addClass('dropdown');
      element.on('$destroy', function handleDestroyEvent() {
        self.dropdownMenu.remove();
      });
    }
  };

  this.toggle = function(open) {
    return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
  };

  // Allow other directives to watch status
  this.isOpen = function() {
    return scope.isOpen;
  };

  scope.getToggleElement = function() {
    return self.toggleElement;
  };

  scope.getAutoClose = function() {
    return $attrs.autoClose || 'always'; //or 'outsideClick' or 'disabled'
  };

  scope.getElement = function() {
    return self.$element;
  };

  scope.isKeynavEnabled = function() {
    return keynavEnabled;
  };

  scope.focusDropdownEntry = function(keyCode) {
    var elems = self.dropdownMenu ? //If append to body is used.
      (angular.element(self.dropdownMenu).find('a')) :
      (angular.element(self.$element).find('ul').eq(0).find('a'));

    switch (keyCode) {
      case (40): {
        if (!angular.isNumber(self.selectedOption)) {
          self.selectedOption = 0;
        } else {
          self.selectedOption = (self.selectedOption === elems.length -1 ?
            self.selectedOption :
            self.selectedOption + 1);
        }
        break;
      }
      case (38): {
        if (!angular.isNumber(self.selectedOption)) {
          self.selectedOption = elems.length - 1;
        } else {
          self.selectedOption = self.selectedOption === 0 ?
            0 : self.selectedOption - 1;
        }
        break;
      }
    }
    elems[self.selectedOption].focus();
  };

  scope.getDropdownElement = function() {
    return self.dropdownMenu;
  };

  scope.focusToggleElement = function() {
    if (self.toggleElement) {
      self.toggleElement[0].focus();
    }
  };

  scope.$watch('isOpen', function(isOpen, wasOpen) {
    if (appendToBody && self.dropdownMenu) {
      var pos = $position.positionElements(self.$element, self.dropdownMenu, 'bottom-left', true);
      var css = {
        top: pos.top + 'px',
        display: isOpen ? 'block' : 'none'
      };

      var rightalign = self.dropdownMenu.hasClass('dropdown-menu-right');
      if (!rightalign) {
        css.left = pos.left + 'px';
        css.right = 'auto';
      } else {
        css.left = 'auto';
        css.right = (window.innerWidth - (pos.left + self.$element.prop('offsetWidth'))) + 'px';
      }

      self.dropdownMenu.css(css);
    }

    var openContainer = appendToBody ? body : self.$element;

    $animate[isOpen ? 'addClass' : 'removeClass'](openContainer, openClass).then(function() {
      if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
        toggleInvoker($scope, { open: !!isOpen });
      }
    });

    if (isOpen) {
      if (self.dropdownMenuTemplateUrl) {
        $templateRequest(self.dropdownMenuTemplateUrl).then(function(tplContent) {
          templateScope = scope.$new();
          $compile(tplContent.trim())(templateScope, function(dropdownElement) {
            var newEl = dropdownElement;
            self.dropdownMenu.replaceWith(newEl);
            self.dropdownMenu = newEl;
          });
        });
      }

      scope.focusToggleElement();
      dropdownService.open(scope);
    } else {
      if (self.dropdownMenuTemplateUrl) {
        if (templateScope) {
          templateScope.$destroy();
        }
        var newEl = angular.element('<ul class="dropdown-menu"></ul>');
        self.dropdownMenu.replaceWith(newEl);
        self.dropdownMenu = newEl;
      }

      dropdownService.close(scope);
      self.selectedOption = null;
    }

    if (angular.isFunction(setIsOpen)) {
      setIsOpen($scope, isOpen);
    }
  });

  $scope.$on('$locationChangeSuccess', function() {
    if (scope.getAutoClose() !== 'disabled') {
      scope.isOpen = false;
    }
  });

  var offDestroy = $scope.$on('$destroy', function() {
    scope.$destroy();
  });
  scope.$on('$destroy', offDestroy);
}])

.directive('dropdown', function() {
  return {
    controller: 'DropdownController',
    link: function(scope, element, attrs, dropdownCtrl) {
      dropdownCtrl.init( element );
      element.addClass('dropdown');
    }
  };
})

.directive('dropdownMenu', function() {
  return {
    restrict: 'AC',
    require: '?^dropdown',
    link: function(scope, element, attrs, dropdownCtrl) {
      if (!dropdownCtrl) {
        return;
      }
      var tplUrl = attrs.templateUrl;
      if (tplUrl) {
        dropdownCtrl.dropdownMenuTemplateUrl = tplUrl;
      }
      if (!dropdownCtrl.dropdownMenu) {
        dropdownCtrl.dropdownMenu = element;
      }
    }
  };
})

.directive('keyboardNav', function() {
  return {
    restrict: 'A',
    require: '?^dropdown',
    link: function (scope, element, attrs, dropdownCtrl) {

      element.bind('keydown', function(e) {
        if ([38, 40].indexOf(e.which) !== -1) {
          e.preventDefault();
          e.stopPropagation();

          var elems = dropdownCtrl.dropdownMenu.find('a');

          switch (e.which) {
            case (40): { // Down
              if (!angular.isNumber(dropdownCtrl.selectedOption)) {
                dropdownCtrl.selectedOption = 0;
              } else {
                dropdownCtrl.selectedOption = dropdownCtrl.selectedOption === elems.length -1 ?
                  dropdownCtrl.selectedOption : dropdownCtrl.selectedOption + 1;
              }
              break;
            }
            case (38): { // Up
              if (!angular.isNumber(dropdownCtrl.selectedOption)) {
                dropdownCtrl.selectedOption = elems.length - 1;
              } else {
                dropdownCtrl.selectedOption = dropdownCtrl.selectedOption === 0 ?
                  0 : dropdownCtrl.selectedOption - 1;
              }
              break;
            }
          }
          elems[dropdownCtrl.selectedOption].focus();
        }
      });
    }
  };
})

.directive('dropdownToggle', function() {
  return {
    require: '?^dropdown',
    link: function(scope, element, attrs, dropdownCtrl) {
      if (!dropdownCtrl) {
        return;
      }

      element.addClass('dropdown-toggle');

      dropdownCtrl.toggleElement = element;

      var toggleDropdown = function(event) {
        event.preventDefault();

        if (!element.hasClass('disabled') && !attrs.disabled) {
          scope.$apply(function() {
            dropdownCtrl.toggle();
          });
        }
      };

      element.bind('click', toggleDropdown);

      // WAI-ARIA
      element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
      scope.$watch(dropdownCtrl.isOpen, function( isOpen ) {
        element.attr('aria-expanded', !!isOpen);
      });

      scope.$on('$destroy', function() {
        element.unbind('click', toggleDropdown);
      });
    }
  };
});

angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function($document, $window) {
    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function(element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function(element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function(element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },

      /**
       * Provides coordinates for the targetEl in relation to hostEl
       */
      positionElements: function(hostEl, targetEl, positionStr, appendToBody) {
        var positionStrParts = positionStr.split('-');
        var pos0 = positionStrParts[0], pos1 = positionStrParts[1] || 'center';

        var hostElPos,
          targetElWidth,
          targetElHeight,
          targetElPos;

        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');

        var shiftWidth = {
          center: function() {
            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
          },
          left: function() {
            return hostElPos.left;
          },
          right: function() {
            return hostElPos.left + hostElPos.width;
          }
        };

        var shiftHeight = {
          center: function() {
            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
          },
          top: function() {
            return hostElPos.top;
          },
          bottom: function() {
            return hostElPos.top + hostElPos.height;
          }
        };

        switch (pos0) {
          case 'right':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: shiftWidth[pos0]()
            };
            break;
          case 'left':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: hostElPos.left - targetElWidth
            };
            break;
          case 'bottom':
            targetElPos = {
              top: shiftHeight[pos0](),
              left: shiftWidth[pos1]()
            };
            break;
          default:
            targetElPos = {
              top: hostElPos.top - targetElHeight,
              left: shiftWidth[pos1]()
            };
            break;
        }

        return targetElPos;
      }
    };
  }]);


},{}],95:[function(require,module,exports){
var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

module.exports = [
  'unicode', function(unicode) {
    var _arrayMatches, _checkMatch, _matches, _normalize;
    _normalize = function(e) {
      var normed;
      if (typeof e === 'string') {
        normed = unicode.normalize(e);
        return unicode.fold(normed);
      } else {
        return e;
      }
    };
    _matches = function(filter, value, match) {
      var i, len, matches, ref, term;
      matches = true;
      ref = filter.terms;
      for (i = 0, len = ref.length; i < len; i++) {
        term = ref[i];
        if (!match(term, value)) {
          matches = false;
          if (filter.operator === 'and') {
            break;
          }
        } else {
          matches = true;
          if (filter.operator === 'or') {
            break;
          }
        }
      }
      return matches;
    };
    _arrayMatches = function(filter, value, match) {
      var copy, matches;
      matches = true;
      copy = filter.terms.slice();
      copy = copy.filter(function(e) {
        return match(value, e);
      });
      if ((filter.operator === 'and' && copy.length < filter.terms.length) || (filter.operator === 'or' && !copy.length)) {
        matches = false;
      }
      return matches;
    };
    _checkMatch = function(filter, annotation, checker) {
      var autofalsefn, value;
      autofalsefn = checker.autofalse;
      if ((autofalsefn != null) && autofalsefn(annotation)) {
        return false;
      }
      value = checker.value(annotation);
      if (angular.isArray(value)) {
        value = value.map(function(e) {
          return e.toLowerCase();
        });
        value = value.map((function(_this) {
          return function(e) {
            return _normalize(e);
          };
        })(this));
        return _arrayMatches(filter, value, checker.match);
      } else {
        value = value.toLowerCase();
        value = _normalize(value);
        return _matches(filter, value, checker.match);
      }
    };
    return {
      fields: {
        quote: {
          autofalse: function(annotation) {
            return annotation.references != null;
          },
          value: function(annotation) {
            var quotes, ref, s, t;
            quotes = (function() {
              var i, len, ref, results;
              ref = annotation.target || [];
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                t = ref[i];
                results.push((function() {
                  var j, len1, ref1, results1;
                  ref1 = t.selector || [];
                  results1 = [];
                  for (j = 0, len1 = ref1.length; j < len1; j++) {
                    s = ref1[j];
                    if (!(s.type === 'TextQuoteSelector')) {
                      continue;
                    }
                    if (!s.exact) {
                      continue;
                    }
                    results1.push(s.exact);
                  }
                  return results1;
                })());
              }
              return results;
            })();
            quotes = (ref = Array.prototype).concat.apply(ref, quotes);
            return quotes.join('\n');
          },
          match: function(term, value) {
            return value.indexOf(term) > -1;
          }
        },
        since: {
          autofalse: function(annotation) {
            return annotation.updated == null;
          },
          value: function(annotation) {
            return annotation.updated;
          },
          match: function(term, value) {
            var delta;
            delta = Math.round((+(new Date) - new Date(value)) / 1000);
            return delta <= term;
          }
        },
        tag: {
          autofalse: function(annotation) {
            return annotation.tags == null;
          },
          value: function(annotation) {
            return annotation.tags;
          },
          match: function(term, value) {
            return indexOf.call(term, value) >= 0;
          }
        },
        text: {
          autofalse: function(annotation) {
            return annotation.text == null;
          },
          value: function(annotation) {
            return annotation.text;
          },
          match: function(term, value) {
            return value.indexOf(term) > -1;
          }
        },
        uri: {
          autofalse: function(annotation) {
            return annotation.uri == null;
          },
          value: function(annotation) {
            return annotation.uri;
          },
          match: function(term, value) {
            return value.indexOf(term) > -1;
          }
        },
        user: {
          autofalse: function(annotation) {
            return annotation.user == null;
          },
          value: function(annotation) {
            return annotation.user;
          },
          match: function(term, value) {
            return value.indexOf(term) > -1;
          }
        },
        any: {
          fields: ['quote', 'text', 'tag', 'user']
        }
      },
      filter: function(annotations, filters) {
        var _, annotation, category, categoryMatch, count, field, filter, i, j, k, len, len1, len2, limit, match, ref, ref1, ref2, results, term, termFilter;
        limit = Math.min.apply(Math, ((ref = filters.result) != null ? ref.terms : void 0) || []);
        count = 0;
        for (_ in filters) {
          filter = filters[_];
          if (filter.terms) {
            filter.terms = filter.terms.map((function(_this) {
              return function(e) {
                e = e.toLowerCase();
                e = _normalize(e);
                return e;
              };
            })(this));
          }
        }
        results = [];
        for (i = 0, len = annotations.length; i < len; i++) {
          annotation = annotations[i];
          if (count >= limit) {
            break;
          }
          match = true;
          for (category in filters) {
            filter = filters[category];
            if (!match) {
              break;
            }
            if (!filter.terms.length) {
              continue;
            }
            switch (category) {
              case 'any':
                categoryMatch = false;
                ref1 = this.fields.any.fields;
                for (j = 0, len1 = ref1.length; j < len1; j++) {
                  field = ref1[j];
                  ref2 = filter.terms;
                  for (k = 0, len2 = ref2.length; k < len2; k++) {
                    term = ref2[k];
                    termFilter = {
                      terms: [term],
                      operator: "and"
                    };
                    if (_checkMatch(termFilter, annotation, this.fields[field])) {
                      categoryMatch = true;
                      break;
                    }
                  }
                }
                match = categoryMatch;
                break;
              default:
                match = _checkMatch(filter, annotation, this.fields[category]);
            }
          }
          if (!match) {
            continue;
          }
          count++;
          results.push(annotation.id);
        }
        return results;
      }
    };
  }
];


},{}],96:[function(require,module,exports){
'use strict';

var EventEmitter = require('tiny-emitter');
var debounce = require('lodash.debounce');
var inherits = require('inherits');

/**
 * VirtualThreadList is a helper for virtualizing the annotation thread list.
 *
 * 'Virtualizing' the thread list improves UI performance by only creating
 * annotation cards for annotations which are either in or near the viewport.
 *
 * Reducing the number of annotation cards that are actually created optimizes
 * the initial population of the list, since annotation cards are big components
 * that are expensive to create and consume a lot of memory. For Angular
 * applications this also helps significantly with UI responsiveness by limiting
 * the number of watchers (functions created by template expressions or
 * '$scope.$watch' calls) that have to be run on every '$scope.$digest()' cycle.
 *
 * @param {Window} container - The Window displaying the list of annotation threads.
 * @param {Thread} rootThread - The initial Thread object for the top-level
 *        threads.
 */
function VirtualThreadList($scope, window_, rootThread) {
  var self = this;

  this._rootThread = rootThread;

  // Cache of thread ID -> last-seen height
  this._heights = {};

  this.window = window_;

  var debouncedUpdate = debounce(function () {
    self._updateVisibleThreads();
    $scope.$digest();
  }, 20);
  this.window.addEventListener('scroll', debouncedUpdate);
  this.window.addEventListener('resize', debouncedUpdate);

  this._detach = function () {
    this.window.removeEventListener('scroll', debouncedUpdate);
    this.window.removeEventListener('resize', debouncedUpdate);
  };
}
inherits(VirtualThreadList, EventEmitter);

/**
 * Detach event listeners and clear any pending timeouts.
 *
 * This should be invoked when the UI view presenting the virtual thread list
 * is torn down.
 */
VirtualThreadList.prototype.detach = function () {
  this._detach();
};

/**
 * Sets the root thread containing all conversations matching the current
 * filters.
 *
 * This should be called with the current Thread object whenever the set of
 * matching annotations changes.
 */
VirtualThreadList.prototype.setRootThread = function (thread) {
  if (thread === this._rootThread) {
    return;
  }
  this._rootThread = thread;
  this._updateVisibleThreads();
};

/**
 * Sets the actual height for a thread.
 *
 * When calculating the amount of space required for offscreen threads,
 * the actual or 'last-seen' height is used if known. Otherwise an estimate
 * is used.
 *
 * @param {string} id - The annotation ID or $$tag
 * @param {number} height - The height of the annotation thread.
 */
VirtualThreadList.prototype.setThreadHeight = function (id, height) {
  if (isNaN(height) || height <= 0) {
    throw new Error('Invalid thread height %d', height);
  }
  this._heights[id] = height;
};

VirtualThreadList.prototype._height = function (id) {
  // Default guess of the height required for a threads that have not been
  // measured
  var DEFAULT_HEIGHT = 200;
  return this._heights[id] || DEFAULT_HEIGHT;
};

/** Return the vertical offset of an annotation card from the top of the list. */
VirtualThreadList.prototype.yOffsetOf = function (id) {
  var self = this;
  var allThreads = this._rootThread.children;
  var matchIndex = allThreads.findIndex(function (thread) {
    return thread.id === id;
  });
  if (matchIndex === -1) {
    return 0;
  }
  return allThreads.slice(0, matchIndex).reduce(function (offset, thread) {
    return offset + self._height(thread.id);
  }, 0);
};

/**
 * Recalculates the set of visible threads and estimates of the amount of space
 * required for offscreen threads above and below the viewport.
 *
 * Emits a `changed` event with the recalculated set of visible threads.
 */
VirtualThreadList.prototype._updateVisibleThreads = function () {
  // Space above the viewport in pixels which should be considered 'on-screen'
  // when calculating the set of visible threads
  var MARGIN_ABOVE = 800;
  // Same as MARGIN_ABOVE but for the space below the viewport
  var MARGIN_BELOW = 800;

  // Estimated height in pixels of annotation cards which are below the
  // viewport and not actually created. This is used to create an empty spacer
  // element below visible cards in order to give the list's scrollbar the
  // correct dimensions.
  var offscreenLowerHeight = 0;
  // Same as offscreenLowerHeight but for cards above the viewport.
  var offscreenUpperHeight = 0;
  // List of annotations which are in or near the viewport and need to
  // actually be created.
  var visibleThreads = [];

  var allThreads = this._rootThread.children;
  var visibleHeight = this.window.innerHeight;
  var usedHeight = 0;
  var thread;

  for (var i = 0; i < allThreads.length; i++) {
    thread = allThreads[i];
    var threadHeight = this._height(thread.id);

    if (usedHeight + threadHeight < this.window.pageYOffset - MARGIN_ABOVE) {
      // Thread is above viewport
      offscreenUpperHeight += threadHeight;
    } else if (usedHeight <
      this.window.pageYOffset + visibleHeight + MARGIN_BELOW) {
      // Thread is either in or close to the viewport
      visibleThreads.push(allThreads[i]);
    } else {
      // Thread is below viewport
      offscreenLowerHeight += threadHeight;
    }

    usedHeight += threadHeight;
  }

  this.emit('changed', {
    offscreenLowerHeight: offscreenLowerHeight,
    offscreenUpperHeight: offscreenUpperHeight,
    visibleThreads: visibleThreads,
  });
};

module.exports = VirtualThreadList;

},{"inherits":127,"lodash.debounce":130,"tiny-emitter":158}],97:[function(require,module,exports){
'use strict';

var retry = require('retry');
var EventEmitter = require('tiny-emitter');
var inherits = require('inherits');

// see https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
var CLOSE_NORMAL = 1000;

// Minimum delay, in ms, before reconnecting after an abnormal connection close.
var RECONNECT_MIN_DELAY = 1000;

/**
 * Socket is a minimal wrapper around WebSocket which provides:
 *
 * - Automatic reconnection in the event of an abnormal close
 * - Queuing of messages passed to send() whilst the socket is
 *   connecting
 * - Uses the standard EventEmitter API for reporting open, close, error
 *   and message events.
 */
function Socket(url) {
  var self = this;

  // queue of JSON objects which have not yet been submitted
  var messageQueue = [];

  // the current WebSocket instance
  var socket;

  // a pending operation to connect a WebSocket
  var operation;

  function sendMessages() {
    while (messageQueue.length > 0) {
      var messageString = JSON.stringify(messageQueue.shift());
      socket.send(messageString);
    }
  }

  // Connect the websocket immediately. If a connection attempt is already in
  // progress, do nothing.
  function connect() {
    if (operation) {
      return;
    }

    operation = retry.operation({
      minTimeout: RECONNECT_MIN_DELAY * 2,
      // Don't retry forever -- fail permanently after 10 retries
      retries: 10,
      // Randomize retry times to minimise the thundering herd effect
      randomize: true,
    });

    operation.attempt(function () {
      socket = new WebSocket(url);
      socket.onopen = function (event) {
        onOpen();
        self.emit('open', event);
      };
      socket.onclose = function (event) {
        if (event.code === CLOSE_NORMAL) {
          self.emit('close', event);
          return;
        }
        var err = new Error('WebSocket closed abnormally, code: ' + event.code);
        console.warn(err);
        onAbnormalClose(err);
      };
      socket.onerror = function (event) {
        self.emit('error', event);
      };
      socket.onmessage = function (event) {
        self.emit('message', event);
      };
    });
  }

  // onOpen is called when a websocket connection is successfully established.
  function onOpen() {
    operation = null;
    sendMessages();
  }

  // onAbnormalClose is called when a websocket connection closes abnormally.
  // This may be the result of a failure to connect, or an abnormal close after
  // a previous successful connection.
  function onAbnormalClose(error) {
    // If we're already in a reconnection loop, trigger a retry...
    if (operation) {
      if (!operation.retry(error)) {
        console.error('reached max retries attempting to reconnect websocket');
      }
      return;
    }
    // ...otherwise reconnect the websocket after a short delay.
    var delay = RECONNECT_MIN_DELAY;
    delay += Math.floor(Math.random() * delay);
    operation = setTimeout(function () {
      operation = null;
      connect();
    }, delay);
  }

  /** Close the underlying WebSocket connection */
  this.close = function () {
    socket.close();
  };

  /**
   * Send a JSON object via the WebSocket connection, or queue it
   * for later delivery if not currently connected.
   */
  this.send = function (message) {
    messageQueue.push(message);
    if (this.isConnected()) {
      sendMessages();
    }
  };

  /** Returns true if the WebSocket is currently connected. */
  this.isConnected = function () {
    return socket.readyState === WebSocket.OPEN;
  };

  connect();
}

inherits(Socket, EventEmitter);

module.exports = Socket;

},{"inherits":127,"retry":150,"tiny-emitter":158}],98:[function(require,module,exports){
'use strict';

var SearchClient = require('./search-client');
var events = require('./events');
var memoize = require('./util/memoize');
var metadata = require('./annotation-metadata');
var tabCounts = require('./tab-counts');
var uiConstants = require('./ui-constants');

function firstKey(object) {
  for (var k in object) {
    if (!object.hasOwnProperty(k)) {
      continue;
    }
    return k;
  }
  return null;
}

/**
 * Returns the group ID of the first annotation in `results` whose
 * ID is a key in `selection`.
 */
function groupIDFromSelection(selection, results) {
  var id = firstKey(selection);
  var annot = results.find(function (annot) {
    return annot.id === id;
  });
  if (!annot) {
    return null;
  }
  return annot.group;
}

// @ngInject
module.exports = function WidgetController(
  $scope, annotationUI, crossframe, annotationMapper, drafts,
  features, groups, rootThread, settings, streamer, streamFilter, store
) {
  function thread() {
    return rootThread.thread(annotationUI.getState());
  }

  var unsubscribeAnnotationUI = annotationUI.subscribe(function () {
    var state = annotationUI.getState();

    $scope.rootThread = thread();
    $scope.selectedTab = state.selectedTab;

    var counts = tabCounts(state.annotations, {
      separateOrphans: features.flagEnabled('orphans_tab'),
    });

    Object.assign($scope, {
      totalNotes: counts.notes,
      totalAnnotations: counts.annotations,
      totalOrphans: counts.orphans,
      waitingToAnchorAnnotations: counts.anchoring > 0,
    });
  });

  $scope.$on('$destroy', unsubscribeAnnotationUI);

  function focusAnnotation(annotation) {
    var highlights = [];
    if (annotation) {
      highlights = [annotation.$$tag];
    }
    crossframe.call('focusAnnotations', highlights);
  }

  function scrollToAnnotation(annotation) {
    if (!annotation) {
      return;
    }
    crossframe.call('scrollToAnnotation', annotation.$$tag);
  }

  /** Returns the annotation type - note or annotation of the first annotation
   *  in `results` whose ID is a key in `selectedAnnotationMap`.
   */
  function tabContainingAnnotation(annot) {
    if (metadata.isOrphan(annot)) {
      if (features.flagEnabled('orphans_tab')) {
        return uiConstants.TAB_ORPHANS;
      } else {
        return uiConstants.TAB_ANNOTATIONS;
      }
    } else if (metadata.isPageNote(annot)) {
      return uiConstants.TAB_NOTES;
    } else {
      return uiConstants.TAB_ANNOTATIONS;
    }
  }

  /**
   * Returns the Annotation object for the first annotation in the
   * selected annotation set. Note that 'first' refers to the order
   * of annotations passed to annotationUI when selecting annotations,
   * not the order in which they appear in the document.
   */
  function firstSelectedAnnotation() {
    if (annotationUI.getState().selectedAnnotationMap) {
      var id = Object.keys(annotationUI.getState().selectedAnnotationMap)[0];
      return annotationUI.getState().annotations.find(function (annot) {
        return annot.id === id;
      });
    } else {
      return null;
    }
  }

  var searchClients = [];

  function _resetAnnotations() {
    annotationMapper.unloadAnnotations(annotationUI.savedAnnotations());
  }

  function _loadAnnotationsFor(uris, group) {
    var searchClient = new SearchClient(store.search, {
      // If no group is specified, we are fetching annotations from
      // all groups in order to find out which group contains the selected
      // annotation, therefore we need to load all chunks before processing
      // the results
      incremental: !!group,
    });
    searchClients.push(searchClient);
    searchClient.on('results', function (results) {
      if (annotationUI.hasSelectedAnnotations()) {
        // Focus the group containing the selected annotation and filter
        // annotations to those from this group
        var groupID = groupIDFromSelection(
          annotationUI.getState().selectedAnnotationMap, results);
        if (!groupID) {
          // If the selected annotation is not available, fall back to
          // loading annotations for the currently focused group
          groupID = groups.focused().id;
        }
        results = results.filter(function (result) {
          return result.group === groupID;
        });
        groups.focus(groupID);
      }

      if (results.length) {
        annotationMapper.loadAnnotations(results);
      }
    });
    searchClient.on('end', function () {
      // Remove client from list of active search clients.
      //
      // $evalAsync is required here because search results are emitted
      // asynchronously. A better solution would be that the loading state is
      // tracked as part of the app state.
      $scope.$evalAsync(function () {
        searchClients.splice(searchClients.indexOf(searchClient), 1);
      });
    });
    searchClient.get({uri: uris, group: group});
  }

  function isLoading() {
    if (!crossframe.frames.some(function (frame) { return frame.uri; })) {
      // The document's URL isn't known so the document must still be loading.
      return true;
    }

    if (searchClients.length > 0) {
      // We're still waiting for annotation search results from the API.
      return true;
    }

    return false;
  }

  /**
   * Load annotations for all URLs associated with `frames`.
   *
   * @param {Array<{uri:string}>} frames - Hypothesis client frames
   *        to load annotations for.
   */
  function loadAnnotations(frames, reset) {
    if (reset || typeof reset === 'undefined') {
      _resetAnnotations();
    }

    searchClients.forEach(function (client) {
      client.cancel();
    });

    var searchUris = frames.reduce(function (uris, frame) {
      for (var i = 0; i < frame.searchUris.length; i++) {
        var uri = frame.searchUris[i];
        if (uris.indexOf(uri) === -1) {
          uris.push(uri);
        }
      }
      return uris;
    }, []);

    // If there is no selection, load annotations only for the focused group.
    //
    // If there is a selection, we load annotations for all groups, find out
    // which group the first selected annotation is in and then filter the
    // results on the client by that group.
    //
    // In the common case where the total number of annotations on
    // a page that are visible to the user is not greater than
    // the batch size, this saves an extra roundtrip to the server
    // to fetch the selected annotation in order to determine which group
    // it is in before fetching the remaining annotations.
    var group = annotationUI.hasSelectedAnnotations() ?
      null : groups.focused().id;

    if (searchUris.length > 0) {
      _loadAnnotationsFor(searchUris, group);

      streamFilter.resetFilter().addClause('/uri', 'one_of', searchUris);
      streamer.setConfig('filter', {filter: streamFilter.getFilter()});
    }
  }

  $scope.$on('sidebarOpened', function () {
    streamer.connect();
  });

  // If the user is logged in, we connect nevertheless
  if ($scope.auth.status === 'logged-in') {
    streamer.connect();
  }

  $scope.$on(events.USER_CHANGED, function () {
    streamer.reconnect();
  });

  $scope.$on(events.ANNOTATIONS_SYNCED, function (event, tags) {
    // When a direct-linked annotation is successfully anchored in the page,
    // focus and scroll to it
    var selectedAnnot = firstSelectedAnnotation();
    if (!selectedAnnot) {
      return;
    }
    var matchesSelection = tags.some(function (tag) {
      return tag.tag === selectedAnnot.$$tag;
    });
    if (!matchesSelection) {
      return;
    }
    focusAnnotation(selectedAnnot);
    scrollToAnnotation(selectedAnnot);

    var targetTab = tabContainingAnnotation(selectedAnnot);
    annotationUI.selectTab(targetTab);
  });

  $scope.$on(events.GROUP_FOCUSED, function () {
    // The focused group may be changed during loading annotations as a result
    // of switching to the group containing a direct-linked annotation.
    //
    // In that case, we don't want to trigger reloading annotations again.
    if (isLoading()) {
      return;
    }
    annotationUI.clearSelectedAnnotations();
    loadAnnotations(crossframe.frames);
  });

  // Watch anything that may require us to reload annotations.
  $scope.$watchCollection(function () {
    return crossframe.frames;
  }, loadAnnotations);

  $scope.setCollapsed = function (id, collapsed) {
    annotationUI.setCollapsed(id, collapsed);
  };

  $scope.forceVisible = function (thread) {
    annotationUI.setForceVisible(thread.id, true);
    if (thread.parent) {
      annotationUI.setCollapsed(thread.parent.id, false);
    }
  };

  $scope.focus = focusAnnotation;
  $scope.scrollTo = scrollToAnnotation;

  $scope.selectedAnnotationCount = function () {
    var selection = annotationUI.getState().selectedAnnotationMap;
    if (!selection) {
      return 0;
    }
    return Object.keys(selection).length;
  };

  $scope.selectedAnnotationUnavailable = function () {
    var selectedID = firstKey(annotationUI.getState().selectedAnnotationMap);
    return !isLoading() &&
           !!selectedID &&
           !annotationUI.annotationExists(selectedID);
  };

  $scope.shouldShowLoggedOutMessage = function () {
    // If user is not logged out, don't show CTA.
    if ($scope.auth.status !== 'logged-out') {
      return false;
    }

    // If user has not landed on a direct linked annotation
    // don't show the CTA.
    if (!settings.annotations) {
      return false;
    }

    // The user is logged out and has landed on a direct linked
    // annotation. If there is an annotation selection and that
    // selection is available to the user, show the CTA.
    var selectedID = firstKey(annotationUI.getState().selectedAnnotationMap);
    return !isLoading() &&
           !!selectedID &&
           annotationUI.annotationExists(selectedID);
  };

  $scope.isLoading = isLoading;

  var visibleCount = memoize(function (thread) {
    return thread.children.reduce(function (count, child) {
      return count + visibleCount(child);
    }, thread.visible ? 1 : 0);
  });

  $scope.visibleCount = function () {
    return visibleCount(thread());
  };

  $scope.topLevelThreadCount = function () {
    return thread().totalChildren;
  };
};
module.exports.$inject = ["$scope", "annotationUI", "crossframe", "annotationMapper", "drafts", "features", "groups", "rootThread", "settings", "streamer", "streamFilter", "store"];

},{"./annotation-metadata":3,"./events":52,"./search-client":76,"./tab-counts":85,"./ui-constants":88,"./util/memoize":91}],99:[function(require,module,exports){
module.exports = "<header class=\"annotation-header\" ng-if=\"!vm.user()\">\n  <strong>You must be logged in to create annotations.</strong>\n</header>\n\n<div ng-keydown=\"vm.onKeydown($event)\" ng-if=\"vm.user()\">\n  <header class=\"annotation-header\">\n    <!-- User -->\n    <span ng-if=\"vm.user()\">\n      <a class=\"annotation-header__user\"\n        target=\"_blank\"\n        ng-href=\"{{vm.serviceUrl('user',{user:vm.user()})}}\"\n        >{{vm.username()}}</a>\n      <span class=\"annotation-collapsed-replies\">\n        <a class=\"annotation-link\" href=\"\"\n          ng-click=\"vm.onReplyCountClick()\"\n          ng-pluralize count=\"vm.replyCount\"\n          when=\"{'0': '', 'one': '1 reply', 'other': '{} replies'}\"></a>\n      </span>\n      <br>\n      <span class=\"annotation-header__share-info\">\n        <a class=\"annotation-header__group\"\n          target=\"_blank\" ng-if=\"vm.group() && vm.group().url\" href=\"{{vm.group().url}}\">\n          <i class=\"h-icon-group\"></i><span class=\"annotation-header__group-name\">{{vm.group().name}}</span>\n        </a>\n        <span ng-show=\"vm.state().isPrivate\"\n          title=\"This annotation is visible only to you.\">\n          <i class=\"h-icon-lock\"></i><span class=\"annotation-header__group-name\" ng-show=\"!vm.group().url\">Only me</span>\n        </span>\n        <i class=\"h-icon-border-color\" ng-show=\"vm.isHighlight() && !vm.editing()\" title=\"This is a highlight. Click 'edit' to add a note or tag.\"></i>\n        <span ng-if=\"::vm.showDocumentInfo\">\n          <span class=\"annotation-citation\" ng-if=\"vm.documentMeta().titleLink\">\n            on \"<a ng-href=\"{{vm.documentMeta().titleLink}}\">{{vm.documentMeta().titleText}}</a>\"\n          </span>\n          <span class=\"annotation-citation\" ng-if=\"!vm.documentMeta().titleLink\">\n            on \"{{vm.documentMeta().titleText}}\"\n          </span>\n          <span class=\"annotation-citation-domain\"\n                ng-if=\"vm.documentMeta().domain\">({{vm.documentMeta().domain}})</span>\n        </span>\n      </span>\n    </span>\n\n    <span class=\"u-flex-spacer\"></span>\n\n    <timestamp\n      class-name=\"'annotation-header__timestamp'\"\n      timestamp=\"vm.updated()\"\n      href=\"vm.links().html\"\n      ng-if=\"!vm.editing() && vm.updated()\"></timestamp>\n  </header>\n\n  <!-- Excerpts -->\n  <section class=\"annotation-quote-list\"\n    ng-class=\"{'is-orphan' : vm.isOrphan()}\"\n    ng-repeat=\"target in vm.target() track by $index\"\n    ng-if=\"vm.hasQuotes()\">\n    <excerpt collapsed-height=\"35\"\n      inline-controls=\"true\"\n      overflow-hysteresis=\"20\"\n      content-data=\"selector.exact\">\n      <blockquote class=\"annotation-quote\"\n        ng-bind-html=\"selector.exact\"\n        ng-repeat=\"selector in target.selector\n          | filter : {'type': 'TextQuoteSelector'}\n          track by $index\"></blockquote>\n    </excerpt>\n  </section>\n\n  <!-- / Excerpts -->\n\n  <!-- Body -->\n  <section name=\"text\" class=\"annotation-body\">\n    <excerpt enabled=\"!vm.editing()\"\n      inline-controls=\"false\"\n      on-collapsible-changed=\"vm.setBodyCollapsible(collapsible)\"\n      collapse=\"vm.collapseBody\"\n      collapsed-height=\"400\"\n      overflow-hysteresis=\"20\"\n      content-data=\"vm.state().text\">\n      <markdown text=\"vm.state().text\"\n        on-edit-text=\"vm.setText(text)\"\n        read-only=\"!vm.editing()\">\n      </markdown>\n    </excerpt>\n  </section>\n  <!-- / Body -->\n\n  <!-- Tags -->\n  <div class=\"annotation-body form-field\" ng-if=\"vm.editing()\">\n    <tag-editor tags=\"vm.state().tags\"\n                on-edit-tags=\"vm.setTags(tags)\"></tag-editor>\n  </div>\n\n  <div class=\"annotation-body u-layout-row tags tags-read-only\"\n       ng-if=\"(vm.canCollapseBody || vm.state().tags.length) && !vm.editing()\">\n    <ul class=\"tag-list\">\n      <li class=\"tag-item\" ng-repeat=\"tag in vm.state().tags\">\n        <a ng-href=\"{{vm.tagStreamURL(tag)}}\" target=\"_blank\">{{tag}}</a>\n      </li>\n    </ul>\n    <div class=\"u-stretch\"></div>\n    <a class=\"annotation-link u-strong\" ng-show=\"vm.canCollapseBody\"\n      ng-click=\"vm.toggleCollapseBody($event)\"\n      ng-title=\"vm.collapseBody ? 'Show the full annotation text' : 'Show the first few lines only'\"\n      ng-bind=\"vm.collapseBody ? 'More' : 'Less'\"></a>\n  </div>\n  <!-- / Tags -->\n\n  <footer class=\"annotation-footer\">\n    <div class=\"annotation-form-actions\" ng-if=\"vm.editing()\">\n      <publish-annotation-btn\n        class=\"publish-annotation-btn\"\n        group=\"vm.group()\"\n        can-post=\"vm.hasContent()\"\n        is-shared=\"vm.isShared()\"\n        on-cancel=\"vm.revert()\"\n        on-save=\"vm.save()\"\n        on-set-privacy=\"vm.setPrivacy(level)\"></publish-annotation-btn>\n    </div>\n\n    <div class=\"annotation-section annotation-license\"\n      ng-show=\"vm.isShared() && vm.editing()\">\n      <a class=\"annotation-license__link\" href=\"http://creativecommons.org/publicdomain/zero/1.0/\"\n        title=\"View more information about the Creative Commons Public Domain license\"\n        target=\"_blank\">\n        <i class=\"h-icon-cc-logo\"></i><i class=\"h-icon-cc-zero\"></i>\n        Annotations can be freely reused by anyone for any purpose.\n      </a>\n    </div>\n\n    <div class=\"annotation-replies\" ng-if=\"!vm.isReply() && vm.replyCount > 0\">\n      <a href=\"\"\n        ng-click=\"vm.onReplyCountClick()\">\n        <span class=\"annotation-replies__link\">{{ vm.isCollapsed ? 'Show replies' : 'Hide replies' }}</span>\n        <span class=\"annotation-replies__count\">({{ vm.replyCount }})</span>\n      </a>\n    </div>\n\n    <div class=\"annotation-actions\" ng-if=\"vm.isSaving\">\n      Saving...\n    </div>\n\n    <div class=\"annotation-actions\" ng-if=\"!vm.isSaving && !vm.editing() && vm.id()\">\n      <div ng-show=\"vm.isSaving\">Saving…</div>\n      <button class=\"btn btn-clean annotation-action-btn\"\n        ng-show=\"vm.authorize('update') && !vm.isSaving\"\n        ng-click=\"vm.edit()\"\n        ng-disabled=\"vm.isDeleted()\"\n        aria-label=\"Edit\"\n        h-tooltip>\n        <i class=\"h-icon-annotation-edit btn-icon \"></i>\n      </button>\n      <button class=\"btn btn-clean annotation-action-btn\"\n        ng-show=\"vm.authorize('delete')\"\n        ng-click=\"vm.delete()\"\n        ng-disabled=\"vm.isDeleted()\"\n        aria-label=\"Delete\"\n        h-tooltip>\n        <i class=\"h-icon-annotation-delete btn-icon \"></i>\n      </button>\n      <button class=\"btn btn-clean annotation-action-btn\"\n        ng-click=\"vm.reply()\"\n        ng-disabled=\"vm.isDeleted()\"\n        aria-label=\"Reply\"\n        h-tooltip>\n        <i class=\"h-icon-annotation-reply btn-icon \"></i>\n      </button>\n      <span class=\"annotation-share-dialog-wrapper\">\n        <button class=\"btn btn-clean annotation-action-btn\"\n          ng-click=\"vm.showShareDialog = true\"\n          ng-disabled=\"vm.isDeleted()\"\n          aria-label=\"Share\"\n          h-tooltip>\n          <i class=\"h-icon-annotation-share btn-icon \"></i>\n        </button>\n        <annotation-share-dialog\n          group=\"vm.group()\"\n          uri=\"vm.links().incontext\"\n          is-private=\"vm.state().isPrivate\"\n          is-open=\"vm.showShareDialog\"\n          on-close=\"vm.showShareDialog = false\">\n        </annotation-share-dialog>\n      </span>\n    </div>\n  </footer>\n</div>\n";

},{}],100:[function(require,module,exports){
module.exports = "<div class=\"annotation-share-dialog\" ng-class=\"{'is-open': vm.isOpen}\">\n  <div class=\"annotation-share-dialog-target\">\n    <span class=\"annotation-share-dialog-target__label\">Share:</span>\n    <a href=\"https://twitter.com/intent/tweet?url={{vm.uri | urlEncode}}&hashtags=annotated\"\n      target=\"_blank\"\n      title=\"Tweet link\"\n      class=\"annotation-share-dialog-target__icon h-icon-twitter\"></a>\n    <a href=\"https://www.facebook.com/sharer/sharer.php?u={{vm.uri | urlEncode}}\"\n      target=\"_blank\"\n      title=\"Share on Facebook\"\n      class=\"annotation-share-dialog-target__icon h-icon-facebook\"></a>\n    <a href=\"https://plus.google.com/share?url={{vm.uri | urlEncode}}\"\n      target=\"_blank\"\n      title=\"Post on Google Plus\"\n      class=\"annotation-share-dialog-target__icon h-icon-google-plus\"></a>\n    <a href=\"mailto:?subject=Let's%20Annotate&amp;body={{vm.uri}}\"\n      title=\"Share via email\"\n      class=\"annotation-share-dialog-target__icon h-icon-mail\"></a>\n  </div>\n  <div class=\"annotation-share-dialog-link\" type=\"text\">\n    <input class=\"annotation-share-dialog-link__text\"\n      value=\"{{vm.uri}}\" readonly>\n    <span class=\"annotation-share-dialog-link__feedback\" ng-if=\"vm.copyToClipboardMessage\">\n      {{vm.copyToClipboardMessage}}\n    </span>\n    <button class=\"btn btn-clean annotation-share-dialog-link__btn\"\n      ng-click=\"vm.copyToClipboard($event)\">\n      <i class=\"h-icon-clipboard btn-icon\"></i>\n    </button>\n  </div>\n  <div class=\"annotation-share-dialog-msg\" ng-if=\"vm.group && !vm.group.public && !vm.isPrivate\">\n    <span class=\"annotation-share-dialog-msg__audience\">\n      Group.\n    </span>\n    Only group members will be able to view this annotation.\n  </div>\n  <div class=\"annotation-share-dialog-msg\" ng-if=\"vm.isPrivate\">\n    <span class=\"annotation-share-dialog-msg__audience\">\n      Only me.\n    </span>\n    No one else will be able to view this annotation.\n  </div>\n</div>\n";

},{}],101:[function(require,module,exports){
module.exports = "<div ng-class=\"vm.threadClasses()\">\n  <div class=\"annotation-thread__thread-edge\" ng-if=\"!vm.isTopLevelThread()\">\n    <a href=\"\"\n       ng-class=\"vm.threadToggleClasses()\"\n       title=\"{{vm.thread.collapsed && 'Expand' || 'Collapse'}}\"\n       ng-click=\"vm.toggleCollapsed()\">\n       <span ng-class=\"{'h-icon-arrow-right': vm.thread.collapsed,\n                        'h-icon-arrow-drop-down': !vm.thread.collapsed}\"></span>\n    </a>\n    <div class=\"annotation-thread__thread-line\"></div>\n  </div>\n  <div class=\"annotation-thread__content\">\n    <annotation ng-class=\"vm.annotationClasses()\"\n             annotation=\"vm.thread.annotation\"\n             is-collapsed=\"vm.thread.collapsed\"\n             is-last-reply=\"$last\"\n             is-sidebar=\"::vm.isSidebar\"\n             name=\"annotation\"\n             ng-mouseenter=\"vm.annotationHovered = true\"\n             ng-mouseleave=\"vm.annotationHovered = false\"\n             ng-if=\"vm.thread.annotation\"\n             ng-show=\"vm.thread.visible\"\n             show-document-info=\"vm.showDocumentInfo\"\n             on-reply-count-click=\"vm.toggleCollapsed()\"\n             reply-count=\"vm.thread.replyCount\">\n    </annotation>\n\n    <div ng-if=\"!vm.thread.annotation\" class=\"thread-deleted\">\n      <p><em>Message not available.</em></p>\n    </div>\n\n    <div ng-if=\"vm.hiddenCount() > 0\">\n      <a class=\"small\"\n         href=\"\"\n         ng-click=\"vm.showThreadAndReplies()\"\n         ng-pluralize\n         count=\"vm.hiddenCount()\"\n         when=\"{'0': '',\n               one: 'View one more in conversation',\n               other: 'View {} more in conversation'}\"\n         ></a>\n    </div>\n\n    <!-- Replies -->\n    <ul ng-show=\"!vm.thread.collapsed\">\n      <li ng-repeat=\"child in vm.thread.children track by child.id\"\n          ng-show=\"vm.shouldShowReply(child)\">\n        <annotation-thread\n          show-document-info=\"false\"\n          thread=\"child\"\n          on-change-collapsed=\"vm.onChangeCollapsed({id:id, collapsed:collapsed})\"\n          on-force-visible=\"vm.onForceVisible({thread:thread})\">\n        </annotation-thread>\n      </li>\n    </ul>\n  </div>\n</div>\n";

},{}],102:[function(require,module,exports){
module.exports = "<top-bar\n  auth=\"auth\"\n  on-login=\"login()\"\n  on-logout=\"logout()\"\n  on-share-page=\"share()\"\n  on-show-help-panel=\"helpPanel.visible = true\"\n  is-sidebar=\"::isSidebar\"\n  pending-update-count=\"countPendingUpdates()\"\n  on-apply-pending-updates=\"applyPendingUpdates()\"\n  search-controller=\"search\"\n  sort-key=\"sortKey()\"\n  sort-keys-available=\"sortKeysAvailable()\"\n  on-change-sort-key=\"setSortKey(sortKey)\">\n</top-bar>\n\n<div class=\"create-account-banner\" ng-if=\"isSidebar && auth.status === 'logged-out'\" ng-cloak>\n  To annotate this document\n  <a href=\"{{ serviceUrl('signup') }}\" target=\"_blank\">\n    create a free account\n  </a>\n  or <a href=\"\" ng-click=\"login()\">log in</a>\n</div>\n\n<div class=\"content\" ng-cloak>\n  <login-form\n    ng-if=\"accountDialog.visible\"\n    on-close=\"accountDialog.visible = false\">\n  </login-form>\n  <sidebar-tutorial ng-if=\"isSidebar\"></sidebar-tutorial>\n  <share-dialog\n    ng-if=\"shareDialog.visible\"\n    on-close=\"shareDialog.visible = false\">\n  </share-dialog>\n  <help-panel ng-if=\"helpPanel.visible\"\n    on-close=\"helpPanel.visible = false\"\n    auth=\"auth\">\n  </help-panel>\n  <main ng-view=\"\"></main>\n</div>\n";

},{}],103:[function(require,module,exports){
module.exports = "<div class=\"dropdown-menu-btn\">\n  <button\n    class=\"dropdown-menu-btn__btn\"\n    ng-bind=\"label\"\n    ng-click=\"vm.onClick($event)\"\n    ng-disabled=\"isDisabled\">\n  </button>\n  <button\n    class=\"dropdown-menu-btn__dropdown-arrow\"\n    title=\"{{dropdownMenuLabel}}\"\n    ng-click=\"vm.toggleDropdown($event)\">\n    <div class=\"dropdown-menu-btn__dropdown-arrow-separator\"></div>\n    <div class=\"dropdown-menu-btn__dropdown-arrow-indicator\">\n      <div>▼</div>\n    </div>\n  </button>\n</div>\n";

},{}],104:[function(require,module,exports){
module.exports = "<div ng-transclude ng-if=\"!vm.enabled\"></div>\n<div class=\"excerpt__container\" ng-if=\"vm.enabled\">\n  <div class=\"excerpt\" ng-style=\"vm.contentStyle()\">\n    <div ng-transclude></div>\n    <div ng-click=\"vm.expand()\"\n         ng-class=\"vm.bottomShadowStyles()\"\n         title=\"Show the full excerpt\"></div>\n    <div class=\"excerpt__inline-controls\"\n         ng-show=\"vm.showInlineControls()\">\n      <span class=\"excerpt__toggle-link\" ng-show=\"vm.isExpandable()\">\n        … <a ng-click=\"vm.toggle($event)\"\n            title=\"Show the full excerpt\">More</a>\n      </span>\n      <span class=\"excerpt__toggle-link\" ng-show=\"vm.isCollapsible()\">\n        <a ng-click=\"vm.toggle($event)\"\n            title=\"Show the first few lines only\">Less</a>\n      </span>\n    </div>\n  </div>\n</div>\n";

},{}],105:[function(require,module,exports){
module.exports = "<span ng-if=\"auth.status === 'logged-out'\"\n      ng-switch on=\"groups.focused().public\">\n  <i class=\"group-list-label__icon h-icon-public\" ng-switch-when=\"true\"></i><!-- nospace\n  !--><i class=\"group-list-label__icon h-icon-group\" ng-switch-default></i>\n  <span class=\"group-list-label__label\">{{groups.focused().name}}</span>\n</span>\n\n<div class=\"pull-right\"\n     ng-if=\"auth.status === 'logged-in'\"\n     dropdown\n     keyboard-nav>\n  <div class=\"dropdown-toggle\"\n        dropdown-toggle\n        data-toggle=\"dropdown\"\n        role=\"button\"\n        ng-switch on=\"groups.focused().public\"\n        title=\"Change the selected group\">\n    <i class=\"group-list-label__icon h-icon-public\" ng-switch-when=\"true\"></i><!-- nospace\n    !--><i class=\"group-list-label__icon h-icon-group\" ng-switch-default></i>\n    <span class=\"group-list-label__label\">{{groups.focused().name}}</span><!-- nospace\n    !--><i class=\"h-icon-arrow-drop-down\"></i>\n  </div>\n  <div class=\"dropdown-menu__top-arrow\"></div>\n  <ul class=\"dropdown-menu pull-none\" role=\"menu\">\n    <li class=\"dropdown-menu__row dropdown-menu__row--unpadded \"\n        ng-repeat=\"group in groups.all()\">\n      <div ng-class=\"{'group-item': true, selected: group.id == groups.focused().id}\"\n           ng-click=\"focusGroup(group.id)\">\n        <!-- the group icon !-->\n        <div class=\"group-icon-container\" ng-switch on=\"group.public\">\n          <i class=\"h-icon-public\" ng-switch-when=\"true\"></i>\n          <i class=\"h-icon-group\" ng-switch-default></i>\n        </div>\n        <!-- the group name and share link !-->\n        <div class=\"group-details\">\n          <div class=\"group-name-container\">\n            <a class=\"group-name-link\"\n               href=\"\"\n               title=\"{{ group.public ? 'Show public annotations' : 'Show and create annotations in ' + group.name }}\">\n               {{group.name}}\n            </a>\n          </div>\n          <div class=\"share-link-container\" ng-click=\"$event.stopPropagation()\" ng-if=\"!group.public\">\n            <a class=\"share-link\" href=\"{{group.url}}\" target=\"_blank\">\n              View group activity and invite others\n            </a>\n          </div>\n        </div>\n        <!-- the 'Leave group' icon !-->\n        <div class=\"group-cancel-icon-container\" ng-click=\"$event.stopPropagation()\">\n          <i class=\"h-icon-cancel-outline btn--cancel\"\n             ng-if=\"!group.public\"\n             ng-click=\"leaveGroup(group.id)\"\n             title=\"Leave '{{group.name}}'\"></i>\n        </div>\n      </div>\n    </li>\n    <li class=\"dropdown-menu__row dropdown-menu__row--unpadded new-group-btn\">\n      <div class=\"group-item\" ng-click=\"createNewGroup()\">\n        <div class=\"group-icon-container\"><i class=\"h-icon-add\"></i></div>\n        <div class=\"group-details\">\n          <a href=\"\" class=\"group-name-link\" title=\"Create a new group to share annotations\">\n            New group\n          </a>\n        </div>\n      </div>\n    </li>\n  </ul>\n</div>\n";

},{}],106:[function(require,module,exports){
module.exports = "\n<a class=\"help-panel-content__link\"\n   href=\"mailto:support@hypothes.is?subject=Hypothesis%20support&amp;body=Version:%20{{ vm.version }}%0D%0AUser%20Agent:%20{{vm.userAgent}}%0D%0AURL:%20{{ vm.url }}%0D%0APDF%20fingerprint:%20{{ vm.documentFingerprint ? vm.documentFingerprint : '-' }}%0D%0AUsername:%20{{ vm.auth.username ? vm.auth.username : '-' }}%0D%0ADate:%20{{ vm.dateTime | date:'dd MMM yyyy HH:mm:ss Z' }} \"\n>Send us a message</a>\n";

},{}],107:[function(require,module,exports){
module.exports = "<div class=\"help-panel\">\n  <i class=\"close h-icon-close\"\n    role=\"button\"\n    title=\"Close\"\n    ng-click=\"vm.onClose()\"></i>\n\n  <header class=\"help-panel-title\">\n    Help\n  </header>\n  <div class=\"help-panel-content\">\n    <help-link\n      version=\"vm.version\"\n      user-agent=\"vm.userAgent\"\n      url=\"vm.url\"\n      document-fingerprint=\"vm.documentFingerprint\"\n      auth=\"vm.auth\"\n      date-time=\"vm.dateTime\">\n    </help-link>\n    if you have any questions or want to give us feedback.\n    You can also visit our <a class=\"help-panel-content__link\" href=\"{{vm.serviceUrl('help')}}\" target=\"_blank\"> help documents</a>.\n  </div>\n  <header class=\"help-panel-title\">\n    About this version\n  </header>\n  <dl class=\"help-panel-content\">\n    <dt class=\"help-panel-content__key\">Version: </dt>\n    <dd class=\"help-panel-content__val\">{{ vm.version }}</dd>\n    <dt class=\"help-panel-content__key\">User agent: </dt>\n    <dd class=\"help-panel-content__val\">{{ vm.userAgent }}</dd>\n    <div ng-if=\"vm.url\">\n      <dt class=\"help-panel-content__key\">URL: </dt>\n      <dd class=\"help-panel-content__val\">{{ vm.url }}</dd>\n    </div>\n    <div ng-if=\"vm.documentFingerprint\">\n      <dt class=\"help-panel-content__key\">PDF fingerprint: </dt>\n      <dd class=\"help-panel-content__val\">{{ vm.documentFingerprint }}</dd>\n    </div>\n    <div ng-if=\"vm.auth.userid\">\n      <dt class=\"help-panel-content__key\">Username: </dt>\n      <dd class=\"help-panel-content__val\">{{ vm.auth.username }}</dd>\n    </div>\n    <dt class=\"help-panel-content__key\">Date: </dt>\n    <dd class=\"help-panel-content__val\">{{ vm.dateTime | date:'dd MMM yyyy HH:mm:ss Z' }}</dd>\n  </div>\n</div>\n";

},{}],108:[function(require,module,exports){
module.exports = "<!-- message to display to loggedout users when they visit direct linked annotations -->\n<li class=\"loggedout-message\">\n  <span>\n    This is a public annotation created with Hypothesis.\n    <br>\n    To reply or make your own annotations on this document,\n    <a class=\"loggedout-message__link\" href=\"{{vm.serviceUrl('signup')}}\" target=\"_blank\">create a free account</a>\n    or\n    <a class=\"loggedout-message__link\" href=\"\" ng-click=\"vm.onLogin()\">log in</a>.\n  </span>\n  <span class=\"loggedout-message-logo\">\n    <a href=\"https://hypothes.is\">\n      <i class=\"h-icon-hypothesis-logo loggedout-message-logo__icon\"></i>\n    </a>\n  </span>\n</li>\n";

},{}],109:[function(require,module,exports){
module.exports = "<!-- New controls -->\n<span class=\"login-text\"\n      ng-if=\"vm.newStyle && vm.auth.status === 'unknown'\">⋯</span>\n<span class=\"login-text\"\n      ng-if=\"vm.newStyle && vm.auth.status === 'logged-out'\">\n  <a href=\"{{vm.serviceUrl('signup')}}\" target=\"_blank\">Sign up</a>\n  / <a href=\"\" ng-click=\"vm.onLogin()\">Log in</a>\n</span>\n<div ng-if=\"vm.newStyle\"\n     class=\"pull-right login-control-menu\"\n     dropdown\n     keyboard-nav>\n  <a role=\"button\"\n     class=\"top-bar__btn\"\n     data-toggle=\"dropdown\"\n     dropdown-toggle\n     title=\"{{vm.auth.username}}\">\n    <i class=\"h-icon-account\" ng-if=\"vm.auth.status === 'logged-in'\"></i><!--\n    !--><i class=\"h-icon-arrow-drop-down top-bar__dropdown-arrow\"></i>\n  </a>\n  <ul class=\"dropdown-menu pull-right\" role=\"menu\">\n    <li class=\"dropdown-menu__row\" ng-if=\"vm.auth.status === 'logged-in'\">\n      <a href=\"{{vm.serviceUrl('user',{user: vm.auth.username})}}\"\n         class=\"dropdown-menu__link\"\n         title=\"View all your annotations\"\n         target=\"_blank\">{{vm.auth.username}}</a>\n    </li>\n    <li class=\"dropdown-menu__row\" ng-if=\"vm.auth.status === 'logged-in'\">\n      <a class=\"dropdown-menu__link\" href=\"{{vm.serviceUrl('account.settings')}}\" target=\"_blank\">Account settings</a>\n    </li>\n    <li class=\"dropdown-menu__row\">\n      <a class=\"dropdown-menu__link\" ng-click=\"vm.onShowHelpPanel()\">Help</a>\n    </li>\n    <li class=\"dropdown-menu__row\" ng-if=\"vm.auth.status === 'logged-in'\">\n      <a class=\"dropdown-menu__link dropdown-menu__link--subtle\"\n         href=\"\" ng-click=\"vm.onLogout()\">Log out</a>\n    </li>\n  </ul>\n</div>\n\n<!-- Old controls -->\n<span ng-if=\"!vm.newStyle && vm.auth.status === 'unknown'\">⋯</span>\n<span ng-if=\"!vm.newStyle && vm.auth.status === 'logged-out'\">\n  <a href=\"\" ng-click=\"vm.onLogin()\">Log in</a>\n</span>\n<div ng-if=\"!vm.newStyle\"\n     class=\"pull-right login-control-menu\"\n     dropdown\n     keyboard-nav>\n  <span role=\"button\" data-toggle=\"dropdown\" dropdown-toggle>\n    {{vm.auth.username}}<!--\n    --><span class=\"provider\"\n             ng-if=\"vm.auth.provider\">/{{vm.auth.provider}}</span><!--\n    --><i class=\"h-icon-arrow-drop-down\"></i>\n  </span>\n  <ul class=\"dropdown-menu pull-right\" role=\"menu\">\n    <li class=\"dropdown-menu__row\" ng-if=\"vm.auth.status === 'logged-in'\">\n      <a class=\"dropdown-menu__link\" href=\"{{vm.serviceUrl('account.settings')}}\" target=\"_blank\">Account</a>\n    </li>\n    <li class=\"dropdown-menu__row\" >\n      <a class=\"dropdown-menu__link\" ng-click=\"vm.onShowHelpPanel()\">Help</a>\n    </li>\n    <li class=\"dropdown-menu__row\" ng-if=\"vm.auth.status === 'logged-in'\">\n      <a class=\"dropdown-menu__link\" href=\"{{vm.serviceUrl('user',{user: vm.auth.username})}}\"\n         target=\"_blank\">My Annotations</a>\n    </li>\n    <li class=\"dropdown-menu__row\" ng-if=\"vm.auth.status === 'logged-in'\">\n      <a class=\"dropdown-menu__link\" href=\"\" ng-click=\"vm.onLogout()\">Log out</a>\n    </li>\n  </ul>\n</div>\n";

},{}],110:[function(require,module,exports){
module.exports = "<div class=\"sheet\">\n  <i class=\"close h-icon-close\"\n     role=\"button\"\n     title=\"Close\"\n     ng-click=\"vm.onClose()\"></i>\n  <div class=\"form-vertical\"\n       ng-form=\"form\"\n       ng-submit=\"vm.submit(form['login'])\">\n    <div class=\"tab-content\">\n      <form data-value=\"login\"\n            class=\"form\"\n            name=\"login\"\n            form-validate\n            novalidate>\n\n        <p class=\"form-description form-error\"\n           ng-show=\"login.responseErrorMessage\">\n          {{login.responseErrorMessage}}\n        </p>\n\n        <div class=\"form-field\">\n          <label class=\"form-label\" for=\"field-login-username\">Username or email address:</label>\n          <input class=\"form-input\" type=\"text\" id=\"field-login-username\"\n                 name=\"username\" value=\"\"\n                 ng-model=\"model.username\"\n                 required autocapitalize=\"false\" h-autofocus />\n          <ul class=\"form-error-list\">\n            <li class=\"form-error\"\n                ng-show=\"login.username.$error.required\"\n                >Please enter your username or email address.</li>\n            <li class=\"form-error\"\n                ng-show=\"login.username.$error.response\"\n                ng-bind-html=\"login.username.responseErrorMessage\">\n            </li>\n          </ul>\n        </div>\n\n        <div class=\"form-field\">\n          <label class=\"form-label\" for=\"field-login-password\">Password:</label>\n          <input class=\"form-input\" id=\"field-login-password\"\n                 type=\"password\" name=\"password\" value=\"\"\n                 ng-model=\"model.password\"\n                 required autocapitalize=\"false\" autocorrect=\"false\" />\n          <ul class=\"form-error-list\">\n            <li class=\"form-error\"\n                ng-show=\"login.password.$error.required\"\n                >Please enter your password.</li>\n            <li class=\"form-error\"\n                ng-show=\"login.password.$error.response\"\n                >{{login.password.responseErrorMessage}}</li>\n          </ul>\n        </div>\n\n        <div class=\"form-actions\">\n          <div class=\"form-actions-message\">\n            <a href=\"{{vm.serviceUrl('forgot-password')}}\" target=\"_blank\">Forgot your password?</a>\n          </div>\n          <div class=\"form-actions-buttons\">\n            <button class=\"btn btn-primary\" type=\"submit\" name=\"login\"\n                    status-button=\"login\">Log in</button>\n          </div>\n        </div>\n      </form>\n    </div>\n  </div>\n</div>\n";

},{}],111:[function(require,module,exports){
module.exports = "<div ng-if=\"!readOnly\" class=\"markdown-tools\" ng-class=\"preview && 'disable'\">\n  <span class=\"markdown-preview-toggle\">\n    <a class=\"markdown-tools-badge h-icon-markdown\" href=\"https://help.github.com/articles/markdown-basics\" title=\"Parsed as Markdown\" target=\"_blank\"></a>\n    <a href=\"\" class=\"markdown-tools-toggle\" ng-click=\"togglePreview()\" ng-show=\"!preview\">Preview</a>\n    <a href=\"\" class=\"markdown-tools-toggle\" ng-click=\"togglePreview()\" ng-show=\"preview\">Write</a>\n  </span>\n  <i class=\"h-icon-format-bold markdown-tools-button\" ng-click=\"insertBold()\" title=\"Embolden text\"></i>\n  <i class=\"h-icon-format-italic markdown-tools-button\" ng-click=\"insertItalic()\" title=\"Italicize text\"></i>\n  <i class=\"h-icon-format-quote markdown-tools-button\" ng-click=\"insertQuote()\" title=\"Quote text\"></i>\n  <i class=\"h-icon-insert-link markdown-tools-button\" ng-click=\"insertLink()\" title=\"Insert link\"></i>\n  <i class=\"h-icon-insert-photo markdown-tools-button\" ng-click=\"insertIMG()\" title=\"Insert image\"></i>\n  <i class=\"h-icon-functions markdown-tools-button\" ng-click=\"insertMath()\" title=\"Insert mathematical notation (LaTex is supported)\"></i>\n  <i class=\"h-icon-format-list-numbered markdown-tools-button\" ng-click=\"insertNumList()\" title=\"Insert numbered list\"></i>\n  <i class=\"h-icon-format-list-bulleted markdown-tools-button\" ng-click=\"insertList()\" title=\"Insert list\"></i>\n</div>\n<textarea class=\"form-input form-textarea js-markdown-input\"\n          ng-show=\"showEditor()\"\n          ng-click=\"$event.stopPropagation()\"></textarea>\n<div class=\"markdown-body js-markdown-preview\"\n     ng-class=\"preview && 'markdown-preview'\"\n     ng-dblclick=\"togglePreview()\"\n     ng-show=\"!showEditor()\"></div>\n";

},{}],112:[function(require,module,exports){
module.exports = "<div dropdown=\"\" class=\"publish-annotation-btn__btn\" is-open=\"vm.showDropdown\" keyboard-nav>\n  <dropdown-menu-btn\n    label=\"'Post to ' + vm.publishDestination()\"\n    on-click=\"vm.onSave()\"\n    on-toggle-dropdown=\"vm.showDropdown = !vm.showDropdown\"\n    title=\"Publish this annotation to {{vm.publishDestination()}}\"\n    dropdown-menu-label=\"Change annotation sharing setting\"\n    is-disabled=\"!vm.canPost\">\n  </dropdown-menu-btn>\n  <div class=\"publish-annotation-btn__dropdown-container\">\n    <ul class=\"dropdown-menu pull-center group-list publish-annotation-btn__dropdown-menu\" role=\"menu\">\n      <li class=\"dropdown-menu__row\" ng-click=\"vm.setPrivacy('shared')\">\n        <div class=\"group-item\">\n          <div class=\"group-icon-container\">\n            <i class=\"small\" ng-class=\"'h-icon-' + vm.groupType()\"></i>\n          </div>\n          <div class=\"group-details\">\n            <div class=\"group-name-container\">\n              <a href=\"\" class=\"group-name-link\" ng-bind=\"vm.group.name\"></a>\n            </div>\n          </div>\n        </div>\n      </li>\n      <li class=\"dropdown-menu__row\" ng-click=\"vm.setPrivacy('private')\">\n        <div class=\"group-item\">\n          <div class=\"group-icon-container\">\n            <i class=\"small h-icon-lock\"></i>\n          </div>\n          <div class=\"group-details\">\n            <div class=\"group-name-container\">\n              <a href=\"\" class=\"group-name-link\" ng-bind=\"vm.privateLabel\"></a>\n            </div>\n          </div>\n        </div>\n      </li>\n    </ul>\n  </div>\n</div>\n<button class=\"publish-annotation-cancel-btn btn-clean\"\n        ng-click=\"vm.onCancel()\"\n        title=\"Cancel changes to this annotation\"\n        >\n  <i class=\"h-icon-cancel-outline publish-annotation-cancel-btn__icon btn-icon\"></i> Cancel\n</button>\n";

},{}],113:[function(require,module,exports){
module.exports = "<form class=\"simple-search-form\"\n      name=\"searchForm\"\n      ng-class=\"!vm.query && 'simple-search-inactive'\">\n  <input class=\"simple-search-input\"\n         type=\"text\"\n         name=\"query\"\n         placeholder=\"{{vm.loading && 'Loading' || 'Search'}}…\"\n         ng-disabled=\"vm.loading\"\n         ng-class=\"vm.inputClasses()\"/>\n  <button type=\"button\" class=\"simple-search-icon top-bar__btn\" ng-hide=\"vm.loading\">\n    <i class=\"h-icon-search\"></i>\n  </button>\n  <button type=\"button\" class=\"simple-search-icon btn btn-clean\" ng-show=\"vm.loading\" disabled>\n    <span class=\"btn-icon\"><span class=\"spinner\"></span></span>\n  </button>\n</form>\n";

},{}],114:[function(require,module,exports){
module.exports = "<div class=\"search-status-bar\" ng-if=\"vm.filterActive\">\n  <button class=\"primary-action-btn primary-action-btn--short\"\n          ng-click=\"vm.onClearSelection()\"\n          title=\"Clear the search filter and show all annotations\"\n  >\n    <i class=\"primary-action-btn__icon h-icon-close\"></i> Clear search\n  </button>\n  <span ng-pluralize\n           count=\"vm.filterMatchCount\"\n           when=\"{'0': 'No results for “{{vm.searchQuery}}”',\n                  'one': '1 search result',\n                  'other': '{} search results'}\"></span>\n</div>\n<div class=\"search-status-bar\" ng-if=\"!vm.filterActive && vm.selectionCount > 0\">\n  <button class=\"primary-action-btn primary-action-btn--short\"\n          ng-click=\"vm.onClearSelection()\"\n          title=\"Clear the selection and show all annotations\">\n    <span ng-if=\"!vm.selectedTab || vm.selectedTab === vm.TAB_ORPHANS\">\n      Show all annotations and notes\n    </span>\n    <span ng-if=\"vm.selectedTab === vm.TAB_ANNOTATIONS\">\n      Show all annotations\n      <span ng-if=\"vm.totalAnnotations > 1\">\n        ({{vm.totalAnnotations}})\n      </span>\n    </span>\n    <span ng-if=\"vm.selectedTab === vm.TAB_NOTES\">\n      Show all notes\n      <span ng-if=\"vm.totalNotes > 1\">\n        ({{vm.totalNotes}})\n      </span>\n    </span>\n  </button>\n\n</div>\n";

},{}],115:[function(require,module,exports){
module.exports = "<!-- Tabbed display of annotations and notes. -->\n<div class=\"selection-tabs\">\n  <a class=\"selection-tabs__type\"\n     href=\"#\"\n     ng-class=\"{'is-selected': vm.selectedTab === vm.TAB_ANNOTATIONS}\"\n     h-on-touch=\"vm.selectTab(vm.TAB_ANNOTATIONS)\">\n    Annotations\n    <span class=\"selection-tabs__count\"\n      ng-if=\"vm.totalAnnotations > 0 && !vm.isWaitingToAnchorAnnotations\">\n      {{ vm.totalAnnotations }}\n    </span>\n  </a>\n  <a class=\"selection-tabs__type\"\n     href=\"#\"\n     ng-class=\"{'is-selected': vm.selectedTab === vm.TAB_NOTES}\"\n     h-on-touch=\"vm.selectTab(vm.TAB_NOTES)\">\n    Page Notes\n    <span class=\"selection-tabs__count\"\n      ng-if=\"vm.totalNotes > 0 && !vm.isWaitingToAnchorAnnotations\">\n      {{ vm.totalNotes }}\n    </span>\n  </a>\n  <a class=\"selection-tabs__type selection-tabs__type--orphan\"\n    ng-if=\"vm.orphansTabFlagEnabled() && vm.totalOrphans > 0\"\n    href=\"#\"\n    ng-class=\"{'is-selected': vm.selectedTab === vm.TAB_ORPHANS}\"\n    h-on-touch=\"vm.selectTab(vm.TAB_ORPHANS)\">\n    Orphans\n    <span class=\"selection-tabs__count\"\n      ng-if=\"vm.totalOrphans > 0 && !vm.isWaitingToAnchorAnnotations\">\n      {{ vm.totalOrphans }}\n    </span>\n  </a>\n</div>\n<div ng-if=\"!vm.isLoading()\" class=\"selection-tabs__empty-message\">\n  <div ng-if=\"vm.showNotesUnavailableMessage()\"  class=\"annotation-unavailable-message\">\n    <p class=\"annotation-unavailable-message__label\">\n      There are no page notes in this group.\n      <br />\n      Create one by clicking the\n      <i class=\"help-icon h-icon-note\"></i>\n      button.\n    </p>\n  </div>\n  <div ng-if=\"vm.showAnnotationsUnavailableMessage()\"  class=\"annotation-unavailable-message\">\n    <p class=\"annotation-unavailable-message__label\">\n      There are no annotations in this group.\n      <br />\n      Create one by selecting some text and clicking the\n      <i class=\"help-icon h-icon-annotate\"></i> button.\n    </p>\n  </div>\n</div>\n";

},{}],116:[function(require,module,exports){
module.exports = "<div class=\"sheet\">\n  <i class=\"close h-icon-close\"\n     role=\"button\"\n     title=\"Close\"\n     ng-click=\"vm.onClose()\"></i>\n  <div class=\"form-vertical\">\n    <ul class=\"nav nav-tabs\">\n      <li class=\"active\"><a href=\"\">Share</a></li>\n    </ul>\n    <div class=\"tab-content\">\n      <p>Share the link below to show anyone these annotations and invite them to contribute their own.</p>\n      <p><input class=\"js-via form-input\"\n          type=\"text\"\n          ng-value=\"vm.viaPageLink\"\n          readonly /></p>\n      <p class=\"share-link-icons\">\n      <a href=\"https://twitter.com/intent/tweet?url={{vm.viaPageLink | urlEncode}}&hashtags=annotated\"\n         target=\"_blank\"\n         title=\"Tweet link\"\n         class=\"share-link-icon h-icon-twitter\"></a>\n      <a href=\"https://www.facebook.com/sharer/sharer.php?u={{vm.viaPageLink | urlEncode}}\"\n         target=\"_blank\"\n         title=\"Share on Facebook\"\n         class=\"share-link-icon h-icon-facebook\"></a>\n      <a href=\"https://plus.google.com/share?url={{vm.viaPageLink | urlEncode}}\"\n         target=\"_blank\"\n         title=\"Post on Google Plus\"\n         class=\"share-link-icon h-icon-google-plus\"></a>\n      <a href=\"mailto:?subject=Let's%20Annotate&amp;body={{vm.viaPageLink}}\"\n         title=\"Share via email\"\n         class=\"share-link-icon h-icon-mail\"></a>\n      </p>\n    </div>\n  </div>\n</div>\n";

},{}],117:[function(require,module,exports){
module.exports = "<div class=\"sheet\" ng-if=\"vm.showSidebarTutorial()\">\n  <i class=\"close h-icon-close\" role=\"button\" title=\"Close\"\n     ng-click=\"vm.dismiss()\"></i>\n  <h1 class=\"sidebar-tutorial__header\">How to get started</h1>\n  <ol class=\"sidebar-tutorial__list\">\n    <li class=\"sidebar-tutorial__list-item\">\n      <p class=\"sidebar-tutorial__list-item-content\">\n        To create an annotation, select text and click the\n        <i class=\"h-icon-annotate\"></i>&nbsp;button.\n      </p>\n    </li>\n    <li class=\"sidebar-tutorial__list-item\">\n      <p class=\"sidebar-tutorial__list-item-content\">\n        To add a note to the page you are viewing, click the\n        <i class=\"h-icon-note\"></i>&nbsp;button.\n      </p>\n    </li>\n    <li class=\"sidebar-tutorial__list-item\">\n      <p class=\"sidebar-tutorial__list-item-content\">\n        To create a highlight, select text and click the\n        <i class=\"h-icon-highlight\"></i>&nbsp;button.\n      </p>\n    </li>\n    <li class=\"sidebar-tutorial__list-item\">\n      <p class=\"sidebar-tutorial__list-item-content\">\n        To reply to an annotation, click the\n        <i class=\"h-icon-annotation-reply\"></i>&nbsp;<strong>Reply</strong>&nbsp;link.\n      </p>\n    </li>\n    <li class=\"sidebar-tutorial__list-item\">\n      <p class=\"sidebar-tutorial__list-item-content\">\n        To share an annotated page, click the\n        <i class=\"h-icon-annotation-share\"></i>&nbsp;button at the top.\n      </p>\n    </li>\n    <li class=\"sidebar-tutorial__list-item\">\n      <p class=\"sidebar-tutorial__list-item-content\">\n        To create a private group, select <strong>Public</strong>,\n        open the dropdown, click&nbsp;<strong>+&nbsp;New&nbsp;group</strong>.\n      </p>\n    </li>\n  </ol>\n</div>\n";

},{}],118:[function(require,module,exports){
module.exports = "<span class=\"ng-cloak\" dropdown keyboard-nav>\n  <button\n    type=\"button\"\n    class=\"top-bar__btn\"\n    dropdown-toggle\n    title=\"Sort by {{sortKey}}\">\n    <i class=\"h-icon-sort\"></i>\n  </button>\n  <div class=\"dropdown-menu__top-arrow\"></div>\n  <ul class=\"dropdown-menu pull-right\" role=\"menu\">\n    <li class=\"dropdown-menu__row\"\n        ng-repeat=\"key in sortKeysAvailable\"\n        ng-click=\"onChangeSortKey({sortKey: key})\"\n        ><span class=\"dropdown-menu-radio\"\n               ng-class=\"{'is-selected' : sortKey === key}\"\n        ></span><a class=\"dropdown-menu__link\" href=\"\">{{key}}</a></li>\n  </ul>\n</span>\n";

},{}],119:[function(require,module,exports){
module.exports = "<tags-input ng-model=\"vm.tagList\"\n  name=\"tags\"\n  class=\"tags\"\n  placeholder=\"Add tags…\"\n  min-length=\"1\"\n  replace-spaces-with-dashes=\"false\"\n  enable-editing-last-tag=\"true\"\n  on-tag-added=\"vm.onTagsChanged()\"\n  on-tag-removed=\"vm.onTagsChanged()\">\n  <auto-complete source=\"vm.autocomplete($query)\"\n    min-length=\"1\"\n    max-results-to-show=\"10\"></auto-complete>\n</tags-input>\n";

},{}],120:[function(require,module,exports){
module.exports = "<ul class=\"thread-list\">\n  <li class=\"thread-list__spacer\"\n      ng-style=\"{height: vm.virtualThreadList.offscreenUpperHeight}\"></li>\n  <li id=\"{{child.id}}\"\n      class=\"thread-list__card\"\n      ng-mouseenter=\"vm.onFocus({annotation: child.annotation})\"\n      ng-click=\"vm.onSelect({annotation: child.annotation})\"\n      ng-mouseleave=\"vm.onFocus({annotation: null})\"\n      ng-repeat=\"child in vm.virtualThreadList.visibleThreads track by child.id\">\n      <annotation-thread\n        thread=\"child\"\n        show-document-info=\"vm.showDocumentInfo\"\n        on-change-collapsed=\"vm.onChangeCollapsed({id: id, collapsed: collapsed})\"\n        on-force-visible=\"vm.onForceVisible({thread: thread})\">\n      </annotation-thread>\n  </li>\n  <li class=\"thread-list__spacer\"\n      ng-style=\"{height: vm.virtualThreadList.offscreenLowerHeight}\"></li>\n</ul>\n";

},{}],121:[function(require,module,exports){
module.exports = "<!-- top bar for the sidebar and the stream.\n!-->\n<div class=\"top-bar\" ng-class=\"frame.visible && 'shown'\" ng-cloak>\n  <!-- Legacy design for top bar, as used in the stream !-->\n  <div class=\"top-bar__inner content\" ng-if=\"::!isSidebar\">\n    <search-input\n      class=\"search-input\"\n      query=\"searchController.query()\"\n      on-search=\"searchController.update($query)\"\n      always-expanded=\"true\">\n    </search-input>\n    <div class=\"top-bar__expander\"></div>\n    <login-control\n      auth=\"auth\"\n      new-style=\"false\"\n      on-show-help-panel=\"onShowHelpPanel()\"\n      on-login=\"onLogin()\"\n      on-logout=\"onLogout()\">\n    </login-control>\n  </div>\n  <!-- New design for the top bar, as used in the sidebar.\n\n       The inner div is styled with 'content' to center it in\n       the stream view.\n  !-->\n  <div class=\"top-bar__inner content\" ng-if=\"::isSidebar\">\n    <group-list class=\"group-list\" auth=\"auth\"></group-list>\n    <div class=\"top-bar__expander\"></div>\n    <a class=\"top-bar__apply-update-btn\"\n       ng-if=\"pendingUpdateCount > 0\"\n       ng-click=\"onApplyPendingUpdates()\"\n       h-tooltip\n       tooltip-direction=\"up\"\n       aria-label=\"Show {{pendingUpdateCount}} new/updated annotation(s)\">\n       <svg-icon class=\"top-bar__apply-icon\" name=\"'refresh'\"></svg-icon>\n    </a>\n    <search-input\n      class=\"search-input\"\n      query=\"searchController.query()\"\n      on-search=\"searchController.update($query)\"\n      title=\"Filter the annotation list\">\n    </search-input>\n    <sort-dropdown\n      sort-keys-available=\"sortKeysAvailable\"\n      sort-key=\"sortKey\"\n      on-change-sort-key=\"onChangeSortKey({sortKey: sortKey})\">\n    </sort-dropdown>\n    <a class=\"top-bar__btn\"\n       ng-click=\"onSharePage()\"\n       title=\"Share this page\">\n      <i class=\"h-icon-annotation-share\"></i>\n    </a>\n    <login-control\n      class=\"login-control\"\n      auth=\"auth\"\n      new-style=\"true\"\n      on-show-help-panel=\"onShowHelpPanel()\"\n      on-login=\"onLogin()\"\n      on-logout=\"onLogout()\">\n    </login-control>\n  </div>\n</div>\n";

},{}],122:[function(require,module,exports){
module.exports = "<selection-tabs\n  ng-if=\"!search.query() && selectedAnnotationCount() === 0\"\n  is-waiting-to-anchor-annotations=\"waitingToAnchorAnnotations\"\n  is-loading=\"isLoading\"\n  selected-tab=\"selectedTab\"\n  total-annotations=\"totalAnnotations\"\n  total-notes=\"totalNotes\"\n  total-orphans=\"totalOrphans\">\n</selection-tabs>\n\n<search-status-bar\n  ng-show=\"!isLoading()\"\n  ng-if=\"!isStream\"\n  filter-active=\"!!search.query()\"\n  filter-match-count=\"visibleCount()\"\n  on-clear-selection=\"clearSelection()\"\n  search-query=\"search ? search.query : ''\"\n  selection-count=\"selectedAnnotationCount()\"\n  total-count=\"topLevelThreadCount()\"\n  selected-tab=\"selectedTab\"\n  total-annotations=\"totalAnnotations\"\n  total-notes=\"totalNotes\">\n</search-status-bar>\n\n<div class=\"annotation-unavailable-message\"\n    ng-if=\"selectedAnnotationUnavailable()\">\n  <div class=\"annotation-unavailable-message__icon\"></div>\n  <p class=\"annotation-unavailable-message__label\">\n    <span ng-if=\"auth.status === 'logged-out'\">\n      This annotation is not available.\n      <br>\n      You may need to\n      <a class=\"loggedout-message__link\" href=\"\" ng-click=\"login()\">log in</a>\n      to see it.\n    </span>\n    <span ng-if=\"auth.status === 'logged-in'\">\n      You do not have permission to view this annotation.\n    </span>\n  </p>\n</div>\n\n<span window-scroll=\"loadMore(20)\">\n  <thread-list\n    on-change-collapsed=\"setCollapsed(id, collapsed)\"\n    on-clear-selection=\"clearSelection()\"\n    on-focus=\"focus(annotation)\"\n    on-force-visible=\"forceVisible(thread)\"\n    on-select=\"scrollTo(annotation)\"\n    show-document-info=\"::!isSidebar\"\n    thread=\"rootThread\">\n  </thread-list>\n</span>\n\n<loggedout-message ng-if=\"isSidebar && shouldShowLoggedOutMessage()\"\n  on-login=\"login()\" ng-cloak>\n</loggedout-message>\n";

},{}],123:[function(require,module,exports){
/**
 * @license Angulartics v0.17.2
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function(angular, analytics) {
'use strict';

var angulartics = window.angulartics || (window.angulartics = {});
angulartics.waitForVendorCount = 0;
angulartics.waitForVendorApi = function (objectName, delay, containsField, registerFn, onTimeout) {
  if (!onTimeout) { angulartics.waitForVendorCount++; }
  if (!registerFn) { registerFn = containsField; containsField = undefined; }
  if (!Object.prototype.hasOwnProperty.call(window, objectName) || (containsField !== undefined && window[objectName][containsField] === undefined)) {
    setTimeout(function () { angulartics.waitForVendorApi(objectName, delay, containsField, registerFn, true); }, delay);
  }
  else {
    angulartics.waitForVendorCount--;
    registerFn(window[objectName]);
  }
};

/**
 * @ngdoc overview
 * @name angulartics
 */
angular.module('angulartics', [])
.provider('$analytics', function () {
  var settings = {
    pageTracking: {
      autoTrackFirstPage: true,
      autoTrackVirtualPages: true,
      trackRelativePath: false,
      autoBasePath: false,
      basePath: ''
    },
    eventTracking: {},
    bufferFlushDelay: 1000, // Support only one configuration for buffer flush delay to simplify buffering
    developerMode: false // Prevent sending data in local/development environment
  };

  // List of known handlers that plugins can register themselves for
  var knownHandlers = [
    'pageTrack',
    'eventTrack',
    'setAlias',
    'setUsername',
    'setAlias',
    'setUserProperties',
    'setUserPropertiesOnce',
    'setSuperProperties',
    'setSuperPropertiesOnce'
  ];
  // Cache and handler properties will match values in 'knownHandlers' as the buffering functons are installed.
  var cache = {};
  var handlers = {};

  // General buffering handler
  var bufferedHandler = function(handlerName){
    return function(){
      if(angulartics.waitForVendorCount){
        if(!cache[handlerName]){ cache[handlerName] = []; }
        cache[handlerName].push(arguments);
      }
    };
  };

  // As handlers are installed by plugins, they get pushed into a list and invoked in order.
  var updateHandlers = function(handlerName, fn){
    if(!handlers[handlerName]){
      handlers[handlerName] = [];
    }
    handlers[handlerName].push(fn);
    return function(){
      var handlerArgs = arguments;
      angular.forEach(handlers[handlerName], function(handler){
        handler.apply(this, handlerArgs);
      }, this);
    };
  };

  // The api (returned by this provider) gets populated with handlers below.
  var api = {
    settings: settings
  };

  // Will run setTimeout if delay is > 0
  // Runs immediately if no delay to make sure cache/buffer is flushed before anything else.
  // Plugins should take care to register handlers by order of precedence.
  var onTimeout = function(fn, delay){
    if(delay){
      setTimeout(fn, delay);
    } else {
      fn();
    }
  };

  var provider = {
    $get: function() { return api; },
    api: api,
    settings: settings,
    virtualPageviews: function (value) { this.settings.pageTracking.autoTrackVirtualPages = value; },
    firstPageview: function (value) { this.settings.pageTracking.autoTrackFirstPage = value; },
    withBase: function (value) { this.settings.pageTracking.basePath = (value) ? angular.element('base').attr('href').slice(0, -1) : ''; },
    withAutoBase: function (value) { this.settings.pageTracking.autoBasePath = value; },
    developerMode: function(value) { this.settings.developerMode = value; }
  };

  // General function to register plugin handlers. Flushes buffers immediately upon registration according to the specified delay.
  var register = function(handlerName, fn){
    api[handlerName] = updateHandlers(handlerName, fn);
    var handlerSettings = settings[handlerName];
    var handlerDelay = (handlerSettings) ? handlerSettings.bufferFlushDelay : null;
    var delay = (handlerDelay !== null) ? handlerDelay : settings.bufferFlushDelay;
    angular.forEach(cache[handlerName], function (args, index) {
      onTimeout(function () { fn.apply(this, args); }, index * delay);
    });
  };

  var capitalize = function (input) {
      return input.replace(/^./, function (match) {
          return match.toUpperCase();
      });
  };

  // Adds to the provider a 'register#{handlerName}' function that manages multiple plugins and buffer flushing.
  var installHandlerRegisterFunction = function(handlerName){
    var registerName = 'register'+capitalize(handlerName);
    provider[registerName] = function(fn){
      register(handlerName, fn);
    };
    api[handlerName] = updateHandlers(handlerName, bufferedHandler(handlerName));
  };

  // Set up register functions for each known handler
  angular.forEach(knownHandlers, installHandlerRegisterFunction);
  return provider;
})

.run(['$rootScope', '$window', '$analytics', '$injector', function ($rootScope, $window, $analytics, $injector) {
  if ($analytics.settings.pageTracking.autoTrackFirstPage) {
    $injector.invoke(['$location', function ($location) {
      /* Only track the 'first page' if there are no routes or states on the page */
      var noRoutesOrStates = true;
      if ($injector.has('$route')) {
         var $route = $injector.get('$route');
         for (var route in $route.routes) {
           noRoutesOrStates = false;
           break;
         }
      } else if ($injector.has('$state')) {
        var $state = $injector.get('$state');
        for (var state in $state.get()) {
          noRoutesOrStates = false;
          break;
        }
      }
      if (noRoutesOrStates) {
        if ($analytics.settings.pageTracking.autoBasePath) {
          $analytics.settings.pageTracking.basePath = $window.location.pathname;
        }
        if ($analytics.settings.trackRelativePath) {
          var url = $analytics.settings.pageTracking.basePath + $location.url();
          $analytics.pageTrack(url, $location);
        } else {
          $analytics.pageTrack($location.absUrl(), $location);
        }
      }
    }]);
  }

  if ($analytics.settings.pageTracking.autoTrackVirtualPages) {
    $injector.invoke(['$location', function ($location) {
      if ($analytics.settings.pageTracking.autoBasePath) {
        /* Add the full route to the base. */
        $analytics.settings.pageTracking.basePath = $window.location.pathname + "#";
      }
      if ($injector.has('$route')) {
        $rootScope.$on('$routeChangeSuccess', function (event, current) {
          if (current && (current.$$route||current).redirectTo) return;
          var url = $analytics.settings.pageTracking.basePath + $location.url();
          $analytics.pageTrack(url, $location);
        });
      }
      if ($injector.has('$state')) {
        $rootScope.$on('$stateChangeSuccess', function (event, current) {
          var url = $analytics.settings.pageTracking.basePath + $location.url();
          $analytics.pageTrack(url, $location);
        });
      }
    }]);
  }
  if ($analytics.settings.developerMode) {
    angular.forEach($analytics, function(attr, name) {
      if (typeof attr === 'function') {
        $analytics[name] = function(){};
      }
    });
  }
}])

.directive('analyticsOn', ['$analytics', function ($analytics) {
  function isCommand(element) {
    return ['a:','button:','button:button','button:submit','input:button','input:submit'].indexOf(
      element.tagName.toLowerCase()+':'+(element.type||'')) >= 0;
  }

  function inferEventType(element) {
    if (isCommand(element)) return 'click';
    return 'click';
  }

  function inferEventName(element) {
    if (isCommand(element)) return element.innerText || element.value;
    return element.id || element.name || element.tagName;
  }

  function isProperty(name) {
    return name.substr(0, 9) === 'analytics' && ['On', 'Event', 'If', 'Properties', 'EventType'].indexOf(name.substr(9)) === -1;
  }

  function propertyName(name) {
    var s = name.slice(9); // slice off the 'analytics' prefix
    if (typeof s !== 'undefined' && s!==null && s.length > 0) {
      return s.substring(0, 1).toLowerCase() + s.substring(1);
    }
    else {
      return s;
    }
  }

  return {
    restrict: 'A',
    link: function ($scope, $element, $attrs) {
      var eventType = $attrs.analyticsOn || inferEventType($element[0]);
      var trackingData = {};

      angular.forEach($attrs.$attr, function(attr, name) {
        if (isProperty(name)) {
          trackingData[propertyName(name)] = $attrs[name];
          $attrs.$observe(name, function(value){
            trackingData[propertyName(name)] = value;
          });
        }
      });

      angular.element($element[0]).bind(eventType, function ($event) {
        var eventName = $attrs.analyticsEvent || inferEventName($element[0]);
        trackingData.eventType = $event.type;

        if($attrs.analyticsIf){
          if(! $scope.$eval($attrs.analyticsIf)){
            return; // Cancel this event if we don't pass the analytics-if condition
          }
        }
        // Allow components to pass through an expression that gets merged on to the event properties
        // eg. analytics-properites='myComponentScope.someConfigExpression.$analyticsProperties'
        if($attrs.analyticsProperties){
          angular.extend(trackingData, $scope.$eval($attrs.analyticsProperties));
        }
        $analytics.eventTrack(eventName, trackingData);
      });
    }
  };
}]);
})(angular);

},{}],124:[function(require,module,exports){
/**
 * Autofill event polyfill ##version:1.0.0##
 * (c) 2014 Google, Inc.
 * License: MIT
 */
(function(window) {
  var $ = window.jQuery || window.angular.element;
  var rootElement = window.document.documentElement,
    $rootElement = $(rootElement);

  addGlobalEventListener('change', markValue);
  addValueChangeByJsListener(markValue);

  $.prototype.checkAndTriggerAutoFillEvent = jqCheckAndTriggerAutoFillEvent;

  // Need to use blur and not change event
  // as Chrome does not fire change events in all cases an input is changed
  // (e.g. when starting to type and then finish the input by auto filling a username)
  addGlobalEventListener('blur', function(target) {
    // setTimeout needed for Chrome as it fills other
    // form fields a little later...
    window.setTimeout(function() {
      findParentForm(target).find('input').checkAndTriggerAutoFillEvent();
    }, 20);
  });

  window.document.addEventListener('DOMContentLoaded', function() {
    // mark all values that are present when the DOM is ready.
    // We don't need to trigger a change event here,
    // as js libs start with those values already being set!
    forEach(document.getElementsByTagName('input'), markValue);

    // The timeout is needed for Chrome as it auto fills
    // login forms some time after DOMContentLoaded!
    window.setTimeout(function() {
      $rootElement.find('input').checkAndTriggerAutoFillEvent();
    }, 200);
  }, false);

  return;

  // ----------

  function jqCheckAndTriggerAutoFillEvent() {
    var i, el;
    for (i=0; i<this.length; i++) {
      el = this[i];
      if (!valueMarked(el)) {
        markValue(el);
        triggerChangeEvent(el);
      }
    }
  }

  function valueMarked(el) {
    if (! ("$$currentValue" in el) ) {
      // First time we see an element we take it's value attribute
      // as real value. This might have been filled in the backend,
      // ...
      // Note: it's important to not use the value property here!
      el.$$currentValue = el.getAttribute('value');
    }

    var val = el.value,
         $$currentValue = el.$$currentValue;
    if (!val && !$$currentValue) {
      return true;
    }
    return val === $$currentValue;
  }

  function markValue(el) {
    el.$$currentValue = el.value;
  }

  function addValueChangeByJsListener(listener) {
    var jq = window.jQuery || window.angular.element,
        jqProto = jq.prototype;
    var _val = jqProto.val;
    jqProto.val = function(newValue) {
      var res = _val.apply(this, arguments);
      if (arguments.length > 0) {
        forEach(this, function(el) {
          listener(el, newValue);
        });
      }
      return res;
    };
  }

  function addGlobalEventListener(eventName, listener) {
    // Use a capturing event listener so that
    // we also get the event when it's stopped!
    // Also, the blur event does not bubble.
    rootElement.addEventListener(eventName, onEvent, true);

    function onEvent(event) {
      var target = event.target;
      listener(target);
    }
  }

  function findParentForm(el) {
    while (el) {
      if (el.nodeName === 'FORM') {
        return $(el);
      }
      el = el.parentNode;
    }
    return $();
  }

  function forEach(arr, listener) {
    if (arr.forEach) {
      return arr.forEach(listener);
    }
    var i;
    for (i=0; i<arr.length; i++) {
      listener(arr[i]);
    }
  }

  function triggerChangeEvent(element) {
    var doc = window.document;
    var event = doc.createEvent("HTMLEvents");
    event.initEvent("change", true, true);
    element.dispatchEvent(event);
  }



})(window);

},{}],125:[function(require,module,exports){
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */

'use strict';

/**
 * Module variables.
 * @private
 */

var matchHtmlRegExp = /["'&<>]/;

/**
 * Module exports.
 * @public
 */

module.exports = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html;
}

},{}],126:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var undefined;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	'use strict';
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	'use strict';
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],127:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],128:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var baseToString = require('lodash._basetostring');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]/g;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to determine if values are of the language type `Object`. */
var objectTypes = {
  'function': true,
  'object': true
};

/** Detect free variable `exports`. */
var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
  ? exports
  : undefined;

/** Detect free variable `module`. */
var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
  ? module
  : undefined;

/** Detect free variable `global` from Node.js. */
var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

/** Detect free variable `self`. */
var freeSelf = checkGlobal(objectTypes[typeof self] && self);

/** Detect free variable `window`. */
var freeWindow = checkGlobal(objectTypes[typeof window] && window);

/** Detect `this` as the global object. */
var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

/**
 * Used as a reference to the global object.
 *
 * The `this` value is used if it's the global object to avoid Greasemonkey's
 * restricted `window` object, otherwise the `window` object is used.
 */
var root = freeGlobal ||
  ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
    freeSelf || thisGlobal || Function('return this')();

/**
 * Checks if `value` is a global object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
 */
function checkGlobal(value) {
  return (value && value.Object === Object) ? value : null;
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var splice = arrayProto.splice;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map'),
    nativeCreate = getNative(Object, 'create');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoize(function(string) {
  var result = [];
  toString(string).replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'user': 'fred' };
 * var other = { 'user': 'fred' };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (!isObject(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = stringToPath;

}).call(this,typeof self !== "undefined" ? self : window)

},{"lodash._basetostring":129}],129:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to determine if values are of the language type `Object`. */
var objectTypes = {
  'function': true,
  'object': true
};

/** Detect free variable `exports`. */
var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
  ? exports
  : undefined;

/** Detect free variable `module`. */
var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
  ? module
  : undefined;

/** Detect free variable `global` from Node.js. */
var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

/** Detect free variable `self`. */
var freeSelf = checkGlobal(objectTypes[typeof self] && self);

/** Detect free variable `window`. */
var freeWindow = checkGlobal(objectTypes[typeof window] && window);

/** Detect `this` as the global object. */
var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

/**
 * Used as a reference to the global object.
 *
 * The `this` value is used if it's the global object to avoid Greasemonkey's
 * restricted `window` object, otherwise the `window` object is used.
 */
var root = freeGlobal ||
  ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
    freeSelf || thisGlobal || Function('return this')();

/**
 * Checks if `value` is a global object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
 */
function checkGlobal(value) {
  return (value && value.Object === Object) ? value : null;
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Symbol = root.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

module.exports = baseToString;

}).call(this,typeof self !== "undefined" ? self : window)

},{}],130:[function(require,module,exports){
/**
 * lodash 4.0.6 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @type {Function}
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred function to be invoked.
 */
var now = Date.now;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide an options object to indicate whether `func` should be invoked on
 * the leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent calls
 * to the debounced function return the result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime = 0,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (!lastCallTime || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    clearTimeout(timerId);
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastCallTime = lastInvokeTime = 0;
    lastArgs = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3);
 * // => 3
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3');
 * // => 3
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = isFunction(value.valueOf) ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;

},{}],131:[function(require,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var stringToPath = require('lodash._stringtopath');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value) {
  return isArray(value) ? value : stringToPath(value);
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @type {Function}
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is used in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

module.exports = get;

},{"lodash._stringtopath":128}],132:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

/*global window, require, define */
(function(_window) {
  'use strict';

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng, _mathRNG, _nodeRNG, _whatwgRNG, _previousRoot;

  function setupBrowser() {
    // Allow for MSIE11 msCrypto
    var _crypto = _window.crypto || _window.msCrypto;

    if (!_rng && _crypto && _crypto.getRandomValues) {
      // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
      //
      // Moderately fast, high quality
      try {
        var _rnds8 = new Uint8Array(16);
        _whatwgRNG = _rng = function whatwgRNG() {
          _crypto.getRandomValues(_rnds8);
          return _rnds8;
        };
        _rng();
      } catch(e) {}
    }

    if (!_rng) {
      // Math.random()-based (RNG)
      //
      // If all else fails, use Math.random().  It's fast, but is of unspecified
      // quality.
      var  _rnds = new Array(16);
      _mathRNG = _rng = function() {
        for (var i = 0, r; i < 16; i++) {
          if ((i & 0x03) === 0) { r = Math.random() * 0x100000000; }
          _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
        }

        return _rnds;
      };
      if ('undefined' !== typeof console && console.warn) {
        console.warn("[SECURITY] node-uuid: crypto not usable, falling back to insecure Math.random()");
      }
    }
  }

  function setupNode() {
    // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
    //
    // Moderately fast, high quality
    if ('function' === typeof require) {
      try {
        var _rb = require('crypto').randomBytes;
        _nodeRNG = _rng = _rb && function() {return _rb(16);};
        _rng();
      } catch(e) {}
    }
  }

  if (_window) {
    setupBrowser();
  } else {
    setupNode();
  }

  // Buffer class to use
  var BufferClass = ('function' === typeof Buffer) ? Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = (options.clockseq != null) ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = (options.msecs != null) ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = (options.nsecs != null) ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) === 'string') {
      buf = (options === 'binary') ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;
  uuid._rng = _rng;
  uuid._mathRNG = _mathRNG;
  uuid._nodeRNG = _nodeRNG;
  uuid._whatwgRNG = _whatwgRNG;

  if (('undefined' !== typeof module) && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});


  } else {
    // Publish as global (in browsers)
    _previousRoot = _window.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _window.uuid = _previousRoot;
      return uuid;
    };

    _window.uuid = uuid;
  }
})('undefined' !== typeof window ? window : null);

},{"crypto":undefined}],133:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.7.1
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

}).call(this,require('_process'))

},{"_process":134}],134:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],135:[function(require,module,exports){
'use strict';
var strictUriEncode = require('strict-uri-encode');

exports.extract = function (str) {
	return str.split('?')[1] || '';
};

exports.parse = function (str) {
	if (typeof str !== 'string') {
		return {};
	}

	str = str.trim().replace(/^(\?|#|&)/, '');

	if (!str) {
		return {};
	}

	return str.split('&').reduce(function (ret, param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;

		key = decodeURIComponent(key);

		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeURIComponent(val);

		if (!ret.hasOwnProperty(key)) {
			ret[key] = val;
		} else if (Array.isArray(ret[key])) {
			ret[key].push(val);
		} else {
			ret[key] = [ret[key], val];
		}

		return ret;
	}, {});
};

exports.stringify = function (obj) {
	return obj ? Object.keys(obj).sort().map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return key;
		}

		if (Array.isArray(val)) {
			return val.slice().sort().map(function (val2) {
				return strictUriEncode(key) + '=' + strictUriEncode(val2);
			}).join('&');
		}

		return strictUriEncode(key) + '=' + strictUriEncode(val);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};

},{"strict-uri-encode":155}],136:[function(require,module,exports){
(function (global){
var now = require('performance-now')
  , root = typeof window === 'undefined' ? global : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function() {
  root.requestAnimationFrame = raf
  root.cancelAnimationFrame = caf
}

}).call(this,typeof self !== "undefined" ? self : window)

},{"performance-now":133}],137:[function(require,module,exports){
/**
 * Angular.js plugin
 *
 * Provides an $exceptionHandler for Angular.js
 */
'use strict';

// See https://github.com/angular/angular.js/blob/v1.4.7/src/minErr.js
var angularPattern = /^\[((?:[$a-zA-Z0-9]+:)?(?:[$a-zA-Z0-9]+))\] (.+?)\n(\S+)$/;

function angularPlugin(Raven, angular) {
    angular = angular || window.angular;

    if (!angular) return;

    function RavenProvider() {
        this.$get = ['$window', function($window) {
            return Raven;
        }];
    }

    function ExceptionHandlerProvider($provide) {
        $provide.decorator('$exceptionHandler',
            ['Raven', '$delegate', exceptionHandler]);
    }

    function exceptionHandler(R, $delegate) {
        return function (ex, cause) {
            R.captureException(ex, {
                extra: { cause: cause }
            });
            $delegate(ex, cause);
        };
    }

    angular.module('ngRaven', [])
        .provider('Raven',  RavenProvider)
        .config(['$provide', ExceptionHandlerProvider]);

    Raven.setDataCallback(function(data) {
        // We only care about mutating an exception
        var exception = data.exception;
        if (exception) {
            exception = exception.values[0];
            var matches = angularPattern.exec(exception.value);

            if (matches) {
                // This type now becomes something like: $rootScope:inprog
                exception.type = matches[1];
                exception.value = matches[2];
                data.message = exception.type + ': ' + exception.value;
                // auto set a new tag specifically for the angular error url
                data.extra.angularDocs = matches[3].substr(0, 250);
            }
        }
    });
}

module.exports = angularPlugin;

},{}],138:[function(require,module,exports){
'use strict';

exports.__esModule = true;
function createThunkMiddleware(extraArgument) {
  return function (_ref) {
    var dispatch = _ref.dispatch;
    var getState = _ref.getState;
    return function (next) {
      return function (action) {
        if (typeof action === 'function') {
          return action(dispatch, getState, extraArgument);
        }

        return next(action);
      };
    };
  };
}

var thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

exports['default'] = thunk;
},{}],139:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports["default"] = applyMiddleware;

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function (reducer, initialState, enhancer) {
      var store = createStore(reducer, initialState, enhancer);
      var _dispatch = store.dispatch;
      var chain = [];

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = _compose2["default"].apply(undefined, chain)(store.dispatch);

      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}
},{"./compose":142}],140:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports["default"] = bindActionCreators;
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }

  var keys = Object.keys(actionCreators);
  var boundActionCreators = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}
},{}],141:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;
exports["default"] = combineReducers;

var _createStore = require('./createStore');

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'initialState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!(0, _isPlainObject2["default"])(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key);
  });

  if (unexpectedKeys.length > 0) {
    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
  }
}

function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
    if (typeof reducer(undefined, { type: type }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
    }
  });
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  var sanityError;
  try {
    assertReducerSanity(finalReducers);
  } catch (e) {
    sanityError = e;
  }

  return function combination() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];

    if (sanityError) {
      throw sanityError;
    }

    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action);
      if (warningMessage) {
        (0, _warning2["default"])(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i];
      var reducer = finalReducers[key];
      var previousStateForKey = state[key];
      var nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
}).call(this,require('_process'))

},{"./createStore":143,"./utils/warning":145,"_process":134,"lodash/isPlainObject":149}],142:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = compose;
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  } else {
    var _ret = function () {
      var last = funcs[funcs.length - 1];
      var rest = funcs.slice(0, -1);
      return {
        v: function v() {
          return rest.reduceRight(function (composed, f) {
            return f(composed);
          }, last.apply(undefined, arguments));
        }
      };
    }();

    if (typeof _ret === "object") return _ret.v;
  }
}
},{}],143:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.ActionTypes = undefined;
exports["default"] = createStore;

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _symbolObservable = require('symbol-observable');

var _symbolObservable2 = _interopRequireDefault(_symbolObservable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = exports.ActionTypes = {
  INIT: '@@redux/INIT'
};

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [initialState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} enhancer The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
function createStore(reducer, initialState, enhancer) {
  var _ref2;

  if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
    enhancer = initialState;
    initialState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, initialState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = initialState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState;
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    var isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!(0, _isPlainObject2["default"])(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]();
    }

    return action;
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/zenparsing/es-observable
   */
  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */

      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return { unsubscribe: unsubscribe };
      }
    }, _ref[_symbolObservable2["default"]] = function () {
      return this;
    }, _ref;
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT });

  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[_symbolObservable2["default"]] = observable, _ref2;
}
},{"lodash/isPlainObject":149,"symbol-observable":156}],144:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;
exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

var _createStore = require('./createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _combineReducers = require('./combineReducers');

var _combineReducers2 = _interopRequireDefault(_combineReducers);

var _bindActionCreators = require('./bindActionCreators');

var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

var _applyMiddleware = require('./applyMiddleware');

var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  (0, _warning2["default"])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

exports.createStore = _createStore2["default"];
exports.combineReducers = _combineReducers2["default"];
exports.bindActionCreators = _bindActionCreators2["default"];
exports.applyMiddleware = _applyMiddleware2["default"];
exports.compose = _compose2["default"];
}).call(this,require('_process'))

},{"./applyMiddleware":139,"./bindActionCreators":140,"./combineReducers":141,"./compose":142,"./createStore":143,"./utils/warning":145,"_process":134}],145:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports["default"] = warning;
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}
},{}],146:[function(require,module,exports){
/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetPrototype = Object.getPrototypeOf;

/**
 * Gets the `[[Prototype]]` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {null|Object} Returns the `[[Prototype]]`.
 */
function getPrototype(value) {
  return nativeGetPrototype(Object(value));
}

module.exports = getPrototype;

},{}],147:[function(require,module,exports){
/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

module.exports = isHostObject;

},{}],148:[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],149:[function(require,module,exports){
var getPrototype = require('./_getPrototype'),
    isHostObject = require('./_isHostObject'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object,
 *  else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) ||
      objectToString.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
}

module.exports = isPlainObject;

},{"./_getPrototype":146,"./_isHostObject":147,"./isObjectLike":148}],150:[function(require,module,exports){
module.exports = require('./lib/retry');
},{"./lib/retry":151}],151:[function(require,module,exports){
var RetryOperation = require('./retry_operation');

exports.operation = function(options) {
  var retryForever = false;
  if (options && options.forever === true) retryForever = true;
  var timeouts = exports.timeouts(options);
  return new RetryOperation(timeouts, retryForever);
};

exports.timeouts = function(options) {
  if (options instanceof Array) {
    return [].concat(options);
  }

  var opts = {
    retries: 10,
    factor: 2,
    minTimeout: 1 * 1000,
    maxTimeout: Infinity,
    randomize: false
  };
  for (var key in options) {
    opts[key] = options[key];
  }

  if (opts.minTimeout > opts.maxTimeout) {
    throw new Error('minTimeout is greater than maxTimeout');
  }

  var timeouts = [];
  for (var i = 0; i < opts.retries; i++) {
    timeouts.push(this.createTimeout(i, opts));
  }

  // sort the array numerically ascending
  timeouts.sort(function(a,b) {
    return a - b;
  });

  return timeouts;
};

exports.createTimeout = function(attempt, opts) {
  var random = (opts.randomize)
    ? (Math.random() + 1)
    : 1;

  var timeout = Math.round(random * opts.minTimeout * Math.pow(opts.factor, attempt));
  timeout = Math.min(timeout, opts.maxTimeout);

  return timeout;
};

exports.wrap = function(obj, options, methods) {
  if (options instanceof Array) {
    methods = options;
    options = null;
  }

  if (!methods) {
    methods = [];
    for (var key in obj) {
      if (typeof obj[key] === 'function') {
        methods.push(key);
      }
    }
  }

  for (var i = 0; i < methods.length; i++) {
    var method   = methods[i];
    var original = obj[method];

    obj[method] = function retryWrapper() {
      var op       = exports.operation(options);
      var args     = Array.prototype.slice.call(arguments);
      var callback = args.pop();

      args.push(function(err) {
        if (op.retry(err)) {
          return;
        }
        if (err) {
          arguments[0] = op.mainError();
        }
        callback.apply(this, arguments);
      });

      op.attempt(function() {
        original.apply(obj, args);
      });
    };
    obj[method].options = options;
  }
};

},{"./retry_operation":152}],152:[function(require,module,exports){
function RetryOperation(timeouts, retryForever) {
  this._timeouts = timeouts;
  this._fn = null;
  this._errors = [];
  this._attempts = 1;
  this._operationTimeout = null;
  this._operationTimeoutCb = null;
  this._timeout = null;

  if (!!retryForever) {
    this._cachedTimeouts = this._timeouts.slice(0);
  }
}
module.exports = RetryOperation;

RetryOperation.prototype.retry = function(err) {
  if (this._timeout) {
    clearTimeout(this._timeout);
  }

  if (!err) {
    return false;
  }

  this._errors.push(err);

  var timeout = this._timeouts.shift();
  if (timeout === undefined) {
    if (this._cachedTimeouts) {
      // retry forever, only keep last error
      this._errors.splice(this._errors.length - 1, this._errors.length);
      this._timeouts = this._cachedTimeouts.slice(0);
      timeout = this._timeouts.shift();
    } else {
      return false;
    }
  }

  var self = this;
  setTimeout(function() {
    self._attempts++;

    if (self._operationTimeoutCb) {
      self._timeout = setTimeout(function() {
        self._operationTimeoutCb(self._attempts);
      }, self._operationTimeout);
    }

    self._fn(self._attempts);
  }, timeout);

  return true;
};

RetryOperation.prototype.attempt = function(fn, timeoutOps) {
  this._fn = fn;

  if (timeoutOps) {
    if (timeoutOps.timeout) {
      this._operationTimeout = timeoutOps.timeout;
    }
    if (timeoutOps.cb) {
      this._operationTimeoutCb = timeoutOps.cb;
    }
  }

  var self = this;
  if (this._operationTimeoutCb) {
    this._timeout = setTimeout(function() {
      self._operationTimeoutCb();
    }, self._operationTimeout);
  }

  this._fn(this._attempts);
};

RetryOperation.prototype.try = function(fn) {
  console.log('Using RetryOperation.try() is deprecated');
  this.attempt(fn);
};

RetryOperation.prototype.start = function(fn) {
  console.log('Using RetryOperation.start() is deprecated');
  this.attempt(fn);
};

RetryOperation.prototype.start = RetryOperation.prototype.try;

RetryOperation.prototype.errors = function() {
  return this._errors;
};

RetryOperation.prototype.attempts = function() {
  return this._attempts;
};

RetryOperation.prototype.mainError = function() {
  if (this._errors.length === 0) {
    return null;
  }

  var counts = {};
  var mainError = null;
  var mainErrorCount = 0;

  for (var i = 0; i < this._errors.length; i++) {
    var error = this._errors[i];
    var message = error.message;
    var count = (counts[message] || 0) + 1;

    counts[message] = count;

    if (count >= mainErrorCount) {
      mainError = error;
      mainErrorCount = count;
    }
  }

  return mainError;
};

},{}],153:[function(require,module,exports){
var raf = require('raf'),
    COMPLETE = 'complete',
    CANCELED = 'canceled';

function setElementScroll(element, x, y){
    if(element === window){
        element.scrollTo(x, y);
    }else{
        element.scrollLeft = x;
        element.scrollTop = y;
    }
}

function getTargetScrollLocation(target, parent, align){
    var targetPosition = target.getBoundingClientRect(),
        parentPosition,
        x,
        y,
        differenceX,
        differenceY,
        leftAlign = align && align.left != null ? align.left : 0.5,
        topAlign = align && align.top != null ? align.top : 0.5,
        leftScalar = leftAlign,
        topScalar = topAlign;

    if(parent === window){
        x = targetPosition.left + window.scrollX - window.innerWidth * leftScalar + Math.min(targetPosition.width, window.innerWidth) * leftScalar;
        y = targetPosition.top + window.scrollY - window.innerHeight * topScalar + Math.min(targetPosition.height, window.innerHeight) * topScalar;
        x = Math.max(Math.min(x, document.body.scrollWidth - window.innerWidth * leftScalar), 0);
        y = Math.max(Math.min(y, document.body.scrollHeight- window.innerHeight * topScalar), 0);
        differenceX = x - window.scrollX;
        differenceY = y - window.scrollY;
    }else{
        parentPosition = parent.getBoundingClientRect();
        var offsetTop = targetPosition.top - (parentPosition.top - parent.scrollTop);
        var offsetLeft = targetPosition.left - (parentPosition.left - parent.scrollLeft);
        x = offsetLeft + (targetPosition.width * leftScalar) - parent.clientWidth * leftScalar;
        y = offsetTop + (targetPosition.height * topScalar) - parent.clientHeight * topScalar;
        x = Math.max(Math.min(x, parent.scrollWidth - parent.clientWidth), 0);
        y = Math.max(Math.min(y, parent.scrollHeight - parent.clientHeight), 0);
        differenceX = x - parent.scrollLeft;
        differenceY = y - parent.scrollTop;
    }

    return {
        x: x,
        y: y,
        differenceX: differenceX,
        differenceY: differenceY
    };
}

function animate(parent){
    raf(function(){
        var scrollSettings = parent._scrollSettings;
        if(!scrollSettings){
            return;
        }

        var location = getTargetScrollLocation(scrollSettings.target, parent, scrollSettings.align),
            time = Date.now() - scrollSettings.startTime,
            timeValue = Math.min(1 / scrollSettings.time * time, 1);

        if(
            time > scrollSettings.time + 20 ||
            (Math.abs(location.differenceY) <= 1 && Math.abs(location.differenceX) <= 1)
        ){
            setElementScroll(parent, location.x, location.y);
            parent._scrollSettings = null;
            return scrollSettings.end(COMPLETE);
        }

        var valueX = timeValue,
            valueY = timeValue;

        setElementScroll(parent,
            location.x - location.differenceX * Math.pow(1 - valueX, valueX / 2),
            location.y - location.differenceY * Math.pow(1 - valueY, valueY / 2)
        );

        animate(parent);
    });
}

function transitionScrollTo(target, parent, settings, callback){
    var idle = !parent._scrollSettings;

    if(parent._scrollSettings){
        parent._scrollSettings.end(CANCELED);
    }

    function end(endType){
        parent._scrollSettings = null;
        callback(endType);
        parent.removeEventListener('touchstart', end);
    }

    parent._scrollSettings = {
        startTime: Date.now(),
        target: target,
        time: settings.time,
        ease: settings.ease,
        align: settings.align,
        end: end
    };
    parent.addEventListener('touchstart', end.bind(null, CANCELED));

    if(idle){
        animate(parent);
    }
}

module.exports = function(target, settings, callback){
    if(!target){
        return;
    }

    if(typeof settings === 'function'){
        callback = settings;
        settings = null;
    }

    if(!settings){
        settings = {};
    }

    settings.time = settings.time || 1000;
    settings.ease = settings.ease || function(v){return v;};

    var parent = target.parentElement,
        parents = 0;

    function done(endType){
        parents--;
        if(!parents){
            callback && callback(endType);
        }
    }

    while(parent){
        if(
            settings.validTarget ? settings.validTarget(parent, parents) : true &&
            parent === window ||
            (
                parent.scrollHeight !== parent.clientHeight ||
                parent.scrollWidth !== parent.clientWidth
            ) &&
            getComputedStyle(parent).overflow !== 'hidden'
        ){
            parents++;
            transitionScrollTo(target, parent, settings, done);
        }

        parent = parent.parentElement;

        if(!parent){
            return;
        }

        if(parent.tagName === 'BODY'){
            parent = window;
        }
    }
};
},{"raf":136}],154:[function(require,module,exports){
(function (process,global){
(function() {
  "use strict";

  // https://github.com/facebook/react/blob/v15.0.1/src/isomorphic/classic/element/ReactElement.js#L21
  var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element');
  var REACT_ELEMENT_TYPE_FALLBACK = 0xeac7;

  function addPropertyTo(target, methodName, value) {
    Object.defineProperty(target, methodName, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: value
    });
  }

  function banProperty(target, methodName) {
    addPropertyTo(target, methodName, function() {
      throw new ImmutableError("The " + methodName +
        " method cannot be invoked on an Immutable data structure.");
    });
  }

  var immutabilityTag = "__immutable_invariants_hold";

  function addImmutabilityTag(target) {
    addPropertyTo(target, immutabilityTag, true);
  }

  function isImmutable(target) {
    if (typeof target === "object") {
      return target === null || Boolean(
        Object.getOwnPropertyDescriptor(target, immutabilityTag)
      );
    } else {
      // In JavaScript, only objects are even potentially mutable.
      // strings, numbers, null, and undefined are all naturally immutable.
      return true;
    }
  }

  function isMergableObject(target) {
    return target !== null && typeof target === "object" && !(target instanceof Array) && !(target instanceof Date);
  }

  var mutatingObjectMethods = [
    "setPrototypeOf"
  ];

  var nonMutatingObjectMethods = [
    "keys"
  ];

  var mutatingArrayMethods = mutatingObjectMethods.concat([
    "push", "pop", "sort", "splice", "shift", "unshift", "reverse"
  ]);

  var nonMutatingArrayMethods = nonMutatingObjectMethods.concat([
    "map", "filter", "slice", "concat", "reduce", "reduceRight"
  ]);

  var mutatingDateMethods = mutatingObjectMethods.concat([
    "setDate", "setFullYear", "setHours", "setMilliseconds", "setMinutes", "setMonth", "setSeconds",
    "setTime", "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds", "setUTCMinutes",
    "setUTCMonth", "setUTCSeconds", "setYear"
  ]);

  function ImmutableError(message) {
    var err       = new Error(message);
    // TODO: Consider `Object.setPrototypeOf(err, ImmutableError);`
    err.__proto__ = ImmutableError;

    return err;
  }
  ImmutableError.prototype = Error.prototype;

  function makeImmutable(obj, bannedMethods) {
    // Tag it so we can quickly tell it's immutable later.
    addImmutabilityTag(obj);

    if (process.env.NODE_ENV !== "production") {
      // Make all mutating methods throw exceptions.
      for (var index in bannedMethods) {
        if (bannedMethods.hasOwnProperty(index)) {
          banProperty(obj, bannedMethods[index]);
        }
      }

      // Freeze it and return it.
      Object.freeze(obj);
    }

    return obj;
  }

  function makeMethodReturnImmutable(obj, methodName) {
    var currentMethod = obj[methodName];

    addPropertyTo(obj, methodName, function() {
      return Immutable(currentMethod.apply(obj, arguments));
    });
  }

  function arraySet(idx, value) {
    if (idx in this && this[idx] === value) {
      return this;
    }

    var mutable = asMutableArray.call(this);
    mutable[idx] = Immutable(value);
    return makeImmutableArray(mutable);
  }

  var immutableEmptyArray = Immutable([]);

  function arraySetIn(pth, value) {
    var head = pth[0];

    if (pth.length === 1) {
      return arraySet.call(this, head, value);
    } else {
      var tail = pth.slice(1);
      var thisHead = this[head];
      var newValue;

      if (typeof(thisHead) === "object" && thisHead !== null && typeof(thisHead.setIn) === "function") {
        // Might (validly) be object or array
        newValue = thisHead.setIn(tail, value);
      } else {
        newValue = arraySetIn.call(immutableEmptyArray, tail, value);
      }

      if (head in this && thisHead === newValue) {
        return this;
      }

      var mutable = asMutableArray.call(this);
      mutable[head] = newValue;
      return makeImmutableArray(mutable);
    }
  }

  function makeImmutableArray(array) {
    // Don't change their implementations, but wrap these functions to make sure
    // they always return an immutable value.
    for (var index in nonMutatingArrayMethods) {
      if (nonMutatingArrayMethods.hasOwnProperty(index)) {
        var methodName = nonMutatingArrayMethods[index];
        makeMethodReturnImmutable(array, methodName);
      }
    }

    addPropertyTo(array, "flatMap",  flatMap);
    addPropertyTo(array, "asObject", asObject);
    addPropertyTo(array, "asMutable", asMutableArray);
    addPropertyTo(array, "set", arraySet);
    addPropertyTo(array, "setIn", arraySetIn);
    addPropertyTo(array, "update", update);
    addPropertyTo(array, "updateIn", updateIn);

    for(var i = 0, length = array.length; i < length; i++) {
      array[i] = Immutable(array[i]);
    }

    return makeImmutable(array, mutatingArrayMethods);
  }

  function makeImmutableDate(date) {
    addPropertyTo(date, "asMutable", asMutableDate);

    return makeImmutable(date, mutatingDateMethods);
  }

  function asMutableDate() {
    return new Date(this.getTime());
  }

  /**
   * Effectively performs a map() over the elements in the array, using the
   * provided iterator, except that whenever the iterator returns an array, that
   * array's elements are added to the final result instead of the array itself.
   *
   * @param {function} iterator - The iterator function that will be invoked on each element in the array. It will receive three arguments: the current value, the current index, and the current object.
   */
  function flatMap(iterator) {
    // Calling .flatMap() with no arguments is a no-op. Don't bother cloning.
    if (arguments.length === 0) {
      return this;
    }

    var result = [],
        length = this.length,
        index;

    for (index = 0; index < length; index++) {
      var iteratorResult = iterator(this[index], index, this);

      if (iteratorResult instanceof Array) {
        // Concatenate Array results into the return value we're building up.
        result.push.apply(result, iteratorResult);
      } else {
        // Handle non-Array results the same way map() does.
        result.push(iteratorResult);
      }
    }

    return makeImmutableArray(result);
  }

  /**
   * Returns an Immutable copy of the object without the given keys included.
   *
   * @param {array} keysToRemove - A list of strings representing the keys to exclude in the return value. Instead of providing a single array, this method can also be called by passing multiple strings as separate arguments.
   */
  function without(remove) {
    // Calling .without() with no arguments is a no-op. Don't bother cloning.
    if (typeof remove === "undefined" && arguments.length === 0) {
      return this;
    }

    if (typeof remove !== "function") {
      // If we weren't given an array, use the arguments list.
      var keysToRemoveArray = (remove instanceof Array) ?
         remove : Array.prototype.slice.call(arguments);

      remove = function(val, key) {
        return keysToRemoveArray.indexOf(key) !== -1;
      };
    }

    var result = this.instantiateEmptyObject();

    for (var key in this) {
      if (this.hasOwnProperty(key) && remove(this[key], key) === false) {
        result[key] = this[key];
      }
    }

    return makeImmutableObject(result,
      {instantiateEmptyObject: this.instantiateEmptyObject});
  }

  function asMutableArray(opts) {
    var result = [], i, length;

    if(opts && opts.deep) {
      for(i = 0, length = this.length; i < length; i++) {
        result.push(asDeepMutable(this[i]));
      }
    } else {
      for(i = 0, length = this.length; i < length; i++) {
        result.push(this[i]);
      }
    }

    return result;
  }

  /**
   * Effectively performs a [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) over the elements in the array, expecting that the iterator function
   * will return an array of two elements - the first representing a key, the other
   * a value. Then returns an Immutable Object constructed of those keys and values.
   *
   * @param {function} iterator - A function which should return an array of two elements - the first representing the desired key, the other the desired value.
   */
  function asObject(iterator) {
    // If no iterator was provided, assume the identity function
    // (suggesting this array is already a list of key/value pairs.)
    if (typeof iterator !== "function") {
      iterator = function(value) { return value; };
    }

    var result = {},
        length = this.length,
        index;

    for (index = 0; index < length; index++) {
      var pair  = iterator(this[index], index, this),
          key   = pair[0],
          value = pair[1];

      result[key] = value;
    }

    return makeImmutableObject(result);
  }

  function asDeepMutable(obj) {
    if (
      (!obj) ||
      (typeof obj !== 'object') ||
      (!Object.getOwnPropertyDescriptor(obj, immutabilityTag)) ||
      (obj instanceof Date)
    ) { return obj; }
    return obj.asMutable({deep: true});
  }

  function quickCopy(src, dest) {
    for (var key in src) {
      if (Object.getOwnPropertyDescriptor(src, key)) {
        dest[key] = src[key];
      }
    }

    return dest;
  }

  /**
   * Returns an Immutable Object containing the properties and values of both
   * this object and the provided object, prioritizing the provided object's
   * values whenever the same key is present in both objects.
   *
   * @param {object} other - The other object to merge. Multiple objects can be passed as an array. In such a case, the later an object appears in that list, the higher its priority.
   * @param {object} config - Optional config object that contains settings. Supported settings are: {deep: true} for deep merge and {merger: mergerFunc} where mergerFunc is a function
   *                          that takes a property from both objects. If anything is returned it overrides the normal merge behaviour.
   */
  function merge(other, config) {
    // Calling .merge() with no arguments is a no-op. Don't bother cloning.
    if (arguments.length === 0) {
      return this;
    }

    if (other === null || (typeof other !== "object")) {
      throw new TypeError("Immutable#merge can only be invoked with objects or arrays, not " + JSON.stringify(other));
    }

    var receivedArray = (other instanceof Array),
        deep          = config && config.deep,
        merger        = config && config.merger,
        result;

    // Use the given key to extract a value from the given object, then place
    // that value in the result object under the same key. If that resulted
    // in a change from this object's value at that key, set anyChanges = true.
    function addToResult(currentObj, otherObj, key) {
      var immutableValue = Immutable(otherObj[key]);
      var mergerResult = merger && merger(currentObj[key], immutableValue, config);
      var currentValue = currentObj[key];

      if ((result !== undefined) ||
        (mergerResult !== undefined) ||
        (!currentObj.hasOwnProperty(key) ||
        ((immutableValue !== currentValue) &&
          // Avoid false positives due to (NaN !== NaN) evaluating to true
          (immutableValue === immutableValue)))) {

        var newValue;

        if (mergerResult) {
          newValue = mergerResult;
        } else if (deep && isMergableObject(currentValue) && isMergableObject(immutableValue)) {
          newValue = currentValue.merge(immutableValue, config);
        } else {
          newValue = immutableValue;
        }

        // We check (newValue === newValue) because (NaN !== NaN) in JS
        if (((currentValue !== newValue) && (newValue === newValue)) ||
            !currentObj.hasOwnProperty(key)) {
          if (result === undefined) {
            // Make a shallow clone of the current object.
            result = quickCopy(currentObj, currentObj.instantiateEmptyObject());
          }

          result[key] = newValue;
        }
      }
    }

    var key;

    // Achieve prioritization by overriding previous values that get in the way.
    if (!receivedArray) {
      // The most common use case: just merge one object into the existing one.
      for (key in other) {
        if (Object.getOwnPropertyDescriptor(other, key)) {
          addToResult(this, other, key);
        }
      }
    } else {
      // We also accept an Array
      for (var index=0; index < other.length; index++) {
        var otherFromArray = other[index];

        for (key in otherFromArray) {
          if (otherFromArray.hasOwnProperty(key)) {
            addToResult(this, otherFromArray, key);
          }
        }
      }
    }

    if (result === undefined) {
      return this;
    } else {
      return makeImmutableObject(result,
        {instantiateEmptyObject: this.instantiateEmptyObject});
    }
  }

  var immutableEmptyObject = Immutable({});

  function objectSetIn(path, value) {
    var head = path[0];
    if (path.length === 1) {
      return objectSet.call(this, head, value);
    }

    var tail = path.slice(1);
    var newValue;
    var thisHead = this[head];

    if (this.hasOwnProperty(head) && typeof(thisHead) === "object" && thisHead !== null && typeof(thisHead.setIn) === "function") {
      // Might (validly) be object or array
      newValue = thisHead.setIn(tail, value);
    } else {
      newValue = objectSetIn.call(immutableEmptyObject, tail, value);
    }

    if (this.hasOwnProperty(head) && thisHead === newValue) {
      return this;
    }

    var mutable = quickCopy(this, this.instantiateEmptyObject());
    mutable[head] = newValue;
    return makeImmutableObject(mutable, this);
  }

  function objectSet(property, value) {
    if (this.hasOwnProperty(property) && this[property] === value) {
      return this;
    }

    var mutable = quickCopy(this, this.instantiateEmptyObject());
    mutable[property] = Immutable(value);
    return makeImmutableObject(mutable, this);
  }

  function update(property, updater) {
    var restArgs = Array.prototype.slice.call(arguments, 2);
    var initialVal = this[property];
    return this.set(property, updater.apply(initialVal, [initialVal].concat(restArgs)));
  }

  function getInPath(obj, path) {
    /*jshint eqnull:true */
    for (var i = 0, l = path.length; obj != null && i < l; i++) {
      obj = obj[path[i]];
    }

    return (i && i == l) ? obj : undefined;
  }

  function updateIn(path, updater) {
    var restArgs = Array.prototype.slice.call(arguments, 2);
    var initialVal = getInPath(this, path);

    return this.setIn(path, updater.apply(initialVal, [initialVal].concat(restArgs)));
  }

  function asMutableObject(opts) {
    var result = this.instantiateEmptyObject(), key;

    if(opts && opts.deep) {
      for (key in this) {
        if (this.hasOwnProperty(key)) {
          result[key] = asDeepMutable(this[key]);
        }
      }
    } else {
      for (key in this) {
        if (this.hasOwnProperty(key)) {
          result[key] = this[key];
        }
      }
    }

    return result;
  }

  // Creates plain object to be used for cloning
  function instantiatePlainObject() {
    return {};
  }

  // Finalizes an object with immutable methods, freezes it, and returns it.
  function makeImmutableObject(obj, options) {
    var instantiateEmptyObject =
      (options && options.instantiateEmptyObject) ?
        options.instantiateEmptyObject : instantiatePlainObject;

    addPropertyTo(obj, "merge", merge);
    addPropertyTo(obj, "without", without);
    addPropertyTo(obj, "asMutable", asMutableObject);
    addPropertyTo(obj, "instantiateEmptyObject", instantiateEmptyObject);
    addPropertyTo(obj, "set", objectSet);
    addPropertyTo(obj, "setIn", objectSetIn);
    addPropertyTo(obj, "update", update);
    addPropertyTo(obj, "updateIn", updateIn);

    return makeImmutable(obj, mutatingObjectMethods);
  }

  // Returns true if object is a valid react element
  // https://github.com/facebook/react/blob/v15.0.1/src/isomorphic/classic/element/ReactElement.js#L326
  function isReactElement(obj) {
    return typeof obj === 'object' &&
           obj !== null &&
           (obj.$$typeof === REACT_ELEMENT_TYPE_FALLBACK || obj.$$typeof === REACT_ELEMENT_TYPE);
  }

  function Immutable(obj, options, stackRemaining) {
    if (isImmutable(obj) || isReactElement(obj)) {
      return obj;
    } else if (obj instanceof Array) {
      return makeImmutableArray(obj.slice());
    } else if (obj instanceof Date) {
      return makeImmutableDate(new Date(obj.getTime()));
    } else {
      // Don't freeze the object we were given; make a clone and use that.
      var prototype = options && options.prototype;
      var instantiateEmptyObject =
        (!prototype || prototype === Object.prototype) ?
          instantiatePlainObject : (function() { return Object.create(prototype); });
      var clone = instantiateEmptyObject();

      if (process.env.NODE_ENV !== "production") {
        /*jshint eqnull:true */
        if (stackRemaining == null) {
          stackRemaining = 64;
        }
        if (stackRemaining <= 0) {
          throw new ImmutableError("Attempt to construct Immutable from a deeply nested object was detected." +
            " Have you tried to wrap an object with circular references (e.g. React element)?" +
            " See https://github.com/rtfeldman/seamless-immutable/wiki/Deeply-nested-object-was-detected for details.");
        }
        stackRemaining -= 1;
      }

      for (var key in obj) {
        if (Object.getOwnPropertyDescriptor(obj, key)) {
          clone[key] = Immutable(obj[key], undefined, stackRemaining);
        }
      }

      return makeImmutableObject(clone,
        {instantiateEmptyObject: instantiateEmptyObject});
    }
  }

  // Export the library
  Immutable.isImmutable    = isImmutable;
  Immutable.ImmutableError = ImmutableError;

  Object.freeze(Immutable);

  /* istanbul ignore if */
  if (typeof module === "object") {
    module.exports = Immutable;
  } else if (typeof exports === "object") {
    exports.Immutable = Immutable;
  } else if (typeof window === "object") {
    window.Immutable = Immutable;
  } else if (typeof global === "object") {
    global.Immutable = Immutable;
  }
})();

}).call(this,require('_process'),typeof self !== "undefined" ? self : window)

},{"_process":134}],155:[function(require,module,exports){
'use strict';
module.exports = function (str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};

},{}],156:[function(require,module,exports){
(function (global){
/* global window */
'use strict';

module.exports = require('./ponyfill')(global || window || this);

}).call(this,typeof self !== "undefined" ? self : window)

},{"./ponyfill":157}],157:[function(require,module,exports){
'use strict';

module.exports = function symbolObservablePonyfill(root) {
	var result;
	var Symbol = root.Symbol;

	if (typeof Symbol === 'function') {
		if (Symbol.observable) {
			result = Symbol.observable;
		} else {
			result = Symbol('observable');
			Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
};

},{}],158:[function(require,module,exports){
function E () {
	// Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
	on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;

},{}]},{},[10])
//# sourceMappingURL=app.bundle.js.map
