/*
 
jSignature v2 "2012-11-01T22:48" "commit ID 1c15dfafecc75925c3b7d529356a558b59220edb"
Copyright (c) 2012 Willow Systems Corp http://willow-systems.com
Copyright (c) 2010 Brinley Ang http://www.unbolt.net
MIT License <http://www.opensource.org/licenses/mit-license.php> 


Simplify.js BSD 
(c) 2012, Vladimir Agafonkin
mourner.github.com/simplify-js


base64 encoder
MIT, GPL
http://phpjs.org/functions/base64_encode
+   original by: Tyler Akins (http://rumkin.com)
+   improved by: Bayron Guevara
+   improved by: Thunder.m
+   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
+   bugfixed by: Pellentesque Malesuada
+   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
+   improved by: Rafal Kukawski (http://kukawski.pl)


jSignature v2 jSignature's Undo Button and undo functionality plugin


jSignature v2 jSignature's custom "base30" format export and import plugins.


jSignature v2 SVG export plugin.

*/
(function(){function q(b){for(var j,s=b.css("color"),g,b=b[0],c=!1;b&&!g&&!c;){try{j=$(b).css("background-color")}catch(d){j="transparent"}"transparent"!==j&&"rgba(0, 0, 0, 0)"!==j&&(g=j);c=b.body;b=b.parentNode}var b=/rgb[a]*\((\d+),\s*(\d+),\s*(\d+)/,c=/#([AaBbCcDdEeFf\d]{2})([AaBbCcDdEeFf\d]{2})([AaBbCcDdEeFf\d]{2})/,a;j=void 0;(j=s.match(b))?a={r:parseInt(j[1],10),g:parseInt(j[2],10),b:parseInt(j[3],10)}:(j=s.match(c))&&(a={r:parseInt(j[1],16),g:parseInt(j[2],16),b:parseInt(j[3],16)});var f;g?
(j=void 0,(j=g.match(b))?f={r:parseInt(j[1],10),g:parseInt(j[2],10),b:parseInt(j[3],10)}:(j=g.match(c))&&(f={r:parseInt(j[1],16),g:parseInt(j[2],16),b:parseInt(j[3],16)})):f=a?127<Math.max.apply(null,[a.r,a.g,a.b])?{r:0,g:0,b:0}:{r:255,g:255,b:255}:{r:255,g:255,b:255};j=function(b){return"rgb("+[b.r,b.g,b.b].join(", ")+")"};a&&f?(b=Math.max.apply(null,[a.r,a.g,a.b]),a=Math.max.apply(null,[f.r,f.g,f.b]),a=Math.round(a+-0.75*(a-b)),a={r:a,g:a,b:a}):a?(a=Math.max.apply(null,[a.r,a.g,a.b]),b=1,127<a&&
(b=-1),a=Math.round(a+96*b),a={r:a,g:a,b:a}):a={r:191,g:191,b:191};return{color:s,"background-color":f?j(f):g,"decor-color":j(a)}}function m(b,j){this.x=b;this.y=j;this.reverse=function(){return new this.constructor(-1*this.x,-1*this.y)};this._length=null;this.getLength=function(){this._length||(this._length=Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2)));return this._length};var s=function(b){return Math.round(b/Math.abs(b))};this.resizeTo=function(b){if(0===this.x&&0===this.y)this._length=0;else if(0===
this.x)this._length=b,this.y=b*s(this.y);else if(0===this.y)this._length=b,this.x=b*s(this.x);else{var j=Math.abs(this.y/this.x),a=Math.sqrt(Math.pow(b,2)/(1+Math.pow(j,2))),j=j*a;this._length=b;this.x=a*s(this.x);this.y=j*s(this.y)}return this};this.angleTo=function(b){var j=this.getLength()*b.getLength();return 0===j?0:Math.acos(Math.min(Math.max((this.x*b.x+this.y*b.y)/j,-1),1))/Math.PI}}function k(b,j){this.x=b;this.y=j;this.getVectorToCoordinates=function(b,j){return new m(b-this.x,j-this.y)};
this.getVectorFromCoordinates=function(b,j){return this.getVectorToCoordinates(b,j).reverse()};this.getVectorToPoint=function(b){return new m(b.x-this.x,b.y-this.y)};this.getVectorFromPoint=function(b){return this.getVectorToPoint(b).reverse()}}function t(b,j,a,g,c){this.data=b;this.context=j;if(b.length)for(var d=b.length,f,l,i=0;i<d;i++){f=b[i];l=f.x.length;a.call(j,f);for(var e=1;e<l;e++)g.call(j,f,e);c.call(j,f)}this.changed=function(){};this.startStrokeFn=a;this.addToStrokeFn=g;this.endStrokeFn=
c;this.inStroke=!1;this._stroke=this._lastPoint=null;this.startStroke=function(b){if(b&&"number"==typeof b.x&&"number"==typeof b.y){this._stroke={x:[b.x],y:[b.y]};this.data.push(this._stroke);this._lastPoint=b;this.inStroke=!0;var j=this._stroke,a=this.startStrokeFn,g=this.context;setTimeout(function(){a.call(g,j)},3);return b}return null};this.addToStroke=function(b){if(this.inStroke&&"number"===typeof b.x&&"number"===typeof b.y&&4<Math.abs(b.x-this._lastPoint.x)+Math.abs(b.y-this._lastPoint.y)){var j=
this._stroke.x.length;this._stroke.x.push(b.x);this._stroke.y.push(b.y);this._lastPoint=b;var a=this._stroke,g=this.addToStrokeFn,s=this.context;setTimeout(function(){g.call(s,a,j)},3);return b}return null};this.endStroke=function(){var b=this.inStroke;this.inStroke=!1;this._lastPoint=null;if(b){var j=this._stroke,a=this.endStrokeFn,g=this.context,s=this.changed;setTimeout(function(){a.call(g,j);s.call(g)},3);return!0}return null}}function r(b,j,a){var g=this.$parent=$(b),b=this.eventTokens={};this.events=
new v(this);var c=$.fn[e]("globalEvents"),d={width:"ratio",height:"ratio",sizeRatio:4,color:"#000","background-color":"#fff","decor-color":"#eee",lineWidth:0,minFatFingerCompensation:-10,showUndoButton:!1,data:[]};$.extend(d,q(g));j&&$.extend(d,j);this.settings=d;for(var f in a)a.hasOwnProperty(f)&&a[f].call(this,f);this.events.publish(e+".initializing");this.$controlbarUpper=$('<div style="padding:0 !important;margin:0 !important;width: 100% !important; height: 0 !important;margin-top:-1em !important;margin-bottom:1em !important;"></div>').appendTo(g);
this.isCanvasEmulator=!1;a=this.canvas=this.initializeCanvas(d);j=$(a);this.$controlbarLower=$('<div style="padding:0 !important;margin:0 !important;width: 100% !important; height: 0 !important;margin-top:-1.5em !important;margin-bottom:1.5em !important;"></div>').appendTo(g);this.canvasContext=a.getContext("2d");j.data(e+".this",this);g=(g=d.lineWidth)?g:Math.max(Math.round(a.width/400),2);d.lineWidth=g;this.lineCurveThreshold=3*d.lineWidth;d.cssclass&&""!=$.trim(d.cssclass)&&j.addClass(d.cssclass);
this.fatFingerCompensation=0;var g=function(b){var j,a,g=function(g){g=g.changedTouches&&0<g.changedTouches.length?g.changedTouches[0]:g;return new k(Math.round(g.pageX+j),Math.round(g.pageY+a)+b.fatFingerCompensation)},d=new y(750,function(){b.dataEngine.endStroke()});this.drawEndHandler=function(j){try{j.preventDefault()}catch(a){}d.clear();b.dataEngine.endStroke()};this.drawStartHandler=function(c){c.preventDefault();var s=$(b.canvas).offset();j=-1*s.left;a=-1*s.top;b.dataEngine.startStroke(g(c));
d.kick()};this.drawMoveHandler=function(j){j.preventDefault();b.dataEngine.inStroke&&(b.dataEngine.addToStroke(g(j)),d.kick())};return this}.call({},this),l=g.drawEndHandler,i=g.drawStartHandler,p=g.drawMoveHandler,h=this.canvas,j=$(h);this.isCanvasEmulator?(j.bind("mousemove."+e,p),j.bind("mouseup."+e,l),j.bind("mousedown."+e,i)):(h.ontouchstart=function(b){h.onmousedown=void 0;h.onmouseup=void 0;h.onmousemove=void 0;this.fatFingerCompensation=d.minFatFingerCompensation&&-3*d.lineWidth>d.minFatFingerCompensation?
-3*d.lineWidth:d.minFatFingerCompensation;i(b);h.ontouchend=l;h.ontouchstart=i;h.ontouchmove=p},h.onmousedown=function(b){h.ontouchstart=void 0;h.ontouchend=void 0;h.ontouchmove=void 0;i(b);h.onmousedown=i;h.onmouseup=l;h.onmousemove=p});b[e+".windowmouseup"]=c.subscribe(e+".windowmouseup",g.drawEndHandler);this.events.publish(e+".attachingEventHandlers");var n=this,b=d.width.toString(10),w=e;if("ratio"===b||"%"===b.split("")[b.length-1])this.eventTokens[w+".parentresized"]=c.subscribe(w+".parentresized",
function(b,j,a){return function(){var g=j.width();if(g!==a){for(var d in b)b.hasOwnProperty(d)&&(c.unsubscribe(b[d]),delete b[d]);var s=n.settings;n.$parent.children().remove();for(d in n)n.hasOwnProperty(d)&&delete n[d];d=s.data;var g=1*g/a,f=[],l,i,e,h,k,p;i=0;for(e=d.length;i<e;i++){p=d[i];l={x:[],y:[]};h=0;for(k=p.x.length;h<k;h++)l.x.push(p.x[h]*g),l.y.push(p.y[h]*g);f.push(l)}s.data=f;j[w](s)}}}(this.eventTokens,this.$parent,this.$parent.width(),1*this.canvas.width/this.canvas.height));this.resetCanvas(d.data);
this.events.publish(e+".initialized");return this}var e="jSignature",y=function(b,j){var a;this.kick=function(){clearTimeout(a);a=setTimeout(j,b)};this.clear=function(){clearTimeout(a)};return this},v=function(b){this.topics={};this.context=b?b:this;this.publish=function(b,a,g,d){if(this.topics[b]){var c=this.topics[b],f=Array.prototype.slice.call(arguments,1),l=[],i,e,h,p;e=0;for(h=c.length;e<h;e++)p=c[e],i=p[0],p[1]&&(p[0]=function(){},l.push(e)),i.apply(this.context,f);e=0;for(h=l.length;e<h;e++)c.splice(l[e],
1)}};this.subscribe=function(b,a,g){this.topics[b]?this.topics[b].push([a,g]):this.topics[b]=[[a,g]];return{topic:b,callback:a}};this.unsubscribe=function(b){if(this.topics[b.topic])for(var a=this.topics[b.topic],g=0,d=a.length;g<d;g++)a[g][0]===b.callback&&a.splice(g,1)}},z=function(b){var a=this.canvasContext,d=b.x[0],b=b.y[0],g=this.settings.lineWidth,c=a.fillStyle;a.fillStyle=a.strokeStyle;a.fillRect(d+g/-2,b+g/-2,g,g);a.fillStyle=c},u=function(b,a){var d=new k(b.x[a-1],b.y[a-1]),g=new k(b.x[a],
b.y[a]),c=d.getVectorToPoint(g);if(1<a){var f=new k(b.x[a-2],b.y[a-2]),l=f.getVectorToPoint(d),i;if(l.getLength()>this.lineCurveThreshold){i=2<a?(new k(b.x[a-3],b.y[a-3])).getVectorToPoint(f):new m(0,0);var e=0.35*l.getLength(),h=l.angleTo(i.reverse()),p=c.angleTo(l.reverse());i=(new m(i.x+l.x,i.y+l.y)).resizeTo(Math.max(0.05,h)*e);var n=(new m(l.x+c.x,l.y+c.y)).reverse().resizeTo(Math.max(0.05,p)*e),l=this.canvasContext,e=f.x,p=f.y,h=d.x,w=d.y,A=f.x+i.x,f=f.y+i.y;i=d.x+n.x;n=d.y+n.y;l.beginPath();
l.moveTo(e,p);l.bezierCurveTo(A,f,i,n,h,w);l.stroke()}}c.getLength()<=this.lineCurveThreshold&&(c=this.canvasContext,f=d.x,d=d.y,i=g.x,g=g.y,c.beginPath(),c.moveTo(f,d),c.lineTo(i,g),c.stroke())},x=function(b){var a=b.x.length-1;if(0<a){var d=new k(b.x[a],b.y[a]),g=new k(b.x[a-1],b.y[a-1]),c=g.getVectorToPoint(d);if(c.getLength()>this.lineCurveThreshold){if(1<a){var b=(new k(b.x[a-2],b.y[a-2])).getVectorToPoint(g),f=(new m(b.x+c.x,b.y+c.y)).resizeTo(c.getLength()/2),c=this.canvasContext,b=g.x,a=g.y,
l=d.x,i=d.y,e=g.x+f.x,g=g.y+f.y,f=d.x,d=d.y;c.beginPath();c.moveTo(b,a);c.bezierCurveTo(e,g,f,d,l,i)}else c=this.canvasContext,b=g.x,g=g.y,a=d.x,d=d.y,c.beginPath(),c.moveTo(b,g),c.lineTo(a,d);c.stroke()}}};r.prototype.resetCanvas=function(b){var a=this.canvas,d=this.settings,c=this.canvasContext,f=this.isCanvasEmulator,l=a.width,i=a.height;c.clearRect(0,0,l+30,i+30);c.shadowColor=c.fillStyle=d["background-color"];f&&c.fillRect(0,0,l+30,i+30);c.lineWidth=Math.ceil(parseInt(d.lineWidth,10));c.lineCap=
c.lineJoin="round";c.strokeStyle=d["decor-color"];c.shadowOffsetX=0;c.shadowOffsetY=0;var h=Math.round(i/5),p=1.5*h,k=i-h,l=l-1.5*h,i=i-h;c.beginPath();c.moveTo(p,k);c.lineTo(l,i);c.stroke();c.strokeStyle=d.color;f||(c.shadowColor=c.strokeStyle,c.shadowOffsetX=0.5*c.lineWidth,c.shadowOffsetY=-0.6*c.lineWidth,c.shadowBlur=0);b||(b=[]);c=this.dataEngine=new t(b,this,z,u,x);d.data=b;$(a).data(e+".data",b).data(e+".settings",d);var n=this.$parent,w=this.events,A=e;c.changed=function(){w.publish(A+".change");
n.trigger("change")};c.changed();return!0};r.prototype.initializeCanvas=function(b){var a=document.createElement("canvas"),c=$(a);b.width===b.height&&"ratio"===b.height&&(b.width="100%");c.css("margin",0).css("padding",0).css("border","none").css("height","ratio"===b.height||!b.height?1:b.height.toString(10)).css("width","ratio"===b.width||!b.width?1:b.width.toString(10));c.appendTo(this.$parent);"ratio"===b.height?c.css("height",Math.round(c.width()/b.sizeRatio)):"ratio"===b.width&&c.css("width",
Math.round(c.height()*b.sizeRatio));c.addClass(e);a.width=c.width();a.height=c.height();b=a;if(b.getContext)b=!1;else{var c=b.ownerDocument.parentWindow,d=c.FlashCanvas?b.ownerDocument.parentWindow.FlashCanvas:"undefined"===typeof FlashCanvas?void 0:FlashCanvas;if(d){b=d.initElement(b);d=1;c&&(c.screen&&c.screen.deviceXDPI&&c.screen.logicalXDPI)&&(d=1*c.screen.deviceXDPI/c.screen.logicalXDPI);if(1!==d)try{$(b).children("object").get(0).resize(Math.ceil(b.width*d),Math.ceil(b.height*d)),b.getContext("2d").scale(d,
d)}catch(f){}b=!0}else throw Error("Canvas element does not support 2d context. jSignature cannot proceed.");}this.isCanvasEmulator=b;a.onselectstart=function(b){b&&b.preventDefault&&b.preventDefault();b&&b.stopPropagation&&b.stopPropagation();return!1};return a};var p=window,h=function(b,a){var c=new Image,d=this;c.onload=function(){d.getContext("2d").drawImage(c,0,0,c.width<d.width?c.width:d.width,c.height<d.height?c.height:d.height)};c.src="data:"+a+","+b},a=function(b){this.find("canvas."+e).add(this.filter("canvas."+
e)).data(e+".this").resetCanvas(b);return this},f=function(b,a){if(void 0===a&&("string"===typeof b&&"data:"===b.substr(0,5))&&(a=b.slice(5).split(",")[0],b=b.slice(6+a.length),a===b))return;var c=this.find("canvas."+e).add(this.filter("canvas."+e));if(n.hasOwnProperty(a))0!==c.length&&n[a].call(c[0],b,a,function(b){return function(){return b.resetCanvas.apply(b,arguments)}}(c.data(e+".this")));else throw Error(e+" is unable to find import plugin with for format '"+String(a)+"'");return this},d=new v,
c=e,l,i=function(){d.publish(c+".parentresized")};$(p).bind("resize."+c,function(){l&&clearTimeout(l);l=setTimeout(i,500)}).bind("mouseup."+c,function(){d.publish(c+".windowmouseup")});var w={},A={"default":function(){return this.toDataURL()},"native":function(b){return b},image:function(){var b=this.toDataURL();if("string"===typeof b&&4<b.length&&"data:"===b.slice(0,5)&&-1!==b.indexOf(",")){var a=b.indexOf(",");return[b.slice(5,a),b.substr(a+1)]}return[]}},n={"native":function(b,a,c){c(b)},image:h,
"image/png;base64":h,"image/jpeg;base64":h,"image/jpg;base64":h},B={"export":A,"import":n,instance:w},C={init:function(b){return this.each(function(){var a,c=!1;for(a=this.parentNode;a&&!c;)c=a.body,a=a.parentNode;!c||new r(this,b,w)})},getSettings:function(){return this.find("canvas."+e).add(this.filter("canvas."+e)).data(e+".this").settings},clear:a,reset:a,addPlugin:function(b,a,c){B.hasOwnProperty(b)&&(B[b][a]=c);return this},listPlugins:function(b){var a=[];if(B.hasOwnProperty(b)){var b=B[b],
c;for(c in b)b.hasOwnProperty(c)&&a.push(c)}return a},getData:function(b){var a=this.find("canvas."+e).add(this.filter("canvas."+e));void 0===b&&(b="default");if(0!==a.length&&A.hasOwnProperty(b))return A[b].call(a.get(0),a.data(e+".data"))},importData:f,setData:f,globalEvents:function(){return d},events:function(){return this.find("canvas."+e).add(this.filter("canvas."+e)).data(e+".this").events}};$.fn[e]=function(b){if(!b||"object"===typeof b)return C.init.apply(this,arguments);if("string"===typeof b&&
C[b])return C[b].apply(this,Array.prototype.slice.call(arguments,1));$.error("Method "+String(b)+" does not exist on jQuery."+e)}})();
(function(){$.fn.jSignature("addPlugin","instance","UndoButton",function(q){this.events.subscribe("jSignature.attachingEventHandlers",function(){if(this.settings[q]){var m=this.settings[q];"function"!==typeof m&&(m=function(){var e=$('<input type="button" value="Undo last stroke" style="position:absolute;display:none;margin:0 !important;top:auto" />').appendTo(this.$controlbarLower),k=e.width();e.css("left",Math.round((this.canvas.width-k)/2));k!==e.width()&&e.width(k);return e});var k=m.call(this),
t=this;t.events.subscribe("jSignature.change",function(){t.dataEngine.data.length?k.show():k.hide()});var r=this,e=(this.events.topics.hasOwnProperty("jSignature.undo")?q:"jSignature")+".undo";k.bind("click",function(){r.events.publish(e)});r.events.subscribe(e,function(){var e=r.dataEngine.data;e.length&&(e.pop(),r.resetCanvas(e))})}})})})();
(function(){for(var q={},m={},k="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX".split(""),t=k.length/2,r=t-1;-1<r;r--)q[k[r]]=k[r+t],m[k[r+t]]=k[r];var e=function(e){for(var e=e.split(""),h=e.length,a=1;a<h;a++)e[a]=q[e[a]];return e.join("")},y=function(k){for(var h=[],a=0,f=1,d=k.length,c,l,i=0;i<d;i++)c=Math.round(k[i]),l=c-a,a=c,0>l&&0<f?(f=-1,h.push("Z")):0<l&&0>f&&(f=1,h.push("Y")),c=Math.abs(l),c>=t?h.push(e(c.toString(t))):h.push(c.toString(t));return h.join("")},v=function(e){for(var h=
[],e=e.split(""),a=e.length,f,d=1,c=[],l=0,i=0;i<a;i++)f=e[i],f in q||"Z"===f||"Y"===f?(0!==c.length&&(c=parseInt(c.join(""),t)*d+l,h.push(c),l=c),"Z"===f?(d=-1,c=[]):"Y"===f?(d=1,c=[]):c=[f]):c.push(m[f]);h.push(parseInt(c.join(""),t)*d+l);return h},z=function(e){for(var h=[],a=e.length,f,d=0;d<a;d++)f=e[d],h.push(y(f.x)),h.push(y(f.y));return h.join("_")},u=function(e){for(var h=[],e=e.split("_"),a=e.length/2,f=0;f<a;f++)h.push({x:v(e[2*f]),y:v(e[2*f+1])});return h},k=function(e){return["image/jsignature;base30",
z(e)]},r=function(e,h,a){"string"===typeof e&&("image/jsignature;base30"===e.substring(0,23).toLowerCase()&&(e=e.substring(24)),a(u(e)))};if(null==this.jQuery)throw Error("We need jQuery for some of the functionality. jQuery is not detected. Failing to initialize...");var x=this.jQuery.fn.jSignature;x("addPlugin","export","base30",k);x("addPlugin","export","image/jsignature;base30",k);x("addPlugin","import","base30",r);x("addPlugin","import","image/jsignature;base30",r);this.jSignatureDebug&&(this.jSignatureDebug.base30=
{remapTailChars:e,compressstrokeleg:y,uncompressstrokeleg:v,compressstrokes:z,uncompressstrokes:u,charmap:q})}).call("undefined"!==typeof window?window:this);
(function(){function q(a,f){this.x=a;this.y=f;this.reverse=function(){return new this.constructor(-1*this.x,-1*this.y)};this._length=null;this.getLength=function(){this._length||(this._length=Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2)));return this._length};var d=function(a){return Math.round(a/Math.abs(a))};this.resizeTo=function(a){if(0===this.x&&0===this.y)this._length=0;else if(0===this.x)this._length=a,this.y=a*d(this.y);else if(0===this.y)this._length=a,this.x=a*d(this.x);else{var f=Math.abs(this.y/
this.x),e=Math.sqrt(Math.pow(a,2)/(1+Math.pow(f,2))),f=f*e;this._length=a;this.x=e*d(this.x);this.y=f*d(this.y)}return this};this.angleTo=function(a){var d=this.getLength()*a.getLength();return 0===d?0:Math.acos(Math.min(Math.max((this.x*a.x+this.y*a.y)/d,-1),1))/Math.PI}}function m(a,f){this.x=a;this.y=f;this.getVectorToCoordinates=function(a,c){return new q(a-this.x,c-this.y)};this.getVectorFromCoordinates=function(a,c){return this.getVectorToCoordinates(a,c).reverse()};this.getVectorToPoint=function(a){return new q(a.x-
this.x,a.y-this.y)};this.getVectorFromPoint=function(a){return this.getVectorToPoint(a).reverse()}}function k(a,f){var d=Math.pow(10,f);return Math.round(a*d)/d}function t(a,f,d){var f=f+1,c=new m(a.x[f-1],a.y[f-1]),e=new m(a.x[f],a.y[f]),e=c.getVectorToPoint(e),i=new m(a.x[f-2],a.y[f-2]),c=i.getVectorToPoint(c);return c.getLength()>d?(d=2<f?(new m(a.x[f-3],a.y[f-3])).getVectorToPoint(i):new q(0,0),a=0.35*c.getLength(),i=c.angleTo(d.reverse()),f=e.angleTo(c.reverse()),d=(new q(d.x+c.x,d.y+c.y)).resizeTo(Math.max(0.05,
i)*a),e=(new q(c.x+e.x,c.y+e.y)).reverse().resizeTo(Math.max(0.05,f)*a),e=new q(c.x+e.x,c.y+e.y),["c",k(d.x,2),k(d.y,2),k(e.x,2),k(e.y,2),k(c.x,2),k(c.y,2)]):["l",k(c.x,2),k(c.y,2)]}function r(a,f){var d=a.x.length-1,c=new m(a.x[d],a.y[d]),e=new m(a.x[d-1],a.y[d-1]),c=e.getVectorToPoint(c);if(1<d&&c.getLength()>f){var d=(new m(a.x[d-2],a.y[d-2])).getVectorToPoint(e),e=c.angleTo(d.reverse()),i=0.35*c.getLength(),d=(new q(d.x+c.x,d.y+c.y)).resizeTo(Math.max(0.05,e)*i);return["c",k(d.x,2),k(d.y,2),k(c.x,
2),k(c.y,2),k(c.x,2),k(c.y,2)]}return["l",k(c.x,2),k(c.y,2)]}function e(a,e,d){for(var e=["M",k(a.x[0]-e,2),k(a.y[0]-d,2)],d=1,c=a.x.length-1;d<c;d++)e.push.apply(e,t(a,d,1));0<c?e.push.apply(e,r(a,d,1)):0===c&&e.push.apply(e,["l",1,1]);return e.join(" ")}function y(a){var f=['<?xml version="1.0" encoding="UTF-8" standalone="no"?>','<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'],d,c=a.length,l,i=[],h=[],k=l=d=0,n=0,p=[];if(0!==c){for(d=0;d<c;d++){k=
a[d];n=[];l={x:[],y:[]};for(var m=void 0,b=void 0,m=0,b=k.x.length;m<b;m++)n.push({x:k.x[m],y:k.y[m]});n=simplify(n,0.7,!0);m=0;for(b=n.length;m<b;m++)l.x.push(n[m].x),l.y.push(n[m].y);p.push(l);i=i.concat(l.x);h=h.concat(l.y)}a=Math.min.apply(null,i)-1;c=Math.max.apply(null,i)+1;i=Math.min.apply(null,h)-1;h=Math.max.apply(null,h)+1;k=0>a?0:a;n=0>i?0:i;d=c-a;l=h-i}f.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="'+d.toString()+'" height="'+l.toString()+'">');d=0;for(c=p.length;d<
c;d++)l=p[d],f.push('<path fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="'+e(l,k,n)+'"/>');f.push("</svg>");return f.join("")}function v(a){return[p,y(a)]}function z(a){return[h,x(y(a))]}var u=window;"use strict";("undefined"!=typeof exports?exports:u).simplify=function(a,e,d){e=void 0!==e?e*e:1;if(!d){for(var c=a.length,l,i=a[0],h=[i],d=1;d<c;d++){l=a[d];var k=l.x-i.x,n=l.y-i.y;k*k+n*n>e&&(h.push(l),i=l)}a=(i!==l&&h.push(l),h)}l=a;var d=l.length,
c=new ("undefined"!=typeof Uint8Array?Uint8Array:Array)(d),i=0,h=d-1,m,p,b=[],j=[],s=[];for(c[i]=c[h]=1;h;){n=0;for(k=i+1;k<h;k++){m=l[k];var g=l[i],r=l[h],q=g.x,t=g.y,g=r.x-q,u=r.y-t,v=void 0;if(0!==g||0!==u)v=((m.x-q)*g+(m.y-t)*u)/(g*g+u*u),1<v?(q=r.x,t=r.y):0<v&&(q+=g*v,t+=u*v);m=(g=m.x-q,u=m.y-t,g*g+u*u);m>n&&(p=k,n=m)}n>e&&(c[p]=1,b.push(i),j.push(p),b.push(p),j.push(h));i=b.pop();h=j.pop()}for(k=0;k<d;k++)c[k]&&s.push(l[k]);return a=s,a};if("function"!==typeof x)var x=function(a){var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split(""),
d,c,h,i,k=0,m=0,n="",n=[];do d=a.charCodeAt(k++),c=a.charCodeAt(k++),h=a.charCodeAt(k++),i=d<<16|c<<8|h,d=i>>18&63,c=i>>12&63,h=i>>6&63,i&=63,n[m++]=e[d]+e[c]+e[h]+e[i];while(k<a.length);n=n.join("");a=a.length%3;return(a?n.slice(0,a-3):n)+"===".slice(a||3)};var p="image/svg+xml",h="image/svg+xml;base64";if("undefined"===typeof $)throw Error("We need jQuery for some of the functionality. jQuery is not detected. Failing to initialize...");u=$.fn.jSignature;u("addPlugin","export","svg",v);u("addPlugin",
"export",p,v);u("addPlugin","export","svgbase64",z);u("addPlugin","export",h,z)})();

/*
* Extend Function
* elementID: ID Of Element Init
* elementIDTo: ID Of Element Fill Base64
* */
class signature3F {
    constructor( elementID, elementIDTo ) {
        let _this = this;

        _this.objID = typeof elementID !== "undefined" ? elementID : '#signature';
        _this.objIDTo = typeof elementIDTo !== "undefined" ? elementIDTo : '#signatureTo';

        // Append HTML
        $(_this.objID).html('<div class="signatureInput"></div><div class="signatureBtnClear">Clear</div>');

        // Init
        _this.signature = $(_this.objID).find('.signatureInput').jSignature();

        // Clear
        $(_this.objID).find('.signatureBtnClear').bind('click', function(e){
            _this.signature.jSignature('reset')
        });
    }
    fill() {
        let _this = this;

        // Export Base 64
        let signatureBase64 = _this.signature.jSignature("getData", "default");
        $(_this.objIDTo).val(signatureBase64);
    }
    clean(){
        let _this = this;

        // Clean Base 64
        $(_this.objIDTo).val('');
    }
    isSignature() {
        let _this = this;
        let signatureNative = _this.signature.jSignature('getData', 'native');
        return signatureNative && signatureNative.length > 0;
    }
}