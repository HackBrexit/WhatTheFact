require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){function h(a){return function(){return this[a]}}function l(a){return function(){return a}}var m=this;
function aa(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function n(a){return"string"==typeof a}function ba(a,b,c){return a.call.apply(a.bind,arguments)}function da(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}
function q(a,b,c){q=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ba:da;return q.apply(null,arguments)}function ea(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b)}}
function r(a){var b=t;function c(){}c.prototype=b.prototype;a.u=b.prototype;a.prototype=new c;a.t=function(a,c,f){for(var g=Array(arguments.length-2),k=2;k<arguments.length;k++)g[k-2]=arguments[k];return b.prototype[c].apply(a,g)}}Function.prototype.bind=Function.prototype.bind||function(a,b){if(1<arguments.length){var c=Array.prototype.slice.call(arguments,1);c.unshift(this,a);return q.apply(null,c)}return q(this,a)};/*

 Copyright 2014 Software Freedom Conservancy

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
function u(a,b,c){this.a=a;this.b=b||1;this.d=c||1};var fa=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};function v(a,b){return-1!=a.indexOf(b)}function ga(a,b){return a<b?-1:a>b?1:0};var w=Array.prototype,ha=w.indexOf?function(a,b,c){return w.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(n(a))return n(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},x=w.forEach?function(a,b,c){w.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=n(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},ia=w.filter?function(a,b,c){return w.filter.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=[],f=0,g=n(a)?
a.split(""):a,k=0;k<d;k++)if(k in g){var p=g[k];b.call(c,p,k,a)&&(e[f++]=p)}return e},z=w.reduce?function(a,b,c,d){d&&(b=q(b,d));return w.reduce.call(a,b,c)}:function(a,b,c,d){var e=c;x(a,function(c,g){e=b.call(d,e,c,g,a)});return e},ja=w.some?function(a,b,c){return w.some.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=n(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return!0;return!1};
function ka(a,b){var c;a:{c=a.length;for(var d=n(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){c=e;break a}c=-1}return 0>c?null:n(a)?a.charAt(c):a[c]}function la(a){return w.concat.apply(w,arguments)}function ma(a,b,c){return 2>=arguments.length?w.slice.call(a,b):w.slice.call(a,b,c)};function na(a){var b=arguments.length;if(1==b&&"array"==aa(arguments[0]))return na.apply(null,arguments[0]);for(var c={},d=0;d<b;d++)c[arguments[d]]=!0;return c};var A;a:{var oa=m.navigator;if(oa){var pa=oa.userAgent;if(pa){A=pa;break a}}A=""};function B(){return v(A,"Edge")};var qa=v(A,"Opera")||v(A,"OPR"),C=v(A,"Edge")||v(A,"Trident")||v(A,"MSIE"),ra=v(A,"Gecko")&&!(v(A.toLowerCase(),"webkit")&&!B())&&!(v(A,"Trident")||v(A,"MSIE"))&&!B(),sa=v(A.toLowerCase(),"webkit")&&!B();function ta(){var a=A;if(ra)return/rv\:([^\);]+)(\)|;)/.exec(a);if(C&&B())return/Edge\/([\d\.]+)/.exec(a);if(C)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(sa)return/WebKit\/(\S+)/.exec(a)}function ua(){var a=m.document;return a?a.documentMode:void 0}
var va=function(){if(qa&&m.opera){var a=m.opera.version;return"function"==aa(a)?a():a}var a="",b=ta();b&&(a=b?b[1]:"");return C&&!B()&&(b=ua(),b>parseFloat(a))?String(b):a}(),wa={};
function xa(a){if(!wa[a]){for(var b=0,c=fa(String(va)).split("."),d=fa(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",k=d[f]||"",p=RegExp("(\\d*)(\\D*)","g"),y=RegExp("(\\d*)(\\D*)","g");do{var F=p.exec(g)||["","",""],ca=y.exec(k)||["","",""];if(0==F[0].length&&0==ca[0].length)break;b=ga(0==F[1].length?0:parseInt(F[1],10),0==ca[1].length?0:parseInt(ca[1],10))||ga(0==F[2].length,0==ca[2].length)||ga(F[2],ca[2])}while(0==b)}wa[a]=0<=b}}
function ya(a){return C&&(B()||za>=a)}var Aa=m.document,Ba=ua(),za=!Aa||!C||!Ba&&B()?void 0:Ba||("CSS1Compat"==Aa.compatMode?parseInt(va,10):5);/*

 Copyright 2014 Software Freedom Conservancy

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
var D=C&&!ya(9),Ca=C&&!ya(8);/*

 Copyright 2014 Software Freedom Conservancy

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
function E(a,b,c,d){this.a=a;this.nodeName=c;this.nodeValue=d;this.nodeType=2;this.parentNode=this.ownerElement=b}function Da(a,b){var c=Ca&&"href"==b.nodeName?a.getAttribute(b.nodeName,2):b.nodeValue;return new E(b,a,b.nodeName,c)};/*

 Copyright 2014 Software Freedom Conservancy

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
function Ea(a){this.b=a;this.a=0}function Fa(a){a=a.match(Ga);for(var b=0;b<a.length;b++)Ha.test(a[b])&&a.splice(b,1);return new Ea(a)}var Ga=RegExp("\\$?(?:(?![0-9-])[\\w-]+:)?(?![0-9-])[\\w-]+|\\/\\/|\\.\\.|::|\\d+(?:\\.\\d*)?|\\.\\d+|\"[^\"]*\"|'[^']*'|[!<>]=|\\s+|.","g"),Ha=/^\s/;function G(a,b){return a.b[a.a+(b||0)]}function H(a){return a.b[a.a++]}function Ia(a){return a.b.length<=a.a};na("area base br col command embed hr img input keygen link meta param source track wbr".split(" "));!ra&&!C||C&&ya(9)||ra&&xa("1.9.1");C&&xa("9");function Ja(a,b){if(a.contains&&1==b.nodeType)return a==b||a.contains(b);if("undefined"!=typeof a.compareDocumentPosition)return a==b||Boolean(a.compareDocumentPosition(b)&16);for(;b&&a!=b;)b=b.parentNode;return b==a}
function Ka(a,b){if(a==b)return 0;if(a.compareDocumentPosition)return a.compareDocumentPosition(b)&2?1:-1;if(C&&!ya(9)){if(9==a.nodeType)return-1;if(9==b.nodeType)return 1}if("sourceIndex"in a||a.parentNode&&"sourceIndex"in a.parentNode){var c=1==a.nodeType,d=1==b.nodeType;if(c&&d)return a.sourceIndex-b.sourceIndex;var e=a.parentNode,f=b.parentNode;return e==f?La(a,b):!c&&Ja(e,b)?-1*Ma(a,b):!d&&Ja(f,a)?Ma(b,a):(c?a.sourceIndex:e.sourceIndex)-(d?b.sourceIndex:f.sourceIndex)}d=9==a.nodeType?a:a.ownerDocument||
a.document;c=d.createRange();c.selectNode(a);c.collapse(!0);d=d.createRange();d.selectNode(b);d.collapse(!0);return c.compareBoundaryPoints(m.Range.START_TO_END,d)}function Ma(a,b){var c=a.parentNode;if(c==b)return-1;for(var d=b;d.parentNode!=c;)d=d.parentNode;return La(d,a)}function La(a,b){for(var c=b;c=c.previousSibling;)if(c==a)return-1;return 1};/*

 Copyright 2014 Software Freedom Conservancy

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
function I(a){var b=null,c=a.nodeType;1==c&&(b=a.textContent,b=void 0==b||null==b?a.innerText:b,b=void 0==b||null==b?"":b);if("string"!=typeof b)if(D&&"title"==a.nodeName.toLowerCase()&&1==c)b=a.text;else if(9==c||1==c){a=9==c?a.documentElement:a.firstChild;for(var c=0,d=[],b="";a;){do 1!=a.nodeType&&(b+=a.nodeValue),D&&"title"==a.nodeName.toLowerCase()&&(b+=a.text),d[c++]=a;while(a=a.firstChild);for(;c&&!(a=d[--c].nextSibling););}}else b=a.nodeValue;return""+b}
function J(a,b,c){if(null===b)return!0;try{if(!a.getAttribute)return!1}catch(d){return!1}Ca&&"class"==b&&(b="className");return null==c?!!a.getAttribute(b):a.getAttribute(b,2)==c}function Na(a,b,c,d,e){return(D?Oa:Pa).call(null,a,b,n(c)?c:null,n(d)?d:null,e||new K)}
function Oa(a,b,c,d,e){if(a instanceof L||8==a.b||c&&null===a.b){var f=b.all;if(!f)return e;a=Qa(a);if("*"!=a&&(f=b.getElementsByTagName(a),!f))return e;if(c){for(var g=[],k=0;b=f[k++];)J(b,c,d)&&g.push(b);f=g}for(k=0;b=f[k++];)"*"==a&&"!"==b.tagName||M(e,b);return e}Ra(a,b,c,d,e);return e}
function Pa(a,b,c,d,e){b.getElementsByName&&d&&"name"==c&&!C?(b=b.getElementsByName(d),x(b,function(b){a.a(b)&&M(e,b)})):b.getElementsByClassName&&d&&"class"==c?(b=b.getElementsByClassName(d),x(b,function(b){b.className==d&&a.a(b)&&M(e,b)})):a instanceof N?Ra(a,b,c,d,e):b.getElementsByTagName&&(b=b.getElementsByTagName(a.d()),x(b,function(a){J(a,c,d)&&M(e,a)}));return e}
function Sa(a,b,c,d,e){var f;if((a instanceof L||8==a.b||c&&null===a.b)&&(f=b.childNodes)){var g=Qa(a);if("*"!=g&&(f=ia(f,function(a){return a.tagName&&a.tagName.toLowerCase()==g}),!f))return e;c&&(f=ia(f,function(a){return J(a,c,d)}));x(f,function(a){"*"==g&&("!"==a.tagName||"*"==g&&1!=a.nodeType)||M(e,a)});return e}return Ta(a,b,c,d,e)}function Ta(a,b,c,d,e){for(b=b.firstChild;b;b=b.nextSibling)J(b,c,d)&&a.a(b)&&M(e,b);return e}
function Ra(a,b,c,d,e){for(b=b.firstChild;b;b=b.nextSibling)J(b,c,d)&&a.a(b)&&M(e,b),Ra(a,b,c,d,e)}function Qa(a){if(a instanceof N){if(8==a.b)return"!";if(null===a.b)return"*"}return a.d()};/*

 Copyright 2014 Software Freedom Conservancy

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
function K(){this.b=this.a=null;this.i=0}function Ua(a){this.d=a;this.a=this.b=null}function Va(a,b){if(!a.a)return b;if(!b.a)return a;for(var c=a.a,d=b.a,e=null,f=null,g=0;c&&d;){var f=c.d,k=d.d;f==k||f instanceof E&&k instanceof E&&f.a==k.a?(f=c,c=c.a,d=d.a):0<Ka(c.d,d.d)?(f=d,d=d.a):(f=c,c=c.a);(f.b=e)?e.a=f:a.a=f;e=f;g++}for(f=c||d;f;)f.b=e,e=e.a=f,g++,f=f.a;a.b=e;a.i=g;return a}function Wa(a,b){var c=new Ua(b);c.a=a.a;a.b?a.a.b=c:a.a=a.b=c;a.a=c;a.i++}
function M(a,b){var c=new Ua(b);c.b=a.b;a.a?a.b.a=c:a.a=a.b=c;a.b=c;a.i++}function Xa(a){return(a=a.a)?a.d:null}function Ya(a){return(a=Xa(a))?I(a):""}function O(a,b){return new Za(a,!!b)}function Za(a,b){this.d=a;this.b=(this.c=b)?a.b:a.a;this.a=null}function P(a){var b=a.b;if(null==b)return null;var c=a.a=b;a.b=a.c?b.b:b.a;return c.d};/*

 Copyright 2014 Software Freedom Conservancy

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
function $a(a){switch(a.nodeType){case 1:return ea(ab,a);case 9:return $a(a.documentElement);case 11:case 10:case 6:case 12:return bb;default:return a.parentNode?$a(a.parentNode):bb}}function bb(){return null}function ab(a,b){if(a.prefix==b)return a.namespaceURI||"http://www.w3.org/1999/xhtml";var c=a.getAttributeNode("xmlns:"+b);return c&&c.specified?c.value||null:a.parentNode&&9!=a.parentNode.nodeType?ab(a.parentNode,b):null};/*

 Copyright 2014 Software Freedom Conservancy

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
/*

 Copyright 2014 Software Freedom Conservancy

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
function t(a){this.g=a;this.b=this.e=!1;this.d=null}function Q(a){return"\n  "+a.toString().split("\n").join("\n  ")}function cb(a,b){a.e=b}function db(a,b){a.b=b}function R(a,b){var c=a.a(b);return c instanceof K?+Ya(c):+c}function S(a,b){var c=a.a(b);return c instanceof K?Ya(c):""+c}function eb(a,b){var c=a.a(b);return c instanceof K?!!c.i:!!c};/*

 Copyright 2014 Software Freedom Conservancy

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
function fb(a,b,c){t.call(this,a.g);this.c=a;this.f=b;this.k=c;this.e=b.e||c.e;this.b=b.b||c.b;this.c==gb&&(c.b||c.e||4==c.g||0==c.g||!b.d?b.b||b.e||4==b.g||0==b.g||!c.d||(this.d={name:c.d.name,l:b}):this.d={name:b.d.name,l:c})}r(fb);
function hb(a,b,c,d,e){b=b.a(d);c=c.a(d);var f;if(b instanceof K&&c instanceof K){e=O(b);for(d=P(e);d;d=P(e))for(b=O(c),f=P(b);f;f=P(b))if(a(I(d),I(f)))return!0;return!1}if(b instanceof K||c instanceof K){b instanceof K?e=b:(e=c,c=b);e=O(e);b=typeof c;for(d=P(e);d;d=P(e)){switch(b){case "number":d=+I(d);break;case "boolean":d=!!I(d);break;case "string":d=I(d);break;default:throw Error("Illegal primitive type for comparison.");}if(a(d,c))return!0}return!1}return e?"boolean"==typeof b||"boolean"==typeof c?
a(!!b,!!c):"number"==typeof b||"number"==typeof c?a(+b,+c):a(b,c):a(+b,+c)}fb.prototype.a=function(a){return this.c.j(this.f,this.k,a)};fb.prototype.toString=function(){var a="Binary Expression: "+this.c,a=a+Q(this.f);return a+=Q(this.k)};function ib(a,b,c,d){this.a=a;this.p=b;this.g=c;this.j=d}ib.prototype.toString=h("a");var jb={};function T(a,b,c,d){if(jb.hasOwnProperty(a))throw Error("Binary operator already created: "+a);a=new ib(a,b,c,d);return jb[a.toString()]=a}
T("div",6,1,function(a,b,c){return R(a,c)/R(b,c)});T("mod",6,1,function(a,b,c){return R(a,c)%R(b,c)});T("*",6,1,function(a,b,c){return R(a,c)*R(b,c)});T("+",5,1,function(a,b,c){return R(a,c)+R(b,c)});T("-",5,1,function(a,b,c){return R(a,c)-R(b,c)});T("<",4,2,function(a,b,c){return hb(function(a,b){return a<b},a,b,c)});T(">",4,2,function(a,b,c){return hb(function(a,b){return a>b},a,b,c)});T("<=",4,2,function(a,b,c){return hb(function(a,b){return a<=b},a,b,c)});
T(">=",4,2,function(a,b,c){return hb(function(a,b){return a>=b},a,b,c)});var gb=T("=",3,2,function(a,b,c){return hb(function(a,b){return a==b},a,b,c,!0)});T("!=",3,2,function(a,b,c){return hb(function(a,b){return a!=b},a,b,c,!0)});T("and",2,2,function(a,b,c){return eb(a,c)&&eb(b,c)});T("or",1,2,function(a,b,c){return eb(a,c)||eb(b,c)});/*

 Copyright 2014 Software Freedom Conservancy

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
function kb(a,b){if(b.a.length&&4!=a.g)throw Error("Primary expression must evaluate to nodeset if filter has predicate(s).");t.call(this,a.g);this.c=a;this.f=b;this.e=a.e;this.b=a.b}r(kb);kb.prototype.a=function(a){a=this.c.a(a);return lb(this.f,a)};kb.prototype.toString=function(){var a;a="Filter:"+Q(this.c);return a+=Q(this.f)};/*

 Copyright 2014 Software Freedom Conservancy

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
function mb(a,b){if(b.length<a.o)throw Error("Function "+a.h+" expects at least"+a.o+" arguments, "+b.length+" given");if(null!==a.n&&b.length>a.n)throw Error("Function "+a.h+" expects at most "+a.n+" arguments, "+b.length+" given");a.s&&x(b,function(b,d){if(4!=b.g)throw Error("Argument "+d+" to function "+a.h+" is not of type Nodeset: "+b);});t.call(this,a.g);this.f=a;this.c=b;cb(this,a.e||ja(b,function(a){return a.e}));db(this,a.r&&!b.length||a.q&&!!b.length||ja(b,function(a){return a.b}))}r(mb);
mb.prototype.a=function(a){return this.f.j.apply(null,la(a,this.c))};mb.prototype.toString=function(){var a="Function: "+this.f;if(this.c.length)var b=z(this.c,function(a,b){return a+Q(b)},"Arguments:"),a=a+Q(b);return a};function nb(a,b,c,d,e,f,g,k,p){this.h=a;this.g=b;this.e=c;this.r=d;this.q=e;this.j=f;this.o=g;this.n=void 0!==k?k:g;this.s=!!p}nb.prototype.toString=h("h");var ob={};
function U(a,b,c,d,e,f,g,k){if(ob.hasOwnProperty(a))throw Error("Function already created: "+a+".");ob[a]=new nb(a,b,c,d,!1,e,f,g,k)}U("boolean",2,!1,!1,function(a,b){return eb(b,a)},1);U("ceiling",1,!1,!1,function(a,b){return Math.ceil(R(b,a))},1);U("concat",3,!1,!1,function(a,b){var c=ma(arguments,1);return z(c,function(b,c){return b+S(c,a)},"")},2,null);U("contains",2,!1,!1,function(a,b,c){return v(S(b,a),S(c,a))},2);U("count",1,!1,!1,function(a,b){return b.a(a).i},1,1,!0);
U("false",2,!1,!1,l(!1),0);U("floor",1,!1,!1,function(a,b){return Math.floor(R(b,a))},1);U("id",4,!1,!1,function(a,b){function c(a){if(D){var b=e.all[a];if(b){if(b.nodeType&&a==b.id)return b;if(b.length)return ka(b,function(b){return a==b.id})}return null}return e.getElementById(a)}var d=a.a,e=9==d.nodeType?d:d.ownerDocument,d=S(b,a).split(/\s+/),f=[];x(d,function(a){a=c(a);!a||0<=ha(f,a)||f.push(a)});f.sort(Ka);var g=new K;x(f,function(a){M(g,a)});return g},1);U("lang",2,!1,!1,l(!1),1);
U("last",1,!0,!1,function(a){if(1!=arguments.length)throw Error("Function last expects ()");return a.d},0);U("local-name",3,!1,!0,function(a,b){var c=b?Xa(b.a(a)):a.a;return c?c.localName||c.nodeName.toLowerCase():""},0,1,!0);U("name",3,!1,!0,function(a,b){var c=b?Xa(b.a(a)):a.a;return c?c.nodeName.toLowerCase():""},0,1,!0);U("namespace-uri",3,!0,!1,l(""),0,1,!0);U("normalize-space",3,!1,!0,function(a,b){return(b?S(b,a):I(a.a)).replace(/[\s\xa0]+/g," ").replace(/^\s+|\s+$/g,"")},0,1);
U("not",2,!1,!1,function(a,b){return!eb(b,a)},1);U("number",1,!1,!0,function(a,b){return b?R(b,a):+I(a.a)},0,1);U("position",1,!0,!1,function(a){return a.b},0);U("round",1,!1,!1,function(a,b){return Math.round(R(b,a))},1);U("starts-with",2,!1,!1,function(a,b,c){b=S(b,a);a=S(c,a);return 0==b.lastIndexOf(a,0)},2);U("string",3,!1,!0,function(a,b){return b?S(b,a):I(a.a)},0,1);U("string-length",1,!1,!0,function(a,b){return(b?S(b,a):I(a.a)).length},0,1);
U("substring",3,!1,!1,function(a,b,c,d){c=R(c,a);if(isNaN(c)||Infinity==c||-Infinity==c)return"";d=d?R(d,a):Infinity;if(isNaN(d)||-Infinity===d)return"";c=Math.round(c)-1;var e=Math.max(c,0);a=S(b,a);if(Infinity==d)return a.substring(e);b=Math.round(d);return a.substring(e,c+b)},2,3);U("substring-after",3,!1,!1,function(a,b,c){b=S(b,a);a=S(c,a);c=b.indexOf(a);return-1==c?"":b.substring(c+a.length)},2);
U("substring-before",3,!1,!1,function(a,b,c){b=S(b,a);a=S(c,a);a=b.indexOf(a);return-1==a?"":b.substring(0,a)},2);U("sum",1,!1,!1,function(a,b){for(var c=O(b.a(a)),d=0,e=P(c);e;e=P(c))d+=+I(e);return d},1,1,!0);U("translate",3,!1,!1,function(a,b,c,d){b=S(b,a);c=S(c,a);var e=S(d,a);a=[];for(d=0;d<c.length;d++){var f=c.charAt(d);f in a||(a[f]=e.charAt(d))}c="";for(d=0;d<b.length;d++)f=b.charAt(d),c+=f in a?a[f]:f;return c},3);U("true",2,!1,!1,l(!0),0);/*

 Copyright 2014 Software Freedom Conservancy

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
/*

 Copyright 2014 Software Freedom Conservancy

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
function N(a,b){this.f=a;this.c=void 0!==b?b:null;this.b=null;switch(a){case "comment":this.b=8;break;case "text":this.b=3;break;case "processing-instruction":this.b=7;break;case "node":break;default:throw Error("Unexpected argument");}}function pb(a){return"comment"==a||"text"==a||"processing-instruction"==a||"node"==a}N.prototype.a=function(a){return null===this.b||this.b==a.nodeType};N.prototype.d=h("f");N.prototype.toString=function(){var a="Kind Test: "+this.f;null===this.c||(a+=Q(this.c));return a};/*

 Copyright 2014 Software Freedom Conservancy

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
function qb(a){t.call(this,3);this.c=a.substring(1,a.length-1)}r(qb);qb.prototype.a=h("c");qb.prototype.toString=function(){return"Literal: "+this.c};/*

 Copyright 2014 Software Freedom Conservancy

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
function L(a,b){this.h=a.toLowerCase();this.c=b?b.toLowerCase():"http://www.w3.org/1999/xhtml"}L.prototype.a=function(a){var b=a.nodeType;return 1!=b&&2!=b?!1:"*"!=this.h&&this.h!=a.nodeName.toLowerCase()?!1:this.c==(a.namespaceURI?a.namespaceURI.toLowerCase():"http://www.w3.org/1999/xhtml")};L.prototype.d=h("h");L.prototype.toString=function(){return"Name Test: "+("http://www.w3.org/1999/xhtml"==this.c?"":this.c+":")+this.h};/*

 Copyright 2014 Software Freedom Conservancy

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
function rb(a){t.call(this,1);this.c=a}r(rb);rb.prototype.a=h("c");rb.prototype.toString=function(){return"Number: "+this.c};/*

 Copyright 2014 Software Freedom Conservancy

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
function sb(a,b){t.call(this,a.g);this.f=a;this.c=b;this.e=a.e;this.b=a.b;if(1==this.c.length){var c=this.c[0];c.m||c.c!=tb||(c=c.k,"*"!=c.d()&&(this.d={name:c.d(),l:null}))}}r(sb);function ub(){t.call(this,4)}r(ub);ub.prototype.a=function(a){var b=new K;a=a.a;9==a.nodeType?M(b,a):M(b,a.ownerDocument);return b};ub.prototype.toString=l("Root Helper Expression");function vb(){t.call(this,4)}r(vb);vb.prototype.a=function(a){var b=new K;M(b,a.a);return b};vb.prototype.toString=l("Context Helper Expression");
function wb(a){return"/"==a||"//"==a}sb.prototype.a=function(a){var b=this.f.a(a);if(!(b instanceof K))throw Error("Filter expression must evaluate to nodeset.");a=this.c;for(var c=0,d=a.length;c<d&&b.i;c++){var e=a[c],f=O(b,e.c.a),g;if(e.e||e.c!=xb)if(e.e||e.c!=yb)for(g=P(f),b=e.a(new u(g));null!=(g=P(f));)g=e.a(new u(g)),b=Va(b,g);else g=P(f),b=e.a(new u(g));else{for(g=P(f);(b=P(f))&&(!g.contains||g.contains(b))&&b.compareDocumentPosition(g)&8;g=b);b=e.a(new u(g))}}return b};
sb.prototype.toString=function(){var a;a="Path Expression:"+Q(this.f);if(this.c.length){var b=z(this.c,function(a,b){return a+Q(b)},"Steps:");a+=Q(b)}return a};/*

 Copyright 2014 Software Freedom Conservancy

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
function zb(a,b){this.a=a;this.b=!!b}
function lb(a,b,c){for(c=c||0;c<a.a.length;c++)for(var d=a.a[c],e=O(b),f=b.i,g,k=0;g=P(e);k++){var p=a.b?f-k:k+1;g=d.a(new u(g,p,f));if("number"==typeof g)p=p==g;else if("string"==typeof g||"boolean"==typeof g)p=!!g;else if(g instanceof K)p=0<g.i;else throw Error("Predicate.evaluate returned an unexpected type.");if(!p){p=e;g=p.d;var y=p.a;if(!y)throw Error("Next must be called at least once before remove.");var F=y.b,y=y.a;F?F.a=y:g.a=y;y?y.b=F:g.b=F;g.i--;p.a=null}}return b}
zb.prototype.toString=function(){return z(this.a,function(a,b){return a+Q(b)},"Predicates:")};/*

 Copyright 2014 Software Freedom Conservancy

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
function V(a,b,c,d){t.call(this,4);this.c=a;this.k=b;this.f=c||new zb([]);this.m=!!d;b=this.f;b=0<b.a.length?b.a[0].d:null;a.b&&b&&(a=b.name,a=D?a.toLowerCase():a,this.d={name:a,l:b.l});a:{a=this.f;for(b=0;b<a.a.length;b++)if(c=a.a[b],c.e||1==c.g||0==c.g){a=!0;break a}a=!1}this.e=a}r(V);
V.prototype.a=function(a){var b=a.a,c=null,c=this.d,d=null,e=null,f=0;c&&(d=c.name,e=c.l?S(c.l,a):null,f=1);if(this.m)if(this.e||this.c!=Ab)if(a=O((new V(Bb,new N("node"))).a(a)),b=P(a))for(c=this.j(b,d,e,f);null!=(b=P(a));)c=Va(c,this.j(b,d,e,f));else c=new K;else c=Na(this.k,b,d,e),c=lb(this.f,c,f);else c=this.j(a.a,d,e,f);return c};V.prototype.j=function(a,b,c,d){a=this.c.d(this.k,a,b,c);return a=lb(this.f,a,d)};
V.prototype.toString=function(){var a;a="Step:"+Q("Operator: "+(this.m?"//":"/"));this.c.h&&(a+=Q("Axis: "+this.c));a+=Q(this.k);if(this.f.a.length){var b=z(this.f.a,function(a,b){return a+Q(b)},"Predicates:");a+=Q(b)}return a};function Cb(a,b,c,d){this.h=a;this.d=b;this.a=c;this.b=d}Cb.prototype.toString=h("h");var Db={};function W(a,b,c,d){if(Db.hasOwnProperty(a))throw Error("Axis already created: "+a);b=new Cb(a,b,c,!!d);return Db[a]=b}
W("ancestor",function(a,b){for(var c=new K,d=b;d=d.parentNode;)a.a(d)&&Wa(c,d);return c},!0);W("ancestor-or-self",function(a,b){var c=new K,d=b;do a.a(d)&&Wa(c,d);while(d=d.parentNode);return c},!0);
var tb=W("attribute",function(a,b){var c=new K,d=a.d();if("style"==d&&b.style&&D)return M(c,new E(b.style,b,"style",b.style.cssText)),c;var e=b.attributes;if(e)if(a instanceof N&&null===a.b||"*"==d)for(var d=0,f;f=e[d];d++)D?f.nodeValue&&M(c,Da(b,f)):M(c,f);else(f=e.getNamedItem(d))&&(D?f.nodeValue&&M(c,Da(b,f)):M(c,f));return c},!1),Ab=W("child",function(a,b,c,d,e){return(D?Sa:Ta).call(null,a,b,n(c)?c:null,n(d)?d:null,e||new K)},!1,!0);W("descendant",Na,!1,!0);
var Bb=W("descendant-or-self",function(a,b,c,d){var e=new K;J(b,c,d)&&a.a(b)&&M(e,b);return Na(a,b,c,d,e)},!1,!0),xb=W("following",function(a,b,c,d){var e=new K;do for(var f=b;f=f.nextSibling;)J(f,c,d)&&a.a(f)&&M(e,f),e=Na(a,f,c,d,e);while(b=b.parentNode);return e},!1,!0);W("following-sibling",function(a,b){for(var c=new K,d=b;d=d.nextSibling;)a.a(d)&&M(c,d);return c},!1);W("namespace",function(){return new K},!1);
var Eb=W("parent",function(a,b){var c=new K;if(9==b.nodeType)return c;if(2==b.nodeType)return M(c,b.ownerElement),c;var d=b.parentNode;a.a(d)&&M(c,d);return c},!1),yb=W("preceding",function(a,b,c,d){var e=new K,f=[];do f.unshift(b);while(b=b.parentNode);for(var g=1,k=f.length;g<k;g++){var p=[];for(b=f[g];b=b.previousSibling;)p.unshift(b);for(var y=0,F=p.length;y<F;y++)b=p[y],J(b,c,d)&&a.a(b)&&M(e,b),e=Na(a,b,c,d,e)}return e},!0,!0);
W("preceding-sibling",function(a,b){for(var c=new K,d=b;d=d.previousSibling;)a.a(d)&&Wa(c,d);return c},!0);var Fb=W("self",function(a,b){var c=new K;a.a(b)&&M(c,b);return c},!1);/*

 Copyright 2014 Software Freedom Conservancy

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
function Gb(a){t.call(this,1);this.c=a;this.e=a.e;this.b=a.b}r(Gb);Gb.prototype.a=function(a){return-R(this.c,a)};Gb.prototype.toString=function(){return"Unary Expression: -"+Q(this.c)};/*

 Copyright 2014 Software Freedom Conservancy

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
function Hb(a){t.call(this,4);this.c=a;cb(this,ja(this.c,function(a){return a.e}));db(this,ja(this.c,function(a){return a.b}))}r(Hb);Hb.prototype.a=function(a){var b=new K;x(this.c,function(c){c=c.a(a);if(!(c instanceof K))throw Error("Path expression must evaluate to NodeSet.");b=Va(b,c)});return b};Hb.prototype.toString=function(){return z(this.c,function(a,b){return a+Q(b)},"Union Expression:")};/*

 Copyright 2014 Software Freedom Conservancy

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
function Ib(a,b){this.a=a;this.b=b}function Jb(a){for(var b,c=[];;){X(a,"Missing right hand side of binary expression.");b=Kb(a);var d=H(a.a);if(!d)break;var e=(d=jb[d]||null)&&d.p;if(!e){a.a.a--;break}for(;c.length&&e<=c[c.length-1].p;)b=new fb(c.pop(),c.pop(),b);c.push(b,d)}for(;c.length;)b=new fb(c.pop(),c.pop(),b);return b}function X(a,b){if(Ia(a.a))throw Error(b);}function Lb(a,b){var c=H(a.a);if(c!=b)throw Error("Bad token, expected: "+b+" got: "+c);}
function Mb(a){a=H(a.a);if(")"!=a)throw Error("Bad token: "+a);}function Nb(a){a=H(a.a);if(2>a.length)throw Error("Unclosed literal string");return new qb(a)}function Ob(a){var b=H(a.a),c=b.indexOf(":");if(-1==c)return new L(b);var d=b.substring(0,c);a=a.b(d);if(!a)throw Error("Namespace prefix not declared: "+d);b=b.substr(c+1);return new L(b,a)}
function Pb(a){var b,c=[],d;if(wb(G(a.a))){b=H(a.a);d=G(a.a);if("/"==b&&(Ia(a.a)||"."!=d&&".."!=d&&"@"!=d&&"*"!=d&&!/(?![0-9])[\w]/.test(d)))return new ub;d=new ub;X(a,"Missing next location step.");b=Qb(a,b);c.push(b)}else{a:{b=G(a.a);d=b.charAt(0);switch(d){case "$":throw Error("Variable reference not allowed in HTML XPath");case "(":H(a.a);b=Jb(a);X(a,'unclosed "("');Lb(a,")");break;case '"':case "'":b=Nb(a);break;default:if(isNaN(+b))if(!pb(b)&&/(?![0-9])[\w]/.test(d)&&"("==G(a.a,1)){b=H(a.a);
b=ob[b]||null;H(a.a);for(d=[];")"!=G(a.a);){X(a,"Missing function argument list.");d.push(Jb(a));if(","!=G(a.a))break;H(a.a)}X(a,"Unclosed function argument list.");Mb(a);b=new mb(b,d)}else{b=null;break a}else b=new rb(+H(a.a))}"["==G(a.a)&&(d=new zb(Rb(a)),b=new kb(b,d))}if(b)if(wb(G(a.a)))d=b;else return b;else b=Qb(a,"/"),d=new vb,c.push(b)}for(;wb(G(a.a));)b=H(a.a),X(a,"Missing next location step."),b=Qb(a,b),c.push(b);return new sb(d,c)}
function Qb(a,b){var c,d,e;if("/"!=b&&"//"!=b)throw Error('Step op should be "/" or "//"');if("."==G(a.a))return d=new V(Fb,new N("node")),H(a.a),d;if(".."==G(a.a))return d=new V(Eb,new N("node")),H(a.a),d;var f;if("@"==G(a.a))f=tb,H(a.a),X(a,"Missing attribute name");else if("::"==G(a.a,1)){if(!/(?![0-9])[\w]/.test(G(a.a).charAt(0)))throw Error("Bad token: "+H(a.a));c=H(a.a);f=Db[c]||null;if(!f)throw Error("No axis with name: "+c);H(a.a);X(a,"Missing node name")}else f=Ab;c=G(a.a);if(/(?![0-9])[\w]/.test(c.charAt(0)))if("("==
G(a.a,1)){if(!pb(c))throw Error("Invalid node type: "+c);c=H(a.a);if(!pb(c))throw Error("Invalid type name: "+c);Lb(a,"(");X(a,"Bad nodetype");e=G(a.a).charAt(0);var g=null;if('"'==e||"'"==e)g=Nb(a);X(a,"Bad nodetype");Mb(a);c=new N(c,g)}else c=Ob(a);else if("*"==c)c=Ob(a);else throw Error("Bad token: "+H(a.a));e=new zb(Rb(a),f.a);return d||new V(f,c,e,"//"==b)}
function Rb(a){for(var b=[];"["==G(a.a);){H(a.a);X(a,"Missing predicate expression.");var c=Jb(a);b.push(c);X(a,"Unclosed predicate expression.");Lb(a,"]")}return b}function Kb(a){if("-"==G(a.a))return H(a.a),new Gb(Kb(a));var b=Pb(a);if("|"!=G(a.a))a=b;else{for(b=[b];"|"==H(a.a);)X(a,"Missing next union location path."),b.push(Pb(a));a.a.a--;a=new Hb(b)}return a};/*

 Copyright 2014 Software Freedom Conservancy

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
function Sb(a,b){if(!a.length)throw Error("Empty XPath expression.");var c=Fa(a);if(Ia(c))throw Error("Invalid XPath expression.");b?"function"==aa(b)||(b=q(b.lookupNamespaceURI,b)):b=l(null);var d=Jb(new Ib(c,b));if(!Ia(c))throw Error("Bad token: "+H(c));this.evaluate=function(a,b){var c=d.a(new u(a));return new Y(c,b)}}
function Y(a,b){if(0==b)if(a instanceof K)b=4;else if("string"==typeof a)b=2;else if("number"==typeof a)b=1;else if("boolean"==typeof a)b=3;else throw Error("Unexpected evaluation result.");if(2!=b&&1!=b&&3!=b&&!(a instanceof K))throw Error("value could not be converted to the specified type");this.resultType=b;var c;switch(b){case 2:this.stringValue=a instanceof K?Ya(a):""+a;break;case 1:this.numberValue=a instanceof K?+Ya(a):+a;break;case 3:this.booleanValue=a instanceof K?0<a.i:!!a;break;case 4:case 5:case 6:case 7:var d=
O(a);c=[];for(var e=P(d);e;e=P(d))c.push(e instanceof E?e.a:e);this.snapshotLength=a.i;this.invalidIteratorState=!1;break;case 8:case 9:d=Xa(a);this.singleNodeValue=d instanceof E?d.a:d;break;default:throw Error("Unknown XPathResult type.");}var f=0;this.iterateNext=function(){if(4!=b&&5!=b)throw Error("iterateNext called with wrong result type");return f>=c.length?null:c[f++]};this.snapshotItem=function(a){if(6!=b&&7!=b)throw Error("snapshotItem called with wrong result type");return a>=c.length||
0>a?null:c[a]}}Y.ANY_TYPE=0;Y.NUMBER_TYPE=1;Y.STRING_TYPE=2;Y.BOOLEAN_TYPE=3;Y.UNORDERED_NODE_ITERATOR_TYPE=4;Y.ORDERED_NODE_ITERATOR_TYPE=5;Y.UNORDERED_NODE_SNAPSHOT_TYPE=6;Y.ORDERED_NODE_SNAPSHOT_TYPE=7;Y.ANY_UNORDERED_NODE_TYPE=8;Y.FIRST_ORDERED_NODE_TYPE=9;function Tb(a){this.lookupNamespaceURI=$a(a)}
function Ub(a){a=a||m;var b=a.document;b.evaluate||(a.XPathResult=Y,b.evaluate=function(a,b,e,f){return(new Sb(a,e)).evaluate(b,f)},b.createExpression=function(a,b){return new Sb(a,b)},b.createNSResolver=function(a){return new Tb(a)})}var Vb=["wgxpath","install"],Z=m;Vb[0]in Z||!Z.execScript||Z.execScript("var "+Vb[0]);for(var Wb;Vb.length&&(Wb=Vb.shift());)Vb.length||void 0===Ub?Z[Wb]?Z=Z[Wb]:Z=Z[Wb]={}:Z[Wb]=Ub;})()

},{}],2:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/$.core').Promise;
},{"../modules/$.core":15,"../modules/es6.object.to-string":67,"../modules/es6.promise":68,"../modules/es6.string.iterator":69,"../modules/web.dom.iterable":71}],3:[function(require,module,exports){
require('../../modules/es6.array.find-index');
module.exports = require('../../modules/$.core').Array.findIndex;
},{"../../modules/$.core":15,"../../modules/es6.array.find-index":62}],4:[function(require,module,exports){
require('../../modules/es6.array.find');
module.exports = require('../../modules/$.core').Array.find;
},{"../../modules/$.core":15,"../../modules/es6.array.find":63}],5:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/$.core').Array.from;
},{"../../modules/$.core":15,"../../modules/es6.array.from":64,"../../modules/es6.string.iterator":69}],6:[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/$.core').Object.assign;
},{"../../modules/$.core":15,"../../modules/es6.object.assign":66}],7:[function(require,module,exports){
require('../../modules/es7.object.values');
module.exports = require('../../modules/$.core').Object.values;
},{"../../modules/$.core":15,"../../modules/es7.object.values":70}],8:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],9:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./$.wks')('unscopables')
  , ArrayProto  = Array.prototype;
if(ArrayProto[UNSCOPABLES] == undefined)require('./$.hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function(key){
  ArrayProto[UNSCOPABLES][key] = true;
};
},{"./$.hide":25,"./$.wks":60}],10:[function(require,module,exports){
var isObject = require('./$.is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./$.is-object":31}],11:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx      = require('./$.ctx')
  , IObject  = require('./$.iobject')
  , toObject = require('./$.to-object')
  , toLength = require('./$.to-length')
  , asc      = require('./$.array-species-create');
module.exports = function(TYPE){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
  return function($this, callbackfn, that){
    var O      = toObject($this)
      , self   = IObject(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = IS_MAP ? asc($this, length) : IS_FILTER ? asc($this, 0) : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./$.array-species-create":12,"./$.ctx":16,"./$.iobject":28,"./$.to-length":57,"./$.to-object":58}],12:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var isObject = require('./$.is-object')
  , isArray  = require('./$.is-array')
  , SPECIES  = require('./$.wks')('species');
module.exports = function(original, length){
  var C;
  if(isArray(original)){
    C = original.constructor;
    // cross-realm fallback
    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
    if(isObject(C)){
      C = C[SPECIES];
      if(C === null)C = undefined;
    }
  } return new (C === undefined ? Array : C)(length);
};
},{"./$.is-array":30,"./$.is-object":31,"./$.wks":60}],13:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./$.cof')
  , TAG = require('./$.wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./$.cof":14,"./$.wks":60}],14:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],15:[function(require,module,exports){
var core = module.exports = {version: '1.2.6'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],16:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./$.a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./$.a-function":8}],17:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],18:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./$.fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./$.fails":21}],19:[function(require,module,exports){
var isObject = require('./$.is-object')
  , document = require('./$.global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$.global":23,"./$.is-object":31}],20:[function(require,module,exports){
var global    = require('./$.global')
  , core      = require('./$.core')
  , hide      = require('./$.hide')
  , redefine  = require('./$.redefine')
  , ctx       = require('./$.ctx')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
    , key, own, out, exp;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && key in target;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if(target && !own)redefine(target, key, out);
    // export
    if(exports[key] != out)hide(exports, key, exp);
    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;  // forced
$export.G = 2;  // global
$export.S = 4;  // static
$export.P = 8;  // proto
$export.B = 16; // bind
$export.W = 32; // wrap
module.exports = $export;
},{"./$.core":15,"./$.ctx":16,"./$.global":23,"./$.hide":25,"./$.redefine":45}],21:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],22:[function(require,module,exports){
var ctx         = require('./$.ctx')
  , call        = require('./$.iter-call')
  , isArrayIter = require('./$.is-array-iter')
  , anObject    = require('./$.an-object')
  , toLength    = require('./$.to-length')
  , getIterFn   = require('./core.get-iterator-method');
module.exports = function(iterable, entries, fn, that){
  var iterFn = getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    call(iterator, f, step.value, entries);
  }
};
},{"./$.an-object":10,"./$.ctx":16,"./$.is-array-iter":29,"./$.iter-call":32,"./$.to-length":57,"./core.get-iterator-method":61}],23:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],24:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],25:[function(require,module,exports){
var $          = require('./$')
  , createDesc = require('./$.property-desc');
module.exports = require('./$.descriptors') ? function(object, key, value){
  return $.setDesc(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./$":38,"./$.descriptors":18,"./$.property-desc":43}],26:[function(require,module,exports){
module.exports = require('./$.global').document && document.documentElement;
},{"./$.global":23}],27:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],28:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./$.cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./$.cof":14}],29:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./$.iterators')
  , ITERATOR   = require('./$.wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./$.iterators":37,"./$.wks":60}],30:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./$.cof');
module.exports = Array.isArray || function(arg){
  return cof(arg) == 'Array';
};
},{"./$.cof":14}],31:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],32:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./$.an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./$.an-object":10}],33:[function(require,module,exports){
'use strict';
var $              = require('./$')
  , descriptor     = require('./$.property-desc')
  , setToStringTag = require('./$.set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./$.hide')(IteratorPrototype, require('./$.wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = $.create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./$":38,"./$.hide":25,"./$.property-desc":43,"./$.set-to-string-tag":49,"./$.wks":60}],34:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./$.library')
  , $export        = require('./$.export')
  , redefine       = require('./$.redefine')
  , hide           = require('./$.hide')
  , has            = require('./$.has')
  , Iterators      = require('./$.iterators')
  , $iterCreate    = require('./$.iter-create')
  , setToStringTag = require('./$.set-to-string-tag')
  , getProto       = require('./$').getProto
  , ITERATOR       = require('./$.wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , methods, key;
  // Fix native
  if($native){
    var IteratorPrototype = getProto($default.call(new Base));
    // Set @@toStringTag to native iterators
    setToStringTag(IteratorPrototype, TAG, true);
    // FF fix
    if(!LIBRARY && has(proto, FF_ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    // fix Array#{values, @@iterator}.name in V8 / FF
    if(DEF_VALUES && $native.name !== VALUES){
      VALUES_BUG = true;
      $default = function values(){ return $native.call(this); };
    }
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES  ? $default : getMethod(VALUES),
      keys:    IS_SET      ? $default : getMethod(KEYS),
      entries: !DEF_VALUES ? $default : getMethod('entries')
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./$":38,"./$.export":20,"./$.has":24,"./$.hide":25,"./$.iter-create":33,"./$.iterators":37,"./$.library":39,"./$.redefine":45,"./$.set-to-string-tag":49,"./$.wks":60}],35:[function(require,module,exports){
var ITERATOR     = require('./$.wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":60}],36:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],37:[function(require,module,exports){
module.exports = {};
},{}],38:[function(require,module,exports){
var $Object = Object;
module.exports = {
  create:     $Object.create,
  getProto:   $Object.getPrototypeOf,
  isEnum:     {}.propertyIsEnumerable,
  getDesc:    $Object.getOwnPropertyDescriptor,
  setDesc:    $Object.defineProperty,
  setDescs:   $Object.defineProperties,
  getKeys:    $Object.keys,
  getNames:   $Object.getOwnPropertyNames,
  getSymbols: $Object.getOwnPropertySymbols,
  each:       [].forEach
};
},{}],39:[function(require,module,exports){
module.exports = false;
},{}],40:[function(require,module,exports){
var global    = require('./$.global')
  , macrotask = require('./$.task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./$.cof')(process) == 'process'
  , head, last, notify;

var flush = function(){
  var parent, domain, fn;
  if(isNode && (parent = process.domain)){
    process.domain = null;
    parent.exit();
  }
  while(head){
    domain = head.domain;
    fn     = head.fn;
    if(domain)domain.enter();
    fn(); // <- currently we use it only for Promise - try / catch not required
    if(domain)domain.exit();
    head = head.next;
  } last = undefined;
  if(parent)parent.enter();
};

// Node.js
if(isNode){
  notify = function(){
    process.nextTick(flush);
  };
// browsers with MutationObserver
} else if(Observer){
  var toggle = 1
    , node   = document.createTextNode('');
  new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
  notify = function(){
    node.data = toggle = -toggle;
  };
// environments with maybe non-completely correct, but existent Promise
} else if(Promise && Promise.resolve){
  notify = function(){
    Promise.resolve().then(flush);
  };
// for other environments - macrotask based on:
// - setImmediate
// - MessageChannel
// - window.postMessag
// - onreadystatechange
// - setTimeout
} else {
  notify = function(){
    // strange IE + webpack dev server bug - use .call(global)
    macrotask.call(global, flush);
  };
}

module.exports = function asap(fn){
  var task = {fn: fn, next: undefined, domain: isNode && process.domain};
  if(last)last.next = task;
  if(!head){
    head = task;
    notify();
  } last = task;
};
},{"./$.cof":14,"./$.global":23,"./$.task":54}],41:[function(require,module,exports){
// 19.1.2.1 Object.assign(target, source, ...)
var $        = require('./$')
  , toObject = require('./$.to-object')
  , IObject  = require('./$.iobject');

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = require('./$.fails')(function(){
  var a = Object.assign
    , A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return a({}, A)[S] != 7 || Object.keys(a({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , $$    = arguments
    , $$len = $$.length
    , index = 1
    , getKeys    = $.getKeys
    , getSymbols = $.getSymbols
    , isEnum     = $.isEnum;
  while($$len > index){
    var S      = IObject($$[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  }
  return T;
} : Object.assign;
},{"./$":38,"./$.fails":21,"./$.iobject":28,"./$.to-object":58}],42:[function(require,module,exports){
var $         = require('./$')
  , toIObject = require('./$.to-iobject')
  , isEnum    = $.isEnum;
module.exports = function(isEntries){
  return function(it){
    var O      = toIObject(it)
      , keys   = $.getKeys(O)
      , length = keys.length
      , i      = 0
      , result = []
      , key;
    while(length > i)if(isEnum.call(O, key = keys[i++])){
      result.push(isEntries ? [key, O[key]] : O[key]);
    } return result;
  };
};
},{"./$":38,"./$.to-iobject":56}],43:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],44:[function(require,module,exports){
var redefine = require('./$.redefine');
module.exports = function(target, src){
  for(var key in src)redefine(target, key, src[key]);
  return target;
};
},{"./$.redefine":45}],45:[function(require,module,exports){
// add fake Function#toString
// for correct work wrapped methods / constructors with methods like LoDash isNative
var global    = require('./$.global')
  , hide      = require('./$.hide')
  , SRC       = require('./$.uid')('src')
  , TO_STRING = 'toString'
  , $toString = Function[TO_STRING]
  , TPL       = ('' + $toString).split(TO_STRING);

require('./$.core').inspectSource = function(it){
  return $toString.call(it);
};

(module.exports = function(O, key, val, safe){
  if(typeof val == 'function'){
    val.hasOwnProperty(SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
    val.hasOwnProperty('name') || hide(val, 'name', key);
  }
  if(O === global){
    O[key] = val;
  } else {
    if(!safe)delete O[key];
    hide(O, key, val);
  }
})(Function.prototype, TO_STRING, function toString(){
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
},{"./$.core":15,"./$.global":23,"./$.hide":25,"./$.uid":59}],46:[function(require,module,exports){
// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],47:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var getDesc  = require('./$').getDesc
  , isObject = require('./$.is-object')
  , anObject = require('./$.an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./$.ctx')(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./$":38,"./$.an-object":10,"./$.ctx":16,"./$.is-object":31}],48:[function(require,module,exports){
'use strict';
var global      = require('./$.global')
  , $           = require('./$')
  , DESCRIPTORS = require('./$.descriptors')
  , SPECIES     = require('./$.wks')('species');

module.exports = function(KEY){
  var C = global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])$.setDesc(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./$":38,"./$.descriptors":18,"./$.global":23,"./$.wks":60}],49:[function(require,module,exports){
var def = require('./$').setDesc
  , has = require('./$.has')
  , TAG = require('./$.wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./$":38,"./$.has":24,"./$.wks":60}],50:[function(require,module,exports){
var global = require('./$.global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./$.global":23}],51:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./$.an-object')
  , aFunction = require('./$.a-function')
  , SPECIES   = require('./$.wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./$.a-function":8,"./$.an-object":10,"./$.wks":60}],52:[function(require,module,exports){
module.exports = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
},{}],53:[function(require,module,exports){
var toInteger = require('./$.to-integer')
  , defined   = require('./$.defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$.defined":17,"./$.to-integer":55}],54:[function(require,module,exports){
var ctx                = require('./$.ctx')
  , invoke             = require('./$.invoke')
  , html               = require('./$.html')
  , cel                = require('./$.dom-create')
  , global             = require('./$.global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listner = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./$.cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listner, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$.cof":14,"./$.ctx":16,"./$.dom-create":19,"./$.global":23,"./$.html":26,"./$.invoke":27}],55:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],56:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./$.iobject')
  , defined = require('./$.defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./$.defined":17,"./$.iobject":28}],57:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./$.to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./$.to-integer":55}],58:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./$.defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./$.defined":17}],59:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],60:[function(require,module,exports){
var store  = require('./$.shared')('wks')
  , uid    = require('./$.uid')
  , Symbol = require('./$.global').Symbol;
module.exports = function(name){
  return store[name] || (store[name] =
    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
};
},{"./$.global":23,"./$.shared":50,"./$.uid":59}],61:[function(require,module,exports){
var classof   = require('./$.classof')
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators');
module.exports = require('./$.core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./$.classof":13,"./$.core":15,"./$.iterators":37,"./$.wks":60}],62:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var $export = require('./$.export')
  , $find   = require('./$.array-methods')(6)
  , KEY     = 'findIndex'
  , forced  = true;
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./$.add-to-unscopables')(KEY);
},{"./$.add-to-unscopables":9,"./$.array-methods":11,"./$.export":20}],63:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = require('./$.export')
  , $find   = require('./$.array-methods')(5)
  , KEY     = 'find'
  , forced  = true;
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./$.add-to-unscopables')(KEY);
},{"./$.add-to-unscopables":9,"./$.array-methods":11,"./$.export":20}],64:[function(require,module,exports){
'use strict';
var ctx         = require('./$.ctx')
  , $export     = require('./$.export')
  , toObject    = require('./$.to-object')
  , call        = require('./$.iter-call')
  , isArrayIter = require('./$.is-array-iter')
  , toLength    = require('./$.to-length')
  , getIterFn   = require('./core.get-iterator-method');
$export($export.S + $export.F * !require('./$.iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , $$      = arguments
      , $$len   = $$.length
      , mapfn   = $$len > 1 ? $$[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, $$len > 2 ? $$[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        result[index] = mapping ? mapfn(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});

},{"./$.ctx":16,"./$.export":20,"./$.is-array-iter":29,"./$.iter-call":32,"./$.iter-detect":35,"./$.to-length":57,"./$.to-object":58,"./core.get-iterator-method":61}],65:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./$.add-to-unscopables')
  , step             = require('./$.iter-step')
  , Iterators        = require('./$.iterators')
  , toIObject        = require('./$.to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./$.iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./$.add-to-unscopables":9,"./$.iter-define":34,"./$.iter-step":36,"./$.iterators":37,"./$.to-iobject":56}],66:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./$.export');

$export($export.S + $export.F, 'Object', {assign: require('./$.object-assign')});
},{"./$.export":20,"./$.object-assign":41}],67:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = require('./$.classof')
  , test    = {};
test[require('./$.wks')('toStringTag')] = 'z';
if(test + '' != '[object z]'){
  require('./$.redefine')(Object.prototype, 'toString', function toString(){
    return '[object ' + classof(this) + ']';
  }, true);
}
},{"./$.classof":13,"./$.redefine":45,"./$.wks":60}],68:[function(require,module,exports){
'use strict';
var $          = require('./$')
  , LIBRARY    = require('./$.library')
  , global     = require('./$.global')
  , ctx        = require('./$.ctx')
  , classof    = require('./$.classof')
  , $export    = require('./$.export')
  , isObject   = require('./$.is-object')
  , anObject   = require('./$.an-object')
  , aFunction  = require('./$.a-function')
  , strictNew  = require('./$.strict-new')
  , forOf      = require('./$.for-of')
  , setProto   = require('./$.set-proto').set
  , same       = require('./$.same-value')
  , SPECIES    = require('./$.wks')('species')
  , speciesConstructor = require('./$.species-constructor')
  , asap       = require('./$.microtask')
  , PROMISE    = 'Promise'
  , process    = global.process
  , isNode     = classof(process) == 'process'
  , P          = global[PROMISE]
  , Wrapper;

var testResolve = function(sub){
  var test = new P(function(){});
  if(sub)test.constructor = Object;
  return P.resolve(test) === test;
};

var USE_NATIVE = function(){
  var works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = P && P.resolve && testResolve();
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
    if(works && require('./$.descriptors')){
      var thenableThenGotten = false;
      P.resolve($.setDesc({}, 'then', {
        get: function(){ thenableThenGotten = true; }
      }));
      works = thenableThenGotten;
    }
  } catch(e){ works = false; }
  return works;
}();

// helpers
var sameConstructor = function(a, b){
  // library wrapper special case
  if(LIBRARY && a === P && b === Wrapper)return true;
  return same(a, b);
};
var getConstructor = function(C){
  var S = anObject(C)[SPECIES];
  return S != undefined ? S : C;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var PromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve),
  this.reject  = aFunction(reject)
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(record, isReject){
  if(record.n)return;
  record.n = true;
  var chain = record.c;
  asap(function(){
    var value = record.v
      , ok    = record.s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , result, then;
      try {
        if(handler){
          if(!ok)record.h = true;
          result = handler === true ? value : handler(value);
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
    record.n = false;
    if(isReject)setTimeout(function(){
      var promise = record.p
        , handler, console;
      if(isUnhandled(promise)){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      } record.a = undefined;
    }, 1);
  });
};
var isUnhandled = function(promise){
  var record = promise._d
    , chain  = record.a || record.c
    , i      = 0
    , reaction;
  if(record.h)return false;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var $reject = function(value){
  var record = this;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  notify(record, true);
};
var $resolve = function(value){
  var record = this
    , then;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(record.p === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      asap(function(){
        var wrapper = {r: record, d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      record.v = value;
      record.s = 1;
      notify(record, false);
    }
  } catch(e){
    $reject.call({r: record, d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    aFunction(executor);
    var record = this._d = {
      p: strictNew(this, P, PROMISE),         // <- promise
      c: [],                                  // <- awaiting reactions
      a: undefined,                           // <- checked in isUnhandled reactions
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false,                               // <- handled rejection
      n: false                                // <- notify
    };
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  require('./$.redefine-all')(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction = new PromiseCapability(speciesConstructor(this, P))
        , promise  = reaction.promise
        , record   = this._d;
      reaction.ok   = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      record.c.push(reaction);
      if(record.a)record.a.push(reaction);
      if(record.s)notify(record, false);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: P});
require('./$.set-to-string-tag')(P, PROMISE);
require('./$.set-species')(PROMISE);
Wrapper = require('./$.core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = new PromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (!USE_NATIVE || testResolve(true)), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof P && sameConstructor(x.constructor, this))return x;
    var capability = new PromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = getConstructor(this)
      , capability = new PromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject
      , values     = [];
    var abrupt = perform(function(){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        var alreadyCalled = false;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled = true;
          results[index] = value;
          --remaining || resolve(results);
        }, reject);
      });
      else resolve(results);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = getConstructor(this)
      , capability = new PromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"./$":38,"./$.a-function":8,"./$.an-object":10,"./$.classof":13,"./$.core":15,"./$.ctx":16,"./$.descriptors":18,"./$.export":20,"./$.for-of":22,"./$.global":23,"./$.is-object":31,"./$.iter-detect":35,"./$.library":39,"./$.microtask":40,"./$.redefine-all":44,"./$.same-value":46,"./$.set-proto":47,"./$.set-species":48,"./$.set-to-string-tag":49,"./$.species-constructor":51,"./$.strict-new":52,"./$.wks":60}],69:[function(require,module,exports){
'use strict';
var $at  = require('./$.string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./$.iter-define":34,"./$.string-at":53}],70:[function(require,module,exports){
// http://goo.gl/XkBrjD
var $export = require('./$.export')
  , $values = require('./$.object-to-array')(false);

$export($export.S, 'Object', {
  values: function values(it){
    return $values(it);
  }
});
},{"./$.export":20,"./$.object-to-array":42}],71:[function(require,module,exports){
require('./es6.array.iterator');
var global      = require('./$.global')
  , hide        = require('./$.hide')
  , Iterators   = require('./$.iterators')
  , ITERATOR    = require('./$.wks')('iterator')
  , NL          = global.NodeList
  , HTC         = global.HTMLCollection
  , NLProto     = NL && NL.prototype
  , HTCProto    = HTC && HTC.prototype
  , ArrayValues = Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
if(NLProto && !NLProto[ITERATOR])hide(NLProto, ITERATOR, ArrayValues);
if(HTCProto && !HTCProto[ITERATOR])hide(HTCProto, ITERATOR, ArrayValues);
},{"./$.global":23,"./$.hide":25,"./$.iterators":37,"./$.wks":60,"./es6.array.iterator":65}],72:[function(require,module,exports){
// URL Polyfill
// Draft specification: https://url.spec.whatwg.org

// Notes:
// - Primarily useful for parsing URLs and modifying query parameters
// - Should work in IE8+ and everything more modern

(function (global) {
  'use strict';

  // Browsers may have:
  // * No global URL object
  // * URL with static methods only - may have a dummy constructor
  // * URL with members except searchParams
  // * Full URL API support
  var origURL = global.URL;
  var nativeURL;
  try {
    if (origURL) {
      nativeURL = new global.URL('http://example.com');
      if ('searchParams' in nativeURL)
        return;
      if (!('href' in nativeURL))
        nativeURL = undefined;
    }
  } catch (_) {}

  // NOTE: Doesn't do the encoding/decoding dance
  function urlencoded_serialize(pairs) {
    var output = '', first = true;
    pairs.forEach(function (pair) {
      var name = encodeURIComponent(pair.name);
      var value = encodeURIComponent(pair.value);
      if (!first) output += '&';
      output += name + '=' + value;
      first = false;
    });
    return output.replace(/%20/g, '+');
  }

  // NOTE: Doesn't do the encoding/decoding dance
  function urlencoded_parse(input, isindex) {
    var sequences = input.split('&');
    if (isindex && sequences[0].indexOf('=') === -1)
      sequences[0] = '=' + sequences[0];
    var pairs = [];
    sequences.forEach(function (bytes) {
      if (bytes.length === 0) return;
      var index = bytes.indexOf('=');
      if (index !== -1) {
        var name = bytes.substring(0, index);
        var value = bytes.substring(index + 1);
      } else {
        name = bytes;
        value = '';
      }
      name = name.replace(/\+/g, ' ');
      value = value.replace(/\+/g, ' ');
      pairs.push({ name: name, value: value });
    });
    var output = [];
    pairs.forEach(function (pair) {
      output.push({
        name: decodeURIComponent(pair.name),
        value: decodeURIComponent(pair.value)
      });
    });
    return output;
  }


  function URLUtils(url) {
    if (nativeURL)
      return new origURL(url);
    var anchor = document.createElement('a');
    anchor.href = url;
    return anchor;
  }

  function URLSearchParams(init) {
    var $this = this;
    this._list = [];

    if (init === undefined || init === null)
      init = '';

    if (Object(init) !== init || !(init instanceof URLSearchParams))
      init = String(init);

    if (typeof init === 'string' && init.substring(0, 1) === '?')
      init = init.substring(1);

    if (typeof init === 'string')
      this._list = urlencoded_parse(init);
    else
      this._list = init._list.slice();

    this._url_object = null;
    this._setList = function (list) { if (!updating) $this._list = list; };

    var updating = false;
    this._update_steps = function() {
      if (updating) return;
      updating = true;

      if (!$this._url_object) return;

      // Partial workaround for IE issue with 'about:'
      if ($this._url_object.protocol === 'about:' &&
          $this._url_object.pathname.indexOf('?') !== -1) {
          $this._url_object.pathname = $this._url_object.pathname.split('?')[0];
      }

      $this._url_object.search = urlencoded_serialize($this._list);

      updating = false;
    };
  }


  Object.defineProperties(URLSearchParams.prototype, {
    append: {
      value: function (name, value) {
        this._list.push({ name: name, value: value });
        this._update_steps();
      }, writable: true, enumerable: true, configurable: true
    },

    'delete': {
      value: function (name) {
        for (var i = 0; i < this._list.length;) {
          if (this._list[i].name === name)
            this._list.splice(i, 1);
          else
            ++i;
        }
        this._update_steps();
      }, writable: true, enumerable: true, configurable: true
    },

    get: {
      value: function (name) {
        for (var i = 0; i < this._list.length; ++i) {
          if (this._list[i].name === name)
            return this._list[i].value;
        }
        return null;
      }, writable: true, enumerable: true, configurable: true
    },

    getAll: {
      value: function (name) {
        var result = [];
        for (var i = 0; i < this._list.length; ++i) {
          if (this._list[i].name === name)
            result.push(this._list[i].value);
        }
        return result;
      }, writable: true, enumerable: true, configurable: true
    },

    has: {
      value: function (name) {
        for (var i = 0; i < this._list.length; ++i) {
          if (this._list[i].name === name)
            return true;
        }
        return false;
      }, writable: true, enumerable: true, configurable: true
    },

    set: {
      value: function (name, value) {
        var found = false;
        for (var i = 0; i < this._list.length;) {
          if (this._list[i].name === name) {
            if (!found) {
              this._list[i].value = value;
              found = true;
              ++i;
            } else {
              this._list.splice(i, 1);
            }
          } else {
            ++i;
          }
        }

        if (!found)
          this._list.push({ name: name, value: value });

        this._update_steps();
      }, writable: true, enumerable: true, configurable: true
    },

    entries: {
      value: function() {
        var $this = this, index = 0;
        return { next: function() {
          if (index >= $this._list.length)
            return {done: true, value: undefined};
          var pair = $this._list[index++];
          return {done: false, value: [pair.name, pair.value]};
        }};
      }, writable: true, enumerable: true, configurable: true
    },

    keys: {
      value: function() {
        var $this = this, index = 0;
        return { next: function() {
          if (index >= $this._list.length)
            return {done: true, value: undefined};
          var pair = $this._list[index++];
          return {done: false, value: pair.name};
        }};
      }, writable: true, enumerable: true, configurable: true
    },

    values: {
      value: function() {
        var $this = this, index = 0;
        return { next: function() {
          if (index >= $this._list.length)
            return {done: true, value: undefined};
          var pair = $this._list[index++];
          return {done: false, value: pair.value};
        }};
      }, writable: true, enumerable: true, configurable: true
    },

    forEach: {
      value: function(callback) {
        var thisArg = (arguments.length > 1) ? arguments[1] : undefined;
        this._list.forEach(function(pair, index) {
          callback.call(thisArg, pair.name, pair.value);
        });

      }, writable: true, enumerable: true, configurable: true
    },

    toString: {
      value: function () {
        return urlencoded_serialize(this._list);
      }, writable: true, enumerable: false, configurable: true
    }
  });

  if ('Symbol' in global && 'iterator' in global.Symbol) {
    Object.defineProperty(URLSearchParams.prototype, global.Symbol.iterator, {
      value: URLSearchParams.prototype.entries,
      writable: true, enumerable: true, configurable: true});
  }

  function URL(url, base) {
    if (!(this instanceof global.URL))
      throw new TypeError("Failed to construct 'URL': Please use the 'new' operator.");

    if (base) {
      url = (function () {
        if (nativeURL) return new origURL(url, base).href;

        var doc;
        // Use another document/base tag/anchor for relative URL resolution, if possible
        if (document.implementation && document.implementation.createHTMLDocument) {
          doc = document.implementation.createHTMLDocument('');
        } else if (document.implementation && document.implementation.createDocument) {
          doc = document.implementation.createElement('http://www.w3.org/1999/xhtml', 'html', null);
          doc.documentElement.appendChild(doc.createElement('head'));
          doc.documentElement.appendChild(doc.createElement('body'));
        } else if (window.ActiveXObject) {
          doc = new window.ActiveXObject('htmlfile');
          doc.write('<head><\/head><body><\/body>');
          doc.close();
        }

        if (!doc) throw Error('base not supported');

        var baseTag = doc.createElement('base');
        baseTag.href = base;
        doc.getElementsByTagName('head')[0].appendChild(baseTag);
        var anchor = doc.createElement('a');
        anchor.href = url;
        return anchor.href;
      }());
    }

    // An inner object implementing URLUtils (either a native URL
    // object or an HTMLAnchorElement instance) is used to perform the
    // URL algorithms. With full ES5 getter/setter support, return a
    // regular object For IE8's limited getter/setter support, a
    // different HTMLAnchorElement is returned with properties
    // overridden

    var instance = URLUtils(url || '');

    // Detect for ES5 getter/setter support
    // (an Object.defineProperties polyfill that doesn't support getters/setters may throw)
    var ES5_GET_SET = (function() {
      if (!('defineProperties' in Object)) return false;
      try {
        var obj = {};
        Object.defineProperties(obj, { prop: { 'get': function () { return true; } } });
        return obj.prop;
      } catch (_) {
        return false;
      }
    })();

    var self = ES5_GET_SET ? this : document.createElement('a');



    var query_object = new URLSearchParams(
      instance.search ? instance.search.substring(1) : null);
    query_object._url_object = self;

    Object.defineProperties(self, {
      href: {
        get: function () { return instance.href; },
        set: function (v) { instance.href = v; tidy_instance(); update_steps(); },
        enumerable: true, configurable: true
      },
      origin: {
        get: function () {
          if ('origin' in instance) return instance.origin;
          return this.protocol + '//' + this.host;
        },
        enumerable: true, configurable: true
      },
      protocol: {
        get: function () { return instance.protocol; },
        set: function (v) { instance.protocol = v; },
        enumerable: true, configurable: true
      },
      username: {
        get: function () { return instance.username; },
        set: function (v) { instance.username = v; },
        enumerable: true, configurable: true
      },
      password: {
        get: function () { return instance.password; },
        set: function (v) { instance.password = v; },
        enumerable: true, configurable: true
      },
      host: {
        get: function () {
          // IE returns default port in |host|
          var re = {'http:': /:80$/, 'https:': /:443$/, 'ftp:': /:21$/}[instance.protocol];
          return re ? instance.host.replace(re, '') : instance.host;
        },
        set: function (v) { instance.host = v; },
        enumerable: true, configurable: true
      },
      hostname: {
        get: function () { return instance.hostname; },
        set: function (v) { instance.hostname = v; },
        enumerable: true, configurable: true
      },
      port: {
        get: function () { return instance.port; },
        set: function (v) { instance.port = v; },
        enumerable: true, configurable: true
      },
      pathname: {
        get: function () {
          // IE does not include leading '/' in |pathname|
          if (instance.pathname.charAt(0) !== '/') return '/' + instance.pathname;
          return instance.pathname;
        },
        set: function (v) { instance.pathname = v; },
        enumerable: true, configurable: true
      },
      search: {
        get: function () { return instance.search; },
        set: function (v) {
          if (instance.search === v) return;
          instance.search = v; tidy_instance(); update_steps();
        },
        enumerable: true, configurable: true
      },
      searchParams: {
        get: function () { return query_object; },
        enumerable: true, configurable: true
      },
      hash: {
        get: function () { return instance.hash; },
        set: function (v) { instance.hash = v; tidy_instance(); },
        enumerable: true, configurable: true
      },
      toString: {
        value: function() { return instance.toString(); },
        enumerable: false, configurable: true
      },
      valueOf: {
        value: function() { return instance.valueOf(); },
        enumerable: false, configurable: true
      }
    });

    function tidy_instance() {
      var href = instance.href.replace(/#$|\?$|\?(?=#)/g, '');
      if (instance.href !== href)
        instance.href = href;
    }

    function update_steps() {
      query_object._setList(instance.search ? urlencoded_parse(instance.search.substring(1)) : []);
      query_object._update_steps();
    };

    return self;
  }

  if (origURL) {
    for (var i in origURL) {
      if (origURL.hasOwnProperty(i) && typeof origURL[i] === 'function')
        global.URL[i] = origURL[i];
    }
  }

  global.URL = URL;
  global.URLSearchParams = URLSearchParams;

}(self));

},{}],"/h/static/scripts/polyfills.js":[function(require,module,exports){
'use strict';

// ES2015 polyfills
require('core-js/es6/promise');
require('core-js/fn/array/find');
require('core-js/fn/array/find-index');
require('core-js/fn/array/from');
require('core-js/fn/object/assign');

// ES2017
require('core-js/fn/object/values');

// URL constructor, required by IE 10/11,
// early versions of Microsoft Edge.
try {
  var url = new window.URL('https://hypothes.is');

  // Some browsers (eg. PhantomJS 2.x) include a `URL` constructor which works
  // but is broken.
  if (url.hostname !== 'hypothes.is') {
    throw new Error('Broken URL constructor');
  }
} catch (err) {
  require('js-polyfills/url');
}

// document.evaluate() implementation,
// required by IE 10, 11
//
// This sets `window.wgxpath`
if (!window.document.evaluate) {
  require('./vendor/wgxpath.install');
}

},{"./vendor/wgxpath.install":1,"core-js/es6/promise":2,"core-js/fn/array/find":4,"core-js/fn/array/find-index":3,"core-js/fn/array/from":5,"core-js/fn/object/assign":6,"core-js/fn/object/values":7,"js-polyfills/url":72}]},{},[])
//# sourceMappingURL=polyfills.bundle.js.map
