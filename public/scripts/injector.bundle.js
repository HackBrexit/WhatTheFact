(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{"extend":36}],2:[function(require,module,exports){
module.exports = "<hypothesis-adder-toolbar class=\"annotator-adder js-adder\">\n  <hypothesis-adder-actions class=\"annotator-adder-actions\">\n    <button class=\"annotator-adder-actions__button h-icon-annotate js-annotate-btn\">\n      <span class=\"annotator-adder-actions__label\" data-action=\"comment\">Annotate</span>\n    </button>\n    <button class=\"annotator-adder-actions__button h-icon-highlight js-highlight-btn\">\n      <span class=\"annotator-adder-actions__label\" data-action=\"highlight\">Highlight</span>\n    </button>\n  </hypothesis-adder-actions>\n</hypothesis-adder-toolbar>\n";

},{}],3:[function(require,module,exports){
'use strict';

var classnames = require('classnames');

var template = require('./adder.html');

/**
 * Show the adder above the selection with an arrow pointing down at the
 * selected text.
 */
var ARROW_POINTING_DOWN = 1;

/**
 * Show the adder above the selection with an arrow pointing up at the
 * selected text.
 */
var ARROW_POINTING_UP = 2;

function toPx(pixels) {
  return pixels.toString() + 'px';
}

var ARROW_HEIGHT = 10;

// The preferred gap between the end of the text selection and the adder's
// arrow position.
var ARROW_H_MARGIN = 20;

function attachShadow(element) {
  if (element.attachShadow) {
    // Shadow DOM v1 (Chrome v53, Safari 10)
    return element.attachShadow({mode: 'open'});
  } else if (element.createShadowRoot) {
    // Shadow DOM v0 (Chrome ~35-52)
    return element.createShadowRoot();
  } else {
    return null;
  }
}

/**
 * Create the DOM structure for the Adder.
 *
 * Returns the root DOM node for the adder, which may be in a shadow tree.
 */
function createAdderDOM(container) {
  var element;

  // If the browser supports Shadow DOM, use it to isolate the adder
  // from the page's CSS
  //
  // See https://developers.google.com/web/fundamentals/primers/shadowdom/
  var shadowRoot = attachShadow(container);
  if (shadowRoot) {
    shadowRoot.innerHTML = template;
    element = shadowRoot.querySelector('.js-adder');

    // Load stylesheets required by adder into shadow DOM element
    var adderStyles = Array.from(document.styleSheets).map(function (sheet) {
      return sheet.href;
    }).filter(function (url) {
      return (url || '').match(/(icomoon|inject)\.css/);
    });

    // Stylesheet <link> elements are inert inside shadow roots [1]. Until
    // Shadow DOM implementations support external stylesheets [2], grab the
    // relevant CSS files from the current page and `@import` them.
    //
    // [1] http://stackoverflow.com/questions/27746590
    // [2] https://github.com/w3c/webcomponents/issues/530
    //
    // This will unfortunately break if the page blocks inline stylesheets via
    // CSP, but that appears to be rare and if this happens, the user will still
    // get a usable adder, albeit one that uses browser default styles for the
    // toolbar.
    var styleEl = document.createElement('style');
    styleEl.textContent = adderStyles.map(function (url) {
      return '@import "' + url + '";';
    }).join('\n');
    shadowRoot.appendChild(styleEl);
  } else {
    container.innerHTML = template;
    element = container.querySelector('.js-adder');
  }
  return element;
}

/**
 * Annotation 'adder' toolbar which appears next to the selection
 * and provides controls for the user to create new annotations.
 *
 * @param {Element} container - The DOM element into which the adder will be created
 * @param {Object} options - Options object specifying `onAnnotate` and `onHighlight`
 *        event handlers.
 */
function Adder(container, options) {

  var element = createAdderDOM(container);

  Object.assign(container.style, {
    // Set initial style. The adder is hidden using the `visibility`
    // property rather than `display` so that we can compute its size in order to
    // position it before display.
    display: 'block',
    position: 'absolute',
    visibility: 'hidden',

    // Assign a high Z-index so that the adder shows above any content on the
    // page
    zIndex: 999,
  });

  this.element = element;

  var view = element.ownerDocument.defaultView;
  var enterTimeout;

  element.querySelector('.js-annotate-btn')
    .addEventListener('click', handleCommand.bind(this, 'annotate'));
  element.querySelector('.js-highlight-btn')
    .addEventListener('click', handleCommand.bind(this, 'highlight'));

  function handleCommand(command, event) {
    event.preventDefault();
    event.stopPropagation();

    if (command === 'annotate') {
      options.onAnnotate();
    } else {
      options.onHighlight();
    }

    this.hide();
  }

  function width() {
    return element.getBoundingClientRect().width;
  }

  function height() {
    return element.getBoundingClientRect().height;
  }

  /** Hide the adder */
  this.hide = function () {
    clearTimeout(enterTimeout);
    element.className = classnames({'annotator-adder': true});
    container.style.visibility = 'hidden';
  };

  /**
   * Return the best position to show the adder in order to target the
   * selected text in `targetRect`.
   *
   * @param {Rect} targetRect - The rect of text to target, in document
   *        coordinates.
   * @param {boolean} isSelectionBackwards - True if the selection was made
   *        backwards, such that the focus point is mosty likely at the top-left
   *        edge of `targetRect`.
   */
  this.target = function (targetRect, isSelectionBackwards) {
    // Set the initial arrow direction based on whether the selection was made
    // forwards/upwards or downwards/backwards.
    var arrowDirection;
    if (isSelectionBackwards) {
      arrowDirection = ARROW_POINTING_DOWN;
    } else {
      arrowDirection = ARROW_POINTING_UP;
    }
    var top;
    var left;

    // Position the adder such that the arrow it is above or below the selection
    // and close to the end.
    var hMargin = Math.min(ARROW_H_MARGIN, targetRect.width);
    if (isSelectionBackwards) {
      left = targetRect.left - width() / 2 + hMargin;
    } else {
      left = targetRect.left + targetRect.width - width() / 2 - hMargin;
    }

    // Flip arrow direction if adder would appear above the top or below the
    // bottom of the viewport.
    //
    // Note: `pageYOffset` is used instead of `scrollY` here for IE
    // compatibility
    if (targetRect.top - height() < view.pageYOffset &&
        arrowDirection === ARROW_POINTING_DOWN) {
      arrowDirection = ARROW_POINTING_UP;
    } else if (targetRect.top + height() > view.pageYOffset + view.innerHeight) {
      arrowDirection = ARROW_POINTING_DOWN;
    }

    if (arrowDirection === ARROW_POINTING_UP) {
      top = targetRect.top + targetRect.height + ARROW_HEIGHT;
    } else {
      top = targetRect.top - height() - ARROW_HEIGHT;
    }

    // Constrain the adder to the viewport.
    left = Math.max(left, view.pageXOffset);
    left = Math.min(left, view.pageXOffset + view.innerWidth - width());

    top = Math.max(top, view.pageYOffset);
    top = Math.min(top, view.pageYOffset + view.innerHeight - height());

    return {top: top, left: left, arrowDirection: arrowDirection};
  };

  /**
   * Show the adder at the given position and with the arrow pointing in
   * `arrowDirection`.
   */
  this.showAt = function (left, top, arrowDirection) {
    element.className = classnames({
      'annotator-adder': true,
      'annotator-adder--arrow-down': arrowDirection === ARROW_POINTING_DOWN,
      'annotator-adder--arrow-up': arrowDirection === ARROW_POINTING_UP,
    });

    Object.assign(container.style, {
      top: toPx(top),
      left: toPx(left),
      visibility: 'visible',
    });

    clearTimeout(enterTimeout);
    enterTimeout = setTimeout(function () {
      element.className += ' is-active';
    }, 1);
  };
}

module.exports = {
  ARROW_POINTING_DOWN: ARROW_POINTING_DOWN,
  ARROW_POINTING_UP: ARROW_POINTING_UP,

  Adder: Adder,
};

},{"./adder.html":2,"classnames":29}],4:[function(require,module,exports){
var FragmentAnchor, RangeAnchor, TextPositionAnchor, TextQuoteAnchor, querySelector, ref;

ref = require('./types'), FragmentAnchor = ref.FragmentAnchor, RangeAnchor = ref.RangeAnchor, TextPositionAnchor = ref.TextPositionAnchor, TextQuoteAnchor = ref.TextQuoteAnchor;

querySelector = function(type, root, selector, options) {
  var doQuery;
  doQuery = function(resolve, reject) {
    var anchor, error, error1, range;
    try {
      anchor = type.fromSelector(root, selector, options);
      range = anchor.toRange(options);
      return resolve(range);
    } catch (error1) {
      error = error1;
      return reject(error);
    }
  };
  return new Promise(doQuery);
};


/**
 * Anchor a set of selectors.
 *
 * This function converts a set of selectors into a document range.
 * It encapsulates the core anchoring algorithm, using the selectors alone or
 * in combination to establish the best anchor within the document.
 *
 * :param Element root: The root element of the anchoring context.
 * :param Array selectors: The selectors to try.
 * :param Object options: Options to pass to the anchor implementations.
 * :return: A Promise that resolves to a Range on success.
 * :rtype: Promise
 */

exports.anchor = function(root, selectors, options) {
  var fragment, i, len, maybeAssertQuote, position, promise, quote, range, ref1, selector;
  if (options == null) {
    options = {};
  }
  fragment = null;
  position = null;
  quote = null;
  range = null;
  ref1 = selectors != null ? selectors : [];
  for (i = 0, len = ref1.length; i < len; i++) {
    selector = ref1[i];
    switch (selector.type) {
      case 'FragmentSelector':
        fragment = selector;
        break;
      case 'TextPositionSelector':
        position = selector;
        options.hint = position.start;
        break;
      case 'TextQuoteSelector':
        quote = selector;
        break;
      case 'RangeSelector':
        range = selector;
    }
  }
  maybeAssertQuote = function(range) {
    if (((quote != null ? quote.exact : void 0) != null) && range.toString() !== quote.exact) {
      throw new Error('quote mismatch');
    } else {
      return range;
    }
  };
  promise = Promise.reject('unable to anchor');
  if (fragment != null) {
    promise = promise["catch"](function() {
      return querySelector(FragmentAnchor, root, fragment, options).then(maybeAssertQuote);
    });
  }
  if (range != null) {
    promise = promise["catch"](function() {
      return querySelector(RangeAnchor, root, range, options).then(maybeAssertQuote);
    });
  }
  if (position != null) {
    promise = promise["catch"](function() {
      return querySelector(TextPositionAnchor, root, position, options).then(maybeAssertQuote);
    });
  }
  if (quote != null) {
    promise = promise["catch"](function() {
      return querySelector(TextQuoteAnchor, root, quote, options);
    });
  }
  return promise;
};

exports.describe = function(root, range, options) {
  var anchor, selector, selectors, type, types;
  if (options == null) {
    options = {};
  }
  types = [FragmentAnchor, RangeAnchor, TextPositionAnchor, TextQuoteAnchor];
  selectors = (function() {
    var error1, i, len, results;
    results = [];
    for (i = 0, len = types.length; i < len; i++) {
      type = types[i];
      try {
        anchor = type.fromRange(root, range, options);
        results.push(selector = anchor.toSelector(options));
      } catch (error1) {
        continue;
      }
    }
    return results;
  })();
  return selectors;
};


},{"./types":6}],5:[function(require,module,exports){
var Annotator, TextPositionAnchor, TextQuoteAnchor, anchorByPosition, findInPages, findPage, getNodeTextLayer, getPage, getPageOffset, getPageTextContent, getSiblingIndex, html, pageTextCache, prioritizePages, quotePositionCache, ref, seek, xpathRange,
  slice = [].slice;

seek = require('dom-seek');

Annotator = require('annotator');

xpathRange = Annotator.Range;

html = require('./html');

ref = require('./types'), TextPositionAnchor = ref.TextPositionAnchor, TextQuoteAnchor = ref.TextQuoteAnchor;

pageTextCache = {};

quotePositionCache = {};

getSiblingIndex = function(node) {
  var siblings;
  siblings = Array.prototype.slice.call(node.parentNode.childNodes);
  return siblings.indexOf(node);
};

getNodeTextLayer = function(node) {
  var ref1;
  while (!((ref1 = node.classList) != null ? ref1.contains('page') : void 0)) {
    node = node.parentNode;
  }
  return node.getElementsByClassName('textLayer')[0];
};

getPage = function(pageIndex) {
  return PDFViewerApplication.pdfViewer.getPageView(pageIndex);
};

getPageTextContent = function(pageIndex) {
  var joinItems;
  if (pageTextCache[pageIndex] != null) {
    return Promise.resolve(pageTextCache[pageIndex]);
  } else {
    joinItems = function(arg) {
      var item, items, nonEmpty, textContent;
      items = arg.items;
      nonEmpty = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = items.length; i < len; i++) {
          item = items[i];
          if (/\S/.test(item.str)) {
            results.push(item.str);
          }
        }
        return results;
      })();
      textContent = nonEmpty.join('');
      pageTextCache[pageIndex] = textContent;
      return textContent;
    };
    return PDFViewerApplication.pdfViewer.getPageTextContent(pageIndex).then(joinItems);
  }
};

getPageOffset = function(pageIndex) {
  var index, next;
  index = -1;
  next = function(offset) {
    if (++index === pageIndex) {
      return Promise.resolve(offset);
    }
    return getPageTextContent(index).then(function(textContent) {
      return next(offset + textContent.length);
    });
  };
  return next(0);
};

findPage = function(offset) {
  var count, index, total;
  index = 0;
  total = 0;
  count = function(textContent) {
    if (total + textContent.length > offset) {
      offset = total;
      return Promise.resolve({
        index: index,
        offset: offset,
        textContent: textContent
      });
    } else {
      index++;
      total += textContent.length;
      return getPageTextContent(index).then(count);
    }
  };
  return getPageTextContent(0).then(count);
};

anchorByPosition = function(page, anchor, options) {
  var div, placeholder, range, ref1, ref2, renderingDone, renderingState, root, selector;
  renderingState = page.renderingState;
  renderingDone = (ref1 = page.textLayer) != null ? ref1.renderingDone : void 0;
  if (renderingState === RenderingStates.FINISHED && renderingDone) {
    root = page.textLayer.textLayerDiv;
    selector = anchor.toSelector(options);
    return html.anchor(root, [selector]);
  } else {
    div = (ref2 = page.div) != null ? ref2 : page.el;
    placeholder = div.getElementsByClassName('annotator-placeholder')[0];
    if (placeholder == null) {
      placeholder = document.createElement('span');
      placeholder.classList.add('annotator-placeholder');
      placeholder.textContent = 'Loading annotations…';
      div.appendChild(placeholder);
    }
    range = document.createRange();
    range.setStartBefore(placeholder);
    range.setEndAfter(placeholder);
    return range;
  }
};

findInPages = function(arg, quote, position) {
  var attempt, cacheAndFinish, content, next, offset, page, pageIndex, rest;
  pageIndex = arg[0], rest = 2 <= arg.length ? slice.call(arg, 1) : [];
  if (pageIndex == null) {
    return Promise.reject('quote not found');
  }
  attempt = function(info) {
    var anchor, content, hint, offset, page, root;
    page = info[0], content = info[1], offset = info[2];
    root = {
      textContent: content
    };
    anchor = new TextQuoteAnchor.fromSelector(root, quote);
    if (position != null) {
      hint = position.start - offset;
      hint = Math.max(0, hint);
      hint = Math.min(hint, content.length);
      return anchor.toPositionAnchor({
        hint: hint
      });
    } else {
      return anchor.toPositionAnchor();
    }
  };
  next = function() {
    return findInPages(rest, quote, position);
  };
  cacheAndFinish = function(anchor) {
    var name;
    if (quotePositionCache[name = quote.exact] == null) {
      quotePositionCache[name] = {};
    }
    quotePositionCache[quote.exact][position.start] = {
      page: page,
      anchor: anchor
    };
    return anchorByPosition(page, anchor);
  };
  page = getPage(pageIndex);
  content = getPageTextContent(pageIndex);
  offset = getPageOffset(pageIndex);
  return Promise.all([page, content, offset]).then(attempt, next).then(cacheAndFinish);
};

prioritizePages = function(position) {
  var i, pageIndices, pagesCount, results, sort;
  pagesCount = PDFViewerApplication.pdfViewer.pagesCount;
  pageIndices = (function() {
    results = [];
    for (var i = 0; 0 <= pagesCount ? i < pagesCount : i > pagesCount; 0 <= pagesCount ? i++ : i--){ results.push(i); }
    return results;
  }).apply(this);
  sort = function(pageIndex) {
    var left, result, right;
    left = pageIndices.slice(0, pageIndex);
    right = pageIndices.slice(pageIndex);
    result = [];
    while (left.length || right.length) {
      if (right.length) {
        result.push(right.shift());
      }
      if (left.length) {
        result.push(left.pop());
      }
    }
    return result;
  };
  if (position != null) {
    return findPage(position.start).then(function(arg) {
      var index;
      index = arg.index;
      return sort(index);
    });
  } else {
    return Promise.resolve(pageIndices);
  }
};


/**
 * Anchor a set of selectors.
 *
 * This function converts a set of selectors into a document range.
 * It encapsulates the core anchoring algorithm, using the selectors alone or
 * in combination to establish the best anchor within the document.
 *
 * :param Element root: The root element of the anchoring context.
 * :param Array selectors: The selectors to try.
 * :param Object options: Options to pass to the anchor implementations.
 * :return: A Promise that resolves to a Range on success.
 * :rtype: Promise
 */

exports.anchor = function(root, selectors, options) {
  var assertQuote, i, len, position, promise, quote, ref1, selector;
  if (options == null) {
    options = {};
  }
  position = null;
  quote = null;
  ref1 = selectors != null ? selectors : [];
  for (i = 0, len = ref1.length; i < len; i++) {
    selector = ref1[i];
    switch (selector.type) {
      case 'TextPositionSelector':
        position = selector;
        break;
      case 'TextQuoteSelector':
        quote = selector;
    }
  }
  promise = Promise.reject('unable to anchor');
  assertQuote = function(range) {
    if (((quote != null ? quote.exact : void 0) != null) && range.toString() !== quote.exact) {
      throw new Error('quote mismatch');
    } else {
      return range;
    }
  };
  if (position != null) {
    promise = promise["catch"](function() {
      return findPage(position.start).then(function(arg) {
        var anchor, end, index, length, offset, page, start, textContent;
        index = arg.index, offset = arg.offset, textContent = arg.textContent;
        page = getPage(index);
        start = position.start - offset;
        end = position.end - offset;
        length = end - start;
        assertQuote(textContent.substr(start, length));
        anchor = new TextPositionAnchor(root, start, end);
        return anchorByPosition(page, anchor, options);
      });
    });
  }
  if (quote != null) {
    promise = promise["catch"](function() {
      var anchor, page, ref2, ref3;
      if ((position != null) && (((ref2 = quotePositionCache[quote.exact]) != null ? ref2[position.start] : void 0) != null)) {
        ref3 = quotePositionCache[quote.exact][position.start], page = ref3.page, anchor = ref3.anchor;
        return anchorByPosition(page, anchor, options);
      }
      return prioritizePages(position).then(function(pageIndices) {
        return findInPages(pageIndices, quote, position);
      });
    });
  }
  return promise;
};

exports.describe = function(root, range, options) {
  var end, endPageIndex, endRange, endTextLayer, iter, start, startPageIndex, startRange, startTextLayer;
  if (options == null) {
    options = {};
  }
  range = new xpathRange.BrowserRange(range).normalize();
  startTextLayer = getNodeTextLayer(range.start);
  endTextLayer = getNodeTextLayer(range.end);
  if (startTextLayer !== endTextLayer) {
    throw new Error('selecting across page breaks is not supported');
  }
  startRange = range.limit(startTextLayer);
  endRange = range.limit(endTextLayer);
  startPageIndex = getSiblingIndex(startTextLayer.parentNode);
  endPageIndex = getSiblingIndex(endTextLayer.parentNode);
  iter = document.createNodeIterator(startTextLayer, NodeFilter.SHOW_TEXT);
  start = seek(iter, range.start);
  end = seek(iter, range.end) + start + range.end.textContent.length;
  return getPageOffset(startPageIndex).then(function(pageOffset) {
    var position, quote, r;
    start += pageOffset;
    end += pageOffset;
    position = new TextPositionAnchor(root, start, end).toSelector(options);
    r = document.createRange();
    r.setStartBefore(startRange.start);
    r.setEndAfter(endRange.end);
    quote = TextQuoteAnchor.fromRange(root, r, options).toSelector(options);
    return Promise.all([position, quote]);
  });
};

exports.purgeCache = function() {
  pageTextCache = {};
  return quotePositionCache = {};
};


},{"./html":4,"./types":6,"annotator":28,"dom-seek":35}],6:[function(require,module,exports){
var Annotator, RangeAnchor, missingParameter, xpathRange;

Annotator = require('annotator');

xpathRange = Annotator.Range;

missingParameter = function(name) {
  throw new Error('missing required parameter "' + name + '"');
};


/**
 * class:: RangeAnchor(range)
 *
 * This anchor type represents a DOM Range.
 *
 * :param Range range: A range describing the anchor.
 */

RangeAnchor = (function() {
  function RangeAnchor(root, range) {
    if (root == null) {
      missingParameter('root');
    }
    if (range == null) {
      missingParameter('range');
    }
    this.root = root;
    this.range = xpathRange.sniff(range).normalize(this.root);
  }

  RangeAnchor.fromRange = function(root, range) {
    return new RangeAnchor(root, range);
  };

  RangeAnchor.fromSelector = function(root, selector) {
    var data, range;
    data = {
      start: selector.startContainer,
      startOffset: selector.startOffset,
      end: selector.endContainer,
      endOffset: selector.endOffset
    };
    range = new xpathRange.SerializedRange(data);
    return new RangeAnchor(root, range);
  };

  RangeAnchor.prototype.toRange = function() {
    return this.range.toRange();
  };

  RangeAnchor.prototype.toSelector = function(options) {
    var range;
    if (options == null) {
      options = {};
    }
    range = this.range.serialize(this.root, options.ignoreSelector);
    return {
      type: 'RangeSelector',
      startContainer: range.start,
      startOffset: range.startOffset,
      endContainer: range.end,
      endOffset: range.endOffset
    };
  };

  return RangeAnchor;

})();

exports.RangeAnchor = RangeAnchor;

exports.FragmentAnchor = require('dom-anchor-fragment');

exports.TextPositionAnchor = require('dom-anchor-text-position');

exports.TextQuoteAnchor = require('dom-anchor-text-quote');


},{"annotator":28,"dom-anchor-fragment":32,"dom-anchor-text-position":33,"dom-anchor-text-quote":34}],7:[function(require,module,exports){
'use strict';

var annotationIDs = require('../util/annotation-ids');
var settings = require('../settings');

var docs = 'https://h.readthedocs.io/en/latest/embedding.html';

/**
 * Reads the Hypothesis configuration from the environment.
 *
 * @param {Window} window_ - The Window object to read config from.
 */
function config(window_) {
  var options = {
    app: window_.
      document.querySelector('link[type="application/annotator+html"]').href,
  };

  // Parse config from `<script class="js-hypothesis-config">` tags
  try {
    Object.assign(options, settings(window_.document, 'js-hypothesis-config'));
  } catch (err) {
    console.warn('Could not parse settings from js-hypothesis-config tags',
      err);
  }

  // Parse config from `window.hypothesisConfig` function
  if (window_.hasOwnProperty('hypothesisConfig')) {
    if (typeof window_.hypothesisConfig === 'function') {
      Object.assign(options, window_.hypothesisConfig());
    } else {
      throw new TypeError('hypothesisConfig must be a function, see: ' + docs);
    }
  }

  // Extract the direct linked ID from the URL.
  //
  // The Chrome extension or proxy may already have provided this config
  // via a tag injected into the DOM, which avoids the problem where the page's
  // JS rewrites the URL before Hypothesis loads.
  //
  // In environments where the config has not been injected into the DOM,
  // we try to retrieve it from the URL here.
  var directLinkedID = annotationIDs.extractIDFromURL(window_.location.href);
  if (directLinkedID) {
    options.annotations = directLinkedID;
  }
  return options;
}

module.exports = config;

},{"../settings":24,"../util/annotation-ids":25}],8:[function(require,module,exports){
var $, Annotator, Guest, adder, animationPromise, baseURI, extend, highlighter, normalizeURI, raf, rangeUtil, scrollIntoView, selections,
  extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

baseURI = require('document-base-uri');

extend = require('extend');

raf = require('raf');

scrollIntoView = require('scroll-into-view');

Annotator = require('annotator');

$ = Annotator.$;

adder = require('./adder');

highlighter = require('./highlighter');

rangeUtil = require('./range-util');

selections = require('./selections');

animationPromise = function(fn) {
  return new Promise(function(resolve, reject) {
    return raf(function() {
      var error, error1;
      try {
        return resolve(fn());
      } catch (error1) {
        error = error1;
        return reject(error);
      }
    });
  });
};

normalizeURI = function(uri, baseURI) {
  var url;
  url = new URL(uri, baseURI);
  return url.toString().replace(/#.*/, '');
};

module.exports = Guest = (function(superClass) {
  var SHOW_HIGHLIGHTS_CLASS;

  extend1(Guest, superClass);

  SHOW_HIGHLIGHTS_CLASS = 'annotator-highlights-always-on';

  Guest.prototype.events = {
    ".annotator-hl click": "onHighlightClick",
    ".annotator-hl mouseover": "onHighlightMouseover",
    ".annotator-hl mouseout": "onHighlightMouseout"
  };

  Guest.prototype.options = {
    Document: {},
    TextSelection: {}
  };

  Guest.prototype.anchoring = require('./anchoring/html');

  Guest.prototype.anchors = null;

  Guest.prototype.visibleHighlights = false;

  Guest.prototype.html = extend({}, Annotator.prototype.html, {
    adder: '<hypothesis-adder></hypothesis-adder>'
  });

  function Guest(element, options) {
    var cfOptions, name, opts, ref, self;
    Guest.__super__.constructor.apply(this, arguments);
    self = this;
    this.adderCtrl = new adder.Adder(this.adder[0], {
      onAnnotate: function() {
        self.createAnnotation();
        return Annotator.Util.getGlobal().getSelection().removeAllRanges();
      },
      onHighlight: function() {
        self.setVisibleHighlights(true);
        self.createHighlight();
        return Annotator.Util.getGlobal().getSelection().removeAllRanges();
      }
    });
    this.selections = selections(document).subscribe({
      next: function(range) {
        if (range) {
          return self._onSelection(range);
        } else {
          return self._onClearSelection();
        }
      }
    });
    this.anchors = [];
    cfOptions = {
      on: (function(_this) {
        return function(event, handler) {
          return _this.subscribe(event, handler);
        };
      })(this),
      emit: (function(_this) {
        return function() {
          var args, event;
          event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          return _this.publish(event, args);
        };
      })(this)
    };
    this.addPlugin('CrossFrame', cfOptions);
    this.crossframe = this.plugins.CrossFrame;
    this.crossframe.onConnect((function(_this) {
      return function() {
        return _this.publish('panelReady');
      };
    })(this));
    this._connectAnnotationSync(this.crossframe);
    this._connectAnnotationUISync(this.crossframe);
    ref = this.options;
    for (name in ref) {
      if (!hasProp.call(ref, name)) continue;
      opts = ref[name];
      if (!this.plugins[name] && Annotator.Plugin[name]) {
        this.addPlugin(name, opts);
      }
    }
  }

  Guest.prototype.getDocumentInfo = function() {
    var metadataPromise, uriPromise;
    if (this.plugins.PDF != null) {
      metadataPromise = Promise.resolve(this.plugins.PDF.getMetadata());
      uriPromise = Promise.resolve(this.plugins.PDF.uri());
    } else if (this.plugins.Document != null) {
      uriPromise = Promise.resolve(this.plugins.Document.uri());
      metadataPromise = Promise.resolve(this.plugins.Document.metadata);
    } else {
      uriPromise = Promise.reject();
      metadataPromise = Promise.reject();
    }
    uriPromise = uriPromise["catch"](function() {
      return decodeURIComponent(window.location.href);
    });
    metadataPromise = metadataPromise["catch"](function() {
      return {
        title: document.title,
        link: [
          {
            href: decodeURIComponent(window.location.href)
          }
        ]
      };
    });
    return Promise.all([metadataPromise, uriPromise]).then(function(arg) {
      var href, metadata;
      metadata = arg[0], href = arg[1];
      return {
        uri: normalizeURI(href, baseURI),
        metadata: metadata
      };
    });
  };

  Guest.prototype._connectAnnotationSync = function(crossframe) {
    this.subscribe('annotationDeleted', (function(_this) {
      return function(annotation) {
        return _this.detach(annotation);
      };
    })(this));
    return this.subscribe('annotationsLoaded', (function(_this) {
      return function(annotations) {
        var annotation, i, len, results;
        results = [];
        for (i = 0, len = annotations.length; i < len; i++) {
          annotation = annotations[i];
          results.push(_this.anchor(annotation));
        }
        return results;
      };
    })(this));
  };

  Guest.prototype._connectAnnotationUISync = function(crossframe) {
    crossframe.on('focusAnnotations', (function(_this) {
      return function(tags) {
        var anchor, i, len, ref, ref1, results, toggle;
        if (tags == null) {
          tags = [];
        }
        ref = _this.anchors;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          anchor = ref[i];
          if (!(anchor.highlights != null)) {
            continue;
          }
          toggle = (ref1 = anchor.annotation.$$tag, indexOf.call(tags, ref1) >= 0);
          results.push($(anchor.highlights).toggleClass('annotator-hl-focused', toggle));
        }
        return results;
      };
    })(this));
    crossframe.on('scrollToAnnotation', (function(_this) {
      return function(tag) {
        var anchor, i, len, ref, results;
        ref = _this.anchors;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          anchor = ref[i];
          if (anchor.highlights != null) {
            if (anchor.annotation.$$tag === tag) {
              results.push(scrollIntoView(anchor.highlights[0]));
            } else {
              results.push(void 0);
            }
          }
        }
        return results;
      };
    })(this));
    crossframe.on('getDocumentInfo', (function(_this) {
      return function(cb) {
        return _this.getDocumentInfo().then(function(info) {
          return cb(null, info);
        })["catch"](function(reason) {
          return cb(reason);
        });
      };
    })(this));
    return crossframe.on('setVisibleHighlights', (function(_this) {
      return function(state) {
        return _this.setVisibleHighlights(state);
      };
    })(this));
  };

  Guest.prototype._setupWrapper = function() {
    this.wrapper = this.element;
    return this;
  };

  Guest.prototype._setupViewer = function() {
    return this;
  };

  Guest.prototype._setupEditor = function() {
    return this;
  };

  Guest.prototype._setupDocumentEvents = function() {
    return this;
  };

  Guest.prototype._setupDynamicStyle = function() {
    return this;
  };

  Guest.prototype.destroy = function() {
    var name, plugin, ref;
    $('#annotator-dynamic-style').remove();
    this.selections.unsubscribe();
    this.adder.remove();
    this.element.find('.annotator-hl').each(function() {
      $(this).contents().insertBefore(this);
      return $(this).remove();
    });
    this.element.data('annotator', null);
    ref = this.plugins;
    for (name in ref) {
      plugin = ref[name];
      this.plugins[name].destroy();
    }
    return this.removeEvents();
  };

  Guest.prototype.anchor = function(annotation) {
    var anchor, anchoredTargets, anchors, deadHighlights, highlight, i, j, len, len1, locate, ref, ref1, ref2, root, self, sync, target;
    self = this;
    root = this.element[0];
    anchors = [];
    anchoredTargets = [];
    deadHighlights = [];
    if (annotation.target == null) {
      annotation.target = [];
    }
    locate = function(target) {
      var options, ref;
      if (!((ref = target.selector) != null ? ref : []).some((function(_this) {
        return function(s) {
          return s.type === 'TextQuoteSelector';
        };
      })(this))) {
        return Promise.resolve({
          annotation: annotation,
          target: target
        });
      }
      options = {
        cache: self.anchoringCache,
        ignoreSelector: '[class^="annotator-"]'
      };
      return self.anchoring.anchor(root, target.selector, options).then(function(range) {
        return {
          annotation: annotation,
          target: target,
          range: range
        };
      })["catch"](function() {
        return {
          annotation: annotation,
          target: target
        };
      });
    };
    highlight = function(anchor) {
      if (anchor.range == null) {
        return anchor;
      }
      return animationPromise(function() {
        var highlights, normedRange, range;
        range = Annotator.Range.sniff(anchor.range);
        normedRange = range.normalize(root);
        highlights = highlighter.highlightRange(normedRange);
        $(highlights).data('annotation', anchor.annotation);
        anchor.highlights = highlights;
        return anchor;
      });
    };
    sync = function(anchors) {
      var anchor, hasAnchorableTargets, hasAnchoredTargets, i, len, ref, ref1;
      hasAnchorableTargets = false;
      hasAnchoredTargets = false;
      for (i = 0, len = anchors.length; i < len; i++) {
        anchor = anchors[i];
        if (anchor.target.selector != null) {
          hasAnchorableTargets = true;
          if (anchor.range != null) {
            hasAnchoredTargets = true;
            break;
          }
        }
      }
      annotation.$orphan = hasAnchorableTargets && !hasAnchoredTargets;
      self.anchors = self.anchors.concat(anchors);
      if ((ref = self.plugins.BucketBar) != null) {
        ref.update();
      }
      if ((ref1 = self.plugins.CrossFrame) != null) {
        ref1.sync([annotation]);
      }
      return anchors;
    };
    ref = self.anchors.splice(0, self.anchors.length);
    for (i = 0, len = ref.length; i < len; i++) {
      anchor = ref[i];
      if (anchor.annotation === annotation) {
        if ((anchor.range != null) && (ref1 = anchor.target, indexOf.call(annotation.target, ref1) >= 0)) {
          anchors.push(anchor);
          anchoredTargets.push(anchor.target);
        } else if (anchor.highlights != null) {
          deadHighlights = deadHighlights.concat(anchor.highlights);
          delete anchor.highlights;
          delete anchor.range;
        }
      } else {
        self.anchors.push(anchor);
      }
    }
    raf(function() {
      return highlighter.removeHighlights(deadHighlights);
    });
    ref2 = annotation.target;
    for (j = 0, len1 = ref2.length; j < len1; j++) {
      target = ref2[j];
      if (!(indexOf.call(anchoredTargets, target) < 0)) {
        continue;
      }
      anchor = locate(target).then(highlight);
      anchors.push(anchor);
    }
    return Promise.all(anchors).then(sync);
  };

  Guest.prototype.detach = function(annotation) {
    var anchor, anchors, i, len, ref, ref1, ref2, targets, unhighlight;
    anchors = [];
    targets = [];
    unhighlight = [];
    ref = this.anchors;
    for (i = 0, len = ref.length; i < len; i++) {
      anchor = ref[i];
      if (anchor.annotation === annotation) {
        unhighlight.push((ref1 = anchor.highlights) != null ? ref1 : []);
      } else {
        anchors.push(anchor);
      }
    }
    this.anchors = anchors;
    unhighlight = (ref2 = Array.prototype).concat.apply(ref2, unhighlight);
    return raf((function(_this) {
      return function() {
        var ref3;
        highlighter.removeHighlights(unhighlight);
        return (ref3 = _this.plugins.BucketBar) != null ? ref3.update() : void 0;
      };
    })(this));
  };

  Guest.prototype.createAnnotation = function(annotation) {
    var getSelectors, info, metadata, ranges, ref, root, selectors, self, setDocumentInfo, setTargets, targets;
    if (annotation == null) {
      annotation = {};
    }
    self = this;
    root = this.element[0];
    ranges = (ref = this.selectedRanges) != null ? ref : [];
    this.selectedRanges = null;
    getSelectors = function(range) {
      var options;
      options = {
        cache: self.anchoringCache,
        ignoreSelector: '[class^="annotator-"]'
      };
      return self.anchoring.describe(root, range, options);
    };
    setDocumentInfo = function(info) {
      annotation.document = info.metadata;
      return annotation.uri = info.uri;
    };
    setTargets = function(arg) {
      var info, selector, selectors, source;
      info = arg[0], selectors = arg[1];
      source = info.uri;
      return annotation.target = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = selectors.length; i < len; i++) {
          selector = selectors[i];
          results.push({
            source: source,
            selector: selector
          });
        }
        return results;
      })();
    };
    info = this.getDocumentInfo();
    selectors = Promise.all(ranges.map(getSelectors));
    metadata = info.then(setDocumentInfo);
    targets = Promise.all([info, selectors]).then(setTargets);
    targets.then(function() {
      return self.publish('beforeAnnotationCreated', [annotation]);
    });
    targets.then(function() {
      return self.anchor(annotation);
    });
    return annotation;
  };

  Guest.prototype.createHighlight = function() {
    return this.createAnnotation({
      $highlight: true
    });
  };

  Guest.prototype.createComment = function() {
    var annotation, prepare, self;
    annotation = {};
    self = this;
    prepare = function(info) {
      annotation.document = info.metadata;
      annotation.uri = info.uri;
      return annotation.target = [
        {
          source: info.uri
        }
      ];
    };
    this.getDocumentInfo().then(prepare).then(function() {
      return self.publish('beforeAnnotationCreated', [annotation]);
    });
    return annotation;
  };

  Guest.prototype.showAnnotations = function(annotations) {
    var a, ref, tags;
    tags = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = annotations.length; i < len; i++) {
        a = annotations[i];
        results.push(a.$$tag);
      }
      return results;
    })();
    return (ref = this.crossframe) != null ? ref.call('showAnnotations', tags) : void 0;
  };

  Guest.prototype.toggleAnnotationSelection = function(annotations) {
    var a, ref, tags;
    tags = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = annotations.length; i < len; i++) {
        a = annotations[i];
        results.push(a.$$tag);
      }
      return results;
    })();
    return (ref = this.crossframe) != null ? ref.call('toggleAnnotationSelection', tags) : void 0;
  };

  Guest.prototype.updateAnnotations = function(annotations) {
    var a, ref, tags;
    tags = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = annotations.length; i < len; i++) {
        a = annotations[i];
        results.push(a.$$tag);
      }
      return results;
    })();
    return (ref = this.crossframe) != null ? ref.call('updateAnnotations', tags) : void 0;
  };

  Guest.prototype.focusAnnotations = function(annotations) {
    var a, ref, tags;
    tags = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = annotations.length; i < len; i++) {
        a = annotations[i];
        results.push(a.$$tag);
      }
      return results;
    })();
    return (ref = this.crossframe) != null ? ref.call('focusAnnotations', tags) : void 0;
  };

  Guest.prototype._onSelection = function(range) {
    var arrowDirection, focusRect, isBackwards, left, ref, selection, top;
    selection = Annotator.Util.getGlobal().getSelection();
    isBackwards = rangeUtil.isSelectionBackwards(selection);
    focusRect = rangeUtil.selectionFocusRect(selection);
    if (!focusRect) {
      this._onClearSelection();
      return;
    }
    this.selectedRanges = [range];
    Annotator.$('.annotator-toolbar .h-icon-note').attr('title', 'New Annotation').removeClass('h-icon-note').addClass('h-icon-annotate');
    ref = this.adderCtrl.target(focusRect, isBackwards), left = ref.left, top = ref.top, arrowDirection = ref.arrowDirection;
    return this.adderCtrl.showAt(left, top, arrowDirection);
  };

  Guest.prototype._onClearSelection = function() {
    this.adderCtrl.hide();
    this.selectedRanges = [];
    return Annotator.$('.annotator-toolbar .h-icon-annotate').attr('title', 'New Page Note').removeClass('h-icon-annotate').addClass('h-icon-note');
  };

  Guest.prototype.selectAnnotations = function(annotations, toggle) {
    if (toggle) {
      return this.toggleAnnotationSelection(annotations);
    } else {
      return this.showAnnotations(annotations);
    }
  };

  Guest.prototype.onHighlightMouseover = function(event) {
    var annotation, annotations;
    if (!this.visibleHighlights) {
      return;
    }
    annotation = $(event.currentTarget).data('annotation');
    annotations = event.annotations != null ? event.annotations : event.annotations = [];
    annotations.push(annotation);
    if (event.target === event.currentTarget) {
      return setTimeout((function(_this) {
        return function() {
          return _this.focusAnnotations(annotations);
        };
      })(this));
    }
  };

  Guest.prototype.onHighlightMouseout = function(event) {
    if (!this.visibleHighlights) {
      return;
    }
    return this.focusAnnotations([]);
  };

  Guest.prototype.onHighlightClick = function(event) {
    var annotation, annotations, xor;
    if (!this.visibleHighlights) {
      return;
    }
    annotation = $(event.currentTarget).data('annotation');
    annotations = event.annotations != null ? event.annotations : event.annotations = [];
    annotations.push(annotation);
    if (event.target === event.currentTarget) {
      xor = event.metaKey || event.ctrlKey;
      return setTimeout((function(_this) {
        return function() {
          return _this.selectAnnotations(annotations, xor);
        };
      })(this));
    }
  };

  Guest.prototype.setVisibleHighlights = function(shouldShowHighlights) {
    var ref;
    if ((ref = this.crossframe) != null) {
      ref.call('setVisibleHighlights', shouldShowHighlights);
    }
    this.toggleHighlightClass(shouldShowHighlights);
    return this.publish('setVisibleHighlights', shouldShowHighlights);
  };

  Guest.prototype.toggleHighlightClass = function(shouldShowHighlights) {
    if (shouldShowHighlights) {
      this.element.addClass(SHOW_HIGHLIGHTS_CLASS);
    } else {
      this.element.removeClass(SHOW_HIGHLIGHTS_CLASS);
    }
    return this.visibleHighlights = shouldShowHighlights;
  };

  return Guest;

})(Annotator);


},{"./adder":3,"./anchoring/html":4,"./highlighter":9,"./range-util":18,"./selections":19,"annotator":28,"document-base-uri":31,"extend":36,"raf":41,"scroll-into-view":42}],9:[function(require,module,exports){
var $, Annotator;

Annotator = require('annotator');

$ = Annotator.$;

exports.highlightRange = function(normedRange, cssClass) {
  var hl, nodes, white;
  if (cssClass == null) {
    cssClass = 'annotator-hl';
  }
  white = /^\s*$/;
  hl = $("<span class='" + cssClass + "'></span>");
  nodes = $(normedRange.textNodes()).filter(function(i) {
    return !white.test(this.nodeValue);
  });
  return nodes.wrap(hl).parent().toArray();
};

exports.removeHighlights = function(highlights) {
  var h, j, len, results;
  results = [];
  for (j = 0, len = highlights.length; j < len; j++) {
    h = highlights[j];
    if (h.parentNode != null) {
      results.push($(h).replaceWith(h.childNodes));
    }
  }
  return results;
};

exports.getBoundingClientRect = function(collection) {
  var rects;
  rects = collection.map(function(n) {
    return n.getBoundingClientRect();
  });
  return rects.reduce(function(acc, r) {
    return {
      top: Math.min(acc.top, r.top),
      left: Math.min(acc.left, r.left),
      bottom: Math.max(acc.bottom, r.bottom),
      right: Math.max(acc.right, r.right)
    };
  });
};


},{"annotator":28}],10:[function(require,module,exports){
var $, Annotator, Guest, Host,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Annotator = require('annotator');

$ = Annotator.$;

Guest = require('./guest');

module.exports = Host = (function(superClass) {
  extend(Host, superClass);

  function Host(element, options) {
    var app, configParam;
    configParam = 'config=' + encodeURIComponent(JSON.stringify(Object.assign({}, options, {
      app: void 0
    })));
    if (options.app && indexOf.call(options.app, '?') >= 0) {
      options.app += '&' + configParam;
    } else {
      options.app += '?' + configParam;
    }
    app = $('<iframe></iframe>').attr('name', 'hyp_sidebar_frame').attr('allowfullscreen', '').attr('seamless', '').attr('src', options.app).addClass('h-sidebar-iframe');
    this.frame = $('<div></div>').css('display', 'none').addClass('annotator-frame annotator-outer').appendTo(element);
    Host.__super__.constructor.apply(this, arguments);
    app.appendTo(this.frame);
    this.on('panelReady', (function(_this) {
      return function() {
        if (options.showHighlights === void 0) {
          options.showHighlights = true;
        }
        _this.setVisibleHighlights(options.showHighlights);
        return _this.frame.css('display', '');
      };
    })(this));
    this.on('beforeAnnotationCreated', function(annotation) {
      if (!annotation.$highlight) {
        return app[0].contentWindow.focus();
      }
    });
  }

  Host.prototype.destroy = function() {
    this.frame.remove();
    return Host.__super__.destroy.apply(this, arguments);
  };

  return Host;

})(Guest);


},{"./guest":8,"annotator":28}],11:[function(require,module,exports){
'use strict';

require('../polyfills');

var Annotator = require('annotator');

// Polyfills
var g = Annotator.Util.getGlobal();
if (g.wgxpath) {
  g.wgxpath.install();
}

// Applications
Annotator.Guest = require('./guest');
Annotator.Host = require('./host');
Annotator.Sidebar = require('./sidebar');
Annotator.PdfSidebar = require('./pdf-sidebar');

// UI plugins
Annotator.Plugin.BucketBar = require('./plugin/bucket-bar');
Annotator.Plugin.Toolbar = require('./plugin/toolbar');

// Document type plugins
Annotator.Plugin.PDF = require('./plugin/pdf');
require('../vendor/annotator.document');  // Does not export the plugin :(

// Cross-frame communication
Annotator.Plugin.CrossFrame = require('./plugin/cross-frame');
Annotator.Plugin.CrossFrame.AnnotationSync = require('../annotation-sync');
Annotator.Plugin.CrossFrame.Bridge = require('../bridge');
Annotator.Plugin.CrossFrame.Discovery = require('../discovery');

var appLinkEl =
  document.querySelector('link[type="application/annotator+html"]');
var options = require('./config')(window);

Annotator.noConflict().$.noConflict(true)(function() {
  var Klass = window.PDFViewerApplication ?
      Annotator.PdfSidebar :
      Annotator.Sidebar;
  if (options.hasOwnProperty('constructor')) {
    Klass = options.constructor;
    delete options.constructor;
  }

  window.annotator = new Klass(document.body, options);
  appLinkEl.addEventListener('destroy', function () {
    appLinkEl.parentElement.removeChild(appLinkEl);
    window.annotator.destroy();
    window.annotator = undefined;
  });
});

},{"../annotation-sync":1,"../bridge":21,"../discovery":22,"../polyfills":"/h/static/scripts/polyfills.js","../vendor/annotator.document":27,"./config":7,"./guest":8,"./host":10,"./pdf-sidebar":12,"./plugin/bucket-bar":13,"./plugin/cross-frame":14,"./plugin/pdf":16,"./plugin/toolbar":17,"./sidebar":20,"annotator":28}],12:[function(require,module,exports){
var PdfSidebar, Sidebar,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Sidebar = require('./sidebar');

module.exports = PdfSidebar = (function(superClass) {
  extend(PdfSidebar, superClass);

  function PdfSidebar() {
    return PdfSidebar.__super__.constructor.apply(this, arguments);
  }

  PdfSidebar.prototype.options = {
    TextSelection: {},
    PDF: {},
    BucketBar: {
      container: '.annotator-frame',
      scrollables: ['#viewerContainer']
    },
    Toolbar: {
      container: '.annotator-frame'
    }
  };

  return PdfSidebar;

})(Sidebar);


},{"./sidebar":20}],13:[function(require,module,exports){
var $, Annotator, BUCKET_NAV_SIZE, BUCKET_SIZE, BUCKET_TOP_THRESHOLD, BucketBar, highlighter, raf, scrollIntoView, scrollToClosest,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

raf = require('raf');

Annotator = require('annotator');

$ = Annotator.$;

scrollIntoView = require('scroll-into-view');

highlighter = require('../highlighter');

BUCKET_SIZE = 16;

BUCKET_NAV_SIZE = BUCKET_SIZE + 6;

BUCKET_TOP_THRESHOLD = 115 + BUCKET_NAV_SIZE;

scrollToClosest = function(anchors, direction) {
  var dir, next;
  dir = direction === "up" ? +1 : -1;
  next = anchors.reduce(function(acc, anchor) {
    var rect, ref, start;
    if (!((ref = anchor.highlights) != null ? ref.length : void 0)) {
      return acc;
    }
    start = acc.start, next = acc.next;
    rect = highlighter.getBoundingClientRect(anchor.highlights);
    if (dir === 1 && rect.top >= BUCKET_TOP_THRESHOLD) {
      return acc;
    } else if (dir === -1 && rect.top <= window.innerHeight - BUCKET_NAV_SIZE) {
      return acc;
    }
    if (next == null) {
      return {
        start: rect.top,
        next: anchor
      };
    } else if (start * dir < rect.top * dir) {
      return {
        start: rect.top,
        next: anchor
      };
    } else {
      return acc;
    }
  }, {}).next;
  return scrollIntoView(next.highlights[0]);
};

module.exports = BucketBar = (function(superClass) {
  extend(BucketBar, superClass);

  BucketBar.prototype.html = "<div class=\"annotator-bucket-bar\">\n</div>";

  BucketBar.prototype.options = {
    gapSize: 60,
    scrollables: ['body']
  };

  BucketBar.prototype.buckets = [];

  BucketBar.prototype.index = [];

  BucketBar.prototype.tabs = null;

  function BucketBar(element, options) {
    this.update = bind(this.update, this);
    BucketBar.__super__.constructor.call(this, $(this.html), options);
    if (this.options.container != null) {
      $(this.options.container).append(this.element);
    } else {
      $(element).append(this.element);
    }
  }

  BucketBar.prototype.pluginInit = function() {
    var k, len, ref, ref1, results, scrollable;
    $(window).on('resize scroll', this.update);
    ref1 = (ref = this.options.scrollables) != null ? ref : [];
    results = [];
    for (k = 0, len = ref1.length; k < len; k++) {
      scrollable = ref1[k];
      results.push($(scrollable).on('resize scroll', this.update));
    }
    return results;
  };

  BucketBar.prototype.destroy = function() {
    var k, len, ref, ref1, results, scrollable;
    $(window).off('resize scroll', this.update);
    ref1 = (ref = this.options.scrollables) != null ? ref : [];
    results = [];
    for (k = 0, len = ref1.length; k < len; k++) {
      scrollable = ref1[k];
      results.push($(scrollable).off('resize scroll', this.update));
    }
    return results;
  };

  BucketBar.prototype._collate = function(a, b) {
    var i, k, ref;
    for (i = k = 0, ref = a.length - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
      if (a[i] < b[i]) {
        return -1;
      }
      if (a[i] > b[i]) {
        return 1;
      }
    }
    return 0;
  };

  BucketBar.prototype.update = function() {
    if (this._updatePending != null) {
      return;
    }
    return this._updatePending = raf((function(_this) {
      return function() {
        delete _this._updatePending;
        return _this._update();
      };
    })(this));
  };

  BucketBar.prototype._update = function() {
    var above, b, below, element, k, len, max, points, ref, ref1;
    above = [];
    below = [];
    points = this.annotator.anchors.reduce((function(_this) {
      return function(points, anchor, i) {
        var h, rect, ref, x;
        if (!((ref = anchor.highlights) != null ? ref.length : void 0)) {
          return points;
        }
        rect = highlighter.getBoundingClientRect(anchor.highlights);
        x = rect.top;
        h = rect.bottom - rect.top;
        if (x < BUCKET_TOP_THRESHOLD) {
          if (indexOf.call(above, anchor) < 0) {
            above.push(anchor);
          }
        } else if (x > window.innerHeight - BUCKET_NAV_SIZE) {
          if (indexOf.call(below, anchor) < 0) {
            below.push(anchor);
          }
        } else {
          points.push([x, 1, anchor]);
          points.push([x + h, -1, anchor]);
        }
        return points;
      };
    })(this), []);
    ref = points.sort(this._collate).reduce((function(_this) {
      return function(arg, arg1, i, points) {
        var a, a0, buckets, carry, d, index, j, k, l, last, len, len1, ref, ref1, toMerge, x;
        buckets = arg.buckets, index = arg.index, carry = arg.carry;
        x = arg1[0], d = arg1[1], a = arg1[2];
        if (d > 0) {
          if ((j = carry.anchors.indexOf(a)) < 0) {
            carry.anchors.unshift(a);
            carry.counts.unshift(1);
          } else {
            carry.counts[j]++;
          }
        } else {
          j = carry.anchors.indexOf(a);
          if (--carry.counts[j] === 0) {
            carry.anchors.splice(j, 1);
            carry.counts.splice(j, 1);
          }
        }
        if ((index.length === 0 || i === points.length - 1) || carry.anchors.length === 0 || x - index[index.length - 1] > _this.options.gapSize) {
          buckets.push(carry.anchors.slice());
          index.push(x);
        } else {
          if ((ref = buckets[buckets.length - 2]) != null ? ref.length : void 0) {
            last = buckets[buckets.length - 2];
            toMerge = buckets.pop();
            index.pop();
          } else {
            last = buckets[buckets.length - 1];
            toMerge = [];
          }
          ref1 = carry.anchors;
          for (k = 0, len = ref1.length; k < len; k++) {
            a0 = ref1[k];
            if (indexOf.call(last, a0) < 0) {
              last.push(a0);
            }
          }
          for (l = 0, len1 = toMerge.length; l < len1; l++) {
            a0 = toMerge[l];
            if (indexOf.call(last, a0) < 0) {
              last.push(a0);
            }
          }
        }
        return {
          buckets: buckets,
          index: index,
          carry: carry
        };
      };
    })(this), {
      buckets: [],
      index: [],
      carry: {
        anchors: [],
        counts: [],
        latest: 0
      }
    }), this.buckets = ref.buckets, this.index = ref.index;
    this.buckets.unshift([], above, []);
    this.index.unshift(0, BUCKET_TOP_THRESHOLD - 1, BUCKET_TOP_THRESHOLD);
    this.buckets.push([], below, []);
    this.index.push(window.innerHeight - BUCKET_NAV_SIZE, window.innerHeight - BUCKET_NAV_SIZE + 1, window.innerHeight);
    max = 0;
    ref1 = this.buckets;
    for (k = 0, len = ref1.length; k < len; k++) {
      b = ref1[k];
      max = Math.max(max, b.length);
    }
    element = this.element;
    this.tabs || (this.tabs = $([]));
    this.tabs.slice(this.buckets.length).remove();
    this.tabs = this.tabs.slice(0, this.buckets.length);
    $.each(this.buckets.slice(this.tabs.length), (function(_this) {
      return function() {
        var div;
        div = $('<div/>').appendTo(element);
        _this.tabs.push(div[0]);
        return div.addClass('annotator-bucket-indicator').on('mousemove', function(event) {
          var anchor, bucket, l, len1, ref2, results, toggle;
          bucket = _this.tabs.index(event.currentTarget);
          ref2 = _this.annotator.anchors;
          results = [];
          for (l = 0, len1 = ref2.length; l < len1; l++) {
            anchor = ref2[l];
            toggle = indexOf.call(_this.buckets[bucket], anchor) >= 0;
            results.push($(anchor.highlights).toggleClass('annotator-hl-focused', toggle));
          }
          return results;
        }).on('mouseout', function(event) {
          var anchor, bucket, l, len1, ref2, results;
          bucket = _this.tabs.index(event.currentTarget);
          ref2 = _this.buckets[bucket];
          results = [];
          for (l = 0, len1 = ref2.length; l < len1; l++) {
            anchor = ref2[l];
            results.push($(anchor.highlights).removeClass('annotator-hl-focused'));
          }
          return results;
        }).on('click', function(event) {
          var anchor, annotations, bucket;
          bucket = _this.tabs.index(event.currentTarget);
          event.stopPropagation();
          if (_this.isUpper(bucket)) {
            return scrollToClosest(_this.buckets[bucket], 'up');
          } else if (_this.isLower(bucket)) {
            return scrollToClosest(_this.buckets[bucket], 'down');
          } else {
            annotations = (function() {
              var l, len1, ref2, results;
              ref2 = this.buckets[bucket];
              results = [];
              for (l = 0, len1 = ref2.length; l < len1; l++) {
                anchor = ref2[l];
                results.push(anchor.annotation);
              }
              return results;
            }).call(_this);
            return annotator.selectAnnotations(annotations, event.ctrlKey || event.metaKey);
          }
        });
      };
    })(this));
    return this._buildTabs(this.tabs, this.buckets);
  };

  BucketBar.prototype._buildTabs = function() {
    return this.tabs.each((function(_this) {
      return function(d, el) {
        var bucket, bucketLength, bucketSize, title;
        el = $(el);
        bucket = _this.buckets[d];
        bucketLength = bucket != null ? bucket.length : void 0;
        title = bucketLength !== 1 ? "Show " + bucketLength + " annotations" : bucketLength > 0 ? 'Show one annotation' : void 0;
        el.attr('title', title);
        el.toggleClass('upper', _this.isUpper(d));
        el.toggleClass('lower', _this.isLower(d));
        if (_this.isUpper(d) || _this.isLower(d)) {
          bucketSize = BUCKET_NAV_SIZE;
        } else {
          bucketSize = BUCKET_SIZE;
        }
        el.css({
          top: (_this.index[d] + _this.index[d + 1]) / 2,
          marginTop: -bucketSize / 2,
          display: !bucketLength ? 'none' : ''
        });
        if (bucket) {
          return el.html("<div class='label'>" + bucketLength + "</div>");
        }
      };
    })(this));
  };

  BucketBar.prototype.isUpper = function(i) {
    return i === 1;
  };

  BucketBar.prototype.isLower = function(i) {
    return i === this.index.length - 2;
  };

  return BucketBar;

})(Annotator.Plugin);

BucketBar.BUCKET_SIZE = BUCKET_SIZE;

BucketBar.BUCKET_NAV_SIZE = BUCKET_NAV_SIZE;

BucketBar.BUCKET_TOP_THRESHOLD = BUCKET_TOP_THRESHOLD;


},{"../highlighter":9,"annotator":28,"raf":41,"scroll-into-view":42}],14:[function(require,module,exports){
var Annotator, CrossFrame, extract,
  slice = [].slice,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Annotator = require('annotator');

extract = extract = function() {
  var i, key, keys, len, obj, ret;
  obj = arguments[0], keys = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  ret = {};
  for (i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    if (obj.hasOwnProperty(key)) {
      ret[key] = obj[key];
    }
  }
  return ret;
};

module.exports = CrossFrame = (function(superClass) {
  extend(CrossFrame, superClass);

  function CrossFrame(elem, options) {
    var annotationSync, bridge, discovery, opts;
    CrossFrame.__super__.constructor.apply(this, arguments);
    opts = extract(options, 'server');
    discovery = new CrossFrame.Discovery(window, opts);
    bridge = new CrossFrame.Bridge();
    opts = extract(options, 'on', 'emit', 'formatter', 'parser');
    annotationSync = new CrossFrame.AnnotationSync(bridge, opts);
    this.pluginInit = function() {
      var onDiscoveryCallback;
      onDiscoveryCallback = function(source, origin, token) {
        return bridge.createChannel(source, origin, token);
      };
      return discovery.startDiscovery(onDiscoveryCallback);
    };
    this.destroy = function() {
      Annotator.Plugin.prototype.destroy.apply(this, arguments);
      bridge.destroy();
      return discovery.stopDiscovery();
    };
    this.sync = function(annotations, cb) {
      return annotationSync.sync(annotations, cb);
    };
    this.on = function(event, fn) {
      return bridge.on(event, fn);
    };
    this.call = function() {
      var args, message;
      message = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return bridge.call.apply(bridge, [message].concat(slice.call(args)));
    };
    this.onConnect = function(fn) {
      return bridge.onConnect(fn);
    };
  }

  return CrossFrame;

})(Annotator.Plugin);


},{"annotator":28}],15:[function(require,module,exports){
'use strict';

/**
 * This PDFMetadata service extracts metadata about a loading/loaded PDF
 * document from a PDF.js PDFViewerApplication object.
 *
 * This hides from users of this service the need to wait until the PDF document
 * is loaded before extracting the relevant metadata.
 */
function PDFMetadata(app) {
  this._loaded = new Promise(function (resolve) {
    var finish = function () {
      window.removeEventListener('documentload', finish);
      resolve(app);
    };

    if (app.documentFingerprint) {
      resolve(app);
    } else {
      window.addEventListener('documentload', finish);
    }
  });
}

/**
 * Returns a promise of the URI of the loaded PDF.
 */
PDFMetadata.prototype.getUri = function () {
  return this._loaded.then(function (app) {
    var uri = getPDFURL(app);
    if (!uri) {
      uri = fingerprintToURN(app.documentFingerprint);
    }
    return uri;
  });
};

/**
 * Returns a promise of a metadata object, containing:
 *
 * title(string) - The document title
 * link(array) - An array of link objects representing URIs for the document
 * documentFingerprint(string) - The document fingerprint
 */
PDFMetadata.prototype.getMetadata = function () {
  return this._loaded.then(function (app) {
    var title = document.title;

    if (app.metadata && app.metadata.has('dc:title') && app.metadata.get('dc:title') !== 'Untitled') {
      title = app.metadata.get('dc:title');
    } else if (app.documentInfo && app.documentInfo.Title) {
      title = app.documentInfo.Title;
    }

    var link = [
      {href: fingerprintToURN(app.documentFingerprint)},
    ];

    var url = getPDFURL(app);
    if (url) {
      link.push({href: url});
    }

    return {
      title: title,
      link: link,
      documentFingerprint: app.documentFingerprint,
    };
  });
};

function fingerprintToURN(fingerprint) {
  return 'urn:x-pdf:' + String(fingerprint);
}

function getPDFURL(app) {
  // Local file:// URLs should not be saved in document metadata.
  // Entries in document.link should be URIs. In the case of
  // local files, omit the URL.
  if (app.url.indexOf('file://') !== 0) {
    return app.url;
  }

  return null;
}

module.exports = PDFMetadata;

},{}],16:[function(require,module,exports){
var Annotator, PDF, extend,
  extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

extend = require('extend');

Annotator = require('annotator');

module.exports = PDF = (function(superClass) {
  extend1(PDF, superClass);

  function PDF() {
    return PDF.__super__.constructor.apply(this, arguments);
  }

  PDF.prototype.documentLoaded = null;

  PDF.prototype.observer = null;

  PDF.prototype.pdfViewer = null;

  PDF.prototype.pluginInit = function() {
    var PDFMetadata;
    this.annotator.anchoring = require('../anchoring/pdf');
    PDFMetadata = require('./pdf-metadata');
    this.pdfViewer = PDFViewerApplication.pdfViewer;
    this.pdfViewer.viewer.classList.add('has-transparent-text-layer');
    this.pdfMetadata = new PDFMetadata(PDFViewerApplication);
    this.observer = new MutationObserver((function(_this) {
      return function(mutations) {
        return _this._update();
      };
    })(this));
    return this.observer.observe(this.pdfViewer.viewer, {
      attributes: true,
      attributeFilter: ['data-loaded'],
      childList: true,
      subtree: true
    });
  };

  PDF.prototype.destroy = function() {
    this.pdfViewer.viewer.classList.remove('has-transparent-text-layer');
    return this.observer.disconnect();
  };

  PDF.prototype.uri = function() {
    return this.pdfMetadata.getUri();
  };

  PDF.prototype.getMetadata = function() {
    return this.pdfMetadata.getMetadata();
  };

  PDF.prototype._update = function() {
    var anchor, annotation, annotator, div, hl, i, j, k, l, len, len1, len2, page, pageIndex, pdfViewer, placeholder, ref, ref1, ref2, ref3, ref4, ref5, refreshAnnotations, results;
    annotator = this.annotator, pdfViewer = this.pdfViewer;
    refreshAnnotations = [];
    for (pageIndex = i = 0, ref = pdfViewer.pagesCount; 0 <= ref ? i < ref : i > ref; pageIndex = 0 <= ref ? ++i : --i) {
      page = pdfViewer.getPageView(pageIndex);
      if (!((ref1 = page.textLayer) != null ? ref1.renderingDone : void 0)) {
        continue;
      }
      div = (ref2 = page.div) != null ? ref2 : page.el;
      placeholder = div.getElementsByClassName('annotator-placeholder')[0];
      switch (page.renderingState) {
        case RenderingStates.INITIAL:
          page.textLayer = null;
          break;
        case RenderingStates.FINISHED:
          if (placeholder != null) {
            placeholder.parentNode.removeChild(placeholder);
          }
      }
    }
    ref3 = annotator.anchors;
    for (j = 0, len = ref3.length; j < len; j++) {
      anchor = ref3[j];
      if (!(anchor.highlights != null)) {
        continue;
      }
      if (ref4 = anchor.annotation, indexOf.call(refreshAnnotations, ref4) >= 0) {
        continue;
      }
      ref5 = anchor.highlights;
      for (k = 0, len1 = ref5.length; k < len1; k++) {
        hl = ref5[k];
        if (!document.body.contains(hl)) {
          delete anchor.highlights;
          delete anchor.range;
          refreshAnnotations.push(anchor.annotation);
          break;
        }
      }
    }
    results = [];
    for (l = 0, len2 = refreshAnnotations.length; l < len2; l++) {
      annotation = refreshAnnotations[l];
      results.push(annotator.anchor(annotation));
    }
    return results;
  };

  return PDF;

})(Annotator.Plugin);


},{"../anchoring/pdf":5,"./pdf-metadata":15,"annotator":28,"extend":36}],17:[function(require,module,exports){
var $, Annotator, Toolbar, makeButton,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Annotator = require('annotator');

$ = Annotator.$;

makeButton = function(item) {
  var anchor, button;
  anchor = $('<button></button>').attr('href', '').attr('title', item.title).attr('name', item.name).on(item.on).addClass('annotator-frame-button').addClass(item["class"]);
  button = $('<li></li>').append(anchor);
  return button[0];
};

module.exports = Toolbar = (function(superClass) {
  var HIDE_CLASS;

  extend(Toolbar, superClass);

  function Toolbar() {
    return Toolbar.__super__.constructor.apply(this, arguments);
  }

  HIDE_CLASS = 'annotator-hide';

  Toolbar.prototype.events = {
    'setVisibleHighlights': 'onSetVisibleHighlights'
  };

  Toolbar.prototype.html = '<div class="annotator-toolbar"></div>';

  Toolbar.prototype.pluginInit = function() {
    var item, items, list;
    this.annotator.toolbar = this.toolbar = $(this.html);
    if (this.options.container != null) {
      $(this.options.container).append(this.toolbar);
    } else {
      $(this.element).append(this.toolbar);
    }
    items = [
      {
        "title": "Toggle or Resize Sidebar",
        "class": "annotator-frame-button--sidebar_toggle h-icon-chevron-left",
        "name": "sidebar-toggle",
        "on": {
          "click": (function(_this) {
            return function(event) {
              var collapsed;
              event.preventDefault();
              event.stopPropagation();
              collapsed = _this.annotator.frame.hasClass('annotator-collapsed');
              if (collapsed) {
                return _this.annotator.show();
              } else {
                return _this.annotator.hide();
              }
            };
          })(this)
        }
      }, {
        "title": "Hide Highlights",
        "class": "h-icon-visibility",
        "name": "highlight-visibility",
        "on": {
          "click": (function(_this) {
            return function(event) {
              var state;
              event.preventDefault();
              event.stopPropagation();
              state = !_this.annotator.visibleHighlights;
              return _this.annotator.setVisibleHighlights(state);
            };
          })(this)
        }
      }, {
        "title": "New Page Note",
        "class": "h-icon-note",
        "name": "insert-comment",
        "on": {
          "click": (function(_this) {
            return function(event) {
              event.preventDefault();
              event.stopPropagation();
              _this.annotator.createAnnotation();
              return _this.annotator.show();
            };
          })(this)
        }
      }
    ];
    this.buttons = $((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        results.push(makeButton(item));
      }
      return results;
    })());
    list = $('<ul></ul>');
    this.buttons.appendTo(list);
    this.toolbar.append(list);
    return this.toolbar.on('mouseup', 'a', function(event) {
      return $(event.target).blur();
    });
  };

  Toolbar.prototype.onSetVisibleHighlights = function(state) {
    if (state) {
      return $('[name=highlight-visibility]').removeClass('h-icon-visibility-off').addClass('h-icon-visibility').prop('title', 'Hide Highlights');
    } else {
      return $('[name=highlight-visibility]').removeClass('h-icon-visibility').addClass('h-icon-visibility-off').prop('title', 'Show Highlights');
    }
  };

  return Toolbar;

})(Annotator.Plugin);


},{"annotator":28}],18:[function(require,module,exports){
'use strict';

function translate(rect, x, y) {
  return {
    left: rect.left + x,
    top: rect.top + y,
    width: rect.width,
    height: rect.height,
  };
}

function mapViewportRectToDocument(window, rect) {
  // `pageXOffset` and `pageYOffset` are used rather than `scrollX`
  // and `scrollY` for IE 10/11 compatibility.
  return translate(rect, window.pageXOffset, window.pageYOffset);
}

/**
 * Returns true if the start point of a selection occurs after the end point,
 * in document order.
 */
function isSelectionBackwards(selection) {
  if (selection.focusNode === selection.anchorNode) {
    return selection.focusOffset < selection.anchorOffset;
  }

  var range = selection.getRangeAt(0);
  return range.startContainer === selection.focusNode;
}

/**
 * Returns true if `node` lies within a range.
 *
 * This is a simplified version of `Range.isPointInRange()` for compatibility
 * with IE.
 *
 * @param {Range} range
 * @param {Node} node
 */
function isNodeInRange(range, node) {
  if (node === range.startContainer || node === range.endContainer) {
    return true;
  }

  var nodeRange = node.ownerDocument.createRange();
  nodeRange.selectNode(node);
  var isAtOrBeforeStart =
    range.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0;
  var isAtOrAfterEnd =
    range.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0;
  nodeRange.detach();
  return isAtOrBeforeStart && isAtOrAfterEnd;
}

/**
 * Iterate over all Node(s) in `range` in document order and invoke `callback`
 * for each of them.
 *
 * @param {Range} range
 * @param {Function} callback
 */
function forEachNodeInRange(range, callback) {
  var root = range.commonAncestorContainer;

  // The `whatToShow`, `filter` and `expandEntityReferences` arguments are
  // mandatory in IE although optional according to the spec.
  var nodeIter = root.ownerDocument.createNodeIterator(root,
    NodeFilter.SHOW_ALL, null /* filter */, false /* expandEntityReferences */);

  var currentNode;
  while (currentNode = nodeIter.nextNode()) { // eslint-disable-line no-cond-assign
    if (isNodeInRange(range, currentNode)) {
      callback(currentNode);
    }
  }
}

/**
 * Returns the bounding rectangles of non-whitespace text nodes in `range`.
 *
 * @param {Range} range
 * @return {Array<Rect>} Array of bounding rects in document coordinates.
 */
function getTextBoundingBoxes(range) {
  var whitespaceOnly = /^\s*$/;
  var textNodes = [];
  forEachNodeInRange(range, function (node) {
    if (node.nodeType === Node.TEXT_NODE &&
        !node.textContent.match(whitespaceOnly)) {
      textNodes.push(node);
    }
  });

  var rects = [];
  textNodes.forEach(function (node) {
    var nodeRange = node.ownerDocument.createRange();
    nodeRange.selectNodeContents(node);
    if (node === range.startContainer) {
      nodeRange.setStart(node, range.startOffset);
    }
    if (node === range.endContainer) {
      nodeRange.setEnd(node, range.endOffset);
    }
    if (nodeRange.collapsed) {
      // If the range ends at the start of this text node or starts at the end
      // of this node then do not include it.
      return;
    }

    // Measure the range and translate from viewport to document coordinates
    var viewportRects = Array.from(nodeRange.getClientRects());
    nodeRange.detach();
    rects = rects.concat(viewportRects.map(function (rect) {
      return mapViewportRectToDocument(node.ownerDocument.defaultView, rect);
    }));
  });
  return rects;
}

/**
 * Returns the rectangle, in document coordinates, for the line of text
 * containing the focus point of a Selection.
 *
 * Returns null if the selection is empty.
 *
 * @param {Selection} selection
 * @return {Rect?}
 */
function selectionFocusRect(selection) {
  if (selection.isCollapsed) {
    return null;
  }
  var textBoxes = getTextBoundingBoxes(selection.getRangeAt(0));
  if (textBoxes.length === 0) {
    return null;
  }

  if (isSelectionBackwards(selection)) {
    return textBoxes[0];
  } else {
    return textBoxes[textBoxes.length - 1];
  }
}

module.exports = {
  getTextBoundingBoxes: getTextBoundingBoxes,
  isNodeInRange: isNodeInRange,
  isSelectionBackwards: isSelectionBackwards,
  selectionFocusRect: selectionFocusRect,
};

},{}],19:[function(require,module,exports){
'use strict';

var observable = require('../util/observable');

/** Returns the selected `DOMRange` in `document`. */
function selectedRange(document) {
  var selection = document.getSelection();
  if (!selection.rangeCount || selection.getRangeAt(0).collapsed) {
    return null;
  } else {
    return selection.getRangeAt(0);
  }
}

/**
 * Returns an Observable stream of text selections in the current document.
 *
 * New values are emitted when the user finishes making a selection
 * (represented by a `DOMRange`) or clears a selection (represented by `null`).
 *
 * A value will be emitted with the selected range at the time of subscription
 * on the next tick.
 *
 * @return Observable<DOMRange|null>
 */
function selections(document) {

  // Get a stream of selection changes that occur whilst the user is not
  // making a selection with the mouse.
  var isMouseDown;
  var selectionEvents = observable.listen(document,
    ['mousedown', 'mouseup', 'selectionchange'])
    .filter(function (event) {
      if (event.type === 'mousedown' || event.type === 'mouseup') {
        isMouseDown = event.type === 'mousedown';
        return false;
      } else {
        return !isMouseDown;
      }
    });

  var events = observable.merge([
    // Add a delay before checking the state of the selection because
    // the selection is not updated immediately after a 'mouseup' event
    // but only on the next tick of the event loop.
    observable.buffer(10, observable.listen(document, ['mouseup'])),

    // Buffer selection changes to avoid continually emitting events whilst the
    // user drags the selection handles on mobile devices
    observable.buffer(100, selectionEvents),

    // Emit an initial event on the next tick
    observable.delay(0, observable.Observable.of({})),
  ]);

  return events.map(function () {
    return selectedRange(document);
  });
}

module.exports = selections;

},{"../util/observable":26}],20:[function(require,module,exports){
var Hammer, Host, MIN_RESIZE, Sidebar, extend, raf,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

extend = require('extend');

raf = require('raf');

Hammer = require('hammerjs');

Host = require('./host');

MIN_RESIZE = 280;

module.exports = Sidebar = (function(superClass) {
  extend1(Sidebar, superClass);

  Sidebar.prototype.options = {
    Document: {},
    TextSelection: {},
    BucketBar: {
      container: '.annotator-frame'
    },
    Toolbar: {
      container: '.annotator-frame'
    }
  };

  Sidebar.prototype.renderFrame = null;

  Sidebar.prototype.gestureState = null;

  function Sidebar(element, options) {
    this.onSwipe = bind(this.onSwipe, this);
    this.onPan = bind(this.onPan, this);
    Sidebar.__super__.constructor.apply(this, arguments);
    this.hide();
    if (options.openSidebar || options.annotations) {
      this.on('panelReady', (function(_this) {
        return function() {
          return _this.show();
        };
      })(this));
    }
    if (this.plugins.BucketBar != null) {
      this.plugins.BucketBar.element.on('click', (function(_this) {
        return function(event) {
          return _this.show();
        };
      })(this));
    }
    if (this.plugins.Toolbar != null) {
      this._setupGestures();
    }
    this._setupSidebarEvents();
  }

  Sidebar.prototype._setupDocumentEvents = function() {
    this.element.on('click', (function(_this) {
      return function(event) {
        var ref;
        if (!((ref = _this.selectedTargets) != null ? ref.length : void 0)) {
          return _this.hide();
        }
      };
    })(this));
    return this;
  };

  Sidebar.prototype._setupSidebarEvents = function() {
    this.crossframe.on('show', this.show.bind(this));
    this.crossframe.on('hide', this.hide.bind(this));
    return this;
  };

  Sidebar.prototype._setupGestures = function() {
    var $toggle, mgr, pan, swipe;
    $toggle = this.toolbar.find('[name=sidebar-toggle]');
    $toggle.on('touchmove', function(event) {
      return event.preventDefault();
    });
    mgr = new Hammer.Manager($toggle[0]).on('panstart panend panleft panright', this.onPan).on('swipeleft swiperight', this.onSwipe);
    pan = mgr.add(new Hammer.Pan({
      direction: Hammer.DIRECTION_HORIZONTAL
    }));
    swipe = mgr.add(new Hammer.Swipe({
      direction: Hammer.DIRECTION_HORIZONTAL
    }));
    swipe.recognizeWith(pan);
    this._initializeGestureState();
    return this;
  };

  Sidebar.prototype._initializeGestureState = function() {
    return this.gestureState = {
      initial: null,
      final: null
    };
  };

  Sidebar.prototype._updateLayout = function() {
    if (this.renderFrame) {
      return;
    }
    return this.renderFrame = raf((function(_this) {
      return function() {
        var m, w;
        _this.renderFrame = null;
        if (_this.gestureState.final !== _this.gestureState.initial) {
          m = _this.gestureState.final;
          w = -m;
          _this.frame.css('margin-left', m + "px");
          if (w >= MIN_RESIZE) {
            return _this.frame.css('width', w + "px");
          }
        }
      };
    })(this));
  };

  Sidebar.prototype.onPan = function(event) {
    var d, m;
    switch (event.type) {
      case 'panstart':
        this._initializeGestureState();
        this.frame.addClass('annotator-no-transition');
        this.frame.css('pointer-events', 'none');
        return this.gestureState.initial = parseInt(getComputedStyle(this.frame[0]).marginLeft);
      case 'panend':
        this.frame.removeClass('annotator-no-transition');
        this.frame.css('pointer-events', '');
        if (this.gestureState.final <= -MIN_RESIZE) {
          this.show();
        } else {
          this.hide();
        }
        return this._initializeGestureState();
      case 'panleft':
      case 'panright':
        if (this.gestureState.initial == null) {
          return;
        }
        m = this.gestureState.initial;
        d = event.deltaX;
        this.gestureState.final = Math.min(Math.round(m + d), 0);
        return this._updateLayout();
    }
  };

  Sidebar.prototype.onSwipe = function(event) {
    switch (event.type) {
      case 'swipeleft':
        return this.show();
      case 'swiperight':
        return this.hide();
    }
  };

  Sidebar.prototype.show = function() {
    this.crossframe.call('sidebarOpened');
    this.frame.css({
      'margin-left': (-1 * this.frame.width()) + "px"
    });
    this.frame.removeClass('annotator-collapsed');
    if (this.toolbar != null) {
      return this.toolbar.find('[name=sidebar-toggle]').removeClass('h-icon-chevron-left').addClass('h-icon-chevron-right');
    }
  };

  Sidebar.prototype.hide = function() {
    this.frame.css({
      'margin-left': ''
    });
    this.frame.addClass('annotator-collapsed');
    if (this.toolbar != null) {
      return this.toolbar.find('[name=sidebar-toggle]').removeClass('h-icon-chevron-right').addClass('h-icon-chevron-left');
    }
  };

  Sidebar.prototype.createAnnotation = function(annotation) {
    if (annotation == null) {
      annotation = {};
    }
    Sidebar.__super__.createAnnotation.apply(this, arguments);
    if (!annotation.$highlight) {
      return this.show();
    }
  };

  Sidebar.prototype.showAnnotations = function(annotations) {
    Sidebar.__super__.showAnnotations.apply(this, arguments);
    return this.show();
  };

  return Sidebar;

})(Host);


},{"./host":10,"extend":36,"hammerjs":37,"raf":41}],21:[function(require,module,exports){
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


},{"./frame-rpc":23,"extend":36}],22:[function(require,module,exports){
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


},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
'use strict';

/**
 * Extracts a direct-linked annotation ID from the fragment of a URL.
 *
 * @param {string} url - The URL which may contain a '#annotations:<ID>'
 *        fragment.
 * @return {string?} The annotation ID if present
 */
function extractIDFromURL(url) {
  try {
    // Annotation IDs are url-safe-base64 identifiers
    // See https://tools.ietf.org/html/rfc4648#page-7
    var annotFragmentMatch = url.match(/#annotations:([A-Za-z0-9_-]+)$/);
    if (annotFragmentMatch) {
      return annotFragmentMatch[1];
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
}

module.exports = {
  extractIDFromURL: extractIDFromURL,
};

},{}],26:[function(require,module,exports){
'use strict';

/**
 * Functions (aka. 'operators') for generating and manipulating streams of
 * values using the Observable API.
 */

var Observable = require('zen-observable');

 /**
  * Returns an observable of events emitted by a DOM event source
  * (eg. an Element, Document or Window).
  *
  * @param {EventTarget} src - The event source.
  * @param {Array<string>} eventNames - List of events to subscribe to
  */
function listen(src, eventNames) {
  return new Observable(function (observer) {
    var onNext = function (event) {
      observer.next(event);
    };

    eventNames.forEach(function (event) {
      src.addEventListener(event, onNext);
    });

    return function () {
      eventNames.forEach(function (event) {
        src.removeEventListener(event, onNext);
      });
    };
  });
}

/**
 * Delay events from a source Observable by `delay` ms.
 */
function delay(delay, src) {
  return new Observable(function (obs) {
    var timeouts = [];
    var sub = src.subscribe({
      next: function (value) {
        var t = setTimeout(function () {
          timeouts = timeouts.filter(function (other) { return other !== t; });
          obs.next(value);
        }, delay);
        timeouts.push(t);
      },
    });
    return function () {
      timeouts.forEach(clearTimeout);
      sub.unsubscribe();
    };
  });
}

 /**
  * Buffers events from a source Observable, waiting for a pause of `delay`
  * ms with no events before emitting the last value from `src`.
  *
  * @param {number} delay
  * @param {Observable<T>} src
  * @return {Observable<T>}
  */
function buffer(delay, src) {
  return new Observable(function (obs) {
    var lastValue;
    var timeout;

    function onNext() {
      obs.next(lastValue);
    }

    var sub = src.subscribe({
      next: function (value) {
        lastValue = value;
        clearTimeout(timeout);
        timeout = setTimeout(onNext, delay);
      },
    });

    return function () {
      sub.unsubscribe();
      clearTimeout(timeout);
    };
  });
}

 /**
  * Merges multiple streams of values into a single stream.
  *
  * @param {Array<Observable>} sources
  * @return Observable
  */
function merge(sources) {
  return new Observable(function (obs) {
    var subs = sources.map(function (src) {
      return src.subscribe({
        next: function (value) {
          obs.next(value);
        },
      });
    });

    return function () {
      subs.forEach(function (sub) {
        sub.unsubscribe();
      });
    };
  });
}

/** Drop the first `n` events from the `src` Observable. */
function drop(src, n) {
  var count = 0;
  return src.filter(function () {
    ++count;
    return count > n;
  });
}

module.exports = {
  buffer: buffer,
  delay: delay,
  drop: drop,
  listen: listen,
  merge: merge,
  Observable: Observable,
};

},{"zen-observable":43}],27:[function(require,module,exports){

/*
** Annotator v1.2.10-dev-6536160
** https://github.com/okfn/annotator/
**
** Copyright 2015, the Annotator project contributors.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/okfn/annotator/blob/master/LICENSE
**
** Built at: 2015-05-11 18:53:38Z
 */


//

// Generated by CoffeeScript 1.6.3
(function() {
  var _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Annotator.Plugin.Document = (function(_super) {
    var $;

    __extends(Document, _super);

    function Document() {
      this._getFavicon = __bind(this._getFavicon, this);
      this._getLinks = __bind(this._getLinks, this);
      this._getTitle = __bind(this._getTitle, this);
      this._getMetaTags = __bind(this._getMetaTags, this);
      this._getEprints = __bind(this._getEprints, this);
      this._getPrism = __bind(this._getPrism, this);
      this._getDublinCore = __bind(this._getDublinCore, this);
      this._getTwitter = __bind(this._getTwitter, this);
      this._getFacebook = __bind(this._getFacebook, this);
      this._getHighwire = __bind(this._getHighwire, this);
      this.getDocumentMetadata = __bind(this.getDocumentMetadata, this);
      this.beforeAnnotationCreated = __bind(this.beforeAnnotationCreated, this);
      this.uris = __bind(this.uris, this);
      this.uri = __bind(this.uri, this);
      _ref = Document.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    $ = Annotator.$;

    Document.prototype.events = {
      'beforeAnnotationCreated': 'beforeAnnotationCreated'
    };

    Document.prototype.pluginInit = function() {
      return this.getDocumentMetadata();
    };

    Document.prototype.uri = function() {
      var link, uri, _i, _len, _ref1;
      uri = decodeURIComponent(document.location.href);
      _ref1 = this.metadata.link;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        link = _ref1[_i];
        if (link.rel === "canonical") {
          uri = link.href;
        }
      }
      return uri;
    };

    Document.prototype.uris = function() {
      var href, link, uniqueUrls, _i, _len, _ref1;
      uniqueUrls = {};
      _ref1 = this.metadata.link;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        link = _ref1[_i];
        if (link.href) {
          uniqueUrls[link.href] = true;
        }
      }
      return (function() {
        var _results;
        _results = [];
        for (href in uniqueUrls) {
          _results.push(href);
        }
        return _results;
      })();
    };

    Document.prototype.beforeAnnotationCreated = function(annotation) {
      return annotation.document = this.metadata;
    };

    Document.prototype.getDocumentMetadata = function() {
      this.metadata = {};
      this._getHighwire();
      this._getDublinCore();
      this._getFacebook();
      this._getEprints();
      this._getPrism();
      this._getTwitter();
      this._getFavicon();
      this._getTitle();
      this._getLinks();
      return this.metadata;
    };

    Document.prototype._getHighwire = function() {
      return this.metadata.highwire = this._getMetaTags("citation", "name", "_");
    };

    Document.prototype._getFacebook = function() {
      return this.metadata.facebook = this._getMetaTags("og", "property", ":");
    };

    Document.prototype._getTwitter = function() {
      return this.metadata.twitter = this._getMetaTags("twitter", "name", ":");
    };

    Document.prototype._getDublinCore = function() {
      return this.metadata.dc = this._getMetaTags("dc", "name", ".");
    };

    Document.prototype._getPrism = function() {
      return this.metadata.prism = this._getMetaTags("prism", "name", ".");
    };

    Document.prototype._getEprints = function() {
      return this.metadata.eprints = this._getMetaTags("eprints", "name", ".");
    };

    Document.prototype._getMetaTags = function(prefix, attribute, delimiter) {
      var content, match, meta, n, name, tags, _i, _len, _ref1;
      tags = {};
      _ref1 = $("meta");
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        meta = _ref1[_i];
        name = $(meta).attr(attribute);
        content = $(meta).prop("content");
        if (name) {
          match = name.match(RegExp("^" + prefix + delimiter + "(.+)$", "i"));
          if (match) {
            n = match[1];
            if (tags[n]) {
              tags[n].push(content);
            } else {
              tags[n] = [content];
            }
          }
        }
      }
      return tags;
    };

    Document.prototype._getTitle = function() {
      if (this.metadata.highwire.title) {
        return this.metadata.title = this.metadata.highwire.title[0];
      } else if (this.metadata.eprints.title) {
        return this.metadata.title = this.metadata.eprints.title[0];
      } else if (this.metadata.prism.title) {
        return this.metadata.title = this.metadata.prism.title[0];
      } else if (this.metadata.facebook.title) {
        return this.metadata.title = this.metadata.facebook.title[0];
      } else if (this.metadata.twitter.title) {
        return this.metadata.title = this.metadata.twitter.title[0];
      } else if (this.metadata.dc.title) {
        return this.metadata.title = this.metadata.dc.title[0];
      } else {
        return this.metadata.title = $("head title").text();
      }
    };

    Document.prototype._getLinks = function() {
      var doi, href, id, l, lang, link, name, rel, type, url, values, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2, _ref3, _results;
      this.metadata.link = [
        {
          href: document.location.href
        }
      ];
      _ref1 = $("link");
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        link = _ref1[_i];
        l = $(link);
        href = this._absoluteUrl(l.prop('href'));
        rel = l.prop('rel');
        type = l.prop('type');
        lang = l.prop('hreflang');
        if (rel !== "alternate" && rel !== "canonical" && rel !== "bookmark" && rel !== "shortlink") {
          continue;
        }
        if (rel === 'alternate') {
          if (type && type.match(/^application\/(rss|atom)\+xml/)) {
            continue;
          }
          if (lang) {
            continue;
          }
        }
        this.metadata.link.push({
          href: href,
          rel: rel,
          type: type
        });
      }
      _ref2 = this.metadata.highwire;
      for (name in _ref2) {
        values = _ref2[name];
        if (name === "pdf_url") {
          for (_j = 0, _len1 = values.length; _j < _len1; _j++) {
            url = values[_j];
            this.metadata.link.push({
              href: this._absoluteUrl(url),
              type: "application/pdf"
            });
          }
        }
        if (name === "doi") {
          for (_k = 0, _len2 = values.length; _k < _len2; _k++) {
            doi = values[_k];
            if (doi.slice(0, 4) !== "doi:") {
              doi = "doi:" + doi;
            }
            this.metadata.link.push({
              href: doi
            });
          }
        }
      }
      _ref3 = this.metadata.dc;
      _results = [];
      for (name in _ref3) {
        values = _ref3[name];
        if (name === "identifier") {
          _results.push((function() {
            var _l, _len3, _results1;
            _results1 = [];
            for (_l = 0, _len3 = values.length; _l < _len3; _l++) {
              id = values[_l];
              if (id.slice(0, 4) === "doi:") {
                _results1.push(this.metadata.link.push({
                  href: id
                }));
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
          }).call(this));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Document.prototype._getFavicon = function() {
      var link, _i, _len, _ref1, _ref2, _results;
      _ref1 = $("link");
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        link = _ref1[_i];
        if ((_ref2 = $(link).prop("rel")) === "shortcut icon" || _ref2 === "icon") {
          _results.push(this.metadata["favicon"] = this._absoluteUrl(link.href));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Document.prototype._absoluteUrl = function(url) {
      var d;
      d = document.createElement('a');
      d.href = url;
      return d.href;
    };

    return Document;

  })(Annotator.Plugin);

}).call(this);

//

},{}],28:[function(require,module,exports){
(function (global){

; jQuery = global.jQuery = require("jquery");
; var __browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {

/*
** Annotator v1.2.10-dev-6536160
** https://github.com/okfn/annotator/
**
** Copyright 2015, the Annotator project contributors.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/okfn/annotator/blob/master/LICENSE
**
** Built at: 2015-05-11 18:53:38Z
 */


//

// Generated by CoffeeScript 1.6.3
(function() {
  var $, Annotator, Delegator, LinkParser, Range, Util, findChild, fn, functions, g, getNodeName, getNodePosition, gettext, simpleXPathJQuery, simpleXPathPure, _Annotator, _gettext, _i, _j, _len, _len1, _ref, _ref1, _t,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  simpleXPathJQuery = function(relativeRoot) {
    var jq;
    jq = this.map(function() {
      var elem, idx, path, tagName;
      path = '';
      elem = this;
      while ((elem != null ? elem.nodeType : void 0) === Node.ELEMENT_NODE && elem !== relativeRoot) {
        tagName = elem.tagName.replace(":", "\\:");
        idx = $(elem.parentNode).children(tagName).index(elem) + 1;
        idx = "[" + idx + "]";
        path = "/" + elem.tagName.toLowerCase() + idx + path;
        elem = elem.parentNode;
      }
      return path;
    });
    return jq.get();
  };

  simpleXPathPure = function(relativeRoot) {
    var getPathSegment, getPathTo, jq, rootNode;
    getPathSegment = function(node) {
      var name, pos;
      name = getNodeName(node);
      pos = getNodePosition(node);
      return "" + name + "[" + pos + "]";
    };
    rootNode = relativeRoot;
    getPathTo = function(node) {
      var xpath;
      xpath = '';
      while (node !== rootNode) {
        if (node == null) {
          throw new Error("Called getPathTo on a node which was not a descendant of @rootNode. " + rootNode);
        }
        xpath = (getPathSegment(node)) + '/' + xpath;
        node = node.parentNode;
      }
      xpath = '/' + xpath;
      xpath = xpath.replace(/\/$/, '');
      return xpath;
    };
    jq = this.map(function() {
      var path;
      path = getPathTo(this);
      return path;
    });
    return jq.get();
  };

  findChild = function(node, type, index) {
    var child, children, found, name, _i, _len;
    if (!node.hasChildNodes()) {
      throw new Error("XPath error: node has no children!");
    }
    children = node.childNodes;
    found = 0;
    for (_i = 0, _len = children.length; _i < _len; _i++) {
      child = children[_i];
      name = getNodeName(child);
      if (name === type) {
        found += 1;
        if (found === index) {
          return child;
        }
      }
    }
    throw new Error("XPath error: wanted child not found.");
  };

  getNodeName = function(node) {
    var nodeName;
    nodeName = node.nodeName.toLowerCase();
    switch (nodeName) {
      case "#text":
        return "text()";
      case "#comment":
        return "comment()";
      case "#cdata-section":
        return "cdata-section()";
      default:
        return nodeName;
    }
  };

  getNodePosition = function(node) {
    var pos, tmp;
    pos = 0;
    tmp = node;
    while (tmp) {
      if (tmp.nodeName === node.nodeName) {
        pos++;
      }
      tmp = tmp.previousSibling;
    }
    return pos;
  };

  gettext = null;

  if (typeof Gettext !== "undefined" && Gettext !== null) {
    _gettext = new Gettext({
      domain: "annotator"
    });
    gettext = function(msgid) {
      return _gettext.gettext(msgid);
    };
  } else {
    gettext = function(msgid) {
      return msgid;
    };
  }

  _t = function(msgid) {
    return gettext(msgid);
  };

  if (!(typeof jQuery !== "undefined" && jQuery !== null ? (_ref = jQuery.fn) != null ? _ref.jquery : void 0 : void 0)) {
    console.error(_t("Annotator requires jQuery: have you included lib/vendor/jquery.js?"));
  }

  if (!(JSON && JSON.parse && JSON.stringify)) {
    console.error(_t("Annotator requires a JSON implementation: have you included lib/vendor/json2.js?"));
  }

  $ = jQuery;

  Util = {};

  Util.flatten = function(array) {
    var flatten;
    flatten = function(ary) {
      var el, flat, _i, _len;
      flat = [];
      for (_i = 0, _len = ary.length; _i < _len; _i++) {
        el = ary[_i];
        flat = flat.concat(el && $.isArray(el) ? flatten(el) : el);
      }
      return flat;
    };
    return flatten(array);
  };

  Util.contains = function(parent, child) {
    var node;
    node = child;
    while (node != null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  };

  Util.getTextNodes = function(jq) {
    var getTextNodes;
    getTextNodes = function(node) {
      var nodes;
      if (node && node.nodeType !== Node.TEXT_NODE) {
        nodes = [];
        if (node.nodeType !== Node.COMMENT_NODE) {
          node = node.lastChild;
          while (node) {
            nodes.push(getTextNodes(node));
            node = node.previousSibling;
          }
        }
        return nodes.reverse();
      } else {
        return node;
      }
    };
    return jq.map(function() {
      return Util.flatten(getTextNodes(this));
    });
  };

  Util.getLastTextNodeUpTo = function(n) {
    var result;
    switch (n.nodeType) {
      case Node.TEXT_NODE:
        return n;
      case Node.ELEMENT_NODE:
        if (n.lastChild != null) {
          result = Util.getLastTextNodeUpTo(n.lastChild);
          if (result != null) {
            return result;
          }
        }
        break;
    }
    n = n.previousSibling;
    if (n != null) {
      return Util.getLastTextNodeUpTo(n);
    } else {
      return null;
    }
  };

  Util.getFirstTextNodeNotBefore = function(n) {
    var result;
    switch (n.nodeType) {
      case Node.TEXT_NODE:
        return n;
      case Node.ELEMENT_NODE:
        if (n.firstChild != null) {
          result = Util.getFirstTextNodeNotBefore(n.firstChild);
          if (result != null) {
            return result;
          }
        }
        break;
    }
    n = n.nextSibling;
    if (n != null) {
      return Util.getFirstTextNodeNotBefore(n);
    } else {
      return null;
    }
  };

  Util.readRangeViaSelection = function(range) {
    var sel;
    sel = Util.getGlobal().getSelection();
    sel.removeAllRanges();
    sel.addRange(range.toRange());
    return sel.toString();
  };

  Util.xpathFromNode = function(el, relativeRoot) {
    var exception, result;
    try {
      result = simpleXPathJQuery.call(el, relativeRoot);
    } catch (_error) {
      exception = _error;
      console.log("jQuery-based XPath construction failed! Falling back to manual.");
      result = simpleXPathPure.call(el, relativeRoot);
    }
    return result;
  };

  Util.nodeFromXPath = function(xp, root) {
    var idx, name, node, step, steps, _i, _len, _ref1;
    steps = xp.substring(1).split("/");
    node = root;
    for (_i = 0, _len = steps.length; _i < _len; _i++) {
      step = steps[_i];
      _ref1 = step.split("["), name = _ref1[0], idx = _ref1[1];
      idx = idx != null ? parseInt((idx != null ? idx.split("]") : void 0)[0]) : 1;
      node = findChild(node, name.toLowerCase(), idx);
    }
    return node;
  };

  Util.escape = function(html) {
    return html.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  Util.uuid = (function() {
    var counter;
    counter = 0;
    return function() {
      return counter++;
    };
  })();

  Util.getGlobal = function() {
    return (function() {
      return this;
    })();
  };

  Util.maxZIndex = function($elements) {
    var all, el;
    all = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = $elements.length; _i < _len; _i++) {
        el = $elements[_i];
        if ($(el).css('position') === 'static') {
          _results.push(-1);
        } else {
          _results.push(parseFloat($(el).css('z-index')) || -1);
        }
      }
      return _results;
    })();
    return Math.max.apply(Math, all);
  };

  Util.mousePosition = function(e, offsetEl) {
    var offset, _ref1;
    if ((_ref1 = $(offsetEl).css('position')) !== 'absolute' && _ref1 !== 'fixed' && _ref1 !== 'relative') {
      offsetEl = $(offsetEl).offsetParent()[0];
    }
    offset = $(offsetEl).offset();
    return {
      top: e.pageY - offset.top,
      left: e.pageX - offset.left
    };
  };

  Util.preventEventDefault = function(event) {
    return event != null ? typeof event.preventDefault === "function" ? event.preventDefault() : void 0 : void 0;
  };

  functions = ["log", "debug", "info", "warn", "exception", "assert", "dir", "dirxml", "trace", "group", "groupEnd", "groupCollapsed", "time", "timeEnd", "profile", "profileEnd", "count", "clear", "table", "error", "notifyFirebug", "firebug", "userObjects"];

  if (typeof console !== "undefined" && console !== null) {
    if (console.group == null) {
      console.group = function(name) {
        return console.log("GROUP: ", name);
      };
    }
    if (console.groupCollapsed == null) {
      console.groupCollapsed = console.group;
    }
    for (_i = 0, _len = functions.length; _i < _len; _i++) {
      fn = functions[_i];
      if (console[fn] == null) {
        console[fn] = function() {
          return console.log(_t("Not implemented:") + (" console." + name));
        };
      }
    }
  } else {
    this.console = {};
    for (_j = 0, _len1 = functions.length; _j < _len1; _j++) {
      fn = functions[_j];
      this.console[fn] = function() {};
    }
    this.console['error'] = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return alert("ERROR: " + (args.join(', ')));
    };
    this.console['warn'] = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return alert("WARNING: " + (args.join(', ')));
    };
  }

  Delegator = (function() {
    Delegator.prototype.events = {};

    Delegator.prototype.options = {};

    Delegator.prototype.element = null;

    function Delegator(element, options) {
      this.options = $.extend(true, {}, this.options, options);
      this.element = $(element);
      this._closures = {};
      this.on = this.subscribe;
      this.addEvents();
    }

    Delegator.prototype.destroy = function() {
      return this.removeEvents();
    };

    Delegator.prototype.addEvents = function() {
      var event, _k, _len2, _ref1, _results;
      _ref1 = Delegator._parseEvents(this.events);
      _results = [];
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        event = _ref1[_k];
        _results.push(this._addEvent(event.selector, event.event, event.functionName));
      }
      return _results;
    };

    Delegator.prototype.removeEvents = function() {
      var event, _k, _len2, _ref1, _results;
      _ref1 = Delegator._parseEvents(this.events);
      _results = [];
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        event = _ref1[_k];
        _results.push(this._removeEvent(event.selector, event.event, event.functionName));
      }
      return _results;
    };

    Delegator.prototype._addEvent = function(selector, event, functionName) {
      var closure,
        _this = this;
      closure = function() {
        return _this[functionName].apply(_this, arguments);
      };
      if (selector === '' && Delegator._isCustomEvent(event)) {
        this.subscribe(event, closure);
      } else {
        this.element.delegate(selector, event, closure);
      }
      this._closures["" + selector + "/" + event + "/" + functionName] = closure;
      return this;
    };

    Delegator.prototype._removeEvent = function(selector, event, functionName) {
      var closure;
      closure = this._closures["" + selector + "/" + event + "/" + functionName];
      if (selector === '' && Delegator._isCustomEvent(event)) {
        this.unsubscribe(event, closure);
      } else {
        this.element.undelegate(selector, event, closure);
      }
      delete this._closures["" + selector + "/" + event + "/" + functionName];
      return this;
    };

    Delegator.prototype.publish = function() {
      this.element.triggerHandler.apply(this.element, arguments);
      return this;
    };

    Delegator.prototype.subscribe = function(event, callback) {
      var closure;
      closure = function() {
        return callback.apply(this, [].slice.call(arguments, 1));
      };
      closure.guid = callback.guid = ($.guid += 1);
      this.element.bind(event, closure);
      return this;
    };

    Delegator.prototype.unsubscribe = function() {
      this.element.unbind.apply(this.element, arguments);
      return this;
    };

    return Delegator;

  })();

  Delegator._parseEvents = function(eventsObj) {
    var event, events, functionName, sel, selector, _k, _ref1;
    events = [];
    for (sel in eventsObj) {
      functionName = eventsObj[sel];
      _ref1 = sel.split(' '), selector = 2 <= _ref1.length ? __slice.call(_ref1, 0, _k = _ref1.length - 1) : (_k = 0, []), event = _ref1[_k++];
      events.push({
        selector: selector.join(' '),
        event: event,
        functionName: functionName
      });
    }
    return events;
  };

  Delegator.natives = (function() {
    var key, specials, val;
    specials = (function() {
      var _ref1, _results;
      _ref1 = jQuery.event.special;
      _results = [];
      for (key in _ref1) {
        if (!__hasProp.call(_ref1, key)) continue;
        val = _ref1[key];
        _results.push(key);
      }
      return _results;
    })();
    return "blur focus focusin focusout load resize scroll unload click dblclick\nmousedown mouseup mousemove mouseover mouseout mouseenter mouseleave\nchange select submit keydown keypress keyup error".split(/[^a-z]+/).concat(specials);
  })();

  Delegator._isCustomEvent = function(event) {
    event = event.split('.')[0];
    return $.inArray(event, Delegator.natives) === -1;
  };

  Range = {};

  Range.sniff = function(r) {
    if (r.commonAncestorContainer != null) {
      return new Range.BrowserRange(r);
    } else if (typeof r.start === "string") {
      return new Range.SerializedRange(r);
    } else if (r.start && typeof r.start === "object") {
      return new Range.NormalizedRange(r);
    } else {
      console.error(_t("Could not sniff range type"));
      return false;
    }
  };

  Range.nodeFromXPath = function(xpath, root) {
    var customResolver, evaluateXPath, namespace, node, segment;
    if (root == null) {
      root = document;
    }
    evaluateXPath = function(xp, nsResolver) {
      var exception;
      if (nsResolver == null) {
        nsResolver = null;
      }
      try {
        return document.evaluate('.' + xp, root, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      } catch (_error) {
        exception = _error;
        console.log("XPath evaluation failed.");
        console.log("Trying fallback...");
        return Util.nodeFromXPath(xp, root);
      }
    };
    if (!$.isXMLDoc(document.documentElement)) {
      return evaluateXPath(xpath);
    } else {
      customResolver = document.createNSResolver(document.ownerDocument === null ? document.documentElement : document.ownerDocument.documentElement);
      node = evaluateXPath(xpath, customResolver);
      if (!node) {
        xpath = ((function() {
          var _k, _len2, _ref1, _results;
          _ref1 = xpath.split('/');
          _results = [];
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            segment = _ref1[_k];
            if (segment && segment.indexOf(':') === -1) {
              _results.push(segment.replace(/^([a-z]+)/, 'xhtml:$1'));
            } else {
              _results.push(segment);
            }
          }
          return _results;
        })()).join('/');
        namespace = document.lookupNamespaceURI(null);
        customResolver = function(ns) {
          if (ns === 'xhtml') {
            return namespace;
          } else {
            return document.documentElement.getAttribute('xmlns:' + ns);
          }
        };
        node = evaluateXPath(xpath, customResolver);
      }
      return node;
    }
  };

  Range.RangeError = (function(_super) {
    __extends(RangeError, _super);

    function RangeError(type, message, parent) {
      this.type = type;
      this.message = message;
      this.parent = parent != null ? parent : null;
      RangeError.__super__.constructor.call(this, this.message);
    }

    return RangeError;

  })(Error);

  Range.BrowserRange = (function() {
    function BrowserRange(obj) {
      this.commonAncestorContainer = obj.commonAncestorContainer;
      this.startContainer = obj.startContainer;
      this.startOffset = obj.startOffset;
      this.endContainer = obj.endContainer;
      this.endOffset = obj.endOffset;
    }

    BrowserRange.prototype.normalize = function(root) {
      var n, node, nr, r;
      if (this.tainted) {
        console.error(_t("You may only call normalize() once on a BrowserRange!"));
        return false;
      } else {
        this.tainted = true;
      }
      r = {};
      if (this.startContainer.nodeType === Node.ELEMENT_NODE) {
        r.start = Util.getFirstTextNodeNotBefore(this.startContainer.childNodes[this.startOffset]);
        r.startOffset = 0;
      } else {
        r.start = this.startContainer;
        r.startOffset = this.startOffset;
      }
      if (this.endContainer.nodeType === Node.ELEMENT_NODE) {
        node = this.endContainer.childNodes[this.endOffset];
        if (node != null) {
          n = node;
          while ((n != null) && (n.nodeType !== Node.TEXT_NODE)) {
            n = n.firstChild;
          }
          if (n != null) {
            r.end = n;
            r.endOffset = 0;
          }
        }
        if (r.end == null) {
          node = this.endContainer.childNodes[this.endOffset - 1];
          r.end = Util.getLastTextNodeUpTo(node);
          r.endOffset = r.end.nodeValue.length;
        }
      } else {
        r.end = this.endContainer;
        r.endOffset = this.endOffset;
      }
      nr = {};
      if (r.startOffset > 0) {
        if (r.start.nodeValue.length > r.startOffset) {
          nr.start = r.start.splitText(r.startOffset);
        } else {
          nr.start = r.start.nextSibling;
        }
      } else {
        nr.start = r.start;
      }
      if (r.start === r.end) {
        if (nr.start.nodeValue.length > (r.endOffset - r.startOffset)) {
          nr.start.splitText(r.endOffset - r.startOffset);
        }
        nr.end = nr.start;
      } else {
        if (r.end.nodeValue.length > r.endOffset) {
          r.end.splitText(r.endOffset);
        }
        nr.end = r.end;
      }
      nr.commonAncestor = this.commonAncestorContainer;
      while (nr.commonAncestor.nodeType !== Node.ELEMENT_NODE) {
        nr.commonAncestor = nr.commonAncestor.parentNode;
      }
      return new Range.NormalizedRange(nr);
    };

    BrowserRange.prototype.serialize = function(root, ignoreSelector) {
      return this.normalize(root).serialize(root, ignoreSelector);
    };

    return BrowserRange;

  })();

  Range.NormalizedRange = (function() {
    function NormalizedRange(obj) {
      this.commonAncestor = obj.commonAncestor;
      this.start = obj.start;
      this.end = obj.end;
    }

    NormalizedRange.prototype.normalize = function(root) {
      return this;
    };

    NormalizedRange.prototype.limit = function(bounds) {
      var nodes, parent, startParents, _k, _len2, _ref1;
      nodes = $.grep(this.textNodes(), function(node) {
        return node.parentNode === bounds || $.contains(bounds, node.parentNode);
      });
      if (!nodes.length) {
        return null;
      }
      this.start = nodes[0];
      this.end = nodes[nodes.length - 1];
      startParents = $(this.start).parents();
      _ref1 = $(this.end).parents();
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        parent = _ref1[_k];
        if (startParents.index(parent) !== -1) {
          this.commonAncestor = parent;
          break;
        }
      }
      return this;
    };

    NormalizedRange.prototype.serialize = function(root, ignoreSelector) {
      var end, serialization, start;
      serialization = function(node, isEnd) {
        var n, nodes, offset, origParent, textNodes, xpath, _k, _len2;
        if (ignoreSelector) {
          origParent = $(node).parents(":not(" + ignoreSelector + ")").eq(0);
        } else {
          origParent = $(node).parent();
        }
        xpath = Util.xpathFromNode(origParent, root)[0];
        textNodes = Util.getTextNodes(origParent);
        nodes = textNodes.slice(0, textNodes.index(node));
        offset = 0;
        for (_k = 0, _len2 = nodes.length; _k < _len2; _k++) {
          n = nodes[_k];
          offset += n.nodeValue.length;
        }
        if (isEnd) {
          return [xpath, offset + node.nodeValue.length];
        } else {
          return [xpath, offset];
        }
      };
      start = serialization(this.start);
      end = serialization(this.end, true);
      return new Range.SerializedRange({
        start: start[0],
        end: end[0],
        startOffset: start[1],
        endOffset: end[1]
      });
    };

    NormalizedRange.prototype.text = function() {
      var node;
      return ((function() {
        var _k, _len2, _ref1, _results;
        _ref1 = this.textNodes();
        _results = [];
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          node = _ref1[_k];
          _results.push(node.nodeValue);
        }
        return _results;
      }).call(this)).join('');
    };

    NormalizedRange.prototype.textNodes = function() {
      var end, start, textNodes, _ref1;
      textNodes = Util.getTextNodes($(this.commonAncestor));
      _ref1 = [textNodes.index(this.start), textNodes.index(this.end)], start = _ref1[0], end = _ref1[1];
      return $.makeArray(textNodes.slice(start, +end + 1 || 9e9));
    };

    NormalizedRange.prototype.toRange = function() {
      var range;
      range = document.createRange();
      range.setStartBefore(this.start);
      range.setEndAfter(this.end);
      return range;
    };

    return NormalizedRange;

  })();

  Range.SerializedRange = (function() {
    function SerializedRange(obj) {
      this.start = obj.start;
      this.startOffset = obj.startOffset;
      this.end = obj.end;
      this.endOffset = obj.endOffset;
    }

    SerializedRange.prototype.normalize = function(root) {
      var contains, e, length, node, p, range, targetOffset, tn, _k, _l, _len2, _len3, _ref1, _ref2;
      range = {};
      _ref1 = ['start', 'end'];
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        p = _ref1[_k];
        try {
          node = Range.nodeFromXPath(this[p], root);
        } catch (_error) {
          e = _error;
          throw new Range.RangeError(p, ("Error while finding " + p + " node: " + this[p] + ": ") + e, e);
        }
        if (!node) {
          throw new Range.RangeError(p, "Couldn't find " + p + " node: " + this[p]);
        }
        length = 0;
        targetOffset = this[p + 'Offset'];
        if (p === 'end') {
          targetOffset--;
        }
        _ref2 = Util.getTextNodes($(node));
        for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
          tn = _ref2[_l];
          if (length + tn.nodeValue.length > targetOffset) {
            range[p + 'Container'] = tn;
            range[p + 'Offset'] = this[p + 'Offset'] - length;
            break;
          } else {
            length += tn.nodeValue.length;
          }
        }
        if (range[p + 'Offset'] == null) {
          throw new Range.RangeError("" + p + "offset", "Couldn't find offset " + this[p + 'Offset'] + " in element " + this[p]);
        }
      }
      contains = document.compareDocumentPosition == null ? function(a, b) {
        return a.contains(b);
      } : function(a, b) {
        return a.compareDocumentPosition(b) & 16;
      };
      $(range.startContainer).parents().each(function() {
        if (contains(this, range.endContainer)) {
          range.commonAncestorContainer = this;
          return false;
        }
      });
      return new Range.BrowserRange(range).normalize(root);
    };

    SerializedRange.prototype.serialize = function(root, ignoreSelector) {
      return this.normalize(root).serialize(root, ignoreSelector);
    };

    SerializedRange.prototype.toObject = function() {
      return {
        start: this.start,
        startOffset: this.startOffset,
        end: this.end,
        endOffset: this.endOffset
      };
    };

    return SerializedRange;

  })();

  _Annotator = this.Annotator;

  Annotator = (function(_super) {
    __extends(Annotator, _super);

    Annotator.prototype.events = {
      ".annotator-adder button click": "onAdderClick",
      ".annotator-adder button mousedown": "onAdderMousedown",
      ".annotator-hl mouseover": "onHighlightMouseover",
      ".annotator-hl mouseout": "startViewerHideTimer"
    };

    Annotator.prototype.html = {
      adder: '<div class="annotator-adder"><button>' + _t('Annotate') + '</button></div>',
      wrapper: '<div class="annotator-wrapper"></div>'
    };

    Annotator.prototype.options = {
      readOnly: false
    };

    Annotator.prototype.plugins = {};

    Annotator.prototype.editor = null;

    Annotator.prototype.viewer = null;

    Annotator.prototype.selectedRanges = null;

    Annotator.prototype.mouseIsDown = false;

    Annotator.prototype.ignoreMouseup = false;

    Annotator.prototype.viewerHideTimer = null;

    function Annotator(element, options) {
      this.onDeleteAnnotation = __bind(this.onDeleteAnnotation, this);
      this.onEditAnnotation = __bind(this.onEditAnnotation, this);
      this.onAdderClick = __bind(this.onAdderClick, this);
      this.onAdderMousedown = __bind(this.onAdderMousedown, this);
      this.onHighlightMouseover = __bind(this.onHighlightMouseover, this);
      this.checkForEndSelection = __bind(this.checkForEndSelection, this);
      this.checkForStartSelection = __bind(this.checkForStartSelection, this);
      this.clearViewerHideTimer = __bind(this.clearViewerHideTimer, this);
      this.startViewerHideTimer = __bind(this.startViewerHideTimer, this);
      this.showViewer = __bind(this.showViewer, this);
      this.onEditorSubmit = __bind(this.onEditorSubmit, this);
      this.onEditorHide = __bind(this.onEditorHide, this);
      this.showEditor = __bind(this.showEditor, this);
      Annotator.__super__.constructor.apply(this, arguments);
      this.plugins = {};
      if (!Annotator.supported()) {
        return this;
      }
      if (!this.options.readOnly) {
        this._setupDocumentEvents();
      }
      this._setupWrapper()._setupViewer()._setupEditor();
      this._setupDynamicStyle();
      this.adder = $(this.html.adder).appendTo(this.wrapper).hide();
      Annotator._instances.push(this);
    }

    Annotator.prototype._setupWrapper = function() {
      this.wrapper = $(this.html.wrapper);
      this.element.find('script').remove();
      this.element.wrapInner(this.wrapper);
      this.wrapper = this.element.find('.annotator-wrapper');
      return this;
    };

    Annotator.prototype._setupViewer = function() {
      var _this = this;
      this.viewer = new Annotator.Viewer({
        readOnly: this.options.readOnly
      });
      this.viewer.hide().on("edit", this.onEditAnnotation).on("delete", this.onDeleteAnnotation).addField({
        load: function(field, annotation) {
          if (annotation.text) {
            $(field).html(Util.escape(annotation.text));
          } else {
            $(field).html("<i>" + (_t('No Comment')) + "</i>");
          }
          return _this.publish('annotationViewerTextField', [field, annotation]);
        }
      }).element.appendTo(this.wrapper).bind({
        "mouseover": this.clearViewerHideTimer,
        "mouseout": this.startViewerHideTimer
      });
      return this;
    };

    Annotator.prototype._setupEditor = function() {
      this.editor = new Annotator.Editor();
      this.editor.hide().on('hide', this.onEditorHide).on('save', this.onEditorSubmit).addField({
        type: 'textarea',
        label: _t('Comments') + '\u2026',
        load: function(field, annotation) {
          return $(field).find('textarea').val(annotation.text || '');
        },
        submit: function(field, annotation) {
          return annotation.text = $(field).find('textarea').val();
        }
      });
      this.editor.element.appendTo(this.wrapper);
      return this;
    };

    Annotator.prototype._setupDocumentEvents = function() {
      $(document).bind({
        "mouseup": this.checkForEndSelection,
        "mousedown": this.checkForStartSelection
      });
      return this;
    };

    Annotator.prototype._setupDynamicStyle = function() {
      var max, sel, style, x;
      style = $('#annotator-dynamic-style');
      if (!style.length) {
        style = $('<style id="annotator-dynamic-style"></style>').appendTo(document.head);
      }
      sel = '*' + ((function() {
        var _k, _len2, _ref1, _results;
        _ref1 = ['adder', 'outer', 'notice', 'filter'];
        _results = [];
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          x = _ref1[_k];
          _results.push(":not(.annotator-" + x + ")");
        }
        return _results;
      })()).join('');
      max = Util.maxZIndex($(document.body).find(sel));
      max = Math.max(max, 1000);
      style.text([".annotator-adder, .annotator-outer, .annotator-notice {", "  z-index: " + (max + 20) + ";", "}", ".annotator-filter {", "  z-index: " + (max + 10) + ";", "}"].join("\n"));
      return this;
    };

    Annotator.prototype.destroy = function() {
      var idx, name, plugin, _base, _ref1;
      Annotator.__super__.destroy.apply(this, arguments);
      $(document).unbind({
        "mouseup": this.checkForEndSelection,
        "mousedown": this.checkForStartSelection
      });
      $('#annotator-dynamic-style').remove();
      this.adder.remove();
      this.viewer.destroy();
      this.editor.destroy();
      this.wrapper.find('.annotator-hl').each(function() {
        $(this).contents().insertBefore(this);
        return $(this).remove();
      });
      this.wrapper.contents().insertBefore(this.wrapper);
      this.wrapper.remove();
      this.element.data('annotator', null);
      _ref1 = this.plugins;
      for (name in _ref1) {
        plugin = _ref1[name];
        if (typeof (_base = this.plugins[name]).destroy === "function") {
          _base.destroy();
        }
      }
      idx = Annotator._instances.indexOf(this);
      if (idx !== -1) {
        return Annotator._instances.splice(idx, 1);
      }
    };

    Annotator.prototype.getSelectedRanges = function() {
      var browserRange, i, normedRange, r, ranges, rangesToIgnore, selection, _k, _len2;
      selection = Util.getGlobal().getSelection();
      ranges = [];
      rangesToIgnore = [];
      if (!selection.isCollapsed) {
        ranges = (function() {
          var _k, _ref1, _results;
          _results = [];
          for (i = _k = 0, _ref1 = selection.rangeCount; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; i = 0 <= _ref1 ? ++_k : --_k) {
            r = selection.getRangeAt(i);
            browserRange = new Range.BrowserRange(r);
            normedRange = browserRange.normalize().limit(this.wrapper[0]);
            if (normedRange === null) {
              rangesToIgnore.push(r);
            }
            _results.push(normedRange);
          }
          return _results;
        }).call(this);
        selection.removeAllRanges();
      }
      for (_k = 0, _len2 = rangesToIgnore.length; _k < _len2; _k++) {
        r = rangesToIgnore[_k];
        selection.addRange(r);
      }
      return $.grep(ranges, function(range) {
        if (range) {
          selection.addRange(range.toRange());
        }
        return range;
      });
    };

    Annotator.prototype.createAnnotation = function() {
      var annotation;
      annotation = {};
      this.publish('beforeAnnotationCreated', [annotation]);
      return annotation;
    };

    Annotator.prototype.setupAnnotation = function(annotation) {
      var e, normed, normedRanges, r, root, _k, _l, _len2, _len3, _ref1;
      root = this.wrapper[0];
      annotation.ranges || (annotation.ranges = this.selectedRanges);
      normedRanges = [];
      _ref1 = annotation.ranges;
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        r = _ref1[_k];
        try {
          normedRanges.push(Range.sniff(r).normalize(root));
        } catch (_error) {
          e = _error;
          if (e instanceof Range.RangeError) {
            this.publish('rangeNormalizeFail', [annotation, r, e]);
          } else {
            throw e;
          }
        }
      }
      annotation.quote = [];
      annotation.ranges = [];
      annotation.highlights = [];
      for (_l = 0, _len3 = normedRanges.length; _l < _len3; _l++) {
        normed = normedRanges[_l];
        annotation.quote.push($.trim(normed.text()));
        annotation.ranges.push(normed.serialize(this.wrapper[0], '.annotator-hl'));
        $.merge(annotation.highlights, this.highlightRange(normed));
      }
      annotation.quote = annotation.quote.join(' / ');
      $(annotation.highlights).data('annotation', annotation);
      $(annotation.highlights).attr('data-annotation-id', annotation.id);
      return annotation;
    };

    Annotator.prototype.updateAnnotation = function(annotation) {
      this.publish('beforeAnnotationUpdated', [annotation]);
      $(annotation.highlights).attr('data-annotation-id', annotation.id);
      this.publish('annotationUpdated', [annotation]);
      return annotation;
    };

    Annotator.prototype.deleteAnnotation = function(annotation) {
      var child, h, _k, _len2, _ref1;
      if (annotation.highlights != null) {
        _ref1 = annotation.highlights;
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          h = _ref1[_k];
          if (!(h.parentNode != null)) {
            continue;
          }
          child = h.childNodes[0];
          $(h).replaceWith(h.childNodes);
        }
      }
      this.publish('annotationDeleted', [annotation]);
      return annotation;
    };

    Annotator.prototype.loadAnnotations = function(annotations) {
      var clone, loader,
        _this = this;
      if (annotations == null) {
        annotations = [];
      }
      loader = function(annList) {
        var n, now, _k, _len2;
        if (annList == null) {
          annList = [];
        }
        now = annList.splice(0, 10);
        for (_k = 0, _len2 = now.length; _k < _len2; _k++) {
          n = now[_k];
          _this.setupAnnotation(n);
        }
        if (annList.length > 0) {
          return setTimeout((function() {
            return loader(annList);
          }), 10);
        } else {
          return _this.publish('annotationsLoaded', [clone]);
        }
      };
      clone = annotations.slice();
      loader(annotations);
      return this;
    };

    Annotator.prototype.dumpAnnotations = function() {
      if (this.plugins['Store']) {
        return this.plugins['Store'].dumpAnnotations();
      } else {
        console.warn(_t("Can't dump annotations without Store plugin."));
        return false;
      }
    };

    Annotator.prototype.highlightRange = function(normedRange, cssClass) {
      var hl, node, white, _k, _len2, _ref1, _results;
      if (cssClass == null) {
        cssClass = 'annotator-hl';
      }
      white = /^\s*$/;
      hl = $("<span class='" + cssClass + "'></span>");
      _ref1 = normedRange.textNodes();
      _results = [];
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        node = _ref1[_k];
        if (!white.test(node.nodeValue)) {
          _results.push($(node).wrapAll(hl).parent().show()[0]);
        }
      }
      return _results;
    };

    Annotator.prototype.highlightRanges = function(normedRanges, cssClass) {
      var highlights, r, _k, _len2;
      if (cssClass == null) {
        cssClass = 'annotator-hl';
      }
      highlights = [];
      for (_k = 0, _len2 = normedRanges.length; _k < _len2; _k++) {
        r = normedRanges[_k];
        $.merge(highlights, this.highlightRange(r, cssClass));
      }
      return highlights;
    };

    Annotator.prototype.addPlugin = function(name, options) {
      var klass, _base;
      if (this.plugins[name]) {
        console.error(_t("You cannot have more than one instance of any plugin."));
      } else {
        klass = Annotator.Plugin[name];
        if (typeof klass === 'function') {
          this.plugins[name] = new klass(this.element[0], options);
          this.plugins[name].annotator = this;
          if (typeof (_base = this.plugins[name]).pluginInit === "function") {
            _base.pluginInit();
          }
        } else {
          console.error(_t("Could not load ") + name + _t(" plugin. Have you included the appropriate <script> tag?"));
        }
      }
      return this;
    };

    Annotator.prototype.showEditor = function(annotation, location) {
      this.editor.element.css(location);
      this.editor.load(annotation);
      this.publish('annotationEditorShown', [this.editor, annotation]);
      return this;
    };

    Annotator.prototype.onEditorHide = function() {
      this.publish('annotationEditorHidden', [this.editor]);
      return this.ignoreMouseup = false;
    };

    Annotator.prototype.onEditorSubmit = function(annotation) {
      return this.publish('annotationEditorSubmit', [this.editor, annotation]);
    };

    Annotator.prototype.showViewer = function(annotations, location) {
      this.viewer.element.css(location);
      this.viewer.load(annotations);
      return this.publish('annotationViewerShown', [this.viewer, annotations]);
    };

    Annotator.prototype.startViewerHideTimer = function() {
      if (!this.viewerHideTimer) {
        return this.viewerHideTimer = setTimeout(this.viewer.hide, 250);
      }
    };

    Annotator.prototype.clearViewerHideTimer = function() {
      clearTimeout(this.viewerHideTimer);
      return this.viewerHideTimer = false;
    };

    Annotator.prototype.checkForStartSelection = function(event) {
      if (!(event && this.isAnnotator(event.target))) {
        this.startViewerHideTimer();
      }
      return this.mouseIsDown = true;
    };

    Annotator.prototype.checkForEndSelection = function(event) {
      var container, range, _k, _len2, _ref1;
      this.mouseIsDown = false;
      if (this.ignoreMouseup) {
        return;
      }
      this.selectedRanges = this.getSelectedRanges();
      _ref1 = this.selectedRanges;
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        range = _ref1[_k];
        container = range.commonAncestor;
        if (this.isAnnotator(container)) {
          return;
        }
      }
      if (event && this.selectedRanges.length) {
        return this.adder.css(Util.mousePosition(event, this.wrapper[0])).show();
      } else {
        return this.adder.hide();
      }
    };

    Annotator.prototype.isAnnotator = function(element) {
      return !!$(element).parents().addBack().filter('[class^=annotator-]').not('[class=annotator-hl]').not(this.wrapper).length;
    };

    Annotator.prototype.onHighlightMouseover = function(event) {
      var annotations;
      this.clearViewerHideTimer();
      if (this.mouseIsDown) {
        return false;
      }
      if (this.viewer.isShown()) {
        this.viewer.hide();
      }
      annotations = $(event.target).parents('.annotator-hl').addBack().map(function() {
        return $(this).data("annotation");
      }).toArray();
      return this.showViewer(annotations, Util.mousePosition(event, this.wrapper[0]));
    };

    Annotator.prototype.onAdderMousedown = function(event) {
      if (event != null) {
        event.preventDefault();
      }
      return this.ignoreMouseup = true;
    };

    Annotator.prototype.onAdderClick = function(event) {
      var annotation, cancel, cleanup, position, save,
        _this = this;
      if (event != null) {
        event.preventDefault();
      }
      position = this.adder.position();
      this.adder.hide();
      annotation = this.setupAnnotation(this.createAnnotation());
      $(annotation.highlights).addClass('annotator-hl-temporary');
      save = function() {
        cleanup();
        $(annotation.highlights).removeClass('annotator-hl-temporary');
        return _this.publish('annotationCreated', [annotation]);
      };
      cancel = function() {
        cleanup();
        return _this.deleteAnnotation(annotation);
      };
      cleanup = function() {
        _this.unsubscribe('annotationEditorHidden', cancel);
        return _this.unsubscribe('annotationEditorSubmit', save);
      };
      this.subscribe('annotationEditorHidden', cancel);
      this.subscribe('annotationEditorSubmit', save);
      return this.showEditor(annotation, position);
    };

    Annotator.prototype.onEditAnnotation = function(annotation) {
      var cleanup, offset, update,
        _this = this;
      offset = this.viewer.element.position();
      update = function() {
        cleanup();
        return _this.updateAnnotation(annotation);
      };
      cleanup = function() {
        _this.unsubscribe('annotationEditorHidden', cleanup);
        return _this.unsubscribe('annotationEditorSubmit', update);
      };
      this.subscribe('annotationEditorHidden', cleanup);
      this.subscribe('annotationEditorSubmit', update);
      this.viewer.hide();
      return this.showEditor(annotation, offset);
    };

    Annotator.prototype.onDeleteAnnotation = function(annotation) {
      this.viewer.hide();
      return this.deleteAnnotation(annotation);
    };

    return Annotator;

  })(Delegator);

  Annotator.Plugin = (function(_super) {
    __extends(Plugin, _super);

    function Plugin(element, options) {
      Plugin.__super__.constructor.apply(this, arguments);
    }

    Plugin.prototype.pluginInit = function() {};

    return Plugin;

  })(Delegator);

  g = Util.getGlobal();

  if (((_ref1 = g.document) != null ? _ref1.evaluate : void 0) == null) {
    $.getScript('http://assets.annotateit.org/vendor/xpath.min.js');
  }

  if (g.getSelection == null) {
    $.getScript('http://assets.annotateit.org/vendor/ierange.min.js');
  }

  if (g.JSON == null) {
    $.getScript('http://assets.annotateit.org/vendor/json2.min.js');
  }

  if (g.Node == null) {
    g.Node = {
      ELEMENT_NODE: 1,
      ATTRIBUTE_NODE: 2,
      TEXT_NODE: 3,
      CDATA_SECTION_NODE: 4,
      ENTITY_REFERENCE_NODE: 5,
      ENTITY_NODE: 6,
      PROCESSING_INSTRUCTION_NODE: 7,
      COMMENT_NODE: 8,
      DOCUMENT_NODE: 9,
      DOCUMENT_TYPE_NODE: 10,
      DOCUMENT_FRAGMENT_NODE: 11,
      NOTATION_NODE: 12
    };
  }

  Annotator.$ = $;

  Annotator.Delegator = Delegator;

  Annotator.Range = Range;

  Annotator.Util = Util;

  Annotator._instances = [];

  Annotator._t = _t;

  Annotator.supported = function() {
    return (function() {
      return !!this.getSelection;
    })();
  };

  Annotator.noConflict = function() {
    Util.getGlobal().Annotator = _Annotator;
    return this;
  };

  $.fn.annotator = function(options) {
    var args;
    args = Array.prototype.slice.call(arguments, 1);
    return this.each(function() {
      var instance;
      instance = $.data(this, 'annotator');
      if (options === 'destroy') {
        $.removeData(this, 'annotator');
        return instance != null ? instance.destroy(args) : void 0;
      } else if (instance) {
        return options && instance[options].apply(instance, args);
      } else {
        instance = new Annotator(this, options);
        return $.data(this, 'annotator', instance);
      }
    });
  };

  this.Annotator = Annotator;

  Annotator.Widget = (function(_super) {
    __extends(Widget, _super);

    Widget.prototype.classes = {
      hide: 'annotator-hide',
      invert: {
        x: 'annotator-invert-x',
        y: 'annotator-invert-y'
      }
    };

    function Widget(element, options) {
      Widget.__super__.constructor.apply(this, arguments);
      this.classes = $.extend({}, Annotator.Widget.prototype.classes, this.classes);
    }

    Widget.prototype.destroy = function() {
      this.removeEvents();
      return this.element.remove();
    };

    Widget.prototype.checkOrientation = function() {
      var current, offset, viewport, widget, window;
      this.resetOrientation();
      window = $(Annotator.Util.getGlobal());
      widget = this.element.children(":first");
      offset = widget.offset();
      viewport = {
        top: window.scrollTop(),
        right: window.width() + window.scrollLeft()
      };
      current = {
        top: offset.top,
        right: offset.left + widget.width()
      };
      if ((current.top - viewport.top) < 0) {
        this.invertY();
      }
      if ((current.right - viewport.right) > 0) {
        this.invertX();
      }
      return this;
    };

    Widget.prototype.resetOrientation = function() {
      this.element.removeClass(this.classes.invert.x).removeClass(this.classes.invert.y);
      return this;
    };

    Widget.prototype.invertX = function() {
      this.element.addClass(this.classes.invert.x);
      return this;
    };

    Widget.prototype.invertY = function() {
      this.element.addClass(this.classes.invert.y);
      return this;
    };

    Widget.prototype.isInvertedY = function() {
      return this.element.hasClass(this.classes.invert.y);
    };

    Widget.prototype.isInvertedX = function() {
      return this.element.hasClass(this.classes.invert.x);
    };

    return Widget;

  })(Delegator);

  Annotator.Editor = (function(_super) {
    __extends(Editor, _super);

    Editor.prototype.events = {
      "form submit": "submit",
      ".annotator-save click": "submit",
      ".annotator-cancel click": "hide",
      ".annotator-cancel mouseover": "onCancelButtonMouseover",
      "textarea keydown": "processKeypress"
    };

    Editor.prototype.classes = {
      hide: 'annotator-hide',
      focus: 'annotator-focus'
    };

    Editor.prototype.html = "<div class=\"annotator-outer annotator-editor\">\n  <form class=\"annotator-widget\">\n    <ul class=\"annotator-listing\"></ul>\n    <div class=\"annotator-controls\">\n      <a href=\"#cancel\" class=\"annotator-cancel\">" + _t('Cancel') + "</a>\n<a href=\"#save\" class=\"annotator-save annotator-focus\">" + _t('Save') + "</a>\n    </div>\n  </form>\n</div>";

    Editor.prototype.options = {};

    function Editor(options) {
      this.onCancelButtonMouseover = __bind(this.onCancelButtonMouseover, this);
      this.processKeypress = __bind(this.processKeypress, this);
      this.submit = __bind(this.submit, this);
      this.load = __bind(this.load, this);
      this.hide = __bind(this.hide, this);
      this.show = __bind(this.show, this);
      Editor.__super__.constructor.call(this, $(this.html)[0], options);
      this.fields = [];
      this.annotation = {};
    }

    Editor.prototype.show = function(event) {
      Annotator.Util.preventEventDefault(event);
      this.element.removeClass(this.classes.hide);
      this.element.find('.annotator-save').addClass(this.classes.focus);
      this.checkOrientation();
      this.element.find(":input:first").focus();
      this.setupDraggables();
      return this.publish('show');
    };

    Editor.prototype.hide = function(event) {
      Annotator.Util.preventEventDefault(event);
      this.element.addClass(this.classes.hide);
      return this.publish('hide');
    };

    Editor.prototype.load = function(annotation) {
      var field, _k, _len2, _ref2;
      this.annotation = annotation;
      this.publish('load', [this.annotation]);
      _ref2 = this.fields;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        field = _ref2[_k];
        field.load(field.element, this.annotation);
      }
      return this.show();
    };

    Editor.prototype.submit = function(event) {
      var field, _k, _len2, _ref2;
      Annotator.Util.preventEventDefault(event);
      _ref2 = this.fields;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        field = _ref2[_k];
        field.submit(field.element, this.annotation);
      }
      this.publish('save', [this.annotation]);
      return this.hide();
    };

    Editor.prototype.addField = function(options) {
      var element, field, input;
      field = $.extend({
        id: 'annotator-field-' + Annotator.Util.uuid(),
        type: 'input',
        label: '',
        load: function() {},
        submit: function() {}
      }, options);
      input = null;
      element = $('<li class="annotator-item" />');
      field.element = element[0];
      switch (field.type) {
        case 'textarea':
          input = $('<textarea />');
          break;
        case 'input':
        case 'checkbox':
          input = $('<input />');
          break;
        case 'select':
          input = $('<select />');
      }
      element.append(input);
      input.attr({
        id: field.id,
        placeholder: field.label
      });
      if (field.type === 'checkbox') {
        input[0].type = 'checkbox';
        element.addClass('annotator-checkbox');
        element.append($('<label />', {
          "for": field.id,
          html: field.label
        }));
      }
      this.element.find('ul:first').append(element);
      this.fields.push(field);
      return field.element;
    };

    Editor.prototype.checkOrientation = function() {
      var controls, list;
      Editor.__super__.checkOrientation.apply(this, arguments);
      list = this.element.find('ul');
      controls = this.element.find('.annotator-controls');
      if (this.element.hasClass(this.classes.invert.y)) {
        controls.insertBefore(list);
      } else if (controls.is(':first-child')) {
        controls.insertAfter(list);
      }
      return this;
    };

    Editor.prototype.processKeypress = function(event) {
      if (event.keyCode === 27) {
        return this.hide();
      } else if (event.keyCode === 13 && !event.shiftKey) {
        return this.submit();
      }
    };

    Editor.prototype.onCancelButtonMouseover = function() {
      return this.element.find('.' + this.classes.focus).removeClass(this.classes.focus);
    };

    Editor.prototype.setupDraggables = function() {
      var classes, controls, cornerItem, editor, mousedown, onMousedown, onMousemove, onMouseup, resize, textarea, throttle,
        _this = this;
      this.element.find('.annotator-resize').remove();
      if (this.element.hasClass(this.classes.invert.y)) {
        cornerItem = this.element.find('.annotator-item:last');
      } else {
        cornerItem = this.element.find('.annotator-item:first');
      }
      if (cornerItem) {
        $('<span class="annotator-resize"></span>').appendTo(cornerItem);
      }
      mousedown = null;
      classes = this.classes;
      editor = this.element;
      textarea = null;
      resize = editor.find('.annotator-resize');
      controls = editor.find('.annotator-controls');
      throttle = false;
      onMousedown = function(event) {
        if (event.target === this) {
          mousedown = {
            element: this,
            top: event.pageY,
            left: event.pageX
          };
          textarea = editor.find('textarea:first');
          $(window).bind({
            'mouseup.annotator-editor-resize': onMouseup,
            'mousemove.annotator-editor-resize': onMousemove
          });
          return event.preventDefault();
        }
      };
      onMouseup = function() {
        mousedown = null;
        return $(window).unbind('.annotator-editor-resize');
      };
      onMousemove = function(event) {
        var diff, directionX, directionY, height, width;
        if (mousedown && throttle === false) {
          diff = {
            top: event.pageY - mousedown.top,
            left: event.pageX - mousedown.left
          };
          if (mousedown.element === resize[0]) {
            height = textarea.height();
            width = textarea.width();
            directionX = editor.hasClass(classes.invert.x) ? -1 : 1;
            directionY = editor.hasClass(classes.invert.y) ? 1 : -1;
            textarea.height(height + (diff.top * directionY));
            textarea.width(width + (diff.left * directionX));
            if (textarea.height() !== height) {
              mousedown.top = event.pageY;
            }
            if (textarea.width() !== width) {
              mousedown.left = event.pageX;
            }
          } else if (mousedown.element === controls[0]) {
            editor.css({
              top: parseInt(editor.css('top'), 10) + diff.top,
              left: parseInt(editor.css('left'), 10) + diff.left
            });
            mousedown.top = event.pageY;
            mousedown.left = event.pageX;
          }
          throttle = true;
          return setTimeout(function() {
            return throttle = false;
          }, 1000 / 60);
        }
      };
      resize.bind('mousedown', onMousedown);
      return controls.bind('mousedown', onMousedown);
    };

    return Editor;

  })(Annotator.Widget);

  Annotator.Viewer = (function(_super) {
    __extends(Viewer, _super);

    Viewer.prototype.events = {
      ".annotator-edit click": "onEditClick",
      ".annotator-delete click": "onDeleteClick"
    };

    Viewer.prototype.classes = {
      hide: 'annotator-hide',
      showControls: 'annotator-visible'
    };

    Viewer.prototype.html = {
      element: "<div class=\"annotator-outer annotator-viewer\">\n  <ul class=\"annotator-widget annotator-listing\"></ul>\n</div>",
      item: "<li class=\"annotator-annotation annotator-item\">\n  <span class=\"annotator-controls\">\n    <a href=\"#\" title=\"View as webpage\" class=\"annotator-link\">View as webpage</a>\n    <button title=\"Edit\" class=\"annotator-edit\">Edit</button>\n    <button title=\"Delete\" class=\"annotator-delete\">Delete</button>\n  </span>\n</li>"
    };

    Viewer.prototype.options = {
      readOnly: false
    };

    function Viewer(options) {
      this.onDeleteClick = __bind(this.onDeleteClick, this);
      this.onEditClick = __bind(this.onEditClick, this);
      this.load = __bind(this.load, this);
      this.hide = __bind(this.hide, this);
      this.show = __bind(this.show, this);
      Viewer.__super__.constructor.call(this, $(this.html.element)[0], options);
      this.item = $(this.html.item)[0];
      this.fields = [];
      this.annotations = [];
    }

    Viewer.prototype.show = function(event) {
      var controls,
        _this = this;
      Annotator.Util.preventEventDefault(event);
      controls = this.element.find('.annotator-controls').addClass(this.classes.showControls);
      setTimeout((function() {
        return controls.removeClass(_this.classes.showControls);
      }), 500);
      this.element.removeClass(this.classes.hide);
      return this.checkOrientation().publish('show');
    };

    Viewer.prototype.isShown = function() {
      return !this.element.hasClass(this.classes.hide);
    };

    Viewer.prototype.hide = function(event) {
      Annotator.Util.preventEventDefault(event);
      this.element.addClass(this.classes.hide);
      return this.publish('hide');
    };

    Viewer.prototype.load = function(annotations) {
      var annotation, controller, controls, del, edit, element, field, item, link, links, list, _k, _l, _len2, _len3, _ref2, _ref3;
      this.annotations = annotations || [];
      list = this.element.find('ul:first').empty();
      _ref2 = this.annotations;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        annotation = _ref2[_k];
        item = $(this.item).clone().appendTo(list).data('annotation', annotation);
        controls = item.find('.annotator-controls');
        link = controls.find('.annotator-link');
        edit = controls.find('.annotator-edit');
        del = controls.find('.annotator-delete');
        links = new LinkParser(annotation.links || []).get('alternate', {
          'type': 'text/html'
        });
        if (links.length === 0 || (links[0].href == null)) {
          link.remove();
        } else {
          link.attr('href', links[0].href);
        }
        if (this.options.readOnly) {
          edit.remove();
          del.remove();
        } else {
          controller = {
            showEdit: function() {
              return edit.removeAttr('disabled');
            },
            hideEdit: function() {
              return edit.attr('disabled', 'disabled');
            },
            showDelete: function() {
              return del.removeAttr('disabled');
            },
            hideDelete: function() {
              return del.attr('disabled', 'disabled');
            }
          };
        }
        _ref3 = this.fields;
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          field = _ref3[_l];
          element = $(field.element).clone().appendTo(item)[0];
          field.load(element, annotation, controller);
        }
      }
      this.publish('load', [this.annotations]);
      return this.show();
    };

    Viewer.prototype.addField = function(options) {
      var field;
      field = $.extend({
        load: function() {}
      }, options);
      field.element = $('<div />')[0];
      this.fields.push(field);
      field.element;
      return this;
    };

    Viewer.prototype.onEditClick = function(event) {
      return this.onButtonClick(event, 'edit');
    };

    Viewer.prototype.onDeleteClick = function(event) {
      return this.onButtonClick(event, 'delete');
    };

    Viewer.prototype.onButtonClick = function(event, type) {
      var item;
      item = $(event.target).parents('.annotator-annotation');
      return this.publish(type, [item.data('annotation')]);
    };

    return Viewer;

  })(Annotator.Widget);

  LinkParser = (function() {
    function LinkParser(data) {
      this.data = data;
    }

    LinkParser.prototype.get = function(rel, cond) {
      var d, k, keys, match, v, _k, _len2, _ref2, _results;
      if (cond == null) {
        cond = {};
      }
      cond = $.extend({}, cond, {
        rel: rel
      });
      keys = (function() {
        var _results;
        _results = [];
        for (k in cond) {
          if (!__hasProp.call(cond, k)) continue;
          v = cond[k];
          _results.push(k);
        }
        return _results;
      })();
      _ref2 = this.data;
      _results = [];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        d = _ref2[_k];
        match = keys.reduce((function(m, k) {
          return m && (d[k] === cond[k]);
        }), true);
        if (match) {
          _results.push(d);
        } else {
          continue;
        }
      }
      return _results;
    };

    return LinkParser;

  })();

  Annotator = Annotator || {};

  Annotator.Notification = (function(_super) {
    __extends(Notification, _super);

    Notification.prototype.events = {
      "click": "hide"
    };

    Notification.prototype.options = {
      html: "<div class='annotator-notice'></div>",
      classes: {
        show: "annotator-notice-show",
        info: "annotator-notice-info",
        success: "annotator-notice-success",
        error: "annotator-notice-error"
      }
    };

    function Notification(options) {
      this.hide = __bind(this.hide, this);
      this.show = __bind(this.show, this);
      Notification.__super__.constructor.call(this, $(this.options.html).appendTo(document.body)[0], options);
    }

    Notification.prototype.show = function(message, status) {
      if (status == null) {
        status = Annotator.Notification.INFO;
      }
      this.currentStatus = status;
      $(this.element).addClass(this.options.classes.show).addClass(this.options.classes[this.currentStatus]).html(Util.escape(message || ""));
      setTimeout(this.hide, 5000);
      return this;
    };

    Notification.prototype.hide = function() {
      if (this.currentStatus == null) {
        this.currentStatus = Annotator.Notification.INFO;
      }
      $(this.element).removeClass(this.options.classes.show).removeClass(this.options.classes[this.currentStatus]);
      return this;
    };

    return Notification;

  })(Delegator);

  Annotator.Notification.INFO = 'info';

  Annotator.Notification.SUCCESS = 'success';

  Annotator.Notification.ERROR = 'error';

  $(function() {
    var notification;
    notification = new Annotator.Notification;
    Annotator.showNotification = notification.show;
    return Annotator.hideNotification = notification.hide;
  });

}).call(this);

//

; browserify_shim__define__module__export__(typeof Annotator != "undefined" ? Annotator : window.Annotator);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof self !== "undefined" ? self : window)

},{"jquery":"jquery"}],29:[function(require,module,exports){
/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				classes.push(classNames.apply(null, arg));
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

},{}],30:[function(require,module,exports){
'use strict'

/**
 * Diff Match and Patch
 *
 * Copyright 2006 Google Inc.
 * http://code.google.com/p/google-diff-match-patch/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Computes the difference between two texts to create a patch.
 * Applies the patch onto another text, allowing for errors.
 * @author fraser@google.com (Neil Fraser)
 */

/**
 * Class containing the diff, match and patch methods.
 * @constructor
 */
function diff_match_patch() {

  // Defaults.
  // Redefine these in your program to override the defaults.

  // Number of seconds to map a diff before giving up (0 for infinity).
  this.Diff_Timeout = 1.0;
  // Cost of an empty edit operation in terms of edit characters.
  this.Diff_EditCost = 4;
  // At what point is no match declared (0.0 = perfection, 1.0 = very loose).
  this.Match_Threshold = 0.5;
  // How far to search for a match (0 = exact location, 1000+ = broad match).
  // A match this many characters away from the expected location will add
  // 1.0 to the score (0.0 is a perfect match).
  this.Match_Distance = 1000;
  // When deleting a large block of text (over ~64 characters), how close do
  // the contents have to be to match the expected contents. (0.0 = perfection,
  // 1.0 = very loose).  Note that Match_Threshold controls how closely the
  // end points of a delete need to match.
  this.Patch_DeleteThreshold = 0.5;
  // Chunk size for context length.
  this.Patch_Margin = 4;

  // The number of bits in an int.
  this.Match_MaxBits = 32;
}


//  DIFF FUNCTIONS


/**
 * The data structure representing a diff is an array of tuples:
 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
 */
var DIFF_DELETE = -1;
var DIFF_INSERT = 1;
var DIFF_EQUAL = 0;

/** @typedef {{0: number, 1: string}} */
diff_match_patch.Diff;


/**
 * Find the differences between two texts.  Simplifies the problem by stripping
 * any common prefix or suffix off the texts before diffing.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {boolean=} opt_checklines Optional speedup flag. If present and false,
 *     then don't run a line-level diff first to identify the changed areas.
 *     Defaults to true, which does a faster, slightly less optimal diff.
 * @param {number} opt_deadline Optional time when the diff should be complete
 *     by.  Used internally for recursive calls.  Users should set DiffTimeout
 *     instead.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 */
diff_match_patch.prototype.diff_main = function(text1, text2, opt_checklines,
    opt_deadline) {
  // Set a deadline by which time the diff must be complete.
  if (typeof opt_deadline == 'undefined') {
    if (this.Diff_Timeout <= 0) {
      opt_deadline = Number.MAX_VALUE;
    } else {
      opt_deadline = (new Date).getTime() + this.Diff_Timeout * 1000;
    }
  }
  var deadline = opt_deadline;

  // Check for null inputs.
  if (text1 == null || text2 == null) {
    throw new Error('Null input. (diff_main)');
  }

  // Check for equality (speedup).
  if (text1 == text2) {
    if (text1) {
      return [[DIFF_EQUAL, text1]];
    }
    return [];
  }

  if (typeof opt_checklines == 'undefined') {
    opt_checklines = true;
  }
  var checklines = opt_checklines;

  // Trim off common prefix (speedup).
  var commonlength = this.diff_commonPrefix(text1, text2);
  var commonprefix = text1.substring(0, commonlength);
  text1 = text1.substring(commonlength);
  text2 = text2.substring(commonlength);

  // Trim off common suffix (speedup).
  commonlength = this.diff_commonSuffix(text1, text2);
  var commonsuffix = text1.substring(text1.length - commonlength);
  text1 = text1.substring(0, text1.length - commonlength);
  text2 = text2.substring(0, text2.length - commonlength);

  // Compute the diff on the middle block.
  var diffs = this.diff_compute_(text1, text2, checklines, deadline);

  // Restore the prefix and suffix.
  if (commonprefix) {
    diffs.unshift([DIFF_EQUAL, commonprefix]);
  }
  if (commonsuffix) {
    diffs.push([DIFF_EQUAL, commonsuffix]);
  }
  this.diff_cleanupMerge(diffs);
  return diffs;
};


/**
 * Find the differences between two texts.  Assumes that the texts do not
 * have any common prefix or suffix.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {boolean} checklines Speedup flag.  If false, then don't run a
 *     line-level diff first to identify the changed areas.
 *     If true, then run a faster, slightly less optimal diff.
 * @param {number} deadline Time when the diff should be complete by.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_compute_ = function(text1, text2, checklines,
    deadline) {
  var diffs;

  if (!text1) {
    // Just add some text (speedup).
    return [[DIFF_INSERT, text2]];
  }

  if (!text2) {
    // Just delete some text (speedup).
    return [[DIFF_DELETE, text1]];
  }

  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  var i = longtext.indexOf(shorttext);
  if (i != -1) {
    // Shorter text is inside the longer text (speedup).
    diffs = [[DIFF_INSERT, longtext.substring(0, i)],
             [DIFF_EQUAL, shorttext],
             [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
    // Swap insertions for deletions if diff is reversed.
    if (text1.length > text2.length) {
      diffs[0][0] = diffs[2][0] = DIFF_DELETE;
    }
    return diffs;
  }

  if (shorttext.length == 1) {
    // Single character string.
    // After the previous speedup, the character can't be an equality.
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  }

  // Check to see if the problem can be split in two.
  var hm = this.diff_halfMatch_(text1, text2);
  if (hm) {
    // A half-match was found, sort out the return data.
    var text1_a = hm[0];
    var text1_b = hm[1];
    var text2_a = hm[2];
    var text2_b = hm[3];
    var mid_common = hm[4];
    // Send both pairs off for separate processing.
    var diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline);
    var diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
    // Merge the results.
    return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
  }

  if (checklines && text1.length > 100 && text2.length > 100) {
    return this.diff_lineMode_(text1, text2, deadline);
  }

  return this.diff_bisect_(text1, text2, deadline);
};


/**
 * Do a quick line-level diff on both strings, then rediff the parts for
 * greater accuracy.
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} deadline Time when the diff should be complete by.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_lineMode_ = function(text1, text2, deadline) {
  // Scan the text on a line-by-line basis first.
  var a = this.diff_linesToChars_(text1, text2);
  text1 = a.chars1;
  text2 = a.chars2;
  var linearray = a.lineArray;

  var diffs = this.diff_main(text1, text2, false, deadline);

  // Convert the diff back to original text.
  this.diff_charsToLines_(diffs, linearray);
  // Eliminate freak matches (e.g. blank lines)
  this.diff_cleanupSemantic(diffs);

  // Rediff any replacement blocks, this time character-by-character.
  // Add a dummy entry at the end.
  diffs.push([DIFF_EQUAL, '']);
  var pointer = 0;
  var count_delete = 0;
  var count_insert = 0;
  var text_delete = '';
  var text_insert = '';
  while (pointer < diffs.length) {
    switch (diffs[pointer][0]) {
      case DIFF_INSERT:
        count_insert++;
        text_insert += diffs[pointer][1];
        break;
      case DIFF_DELETE:
        count_delete++;
        text_delete += diffs[pointer][1];
        break;
      case DIFF_EQUAL:
        // Upon reaching an equality, check for prior redundancies.
        if (count_delete >= 1 && count_insert >= 1) {
          // Delete the offending records and add the merged ones.
          diffs.splice(pointer - count_delete - count_insert,
                       count_delete + count_insert);
          pointer = pointer - count_delete - count_insert;
          var a = this.diff_main(text_delete, text_insert, false, deadline);
          for (var j = a.length - 1; j >= 0; j--) {
            diffs.splice(pointer, 0, a[j]);
          }
          pointer = pointer + a.length;
        }
        count_insert = 0;
        count_delete = 0;
        text_delete = '';
        text_insert = '';
        break;
    }
    pointer++;
  }
  diffs.pop();  // Remove the dummy entry at the end.

  return diffs;
};


/**
 * Find the 'middle snake' of a diff, split the problem in two
 * and return the recursively constructed diff.
 * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} deadline Time at which to bail if not yet complete.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_bisect_ = function(text1, text2, deadline) {
  // Cache the text lengths to prevent multiple calls.
  var text1_length = text1.length;
  var text2_length = text2.length;
  var max_d = Math.ceil((text1_length + text2_length) / 2);
  var v_offset = max_d;
  var v_length = 2 * max_d;
  var v1 = new Array(v_length);
  var v2 = new Array(v_length);
  // Setting all elements to -1 is faster in Chrome & Firefox than mixing
  // integers and undefined.
  for (var x = 0; x < v_length; x++) {
    v1[x] = -1;
    v2[x] = -1;
  }
  v1[v_offset + 1] = 0;
  v2[v_offset + 1] = 0;
  var delta = text1_length - text2_length;
  // If the total number of characters is odd, then the front path will collide
  // with the reverse path.
  var front = (delta % 2 != 0);
  // Offsets for start and end of k loop.
  // Prevents mapping of space beyond the grid.
  var k1start = 0;
  var k1end = 0;
  var k2start = 0;
  var k2end = 0;
  for (var d = 0; d < max_d; d++) {
    // Bail out if deadline is reached.
    if ((new Date()).getTime() > deadline) {
      break;
    }

    // Walk the front path one step.
    for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      var k1_offset = v_offset + k1;
      var x1;
      if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
        x1 = v1[k1_offset + 1];
      } else {
        x1 = v1[k1_offset - 1] + 1;
      }
      var y1 = x1 - k1;
      while (x1 < text1_length && y1 < text2_length &&
             text1.charAt(x1) == text2.charAt(y1)) {
        x1++;
        y1++;
      }
      v1[k1_offset] = x1;
      if (x1 > text1_length) {
        // Ran off the right of the graph.
        k1end += 2;
      } else if (y1 > text2_length) {
        // Ran off the bottom of the graph.
        k1start += 2;
      } else if (front) {
        var k2_offset = v_offset + delta - k1;
        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
          // Mirror x2 onto top-left coordinate system.
          var x2 = text1_length - v2[k2_offset];
          if (x1 >= x2) {
            // Overlap detected.
            return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
          }
        }
      }
    }

    // Walk the reverse path one step.
    for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      var k2_offset = v_offset + k2;
      var x2;
      if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
        x2 = v2[k2_offset + 1];
      } else {
        x2 = v2[k2_offset - 1] + 1;
      }
      var y2 = x2 - k2;
      while (x2 < text1_length && y2 < text2_length &&
             text1.charAt(text1_length - x2 - 1) ==
             text2.charAt(text2_length - y2 - 1)) {
        x2++;
        y2++;
      }
      v2[k2_offset] = x2;
      if (x2 > text1_length) {
        // Ran off the left of the graph.
        k2end += 2;
      } else if (y2 > text2_length) {
        // Ran off the top of the graph.
        k2start += 2;
      } else if (!front) {
        var k1_offset = v_offset + delta - k2;
        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
          var x1 = v1[k1_offset];
          var y1 = v_offset + x1 - k1_offset;
          // Mirror x2 onto top-left coordinate system.
          x2 = text1_length - x2;
          if (x1 >= x2) {
            // Overlap detected.
            return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
          }
        }
      }
    }
  }
  // Diff took too long and hit the deadline or
  // number of diffs equals number of characters, no commonality at all.
  return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
};


/**
 * Given the location of the 'middle snake', split the diff in two parts
 * and recurse.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} x Index of split point in text1.
 * @param {number} y Index of split point in text2.
 * @param {number} deadline Time at which to bail if not yet complete.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */
diff_match_patch.prototype.diff_bisectSplit_ = function(text1, text2, x, y,
    deadline) {
  var text1a = text1.substring(0, x);
  var text2a = text2.substring(0, y);
  var text1b = text1.substring(x);
  var text2b = text2.substring(y);

  // Compute both diffs serially.
  var diffs = this.diff_main(text1a, text2a, false, deadline);
  var diffsb = this.diff_main(text1b, text2b, false, deadline);

  return diffs.concat(diffsb);
};


/**
 * Split two texts into an array of strings.  Reduce the texts to a string of
 * hashes where each Unicode character represents one line.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {{chars1: string, chars2: string, lineArray: !Array.<string>}}
 *     An object containing the encoded text1, the encoded text2 and
 *     the array of unique strings.
 *     The zeroth element of the array of unique strings is intentionally blank.
 * @private
 */
diff_match_patch.prototype.diff_linesToChars_ = function(text1, text2) {
  var lineArray = [];  // e.g. lineArray[4] == 'Hello\n'
  var lineHash = {};   // e.g. lineHash['Hello\n'] == 4

  // '\x00' is a valid character, but various debuggers don't like it.
  // So we'll insert a junk entry to avoid generating a null character.
  lineArray[0] = '';

  /**
   * Split a text into an array of strings.  Reduce the texts to a string of
   * hashes where each Unicode character represents one line.
   * Modifies linearray and linehash through being a closure.
   * @param {string} text String to encode.
   * @return {string} Encoded string.
   * @private
   */
  function diff_linesToCharsMunge_(text) {
    var chars = '';
    // Walk the text, pulling out a substring for each line.
    // text.split('\n') would would temporarily double our memory footprint.
    // Modifying text would create many large strings to garbage collect.
    var lineStart = 0;
    var lineEnd = -1;
    // Keeping our own length variable is faster than looking it up.
    var lineArrayLength = lineArray.length;
    while (lineEnd < text.length - 1) {
      lineEnd = text.indexOf('\n', lineStart);
      if (lineEnd == -1) {
        lineEnd = text.length - 1;
      }
      var line = text.substring(lineStart, lineEnd + 1);
      lineStart = lineEnd + 1;

      if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) :
          (lineHash[line] !== undefined)) {
        chars += String.fromCharCode(lineHash[line]);
      } else {
        chars += String.fromCharCode(lineArrayLength);
        lineHash[line] = lineArrayLength;
        lineArray[lineArrayLength++] = line;
      }
    }
    return chars;
  }

  var chars1 = diff_linesToCharsMunge_(text1);
  var chars2 = diff_linesToCharsMunge_(text2);
  return {chars1: chars1, chars2: chars2, lineArray: lineArray};
};


/**
 * Rehydrate the text in a diff from a string of line hashes to real lines of
 * text.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @param {!Array.<string>} lineArray Array of unique strings.
 * @private
 */
diff_match_patch.prototype.diff_charsToLines_ = function(diffs, lineArray) {
  for (var x = 0; x < diffs.length; x++) {
    var chars = diffs[x][1];
    var text = [];
    for (var y = 0; y < chars.length; y++) {
      text[y] = lineArray[chars.charCodeAt(y)];
    }
    diffs[x][1] = text.join('');
  }
};


/**
 * Determine the common prefix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the start of each
 *     string.
 */
diff_match_patch.prototype.diff_commonPrefix = function(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerstart = 0;
  while (pointermin < pointermid) {
    if (text1.substring(pointerstart, pointermid) ==
        text2.substring(pointerstart, pointermid)) {
      pointermin = pointermid;
      pointerstart = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
};


/**
 * Determine the common suffix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of each string.
 */
diff_match_patch.prototype.diff_commonSuffix = function(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 ||
      text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerend = 0;
  while (pointermin < pointermid) {
    if (text1.substring(text1.length - pointermid, text1.length - pointerend) ==
        text2.substring(text2.length - pointermid, text2.length - pointerend)) {
      pointermin = pointermid;
      pointerend = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
};


/**
 * Determine if the suffix of one string is the prefix of another.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of the first
 *     string and the start of the second string.
 * @private
 */
diff_match_patch.prototype.diff_commonOverlap_ = function(text1, text2) {
  // Cache the text lengths to prevent multiple calls.
  var text1_length = text1.length;
  var text2_length = text2.length;
  // Eliminate the null case.
  if (text1_length == 0 || text2_length == 0) {
    return 0;
  }
  // Truncate the longer string.
  if (text1_length > text2_length) {
    text1 = text1.substring(text1_length - text2_length);
  } else if (text1_length < text2_length) {
    text2 = text2.substring(0, text1_length);
  }
  var text_length = Math.min(text1_length, text2_length);
  // Quick check for the worst case.
  if (text1 == text2) {
    return text_length;
  }

  // Start by looking for a single character match
  // and increase length until no match is found.
  // Performance analysis: http://neil.fraser.name/news/2010/11/04/
  var best = 0;
  var length = 1;
  while (true) {
    var pattern = text1.substring(text_length - length);
    var found = text2.indexOf(pattern);
    if (found == -1) {
      return best;
    }
    length += found;
    if (found == 0 || text1.substring(text_length - length) ==
        text2.substring(0, length)) {
      best = length;
      length++;
    }
  }
};


/**
 * Do the two texts share a substring which is at least half the length of the
 * longer text?
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {Array.<string>} Five element Array, containing the prefix of
 *     text1, the suffix of text1, the prefix of text2, the suffix of
 *     text2 and the common middle.  Or null if there was no match.
 * @private
 */
diff_match_patch.prototype.diff_halfMatch_ = function(text1, text2) {
  if (this.Diff_Timeout <= 0) {
    // Don't risk returning a non-optimal diff if we have unlimited time.
    return null;
  }
  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
    return null;  // Pointless.
  }
  var dmp = this;  // 'this' becomes 'window' in a closure.

  /**
   * Does a substring of shorttext exist within longtext such that the substring
   * is at least half the length of longtext?
   * Closure, but does not reference any external variables.
   * @param {string} longtext Longer string.
   * @param {string} shorttext Shorter string.
   * @param {number} i Start index of quarter length substring within longtext.
   * @return {Array.<string>} Five element Array, containing the prefix of
   *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
   *     of shorttext and the common middle.  Or null if there was no match.
   * @private
   */
  function diff_halfMatchI_(longtext, shorttext, i) {
    // Start with a 1/4 length substring at position i as a seed.
    var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
    var j = -1;
    var best_common = '';
    var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
    while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
      var prefixLength = dmp.diff_commonPrefix(longtext.substring(i),
                                               shorttext.substring(j));
      var suffixLength = dmp.diff_commonSuffix(longtext.substring(0, i),
                                               shorttext.substring(0, j));
      if (best_common.length < suffixLength + prefixLength) {
        best_common = shorttext.substring(j - suffixLength, j) +
            shorttext.substring(j, j + prefixLength);
        best_longtext_a = longtext.substring(0, i - suffixLength);
        best_longtext_b = longtext.substring(i + prefixLength);
        best_shorttext_a = shorttext.substring(0, j - suffixLength);
        best_shorttext_b = shorttext.substring(j + prefixLength);
      }
    }
    if (best_common.length * 2 >= longtext.length) {
      return [best_longtext_a, best_longtext_b,
              best_shorttext_a, best_shorttext_b, best_common];
    } else {
      return null;
    }
  }

  // First check if the second quarter is the seed for a half-match.
  var hm1 = diff_halfMatchI_(longtext, shorttext,
                             Math.ceil(longtext.length / 4));
  // Check again based on the third quarter.
  var hm2 = diff_halfMatchI_(longtext, shorttext,
                             Math.ceil(longtext.length / 2));
  var hm;
  if (!hm1 && !hm2) {
    return null;
  } else if (!hm2) {
    hm = hm1;
  } else if (!hm1) {
    hm = hm2;
  } else {
    // Both matched.  Select the longest.
    hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
  }

  // A half-match was found, sort out the return data.
  var text1_a, text1_b, text2_a, text2_b;
  if (text1.length > text2.length) {
    text1_a = hm[0];
    text1_b = hm[1];
    text2_a = hm[2];
    text2_b = hm[3];
  } else {
    text2_a = hm[0];
    text2_b = hm[1];
    text1_a = hm[2];
    text1_b = hm[3];
  }
  var mid_common = hm[4];
  return [text1_a, text1_b, text2_a, text2_b, mid_common];
};


/**
 * Reduce the number of edits by eliminating semantically trivial equalities.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupSemantic = function(diffs) {
  var changes = false;
  var equalities = [];  // Stack of indices where equalities are found.
  var equalitiesLength = 0;  // Keeping our own length var is faster in JS.
  /** @type {?string} */
  var lastequality = null;
  // Always equal to diffs[equalities[equalitiesLength - 1]][1]
  var pointer = 0;  // Index of current position.
  // Number of characters that changed prior to the equality.
  var length_insertions1 = 0;
  var length_deletions1 = 0;
  // Number of characters that changed after the equality.
  var length_insertions2 = 0;
  var length_deletions2 = 0;
  while (pointer < diffs.length) {
    if (diffs[pointer][0] == DIFF_EQUAL) {  // Equality found.
      equalities[equalitiesLength++] = pointer;
      length_insertions1 = length_insertions2;
      length_deletions1 = length_deletions2;
      length_insertions2 = 0;
      length_deletions2 = 0;
      lastequality = diffs[pointer][1];
    } else {  // An insertion or deletion.
      if (diffs[pointer][0] == DIFF_INSERT) {
        length_insertions2 += diffs[pointer][1].length;
      } else {
        length_deletions2 += diffs[pointer][1].length;
      }
      // Eliminate an equality that is smaller or equal to the edits on both
      // sides of it.
      if (lastequality && (lastequality.length <=
          Math.max(length_insertions1, length_deletions1)) &&
          (lastequality.length <= Math.max(length_insertions2,
                                           length_deletions2))) {
        // Duplicate record.
        diffs.splice(equalities[equalitiesLength - 1], 0,
                     [DIFF_DELETE, lastequality]);
        // Change second copy to insert.
        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
        // Throw away the equality we just deleted.
        equalitiesLength--;
        // Throw away the previous equality (it needs to be reevaluated).
        equalitiesLength--;
        pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
        length_insertions1 = 0;  // Reset the counters.
        length_deletions1 = 0;
        length_insertions2 = 0;
        length_deletions2 = 0;
        lastequality = null;
        changes = true;
      }
    }
    pointer++;
  }

  // Normalize the diff.
  if (changes) {
    this.diff_cleanupMerge(diffs);
  }
  this.diff_cleanupSemanticLossless(diffs);

  // Find any overlaps between deletions and insertions.
  // e.g: <del>abcxxx</del><ins>xxxdef</ins>
  //   -> <del>abc</del>xxx<ins>def</ins>
  // e.g: <del>xxxabc</del><ins>defxxx</ins>
  //   -> <ins>def</ins>xxx<del>abc</del>
  // Only extract an overlap if it is as big as the edit ahead or behind it.
  pointer = 1;
  while (pointer < diffs.length) {
    if (diffs[pointer - 1][0] == DIFF_DELETE &&
        diffs[pointer][0] == DIFF_INSERT) {
      var deletion = diffs[pointer - 1][1];
      var insertion = diffs[pointer][1];
      var overlap_length1 = this.diff_commonOverlap_(deletion, insertion);
      var overlap_length2 = this.diff_commonOverlap_(insertion, deletion);
      if (overlap_length1 >= overlap_length2) {
        if (overlap_length1 >= deletion.length / 2 ||
            overlap_length1 >= insertion.length / 2) {
          // Overlap found.  Insert an equality and trim the surrounding edits.
          diffs.splice(pointer, 0,
              [DIFF_EQUAL, insertion.substring(0, overlap_length1)]);
          diffs[pointer - 1][1] =
              deletion.substring(0, deletion.length - overlap_length1);
          diffs[pointer + 1][1] = insertion.substring(overlap_length1);
          pointer++;
        }
      } else {
        if (overlap_length2 >= deletion.length / 2 ||
            overlap_length2 >= insertion.length / 2) {
          // Reverse overlap found.
          // Insert an equality and swap and trim the surrounding edits.
          diffs.splice(pointer, 0,
              [DIFF_EQUAL, deletion.substring(0, overlap_length2)]);
          diffs[pointer - 1][0] = DIFF_INSERT;
          diffs[pointer - 1][1] =
              insertion.substring(0, insertion.length - overlap_length2);
          diffs[pointer + 1][0] = DIFF_DELETE;
          diffs[pointer + 1][1] =
              deletion.substring(overlap_length2);
          pointer++;
        }
      }
      pointer++;
    }
    pointer++;
  }
};


/**
 * Look for single edits surrounded on both sides by equalities
 * which can be shifted sideways to align the edit to a word boundary.
 * e.g: The c<ins>at c</ins>ame. -> The <ins>cat </ins>came.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupSemanticLossless = function(diffs) {
  /**
   * Given two strings, compute a score representing whether the internal
   * boundary falls on logical boundaries.
   * Scores range from 6 (best) to 0 (worst).
   * Closure, but does not reference any external variables.
   * @param {string} one First string.
   * @param {string} two Second string.
   * @return {number} The score.
   * @private
   */
  function diff_cleanupSemanticScore_(one, two) {
    if (!one || !two) {
      // Edges are the best.
      return 6;
    }

    // Each port of this function behaves slightly differently due to
    // subtle differences in each language's definition of things like
    // 'whitespace'.  Since this function's purpose is largely cosmetic,
    // the choice has been made to use each language's native features
    // rather than force total conformity.
    var char1 = one.charAt(one.length - 1);
    var char2 = two.charAt(0);
    var nonAlphaNumeric1 = char1.match(diff_match_patch.nonAlphaNumericRegex_);
    var nonAlphaNumeric2 = char2.match(diff_match_patch.nonAlphaNumericRegex_);
    var whitespace1 = nonAlphaNumeric1 &&
        char1.match(diff_match_patch.whitespaceRegex_);
    var whitespace2 = nonAlphaNumeric2 &&
        char2.match(diff_match_patch.whitespaceRegex_);
    var lineBreak1 = whitespace1 &&
        char1.match(diff_match_patch.linebreakRegex_);
    var lineBreak2 = whitespace2 &&
        char2.match(diff_match_patch.linebreakRegex_);
    var blankLine1 = lineBreak1 &&
        one.match(diff_match_patch.blanklineEndRegex_);
    var blankLine2 = lineBreak2 &&
        two.match(diff_match_patch.blanklineStartRegex_);

    if (blankLine1 || blankLine2) {
      // Five points for blank lines.
      return 5;
    } else if (lineBreak1 || lineBreak2) {
      // Four points for line breaks.
      return 4;
    } else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
      // Three points for end of sentences.
      return 3;
    } else if (whitespace1 || whitespace2) {
      // Two points for whitespace.
      return 2;
    } else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
      // One point for non-alphanumeric.
      return 1;
    }
    return 0;
  }

  var pointer = 1;
  // Intentionally ignore the first and last element (don't need checking).
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] == DIFF_EQUAL &&
        diffs[pointer + 1][0] == DIFF_EQUAL) {
      // This is a single edit surrounded by equalities.
      var equality1 = diffs[pointer - 1][1];
      var edit = diffs[pointer][1];
      var equality2 = diffs[pointer + 1][1];

      // First, shift the edit as far left as possible.
      var commonOffset = this.diff_commonSuffix(equality1, edit);
      if (commonOffset) {
        var commonString = edit.substring(edit.length - commonOffset);
        equality1 = equality1.substring(0, equality1.length - commonOffset);
        edit = commonString + edit.substring(0, edit.length - commonOffset);
        equality2 = commonString + equality2;
      }

      // Second, step character by character right, looking for the best fit.
      var bestEquality1 = equality1;
      var bestEdit = edit;
      var bestEquality2 = equality2;
      var bestScore = diff_cleanupSemanticScore_(equality1, edit) +
          diff_cleanupSemanticScore_(edit, equality2);
      while (edit.charAt(0) === equality2.charAt(0)) {
        equality1 += edit.charAt(0);
        edit = edit.substring(1) + equality2.charAt(0);
        equality2 = equality2.substring(1);
        var score = diff_cleanupSemanticScore_(equality1, edit) +
            diff_cleanupSemanticScore_(edit, equality2);
        // The >= encourages trailing rather than leading whitespace on edits.
        if (score >= bestScore) {
          bestScore = score;
          bestEquality1 = equality1;
          bestEdit = edit;
          bestEquality2 = equality2;
        }
      }

      if (diffs[pointer - 1][1] != bestEquality1) {
        // We have an improvement, save it back to the diff.
        if (bestEquality1) {
          diffs[pointer - 1][1] = bestEquality1;
        } else {
          diffs.splice(pointer - 1, 1);
          pointer--;
        }
        diffs[pointer][1] = bestEdit;
        if (bestEquality2) {
          diffs[pointer + 1][1] = bestEquality2;
        } else {
          diffs.splice(pointer + 1, 1);
          pointer--;
        }
      }
    }
    pointer++;
  }
};

// Define some regex patterns for matching boundaries.
diff_match_patch.nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
diff_match_patch.whitespaceRegex_ = /\s/;
diff_match_patch.linebreakRegex_ = /[\r\n]/;
diff_match_patch.blanklineEndRegex_ = /\n\r?\n$/;
diff_match_patch.blanklineStartRegex_ = /^\r?\n\r?\n/;

/**
 * Reduce the number of edits by eliminating operationally trivial equalities.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupEfficiency = function(diffs) {
  var changes = false;
  var equalities = [];  // Stack of indices where equalities are found.
  var equalitiesLength = 0;  // Keeping our own length var is faster in JS.
  /** @type {?string} */
  var lastequality = null;
  // Always equal to diffs[equalities[equalitiesLength - 1]][1]
  var pointer = 0;  // Index of current position.
  // Is there an insertion operation before the last equality.
  var pre_ins = false;
  // Is there a deletion operation before the last equality.
  var pre_del = false;
  // Is there an insertion operation after the last equality.
  var post_ins = false;
  // Is there a deletion operation after the last equality.
  var post_del = false;
  while (pointer < diffs.length) {
    if (diffs[pointer][0] == DIFF_EQUAL) {  // Equality found.
      if (diffs[pointer][1].length < this.Diff_EditCost &&
          (post_ins || post_del)) {
        // Candidate found.
        equalities[equalitiesLength++] = pointer;
        pre_ins = post_ins;
        pre_del = post_del;
        lastequality = diffs[pointer][1];
      } else {
        // Not a candidate, and can never become one.
        equalitiesLength = 0;
        lastequality = null;
      }
      post_ins = post_del = false;
    } else {  // An insertion or deletion.
      if (diffs[pointer][0] == DIFF_DELETE) {
        post_del = true;
      } else {
        post_ins = true;
      }
      /*
       * Five types to be split:
       * <ins>A</ins><del>B</del>XY<ins>C</ins><del>D</del>
       * <ins>A</ins>X<ins>C</ins><del>D</del>
       * <ins>A</ins><del>B</del>X<ins>C</ins>
       * <ins>A</del>X<ins>C</ins><del>D</del>
       * <ins>A</ins><del>B</del>X<del>C</del>
       */
      if (lastequality && ((pre_ins && pre_del && post_ins && post_del) ||
                           ((lastequality.length < this.Diff_EditCost / 2) &&
                            (pre_ins + pre_del + post_ins + post_del) == 3))) {
        // Duplicate record.
        diffs.splice(equalities[equalitiesLength - 1], 0,
                     [DIFF_DELETE, lastequality]);
        // Change second copy to insert.
        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
        equalitiesLength--;  // Throw away the equality we just deleted;
        lastequality = null;
        if (pre_ins && pre_del) {
          // No changes made which could affect previous entry, keep going.
          post_ins = post_del = true;
          equalitiesLength = 0;
        } else {
          equalitiesLength--;  // Throw away the previous equality.
          pointer = equalitiesLength > 0 ?
              equalities[equalitiesLength - 1] : -1;
          post_ins = post_del = false;
        }
        changes = true;
      }
    }
    pointer++;
  }

  if (changes) {
    this.diff_cleanupMerge(diffs);
  }
};


/**
 * Reorder and merge like edit sections.  Merge equalities.
 * Any edit section can move as long as it doesn't cross an equality.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */
diff_match_patch.prototype.diff_cleanupMerge = function(diffs) {
  diffs.push([DIFF_EQUAL, '']);  // Add a dummy entry at the end.
  var pointer = 0;
  var count_delete = 0;
  var count_insert = 0;
  var text_delete = '';
  var text_insert = '';
  var commonlength;
  while (pointer < diffs.length) {
    switch (diffs[pointer][0]) {
      case DIFF_INSERT:
        count_insert++;
        text_insert += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_DELETE:
        count_delete++;
        text_delete += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_EQUAL:
        // Upon reaching an equality, check for prior redundancies.
        if (count_delete + count_insert > 1) {
          if (count_delete !== 0 && count_insert !== 0) {
            // Factor out any common prefixies.
            commonlength = this.diff_commonPrefix(text_insert, text_delete);
            if (commonlength !== 0) {
              if ((pointer - count_delete - count_insert) > 0 &&
                  diffs[pointer - count_delete - count_insert - 1][0] ==
                  DIFF_EQUAL) {
                diffs[pointer - count_delete - count_insert - 1][1] +=
                    text_insert.substring(0, commonlength);
              } else {
                diffs.splice(0, 0, [DIFF_EQUAL,
                                    text_insert.substring(0, commonlength)]);
                pointer++;
              }
              text_insert = text_insert.substring(commonlength);
              text_delete = text_delete.substring(commonlength);
            }
            // Factor out any common suffixies.
            commonlength = this.diff_commonSuffix(text_insert, text_delete);
            if (commonlength !== 0) {
              diffs[pointer][1] = text_insert.substring(text_insert.length -
                  commonlength) + diffs[pointer][1];
              text_insert = text_insert.substring(0, text_insert.length -
                  commonlength);
              text_delete = text_delete.substring(0, text_delete.length -
                  commonlength);
            }
          }
          // Delete the offending records and add the merged ones.
          if (count_delete === 0) {
            diffs.splice(pointer - count_insert,
                count_delete + count_insert, [DIFF_INSERT, text_insert]);
          } else if (count_insert === 0) {
            diffs.splice(pointer - count_delete,
                count_delete + count_insert, [DIFF_DELETE, text_delete]);
          } else {
            diffs.splice(pointer - count_delete - count_insert,
                count_delete + count_insert, [DIFF_DELETE, text_delete],
                [DIFF_INSERT, text_insert]);
          }
          pointer = pointer - count_delete - count_insert +
                    (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
        } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
          // Merge this equality with the previous one.
          diffs[pointer - 1][1] += diffs[pointer][1];
          diffs.splice(pointer, 1);
        } else {
          pointer++;
        }
        count_insert = 0;
        count_delete = 0;
        text_delete = '';
        text_insert = '';
        break;
    }
  }
  if (diffs[diffs.length - 1][1] === '') {
    diffs.pop();  // Remove the dummy entry at the end.
  }

  // Second pass: look for single edits surrounded on both sides by equalities
  // which can be shifted sideways to eliminate an equality.
  // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
  var changes = false;
  pointer = 1;
  // Intentionally ignore the first and last element (don't need checking).
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] == DIFF_EQUAL &&
        diffs[pointer + 1][0] == DIFF_EQUAL) {
      // This is a single edit surrounded by equalities.
      if (diffs[pointer][1].substring(diffs[pointer][1].length -
          diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
        // Shift the edit over the previous equality.
        diffs[pointer][1] = diffs[pointer - 1][1] +
            diffs[pointer][1].substring(0, diffs[pointer][1].length -
                                        diffs[pointer - 1][1].length);
        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
        diffs.splice(pointer - 1, 1);
        changes = true;
      } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
          diffs[pointer + 1][1]) {
        // Shift the edit over the next equality.
        diffs[pointer - 1][1] += diffs[pointer + 1][1];
        diffs[pointer][1] =
            diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
            diffs[pointer + 1][1];
        diffs.splice(pointer + 1, 1);
        changes = true;
      }
    }
    pointer++;
  }
  // If shifts were made, the diff needs reordering and another shift sweep.
  if (changes) {
    this.diff_cleanupMerge(diffs);
  }
};


/**
 * loc is a location in text1, compute and return the equivalent location in
 * text2.
 * e.g. 'The cat' vs 'The big cat', 1->1, 5->8
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @param {number} loc Location within text1.
 * @return {number} Location within text2.
 */
diff_match_patch.prototype.diff_xIndex = function(diffs, loc) {
  var chars1 = 0;
  var chars2 = 0;
  var last_chars1 = 0;
  var last_chars2 = 0;
  var x;
  for (x = 0; x < diffs.length; x++) {
    if (diffs[x][0] !== DIFF_INSERT) {  // Equality or deletion.
      chars1 += diffs[x][1].length;
    }
    if (diffs[x][0] !== DIFF_DELETE) {  // Equality or insertion.
      chars2 += diffs[x][1].length;
    }
    if (chars1 > loc) {  // Overshot the location.
      break;
    }
    last_chars1 = chars1;
    last_chars2 = chars2;
  }
  // Was the location was deleted?
  if (diffs.length != x && diffs[x][0] === DIFF_DELETE) {
    return last_chars2;
  }
  // Add the remaining character length.
  return last_chars2 + (loc - last_chars1);
};


/**
 * Convert a diff array into a pretty HTML report.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} HTML representation.
 */
diff_match_patch.prototype.diff_prettyHtml = function(diffs) {
  var html = [];
  var pattern_amp = /&/g;
  var pattern_lt = /</g;
  var pattern_gt = />/g;
  var pattern_para = /\n/g;
  for (var x = 0; x < diffs.length; x++) {
    var op = diffs[x][0];    // Operation (insert, delete, equal)
    var data = diffs[x][1];  // Text of change.
    var text = data.replace(pattern_amp, '&amp;').replace(pattern_lt, '&lt;')
        .replace(pattern_gt, '&gt;').replace(pattern_para, '&para;<br>');
    switch (op) {
      case DIFF_INSERT:
        html[x] = '<ins style="background:#e6ffe6;">' + text + '</ins>';
        break;
      case DIFF_DELETE:
        html[x] = '<del style="background:#ffe6e6;">' + text + '</del>';
        break;
      case DIFF_EQUAL:
        html[x] = '<span>' + text + '</span>';
        break;
    }
  }
  return html.join('');
};


/**
 * Compute and return the source text (all equalities and deletions).
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Source text.
 */
diff_match_patch.prototype.diff_text1 = function(diffs) {
  var text = [];
  for (var x = 0; x < diffs.length; x++) {
    if (diffs[x][0] !== DIFF_INSERT) {
      text[x] = diffs[x][1];
    }
  }
  return text.join('');
};


/**
 * Compute and return the destination text (all equalities and insertions).
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Destination text.
 */
diff_match_patch.prototype.diff_text2 = function(diffs) {
  var text = [];
  for (var x = 0; x < diffs.length; x++) {
    if (diffs[x][0] !== DIFF_DELETE) {
      text[x] = diffs[x][1];
    }
  }
  return text.join('');
};


/**
 * Compute the Levenshtein distance; the number of inserted, deleted or
 * substituted characters.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {number} Number of changes.
 */
diff_match_patch.prototype.diff_levenshtein = function(diffs) {
  var levenshtein = 0;
  var insertions = 0;
  var deletions = 0;
  for (var x = 0; x < diffs.length; x++) {
    var op = diffs[x][0];
    var data = diffs[x][1];
    switch (op) {
      case DIFF_INSERT:
        insertions += data.length;
        break;
      case DIFF_DELETE:
        deletions += data.length;
        break;
      case DIFF_EQUAL:
        // A deletion and an insertion is one substitution.
        levenshtein += Math.max(insertions, deletions);
        insertions = 0;
        deletions = 0;
        break;
    }
  }
  levenshtein += Math.max(insertions, deletions);
  return levenshtein;
};


/**
 * Crush the diff into an encoded string which describes the operations
 * required to transform text1 into text2.
 * E.g. =3\t-2\t+ing  -> Keep 3 chars, delete 2 chars, insert 'ing'.
 * Operations are tab-separated.  Inserted text is escaped using %xx notation.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Delta text.
 */
diff_match_patch.prototype.diff_toDelta = function(diffs) {
  var text = [];
  for (var x = 0; x < diffs.length; x++) {
    switch (diffs[x][0]) {
      case DIFF_INSERT:
        text[x] = '+' + encodeURI(diffs[x][1]);
        break;
      case DIFF_DELETE:
        text[x] = '-' + diffs[x][1].length;
        break;
      case DIFF_EQUAL:
        text[x] = '=' + diffs[x][1].length;
        break;
    }
  }
  return text.join('\t').replace(/%20/g, ' ');
};


/**
 * Given the original text1, and an encoded string which describes the
 * operations required to transform text1 into text2, compute the full diff.
 * @param {string} text1 Source string for the diff.
 * @param {string} delta Delta text.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @throws {!Error} If invalid input.
 */
diff_match_patch.prototype.diff_fromDelta = function(text1, delta) {
  var diffs = [];
  var diffsLength = 0;  // Keeping our own length var is faster in JS.
  var pointer = 0;  // Cursor in text1
  var tokens = delta.split(/\t/g);
  for (var x = 0; x < tokens.length; x++) {
    // Each token begins with a one character parameter which specifies the
    // operation of this token (delete, insert, equality).
    var param = tokens[x].substring(1);
    switch (tokens[x].charAt(0)) {
      case '+':
        try {
          diffs[diffsLength++] = [DIFF_INSERT, decodeURI(param)];
        } catch (ex) {
          // Malformed URI sequence.
          throw new Error('Illegal escape in diff_fromDelta: ' + param);
        }
        break;
      case '-':
        // Fall through.
      case '=':
        var n = parseInt(param, 10);
        if (isNaN(n) || n < 0) {
          throw new Error('Invalid number in diff_fromDelta: ' + param);
        }
        var text = text1.substring(pointer, pointer += n);
        if (tokens[x].charAt(0) == '=') {
          diffs[diffsLength++] = [DIFF_EQUAL, text];
        } else {
          diffs[diffsLength++] = [DIFF_DELETE, text];
        }
        break;
      default:
        // Blank tokens are ok (from a trailing \t).
        // Anything else is an error.
        if (tokens[x]) {
          throw new Error('Invalid diff operation in diff_fromDelta: ' +
                          tokens[x]);
        }
    }
  }
  if (pointer != text1.length) {
    throw new Error('Delta length (' + pointer +
        ') does not equal source text length (' + text1.length + ').');
  }
  return diffs;
};


//  MATCH FUNCTIONS


/**
 * Locate the best instance of 'pattern' in 'text' near 'loc'.
 * @param {string} text The text to search.
 * @param {string} pattern The pattern to search for.
 * @param {number} loc The location to search around.
 * @return {number} Best match index or -1.
 */
diff_match_patch.prototype.match_main = function(text, pattern, loc) {
  // Check for null inputs.
  if (text == null || pattern == null || loc == null) {
    throw new Error('Null input. (match_main)');
  }

  loc = Math.max(0, Math.min(loc, text.length));
  if (text == pattern) {
    // Shortcut (potentially not guaranteed by the algorithm)
    return 0;
  } else if (!text.length) {
    // Nothing to match.
    return -1;
  } else if (text.substring(loc, loc + pattern.length) == pattern) {
    // Perfect match at the perfect spot!  (Includes case of null pattern)
    return loc;
  } else {
    // Do a fuzzy compare.
    return this.match_bitap_(text, pattern, loc);
  }
};


/**
 * Locate the best instance of 'pattern' in 'text' near 'loc' using the
 * Bitap algorithm.
 * @param {string} text The text to search.
 * @param {string} pattern The pattern to search for.
 * @param {number} loc The location to search around.
 * @return {number} Best match index or -1.
 * @private
 */
diff_match_patch.prototype.match_bitap_ = function(text, pattern, loc) {
  if (pattern.length > this.Match_MaxBits) {
    throw new Error('Pattern too long for this browser.');
  }

  // Initialise the alphabet.
  var s = this.match_alphabet_(pattern);

  var dmp = this;  // 'this' becomes 'window' in a closure.

  /**
   * Compute and return the score for a match with e errors and x location.
   * Accesses loc and pattern through being a closure.
   * @param {number} e Number of errors in match.
   * @param {number} x Location of match.
   * @return {number} Overall score for match (0.0 = good, 1.0 = bad).
   * @private
   */
  function match_bitapScore_(e, x) {
    var accuracy = e / pattern.length;
    var proximity = Math.abs(loc - x);
    if (!dmp.Match_Distance) {
      // Dodge divide by zero error.
      return proximity ? 1.0 : accuracy;
    }
    return accuracy + (proximity / dmp.Match_Distance);
  }

  // Highest score beyond which we give up.
  var score_threshold = this.Match_Threshold;
  // Is there a nearby exact match? (speedup)
  var best_loc = text.indexOf(pattern, loc);
  if (best_loc != -1) {
    score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
    // What about in the other direction? (speedup)
    best_loc = text.lastIndexOf(pattern, loc + pattern.length);
    if (best_loc != -1) {
      score_threshold =
          Math.min(match_bitapScore_(0, best_loc), score_threshold);
    }
  }

  // Initialise the bit arrays.
  var matchmask = 1 << (pattern.length - 1);
  best_loc = -1;

  var bin_min, bin_mid;
  var bin_max = pattern.length + text.length;
  var last_rd;
  for (var d = 0; d < pattern.length; d++) {
    // Scan for the best match; each iteration allows for one more error.
    // Run a binary search to determine how far from 'loc' we can stray at this
    // error level.
    bin_min = 0;
    bin_mid = bin_max;
    while (bin_min < bin_mid) {
      if (match_bitapScore_(d, loc + bin_mid) <= score_threshold) {
        bin_min = bin_mid;
      } else {
        bin_max = bin_mid;
      }
      bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
    }
    // Use the result from this iteration as the maximum for the next.
    bin_max = bin_mid;
    var start = Math.max(1, loc - bin_mid + 1);
    var finish = Math.min(loc + bin_mid, text.length) + pattern.length;

    var rd = Array(finish + 2);
    rd[finish + 1] = (1 << d) - 1;
    for (var j = finish; j >= start; j--) {
      // The alphabet (s) is a sparse hash, so the following line generates
      // warnings.
      var charMatch = s[text.charAt(j - 1)];
      if (d === 0) {  // First pass: exact match.
        rd[j] = ((rd[j + 1] << 1) | 1) & charMatch;
      } else {  // Subsequent passes: fuzzy match.
        rd[j] = (((rd[j + 1] << 1) | 1) & charMatch) |
                (((last_rd[j + 1] | last_rd[j]) << 1) | 1) |
                last_rd[j + 1];
      }
      if (rd[j] & matchmask) {
        var score = match_bitapScore_(d, j - 1);
        // This match will almost certainly be better than any existing match.
        // But check anyway.
        if (score <= score_threshold) {
          // Told you so.
          score_threshold = score;
          best_loc = j - 1;
          if (best_loc > loc) {
            // When passing loc, don't exceed our current distance from loc.
            start = Math.max(1, 2 * loc - best_loc);
          } else {
            // Already passed loc, downhill from here on in.
            break;
          }
        }
      }
    }
    // No hope for a (better) match at greater error levels.
    if (match_bitapScore_(d + 1, loc) > score_threshold) {
      break;
    }
    last_rd = rd;
  }
  return best_loc;
};


/**
 * Initialise the alphabet for the Bitap algorithm.
 * @param {string} pattern The text to encode.
 * @return {!Object} Hash of character locations.
 * @private
 */
diff_match_patch.prototype.match_alphabet_ = function(pattern) {
  var s = {};
  for (var i = 0; i < pattern.length; i++) {
    s[pattern.charAt(i)] = 0;
  }
  for (var i = 0; i < pattern.length; i++) {
    s[pattern.charAt(i)] |= 1 << (pattern.length - i - 1);
  }
  return s;
};


//  PATCH FUNCTIONS


/**
 * Increase the context until it is unique,
 * but don't let the pattern expand beyond Match_MaxBits.
 * @param {!diff_match_patch.patch_obj} patch The patch to grow.
 * @param {string} text Source text.
 * @private
 */
diff_match_patch.prototype.patch_addContext_ = function(patch, text) {
  if (text.length == 0) {
    return;
  }
  var pattern = text.substring(patch.start2, patch.start2 + patch.length1);
  var padding = 0;

  // Look for the first and last matches of pattern in text.  If two different
  // matches are found, increase the pattern length.
  while (text.indexOf(pattern) != text.lastIndexOf(pattern) &&
         pattern.length < this.Match_MaxBits - this.Patch_Margin -
         this.Patch_Margin) {
    padding += this.Patch_Margin;
    pattern = text.substring(patch.start2 - padding,
                             patch.start2 + patch.length1 + padding);
  }
  // Add one chunk for good luck.
  padding += this.Patch_Margin;

  // Add the prefix.
  var prefix = text.substring(patch.start2 - padding, patch.start2);
  if (prefix) {
    patch.diffs.unshift([DIFF_EQUAL, prefix]);
  }
  // Add the suffix.
  var suffix = text.substring(patch.start2 + patch.length1,
                              patch.start2 + patch.length1 + padding);
  if (suffix) {
    patch.diffs.push([DIFF_EQUAL, suffix]);
  }

  // Roll back the start points.
  patch.start1 -= prefix.length;
  patch.start2 -= prefix.length;
  // Extend the lengths.
  patch.length1 += prefix.length + suffix.length;
  patch.length2 += prefix.length + suffix.length;
};


/**
 * Compute a list of patches to turn text1 into text2.
 * Use diffs if provided, otherwise compute it ourselves.
 * There are four ways to call this function, depending on what data is
 * available to the caller:
 * Method 1:
 * a = text1, b = text2
 * Method 2:
 * a = diffs
 * Method 3 (optimal):
 * a = text1, b = diffs
 * Method 4 (deprecated, use method 3):
 * a = text1, b = text2, c = diffs
 *
 * @param {string|!Array.<!diff_match_patch.Diff>} a text1 (methods 1,3,4) or
 * Array of diff tuples for text1 to text2 (method 2).
 * @param {string|!Array.<!diff_match_patch.Diff>} opt_b text2 (methods 1,4) or
 * Array of diff tuples for text1 to text2 (method 3) or undefined (method 2).
 * @param {string|!Array.<!diff_match_patch.Diff>} opt_c Array of diff tuples
 * for text1 to text2 (method 4) or undefined (methods 1,2,3).
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 */
diff_match_patch.prototype.patch_make = function(a, opt_b, opt_c) {
  var text1, diffs;
  if (typeof a == 'string' && typeof opt_b == 'string' &&
      typeof opt_c == 'undefined') {
    // Method 1: text1, text2
    // Compute diffs from text1 and text2.
    text1 = /** @type {string} */(a);
    diffs = this.diff_main(text1, /** @type {string} */(opt_b), true);
    if (diffs.length > 2) {
      this.diff_cleanupSemantic(diffs);
      this.diff_cleanupEfficiency(diffs);
    }
  } else if (a && typeof a == 'object' && typeof opt_b == 'undefined' &&
      typeof opt_c == 'undefined') {
    // Method 2: diffs
    // Compute text1 from diffs.
    diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(a);
    text1 = this.diff_text1(diffs);
  } else if (typeof a == 'string' && opt_b && typeof opt_b == 'object' &&
      typeof opt_c == 'undefined') {
    // Method 3: text1, diffs
    text1 = /** @type {string} */(a);
    diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(opt_b);
  } else if (typeof a == 'string' && typeof opt_b == 'string' &&
      opt_c && typeof opt_c == 'object') {
    // Method 4: text1, text2, diffs
    // text2 is not used.
    text1 = /** @type {string} */(a);
    diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(opt_c);
  } else {
    throw new Error('Unknown call format to patch_make.');
  }

  if (diffs.length === 0) {
    return [];  // Get rid of the null case.
  }
  var patches = [];
  var patch = new diff_match_patch.patch_obj();
  var patchDiffLength = 0;  // Keeping our own length var is faster in JS.
  var char_count1 = 0;  // Number of characters into the text1 string.
  var char_count2 = 0;  // Number of characters into the text2 string.
  // Start with text1 (prepatch_text) and apply the diffs until we arrive at
  // text2 (postpatch_text).  We recreate the patches one by one to determine
  // context info.
  var prepatch_text = text1;
  var postpatch_text = text1;
  for (var x = 0; x < diffs.length; x++) {
    var diff_type = diffs[x][0];
    var diff_text = diffs[x][1];

    if (!patchDiffLength && diff_type !== DIFF_EQUAL) {
      // A new patch starts here.
      patch.start1 = char_count1;
      patch.start2 = char_count2;
    }

    switch (diff_type) {
      case DIFF_INSERT:
        patch.diffs[patchDiffLength++] = diffs[x];
        patch.length2 += diff_text.length;
        postpatch_text = postpatch_text.substring(0, char_count2) + diff_text +
                         postpatch_text.substring(char_count2);
        break;
      case DIFF_DELETE:
        patch.length1 += diff_text.length;
        patch.diffs[patchDiffLength++] = diffs[x];
        postpatch_text = postpatch_text.substring(0, char_count2) +
                         postpatch_text.substring(char_count2 +
                             diff_text.length);
        break;
      case DIFF_EQUAL:
        if (diff_text.length <= 2 * this.Patch_Margin &&
            patchDiffLength && diffs.length != x + 1) {
          // Small equality inside a patch.
          patch.diffs[patchDiffLength++] = diffs[x];
          patch.length1 += diff_text.length;
          patch.length2 += diff_text.length;
        } else if (diff_text.length >= 2 * this.Patch_Margin) {
          // Time for a new patch.
          if (patchDiffLength) {
            this.patch_addContext_(patch, prepatch_text);
            patches.push(patch);
            patch = new diff_match_patch.patch_obj();
            patchDiffLength = 0;
            // Unlike Unidiff, our patch lists have a rolling context.
            // http://code.google.com/p/google-diff-match-patch/wiki/Unidiff
            // Update prepatch text & pos to reflect the application of the
            // just completed patch.
            prepatch_text = postpatch_text;
            char_count1 = char_count2;
          }
        }
        break;
    }

    // Update the current character count.
    if (diff_type !== DIFF_INSERT) {
      char_count1 += diff_text.length;
    }
    if (diff_type !== DIFF_DELETE) {
      char_count2 += diff_text.length;
    }
  }
  // Pick up the leftover patch if not empty.
  if (patchDiffLength) {
    this.patch_addContext_(patch, prepatch_text);
    patches.push(patch);
  }

  return patches;
};


/**
 * Given an array of patches, return another array that is identical.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 */
diff_match_patch.prototype.patch_deepCopy = function(patches) {
  // Making deep copies is hard in JavaScript.
  var patchesCopy = [];
  for (var x = 0; x < patches.length; x++) {
    var patch = patches[x];
    var patchCopy = new diff_match_patch.patch_obj();
    patchCopy.diffs = [];
    for (var y = 0; y < patch.diffs.length; y++) {
      patchCopy.diffs[y] = patch.diffs[y].slice();
    }
    patchCopy.start1 = patch.start1;
    patchCopy.start2 = patch.start2;
    patchCopy.length1 = patch.length1;
    patchCopy.length2 = patch.length2;
    patchesCopy[x] = patchCopy;
  }
  return patchesCopy;
};


/**
 * Merge a set of patches onto the text.  Return a patched text, as well
 * as a list of true/false values indicating which patches were applied.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @param {string} text Old text.
 * @return {!Array.<string|!Array.<boolean>>} Two element Array, containing the
 *      new text and an array of boolean values.
 */
diff_match_patch.prototype.patch_apply = function(patches, text) {
  if (patches.length == 0) {
    return [text, []];
  }

  // Deep copy the patches so that no changes are made to originals.
  patches = this.patch_deepCopy(patches);

  var nullPadding = this.patch_addPadding(patches);
  text = nullPadding + text + nullPadding;

  this.patch_splitMax(patches);
  // delta keeps track of the offset between the expected and actual location
  // of the previous patch.  If there are patches expected at positions 10 and
  // 20, but the first patch was found at 12, delta is 2 and the second patch
  // has an effective expected position of 22.
  var delta = 0;
  var results = [];
  for (var x = 0; x < patches.length; x++) {
    var expected_loc = patches[x].start2 + delta;
    var text1 = this.diff_text1(patches[x].diffs);
    var start_loc;
    var end_loc = -1;
    if (text1.length > this.Match_MaxBits) {
      // patch_splitMax will only provide an oversized pattern in the case of
      // a monster delete.
      start_loc = this.match_main(text, text1.substring(0, this.Match_MaxBits),
                                  expected_loc);
      if (start_loc != -1) {
        end_loc = this.match_main(text,
            text1.substring(text1.length - this.Match_MaxBits),
            expected_loc + text1.length - this.Match_MaxBits);
        if (end_loc == -1 || start_loc >= end_loc) {
          // Can't find valid trailing context.  Drop this patch.
          start_loc = -1;
        }
      }
    } else {
      start_loc = this.match_main(text, text1, expected_loc);
    }
    if (start_loc == -1) {
      // No match found.  :(
      results[x] = false;
      // Subtract the delta for this failed patch from subsequent patches.
      delta -= patches[x].length2 - patches[x].length1;
    } else {
      // Found a match.  :)
      results[x] = true;
      delta = start_loc - expected_loc;
      var text2;
      if (end_loc == -1) {
        text2 = text.substring(start_loc, start_loc + text1.length);
      } else {
        text2 = text.substring(start_loc, end_loc + this.Match_MaxBits);
      }
      if (text1 == text2) {
        // Perfect match, just shove the replacement text in.
        text = text.substring(0, start_loc) +
               this.diff_text2(patches[x].diffs) +
               text.substring(start_loc + text1.length);
      } else {
        // Imperfect match.  Run a diff to get a framework of equivalent
        // indices.
        var diffs = this.diff_main(text1, text2, false);
        if (text1.length > this.Match_MaxBits &&
            this.diff_levenshtein(diffs) / text1.length >
            this.Patch_DeleteThreshold) {
          // The end points match, but the content is unacceptably bad.
          results[x] = false;
        } else {
          this.diff_cleanupSemanticLossless(diffs);
          var index1 = 0;
          var index2;
          for (var y = 0; y < patches[x].diffs.length; y++) {
            var mod = patches[x].diffs[y];
            if (mod[0] !== DIFF_EQUAL) {
              index2 = this.diff_xIndex(diffs, index1);
            }
            if (mod[0] === DIFF_INSERT) {  // Insertion
              text = text.substring(0, start_loc + index2) + mod[1] +
                     text.substring(start_loc + index2);
            } else if (mod[0] === DIFF_DELETE) {  // Deletion
              text = text.substring(0, start_loc + index2) +
                     text.substring(start_loc + this.diff_xIndex(diffs,
                         index1 + mod[1].length));
            }
            if (mod[0] !== DIFF_DELETE) {
              index1 += mod[1].length;
            }
          }
        }
      }
    }
  }
  // Strip the padding off.
  text = text.substring(nullPadding.length, text.length - nullPadding.length);
  return [text, results];
};


/**
 * Add some padding on text start and end so that edges can match something.
 * Intended to be called only from within patch_apply.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {string} The padding string added to each side.
 */
diff_match_patch.prototype.patch_addPadding = function(patches) {
  var paddingLength = this.Patch_Margin;
  var nullPadding = '';
  for (var x = 1; x <= paddingLength; x++) {
    nullPadding += String.fromCharCode(x);
  }

  // Bump all the patches forward.
  for (var x = 0; x < patches.length; x++) {
    patches[x].start1 += paddingLength;
    patches[x].start2 += paddingLength;
  }

  // Add some padding on start of first diff.
  var patch = patches[0];
  var diffs = patch.diffs;
  if (diffs.length == 0 || diffs[0][0] != DIFF_EQUAL) {
    // Add nullPadding equality.
    diffs.unshift([DIFF_EQUAL, nullPadding]);
    patch.start1 -= paddingLength;  // Should be 0.
    patch.start2 -= paddingLength;  // Should be 0.
    patch.length1 += paddingLength;
    patch.length2 += paddingLength;
  } else if (paddingLength > diffs[0][1].length) {
    // Grow first equality.
    var extraLength = paddingLength - diffs[0][1].length;
    diffs[0][1] = nullPadding.substring(diffs[0][1].length) + diffs[0][1];
    patch.start1 -= extraLength;
    patch.start2 -= extraLength;
    patch.length1 += extraLength;
    patch.length2 += extraLength;
  }

  // Add some padding on end of last diff.
  patch = patches[patches.length - 1];
  diffs = patch.diffs;
  if (diffs.length == 0 || diffs[diffs.length - 1][0] != DIFF_EQUAL) {
    // Add nullPadding equality.
    diffs.push([DIFF_EQUAL, nullPadding]);
    patch.length1 += paddingLength;
    patch.length2 += paddingLength;
  } else if (paddingLength > diffs[diffs.length - 1][1].length) {
    // Grow last equality.
    var extraLength = paddingLength - diffs[diffs.length - 1][1].length;
    diffs[diffs.length - 1][1] += nullPadding.substring(0, extraLength);
    patch.length1 += extraLength;
    patch.length2 += extraLength;
  }

  return nullPadding;
};


/**
 * Look through the patches and break up any which are longer than the maximum
 * limit of the match algorithm.
 * Intended to be called only from within patch_apply.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 */
diff_match_patch.prototype.patch_splitMax = function(patches) {
  var patch_size = this.Match_MaxBits;
  for (var x = 0; x < patches.length; x++) {
    if (patches[x].length1 <= patch_size) {
      continue;
    }
    var bigpatch = patches[x];
    // Remove the big old patch.
    patches.splice(x--, 1);
    var start1 = bigpatch.start1;
    var start2 = bigpatch.start2;
    var precontext = '';
    while (bigpatch.diffs.length !== 0) {
      // Create one of several smaller patches.
      var patch = new diff_match_patch.patch_obj();
      var empty = true;
      patch.start1 = start1 - precontext.length;
      patch.start2 = start2 - precontext.length;
      if (precontext !== '') {
        patch.length1 = patch.length2 = precontext.length;
        patch.diffs.push([DIFF_EQUAL, precontext]);
      }
      while (bigpatch.diffs.length !== 0 &&
             patch.length1 < patch_size - this.Patch_Margin) {
        var diff_type = bigpatch.diffs[0][0];
        var diff_text = bigpatch.diffs[0][1];
        if (diff_type === DIFF_INSERT) {
          // Insertions are harmless.
          patch.length2 += diff_text.length;
          start2 += diff_text.length;
          patch.diffs.push(bigpatch.diffs.shift());
          empty = false;
        } else if (diff_type === DIFF_DELETE && patch.diffs.length == 1 &&
                   patch.diffs[0][0] == DIFF_EQUAL &&
                   diff_text.length > 2 * patch_size) {
          // This is a large deletion.  Let it pass in one chunk.
          patch.length1 += diff_text.length;
          start1 += diff_text.length;
          empty = false;
          patch.diffs.push([diff_type, diff_text]);
          bigpatch.diffs.shift();
        } else {
          // Deletion or equality.  Only take as much as we can stomach.
          diff_text = diff_text.substring(0,
              patch_size - patch.length1 - this.Patch_Margin);
          patch.length1 += diff_text.length;
          start1 += diff_text.length;
          if (diff_type === DIFF_EQUAL) {
            patch.length2 += diff_text.length;
            start2 += diff_text.length;
          } else {
            empty = false;
          }
          patch.diffs.push([diff_type, diff_text]);
          if (diff_text == bigpatch.diffs[0][1]) {
            bigpatch.diffs.shift();
          } else {
            bigpatch.diffs[0][1] =
                bigpatch.diffs[0][1].substring(diff_text.length);
          }
        }
      }
      // Compute the head context for the next patch.
      precontext = this.diff_text2(patch.diffs);
      precontext =
          precontext.substring(precontext.length - this.Patch_Margin);
      // Append the end context for this patch.
      var postcontext = this.diff_text1(bigpatch.diffs)
                            .substring(0, this.Patch_Margin);
      if (postcontext !== '') {
        patch.length1 += postcontext.length;
        patch.length2 += postcontext.length;
        if (patch.diffs.length !== 0 &&
            patch.diffs[patch.diffs.length - 1][0] === DIFF_EQUAL) {
          patch.diffs[patch.diffs.length - 1][1] += postcontext;
        } else {
          patch.diffs.push([DIFF_EQUAL, postcontext]);
        }
      }
      if (!empty) {
        patches.splice(++x, 0, patch);
      }
    }
  }
};


/**
 * Take a list of patches and return a textual representation.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {string} Text representation of patches.
 */
diff_match_patch.prototype.patch_toText = function(patches) {
  var text = [];
  for (var x = 0; x < patches.length; x++) {
    text[x] = patches[x];
  }
  return text.join('');
};


/**
 * Parse a textual representation of patches and return a list of Patch objects.
 * @param {string} textline Text representation of patches.
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 * @throws {!Error} If invalid input.
 */
diff_match_patch.prototype.patch_fromText = function(textline) {
  var patches = [];
  if (!textline) {
    return patches;
  }
  var text = textline.split('\n');
  var textPointer = 0;
  var patchHeader = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;
  while (textPointer < text.length) {
    var m = text[textPointer].match(patchHeader);
    if (!m) {
      throw new Error('Invalid patch string: ' + text[textPointer]);
    }
    var patch = new diff_match_patch.patch_obj();
    patches.push(patch);
    patch.start1 = parseInt(m[1], 10);
    if (m[2] === '') {
      patch.start1--;
      patch.length1 = 1;
    } else if (m[2] == '0') {
      patch.length1 = 0;
    } else {
      patch.start1--;
      patch.length1 = parseInt(m[2], 10);
    }

    patch.start2 = parseInt(m[3], 10);
    if (m[4] === '') {
      patch.start2--;
      patch.length2 = 1;
    } else if (m[4] == '0') {
      patch.length2 = 0;
    } else {
      patch.start2--;
      patch.length2 = parseInt(m[4], 10);
    }
    textPointer++;

    while (textPointer < text.length) {
      var sign = text[textPointer].charAt(0);
      try {
        var line = decodeURI(text[textPointer].substring(1));
      } catch (ex) {
        // Malformed URI sequence.
        throw new Error('Illegal escape in patch_fromText: ' + line);
      }
      if (sign == '-') {
        // Deletion.
        patch.diffs.push([DIFF_DELETE, line]);
      } else if (sign == '+') {
        // Insertion.
        patch.diffs.push([DIFF_INSERT, line]);
      } else if (sign == ' ') {
        // Minor equality.
        patch.diffs.push([DIFF_EQUAL, line]);
      } else if (sign == '@') {
        // Start of next patch.
        break;
      } else if (sign === '') {
        // Blank line?  Whatever.
      } else {
        // WTF?
        throw new Error('Invalid patch mode "' + sign + '" in: ' + line);
      }
      textPointer++;
    }
  }
  return patches;
};


/**
 * Class representing one patch operation.
 * @constructor
 */
diff_match_patch.patch_obj = function() {
  /** @type {!Array.<!diff_match_patch.Diff>} */
  this.diffs = [];
  /** @type {?number} */
  this.start1 = null;
  /** @type {?number} */
  this.start2 = null;
  /** @type {number} */
  this.length1 = 0;
  /** @type {number} */
  this.length2 = 0;
};


/**
 * Emmulate GNU diff's format.
 * Header: @@ -382,8 +481,9 @@
 * Indicies are printed as 1-based, not 0-based.
 * @return {string} The GNU diff string.
 */
diff_match_patch.patch_obj.prototype.toString = function() {
  var coords1, coords2;
  if (this.length1 === 0) {
    coords1 = this.start1 + ',0';
  } else if (this.length1 == 1) {
    coords1 = this.start1 + 1;
  } else {
    coords1 = (this.start1 + 1) + ',' + this.length1;
  }
  if (this.length2 === 0) {
    coords2 = this.start2 + ',0';
  } else if (this.length2 == 1) {
    coords2 = this.start2 + 1;
  } else {
    coords2 = (this.start2 + 1) + ',' + this.length2;
  }
  var text = ['@@ -' + coords1 + ' +' + coords2 + ' @@\n'];
  var op;
  // Escape the body of the patch with %xx notation.
  for (var x = 0; x < this.diffs.length; x++) {
    switch (this.diffs[x][0]) {
      case DIFF_INSERT:
        op = '+';
        break;
      case DIFF_DELETE:
        op = '-';
        break;
      case DIFF_EQUAL:
        op = ' ';
        break;
    }
    text[x + 1] = op + encodeURI(this.diffs[x][1]) + '\n';
  }
  return text.join('').replace(/%20/g, ' ');
};


// The following export code was added by @ForbesLindesay
module.exports = diff_match_patch;
module.exports['diff_match_patch'] = diff_match_patch;
module.exports['DIFF_DELETE'] = DIFF_DELETE;
module.exports['DIFF_INSERT'] = DIFF_INSERT;
module.exports['DIFF_EQUAL'] = DIFF_EQUAL;

},{}],31:[function(require,module,exports){
// https://html.spec.whatwg.org/multipage/infrastructure.html#document-base-url
module.exports = (function () {
  var baseURI = document.baseURI;

  if (!baseURI) {
    var baseEls = document.getElementsByTagName('base');
    for (var i = 0 ; i < baseEls.length ; i++) {
      if (!!baseEls[i].href) {
        baseURI = baseEls[i].href;
        break;
      }
    }
  }

  return (baseURI || document.documentURI);
})();

},{}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var FragmentAnchor = (function () {
  function FragmentAnchor(root, id) {
    _classCallCheck(this, FragmentAnchor);

    if (root === undefined) {
      throw new Error('missing required parameter "root"');
    }
    if (id === undefined) {
      throw new Error('missing required parameter "id"');
    }

    this.root = root;
    this.id = id;
  }

  _createClass(FragmentAnchor, [{
    key: 'toRange',
    value: function toRange() {
      var el = this.root.querySelector('#' + this.id);
      if (el == null) {
        throw new Error('no element found with id "' + this.id + '"');
      }

      var range = this.root.ownerDocument.createRange();
      range.selectNodeContents(el);

      return range;
    }
  }, {
    key: 'toSelector',
    value: function toSelector() {
      var el = this.root.querySelector('#' + this.id);
      if (el == null) {
        throw new Error('no element found with id "' + this.id + '"');
      }

      var conformsTo = 'https://tools.ietf.org/html/rfc3236';
      if (el instanceof SVGElement) {
        conformsTo = 'http://www.w3.org/TR/SVG/';
      }

      return {
        type: 'FragmentSelector',
        value: this.id,
        conformsTo: conformsTo
      };
    }
  }], [{
    key: 'fromRange',
    value: function fromRange(root, range) {
      if (root === undefined) {
        throw new Error('missing required parameter "root"');
      }
      if (range === undefined) {
        throw new Error('missing required parameter "range"');
      }

      var el = range.commonAncestorContainer;
      while (el != null && !el.id) {
        if (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
          el = el.parentElement;
        } else {
          throw new Error('no fragment identifier found');
        }
      }

      return new FragmentAnchor(root, el.id);
    }
  }, {
    key: 'fromSelector',
    value: function fromSelector(root) {
      var selector = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new FragmentAnchor(root, selector.value);
    }
  }]);

  return FragmentAnchor;
})();

exports['default'] = FragmentAnchor;
module.exports = exports['default'];

},{}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nodeIteratorShim = require('node-iterator-shim');

var _nodeIteratorShim2 = _interopRequireDefault(_nodeIteratorShim);

var _domSeek = require('dom-seek');

var _domSeek2 = _interopRequireDefault(_domSeek);

var SHOW_TEXT = NodeFilter.SHOW_TEXT;

function getFirstTextNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return node;
  var document = node.ownerDocument;
  var walker = document.createTreeWalker(node, SHOW_TEXT, null, false);
  return walker.firstChild();
}

var TextPositionAnchor = (function () {
  function TextPositionAnchor(root, start, end) {
    _classCallCheck(this, TextPositionAnchor);

    if (root === undefined) {
      throw new Error('missing required parameter "root"');
    }
    if (start === undefined) {
      throw new Error('missing required parameter "start"');
    }
    if (end === undefined) {
      throw new Error('missing required parameter "end"');
    }
    this.root = root;
    this.start = start;
    this.end = end;
  }

  _createClass(TextPositionAnchor, [{
    key: 'toRange',
    value: function toRange() {
      var root = this.root;
      var document = root.ownerDocument;
      var range = document.createRange();
      var iter = (0, _nodeIteratorShim2['default'])(root, SHOW_TEXT);

      var start = this.start;
      var end = this.end;

      var count = (0, _domSeek2['default'])(iter, start);
      var remainder = start - count;

      if (iter.pointerBeforeReferenceNode) {
        range.setStart(iter.referenceNode, remainder);
      } else {
        // If the iterator advanced it will be left with its pointer after the
        // reference node. The next node that is needed to create the range.
        range.setStart(iter.nextNode(), remainder);
        iter.previousNode(); // Rewind so as not to change the next result.
      }

      var length = end - start + remainder;
      count = (0, _domSeek2['default'])(iter, length);
      remainder = length - count;

      if (iter.pointerBeforeReferenceNode) {
        range.setEnd(iter.referenceNode, remainder);
      } else {
        // Same as above, but no need to rewind.
        range.setEnd(iter.nextNode(), remainder);
      }

      return range;
    }
  }, {
    key: 'toSelector',
    value: function toSelector() {
      return {
        type: 'TextPositionSelector',
        start: this.start,
        end: this.end
      };
    }
  }], [{
    key: 'fromRange',
    value: function fromRange(root, range) {
      if (root === undefined) {
        throw new Error('missing required parameter "root"');
      }
      if (range === undefined) {
        throw new Error('missing required parameter "range"');
      }

      var startNode = range.startContainer;
      var startOffset = range.startOffset;

      // Drill down to a text node if the range starts at the container boundary.
      if (startNode.nodeType !== Node.TEXT_NODE) {
        if (startOffset === startNode.childNodes.length) {
          startNode = startNode.childNodes[startOffset - 1];
          startNode = getFirstTextNode(startNode);
          startOffset = startNode.textContent.length;
        } else {
          startNode = startNode.childNodes[startOffset];
          startNode = getFirstTextNode(startNode);
          startOffset = 0;
        }
      }

      var endNode = range.endContainer;
      var endOffset = range.endOffset;

      // Drill down to a text node if the range ends at the container boundary.
      if (endNode.nodeType !== Node.TEXT_NODE) {
        if (endOffset === endNode.childNodes.length) {
          endNode = endNode.childNodes[endOffset - 1];
          endNode = getFirstTextNode(endNode);
          endOffset = endNode.textContent.length;
        } else {
          endNode = endNode.childNodes[endOffset];
          endNode = getFirstTextNode(endNode);
          endOffset = 0;
        }
      }

      var iter = (0, _nodeIteratorShim2['default'])(root, SHOW_TEXT);
      var start = (0, _domSeek2['default'])(iter, startNode);
      var end = start + (0, _domSeek2['default'])(iter, endNode);

      return new TextPositionAnchor(root, start + startOffset, end + endOffset);
    }
  }, {
    key: 'fromSelector',
    value: function fromSelector(root) {
      var selector = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new TextPositionAnchor(root, selector.start, selector.end);
    }
  }]);

  return TextPositionAnchor;
})();

exports['default'] = TextPositionAnchor;
module.exports = exports['default'];

},{"dom-seek":35,"node-iterator-shim":38}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _diffMatchPatch = require('diff-match-patch');

var _diffMatchPatch2 = _interopRequireDefault(_diffMatchPatch);

var _domAnchorTextPosition = require('dom-anchor-text-position');

var _domAnchorTextPosition2 = _interopRequireDefault(_domAnchorTextPosition);

// The DiffMatchPatch bitap has a hard 32-character pattern length limit.
var CONTEXT_LENGTH = 32;

var TextQuoteAnchor = (function () {
  function TextQuoteAnchor(root, exact) {
    var context = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, TextQuoteAnchor);

    if (root === undefined) {
      throw new Error('missing required parameter "root"');
    }
    if (exact === undefined) {
      throw new Error('missing required parameter "exact"');
    }
    this.root = root;
    this.exact = exact;
    this.prefix = context.prefix;
    this.suffix = context.suffix;
  }

  _createClass(TextQuoteAnchor, [{
    key: 'toRange',
    value: function toRange(options) {
      return this.toPositionAnchor(options).toRange();
    }
  }, {
    key: 'toSelector',
    value: function toSelector() {
      var selector = {
        type: 'TextQuoteSelector',
        exact: this.exact
      };
      if (this.prefix !== undefined) selector.prefix = this.prefix;
      if (this.suffix !== undefined) selector.suffix = this.suffix;
      return selector;
    }
  }, {
    key: 'toPositionAnchor',
    value: function toPositionAnchor() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var hint = options.hint;

      var root = this.root;
      var dmp = new _diffMatchPatch2['default']();

      dmp.Match_Distance = root.textContent.length * 2;

      // Work around a hard limit of the DiffMatchPatch bitap implementation.
      // The search pattern must be no more than 32 characters.
      var slices = this.exact.match(/(.|[\r\n]){1,32}/g);
      var loc = hint === undefined ? root.textContent.length / 2 | 0 : hint;
      var start = Number.POSITIVE_INFINITY;
      var end = Number.NEGATIVE_INFINITY;
      var result = -1;

      // If the prefix is known then search for that first.
      if (this.prefix !== undefined) {
        result = dmp.match_main(root.textContent, this.prefix, loc);
        if (result > -1) loc = result + this.prefix.length;
      }

      // Search for the first slice.
      var firstSlice = slices.shift();
      result = dmp.match_main(root.textContent, firstSlice, loc);
      if (result > -1) {
        start = result;
        loc = end = start + firstSlice.length;
      } else {
        throw new Error('no match found');
      }

      // Create a fold function that will reduce slices to positional extents.
      var foldSlices = function foldSlices(acc, slice) {
        var result = dmp.match_main(root.textContent, slice, acc.loc);
        if (result === -1) {
          throw new Error('no match found');
        }

        // The next slice should follow this one closely.
        acc.loc = result + slice.length;

        // Expand the start and end to a quote that includes all the slices.
        acc.start = Math.min(acc.start, result);
        acc.end = Math.max(acc.end, result + slice.length);

        return acc;
      };

      // Use the fold function to establish the full quote extents.
      // Expect the slices to be close to one another.
      // This distance is deliberately generous for now.
      dmp.Match_Distance = 64;
      var acc = slices.reduce(foldSlices, {
        start: start,
        end: end,
        loc: loc
      });

      return new _domAnchorTextPosition2['default'](root, acc.start, acc.end);
    }
  }], [{
    key: 'fromRange',
    value: function fromRange(root, range) {
      if (range === undefined) {
        throw new Error('missing required parameter "range"');
      }

      var position = _domAnchorTextPosition2['default'].fromRange(root, range);
      return this.fromPositionAnchor(position);
    }
  }, {
    key: 'fromSelector',
    value: function fromSelector(root) {
      var selector = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new TextQuoteAnchor(root, selector.exact, selector);
    }
  }, {
    key: 'fromPositionAnchor',
    value: function fromPositionAnchor(anchor) {
      var root = anchor.root;

      var start = anchor.start;
      var end = anchor.end;

      var exact = root.textContent.substr(start, end - start);

      var prefixStart = Math.max(0, start - CONTEXT_LENGTH);
      var prefix = root.textContent.substr(prefixStart, start - prefixStart);

      var suffixEnd = Math.min(root.textContent.length, end + CONTEXT_LENGTH);
      var suffix = root.textContent.substr(end, suffixEnd - end);

      return new TextQuoteAnchor(root, exact, { prefix: prefix, suffix: suffix });
    }
  }]);

  return TextQuoteAnchor;
})();

exports['default'] = TextQuoteAnchor;
module.exports = exports['default'];

},{"diff-match-patch":30,"dom-anchor-text-position":33}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = seek;
var E_SHOW = 'Argument 1 of seek must use filter NodeFilter.SHOW_TEXT.';
var E_WHERE = 'Argument 2 of seek must be a number or a Text Node.';

function seek(iter, where) {
  if (iter.whatToShow !== NodeFilter.SHOW_TEXT) {
    throw new Error(E_SHOW);
  }

  var count = 0;
  var node = iter.referenceNode;
  var predicates = null;

  if (isNumber(where)) {
    predicates = {
      forward: function forward() {
        return count < where;
      },
      backward: function backward() {
        return count > where;
      }
    };
  } else if (isText(where)) {
    predicates = {
      forward: function forward() {
        return before(node, where);
      },
      backward: function backward() {
        return !iter.pointerBeforeReferenceNode || after(node, where);
      }
    };
  } else {
    throw new Error(E_WHERE);
  }

  while (predicates.forward() && (node = iter.nextNode()) !== null) {
    count += node.textContent.length;
  }

  while (predicates.backward() && (node = iter.previousNode()) !== null) {
    count -= node.textContent.length;
  }

  return count;
}

function isNumber(n) {
  return !isNaN(parseInt(n)) && isFinite(n);
}

function isText(node) {
  return node.nodeType === Node.TEXT_NODE;
}

function before(ref, node) {
  return node.compareDocumentPosition(ref) & Node.DOCUMENT_POSITION_PRECEDING;
}

function after(ref, node) {
  return node.compareDocumentPosition(ref) & Node.DOCUMENT_POSITION_FOLLOWING;
}
module.exports = exports['default'];

},{}],36:[function(require,module,exports){
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


},{}],37:[function(require,module,exports){
(function (global){
; var __browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
/*! Hammer.JS - v2.0.6 - 2015-12-23
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2015 Jorik Tangelder;
 * Licensed under the  license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean=false} [merge]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.allow = true; // used by Input.TouchMouse to disable mouse events
    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down, and mouse events are allowed (see the TouchMouse input)
        if (!this.pressed || !this.allow) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */
function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        // when we're in a touch event, so  block all upcoming mouse events
        // most mobile browser also emit mouseevents, right after touchstart
        if (isTouch) {
            this.mouse.allow = false;
        } else if (isMouse && !this.mouse.allow) {
            return;
        }

        // reset the allowMouse when we're done
        if (inputEvent & (INPUT_END | INPUT_CANCEL)) {
            this.mouse.allow = true;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        // not needed with native support for the touchAction property
        if (NATIVE_TOUCH_ACTION) {
            return;
        }

        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE);
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.6';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    each(manager.options.cssProps, function(value, name) {
        element.style[prefixed(element.style, name)] = add ? value : '';
    });
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (typeof define === 'function' && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');

; browserify_shim__define__module__export__(typeof Hammer != "undefined" ? Hammer : window.Hammer);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof self !== "undefined" ? self : window)

},{}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createNodeIterator;

function createNodeIterator(root, whatToShow) {
  var filter = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var document = root.ownerDocument;
  var iter = document.createNodeIterator(root, whatToShow, filter, false);
  return typeof iter.referenceNode === 'undefined' ? shim(iter, root) : iter;
}

function shim(iter, root) {
  var _referenceNode = root;
  var _pointerBeforeReferenceNode = true;

  return Object.create(NodeIterator.prototype, {
    root: {
      get: function get() {
        return iter.root;
      }
    },

    whatToShow: {
      get: function get() {
        return iter.whatToShow;
      }
    },

    filter: {
      get: function get() {
        return iter.filter;
      }
    },

    referenceNode: {
      get: function get() {
        return _referenceNode;
      }
    },

    pointerBeforeReferenceNode: {
      get: function get() {
        return _pointerBeforeReferenceNode;
      }
    },

    detach: {
      get: function get() {
        return iter.detach;
      }
    },

    nextNode: {
      value: function value() {
        var result = iter.nextNode();
        _pointerBeforeReferenceNode = false;
        if (result === null) {
          return null;
        } else {
          _referenceNode = result;
          return _referenceNode;
        }
      }
    },

    previousNode: {
      value: function value() {
        var result = iter.previousNode();
        _pointerBeforeReferenceNode = true;
        if (result === null) {
          return null;
        } else {
          _referenceNode = result;
          return _referenceNode;
        }
      }
    }
  });
}
module.exports = exports['default'];

},{}],39:[function(require,module,exports){
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

},{"_process":40}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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

},{"performance-now":39}],42:[function(require,module,exports){
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
},{"raf":41}],43:[function(require,module,exports){
module.exports = require("./zen-observable.js").Observable;

},{"./zen-observable.js":44}],44:[function(require,module,exports){
'use strict'; (function(fn, name) { if (typeof exports !== 'undefined') fn(exports, module); else if (typeof self !== 'undefined') fn(name === '*' ? self : (name ? self[name] = {} : {})); })(function(exports, module) { // === Symbol Support ===

function hasSymbol(name) {

    return typeof Symbol === "function" && Boolean(Symbol[name]);
}

function getSymbol(name) {

    return hasSymbol(name) ? Symbol[name] : "@@" + name;
}

// === Abstract Operations ===

function getMethod(obj, key) {

    var value = obj[key];

    if (value == null)
        return undefined;

    if (typeof value !== "function")
        throw new TypeError(value + " is not a function");

    return value;
}

function getSpecies(ctor) {

    var symbol = getSymbol("species");
    return symbol ? ctor[symbol] : ctor;
}

function addMethods(target, methods) {

    Object.keys(methods).forEach(function(k) {

        var desc = Object.getOwnPropertyDescriptor(methods, k);
        desc.enumerable = false;
        Object.defineProperty(target, k, desc);
    });
}

function cleanupSubscription(subscription) {

    // Assert:  observer._observer is undefined

    var cleanup = subscription._cleanup;

    if (!cleanup)
        return;

    // Drop the reference to the cleanup function so that we won't call it
    // more than once
    subscription._cleanup = undefined;

    // Call the cleanup function
    cleanup();
}

function subscriptionClosed(subscription) {

    return subscription._observer === undefined;
}

function closeSubscription(subscription) {

    if (subscriptionClosed(subscription))
        return;

    subscription._observer = undefined;
    cleanupSubscription(subscription);
}

function cleanupFromSubscription(subscription) {
    return function(_) { subscription.unsubscribe() };
}

function Subscription(observer, subscriber) {

    // Assert: subscriber is callable

    // The observer must be an object
    if (Object(observer) !== observer)
        throw new TypeError("Observer must be an object");

    this._cleanup = undefined;
    this._observer = observer;

    var start = getMethod(observer, "start");

    if (start)
        start.call(observer, this);

    if (subscriptionClosed(this))
        return;

    observer = new SubscriptionObserver(this);

    try {

        // Call the subscriber function
        var cleanup$0 = subscriber.call(undefined, observer);

        // The return value must be undefined, null, a subscription object, or a function
        if (cleanup$0 != null) {

            if (typeof cleanup$0.unsubscribe === "function")
                cleanup$0 = cleanupFromSubscription(cleanup$0);
            else if (typeof cleanup$0 !== "function")
                throw new TypeError(cleanup$0 + " is not a function");

            this._cleanup = cleanup$0;
        }

    } catch (e) {

        // If an error occurs during startup, then attempt to send the error
        // to the observer
        observer.error(e);
        return;
    }

    // If the stream is already finished, then perform cleanup
    if (subscriptionClosed(this))
        cleanupSubscription(this);
}

addMethods(Subscription.prototype = {}, {
    get closed() { return subscriptionClosed(this) },
    unsubscribe: function() { closeSubscription(this) },
});

function SubscriptionObserver(subscription) {
    this._subscription = subscription;
}

addMethods(SubscriptionObserver.prototype = {}, {

    get closed() { return subscriptionClosed(this._subscription) },

    next: function(value) {

        var subscription = this._subscription;

        // If the stream if closed, then return undefined
        if (subscriptionClosed(subscription))
            return undefined;

        var observer = subscription._observer;

        try {

            var m$0 = getMethod(observer, "next");

            // If the observer doesn't support "next", then return undefined
            if (!m$0)
                return undefined;

            // Send the next value to the sink
            return m$0.call(observer, value);

        } catch (e) {

            // If the observer throws, then close the stream and rethrow the error
            try { closeSubscription(subscription) }
            finally { throw e }
        }
    },

    error: function(value) {

        var subscription = this._subscription;

        // If the stream is closed, throw the error to the caller
        if (subscriptionClosed(subscription))
            throw value;

        var observer = subscription._observer;
        subscription._observer = undefined;

        try {

            var m$1 = getMethod(observer, "error");

            // If the sink does not support "error", then throw the error to the caller
            if (!m$1)
                throw value;

            value = m$1.call(observer, value);

        } catch (e) {

            try { cleanupSubscription(subscription) }
            finally { throw e }
        }

        cleanupSubscription(subscription);
        return value;
    },

    complete: function(value) {

        var subscription = this._subscription;

        // If the stream is closed, then return undefined
        if (subscriptionClosed(subscription))
            return undefined;

        var observer = subscription._observer;
        subscription._observer = undefined;

        try {

            var m$2 = getMethod(observer, "complete");

            // If the sink does not support "complete", then return undefined
            value = m$2 ? m$2.call(observer, value) : undefined;

        } catch (e) {

            try { cleanupSubscription(subscription) }
            finally { throw e }
        }

        cleanupSubscription(subscription);
        return value;
    },

});

function Observable(subscriber) {

    // The stream subscriber must be a function
    if (typeof subscriber !== "function")
        throw new TypeError("Observable initializer must be a function");

    this._subscriber = subscriber;
}

addMethods(Observable.prototype, {

    subscribe: function(observer) { for (var args = [], __$0 = 1; __$0 < arguments.length; ++__$0) args.push(arguments[__$0]); 

        if (typeof observer === 'function') {

            observer = {
                next: observer,
                error: args[0],
                complete: args[1],
            };
        }

        return new Subscription(observer, this._subscriber);
    },

    forEach: function(fn) { var __this = this; 

        return new Promise(function(resolve, reject) {

            if (typeof fn !== "function")
                return Promise.reject(new TypeError(fn + " is not a function"));

            __this.subscribe({

                _subscription: null,

                start: function(subscription) {

                    if (Object(subscription) !== subscription)
                        throw new TypeError(subscription + " is not an object");

                    this._subscription = subscription;
                },

                next: function(value) {

                    var subscription = this._subscription;

                    if (subscription.closed)
                        return;

                    try {

                        return fn(value);

                    } catch (err) {

                        reject(err);
                        subscription.unsubscribe();
                    }
                },

                error: reject,
                complete: resolve,
            });

        });
    },

    map: function(fn) { var __this = this; 

        if (typeof fn !== "function")
            throw new TypeError(fn + " is not a function");

        var C = getSpecies(this.constructor);

        return new C(function(observer) { return __this.subscribe({

            next: function(value) {

                if (observer.closed)
                    return;

                try { value = fn(value) }
                catch (e) { return observer.error(e) }

                return observer.next(value);
            },

            error: function(e) { return observer.error(e) },
            complete: function(x) { return observer.complete(x) },
        }); });
    },

    filter: function(fn) { var __this = this; 

        if (typeof fn !== "function")
            throw new TypeError(fn + " is not a function");

        var C = getSpecies(this.constructor);

        return new C(function(observer) { return __this.subscribe({

            next: function(value) {

                if (observer.closed)
                    return;

                try { if (!fn(value)) return undefined }
                catch (e) { return observer.error(e) }

                return observer.next(value);
            },

            error: function(e) { return observer.error(e) },
            complete: function() { return observer.complete() },
        }); });
    },

    reduce: function(fn) { var __this = this; 

        if (typeof fn !== "function")
            throw new TypeError(fn + " is not a function");

        var C = getSpecies(this.constructor),
            hasSeed = arguments.length > 1,
            hasValue = false,
            seed = arguments[1],
            acc = seed;

        return new C(function(observer) { return __this.subscribe({

            next: function(value) {

                if (observer.closed)
                    return;

                var first = !hasValue;
                hasValue = true;

                if (!first || hasSeed) {

                    try { acc = fn(acc, value) }
                    catch (e) { return observer.error(e) }

                } else {

                    acc = value;
                }
            },

            error: function(e) { return observer.error(e) },

            complete: function() {

                if (!hasValue && !hasSeed) {
                    observer.error(new TypeError("Cannot reduce an empty sequence"));
                    return;
                }

                observer.next(acc);
                observer.complete();
            },

        }); });
    },

    flatMap: function(fn) { var __this = this; 

        if (typeof fn !== "function")
            throw new TypeError(fn + " is not a function");

        var C = getSpecies(this.constructor);

        return new C(function(observer) {

            var completed = false,
                subscriptions = [];

            // Subscribe to the outer Observable
            var outer = __this.subscribe({

                next: function(value) {

                    if (fn) {

                        try {

                            value = fn(value);

                        } catch (x) {

                            observer.error(x);
                            return;
                        }
                    }

                    // Subscribe to the inner Observable
                    Observable.from(value).subscribe({

                        _subscription: null,

                        start: function(s) { subscriptions.push(this._subscription = s) },
                        next: function(value) { observer.next(value) },
                        error: function(e) { observer.error(e) },

                        complete: function() {

                            var i = subscriptions.indexOf(this._subscription);

                            if (i >= 0)
                                subscriptions.splice(i, 1);

                            closeIfDone();
                        }
                    });
                },

                error: function(e) {

                    return observer.error(e);
                },

                complete: function() {

                    completed = true;
                    closeIfDone();
                }
            });

            function closeIfDone() {

                if (completed && subscriptions.length === 0)
                    observer.complete();
            }

            return function(_) {

                subscriptions.forEach(function(s) { return s.unsubscribe(); });
                outer.unsubscribe();
            };
        });
    }

});

Object.defineProperty(Observable.prototype, getSymbol("observable"), {
    value: function() { return this },
    writable: true,
    configurable: true,
});

addMethods(Observable, {

    from: function(x) {

        var C = typeof this === "function" ? this : Observable;

        if (x == null)
            throw new TypeError(x + " is not an object");

        var method = getMethod(x, getSymbol("observable"));

        if (method) {

            var observable$0 = method.call(x);

            if (Object(observable$0) !== observable$0)
                throw new TypeError(observable$0 + " is not an object");

            if (observable$0.constructor === C)
                return observable$0;

            return new C(function(observer) { return observable$0.subscribe(observer); });
        }

        if (hasSymbol("iterator") && (method = getMethod(x, getSymbol("iterator")))) {

            return new C(function(observer) {

                for (var __$0 = (method.call(x))[Symbol.iterator](), __$1; __$1 = __$0.next(), !__$1.done;) { var item$0 = __$1.value; 

                    observer.next(item$0);

                    if (observer.closed)
                        return;
                }

                observer.complete();
            });
        }

        if (Array.isArray(x)) {

            return new C(function(observer) {

                for (var i$0 = 0; i$0 < x.length; ++i$0) {

                    observer.next(x[i$0]);

                    if (observer.closed)
                        return;
                }

                observer.complete();
            });
        }

        throw new TypeError(x + " is not observable");
    },

    of: function() { for (var items = [], __$0 = 0; __$0 < arguments.length; ++__$0) items.push(arguments[__$0]); 

        var C = typeof this === "function" ? this : Observable;

        return new C(function(observer) {

            for (var i$1 = 0; i$1 < items.length; ++i$1) {

                observer.next(items[i$1]);

                if (observer.closed)
                    return;
            }

            observer.complete();
        });
    },

});

Object.defineProperty(Observable, getSymbol("species"), {
    get: function() { return this },
    configurable: true,
});

exports.Observable = Observable;


}, "*");
},{}]},{},[11])
//# sourceMappingURL=injector.bundle.js.map
