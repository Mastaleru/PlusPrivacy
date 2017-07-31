!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),(f.jsondiffpatch||(f.jsondiffpatch={})).formatters=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    module.exports=require("./formatters");
},{"./formatters":6}],2:[function(require,module,exports){
    exports.isBrowser="undefined"!=typeof window;
},{}],3:[function(require,module,exports){
    var base=require("./base"),BaseFormatter=base.BaseFormatter,AnnotatedFormatter=function(){this.includeMoveDestinations=!1};AnnotatedFormatter.prototype=new BaseFormatter,AnnotatedFormatter.prototype.prepareContext=function(t){BaseFormatter.prototype.prepareContext.call(this,t),t.indent=function(t){this.indentLevel=(this.indentLevel||0)+("undefined"==typeof t?1:t),this.indentPad=new Array(this.indentLevel+1).join("&nbsp;&nbsp;")},t.row=function(e,n){t.out('<tr><td style="white-space: nowrap;"><pre class="jsondiffpatch-annotated-indent" style="display: inline-block">'),t.out(t.indentPad),t.out('</pre><pre style="display: inline-block">'),t.out(e),t.out('</pre></td><td class="jsondiffpatch-delta-note"><div>'),t.out(n),t.out("</div></td></tr>")}},AnnotatedFormatter.prototype.typeFormattterErrorFormatter=function(t,e){t.row("",'<pre class="jsondiffpatch-error">'+e+"</pre>")},AnnotatedFormatter.prototype.formatTextDiffString=function(t,e){var n=this.parseTextDiff(e);t.out('<ul class="jsondiffpatch-textdiff">');for(var o=0,r=n.length;r>o;o++){var a=n[o];t.out('<li><div class="jsondiffpatch-textdiff-location"><span class="jsondiffpatch-textdiff-line-number">'+a.location.line+'</span><span class="jsondiffpatch-textdiff-char">'+a.location.chr+'</span></div><div class="jsondiffpatch-textdiff-line">');for(var i=a.pieces,d=0,p=i.length;p>d;d++){var f=i[d];t.out('<span class="jsondiffpatch-textdiff-'+f.type+'">'+f.text+"</span>")}t.out("</div></li>")}t.out("</ul>")},AnnotatedFormatter.prototype.rootBegin=function(t,e,n){t.out('<table class="jsondiffpatch-annotated-delta">'),"node"===e&&(t.row("{"),t.indent()),"array"===n&&t.row('"_t": "a",',"Array delta (member names indicate array indices)")},AnnotatedFormatter.prototype.rootEnd=function(t,e){"node"===e&&(t.indent(-1),t.row("}")),t.out("</table>")},AnnotatedFormatter.prototype.nodeBegin=function(t,e,n,o,r){t.row("&quot;"+e+"&quot;: {"),"node"===o&&t.indent(),"array"===r&&t.row('"_t": "a",',"Array delta (member names indicate array indices)")},AnnotatedFormatter.prototype.nodeEnd=function(t,e,n,o,r,a){"node"===o&&t.indent(-1),t.row("}"+(a?"":","))},AnnotatedFormatter.prototype.format_unchanged=function(){},AnnotatedFormatter.prototype.format_movedestination=function(){},AnnotatedFormatter.prototype.format_node=function(t,e,n){this.formatDeltaChildren(t,e,n)};var wrapPropertyName=function(t){return'<pre style="display:inline-block">&quot;'+t+"&quot;</pre>"},deltaAnnotations={added:function(t,e,n,o){var r=" <pre>([newValue])</pre>";return"undefined"==typeof o?"new value"+r:"number"==typeof o?"insert at index "+o+r:"add property "+wrapPropertyName(o)+r},modified:function(t,e,n,o){var r=" <pre>([previousValue, newValue])</pre>";return"undefined"==typeof o?"modify value"+r:"number"==typeof o?"modify at index "+o+r:"modify property "+wrapPropertyName(o)+r},deleted:function(t,e,n,o){var r=" <pre>([previousValue, 0, 0])</pre>";return"undefined"==typeof o?"delete value"+r:"number"==typeof o?"remove index "+o+r:"delete property "+wrapPropertyName(o)+r},moved:function(t,e,n,o){return'move from <span title="(position to remove at original state)">index '+o+'</span> to <span title="(position to insert at final state)">index '+t[1]+"</span>"},textdiff:function(t,e,n,o){var r="undefined"==typeof o?"":"number"==typeof o?" at index "+o:" at property "+wrapPropertyName(o);return"text diff"+r+', format is <a href="https://code.google.com/p/google-diff-match-patch/wiki/Unidiff">a variation of Unidiff</a>'}},formatAnyChange=function(t,e){var n=this.getDeltaType(e),o=deltaAnnotations[n],r=o&&o.apply(o,Array.prototype.slice.call(arguments,1)),a=JSON.stringify(e,null,2);"textdiff"===n&&(a=a.split("\\n").join('\\n"+\n   "')),t.indent(),t.row(a,r),t.indent(-1)};AnnotatedFormatter.prototype.format_added=formatAnyChange,AnnotatedFormatter.prototype.format_modified=formatAnyChange,AnnotatedFormatter.prototype.format_deleted=formatAnyChange,AnnotatedFormatter.prototype.format_moved=formatAnyChange,AnnotatedFormatter.prototype.format_textdiff=formatAnyChange,exports.AnnotatedFormatter=AnnotatedFormatter;var defaultInstance;exports.format=function(t,e){return defaultInstance||(defaultInstance=new AnnotatedFormatter),defaultInstance.format(t,e)};
},{"./base":4}],4:[function(require,module,exports){
    var isArray="function"==typeof Array.isArray?Array.isArray:function(e){return e instanceof Array},getObjectKeys="function"==typeof Object.keys?function(e){return Object.keys(e)}:function(e){var t=[];for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.push(r);return t},trimUnderscore=function(e){return"_"===e.substr(0,1)?e.slice(1):e},arrayKeyToSortNumber=function(e){return"_t"===e?-1:"_"===e.substr(0,1)?parseInt(e.slice(1),10):parseInt(e,10)+.1},arrayKeyComparer=function(e,t){return arrayKeyToSortNumber(e)-arrayKeyToSortNumber(t)},BaseFormatter=function(){};BaseFormatter.prototype.format=function(e,t){var r={};return this.prepareContext(r),this.recurse(r,e,t),this.finalize(r)},BaseFormatter.prototype.prepareContext=function(e){e.buffer=[],e.out=function(){this.buffer.push.apply(this.buffer,arguments)}},BaseFormatter.prototype.typeFormattterNotFound=function(e,t){throw new Error("cannot format delta type: "+t)},BaseFormatter.prototype.typeFormattterErrorFormatter=function(e,t){return t.toString()},BaseFormatter.prototype.finalize=function(e){return isArray(e.buffer)?e.buffer.join(""):void 0},BaseFormatter.prototype.recurse=function(e,t,r,o,n,a,i){var f=t&&a,s=f?a.value:r;if("undefined"!=typeof t||"undefined"!=typeof o){var u=this.getDeltaType(t,a),p="node"===u?"a"===t._t?"array":"object":"";"undefined"!=typeof o?this.nodeBegin(e,o,n,u,p,i):this.rootBegin(e,u,p);var y;try{y=this["format_"+u]||this.typeFormattterNotFound(e,u),y.call(this,e,t,s,o,n,a)}catch(c){this.typeFormattterErrorFormatter(e,c,t,s,o,n,a),"undefined"!=typeof console&&console.error&&console.error(c.stack)}"undefined"!=typeof o?this.nodeEnd(e,o,n,u,p,i):this.rootEnd(e,u,p)}},BaseFormatter.prototype.formatDeltaChildren=function(e,t,r){var o=this;this.forEachDeltaKey(t,r,function(n,a,i,f){o.recurse(e,t[n],r?r[a]:void 0,n,a,i,f)})},BaseFormatter.prototype.forEachDeltaKey=function(e,t,r){var o,n=getObjectKeys(e),a="a"===e._t,i={};if("undefined"!=typeof t)for(o in t)Object.prototype.hasOwnProperty.call(t,o)&&("undefined"!=typeof e[o]||a&&"undefined"!=typeof e["_"+o]||n.push(o));for(o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var f=e[o];isArray(f)&&3===f[2]&&(i[f[1].toString()]={key:o,value:t&&t[parseInt(o.substr(1))]},this.includeMoveDestinations!==!1&&"undefined"==typeof t&&"undefined"==typeof e[f[1]]&&n.push(f[1].toString()))}a?n.sort(arrayKeyComparer):n.sort();for(var s=0,u=n.length;u>s;s++){var p=n[s];if(!a||"_t"!==p){var y=a?"number"==typeof p?p:parseInt(trimUnderscore(p),10):p,c=s===u-1;r(p,y,i[y],c)}}},BaseFormatter.prototype.getDeltaType=function(e,t){if("undefined"==typeof e)return"undefined"!=typeof t?"movedestination":"unchanged";if(isArray(e)){if(1===e.length)return"added";if(2===e.length)return"modified";if(3===e.length&&0===e[2])return"deleted";if(3===e.length&&2===e[2])return"textdiff";if(3===e.length&&3===e[2])return"moved"}else if("object"==typeof e)return"node";return"unknown"},BaseFormatter.prototype.parseTextDiff=function(e){for(var t=[],r=e.split("\n@@ "),o=0,n=r.length;n>o;o++){var a=r[o],i={pieces:[]},f=/^(?:@@ )?[-+]?(\d+),(\d+)/.exec(a).slice(1);i.location={line:f[0],chr:f[1]};for(var s=a.split("\n").slice(1),u=0,p=s.length;p>u;u++){var y=s[u];if(y.length){var c={type:"context"};"+"===y.substr(0,1)?c.type="added":"-"===y.substr(0,1)&&(c.type="deleted"),c.text=y.slice(1),i.pieces.push(c)}}t.push(i)}return t},exports.BaseFormatter=BaseFormatter;
},{}],5:[function(require,module,exports){
    function htmlEscape(t){for(var e=t,o=[[/&/g,"&amp;"],[/</g,"&lt;"],[/>/g,"&gt;"],[/'/g,"&apos;"],[/"/g,"&quot;"]],a=0;a<o.length;a++)e=e.replace(o[a][0],o[a][1]);return e}var base=require("./base"),BaseFormatter=base.BaseFormatter,HtmlFormatter=function(){};HtmlFormatter.prototype=new BaseFormatter,HtmlFormatter.prototype.typeFormattterErrorFormatter=function(t,e){t.out('<pre class="jsondiffpatch-error">'+e+"</pre>")},HtmlFormatter.prototype.formatValue=function(t,e){t.out("<pre>"+htmlEscape(JSON.stringify(e,null,2))+"</pre>")},HtmlFormatter.prototype.formatTextDiffString=function(t,e){var o=this.parseTextDiff(e);t.out('<ul class="jsondiffpatch-textdiff">');for(var a=0,r=o.length;r>a;a++){var i=o[a];t.out('<li><div class="jsondiffpatch-textdiff-location"><span class="jsondiffpatch-textdiff-line-number">'+i.location.line+'</span><span class="jsondiffpatch-textdiff-char">'+i.location.chr+'</span></div><div class="jsondiffpatch-textdiff-line">');for(var n=i.pieces,s=0,d=n.length;d>s;s++){var f=n[s];t.out('<span class="jsondiffpatch-textdiff-'+f.type+'">'+htmlEscape(unescape(f.text))+"</span>")}t.out("</div></li>")}t.out("</ul>")};var adjustArrows=function(t){t=t||document;var e=function(t){return t.textContent||t.innerText},o=function(t,e,o){for(var a=t.querySelectorAll(e),r=0,i=a.length;i>r;r++)o(a[r])},a=function(t,e){for(var o=0,a=t.children.length;a>o;o++)e(t.children[o],o)};o(t,".jsondiffpatch-arrow",function(t){var o=t.parentNode,r=t.children[0],i=r.children[1];r.style.display="none";var n,s=e(o.querySelector(".jsondiffpatch-moved-destination")),d=o.parentNode;if(a(d,function(t){t.getAttribute("data-key")===s&&(n=t)}),n)try{var f=n.offsetTop-o.offsetTop;r.setAttribute("height",Math.abs(f)+6),t.style.top=-8+(f>0?0:f)+"px";var l=f>0?"M30,0 Q-10,"+Math.round(f/2)+" 26,"+(f-4):"M30,"+-f+" Q-10,"+Math.round(-f/2)+" 26,4";i.setAttribute("d",l),r.style.display=""}catch(c){return}})};HtmlFormatter.prototype.rootBegin=function(t,e,o){var a="jsondiffpatch-"+e+(o?" jsondiffpatch-child-node-type-"+o:"");t.out('<div class="jsondiffpatch-delta '+a+'">')},HtmlFormatter.prototype.rootEnd=function(t){t.out("</div>"+(t.hasArrows?'<script type="text/javascript">setTimeout('+adjustArrows.toString()+",10);</script>":""))},HtmlFormatter.prototype.nodeBegin=function(t,e,o,a,r){var i="jsondiffpatch-"+a+(r?" jsondiffpatch-child-node-type-"+r:"");t.out('<li class="'+i+'" data-key="'+o+'"><div class="jsondiffpatch-property-name">'+o+"</div>")},HtmlFormatter.prototype.nodeEnd=function(t){t.out("</li>")},HtmlFormatter.prototype.format_unchanged=function(t,e,o){"undefined"!=typeof o&&(t.out('<div class="jsondiffpatch-value">'),this.formatValue(t,o),t.out("</div>"))},HtmlFormatter.prototype.format_movedestination=function(t,e,o){"undefined"!=typeof o&&(t.out('<div class="jsondiffpatch-value">'),this.formatValue(t,o),t.out("</div>"))},HtmlFormatter.prototype.format_node=function(t,e,o){var a="a"===e._t?"array":"object";t.out('<ul class="jsondiffpatch-node jsondiffpatch-node-type-'+a+'">'),this.formatDeltaChildren(t,e,o),t.out("</ul>")},HtmlFormatter.prototype.format_added=function(t,e){t.out('<div class="jsondiffpatch-value">'),this.formatValue(t,e[0]),t.out("</div>")},HtmlFormatter.prototype.format_modified=function(t,e){t.out('<div class="jsondiffpatch-value jsondiffpatch-left-value">'),this.formatValue(t,e[0]),t.out('</div><div class="jsondiffpatch-value jsondiffpatch-right-value">'),this.formatValue(t,e[1]),t.out("</div>")},HtmlFormatter.prototype.format_deleted=function(t,e){t.out('<div class="jsondiffpatch-value">'),this.formatValue(t,e[0]),t.out("</div>")},HtmlFormatter.prototype.format_moved=function(t,e){t.out('<div class="jsondiffpatch-value">'),this.formatValue(t,e[0]),t.out('</div><div class="jsondiffpatch-moved-destination">'+e[1]+"</div>"),t.out('<div class="jsondiffpatch-arrow" style="position: relative; left: -34px;">        <svg width="30" height="60" style="position: absolute; display: none;">        <defs>            <marker id="markerArrow" markerWidth="8" markerHeight="8" refx="2" refy="4"                   orient="auto" markerUnits="userSpaceOnUse">                <path d="M1,1 L1,7 L7,4 L1,1" style="fill: #339;" />            </marker>        </defs>        <path d="M30,0 Q-10,25 26,50" style="stroke: #88f; stroke-width: 2px; fill: none;        stroke-opacity: 0.5; marker-end: url(#markerArrow);"></path>        </svg>        </div>'),t.hasArrows=!0},HtmlFormatter.prototype.format_textdiff=function(t,e){t.out('<div class="jsondiffpatch-value">'),this.formatTextDiffString(t,e[0]),t.out("</div>")};var showUnchanged=function(t,e,o){var a=e||document.body,r="jsondiffpatch-unchanged-",i={showing:r+"showing",hiding:r+"hiding",visible:r+"visible",hidden:r+"hidden"},n=a.classList;if(n){if(!o)return n.remove(i.showing),n.remove(i.hiding),n.remove(i.visible),n.remove(i.hidden),void(t===!1&&n.add(i.hidden));t===!1?(n.remove(i.showing),n.add(i.visible),setTimeout(function(){n.add(i.hiding)},10)):(n.remove(i.hiding),n.add(i.showing),n.remove(i.hidden));var s=setInterval(function(){adjustArrows(a)},100);setTimeout(function(){n.remove(i.showing),n.remove(i.hiding),t===!1?(n.add(i.hidden),n.remove(i.visible)):(n.add(i.visible),n.remove(i.hidden)),setTimeout(function(){n.remove(i.visible),clearInterval(s)},o+400)},o)}},hideUnchanged=function(t,e){return showUnchanged(!1,t,e)};exports.HtmlFormatter=HtmlFormatter,exports.showUnchanged=showUnchanged,exports.hideUnchanged=hideUnchanged;var defaultInstance;exports.format=function(t,e){return defaultInstance||(defaultInstance=new HtmlFormatter),defaultInstance.format(t,e)};
},{"./base":4}],6:[function(require,module,exports){
    var environment=require("../environment");if(exports.base=require("./base"),exports.html=require("./html"),exports.annotated=require("./annotated"),exports.jsonpatch=require("./jsonpatch"),!environment.isBrowser){var consoleModuleName="./console";exports.console=require(consoleModuleName)}
},{"../environment":2,"./annotated":3,"./base":4,"./html":5,"./jsonpatch":7}],7:[function(require,module,exports){
    !function(){function t(){this.includeMoveDestinations=!1}function e(t){return t[t.length-1]}function n(t,e){return t.sort(e),t}function o(t){return n(t,function(t,n){var o=t.path.split("/"),r=n.path.split("/");return o.length!==r.length?o.length-r.length:d(e(o),e(r))})}function r(t,e){var n=[],o=[];return t.forEach(function(t){var r=e(t)?n:o;r.push(t)}),[n,o]}function p(t){var e=r(t,function(t){return"remove"===t.op}),n=e[0],p=e[1],u=o(n);return u.concat(p)}var u=require("./base"),i=u.BaseFormatter,a={added:"add",deleted:"remove",modified:"replace",moved:"moved",movedestination:"movedestination",unchanged:"unchanged",error:"error",textDiffLine:"textDiffLine"};t.prototype=new i,t.prototype.prepareContext=function(t){i.prototype.prepareContext.call(this,t),t.result=[],t.path=[],t.pushCurrentOp=function(t,e){var n={op:t,path:this.currentPath()};"undefined"!=typeof e&&(n.value=e),this.result.push(n)},t.currentPath=function(){return"/"+this.path.join("/")}},t.prototype.typeFormattterErrorFormatter=function(t,e){t.out("[ERROR]"+e)},t.prototype.rootBegin=function(){},t.prototype.rootEnd=function(){},t.prototype.nodeBegin=function(t,e,n){t.path.push(n)},t.prototype.nodeEnd=function(t){t.path.pop()},t.prototype.format_unchanged=function(t,e,n){"undefined"!=typeof n&&t.pushCurrentOp(a.unchanged,n)},t.prototype.format_movedestination=function(t,e,n){"undefined"!=typeof n&&t.pushCurrentOp(a.movedestination,n)},t.prototype.format_node=function(t,e,n){this.formatDeltaChildren(t,e,n)},t.prototype.format_added=function(t,e){t.pushCurrentOp(a.added,e[0])},t.prototype.format_modified=function(t,e){t.pushCurrentOp(a.modified,e[1])},t.prototype.format_deleted=function(t){t.pushCurrentOp(a.deleted)},t.prototype.format_moved=function(t,e){t.pushCurrentOp(a.moved,e[1])},t.prototype.format_textdiff=function(){throw"not implimented"},t.prototype.format=function(t,e){var n={};return this.prepareContext(n),this.recurse(n,t,e),n.result},exports.JSONFormatter=t;var f,d=function(t,e){var n=parseInt(t,10),o=parseInt(e,10);return isNaN(n)||isNaN(o)?0:o-n},c=function(e,n){return f||(f=new t),p(f.format(e,n))};exports.log=function(t,e){console.log(c(t,e))},exports.format=c}();
},{"./base":4}]},{},[1])(1)
});


