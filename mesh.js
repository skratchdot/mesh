/*jslint maxerr: 50, indent: 4, nomen: true */
/*global print, _, moment, db */
/*!
 * mesh - the MongoDB Extended Shell
 * 
 *      Version: 1.1.3
 *         Date: August 16, 2012
 *      Project: http://skratchdot.com/projects/mesh/
 *  Source Code: https://github.com/skratchdot/mesh/
 *       Issues: https://github.com/skratchdot/mesh/issues/
 * Dependencies: MongoDB v1.8+
 * 
 * Copyright 2012 <skratchdot.com>
 *   Dual licensed under the MIT or GPL Version 2 licenses.
 *   https://raw.github.com/skratchdot/mesh/master/LICENSE-MIT.txt
 *   https://raw.github.com/skratchdot/mesh/master/LICENSE-GPL.txt
 * 
 * Includes:
 * 
 *   underscore.js - http://underscorejs.org
 *     Copyright (c) 2009-2012 Jeremy Ashkenas, DocumentCloud
 *   
 *   underscore.string.js - http://epeli.github.com/underscore.string/
 *     Copyright (c) 2011 Esa-Matti Suuronen esa-matti@suuronen.org
 *   
 *   moment.js - momentjs.com
 *     Copyright (c) 2011-2012 Tim Wood
 * 
 */
var mesh = mesh || (function (global) {
	'use strict';

	var api,
		config = {
			defaultPrompt : 0
		};

	/*
	 * This is the "mesh" function. If someone types: mesh(), then we will just
	 * print the current version info.
	 */
	api = function () {
		return api.version();
	};

	/*
	 * Override mesh.toString() so it calls mesh.help();
	 */
	api.toString = function () {
		api.help();
		return "";
	};

	/*
	 * We can override the default settings by calling this function.
	 * 
	 * The idea is to keep a "mesh.config.js" file that calls this function.
	 * 
	 * When updating mesh.js, we will never override mesh.config.js
	 */
	api.config = function (settings) {
		// Handle defaultPrompt
		if (settings.hasOwnProperty('defaultPrompt')) {
			config.defaultPrompt = settings.defaultPrompt;
			api.setPrompt(config.defaultPrompt);
		}
	};

	/*
	 * Print the current version
	 */
	api.version = function () {
		return print('mesh (the MongoDB Extended Shell) version: 1.1.3');
	};

	/*
	 * Print help information.
	 * 
	 * TODO: make sure that "help mesh" works as well by overriding default mongo help()
	 */
	api.help = function () {
		api.version();
		print('help coming soon!');
	};

	/*
	 * Sets the default prompt.
	 * 
	 * See: http://www.kchodorow.com/blog/2011/06/27/ps1/
	 * 
	 * newPrompt can be a function, or a number:
	 * 
	 *   0: '>' reset to default prompt
	 *   1: 'dbname>'
	 *   2: 'dbname>' for PRIMARY, '(dbname)>' for SECONDARY
	 *   3: 'host:dbname>'
	 *   4: '[YYYY-MM-DD hh:mm:ss] host:dbname>'
	 */
	api.setPrompt = function (newPrompt) {
		var base = '>';
		if (typeof newPrompt === 'function') {
			global.prompt = newPrompt;
		} else if (newPrompt === 1) {
			global.prompt = function () {
				return db.getName() + base;
			};
		} else if (newPrompt === 2) {
			global.prompt = function () {
				var isMaster = db.isMaster().ismaster;
				return (isMaster ? '' : '(') +
					db.getName() +
					(isMaster ? '' : ')') +
					base;
			};
		} else if (newPrompt === 3) {
			global.prompt = function () {
				var isMaster = db.isMaster().ismaster;
				return (isMaster ? '' : '(') +
					db.serverStatus().host + ":" +
					db.getName() +
					(isMaster ? '' : ')') +
					base;
			};
		} else if (newPrompt === 4) {
			global.prompt = function () {
				var isMaster = db.isMaster().ismaster;
				return '[' + moment().format('YYYY-MM-DD hh:mm:ss') + '] ' +
					(isMaster ? '' : '(') +
					db.serverStatus().host + ":" +
					db.getName() +
					(isMaster ? '' : ')') +
					base;
			};
		} else {
			delete global.prompt;
		}
	};

	/*
	 * Returns a sorted array of all the keys in an object
	 */
	api.keys = function (obj) {
		return _.keys(obj || global).sort();
	};

	return api;
}(this));


// HACK: so that moment.js works
// See cleanup.js
// Since window doesn't exist in the mongo shell, we are temporarily setting it
// to be the mesh object. moment.js wants to be using node, or amd, or the browser.
// We'll act like a browser, then delete the window object in cleanup.js
var window = window || mesh;

/*global print */
/*jslint maxerr: 50, indent: 4, plusplus: true */
/**
 * console.js - a quick wrapper so console calls don't error out in the mongodb shell
 * 
 * All console calls are currently just wrappers for the built in print() function that
 * comes with the mongo shell.  Eventually, it would be good to add "real" behavior to
 * the console calls.  For instance, console.error() should wrap ThrowError(), and console.timer()
 * should work as well.
 * 
 */
(function (global) {
	'use strict';

	var i = 0,
		functionNames = [
			'assert', 'clear', 'count', 'debug', 'dir',
			'dirxml', 'error', 'exception', 'group', 'groupCollapsed',
			'groupEnd', 'info', 'log', 'profile', 'profileEnd', 'table',
			'time', 'timeEnd', 'timeStamp', 'trace', 'warn'
		],
		wrapperFunction = function () {
			print.apply(global, arguments);
		};

	// Make sure console exists
	global.console = global.console || {};

	// Make sure all functions exist
	for (i = 0; i < functionNames.length; i++) {
		global.console[functionNames[i]] = global.console[functionNames[i]] || wrapperFunction;
	}

}(this));
// Underscore.js 1.3.3
// (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
(function(){function r(a,c,d){if(a===c)return 0!==a||1/a==1/c;if(null==a||null==c)return a===c;a._chain&&(a=a._wrapped);c._chain&&(c=c._wrapped);if(a.isEqual&&b.isFunction(a.isEqual))return a.isEqual(c);if(c.isEqual&&b.isFunction(c.isEqual))return c.isEqual(a);var e=l.call(a);if(e!=l.call(c))return!1;switch(e){case "[object String]":return a==""+c;case "[object Number]":return a!=+a?c!=+c:0==a?1/a==1/c:a==+c;case "[object Date]":case "[object Boolean]":return+a==+c;case "[object RegExp]":return a.source==
c.source&&a.global==c.global&&a.multiline==c.multiline&&a.ignoreCase==c.ignoreCase}if("object"!=typeof a||"object"!=typeof c)return!1;for(var f=d.length;f--;)if(d[f]==a)return!0;d.push(a);var f=0,g=!0;if("[object Array]"==e){if(f=a.length,g=f==c.length)for(;f--&&(g=f in a==f in c&&r(a[f],c[f],d)););}else{if("constructor"in a!="constructor"in c||a.constructor!=c.constructor)return!1;for(var h in a)if(b.has(a,h)&&(f++,!(g=b.has(c,h)&&r(a[h],c[h],d))))break;if(g){for(h in c)if(b.has(c,h)&&!f--)break;
g=!f}}d.pop();return g}var s=this,I=s._,o={},k=Array.prototype,p=Object.prototype,i=k.slice,J=k.unshift,l=p.toString,K=p.hasOwnProperty,y=k.forEach,z=k.map,A=k.reduce,B=k.reduceRight,C=k.filter,D=k.every,E=k.some,q=k.indexOf,F=k.lastIndexOf,p=Array.isArray,L=Object.keys,t=Function.prototype.bind,b=function(a){return new m(a)};"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(exports=module.exports=b),exports._=b):s._=b;b.VERSION="1.3.3";var j=b.each=b.forEach=function(a,
c,d){if(a!=null)if(y&&a.forEach===y)a.forEach(c,d);else if(a.length===+a.length)for(var e=0,f=a.length;e<f;e++){if(e in a&&c.call(d,a[e],e,a)===o)break}else for(e in a)if(b.has(a,e)&&c.call(d,a[e],e,a)===o)break};b.map=b.collect=function(a,c,b){var e=[];if(a==null)return e;if(z&&a.map===z)return a.map(c,b);j(a,function(a,g,h){e[e.length]=c.call(b,a,g,h)});if(a.length===+a.length)e.length=a.length;return e};b.reduce=b.foldl=b.inject=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(A&&
a.reduce===A){e&&(c=b.bind(c,e));return f?a.reduce(c,d):a.reduce(c)}j(a,function(a,b,i){if(f)d=c.call(e,d,a,b,i);else{d=a;f=true}});if(!f)throw new TypeError("Reduce of empty array with no initial value");return d};b.reduceRight=b.foldr=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(B&&a.reduceRight===B){e&&(c=b.bind(c,e));return f?a.reduceRight(c,d):a.reduceRight(c)}var g=b.toArray(a).reverse();e&&!f&&(c=b.bind(c,e));return f?b.reduce(g,c,d,e):b.reduce(g,c)};b.find=b.detect=function(a,
c,b){var e;G(a,function(a,g,h){if(c.call(b,a,g,h)){e=a;return true}});return e};b.filter=b.select=function(a,c,b){var e=[];if(a==null)return e;if(C&&a.filter===C)return a.filter(c,b);j(a,function(a,g,h){c.call(b,a,g,h)&&(e[e.length]=a)});return e};b.reject=function(a,c,b){var e=[];if(a==null)return e;j(a,function(a,g,h){c.call(b,a,g,h)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,b){var e=true;if(a==null)return e;if(D&&a.every===D)return a.every(c,b);j(a,function(a,g,h){if(!(e=e&&c.call(b,
a,g,h)))return o});return!!e};var G=b.some=b.any=function(a,c,d){c||(c=b.identity);var e=false;if(a==null)return e;if(E&&a.some===E)return a.some(c,d);j(a,function(a,b,h){if(e||(e=c.call(d,a,b,h)))return o});return!!e};b.include=b.contains=function(a,c){var b=false;if(a==null)return b;if(q&&a.indexOf===q)return a.indexOf(c)!=-1;return b=G(a,function(a){return a===c})};b.invoke=function(a,c){var d=i.call(arguments,2);return b.map(a,function(a){return(b.isFunction(c)?c||a:a[c]).apply(a,d)})};b.pluck=
function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.max.apply(Math,a);if(!c&&b.isEmpty(a))return-Infinity;var e={computed:-Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.min.apply(Math,a);if(!c&&b.isEmpty(a))return Infinity;var e={computed:Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b<e.computed&&
(e={value:a,computed:b})});return e.value};b.shuffle=function(a){var b=[],d;j(a,function(a,f){d=Math.floor(Math.random()*(f+1));b[f]=b[d];b[d]=a});return b};b.sortBy=function(a,c,d){var e=b.isFunction(c)?c:function(a){return a[c]};return b.pluck(b.map(a,function(a,b,c){return{value:a,criteria:e.call(d,a,b,c)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c===void 0?1:d===void 0?-1:c<d?-1:c>d?1:0}),"value")};b.groupBy=function(a,c){var d={},e=b.isFunction(c)?c:function(a){return a[c]};
j(a,function(a,b){var c=e(a,b);(d[c]||(d[c]=[])).push(a)});return d};b.sortedIndex=function(a,c,d){d||(d=b.identity);for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?e=g+1:f=g}return e};b.toArray=function(a){return!a?[]:b.isArray(a)||b.isArguments(a)?i.call(a):a.toArray&&b.isFunction(a.toArray)?a.toArray():b.values(a)};b.size=function(a){return b.isArray(a)?a.length:b.keys(a).length};b.first=b.head=b.take=function(a,b,d){return b!=null&&!d?i.call(a,0,b):a[0]};b.initial=function(a,b,d){return i.call(a,
0,a.length-(b==null||d?1:b))};b.last=function(a,b,d){return b!=null&&!d?i.call(a,Math.max(a.length-b,0)):a[a.length-1]};b.rest=b.tail=function(a,b,d){return i.call(a,b==null||d?1:b)};b.compact=function(a){return b.filter(a,function(a){return!!a})};b.flatten=function(a,c){return b.reduce(a,function(a,e){if(b.isArray(e))return a.concat(c?e:b.flatten(e));a[a.length]=e;return a},[])};b.without=function(a){return b.difference(a,i.call(arguments,1))};b.uniq=b.unique=function(a,c,d){var d=d?b.map(a,d):a,
e=[];a.length<3&&(c=true);b.reduce(d,function(d,g,h){if(c?b.last(d)!==g||!d.length:!b.include(d,g)){d.push(g);e.push(a[h])}return d},[]);return e};b.union=function(){return b.uniq(b.flatten(arguments,true))};b.intersection=b.intersect=function(a){var c=i.call(arguments,1);return b.filter(b.uniq(a),function(a){return b.every(c,function(c){return b.indexOf(c,a)>=0})})};b.difference=function(a){var c=b.flatten(i.call(arguments,1),true);return b.filter(a,function(a){return!b.include(c,a)})};b.zip=function(){for(var a=
i.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),e=0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.indexOf=function(a,c,d){if(a==null)return-1;var e;if(d){d=b.sortedIndex(a,c);return a[d]===c?d:-1}if(q&&a.indexOf===q)return a.indexOf(c);d=0;for(e=a.length;d<e;d++)if(d in a&&a[d]===c)return d;return-1};b.lastIndexOf=function(a,b){if(a==null)return-1;if(F&&a.lastIndexOf===F)return a.lastIndexOf(b);for(var d=a.length;d--;)if(d in a&&a[d]===b)return d;return-1};b.range=function(a,b,d){if(arguments.length<=
1){b=a||0;a=0}for(var d=arguments[2]||1,e=Math.max(Math.ceil((b-a)/d),0),f=0,g=Array(e);f<e;){g[f++]=a;a=a+d}return g};var H=function(){};b.bind=function(a,c){var d,e;if(a.bind===t&&t)return t.apply(a,i.call(arguments,1));if(!b.isFunction(a))throw new TypeError;e=i.call(arguments,2);return d=function(){if(!(this instanceof d))return a.apply(c,e.concat(i.call(arguments)));H.prototype=a.prototype;var b=new H,g=a.apply(b,e.concat(i.call(arguments)));return Object(g)===g?g:b}};b.bindAll=function(a){var c=
i.call(arguments,1);c.length==0&&(c=b.functions(a));j(c,function(c){a[c]=b.bind(a[c],a)});return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var e=c.apply(this,arguments);return b.has(d,e)?d[e]:d[e]=a.apply(this,arguments)}};b.delay=function(a,b){var d=i.call(arguments,2);return setTimeout(function(){return a.apply(null,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(i.call(arguments,1)))};b.throttle=function(a,c){var d,e,f,g,h,i,j=b.debounce(function(){h=
g=false},c);return function(){d=this;e=arguments;f||(f=setTimeout(function(){f=null;h&&a.apply(d,e);j()},c));g?h=true:i=a.apply(d,e);j();g=true;return i}};b.debounce=function(a,b,d){var e;return function(){var f=this,g=arguments;d&&!e&&a.apply(f,g);clearTimeout(e);e=setTimeout(function(){e=null;d||a.apply(f,g)},b)}};b.once=function(a){var b=false,d;return function(){if(b)return d;b=true;return d=a.apply(this,arguments)}};b.wrap=function(a,b){return function(){var d=[a].concat(i.call(arguments,0));
return b.apply(this,d)}};b.compose=function(){var a=arguments;return function(){for(var b=arguments,d=a.length-1;d>=0;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=function(a,b){return a<=0?b():function(){if(--a<1)return b.apply(this,arguments)}};b.keys=L||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var c=[],d;for(d in a)b.has(a,d)&&(c[c.length]=d);return c};b.values=function(a){return b.map(a,b.identity)};b.functions=b.methods=function(a){var c=[],d;for(d in a)b.isFunction(a[d])&&
c.push(d);return c.sort()};b.extend=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]=b[d]});return a};b.pick=function(a){var c={};j(b.flatten(i.call(arguments,1)),function(b){b in a&&(c[b]=a[b])});return c};b.defaults=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]==null&&(a[d]=b[d])});return a};b.clone=function(a){return!b.isObject(a)?a:b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,b){return r(a,b,[])};b.isEmpty=
function(a){if(a==null)return true;if(b.isArray(a)||b.isString(a))return a.length===0;for(var c in a)if(b.has(a,c))return false;return true};b.isElement=function(a){return!!(a&&a.nodeType==1)};b.isArray=p||function(a){return l.call(a)=="[object Array]"};b.isObject=function(a){return a===Object(a)};b.isArguments=function(a){return l.call(a)=="[object Arguments]"};b.isArguments(arguments)||(b.isArguments=function(a){return!(!a||!b.has(a,"callee"))});b.isFunction=function(a){return l.call(a)=="[object Function]"};
b.isString=function(a){return l.call(a)=="[object String]"};b.isNumber=function(a){return l.call(a)=="[object Number]"};b.isFinite=function(a){return b.isNumber(a)&&isFinite(a)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return a===true||a===false||l.call(a)=="[object Boolean]"};b.isDate=function(a){return l.call(a)=="[object Date]"};b.isRegExp=function(a){return l.call(a)=="[object RegExp]"};b.isNull=function(a){return a===null};b.isUndefined=function(a){return a===void 0};b.has=function(a,
b){return K.call(a,b)};b.noConflict=function(){s._=I;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=0;e<a;e++)b.call(d,e)};b.escape=function(a){return(""+a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")};b.result=function(a,c){if(a==null)return null;var d=a[c];return b.isFunction(d)?d.call(a):d};b.mixin=function(a){j(b.functions(a),function(c){M(c,b[c]=a[c])})};var N=0;b.uniqueId=
function(a){var b=N++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var u=/.^/,n={"\\":"\\","'":"'",r:"\r",n:"\n",t:"\t",u2028:"\u2028",u2029:"\u2029"},v;for(v in n)n[n[v]]=v;var O=/\\|'|\r|\n|\t|\u2028|\u2029/g,P=/\\(\\|'|r|n|t|u2028|u2029)/g,w=function(a){return a.replace(P,function(a,b){return n[b]})};b.template=function(a,c,d){d=b.defaults(d||{},b.templateSettings);a="__p+='"+a.replace(O,function(a){return"\\"+n[a]}).replace(d.escape||
u,function(a,b){return"'+\n_.escape("+w(b)+")+\n'"}).replace(d.interpolate||u,function(a,b){return"'+\n("+w(b)+")+\n'"}).replace(d.evaluate||u,function(a,b){return"';\n"+w(b)+"\n;__p+='"})+"';\n";d.variable||(a="with(obj||{}){\n"+a+"}\n");var a="var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n"+a+"return __p;\n",e=new Function(d.variable||"obj","_",a);if(c)return e(c,b);c=function(a){return e.call(this,a,b)};c.source="function("+(d.variable||"obj")+"){\n"+a+"}";return c};
b.chain=function(a){return b(a).chain()};var m=function(a){this._wrapped=a};b.prototype=m.prototype;var x=function(a,c){return c?b(a).chain():a},M=function(a,c){m.prototype[a]=function(){var a=i.call(arguments);J.call(a,this._wrapped);return x(c.apply(b,a),this._chain)}};b.mixin(b);j("pop,push,reverse,shift,sort,splice,unshift".split(","),function(a){var b=k[a];m.prototype[a]=function(){var d=this._wrapped;b.apply(d,arguments);var e=d.length;(a=="shift"||a=="splice")&&e===0&&delete d[0];return x(d,
this._chain)}});j(["concat","join","slice"],function(a){var b=k[a];m.prototype[a]=function(){return x(b.apply(this._wrapped,arguments),this._chain)}});m.prototype.chain=function(){this._chain=true;return this};m.prototype.value=function(){return this._wrapped}}).call(this);
!function(e,t){"use strict";var n=t.prototype.trim,r=t.prototype.trimRight,i=t.prototype.trimLeft,s=function(e){return e*1||0},o=function(e,t){if(t<1)return"";var n="";while(t>0)t&1&&(n+=e),t>>=1,e+=e;return n},u=[].slice,a=function(e){return e!=null?"["+p.escapeRegExp(e)+"]":"\\s"},f={lt:"<",gt:">",quot:'"',apos:"'",amp:"&"},l={};for(var c in f)l[f[c]]=c;var h=function(){function e(e){return Object.prototype.toString.call(e).slice(8,-1).toLowerCase()}var n=o,r=function(){return r.cache.hasOwnProperty(arguments[0])||(r.cache[arguments[0]]=r.parse(arguments[0])),r.format.call(null,r.cache[arguments[0]],arguments)};return r.format=function(r,i){var s=1,o=r.length,u="",a,f=[],l,c,p,d,v,m;for(l=0;l<o;l++){u=e(r[l]);if(u==="string")f.push(r[l]);else if(u==="array"){p=r[l];if(p[2]){a=i[s];for(c=0;c<p[2].length;c++){if(!a.hasOwnProperty(p[2][c]))throw new Error(h('[_.sprintf] property "%s" does not exist',p[2][c]));a=a[p[2][c]]}}else p[1]?a=i[p[1]]:a=i[s++];if(/[^s]/.test(p[8])&&e(a)!="number")throw new Error(h("[_.sprintf] expecting number but found %s",e(a)));switch(p[8]){case"b":a=a.toString(2);break;case"c":a=t.fromCharCode(a);break;case"d":a=parseInt(a,10);break;case"e":a=p[7]?a.toExponential(p[7]):a.toExponential();break;case"f":a=p[7]?parseFloat(a).toFixed(p[7]):parseFloat(a);break;case"o":a=a.toString(8);break;case"s":a=(a=t(a))&&p[7]?a.substring(0,p[7]):a;break;case"u":a=Math.abs(a);break;case"x":a=a.toString(16);break;case"X":a=a.toString(16).toUpperCase()}a=/[def]/.test(p[8])&&p[3]&&a>=0?"+"+a:a,v=p[4]?p[4]=="0"?"0":p[4].charAt(1):" ",m=p[6]-t(a).length,d=p[6]?n(v,m):"",f.push(p[5]?a+d:d+a)}}return f.join("")},r.cache={},r.parse=function(e){var t=e,n=[],r=[],i=0;while(t){if((n=/^[^\x25]+/.exec(t))!==null)r.push(n[0]);else if((n=/^\x25{2}/.exec(t))!==null)r.push("%");else{if((n=/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(t))===null)throw new Error("[_.sprintf] huh?");if(n[2]){i|=1;var s=[],o=n[2],u=[];if((u=/^([a-z_][a-z_\d]*)/i.exec(o))===null)throw new Error("[_.sprintf] huh?");s.push(u[1]);while((o=o.substring(u[0].length))!=="")if((u=/^\.([a-z_][a-z_\d]*)/i.exec(o))!==null)s.push(u[1]);else{if((u=/^\[(\d+)\]/.exec(o))===null)throw new Error("[_.sprintf] huh?");s.push(u[1])}n[2]=s}else i|=2;if(i===3)throw new Error("[_.sprintf] mixing positional and named placeholders is not (yet) supported");r.push(n)}t=t.substring(n[0].length)}return r},r}(),p={VERSION:"2.2.0rc",isBlank:function(e){return e==null&&(e=""),/^\s*$/.test(e)},stripTags:function(e){return e==null?"":t(e).replace(/<\/?[^>]+>/g,"")},capitalize:function(e){return e=e==null?"":t(e),e.charAt(0).toUpperCase()+e.slice(1)},chop:function(e,n){return e==null?[]:(e=t(e),n=~~n,n>0?e.match(new RegExp(".{1,"+n+"}","g")):[e])},clean:function(e){return p.strip(e).replace(/\s+/g," ")},count:function(e,n){return e==null||n==null?0:t(e).split(n).length-1},chars:function(e){return e==null?[]:t(e).split("")},swapCase:function(e){return e==null?"":t(e).replace(/\S/g,function(e){return e===e.toUpperCase()?e.toLowerCase():e.toUpperCase()})},escapeHTML:function(e){return e==null?"":t(e).replace(/[&<>"']/g,function(e){return"&"+l[e]+";"})},unescapeHTML:function(e){return e==null?"":t(e).replace(/\&([^;]+);/g,function(e,n){var r;return n in f?f[n]:(r=n.match(/^#x([\da-fA-F]+)$/))?t.fromCharCode(parseInt(r[1],16)):(r=n.match(/^#(\d+)$/))?t.fromCharCode(~~r[1]):e})},escapeRegExp:function(e){return e==null?"":t(e).replace(/([.*+?^=!:${}()|[\]\/\\])/g,"\\$1")},splice:function(e,t,n,r){var i=p.chars(e);return i.splice(~~t,~~n,r),i.join("")},insert:function(e,t,n){return p.splice(e,t,0,n)},include:function(e,n){return n===""?!0:e==null?!1:t(e).indexOf(n)!==-1},join:function(){var e=u.call(arguments),t=e.shift();return t==null&&(t=""),e.join(t)},lines:function(e){return e==null?[]:t(e).split("\n")},reverse:function(e){return p.chars(e).reverse().join("")},startsWith:function(e,n){return n===""?!0:e==null||n==null?!1:(e=t(e),n=t(n),e.length>=n.length&&e.slice(0,n.length)===n)},endsWith:function(e,n){return n===""?!0:e==null||n==null?!1:(e=t(e),n=t(n),e.length>=n.length&&e.slice(e.length-n.length)===n)},succ:function(e){return e==null?"":(e=t(e),e.slice(0,-1)+t.fromCharCode(e.charCodeAt(e.length-1)+1))},titleize:function(e){return e==null?"":t(e).replace(/(?:^|\s)\S/g,function(e){return e.toUpperCase()})},camelize:function(e){return p.trim(e).replace(/[-_\s]+(.)?/g,function(e,t){return t.toUpperCase()})},underscored:function(e){return p.trim(e).replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/[-\s]+/g,"_").toLowerCase()},dasherize:function(e){return p.trim(e).replace(/([A-Z])/g,"-$1").replace(/[-_\s]+/g,"-").toLowerCase()},classify:function(e){return p.titleize(t(e).replace(/_/g," ")).replace(/\s/g,"")},humanize:function(e){return p.capitalize(p.underscored(e).replace(/_id$/,"").replace(/_/g," "))},trim:function(e,r){return e==null?"":!r&&n?n.call(e):(r=a(r),t(e).replace(new RegExp("^"+r+"+|"+r+"+$","g"),""))},ltrim:function(e,n){return e==null?"":!n&&i?i.call(e):(n=a(n),t(e).replace(new RegExp("^"+n+"+"),""))},rtrim:function(e,n){return e==null?"":!n&&r?r.call(e):(n=a(n),t(e).replace(new RegExp(n+"+$"),""))},truncate:function(e,n,r){return e==null?"":(e=t(e),r=r||"...",n=~~n,e.length>n?e.slice(0,n)+r:e)},prune:function(e,n,r){if(e==null)return"";e=t(e),n=~~n,r=r!=null?t(r):"...";if(e.length<=n)return e;var i=function(e){return e.toUpperCase()!==e.toLowerCase()?"A":" "},s=e.slice(0,n+1).replace(/.(?=\W*\w*$)/g,i);return s.slice(s.length-2).match(/\w\w/)?s=s.replace(/\s*\S+$/,""):s=p.rtrim(s.slice(0,s.length-1)),(s+r).length>e.length?e:e.slice(0,s.length)+r},words:function(e,t){return e==null||e==""?"":p.trim(e,t).split(t||/\s+/)},pad:function(e,n,r,i){e=e==null?"":t(e),n=~~n;var s=0;r?r.length>1&&(r=r.charAt(0)):r=" ";switch(i){case"right":return s=n-e.length,e+o(r,s);case"both":return s=n-e.length,o(r,Math.ceil(s/2))+e+o(r,Math.floor(s/2));default:return s=n-e.length,o(r,s)+e}},lpad:function(e,t,n){return p.pad(e,t,n)},rpad:function(e,t,n){return p.pad(e,t,n,"right")},lrpad:function(e,t,n){return p.pad(e,t,n,"both")},sprintf:h,vsprintf:function(e,t){return t.unshift(e),h.apply(null,t)},toNumber:function(e,n){if(e==null||e=="")return 0;e=t(e);var r=s(s(e).toFixed(~~n));return r===0&&!e.match(/^0+$/)?Number.NaN:r},numberFormat:function(e,t,n,r){if(isNaN(e)||e==null)return"";e=e.toFixed(~~t),r=r||",";var i=e.split("."),s=i[0],o=i[1]?(n||".")+i[1]:"";return s.replace(/(\d)(?=(?:\d{3})+$)/g,"$1"+r)+o},strRight:function(e,n){if(e==null)return"";e=t(e),n=n!=null?t(n):n;var r=n?e.indexOf(n):-1;return~r?e.slice(r+n.length,e.length):e},strRightBack:function(e,n){if(e==null)return"";e=t(e),n=n!=null?t(n):n;var r=n?e.lastIndexOf(n):-1;return~r?e.slice(r+n.length,e.length):e},strLeft:function(e,n){if(e==null)return"";e=t(e),n=n!=null?t(n):n;var r=n?e.indexOf(n):-1;return~r?e.slice(0,r):e},strLeftBack:function(e,t){if(e==null)return"";e+="",t=t!=null?""+t:t;var n=e.lastIndexOf(t);return~n?e.slice(0,n):e},toSentence:function(e,t,n){t=t||", ",n=n||" and ";var r=e.slice(),i=r.pop();return r.length?r.join(t)+n+i:i},slugify:function(e){if(e==null)return"";var n="ąàáäâãćęèéëêìíïîłńòóöôõùúüûñçżź",r="aaaaaaceeeeeiiiilnooooouuuunczz",i=new RegExp(a(n),"g");return e=t(e).toLowerCase().replace(i,function(e){var t=n.indexOf(e);return r.charAt(t)||"-"}),p.dasherize(e.replace(/[^\w\s-]/g,""))},surround:function(e,t){return[t,e,t].join("")},quote:function(e){return p.surround(e,'"')},exports:function(){var e={};for(var t in this){if(!this.hasOwnProperty(t)||t.match(/^(?:include|contains|reverse)$/))continue;e[t]=this[t]}return e},repeat:function(e,n,r){if(e==null)return"";n=~~n;if(r==null)return o(t(e),n);for(var i=[];n>0;i[--n]=e);return i.join(r)},levenshtein:function(e,n){if(e==null&&n==null)return 0;if(e==null)return t(n).length;if(n==null)return t(e).length;e=t(e),n=t(n);var r=[],i,s;for(var o=0;o<=n.length;o++)for(var u=0;u<=e.length;u++)o&&u?e.charAt(u-1)===n.charAt(o-1)?s=i:s=Math.min(r[u],r[u-1],i)+1:s=o+u,i=r[u],r[u]=s;return r.pop()}};p.strip=p.trim,p.lstrip=p.ltrim,p.rstrip=p.rtrim,p.center=p.lrpad,p.rjust=p.lpad,p.ljust=p.rpad,p.contains=p.include,p.q=p.quote,typeof exports!="undefined"?(typeof module!="undefined"&&module.exports&&(module.exports=p),exports._s=p):typeof define=="function"&&define.amd?define("underscore.string",[],function(){return p}):(e._=e._||{},e._.string=e._.str=p)}(this,String);// moment.js
// version : 1.7.0
// author : Tim Wood
// license : MIT
// momentjs.com
(function(a,b){function G(a,b,c){this._d=a,this._isUTC=!!b,this._a=a._a||null,a._a=null,this._lang=c||!1}function H(a){var b=this._data={},c=a.years||a.y||0,d=a.months||a.M||0,e=a.weeks||a.w||0,f=a.days||a.d||0,g=a.hours||a.h||0,h=a.minutes||a.m||0,i=a.seconds||a.s||0,j=a.milliseconds||a.ms||0;this._milliseconds=j+i*1e3+h*6e4+g*36e5,this._days=f+e*7,this._months=d+c*12,b.milliseconds=j%1e3,i+=I(j/1e3),b.seconds=i%60,h+=I(i/60),b.minutes=h%60,g+=I(h/60),b.hours=g%24,f+=I(g/24),f+=e*7,b.days=f%30,d+=I(f/30),b.months=d%12,c+=I(d/12),b.years=c,this._lang=!1}function I(a){return a<0?Math.ceil(a):Math.floor(a)}function J(a,b){var c=a+"";while(c.length<b)c="0"+c;return c}function K(a,b,c){var d=b._milliseconds,e=b._days,f=b._months,g;d&&a._d.setTime(+a+d*c),e&&a.date(a.date()+e*c),f&&(g=a.date(),a.date(1).month(a.month()+f*c).date(Math.min(g,a.daysInMonth())))}function L(a){return Object.prototype.toString.call(a)==="[object Array]"}function M(a,b){var c=Math.min(a.length,b.length),d=Math.abs(a.length-b.length),e=0,f;for(f=0;f<c;f++)~~a[f]!==~~b[f]&&e++;return e+d}function N(b,c){var d,e;for(d=1;d<7;d++)b[d]=b[d]==null?d===2?1:0:b[d];return b[7]=c,e=new a(0),c?(e.setUTCFullYear(b[0],b[1],b[2]),e.setUTCHours(b[3],b[4],b[5],b[6])):(e.setFullYear(b[0],b[1],b[2]),e.setHours(b[3],b[4],b[5],b[6])),e._a=b,e}function O(a,b){var d,e,f=[];!b&&i&&(b=require("./lang/"+a));for(d=0;d<j.length;d++)b[j[d]]=b[j[d]]||g.en[j[d]];for(d=0;d<12;d++)e=c([2e3,d]),f[d]=new RegExp("^"+(b.months[d]||b.months(e,""))+"|^"+(b.monthsShort[d]||b.monthsShort(e,"")).replace(".",""),"i");return b.monthsParse=b.monthsParse||f,g[a]=b,b}function P(a){var b=typeof a=="string"&&a||a&&a._lang||null;return b?g[b]||O(b):c}function Q(a){return D[a]?"'+("+D[a]+")+'":a.replace(n,"").replace(/\\?'/g,"\\'")}function R(a){return P().longDateFormat[a]||a}function S(a){var b="var a,b;return '"+a.replace(l,Q)+"';",c=Function;return new c("t","v","o","p","m",b)}function T(a){return C[a]||(C[a]=S(a)),C[a]}function U(a,b){function d(d,e){return c[d].call?c[d](a,b):c[d][e]}var c=P(a);while(m.test(b))b=b.replace(m,R);return C[b]||(C[b]=S(b)),C[b](a,d,c.ordinal,J,c.meridiem)}function V(a){switch(a){case"DDDD":return r;case"YYYY":return s;case"S":case"SS":case"SSS":case"DDD":return q;case"MMM":case"MMMM":case"dd":case"ddd":case"dddd":case"a":case"A":return t;case"Z":case"ZZ":return u;case"T":return v;case"MM":case"DD":case"YY":case"HH":case"hh":case"mm":case"ss":case"M":case"D":case"d":case"H":case"h":case"m":case"s":return p;default:return new RegExp(a.replace("\\",""))}}function W(a,b,c,d){var e;switch(a){case"M":case"MM":c[1]=b==null?0:~~b-1;break;case"MMM":case"MMMM":for(e=0;e<12;e++)if(P().monthsParse[e].test(b)){c[1]=e;break}break;case"D":case"DD":case"DDD":case"DDDD":b!=null&&(c[2]=~~b);break;case"YY":b=~~b,c[0]=b+(b>70?1900:2e3);break;case"YYYY":c[0]=~~Math.abs(b);break;case"a":case"A":d.isPm=(b+"").toLowerCase()==="pm";break;case"H":case"HH":case"h":case"hh":c[3]=~~b;break;case"m":case"mm":c[4]=~~b;break;case"s":case"ss":c[5]=~~b;break;case"S":case"SS":case"SSS":c[6]=~~(("0."+b)*1e3);break;case"Z":case"ZZ":d.isUTC=!0,e=(b+"").match(z),e&&e[1]&&(d.tzh=~~e[1]),e&&e[2]&&(d.tzm=~~e[2]),e&&e[0]==="+"&&(d.tzh=-d.tzh,d.tzm=-d.tzm)}}function X(a,b){var c=[0,0,1,0,0,0,0],d={tzh:0,tzm:0},e=b.match(l),f,g;for(f=0;f<e.length;f++)g=(V(e[f]).exec(a)||[])[0],a=a.replace(V(e[f]),""),W(e[f],g,c,d);return d.isPm&&c[3]<12&&(c[3]+=12),d.isPm===!1&&c[3]===12&&(c[3]=0),c[3]+=d.tzh,c[4]+=d.tzm,N(c,d.isUTC)}function Y(a,b){var c,d=a.match(o)||[],e,f=99,g,h,i;for(g=0;g<b.length;g++)h=X(a,b[g]),e=U(new G(h),b[g]).match(o)||[],i=M(d,e),i<f&&(f=i,c=h);return c}function Z(b){var c="YYYY-MM-DDT",d;if(w.exec(b)){for(d=0;d<4;d++)if(y[d][1].exec(b)){c+=y[d][0];break}return u.exec(b)?X(b,c+" Z"):X(b,c)}return new a(b)}function $(a,b,c,d,e){var f=e.relativeTime[a];return typeof f=="function"?f(b||1,!!c,a,d):f.replace(/%d/i,b||1)}function _(a,b,c){var d=e(Math.abs(a)/1e3),f=e(d/60),g=e(f/60),h=e(g/24),i=e(h/365),j=d<45&&["s",d]||f===1&&["m"]||f<45&&["mm",f]||g===1&&["h"]||g<22&&["hh",g]||h===1&&["d"]||h<=25&&["dd",h]||h<=45&&["M"]||h<345&&["MM",e(h/30)]||i===1&&["y"]||["yy",i];return j[2]=b,j[3]=a>0,j[4]=c,$.apply({},j)}function ab(a,b){c.fn[a]=function(a){var c=this._isUTC?"UTC":"";return a!=null?(this._d["set"+c+b](a),this):this._d["get"+c+b]()}}function bb(a){c.duration.fn[a]=function(){return this._data[a]}}function cb(a,b){c.duration.fn["as"+a]=function(){return+this/b}}var c,d="1.7.0",e=Math.round,f,g={},h="en",i=typeof module!="undefined"&&module.exports,j="months|monthsShort|weekdays|weekdaysShort|weekdaysMin|longDateFormat|calendar|relativeTime|ordinal|meridiem".split("|"),k=/^\/?Date\((\-?\d+)/i,l=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|zz?|ZZ?)/g,m=/(LT|LL?L?L?)/g,n=/(^\[)|(\\)|\]$/g,o=/([0-9a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/gi,p=/\d\d?/,q=/\d{1,3}/,r=/\d{3}/,s=/\d{1,4}/,t=/[0-9a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+/i,u=/Z|[\+\-]\d\d:?\d\d/i,v=/T/i,w=/^\s*\d{4}-\d\d-\d\d(T(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,x="YYYY-MM-DDTHH:mm:ssZ",y=[["HH:mm:ss.S",/T\d\d:\d\d:\d\d\.\d{1,3}/],["HH:mm:ss",/T\d\d:\d\d:\d\d/],["HH:mm",/T\d\d:\d\d/],["HH",/T\d\d/]],z=/([\+\-]|\d\d)/gi,A="Month|Date|Hours|Minutes|Seconds|Milliseconds".split("|"),B={Milliseconds:1,Seconds:1e3,Minutes:6e4,Hours:36e5,Days:864e5,Months:2592e6,Years:31536e6},C={},D={M:"(a=t.month()+1)",MMM:'v("monthsShort",t.month())',MMMM:'v("months",t.month())',D:"(a=t.date())",DDD:"(a=new Date(t.year(),t.month(),t.date()),b=new Date(t.year(),0,1),a=~~(((a-b)/864e5)+1.5))",d:"(a=t.day())",dd:'v("weekdaysMin",t.day())',ddd:'v("weekdaysShort",t.day())',dddd:'v("weekdays",t.day())',w:"(a=new Date(t.year(),t.month(),t.date()-t.day()+5),b=new Date(a.getFullYear(),0,4),a=~~((a-b)/864e5/7+1.5))",YY:"p(t.year()%100,2)",YYYY:"p(t.year(),4)",a:"m(t.hours(),t.minutes(),!0)",A:"m(t.hours(),t.minutes(),!1)",H:"t.hours()",h:"t.hours()%12||12",m:"t.minutes()",s:"t.seconds()",S:"~~(t.milliseconds()/100)",SS:"p(~~(t.milliseconds()/10),2)",SSS:"p(t.milliseconds(),3)",Z:'((a=-t.zone())<0?((a=-a),"-"):"+")+p(~~(a/60),2)+":"+p(~~a%60,2)',ZZ:'((a=-t.zone())<0?((a=-a),"-"):"+")+p(~~(10*a/6),4)'},E="DDD w M D d".split(" "),F="M D H h m s w".split(" ");while(E.length)f=E.pop(),D[f+"o"]=D[f]+"+o(a)";while(F.length)f=F.pop(),D[f+f]="p("+D[f]+",2)";D.DDDD="p("+D.DDD+",3)",c=function(d,e){if(d===null||d==="")return null;var f,g;return c.isMoment(d)?new G(new a(+d._d),d._isUTC,d._lang):(e?L(e)?f=Y(d,e):f=X(d,e):(g=k.exec(d),f=d===b?new a:g?new a(+g[1]):d instanceof a?d:L(d)?N(d):typeof d=="string"?Z(d):new a(d)),new G(f))},c.utc=function(a,b){return L(a)?new G(N(a,!0),!0):(typeof a=="string"&&!u.exec(a)&&(a+=" +0000",b&&(b+=" Z")),c(a,b).utc())},c.unix=function(a){return c(a*1e3)},c.duration=function(a,b){var d=c.isDuration(a),e=typeof a=="number",f=d?a._data:e?{}:a,g;return e&&(b?f[b]=a:f.milliseconds=a),g=new H(f),d&&(g._lang=a._lang),g},c.humanizeDuration=function(a,b,d){return c.duration(a,b===!0?null:b).humanize(b===!0?!0:d)},c.version=d,c.defaultFormat=x,c.lang=function(a,b){var d;if(!a)return h;(b||!g[a])&&O(a,b);if(g[a]){for(d=0;d<j.length;d++)c[j[d]]=g[a][j[d]];c.monthsParse=g[a].monthsParse,h=a}},c.langData=P,c.isMoment=function(a){return a instanceof G},c.isDuration=function(a){return a instanceof H},c.lang("en",{months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),longDateFormat:{LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D YYYY",LLL:"MMMM D YYYY LT",LLLL:"dddd, MMMM D YYYY LT"},meridiem:function(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"},calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[last] dddd [at] LT",sameElse:"L"},relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},ordinal:function(a){var b=a%10;return~~(a%100/10)===1?"th":b===1?"st":b===2?"nd":b===3?"rd":"th"}}),c.fn=G.prototype={clone:function(){return c(this)},valueOf:function(){return+this._d},unix:function(){return Math.floor(+this._d/1e3)},toString:function(){return this._d.toString()},toDate:function(){return this._d},toArray:function(){var a=this;return[a.year(),a.month(),a.date(),a.hours(),a.minutes(),a.seconds(),a.milliseconds(),!!this._isUTC]},isValid:function(){return this._a?!M(this._a,(this._a[7]?c.utc(this):this).toArray()):!isNaN(this._d.getTime())},utc:function(){return this._isUTC=!0,this},local:function(){return this._isUTC=!1,this},format:function(a){return U(this,a?a:c.defaultFormat)},add:function(a,b){var d=b?c.duration(+b,a):c.duration(a);return K(this,d,1),this},subtract:function(a,b){var d=b?c.duration(+b,a):c.duration(a);return K(this,d,-1),this},diff:function(a,b,d){var f=this._isUTC?c(a).utc():c(a).local(),g=(this.zone()-f.zone())*6e4,h=this._d-f._d-g,i=this.year()-f.year(),j=this.month()-f.month(),k=this.date()-f.date(),l;return b==="months"?l=i*12+j+k/30:b==="years"?l=i+(j+k/30)/12:l=b==="seconds"?h/1e3:b==="minutes"?h/6e4:b==="hours"?h/36e5:b==="days"?h/864e5:b==="weeks"?h/6048e5:h,d?l:e(l)},from:function(a,b){return c.duration(this.diff(a)).lang(this._lang).humanize(!b)},fromNow:function(a){return this.from(c(),a)},calendar:function(){var a=this.diff(c().sod(),"days",!0),b=this.lang().calendar,d=b.sameElse,e=a<-6?d:a<-1?b.lastWeek:a<0?b.lastDay:a<1?b.sameDay:a<2?b.nextDay:a<7?b.nextWeek:d;return this.format(typeof e=="function"?e.apply(this):e)},isLeapYear:function(){var a=this.year();return a%4===0&&a%100!==0||a%400===0},isDST:function(){return this.zone()<c([this.year()]).zone()||this.zone()<c([this.year(),5]).zone()},day:function(a){var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return a==null?b:this.add({d:a-b})},startOf:function(a){switch(a.replace(/s$/,"")){case"year":this.month(0);case"month":this.date(1);case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return this},endOf:function(a){return this.startOf(a).add(a.replace(/s?$/,"s"),1).subtract("ms",1)},sod:function(){return this.clone().startOf("day")},eod:function(){return this.clone().endOf("day")},zone:function(){return this._isUTC?0:this._d.getTimezoneOffset()},daysInMonth:function(){return c.utc([this.year(),this.month()+1,0]).date()},lang:function(a){return a===b?P(this):(this._lang=a,this)}};for(f=0;f<A.length;f++)ab(A[f].toLowerCase(),A[f]);ab("year","FullYear"),c.duration.fn=H.prototype={weeks:function(){return I(this.days()/7)},valueOf:function(){return this._milliseconds+this._days*864e5+this._months*2592e6},humanize:function(a){var b=+this,c=this.lang().relativeTime,d=_(b,!a,this.lang());return a&&(d=(b<=0?c.past:c.future).replace(/%s/i,d)),d},lang:c.fn.lang};for(f in B)B.hasOwnProperty(f)&&(cb(f,B[f]),bb(f.toLowerCase()));cb("Weeks",6048e5),i&&(module.exports=c),typeof ender=="undefined"&&(this.moment=c),typeof define=="function"&&define.amd&&define("moment",[],function(){return c})}).call(this,Date);/*
 *  Sugar Library vedge
 *
 *  Freely distributable and licensed under the MIT-style license.
 *  Copyright (c) 2012 Andrew Plummer
 *  http://sugarjs.com/
 *
 * ---------------------------- */
(function(){var k=true,l=null,m=false;function aa(a){return function(){return a}}var p=Object,q=Array,r=RegExp,s=Date,t=String,v=Number,w=Math,ba=typeof global!=="undefined"?global:this,ca=p.defineProperty&&p.defineProperties,x="Array,Boolean,Date,Function,Number,String,RegExp".split(","),da=y(x[0]),ea=y(x[1]),fa=y(x[2]),z=y(x[3]),A=y(x[4]),B=y(x[5]),C=y(x[6]);function y(a){return function(b){return ga(b,a)}}function ga(a,b){return p.prototype.toString.call(a)==="[object "+b+"]"}
function ha(a){if(!a.SugarMethods){ia(a,"SugarMethods",{});D(a,m,m,{restore:function(){var b=arguments.length===0,c=E(arguments);G(a.SugarMethods,function(d,e){if(b||c.indexOf(d)>-1)ia(e.ya?a.prototype:a,d,e.method)})},extend:function(b,c,d){D(a,d!==m,c,b)}})}}function D(a,b,c,d){var e=b?a.prototype:a,g;ha(a);G(d,function(f,i){g=e[f];if(typeof c==="function")i=ja(e[f],i,c);if(c!==m||!e[f])ia(e,f,i);a.SugarMethods[f]={ya:b,method:i,Ga:g}})}
function I(a,b,c,d,e){var g={};d=B(d)?d.split(","):d;d.forEach(function(f,i){e(g,f,i)});D(a,b,c,g)}function ja(a,b,c){return function(){return a&&(c===k||!c.apply(this,arguments))?a.apply(this,arguments):b.apply(this,arguments)}}function ia(a,b,c){if(ca)p.defineProperty(a,b,{value:c,configurable:k,enumerable:m,writable:k});else a[b]=c}function E(a,b){var c=[],d=0;for(d=0;d<a.length;d++){c.push(a[d]);b&&b.call(a,a[d],d)}return c}function J(a){return a!==void 0}function K(a){return a===void 0}
function ka(a){return a&&typeof a==="object"}function la(a){return!!a&&ga(a,"Object")&&t(a.constructor)===t(p)}function ma(a,b){return p.hasOwnProperty.call(a,b)}function G(a,b){for(var c in a)if(ma(a,c))if(b.call(a,c,a[c])===m)break}function na(a,b){G(b,function(c){a[c]=b[c]});return a}function M(a){na(this,a)}M.prototype.constructor=p;function N(a,b,c,d){var e=[];a=parseInt(a);for(var g=d<0;!g&&a<=b||g&&a>=b;){e.push(a);c&&c.call(this,a);a+=d||1}return e}
function O(a,b,c){c=w[c||"round"];var d=w.pow(10,w.abs(b||0));if(b<0)d=1/d;return c(a*d)/d}function P(a,b){return O(a,b,"floor")}function Q(a,b,c,d){d=w.abs(a).toString(d||10);d=oa(b-d.replace(/\.\d+/,"").length,"0")+d;if(c||a<0)d=(a<0?"-":"+")+d;return d}function pa(a){if(a>=11&&a<=13)return"th";else switch(a%10){case 1:return"st";case 2:return"nd";case 3:return"rd";default:return"th"}}
function qa(){return"\t\n\u000b\u000c\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u2028\u2029\u3000\ufeff"}function oa(a,b){return q(w.max(0,J(a)?a:1)+1).join(b||"")}function ra(a,b){var c=a.toString().match(/[^/]*$/)[0];if(b)c=(c+b).split("").sort().join("").replace(/([gimy])\1+/g,"$1");return c}function R(a){B(a)||(a=t(a));return a.replace(/([\\/'*+?|()\[\]{}.^$])/g,"\\$1")}
function S(a,b){var c,d,e,g,f,i,h=typeof a;if(h==="string")return a;d=p.prototype.toString.call(a);c=d==="[object Object]";e=d==="[object Array]";if(a!=l&&c||e){b||(b=[]);if(b.length>1)for(f=b.length;f--;)if(b[f]===a)return"CYC";b.push(a);c=t(a.constructor);g=e?a:p.keys(a).sort();for(f=0;f<g.length;f++){i=e?f:g[f];c+=i+S(a[i],b)}b.pop()}else c=1/a===-Infinity?"-0":t(a&&a.valueOf());return h+d+c}
function sa(a,b,c){var d=[],e=a.length,g=b[b.length-1]!==m,f;E(b,function(i){if(ea(i))return m;if(g){i%=e;if(i<0)i=e+i}f=c?a.charAt(i)||"":a[i];d.push(f)});return d.length<2?d[0]:d}function ta(a,b){I(b,k,m,a,function(c,d){c[d+(d==="equal"?"s":"")]=function(){return p[d].apply(l,[this].concat(E(arguments)))}})}ha(p);G(x,function(a,b){ha(ba[b])});
D(p,m,m,{keys:function(a){var b=[];if(!ka(a)&&!C(a)&&!z(a))throw new TypeError("Object required");G(a,function(c){b.push(c)});return b}});function ua(a,b,c,d){var e=a.length,g=d==-1,f=g?e-1:0;c=isNaN(c)?f:parseInt(c>>0);if(c<0)c=e+c;if(!g&&c<0||g&&c>=e)c=f;for(;g&&c>=0||!g&&c<e;){if(a[c]===b)return c;c+=d}return-1}
function va(a,b,c,d){var e=a.length,g=0,f=J(c);wa(b);if(e==0&&!f)throw new TypeError("Reduce called on empty array with no initial value");else if(f)c=c;else{c=a[d?e-1:g];g++}for(;g<e;){f=d?e-g-1:g;if(f in a)c=b(c,a[f],f,a);g++}return c}function wa(a){if(!a||!a.call)throw new TypeError("Callback is not callable");}function xa(a){if(a.length===0)throw new TypeError("First argument must be defined");}D(q,m,m,{isArray:function(a){return ga(a,"Array")}});
D(q,k,m,{every:function(a,b){var c=this.length,d=0;for(xa(arguments);d<c;){if(d in this&&!a.call(b,this[d],d,this))return m;d++}return k},some:function(a,b){var c=this.length,d=0;for(xa(arguments);d<c;){if(d in this&&a.call(b,this[d],d,this))return k;d++}return m},map:function(a,b){var c=this.length,d=0,e=Array(c);for(xa(arguments);d<c;){if(d in this)e[d]=a.call(b,this[d],d,this);d++}return e},filter:function(a,b){var c=this.length,d=0,e=[];for(xa(arguments);d<c;){d in this&&a.call(b,this[d],d,this)&&
e.push(this[d]);d++}return e},indexOf:function(a,b){if(B(this))return this.indexOf(a,b);return ua(this,a,b,1)},lastIndexOf:function(a,b){if(B(this))return this.lastIndexOf(a,b);return ua(this,a,b,-1)},forEach:function(a,b){var c=this.length,d=0;for(wa(a);d<c;){d in this&&a.call(b,this[d],d,this);d++}},reduce:function(a,b){return va(this,a,b)},reduceRight:function(a,b){return va(this,a,b,k)}});D(s,m,m,{now:function(){return(new s).getTime()}});
(function(){var a=qa().match(/^\s+$/);try{t.prototype.trim.call([1])}catch(b){a=m}D(t,k,!a,{trim:function(){return this.toString().trimLeft().trimRight()},trimLeft:function(){return this.replace(r("^["+qa()+"]+"),"")},trimRight:function(){return this.replace(r("["+qa()+"]+$"),"")}})})();
(function(){var a=m;if(Function.prototype.sa){a=function(){};var b=a.sa();a=new b instanceof b&&!(new a instanceof b)}D(Function,k,!a,{bind:function(c){var d=this,e=E(arguments).slice(1),g,f;if(!z(this))throw new TypeError("Function.prototype.bind called on a non-function");f=function(){return d.apply(d.prototype&&this instanceof d?this:c,e.concat(E(arguments)))};g=function(){};g.prototype=this.prototype;f.prototype=new g;return f}})})();
(function(){var a=new s(s.UTC(1999,11,31));a=a.toISOString&&a.toISOString()==="1999-12-31T00:00:00.000Z";I(s,k,!a,"toISOString,toJSON",function(b,c){b[c]=function(){return Q(this.getUTCFullYear(),4)+"-"+Q(this.getUTCMonth()+1,2)+"-"+Q(this.getUTCDate(),2)+"T"+Q(this.getUTCHours(),2)+":"+Q(this.getUTCMinutes(),2)+":"+Q(this.getUTCSeconds(),2)+"."+Q(this.getUTCMilliseconds(),3)+"Z"}})})();
function ya(a,b,c,d){var e=k;if(a===b)return k;else if(C(b)&&B(a))return r(b).test(a);else if(z(b))return b.apply(c,d);else if(la(b)&&ka(a)){G(b,function(g){ya(a[g],b[g],c,[a[g],a])||(e=m)});return e}else return S(a)===S(b)}function T(a,b,c,d){return K(b)?a:z(b)?b.apply(c,d||[]):z(a[b])?a[b].call(a):a[b]}function U(a,b,c,d){var e,g;if(c<0)c=a.length+c;g=isNaN(c)?0:c;for(c=d===k?a.length+g:a.length;g<c;){e=g%a.length;if(e in a){if(b.call(a,a[e],e,a)===m)break}else return za(a,b,g,d);g++}}
function za(a,b,c){var d=[],e;for(e in a)e in a&&e>>>0==e&&e!=4294967295&&e>=c&&d.push(parseInt(e));d.sort().each(function(g){return b.call(a,a[g],g,a)});return a}function Aa(a,b,c,d,e){var g,f;U(a,function(i,h,j){if(ya(i,b,j,[i,h,j])){g=i;f=h;return m}},c,d);return e?f:g}function Ba(a,b){var c=[],d={},e;U(a,function(g,f){e=b?T(g,b,a,[g,f,a]):g;Ea(d,e)||c.push(g)});return c}
function Fa(a,b,c){var d=[],e={};b.each(function(g){Ea(e,g)});a.each(function(g){var f=S(g),i=z(g);if(Ga(e,f,g,i)!=c){var h=0;if(i)for(f=e[f];h<f.length;)if(f[h]===g)f.splice(h,1);else h+=1;else delete e[f];d.push(g)}});return d}function Ha(a,b,c){b=b||Infinity;c=c||0;var d=[];U(a,function(e){if(da(e)&&c<b)d=d.concat(Ha(e,b,c+1));else d.push(e)});return d}function Ia(a){var b=[];E(a,function(c){b=b.concat(c)});return b}
function Ga(a,b,c,d){var e=b in a;if(d){a[b]||(a[b]=[]);e=a[b].indexOf(c)!==-1}return e}function Ea(a,b){var c=S(b),d=z(b),e=Ga(a,c,b,d);if(d)a[c].push(b);else a[c]=b;return e}function Ja(a,b,c,d){var e,g=[],f=c==="max",i=c==="min",h=Array.isArray(a);G(a,function(j){var n=a[j];j=T(n,b,a,h?[n,parseInt(j),a]:[]);if(j===e)g.push(n);else if(K(e)||f&&j>e||i&&j<e){g=[n];e=j}});h||(g=Ha(g,1));return d?g:g[0]}function Ka(a){if(q[La])a=a.toLowerCase();return a.replace(q[Ma],"")}
function Na(a,b){var c=a.charAt(b);return(q[Oa]||{})[c]||c}function Pa(a){var b=q[Qa];return a?b.indexOf(a):l}var Qa="AlphanumericSortOrder",Ma="AlphanumericSortIgnore",La="AlphanumericSortIgnoreCase",Oa="AlphanumericSortEquivalents";D(q,m,m,{create:function(){var a=[];E(arguments,function(b){if(ka(b))a=a.concat(q.prototype.slice.call(b));else a.push(b)});return a}});
D(q,k,m,{find:function(a,b,c){return Aa(this,a,b,c)},findAll:function(a,b,c){var d=[];U(this,function(e,g,f){ya(e,a,f,[e,g,f])&&d.push(e)},b,c);return d},findIndex:function(a,b,c){a=Aa(this,a,b,c,k);return K(a)?-1:a},count:function(a){if(K(a))return this.length;return this.findAll(a).length},removeAt:function(a,b){if(K(a))return this;if(K(b))b=a;for(var c=0;c<=b-a;c++)this.splice(a,1);return this},include:function(a,b){return this.clone().add(a,b)},exclude:function(){return q.prototype.remove.apply(this.clone(),
arguments)},clone:function(){return na([],this)},unique:function(a){return Ba(this,a)},flatten:function(a){return Ha(this,a)},union:function(){return Ba(this.concat(Ia(arguments)))},intersect:function(){return Fa(this,Ia(arguments),m)},subtract:function(){return Fa(this,Ia(arguments),k)},at:function(){return sa(this,arguments)},first:function(a){if(K(a))return this[0];if(a<0)a=0;return this.slice(0,a)},last:function(a){if(K(a))return this[this.length-1];return this.slice(this.length-a<0?0:this.length-
a)},from:function(a){return this.slice(a)},to:function(a){if(K(a))a=this.length;return this.slice(0,a)},min:function(a,b){return Ja(this,a,"min",b)},max:function(a,b){return Ja(this,a,"max",b)},least:function(a,b){return Ja(this.groupBy.apply(this,[a]),"length","min",b)},most:function(a,b){return Ja(this.groupBy.apply(this,[a]),"length","max",b)},sum:function(a){a=a?this.map(a):this;return a.length>0?a.reduce(function(b,c){return b+c}):0},average:function(a){a=a?this.map(a):this;return a.length>0?
a.sum()/a.length:0},inGroups:function(a,b){var c=arguments.length>1,d=this,e=[],g=O(this.length/a,void 0,"ceil");N(0,a-1,function(f){f=f*g;var i=d.slice(f,f+g);c&&i.length<g&&N(1,g-i.length,function(){i=i.add(b)});e.push(i)});return e},inGroupsOf:function(a,b){var c=[],d=this.length,e=this,g;if(d===0||a===0)return e;if(K(a))a=1;if(K(b))b=l;N(0,O(d/a,void 0,"ceil")-1,function(f){for(g=e.slice(a*f,a*f+a);g.length<a;)g.push(b);c.push(g)});return c},isEmpty:function(){return this.compact().length==0},
sortBy:function(a,b){var c=this.clone();c.sort(function(d,e){var g,f;g=T(d,a,c,[d]);f=T(e,a,c,[e]);if(B(g)&&B(f)){g=g;f=f;var i,h,j,n,o=0,u=0;g=Ka(g);f=Ka(f);do{j=Na(g,o);n=Na(f,o);i=Pa(j);h=Pa(n);if(i===-1||h===-1){i=g.charCodeAt(o)||l;h=f.charCodeAt(o)||l}j=j!==g.charAt(o);n=n!==f.charAt(o);if(j!==n&&u===0)u=j-n;o+=1}while(i!=l&&h!=l&&i===h);g=i===h?u:i<h?-1:1}else g=g<f?-1:g>f?1:0;return g*(b?-1:1)});return c},randomize:function(){for(var a=this.concat(),b,c,d=a.length;d;b=parseInt(w.random()*
d),c=a[--d],a[d]=a[b],a[b]=c);return a},zip:function(){var a=E(arguments);return this.map(function(b,c){return[b].concat(a.map(function(d){return c in d?d[c]:l}))})},sample:function(a){var b=[],c=this.clone(),d;if(K(a))a=1;for(;b.length<a;){d=P(w.random()*(c.length-1));b.push(c[d]);c.removeAt(d);if(c.length==0)break}return arguments.length>0?b:b[0]},each:function(a,b,c){U(this,a,b,c);return this},add:function(a,b){if(!A(v(b))||isNaN(b))b=this.length;q.prototype.splice.apply(this,[b,0].concat(a));
return this},remove:function(){var a,b=this;E(arguments,function(c){for(a=0;a<b.length;)if(ya(b[a],c,b,[b[a],a,b]))b.splice(a,1);else a++});return b},compact:function(a){var b=[];U(this,function(c){if(da(c))b.push(c.compact());else if(a&&c)b.push(c);else!a&&c!=l&&c.valueOf()===c.valueOf()&&b.push(c)});return b},groupBy:function(a,b){var c=this,d={},e;U(c,function(g,f){e=T(g,a,c,[g,f,c]);d[e]||(d[e]=[]);d[e].push(g)});b&&G(d,b);return d},none:function(){return!this.any.apply(this,arguments)}});
D(q,k,m,{all:q.prototype.every,any:q.prototype.some,insert:q.prototype.add});function Ra(a){if(a&&a.valueOf)a=a.valueOf();return p.keys(a)}function Sa(a,b){I(p,m,m,a,function(c,d){c[d]=function(e,g,f){f=q.prototype[d].call(Ra(e),function(i){return b?T(e[i],g,e,[i,e[i],e]):ya(e[i],g,e,[i,e[i],e])},f);if(da(f))f=f.reduce(function(i,h){i[h]=e[h];return i},{});return f}});ta(a,M)}
D(p,m,m,{map:function(a,b){return Ra(a).reduce(function(c,d){c[d]=T(a[d],b,a,[d,a[d],a]);return c},{})},reduce:function(a){var b=Ra(a).map(function(c){return a[c]});return b.reduce.apply(b,E(arguments).slice(1))},size:function(a){return Ra(a).length}});(function(){I(q,k,function(){var a=arguments;return a.length>0&&!z(a[0])},"map,every,all,some,any,none,filter",function(a,b){a[b]=function(c){return this[b](function(d,e){return b==="map"?T(d,c,this,[d,e,this]):ya(d,c,this,[d,e,this])})}})})();
(function(){q[Qa]="A\u00c1\u00c0\u00c2\u00c3\u0104BC\u0106\u010c\u00c7D\u010e\u00d0E\u00c9\u00c8\u011a\u00ca\u00cb\u0118FG\u011eH\u0131I\u00cd\u00cc\u0130\u00ce\u00cfJKL\u0141MN\u0143\u0147\u00d1O\u00d3\u00d2\u00d4PQR\u0158S\u015a\u0160\u015eT\u0164U\u00da\u00d9\u016e\u00db\u00dcVWXY\u00ddZ\u0179\u017b\u017d\u00de\u00c6\u0152\u00d8\u00d5\u00c5\u00c4\u00d6".split("").map(function(b){return b+b.toLowerCase()}).join("");var a={};U("A\u00c1\u00c0\u00c2\u00c3\u00c4,C\u00c7,E\u00c9\u00c8\u00ca\u00cb,I\u00cd\u00cc\u0130\u00ce\u00cf,O\u00d3\u00d2\u00d4\u00d5\u00d6,S\u00df,U\u00da\u00d9\u00db\u00dc".split(","),
function(b){var c=b.charAt(0);U(b.slice(1).split(""),function(d){a[d]=c;a[d.toLowerCase()]=c.toLowerCase()})});q[La]=k;q[Oa]=a})();Sa("each,any,all,none,count,find,findAll,isEmpty");Sa("sum,average,min,max,least,most",k);ta("map,reduce,size",M);
var V,Ta,Ua=["ampm","hour","minute","second","ampm","utc","offset_sign","offset_hours","offset_minutes","ampm"],Va="({t})?\\s*(\\d{1,2}(?:[,.]\\d+)?)(?:{h}(\\d{1,2}(?:[,.]\\d+)?)?{m}(?::?(\\d{1,2}(?:[,.]\\d+)?){s})?\\s*(?:({t})|(Z)|(?:([+-])(\\d{2,2})(?::?(\\d{2,2}))?)?)?|\\s*({t}))",Wa={},Xa,Ya,W,Za=[],$a=[{ba:"f{1,4}|ms|milliseconds",format:function(a){return a.getMilliseconds()}},{ba:"ss?|seconds",format:function(a){return a.getSeconds()}},{ba:"mm?|minutes",format:function(a){return a.getMinutes()}},
{ba:"hh?|hours|12hr",format:function(a){a=a.getHours(void 0);return a===0?12:a-P(a/13)*12}},{ba:"HH?|24hr",format:function(a){return a.getHours()}},{ba:"dd?|date|day",format:function(a){return a.getDate()}},{ba:"dow|weekday",na:k,format:function(a,b,c){return b.weekdays[a.getDay()+(c-1)*7]}},{ba:"MM?",format:function(a){return a.getMonth()+1}},{ba:"mon|month",na:k,format:function(a,b,c){return b.months[a.getMonth()+(c-1)*12]}},{ba:"y{2,4}|year",format:function(a){return a.getFullYear()}},{ba:"[Tt]{1,2}",
format:function(a,b,c,d){a=b.ampm[P(a.getHours()/12)];if(d.length===1)a=a.slice(0,1);if(d.slice(0,1)==="T")a=a.toUpperCase();return a}},{ba:"z{1,4}|tz|timezone",text:k,format:function(a,b,c,d){a=a.getUTCOffset();if(d=="z"||d=="zz")a=a.replace(/(\d{2})(\d{2})/,function(e,g){return Q(g,d.length)});return a}},{ba:"iso(tz|timezone)",format:function(a){return a.getUTCOffset(k)}},{ba:"ord",format:function(a){a=a.getDate();return a+pa(a)}}],ab=[{$:"year",method:"FullYear",ja:k,da:function(a){return(365+
(a?a.isLeapYear()?1:0:0.25))*24*60*60*1E3}},{$:"month",method:"Month",ja:k,da:function(a,b){var c=30.4375,d;if(a){d=a.daysInMonth();if(b<=d.days())c=d}return c*24*60*60*1E3}},{$:"week",method:"Week",da:aa(6048E5)},{$:"day",method:"Date",ja:k,da:aa(864E5)},{$:"hour",method:"Hours",da:aa(36E5)},{$:"minute",method:"Minutes",da:aa(6E4)},{$:"second",method:"Seconds",da:aa(1E3)},{$:"millisecond",method:"Milliseconds",da:aa(1)}],bb={};function cb(a){na(this,a);this.ga=Za.concat()}
cb.prototype={getMonth:function(a){return A(a)?a-1:this.months.indexOf(a)%12},ka:function(a){return this.weekdays.indexOf(a)%7},qa:function(a){var b;return A(a)?a:a&&(b=this.numbers.indexOf(a))!==-1?(b+1)%10:1},wa:function(a){var b=this;return a.replace(r(this.num,"g"),function(c){return b.qa(c)||""})},ua:function(a){return V.units[this.units.indexOf(a)%8]},Da:function(a){return this.pa(a,a[2]>0?"future":"past")},ta:function(a){return this.pa(db(a),"duration")},xa:function(a){a=a||this.code;return a===
"en"||a==="en-US"?k:this.variant},Aa:function(a){return a===this.ampm[0]},Ba:function(a){return a===this.ampm[1]},pa:function(a,b){var c=a[0],d=a[1],e=a[2],g,f,i;if(this.code=="ru"){i=c.toString().slice(-1);switch(k){case i==1:i=1;break;case i>=2&&i<=4:i=2;break;default:i=3}}else i=this.plural&&c>1?1:0;f=this.units[i*8+d]||this.units[d];if(this.capitalizeUnit)f=eb(f);g=this.modifiers.filter(function(h){return h.name=="sign"&&h.value==(e>0?1:-1)})[0];return this[b].replace(/\{(.*?)\}/g,function(h,
j){switch(j){case "num":return c;case "unit":return f;case "sign":return g.src}})},va:function(){return this.oa?[this.oa].concat(this.ga):this.ga},addFormat:function(a,b,c,d,e){var g=c||[],f=this,i;a=a.replace(/\s+/g,"[-,. ]*");a=a.replace(/\{([^,]+?)\}/g,function(h,j){var n=j.match(/\?$/),o=j.match(/(\d)(?:-(\d))?/),u=j.match(/^\d+$/),H=j.replace(/[^a-z]+$/,""),F,L;if(u)F=f.optionals[u[0]];else if(f[H])F=f[H];else if(f[H+"s"]){F=f[H+"s"];if(o){L=[];F.forEach(function(Ca,$){var Da=$%(f.units?8:F.length);
if(Da>=o[1]&&Da<=(o[2]||o[1]))L.push(Ca)});F=L}F=fb(F)}if(u)return"(?:"+F+")?";else{c||g.push(H);return"("+F+")"+(n?"?":"")}});if(b){b=gb(Va,f,e);e=["t","[\\s\\u3000]"].concat(f.timeMarker);i=a.match(/\\d\{\d,\d\}\)+\??$/);hb(f,"(?:"+b+")[,\\s\\u3000]+?"+a,Ua.concat(g),d);hb(f,a+"(?:[,\\s]*(?:"+e.join("|")+(i?"+":"*")+")"+b+")?",g.concat(Ua),d)}else hb(f,a,g,d)}};function ib(a,b){var c;B(a)||(a="");c=bb[a]||bb[a.slice(0,2)];if(b===m&&!c)throw Error("Invalid locale.");return c||Ta}
function jb(a,b){function c(h){var j=f[h];if(B(j))f[h]=j.split(",");else j||(f[h]=[])}function d(h,j){h=h.split("+").map(function(n){return n.replace(/(.+):(.+)$/,function(o,u,H){return H.split("|").map(function(F){return u+F}).join("|")})}).join("|");return h.split("|").forEach(j)}function e(h,j,n){var o=[];f[h].forEach(function(u,H){if(j)u+="+"+u.slice(0,3);d(u,function(F,L){o[L*n+H]=F.toLowerCase()})});f[h]=o}function g(h,j,n){h="\\d{"+h+","+j+"}";if(n)h+="|(?:"+fb(f.numbers)+")+";return h}var f,
i;f=new cb(b);c("modifiers");"months,weekdays,units,numbers,articles,optionals,timeMarker,ampm,timeSuffixes,dateParse,timeParse".split(",").forEach(c);i=!f.monthSuffix;e("months",i,12);e("weekdays",i,7);e("units",m,8);e("numbers",m,10);f.code=a;f.date=g(1,2,f.digitDate);f.year=g(4,4);f.num=function(){var h=["\\d+"].concat(f.articles);if(f.numbers)h=h.concat(f.numbers);return fb(h)}();(function(){var h=[];f.ha={};f.modifiers.forEach(function(j){var n=j.name;d(j.src,function(o){var u=f[n];f.ha[o]=j;
h.push({name:n,src:o,value:j.value});f[n]=u?u+"|"+o:o})});f.day+="|"+fb(f.weekdays);f.modifiers=h})();if(f.monthSuffix){f.month=g(1,2);f.months=N(1,12).map(function(h){return h+f.monthSuffix})}f.full_month=g(1,2)+"|"+fb(f.months);f.timeSuffixes.length>0&&f.addFormat(gb(Va,f),m,Ua);f.addFormat("{day}",k);f.addFormat("{month}"+(f.monthSuffix||""));f.addFormat("{year}"+(f.yearSuffix||""));f.timeParse.forEach(function(h){f.addFormat(h,k)});f.dateParse.forEach(function(h){f.addFormat(h)});return bb[a]=
f}function hb(a,b,c,d){a.ga.unshift({Ea:d,za:a,Ca:r("^"+b+"$","i"),to:c})}function eb(a){return a.slice(0,1).toUpperCase()+a.slice(1)}function fb(a){return a.filter(function(b){return!!b}).join("|")}function kb(a,b){var c;if(la(a[0]))return a;else if(A(a[0])&&!A(a[1]))return[a[0]];else if(B(a[0])&&b)return[lb(a[0]),a[1]];c={};Ya.forEach(function(d,e){c[d.$]=a[e]});return[c]}
function lb(a,b){var c={};match=a.match(/^(\d+)?\s?(\w+?)s?$/i);if(K(b))b=parseInt(match[1])||1;c[match[2].toLowerCase()]=b;return c}function mb(a,b){var c={},d,e;b.forEach(function(g,f){d=a[f+1];if(!(K(d)||d==="")){if(g==="year")c.Fa=d;e=parseFloat(d.replace(/,/,"."));c[g]=!isNaN(e)?e:d.toLowerCase()}});return c}function nb(a){a=a.trim().replace(/^(just )?now|\.+$/i,"");return ob(a)}
function ob(a){return a.replace(Xa,function(b,c,d){var e=0,g=1,f,i;if(c)return b;d.split("").reverse().forEach(function(h){h=Wa[h];var j=h>9;if(j){if(f)e+=g;g*=h/(i||1);i=h}else{if(f===m)g*=10;e+=g*h}f=j});if(f)e+=g;return e})}
function pb(a,b,c){var d=new s,e=m,g,f,i,h,j,n,o,u,H;if(fa(a))d=a.clone();else if(A(a))d=new s(a);else if(la(a)){d=(new s).set(a,k);h=a}else if(B(a)){g=ib(b);a=nb(a);g&&G(g.va(),function(F,L){var Ca=a.match(L.Ca);if(Ca){i=L;f=i.za;h=mb(Ca,i.to,f);f.oa=i;if(h.timestamp){h=h.timestamp;return m}if(i.Ea&&!B(h.month)&&(B(h.date)||g.xa(b))){u=h.month;h.month=h.date;h.date=u}if(h.year&&h.Fa.length===2)h.year=O((new s).getFullYear()/100)*100-O(h.year/100)*100+h.year;if(h.month){h.month=f.getMonth(h.month);
if(h.shift&&!h.unit)h.unit=f.units[7]}if(h.weekday&&h.date)delete h.weekday;else if(h.weekday){h.weekday=f.ka(h.weekday);if(h.shift&&!h.unit)h.unit=f.units[5]}if(h.day&&(u=f.ha[h.day])){h.day=u.value;d.reset();e=k}else if(h.day&&(n=f.ka(h.day))>-1){delete h.day;if(h.num&&h.month){H=function(){var $=d.ka();d.Ha(7*(h.num-1)+($>n?n+7:n))};h.day=1}else h.weekday=n}if(h.date&&!A(h.date))h.date=f.wa(h.date);if(f.Ba(h.ampm)&&h.hour<12)h.hour+=12;else if(f.Aa(h.ampm)&&h.hour===12)h.hour=0;if("offset_hours"in
h||"offset_minutes"in h){h.utc=k;h.offset_minutes=h.offset_minutes||0;h.offset_minutes+=h.offset_hours*60;if(h.offset_sign==="-")h.offset_minutes*=-1;h.minute-=h.offset_minutes}if(h.unit){e=k;o=f.qa(h.num);j=f.ua(h.unit);if(h.shift||h.edge){o*=(u=f.ha[h.shift])?u.value:0;if(j==="month"&&J(h.date)){d.set({day:h.date},k);delete h.date}if(j==="year"&&J(h.month)){d.set({month:h.month,day:h.date},k);delete h.month;delete h.date}}if(h.sign&&(u=f.ha[h.sign]))o*=u.value;if(J(h.weekday)){d.set({weekday:h.weekday},
k);delete h.weekday}h[j]=(h[j]||0)+o}if(h.year_sign==="-")h.year*=-1;W.slice(1,4).forEach(function($,Da){var xb=h[$.$],yb=xb%1;if(yb){h[W[Da].$]=O(yb*($.$==="second"?1E3:60));h[$.$]=P(xb)}});return m}});if(i)if(e)d.advance(h);else{h.utc&&d.reset();qb(d,h,k,h.utc,m,c)}else d=a?new s(a):new s;if(h&&h.edge){u=f.ha[h.edge];G(W.slice(4),function(F,L){if(J(h[L.$])){j=L.$;return m}});if(j==="year")h.fa="month";else if(j==="month"||j==="week")h.fa="day";d[(u.value<0?"endOf":"beginningOf")+eb(j)]();u.value===
-2&&d.reset()}H&&H()}return{ea:d,set:h}}function rb(a){a.addDays(4-(a.getDay()||7)).reset();return 1+P(a.daysSince(a.clone().beginningOfYear())/7)}function db(a){var b,c=w.abs(a),d=c,e=0;W.slice(1).forEach(function(g,f){b=P(O(c/g.da()*10)/10);if(b>=1){d=b;e=f+1}});return[d,e,a]}
function sb(a,b,c,d){var e,g=ib(d),f=r(/^[A-Z]/);if(a.isValid())if(Date[b])b=Date[b];else{if(z(b)){e=db(a.millisecondsFromNow());b=b.apply(a,e.concat(g))}}else return"Invalid Date";if(!b&&c){e=e||db(a.millisecondsFromNow());if(e[1]===0){e[1]=1;e[0]=1}return g.Da(e)}b=b||"long";b=g[b]||b;$a.forEach(function(i){b=b.replace(r("\\{("+i.ba+")(\\d)?\\}",i.na?"i":""),function(h,j,n){h=i.format(a,g,n||1,j);n=j.length;var o=j.match(/^(.)\1+$/);if(i.na){if(n===3)h=h.slice(0,3);if(o||j.match(f))h=eb(h)}else if(o&&
!i.text)h=(A(h)?Q(h,n):h.toString()).slice(-n);return h})});return b}function tb(a,b,c){var d=pb(b),e=0,g=b=0,f;if(c>0){b=g=c;f=k}if(!d.ea.isValid())return m;if(d.set&&d.set.fa){ab.forEach(function(h){if(h.$===d.set.fa)e=h.da(d.ea,a-d.ea)-1});c=eb(d.set.fa);if(d.set.edge||d.set.shift)d.ea["beginningOf"+c]();if(d.set.fa==="month")i=d.ea.clone()["endOf"+c]().getTime();if(!f&&d.set.sign&&d.set.fa!="millisecond"){b=50;g=-50}}f=a.getTime();c=d.ea.getTime();var i=i||c+e;return f>=c-b&&f<=i+g}
function qb(a,b,c,d,e,g){function f(j){return J(b[j])?b[j]:b[j+"s"]}var i,h;if(A(b)&&e)b={milliseconds:b};else if(A(b)){a.setTime(b);return a}if(b.date)b.day=b.date;G(W,function(j,n){var o=n.$==="day";if(J(f(n.$))||o&&J(f("weekday"))){b.fa=n.$;h=+j;return m}else if(c&&n.$!=="week"&&(!o||!J(f("week"))))a["set"+(d?"UTC":"")+n.method](o?1:0)});ab.forEach(function(j){var n=j.$;j=j.method;var o;o=f(n);if(!K(o)){if(e){if(n==="week"){o=(b.day||0)+o*7;j="Date"}o=o*e+a["get"+j](void 0)}else n==="month"&&J(f("day"))&&
a.setDate(15);a["set"+(d?"UTC":"")+j](o);if(e&&n==="month"){n=o;if(n<0)n+=12;n%12!=a.getMonth()&&a.setDate(0)}}});if(!e&&!J(f("day"))&&J(f("weekday"))){i=f("weekday");a["set"+(d?"UTC":"")+"Weekday"](i)}(function(){var j=new s;return g===-1&&a>j||g===1&&a<j})()&&G(W.slice(h+1),function(j,n){if((n.ja||n.$==="week"&&J(f("weekday")))&&!J(f(n.$))){a[n.ia](g);return m}});return a}
function gb(a,b,c){var d={h:0,m:1,s:2},e;b=b||V;return a.replace(/{([a-z])}/g,function(g,f){var i=[],h=f==="h",j=h&&!c;if(f==="t")return b.ampm.join("|");else{h&&i.push(":");if(e=b.timeSuffixes[d[f]])i.push(e+"\\s*");return i.length===0?"":"(?:"+i.join("|")+")"+(j?"":"?")}})}function ub(a,b){var c;c=A(a[1])?kb(a)[0]:a[0];return pb(c,a[1],b).ea}
s.extend({create:function(){return ub(arguments)},past:function(){return ub(arguments,-1)},future:function(){return ub(arguments,1)},addLocale:function(a,b){return jb(a,b)},setLocale:function(a){var b=ib(a,m);Ta=b;if(a&&a!=b.code)b.code=a;return b},getLocale:function(a){return!a?Ta:ib(a,m)},addFormat:function(a,b,c){hb(ib(c),a,b)}},m,m);
s.extend({set:function(){var a=kb(arguments);return qb(this,a[0],a[1])},setUTC:function(){var a=kb(arguments);return qb(this,a[0],a[1],k)},setWeekday:function(a){if(!K(a))return this.setDate(this.getDate()+a-this.getDay())},setUTCWeekday:function(a){if(!K(a))return this.setDate(this.getUTCDate()+a-this.getDay())},setWeek:function(a){if(!K(a)){this.setMonth(0);this.setDate(a*7+1)}},setUTCWeek:function(a){if(!K(a)){this.setMonth(0);this.setUTCDate(a*7+1)}},getWeek:function(){return rb(this)},getUTCWeek:function(){return rb(this.toUTC())},
getUTCOffset:function(a){var b=this.ma?0:this.getTimezoneOffset(),c=a===k?":":"";if(!b&&a)return"Z";return Q(O(-b/60),2,k)+c+Q(b%60,2)},toUTC:function(){if(this.ma)return this;var a=this.clone().addMinutes(this.getTimezoneOffset());a.ma=k;return a},isUTC:function(){return this.ma||this.getTimezoneOffset()===0},advance:function(){var a=kb(arguments,k);return qb(this,a[0],a[1],m,1)},rewind:function(){var a=kb(arguments,k);return qb(this,a[0],a[1],m,-1)},isValid:function(){return!isNaN(this.getTime())},
isAfter:function(a,b){return this.getTime()>s.create(a).getTime()-(b||0)},isBefore:function(a,b){return this.getTime()<s.create(a).getTime()+(b||0)},isBetween:function(a,b,c){var d=this.getTime();a=s.create(a).getTime();var e=s.create(b).getTime();b=w.min(a,e);a=w.max(a,e);c=c||0;return b-c<d&&a+c>d},isLeapYear:function(){var a=this.getFullYear();return a%4===0&&a%100!==0||a%400===0},daysInMonth:function(){return 32-(new s(this.getFullYear(),this.getMonth(),32)).getDate()},format:function(a,b){return sb(this,
a,m,b)},relative:function(a,b){if(B(a)){b=a;a=l}return sb(this,a,k,b)},is:function(a,b){var c;if(this.isValid()){if(B(a)){a=a.trim().toLowerCase();switch(k){case a==="future":return this.getTime()>(new s).getTime();case a==="past":return this.getTime()<(new s).getTime();case a==="weekday":return this.getDay()>0&&this.getDay()<6;case a==="weekend":return this.getDay()===0||this.getDay()===6;case (c=V.weekdays.indexOf(a)%7)>-1:return this.getDay()===c;case (c=V.months.indexOf(a)%12)>-1:return this.getMonth()===
c}}return tb(this,a,b)}},reset:function(a){var b={},c;a=a||"hours";if(a==="date")a="days";c=ab.some(function(d){return a===d.$||a===d.$+"s"});b[a]=a.match(/^days?/)?1:0;return c?this.set(b,k):this},clone:function(){return new s(this.getTime())}});s.extend({iso:function(){return this.toISOString()},getWeekday:s.prototype.getDay,getUTCWeekday:s.prototype.getUTCDay});
function vb(a,b){function c(){return O(this*b)}function d(){return ub(arguments)[a.ia](this)}function e(){return ub(arguments)[a.ia](-this)}var g=a.$,f={};f[g]=c;f[g+"s"]=c;f[g+"Before"]=e;f[g+"sBefore"]=e;f[g+"Ago"]=e;f[g+"sAgo"]=e;f[g+"After"]=d;f[g+"sAfter"]=d;f[g+"FromNow"]=d;f[g+"sFromNow"]=d;v.extend(f)}v.extend({duration:function(a){return ib(a).ta(this)}});
V=Ta=s.addLocale("en",{plural:k,timeMarker:"at",ampm:"am,pm",months:"January,February,March,April,May,June,July,August,September,October,November,December",weekdays:"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",units:"millisecond:|s,second:|s,minute:|s,hour:|s,day:|s,week:|s,month:|s,year:|s",numbers:"one,two,three,four,five,six,seven,eight,nine,ten",articles:"a,an,the",optionals:"the,st|nd|rd|th,of","short":"{Month} {d}, {yyyy}","long":"{Month} {d}, {yyyy} {h}:{mm}{tt}",full:"{Weekday} {Month} {d}, {yyyy} {h}:{mm}:{ss}{tt}",
past:"{num} {unit} {sign}",future:"{num} {unit} {sign}",duration:"{num} {unit}",modifiers:[{name:"day",src:"yesterday",value:-1},{name:"day",src:"today",value:0},{name:"day",src:"tomorrow",value:1},{name:"sign",src:"ago|before",value:-1},{name:"sign",src:"from now|after|from|in",value:1},{name:"edge",src:"last day",value:-2},{name:"edge",src:"end",value:-1},{name:"edge",src:"first day|beginning",value:1},{name:"shift",src:"last",value:-1},{name:"shift",src:"the|this",value:0},{name:"shift",src:"next",
value:1}],dateParse:["{num} {unit} {sign}","{sign} {num} {unit}","{num} {unit=4-5} {sign} {day}","{month} {year}","{shift} {unit=5-7}","{0} {edge} of {shift?} {unit=4-7?}{month?}{year?}"],timeParse:["{0} {num}{1} {day} of {month} {year?}","{weekday?} {month} {date}{1} {year?}","{date} {month} {year}","{shift} {weekday}","{shift} week {weekday}","{weekday} {2} {shift} week","{0} {date}{1} of {month}","{0}{month?} {date?}{1} of {shift} {unit=6-7}"]});W=ab.concat().reverse();Ya=ab.concat();
Ya.splice(2,1);
I(s,k,m,ab,function(a,b,c){var d=b.$,e=eb(d),g=b.da(),f,i;b.ia="add"+e+"s";f=function(h,j){return O((this.getTime()-s.create(h,j).getTime())/g)};i=function(h,j){return O((s.create(h,j).getTime()-this.getTime())/g)};a[d+"sAgo"]=i;a[d+"sUntil"]=i;a[d+"sSince"]=f;a[d+"sFromNow"]=f;a[b.ia]=function(h,j){var n={};n[d]=h;return this.advance(n,j)};vb(b,g);c<3&&["Last","This","Next"].forEach(function(h){a["is"+h+e]=function(){return this.is(h+" "+d)}});if(c<4){a["beginningOf"+e]=function(){var h={};switch(d){case "year":h.year=
this.getFullYear();break;case "month":h.month=this.getMonth();break;case "day":h.day=this.getDate();break;case "week":h.weekday=0}return this.set(h,k)};a["endOf"+e]=function(){var h={hours:23,minutes:59,seconds:59,milliseconds:999};switch(d){case "year":h.month=11;h.day=31;break;case "month":h.day=this.daysInMonth();break;case "week":h.weekday=6}return this.set(h,k)}}});V.addFormat("([+-])?(\\d{4,4})[-.]?{full_month}[-.]?(\\d{1,2})?",k,["year_sign","year","month","date"],m,k);
V.addFormat("(\\d{1,2})[-.\\/]{full_month}(?:[-.\\/](\\d{2,4}))?",k,["date","month","year"],k);V.addFormat("{full_month}[-.](\\d{4,4})",m,["month","year"]);V.addFormat("\\/Date\\((\\d+(?:\\+\\d{4,4})?)\\)\\/",m,["timestamp"]);V.addFormat(gb(Va,V),m,Ua);Za=V.ga.slice(0,7).reverse();V.ga=V.ga.slice(7).concat(Za);I(s,k,m,"short,long,full",function(a,b){a[b]=function(c){return sb(this,b,m,c)}});
"\u3007\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341\u767e\u5343\u4e07".split("").forEach(function(a,b){if(b>9)b=w.pow(10,b-9);Wa[a]=b});"\uff10\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19".split("").forEach(function(a,b){Wa[a]=b});Xa=r("([\u671f\u9031\u5468])?([\u3007\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341\u767e\u5343\u4e07\uff10\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19]+)(?!\u6628)","g");
(function(){var a="today,yesterday,tomorrow,weekday,weekend,future,past".split(","),b=V.weekdays.slice(0,7),c=V.months.slice(0,12);I(s,k,m,a.concat(b).concat(c),function(d,e){d["is"+eb(e)]=function(){return this.is(e)}})})();s.extend({RFC1123:"{Dow}, {dd} {Mon} {yyyy} {HH}:{mm}:{ss} {tz}",RFC1036:"{Weekday}, {dd}-{Mon}-{yy} {HH}:{mm}:{ss} {tz}",ISO8601_DATE:"{yyyy}-{MM}-{dd}",ISO8601_DATETIME:"{yyyy}-{MM}-{dd}T{HH}:{mm}:{ss}.{fff}{isotz}"},m,m);
DateRange=function(a,b){this.start=s.create(a);this.end=s.create(b)};DateRange.prototype.toString=function(){return this.isValid()?this.start.full()+".."+this.end.full():"Invalid DateRange"};
D(DateRange,k,m,{isValid:function(){return this.start<this.end},duration:function(){return this.isValid()?this.end.getTime()-this.start.getTime():NaN},contains:function(a){var b=this;return(a.start&&a.end?[a.start,a.end]:[a]).every(function(c){return c>=b.start&&c<=b.end})},every:function(a,b){var c=this.start.clone(),d=[],e=0,g;if(B(a)){c.advance(lb(a,0),k);g=lb(a)}else g={milliseconds:a};for(;c<=this.end;){d.push(c);b&&b(c,e);c=c.clone().advance(g,k);e++}return d},union:function(a){return new DateRange(this.start<
a.start?this.start:a.start,this.end>a.end?this.end:a.end)},intersect:function(a){return new DateRange(this.start>a.start?this.start:a.start,this.end<a.end?this.end:a.end)}});I(DateRange,k,m,"Millisecond,Second,Minute,Hour,Day,Week,Month,Year",function(a,b){a["each"+b]=function(c){return this.every(b,c)}});D(s,m,m,{range:function(a,b){return new DateRange(a,b)}});
function wb(a,b,c,d,e){if(!a.timers)a.timers=[];A(b)||(b=0);a.timers.push(setTimeout(function(){a.timers.splice(g,1);c.apply(d,e||[])},b));var g=a.timers.length}
D(Function,k,m,{lazy:function(a,b){function c(){if(!(g&&e.length>b-2)){e.push([this,arguments]);f()}}var d=this,e=[],g=m,f,i,h;a=a||1;b=b||Infinity;i=O(a,void 0,"ceil");h=O(i/a);f=function(){if(!(g||e.length==0)){for(var j=w.max(e.length-h,0);e.length>j;)Function.prototype.apply.apply(d,e.shift());wb(c,i,function(){g=m;f()});g=k}};return c},delay:function(a){var b=E(arguments).slice(1);wb(this,a,this,this,b);return this},throttle:function(a){return this.lazy(a,1)},debounce:function(a){var b=this;
return function(){b.cancel();wb(b,a,b,this,arguments)}},cancel:function(){if(da(this.timers))for(;this.timers.length>0;)clearTimeout(this.timers.shift());return this},after:function(a){var b=this,c=0,d=[];if(A(a)){if(a===0){b.call();return b}}else a=1;return function(){var e;d.push(E(arguments));c++;if(c==a){e=b.call(this,d);c=0;d=[];return e}}},once:function(){var a=this;return function(){return ma(a,"memo")?a.memo:a.memo=a.apply(this,arguments)}},fill:function(){var a=this,b=E(arguments);return function(){var c=
E(arguments);b.forEach(function(d,e){if(d!=l||e>=c.length)c.splice(e,0,d)});return a.apply(this,c)}}});
function zb(a,b,c,d,e,g){var f=a.toFixed(20),i=f.search(/\./);f=f.search(/[1-9]/);i=i-f;if(i>0)i-=1;e=w.max(w.min((i/3).floor(),e===m?c.length:e),-d);d=c.charAt(e+d-1);if(i<-9){e=-3;b=i.abs()-9;d=c.slice(0,1)}return(a/(g?(2).pow(10*e):(10).pow(e*3))).round(b||0).format()+d.trim()}
D(v,m,m,{random:function(a,b){var c,d;if(arguments.length==1){b=a;a=0}c=w.min(a||0,K(b)?1:b);d=w.max(a||0,K(b)?1:b);return O(w.random()*(d-c)+c)}});
D(v,k,m,{log:function(a){return w.log(this)/(a?w.log(a):1)},abbr:function(a){return zb(this,a,"kmbt",0,4)},metric:function(a,b){return zb(this,a,"n\u03bcm kMGTPE",4,K(b)?1:b)},bytes:function(a,b){return zb(this,a,"kMGTPE",0,K(b)?4:b,k)+"B"},isInteger:function(){return this%1==0},isOdd:function(){return!this.isMultipleOf(2)},isEven:function(){return this.isMultipleOf(2)},isMultipleOf:function(a){return this%a===0},format:function(a,b,c){var d,e,g=/(\d+)(\d{3})/;if(t(b).match(/\d/))throw new TypeError("Thousands separator cannot contain numbers.");
d=A(a)?O(this,a||0).toFixed(w.max(a,0)):this.toString();b=b||",";c=c||".";e=d.split(".");d=e[0];for(e=e[1]||"";d.match(g);)d=d.replace(g,"$1"+b+"$2");if(e.length>0)d+=c+oa((a||0)-e.length,"0")+e;return d},hex:function(a){return this.pad(a||1,m,16)},upto:function(a,b,c){return N(this,a,b,c||1)},downto:function(a,b,c){return N(this,a,b,-(c||1))},times:function(a){if(a)for(var b=0;b<this;b++)a.call(this,b);return this.toNumber()},chr:function(){return t.fromCharCode(this)},pad:function(a,b,c){return Q(this,
a,b,c)},ordinalize:function(){var a=this.abs();a=parseInt(a.toString().slice(-2));return this+pa(a)},toNumber:function(){return parseFloat(this,10)}});I(v,k,m,"round,floor,ceil",function(a,b){a[b]=function(c){return O(this,c,b)}});I(v,k,m,"abs,pow,sin,asin,cos,acos,tan,atan,exp,pow,sqrt",function(a,b){a[b]=function(c,d){return w[b](this,c,d)}});
var Ab="isObject,isNaN".split(","),Bb="keys,values,each,merge,clone,equal,watch,tap,has".split(",");
function Cb(a,b,c,d){var e=/^(.+?)(\[.*\])$/,g,f,i;if(d!==m&&(f=b.match(e))){i=f[1];b=f[2].replace(/^\[|\]$/g,"").split("][");b.forEach(function(h){g=!h||h.match(/^\d+$/);if(!i&&da(a))i=a.length;a[i]||(a[i]=g?[]:{});a=a[i];i=h});if(!i&&g)i=a.length.toString();Cb(a,i,c)}else a[b]=c.match(/^[\d.]+$/)?parseFloat(c):c==="true"?k:c==="false"?m:c}D(p,m,k,{watch:function(a,b,c){if(ca){var d=a[b];p.defineProperty(a,b,{enumerable:k,configurable:k,get:function(){return d},set:function(e){d=c.call(a,b,d,e)}})}}});
D(p,m,function(a,b){return z(b)},{keys:function(a,b){var c=p.keys(a);c.forEach(function(d){b.call(a,d,a[d])});return c}});
D(p,m,m,{isObject:function(a){return la(a)},isNaN:function(a){return A(a)&&a.valueOf()!==a.valueOf()},equal:function(a,b){return S(a)===S(b)},extended:function(a){return new M(a)},merge:function(a,b,c,d){var e,g;if(a&&typeof b!="string")for(e in b)if(ma(b,e)&&a){g=b[e];if(J(a[e])){if(d===m)continue;if(z(d))g=d.call(b,e,a[e],b[e])}if(c===k&&g&&ka(g))if(fa(g))g=new s(g.getTime());else if(C(g))g=new r(g.source,ra(g));else{a[e]||(a[e]=q.isArray(g)?[]:{});p.merge(a[e],b[e],c,d);continue}a[e]=g}return a},
values:function(a,b){var c=[];G(a,function(d,e){c.push(e);b&&b.call(a,e)});return c},clone:function(a,b){if(!ka(a))return a;if(q.isArray(a))return a.concat();var c=a instanceof M?new M:{};return p.merge(c,a,b)},fromQueryString:function(a,b){var c=p.extended();a=a&&a.toString?a.toString():"";decodeURIComponent(a.replace(/^.*?\?/,"")).split("&").forEach(function(d){d=d.split("=");d.length===2&&Cb(c,d[0],d[1],b)});return c},tap:function(a,b){var c=b;z(b)||(c=function(){b&&a[b]()});c.call(a,a);return a},
has:function(a,b){return ma(a,b)}});I(p,m,m,x,function(a,b){var c="is"+b;Ab.push(c);a[c]=function(d){return ga(d,b)}});(function(){D(p,m,function(){return arguments.length===0},{extend:function(){ta(Ab.concat(Bb),p)}})})();ta(Bb,M);
D(r,m,m,{escape:function(a){return R(a)}});
D(r,k,m,{getFlags:function(){return ra(this)},setFlags:function(a){return r(this.source,a)},addFlag:function(a){return this.setFlags(ra(this,a))},removeFlag:function(a){return this.setFlags(ra(this).replace(a,""))}});
var Db,Eb;
D(t,k,m,{escapeRegExp:function(){return R(this)},escapeURL:function(a){return a?encodeURIComponent(this):encodeURI(this)},unescapeURL:function(a){return a?decodeURI(this):decodeURIComponent(this)},escapeHTML:function(){return this.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")},unescapeHTML:function(){return this.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")},encodeBase64:function(){return Db(this)},decodeBase64:function(){return Eb(this)},each:function(a,b){var c,
d;if(z(a)){b=a;a=/[\s\S]/g}else if(a)if(B(a))a=r(R(a),"gi");else{if(C(a))a=r(a.source,ra(a,"g"))}else a=/[\s\S]/g;c=this.match(a)||[];if(b)for(d=0;d<c.length;d++)c[d]=b.call(this,c[d],d,c)||c[d];return c},shift:function(a){var b="";a=a||0;this.codes(function(c){b+=t.fromCharCode(c+a)});return b},codes:function(a){for(var b=[],c=0;c<this.length;c++){var d=this.charCodeAt(c);b.push(d);a&&a.call(this,d,c)}return b},chars:function(a){return this.each(a)},words:function(a){return this.trim().each(/\S+/g,
a)},lines:function(a){return this.trim().each(/^.*$/gm,a)},paragraphs:function(a){var b=this.trim().split(/[\r\n]{2,}/);return b=b.map(function(c){if(a)var d=a.call(c);return d?d:c})},startsWith:function(a,b){if(K(b))b=k;var c=C(a)?a.source.replace("^",""):R(a);return r("^"+c,b?"":"i").test(this)},endsWith:function(a,b){if(K(b))b=k;var c=C(a)?a.source.replace("$",""):R(a);return r(c+"$",b?"":"i").test(this)},isBlank:function(){return this.trim().length===0},has:function(a){return this.search(C(a)?
a:R(a))!==-1},add:function(a,b){b=K(b)?this.length:b;return this.slice(0,b)+a+this.slice(b)},remove:function(a){return this.replace(a,"")},reverse:function(){return this.split("").reverse().join("")},compact:function(){return this.trim().replace(/([\r\n\s\u3000])+/g,function(a,b){return b==="\u3000"?b:" "})},at:function(){return sa(this,arguments,k)},from:function(a){return this.slice(a)},to:function(a){if(K(a))a=this.length;return this.slice(0,a)},dasherize:function(){return this.underscore().replace(/_/g,
"-")},underscore:function(){return this.replace(/[-\s]+/g,"_").replace(t.Inflector&&t.Inflector.acronymRegExp,function(a,b){return(b>0?"_":"")+a.toLowerCase()}).replace(/([A-Z\d]+)([A-Z][a-z])/g,"$1_$2").replace(/([a-z\d])([A-Z])/g,"$1_$2").toLowerCase()},camelize:function(a){return this.underscore().replace(/(^|_)([^_]+)/g,function(b,c,d,e){b=d;b=(c=t.Inflector)&&c.acronyms[b];b=B(b)?b:void 0;e=a!==m||e>0;if(b)return e?b:b.toLowerCase();return e?d.capitalize():d})},spacify:function(){return this.underscore().replace(/_/g,
" ")},stripTags:function(){var a=this;E(arguments.length>0?arguments:[""],function(b){a=a.replace(r("</?"+R(b)+"[^<>]*>","gi"),"")});return a},removeTags:function(){var a=this;E(arguments.length>0?arguments:["\\S+"],function(b){b=r("<("+b+")[^<>]*(?:\\/>|>.*?<\\/\\1>)","gi");a=a.replace(b,"")});return a},truncate:function(a,b,c,d){var e="",g="",f=this.toString(),i="["+qa()+"]+",h="[^"+qa()+"]*",j=r(i+h+"$");d=K(d)?"...":t(d);if(f.length<=a)return f;switch(c){case "left":a=f.length-a;e=d;f=f.slice(a);
j=r("^"+h+i);break;case "middle":a=P(a/2);g=d+f.slice(f.length-a).trimLeft();f=f.slice(0,a);break;default:a=a;g=d;f=f.slice(0,a)}if(b===m&&this.slice(a,a+1).match(/\S/))f=f.remove(j);return e+f+g},pad:function(a,b){return oa(b,a)+this+oa(b,a)},padLeft:function(a,b){return oa(b,a)+this},padRight:function(a,b){return this+oa(b,a)},first:function(a){if(K(a))a=1;return this.substr(0,a)},last:function(a){if(K(a))a=1;return this.substr(this.length-a<0?0:this.length-a)},repeat:function(a){var b="",c=0;if(A(a)&&
a>0)for(;c<a;){b+=this;c++}return b},toNumber:function(a){var b=this.replace(/,/g,"");return b.match(/\./)?parseFloat(b):parseInt(b,a||10)},capitalize:function(a){var b;return this.toLowerCase().replace(a?/[\s\S]/g:/^\S/,function(c){var d=c.toUpperCase(),e;e=b?c:d;b=d!==c;return e})},assign:function(){var a={};E(arguments,function(b,c){if(la(b))na(a,b);else a[c+1]=b});return this.replace(/\{([^{]+?)\}/g,function(b,c){return ma(a,c)?a[c]:b})},namespace:function(a){a=a||ba;G(this.split("."),function(b,
c){return!!(a=a[c])});return a}});D(t,k,m,{insert:t.prototype.add});
(function(a){if(this.btoa){Db=this.btoa;Eb=this.atob}else{var b=/[^A-Za-z0-9\+\/\=]/g;Db=function(c){var d="",e,g,f,i,h,j,n=0;do{e=c.charCodeAt(n++);g=c.charCodeAt(n++);f=c.charCodeAt(n++);i=e>>2;e=(e&3)<<4|g>>4;h=(g&15)<<2|f>>6;j=f&63;if(isNaN(g))h=j=64;else if(isNaN(f))j=64;d=d+a.charAt(i)+a.charAt(e)+a.charAt(h)+a.charAt(j)}while(n<c.length);return d};Eb=function(c){var d="",e,g,f,i,h,j=0;if(c.match(b))throw Error("String contains invalid base64 characters");c=c.replace(/[^A-Za-z0-9\+\/\=]/g,"");
do{e=a.indexOf(c.charAt(j++));g=a.indexOf(c.charAt(j++));i=a.indexOf(c.charAt(j++));h=a.indexOf(c.charAt(j++));e=e<<2|g>>4;g=(g&15)<<4|i>>2;f=(i&3)<<6|h;d+=t.fromCharCode(e);if(i!=64)d+=t.fromCharCode(g);if(h!=64)d+=t.fromCharCode(f)}while(j<c.length);return d}}})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");})();(function(a){(function(a){science={version:"1.9.1"},science.ascending=function(a,b){return a-b},science.EULER=.5772156649015329,science.expm1=function(a){return a<1e-5&&a>-0.00001?a+.5*a*a:Math.exp(a)-1},science.functor=function(a){return typeof a=="function"?a:function(){return a}},science.hypot=function(a,b){a=Math.abs(a),b=Math.abs(b);var c,d;a>b?(c=a,d=b):(c=b,d=a);var e=d/c;return c*Math.sqrt(1+e*e)},science.quadratic=function(){function b(b,c,d){var e=c*c-4*b*d;return e>0?(e=Math.sqrt(e)/(2*b),a?[{r:-c-e,i:0},{r:-c+e,i:0}]:[-c-e,-c+e]):e===0?(e=-c/(2*b),a?[{r:e,i:0}]:[e]):a?(e=Math.sqrt(-e)/(2*b),[{r:-c,i:-e},{r:-c,i:e}]):[]}var a=!1;return b.complex=function(c){return arguments.length?(a=c,b):a},b},science.zeroes=function(a){var b=-1,c=[];if(arguments.length===1)while(++b<a)c[b]=0;else while(++b<a)c[b]=science.zeroes.apply(this,Array.prototype.slice.call(arguments,1));return c}})(this),function(a){function b(a,b,c){var d=c.length;for(var e=0;e<d;e++)a[e]=c[d-1][e];for(var f=d-1;f>0;f--){var g=0,h=0;for(var i=0;i<f;i++)g+=Math.abs(a[i]);if(g===0){b[f]=a[f-1];for(var e=0;e<f;e++)a[e]=c[f-1][e],c[f][e]=0,c[e][f]=0}else{for(var i=0;i<f;i++)a[i]/=g,h+=a[i]*a[i];var j=a[f-1],k=Math.sqrt(h);j>0&&(k=-k),b[f]=g*k,h-=j*k,a[f-1]=j-k;for(var e=0;e<f;e++)b[e]=0;for(var e=0;e<f;e++){j=a[e],c[e][f]=j,k=b[e]+c[e][e]*j;for(var i=e+1;i<=f-1;i++)k+=c[i][e]*a[i],b[i]+=c[i][e]*j;b[e]=k}j=0;for(var e=0;e<f;e++)b[e]/=h,j+=b[e]*a[e];var l=j/(h+h);for(var e=0;e<f;e++)b[e]-=l*a[e];for(var e=0;e<f;e++){j=a[e],k=b[e];for(var i=e;i<=f-1;i++)c[i][e]-=j*b[i]+k*a[i];a[e]=c[f-1][e],c[f][e]=0}}a[f]=h}for(var f=0;f<d-1;f++){c[d-1][f]=c[f][f],c[f][f]=1;var h=a[f+1];if(h!=0){for(var i=0;i<=f;i++)a[i]=c[i][f+1]/h;for(var e=0;e<=f;e++){var k=0;for(var i=0;i<=f;i++)k+=c[i][f+1]*c[i][e];for(var i=0;i<=f;i++)c[i][e]-=k*a[i]}}for(var i=0;i<=f;i++)c[i][f+1]=0}for(var e=0;e<d;e++)a[e]=c[d-1][e],c[d-1][e]=0;c[d-1][d-1]=1,b[0]=0}function c(a,b,c){var d=c.length;for(var e=1;e<d;e++)b[e-1]=b[e];b[d-1]=0;var f=0,g=0,h=1e-12;for(var i=0;i<d;i++){g=Math.max(g,Math.abs(a[i])+Math.abs(b[i]));var j=i;while(j<d){if(Math.abs(b[j])<=h*g)break;j++}if(j>i){var k=0;do{k++;var l=a[i],m=(a[i+1]-l)/(2*b[i]),n=science.hypot(m,1);m<0&&(n=-n),a[i]=b[i]/(m+n),a[i+1]=b[i]*(m+n);var o=a[i+1],p=l-a[i];for(var e=i+2;e<d;e++)a[e]-=p;f+=p,m=a[j];var q=1,r=q,s=q,t=b[i+1],u=0,v=0;for(var e=j-1;e>=i;e--){s=r,r=q,v=u,l=q*b[e],p=q*m,n=science.hypot(m,b[e]),b[e+1]=u*n,u=b[e]/n,q=m/n,m=q*a[e]-u*l,a[e+1]=p+u*(q*l+u*a[e]);for(var w=0;w<d;w++)p=c[w][e+1],c[w][e+1]=u*c[w][e]+q*p,c[w][e]=q*c[w][e]-u*p}m=-u*v*s*t*b[i]/o,b[i]=u*m,a[i]=q*m}while(Math.abs(b[i])>h*g)}a[i]=a[i]+f,b[i]=0}for(var e=0;e<d-1;e++){var w=e,m=a[e];for(var x=e+1;x<d;x++)a[x]<m&&(w=x,m=a[x]);if(w!=e){a[w]=a[e],a[e]=m;for(var x=0;x<d;x++)m=c[x][e],c[x][e]=c[x][w],c[x][w]=m}}}function d(a,b){var c=a.length,d=[],e=0,f=c-1;for(var g=e+1;g<f;g++){var h=0;for(var i=g;i<=f;i++)h+=Math.abs(a[i][g-1]);if(h!==0){var j=0;for(var i=f;i>=g;i--)d[i]=a[i][g-1]/h,j+=d[i]*d[i];var k=Math.sqrt(j);d[g]>0&&(k=-k),j-=d[g]*k,d[g]=d[g]-k;for(var l=g;l<c;l++){var m=0;for(var i=f;i>=g;i--)m+=d[i]*a[i][l];m/=j;for(var i=g;i<=f;i++)a[i][l]-=m*d[i]}for(var i=0;i<=f;i++){var m=0;for(var l=f;l>=g;l--)m+=d[l]*a[i][l];m/=j;for(var l=g;l<=f;l++)a[i][l]-=m*d[l]}d[g]=h*d[g],a[g][g-1]=h*k}}for(var i=0;i<c;i++)for(var l=0;l<c;l++)b[i][l]=i===l?1:0;for(var g=f-1;g>=e+1;g--)if(a[g][g-1]!==0){for(var i=g+1;i<=f;i++)d[i]=a[i][g-1];for(var l=g;l<=f;l++){var k=0;for(var i=g;i<=f;i++)k+=d[i]*b[i][l];k=k/d[g]/a[g][g-1];for(var i=g;i<=f;i++)b[i][l]+=k*d[i]}}}function e(a,b,c,d){var e=c.length,g=e-1,h=0,i=e-1,j=1e-12,k=0,l=0,m=0,n=0,o=0,p=0,q,r,s,t,u=0;for(var v=0;v<e;v++){if(v<h||v>i)a[v]=c[v][v],b[v]=0;for(var w=Math.max(v-1,0);w<e;w++)u+=Math.abs(c[v][w])}var x=0;while(g>=h){var y=g;while(y>h){o=Math.abs(c[y-1][y-1])+Math.abs(c[y][y]),o===0&&(o=u);if(Math.abs(c[y][y-1])<j*o)break;y--}if(y===g)c[g][g]=c[g][g]+k,a[g]=c[g][g],b[g]=0,g--,x=0;else if(y===g-1){r=c[g][g-1]*c[g-1][g],l=(c[g-1][g-1]-c[g][g])/2,m=l*l+r,p=Math.sqrt(Math.abs(m)),c[g][g]=c[g][g]+k,c[g-1][g-1]=c[g-1][g-1]+k,s=c[g][g];if(m>=0){p=l+(l>=0?p:-p),a[g-1]=s+p,a[g]=a[g-1],p!==0&&(a[g]=s-r/p),b[g-1]=0,b[g]=0,s=c[g][g-1],o=Math.abs(s)+Math.abs(p),l=s/o,m=p/o,n=Math.sqrt(l*l+m*m),l/=n,m/=n;for(var w=g-1;w<e;w++)p=c[g-1][w],c[g-1][w]=m*p+l*c[g][w],c[g][w]=m*c[g][w]-l*p;for(var v=0;v<=g;v++)p=c[v][g-1],c[v][g-1]=m*p+l*c[v][g],c[v][g]=m*c[v][g]-l*p;for(var v=h;v<=i;v++)p=d[v][g-1],d[v][g-1]=m*p+l*d[v][g],d[v][g]=m*d[v][g]-l*p}else a[g-1]=s+l,a[g]=s+l,b[g-1]=p,b[g]=-p;g-=2,x=0}else{s=c[g][g],t=0,r=0,y<g&&(t=c[g-1][g-1],r=c[g][g-1]*c[g-1][g]);if(x==10){k+=s;for(var v=h;v<=g;v++)c[v][v]-=s;o=Math.abs(c[g][g-1])+Math.abs(c[g-1][g-2]),s=t=.75*o,r=-0.4375*o*o}if(x==30){o=(t-s)/2,o=o*o+r;if(o>0){o=Math.sqrt(o),t<s&&(o=-o),o=s-r/((t-s)/2+o);for(var v=h;v<=g;v++)c[v][v]-=o;k+=o,s=t=r=.964}}x++;var z=g-2;while(z>=y){p=c[z][z],n=s-p,o=t-p,l=(n*o-r)/c[z+1][z]+c[z][z+1],m=c[z+1][z+1]-p-n-o,n=c[z+2][z+1],o=Math.abs(l)+Math.abs(m)+Math.abs(n),l/=o,m/=o,n/=o;if(z==y)break;if(Math.abs(c[z][z-1])*(Math.abs(m)+Math.abs(n))<j*Math.abs(l)*(Math.abs(c[z-1][z-1])+Math.abs(p)+Math.abs(c[z+1][z+1])))break;z--}for(var v=z+2;v<=g;v++)c[v][v-2]=0,v>z+2&&(c[v][v-3]=0);for(var A=z;A<=g-1;A++){var B=A!=g-1;A!=z&&(l=c[A][A-1],m=c[A+1][A-1],n=B?c[A+2][A-1]:0,s=Math.abs(l)+Math.abs(m)+Math.abs(n),s!=0&&(l/=s,m/=s,n/=s));if(s==0)break;o=Math.sqrt(l*l+m*m+n*n),l<0&&(o=-o);if(o!=0){A!=z?c[A][A-1]=-o*s:y!=z&&(c[A][A-1]=-c[A][A-1]),l+=o,s=l/o,t=m/o,p=n/o,m/=l,n/=l;for(var w=A;w<e;w++)l=c[A][w]+m*c[A+1][w],B&&(l+=n*c[A+2][w],c[A+2][w]=c[A+2][w]-l*p),c[A][w]=c[A][w]-l*s,c[A+1][w]=c[A+1][w]-l*t;for(var v=0;v<=Math.min(g,A+3);v++)l=s*c[v][A]+t*c[v][A+1],B&&(l+=p*c[v][A+2],c[v][A+2]=c[v][A+2]-l*n),c[v][A]=c[v][A]-l,c[v][A+1]=c[v][A+1]-l*m;for(var v=h;v<=i;v++)l=s*d[v][A]+t*d[v][A+1],B&&(l+=p*d[v][A+2],d[v][A+2]=d[v][A+2]-l*n),d[v][A]=d[v][A]-l,d[v][A+1]=d[v][A+1]-l*m}}}}if(u==0)return;for(g=e-1;g>=0;g--){l=a[g],m=b[g];if(m==0){var y=g;c[g][g]=1;for(var v=g-1;v>=0;v--){r=c[v][v]-l,n=0;for(var w=y;w<=g;w++)n+=c[v][w]*c[w][g];if(b[v]<0)p=r,o=n;else{y=v,b[v]===0?c[v][g]=-n/(r!==0?r:j*u):(s=c[v][v+1],t=c[v+1][v],m=(a[v]-l)*(a[v]-l)+b[v]*b[v],q=(s*o-p*n)/m,c[v][g]=q,Math.abs(s)>Math.abs(p)?c[v+1][g]=(-n-r*q)/s:c[v+1][g]=(-o-t*q)/p),q=Math.abs(c[v][g]);if(j*q*q>1)for(var w=v;w<=g;w++)c[w][g]=c[w][g]/q}}}else if(m<0){var y=g-1;if(Math.abs(c[g][g-1])>Math.abs(c[g-1][g]))c[g-1][g-1]=m/c[g][g-1],c[g-1][g]=-(c[g][g]-l)/c[g][g-1];else{var C=f(0,-c[g-1][g],c[g-1][g-1]-l,m);c[g-1][g-1]=C[0],c[g-1][g]=C[1]}c[g][g-1]=0,c[g][g]=1;for(var v=g-2;v>=0;v--){var D=0,E=0,F,G;for(var w=y;w<=g;w++)D+=c[v][w]*c[w][g-1],E+=c[v][w]*c[w][g];r=c[v][v]-l;if(b[v]<0)p=r,n=D,o=E;else{y=v;if(b[v]==0){var C=f(-D,-E,r,m);c[v][g-1]=C[0],c[v][g]=C[1]}else{s=c[v][v+1],t=c[v+1][v],F=(a[v]-l)*(a[v]-l)+b[v]*b[v]-m*m,G=(a[v]-l)*2*m,F==0&G==0&&(F=j*u*(Math.abs(r)+Math.abs(m)+Math.abs(s)+Math.abs(t)+Math.abs(p)));var C=f(s*n-p*D+m*E,s*o-p*E-m*D,F,G);c[v][g-1]=C[0],c[v][g]=C[1];if(Math.abs(s)>Math.abs(p)+Math.abs(m))c[v+1][g-1]=(-D-r*c[v][g-1]+m*c[v][g])/s,c[v+1][g]=(-E-r*c[v][g]-m*c[v][g-1])/s;else{var C=f(-n-t*c[v][g-1],-o-t*c[v][g],p,m);c[v+1][g-1]=C[0],c[v+1][g]=C[1]}}q=Math.max(Math.abs(c[v][g-1]),Math.abs(c[v][g]));if(j*q*q>1)for(var w=v;w<=g;w++)c[w][g-1]=c[w][g-1]/q,c[w][g]=c[w][g]/q}}}}for(var v=0;v<e;v++)if(v<h||v>i)for(var w=v;w<e;w++)d[v][w]=c[v][w];for(var w=e-1;w>=h;w--)for(var v=h;v<=i;v++){p=0;for(var A=h;A<=Math.min(w,i);A++)p+=d[v][A]*c[A][w];d[v][w]=p}}function f(a,b,c,d){if(Math.abs(c)>Math.abs(d)){var e=d/c,f=c+e*d;return[(a+e*b)/f,(b-e*a)/f]}var e=c/d,f=d+e*c;return[(e*a+b)/f,(e*b-a)/f]}science.lin={},science.lin.decompose=function(){function a(a){var f=a.length,g=[],h=[],i=[];for(var j=0;j<f;j++)g[j]=[],h[j]=[],i[j]=[];var k=!0;for(var l=0;l<f;l++)for(var j=0;j<f;j++)if(a[j][l]!==a[l][j]){k=!1;break}if(k){for(var j=0;j<f;j++)g[j]=a[j].slice();b(h,i,g),c(h,i,g)}else{var m=[];for(var j=0;j<f;j++)m[j]=a[j].slice();d(m,g),e(h,i,m,g)}var n=[];for(var j=0;j<f;j++){var o=n[j]=[];for(var l=0;l<f;l++)o[l]=j===l?h[j]:0;n[j][i[j]>0?j+1:j-1]=i[j]}return{D:n,V:g}}return a},science.lin.cross=function(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]},science.lin.dot=function(a,b){var c=0,d=-1,e=Math.min(a.length,b.length);while(++d<e)c+=a[d]*b[d];return c},science.lin.length=function(a){return Math.sqrt(science.lin.dot(a,a))},science.lin.normalize=function(a){var b=science.lin.length(a);return a.map(function(a){return a/b})},science.lin.determinant=function(a){var b=a[0].concat(a[1]).concat(a[2]).concat(a[3]);return b[12]*b[9]*b[6]*b[3]-b[8]*b[13]*b[6]*b[3]-b[12]*b[5]*b[10]*b[3]+b[4]*b[13]*b[10]*b[3]+b[8]*b[5]*b[14]*b[3]-b[4]*b[9]*b[14]*b[3]-b[12]*b[9]*b[2]*b[7]+b[8]*b[13]*b[2]*b[7]+b[12]*b[1]*b[10]*b[7]-b[0]*b[13]*b[10]*b[7]-b[8]*b[1]*b[14]*b[7]+b[0]*b[9]*b[14]*b[7]+b[12]*b[5]*b[2]*b[11]-b[4]*b[13]*b[2]*b[11]-b[12]*b[1]*b[6]*b[11]+b[0]*b[13]*b[6]*b[11]+b[4]*b[1]*b[14]*b[11]-b[0]*b[5]*b[14]*b[11]-b[8]*b[5]*b[2]*b[15]+b[4]*b[9]*b[2]*b[15]+b[8]*b[1]*b[6]*b[15]-b[0]*b[9]*b[6]*b[15]-b[4]*b[1]*b[10]*b[15]+b[0]*b[5]*b[10]*b[15]},science.lin.gaussjordan=function(a,b){b||(b=1e-10);var c=a.length,d=a[0].length,e=-1,f,g;while(++e<c){var h=e;f=e;while(++f<c)Math.abs(a[f][e])>Math.abs(a[h][e])&&(h=f);var i=a[e];a[e]=a[h],a[h]=i;if(Math.abs(a[e][e])<=b)return!1;f=e;while(++f<c){var j=a[f][e]/a[e][e];g=e-1;while(++g<d)a[f][g]-=a[e][g]*j}}e=c;while(--e>=0){var j=a[e][e];f=-1;while(++f<e){g=d;while(--g>=e)a[f][g]-=a[e][g]*a[f][e]/j}a[e][e]/=j,g=c-1;while(++g<d)a[e][g]/=j}return!0},science.lin.inverse=function(a){var b=a.length,c=-1;if(b!==a[0].length)return;a=a.map(function(a,c){var d=new Array(b),e=-1;while(++e<b)d[e]=c===e?1:0;return a.concat(d)}),science.lin.gaussjordan(a);while(++c<b)a[c]=a[c].slice(b);return a},science.lin.multiply=function(a,b){var c=a.length,d=b[0].length,e=b.length,f=-1,g,h;if(e!==a[0].length)throw{error:"columns(a) != rows(b); "+a[0].length+" != "+e};var i=new Array(c);while(++f<c){i[f]=new Array(d),g=-1;while(++g<d){var j=0;h=-1;while(++h<e)j+=a[f][h]*b[h][g];i[f][g]=j}}return i},science.lin.transpose=function(a){var b=a.length,c=a[0].length,d=-1,e,f=new Array(c);while(++d<c){f[d]=new Array(b),e=-1;while(++e<b)f[d][e]=a[e][d]}return f},science.lin.tridag=function(a,b,c,d,e,f){var g,h;for(g=1;g<f;g++)h=a[g]/b[g-1],b[g]-=h*c[g-1],d[g]-=h*d[g-1];e[f-1]=d[f-1]/b[f-1];for(g=f-2;g>=0;g--)e[g]=(d[g]-c[g]*e[g+1])/b[g]}}(this),function(a){function b(a,b){if(!a||!b||a.length!==b.length)return!1;var c=a.length,d=-1;while(++d<c)if(a[d]!==b[d])return!1;return!0}function c(a,c){var d=c.length;if(a>d)return null;var e=[],f=[],g={},h=0,i=0,j,k,l;while(i<a){if(h===d)return null;var m=Math.floor(Math.random()*d);if(m in g)continue;g[m]=1,h++,k=c[m],l=!0;for(j=0;j<i;j++)if(b(k,e[j])){l=!1;break}l&&(e[i]=k,f[i]=m,i++)}return e}function d(a,b,c,d){var e=[],f=a+c,g=b.length,h=-1;while(++h<g)e[h]=(a*b[h]+c*d[h])/f;return e}function e(a){var b=a.length,c=-1;while(++c<b)if(!isFinite(a[c]))return!1;return!0}function f(a){var b=a.length,c=0;while(++c<b)if(a[c-1]>=a[c])return!1;return!0}function g(a){return(a=1-a*a*a)*a*a}function h(a,b,c,d){var e=d[0],f=d[1],g=i(b,f);if(g<a.length&&a[g]-a[c]<a[c]-a[e]){var h=i(b,e);d[0]=h,d[1]=g}}function i(a,b){var c=b+1;while(c<a.length&&a[c]===0)c++;return c}science.stats={},science.stats.bandwidth={nrd0:function(a){var b=Math.sqrt(science.stats.variance(a));return(lo=Math.min(b,science.stats.iqr(a)/1.34))||(lo=b)||(lo=Math.abs(a[1]))||(lo=1),.9*lo*Math.pow(a.length,-0.2)},nrd:function(a){var b=science.stats.iqr(a)/1.34;return 1.06*Math.min(Math.sqrt(science.stats.variance(a)),b)*Math.pow(a.length,-0.2)}},science.stats.distance={euclidean:function(a,b){var c=a.length,d=-1,e=0,f;while(++d<c)f=a[d]-b[d],e+=f*f;return Math.sqrt(e)},manhattan:function(a,b){var c=a.length,d=-1,e=0;while(++d<c)e+=Math.abs(a[d]-b[d]);return e},minkowski:function(a){return function(b,c){var d=b.length,e=-1,f=0;while(++e<d)f+=Math.pow(Math.abs(b[e]-c[e]),a);return Math.pow(f,1/a)}},chebyshev:function(a,b){var c=a.length,d=-1,e=0,f;while(++d<c)f=Math.abs(a[d]-b[d]),f>e&&(e=f);return e},hamming:function(a,b){var c=a.length,d=-1,e=0;while(++d<c)a[d]!==b[d]&&e++;return e},jaccard:function(a,b){var c=a.length,d=-1,e=0;while(++d<c)a[d]===b[d]&&e++;return e/c},braycurtis:function(a,b){var c=a.length,d=-1,e=0,f=0,g,h;while(++d<c)g=a[d],h=b[d],e+=Math.abs(g-h),f+=Math.abs(g+h);return e/f}},science.stats.erf=function(a){var b=.254829592,c=-0.284496736,d=1.421413741,e=-1.453152027,f=1.061405429,g=.3275911,h=a<0?-1:1;a<0&&(h=-1,a=-a);var i=1/(1+g*a);return h*(1-((((f*i+e)*i+d)*i+c)*i+b)*i*Math.exp(-a*a))},science.stats.phi=function(a){return.5*(1+science.stats.erf(a/Math.SQRT2))},science.stats.kernel={uniform:function(a){return a<=1&&a>=-1?.5:0},triangular:function(a){return a<=1&&a>=-1?1-Math.abs(a):0},epanechnikov:function(a){return a<=1&&a>=-1?.75*(1-a*a):0},quartic:function(a){if(a<=1&&a>=-1){var b=1-a*a;return.9375*b*b}return 0},triweight:function(a){if(a<=1&&a>=-1){var b=1-a*a;return 35/32*b*b*b}return 0},gaussian:function(a){return 1/Math.sqrt(2*Math.PI)*Math.exp(-0.5*a*a)},cosine:function(a){return a<=1&&a>=-1?Math.PI/4*Math.cos(Math.PI/2*a):0}},science.stats.kde=function(){function d(d,e){var f=c.call(this,b);return d.map(function(c){var d=-1,e=0,g=b.length;while(++d<g)e+=a((c-b[d])/f);return[c,e/f/g]})}var a=science.stats.kernel.gaussian,b=[],c=science.stats.bandwidth.nrd;return d.kernel=function(b){return arguments.length?(a=b,d):a},d.sample=function(a){return arguments.length?(b=a,d):b},d.bandwidth=function(a){return arguments.length?(c=science.functor(a),d):c},d},science.stats.kmeans=function(){function f(f){var g=f.length,h=[],i=[],j=1,l=0,m=c(e,f),n,o,p,q,r,s,t;while(j&&l<d){p=-1;while(++p<e)i[p]=0;o=-1;while(++o<g){q=f[o],s=Infinity,p=-1;while(++p<e)r=a.call(this,m[p],q),r<s&&(s=r,t=p);i[h[o]=t]++}n=[],o=-1;while(++o<g){q=h[o],r=n[q];if(r==null)n[q]=f[o].slice();else{p=-1;while(++p<r.length)r[p]+=f[o][p]}}p=-1;while(++p<e){q=n[p],r=1/i[p],o=-1;while(++o<q.length)q[o]*=r}j=0,p=-1;while(++p<e)if(!b(n[p],m[p])){j=1;break}m=n,l++}return{assignments:h,centroids:m}}var a=science.stats.distance.euclidean,d=1e3,e=1;return f.k=function(a){return arguments.length?(e=a,f):e},f.distance=function(b){return arguments.length?(a=b,f):a},f},science.stats.hcluster=function(){function c(c){var e=c.length,f=[],g=[],h=[],i=[],j,k,l,m,n,o,p,q;p=-1;while(++p<e){f[p]=0,h[p]=[],q=-1;while(++q<e)h[p][q]=p===q?Infinity:a(c[p],c[q]),h[p][f[p]]>h[p][q]&&(f[p]=q)}p=-1;while(++p<e)i[p]=[],i[p][0]={left:null,right:null,dist:0,centroid:c[p],size:1,depth:0},g[p]=1;for(n=0;n<e-1;n++){j=0;for(p=0;p<e;p++)h[p][f[p]]<h[j][f[j]]&&(j=p);k=f[j],l=i[j][0],m=i[k][0];var r={left:l,right:m,dist:h[j][k],centroid:d(l.size,l.centroid,m.size,m.centroid),size:l.size+m.size,depth:1+Math.max(l.depth,m.depth)};i[j].splice(0,0,r),g[j]+=g[k];for(q=0;q<e;q++)switch(b){case"single":h[j][q]>h[k][q]&&(h[q][j]=h[j][q]=h[k][q]);break;case"complete":h[j][q]<h[k][q]&&(h[q][j]=h[j][q]=h[k][q]);break;case"average":h[q][j]=h[j][q]=(g[j]*h[j][q]+g[k]*h[k][q])/(g[j]+g[q])}h[j][j]=Infinity;for(p=0;p<e;p++)h[p][k]=h[k][p]=Infinity;for(q=0;q<e;q++)f[q]==k&&(f[q]=j),h[j][q]<h[j][f[j]]&&(f[j]=q);o=r}return o}var a=science.stats.distance.euclidean,b="simple";return c.distance=function(b){return arguments.length?(a=b,c):a},c},science.stats.iqr=function(a){var b=science.stats.quantiles(a,[.25,.75]);return b[1]-b[0]},science.stats.loess=function(){function d(d,i,j){var k=d.length,l;if(k!==i.length)throw{error:"Mismatched array lengths"};if(k==0)throw{error:"At least one point required."};if(arguments.length<3){j=[],l=-1;while(++l<k)j[l]=1}e(d),e(i),e(j),f(d);if(k==1)return[i[0]];if(k==2)return[i[0],i[1]];var m=Math.floor(a*k);if(m<2)throw{error:"Bandwidth too small."};var n=[],o=[],p=[];l=-1;while(++l<k)n[l]=0,o[l]=0,p[l]=1;var q=-1;while(++q<=b){var r=[0,m-1],s;l=-1;while(++l<k){s=d[l],l>0&&h(d,j,l,r);var t=r[0],u=r[1],v=d[l]-d[t]>d[u]-d[l]?t:u,w=0,x=0,y=0,z=0,A=0,B=Math.abs(1/(d[v]-s));for(var C=t;C<=u;++C){var D=d[C],E=i[C],F=C<l?s-D:D-s,G=g(F*B)*p[C]*j[C],H=D*G;w+=G,x+=H,y+=D*H,z+=E*G,A+=E*H}var I=x/w,J=z/w,K=A/w,L=y/w,M=Math.sqrt(Math.abs(L-I*I))<c?0:(K-I*J)/(L-I*I),N=J-M*I;n[l]=M*s+N,o[l]=Math.abs(i[l]-n[l])}if(q===b)break;var O=o.slice();O.sort();var P=O[Math.floor(k/2)];if(Math.abs(P)<c)break;var Q,G;l=-1;while(++l<k)Q=o[l]/(6*P),p[l]=Q>=1?0:(G=1-Q*Q)*G}return n}var a=.3,b=2,c=1e-12;return d.bandwidth=function(b){return arguments.length?(a=b,d):b},d.robustnessIterations=function(a){return arguments.length?(b=a,d):a},d.accuracy=function(a){return arguments.length?(c=a,d):a},d},science.stats.mean=function(a){var b=a.length;if(b===0)return NaN;var c=0,d=-1;while(++d<b)c+=(a[d]-c)/(d+1);return c},science.stats.median=function(a){return science.stats.quantiles(a,[.5])[0]},science.stats.mode=function(a){a=a.slice().sort(science.ascending);var b,c=a.length,d=-1,e=d,f=null,g=0,h,i;while(++d<c)(i=a[d])!==f&&((h=d-e)>g&&(g=h,b=f),f=i,e=d);return b},science.stats.quantiles=function(a,b){a=a.slice().sort(science.ascending);var c=a.length-1;return b.map(function(b){if(b===0)return a[0];if(b===1)return a[c];var d=1+b*c,e=Math.floor(d),f=d-e,g=a[e-1];return f===0?g:g+f*(a[e]-g)})},science.stats.variance=function(a){var b=a.length;if(b<1)return NaN;if(b===1)return 0;var c=science.stats.mean(a),d=-1,e=0;while(++d<b){var f=a[d]-c;e+=f*f}return e/(b-1)},science.stats.distribution={},science.stats.distribution.gaussian=function(){function e(){var d,e,f,g;do d=2*a()-1,e=2*a()-1,f=d*d+e*e;while(f>=1||f===0);return b+c*d*Math.sqrt(-2*Math.log(f)/f)}var a=Math.random,b=0,c=1,d=1;return e.pdf=function(a){return a=(a-mu)/c,science_stats_distribution_gaussianConstant*Math.exp(-0.5*a*a)/c},e.cdf=function(a){return a=(a-mu)/c,.5*(1+science.stats.erf(a/Math.SQRT2))},e.mean=function(a){return arguments.length?(b=+a,e):b},e.variance=function(a){return arguments.length?(c=Math.sqrt(d=+a),e):d},e.random=function(b){return arguments.length?(a=b,e):a},e},science_stats_distribution_gaussianConstant=1/Math.sqrt(2*Math.PI)}(this)})(this);/*global DBCollection: false, DBQuery: false */
/*jslint indent: 4, plusplus: true */
/**
 * MongoDB - distinct2.js
 * 
 *      Version: 1.0
 *         Date: August 15, 2012
 *      Project: http://skratchdot.com/projects/mongodb-distinct2/
 *  Source Code: https://github.com/skratchdot/mongodb-distinct2/
 *       Issues: https://github.com/skratchdot/mongodb-distinct2/issues/
 * Dependencies: MongoDB v1.8+
 * 
 * Description:
 * 
 * Similar to the db.myCollection.distinct() function, distinct2() allows
 * you to pass in an array of keys to get values for.  It also allows you
 * to pass in an optional "count" argument.  When true, you can easily get
 * the counts for your distinct values.
 * 
 * You can also call distinct2() on the results of a query (something you
 * can't currently do with the built in distinct() function).
 * 
 * To accomplish this, it adds the following functions to our built in mongo prototypes:  
 * 
 *     DBCollection.prototype.distinct2 = function (keys, count) {};
 *     DBQuery.prototype.distinct2 = function (keys, count) {};
 *
 * Usage:
 * 
 * // All 4 of these statements are the same as:
 * //
 * //     db.users.distinct('name.first')
 * //
 * db.users.distinct2('name.first');
 * db.users.distinct2('name.first', false);
 * db.users.distinct2(['name.first']);
 * db.users.distinct2(['name.first'], false);
 * 
 * // you can pass in an array of values
 * db.users.distinct2(['name.first','name.last']);
 * 
 * // you can get counts
 * db.users.distinct2('name.first', true);
 * 
 * // you can get distinct values from the results of a query
 * db.users.find({'name.first':'Bob'}).distinct('name.last');
 * 
 * 
 * 
 * 
 */
(function () {
	'use strict';

	var isArray, getFromKeyString;

	/**
	 * Same behavior as Array.isArray()
	 * @function
	 * @name isArray
	 * @private
	 * @param obj {*} The object to test
	 * @returns {boolean} Will return true of obj is an array, otherwise will return false
	 */
	isArray = function (obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	};

	/**
	 * @function
	 * @name getFromKeyString
	 * @private
	 * @param obj {object} The object to search
	 * @param keyString {string} A dot delimited string path
	 * @returns {object|undefined} If we find the path provide by keyString, we will return the value at that path
	 */
	getFromKeyString = function (obj, keyString) {
		var arr, i;
		if (typeof keyString === 'string') {
			arr = keyString.split('.');
			for (i = 0; i < arr.length; i++) {
				if (obj && typeof obj === 'object' && obj.hasOwnProperty(arr[i])) {
					obj = obj[arr[i]];
				} else {
					return;
				}
			}
			return obj;
		}
	};

	/**
	 * @function
	 * @name distinct2
	 * @memberOf DBQuery
	 * @param keys {string|array} The array of dot delimited keys to get the distinct values for
	 * @param count {boolean} Whether or not to append
	 * @returns {array} If keys is a string, and count is false, then we behave like .distinct().
	 *                  If keys is a positive sized array, we will return an array of arrays.
	 *                  If count is true, we will return an array of arrays where the last value is the count.
	 */
	DBQuery.prototype.distinct2 = function (keys, count) {
		var i = 0,
			j = 0,
			addDataKey,
			returnArray = [],
			tempArray = [],
			arrayOfValues = false,
			data = {
				keys : [],
				countKeys : [],
				counts : {}
			};

		// our data object contains keys that are numbers, so data[0] is an array containing values
		addDataKey = function (key, value) {
			var index = data[key].indexOf(value);
			if (index < 0) {
				data[key].push(value);
				index = data[key].length - 1;
			}
			return index;
		};

		// if passed a string, convert it into an array
		if (typeof keys === 'string') {
			keys = [keys];
		}

		// if keys is not a positive sized array by now, do nothing
		if (!isArray(keys) || keys.length === 0) {
			return returnArray;
		}

		// init our data object. it contains: keys, counts, and a list of indexes
		for (i = 0; i < keys.length; i++) {
			data[i] = [];
			data.keys.push(keys[i]);
		}

		// populate data object
		this.forEach(function (obj) {
			var i, found = false, countKey, values = [], indices = [];
			for (i = 0; i < data.keys.length; i++) {
				values[i] = getFromKeyString(obj, data.keys[i]);
				indices[i] = addDataKey(i, values[i]);
				if (!found && 'undefined' !== typeof values[i]) {
					found = true;
				}
			}
			// add item to our data object
			if (found) {
				countKey = indices.join(',');
				if (!data.counts.hasOwnProperty(countKey)) {
					data.counts[countKey] = 0;
					data.countKeys.push(countKey);
				}
				if (count) {
					data.counts[countKey]++;
				}
			}
		});

		// should we return an array of values?
		if (keys.length === 1 && !count) {
			arrayOfValues = true;
		}

		// convert data object into returnArray
		for (i = 0; i < data.countKeys.length; i++) {
			if (arrayOfValues) { // we return an array of values
				returnArray.push(data[0][data.countKeys[i]]);
			} else { // we return an array of arrays
				tempArray = data.countKeys[i].split(',');
				for (j = 0; j < tempArray.length; j++) {
					tempArray[j] = data[j][tempArray[j]];
				}
				if (count) {
					tempArray.push(data.counts[data.countKeys[i]]);
				}
				returnArray.push(tempArray);
			}
		}

		return returnArray;
	};

	/**
	 * @function
	 * @name distinct2
	 * @memberOf DBCollection
	 * @param keys {string|array} The array of dot delimited keys to get the distinct values for
	 * @param count {boolean} Whether or not to append
	 * @returns {array} If keys is a string, and count is false, then we behave like .distinct().
	 *                  If keys is a positive sized array, we will return an array of arrays.
	 *                  If count is true, we will return an array of arrays where the last value is the count.
	 */
	DBCollection.prototype.distinct2 = function (keys, count) {
		return this.find({}).distinct2(keys, count);
	};

}());/*global DBCollection: false, DBQuery: false */
/*jslint devel: false, nomen: true, maxerr: 50, indent: 4 */
/**
 * MongoDB - distinct-types.js
 * 
 *      Version: 1.0
 *         Date: April 29, 2012
 *      Project: http://skratchdot.github.com/mongodb-distinct-types/
 *  Source Code: https://github.com/skratchdot/mongodb-distinct-types/
 *       Issues: https://github.com/skratchdot/mongodb-distinct-types/issues/
 * Dependencies: MongoDB v1.8+
 * 
 * Description:
 * 
 * Similar to the db.myCollection.distinct() function, distinctTypes() will return
 * "types" rather than "values".  To accomplish this, it adds the following
 * function to the DBCollection prototype:
 * 
 *     DBCollection.prototype.distinctTypes = function (keyString, query, limit, skip) {};
 * 
 * Usage:
 * 
 * db.users.distinctTypes('name'); // we hope this would return ['bson'] not ['bson','string']
 * db.users.distinctTypes('name.first'); // should return ['string']
 * db.users.distinctTypes('address.phone'); // should return ['string']
 * db.users.distinctTypes('address.phone', {'name.first':'Bob'}); // only search documents that have { 'name.first' : 'Bob' }
 * db.users.distinctTypes('address.phone', {}, 10); // only search the first 10 documents
 * db.users.distinctTypes('address.phone', {}, 10, 5); // only search documents 10-15
 * 
 * Caveats:
 * 
 * By design, distinctTypes() returns 'bson' rather than 'object'.
 * It will return 'numberlong' rather than 'number', etc.
 * 
 * Copyright (c) 2012 SKRATCHDOT.COM
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function () {
	'use strict';

	var getType = function (obj) {
			return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
		},
		getFromKeyString = function (obj, keyString) {
			var returnValue = {
					value : null,
					found : false
				},
				dotIndex = keyString.indexOf('.'),
				currentKey = '',
				newKeyString = '';
			if (dotIndex < 0) {
				if (obj.hasOwnProperty(keyString)) {
					returnValue = {
						value : obj[keyString],
						found : true
					};
				}
			} else {
				currentKey = keyString.substr(0, dotIndex);
				newKeyString = keyString.substr(dotIndex + 1);
				if (obj.hasOwnProperty(currentKey)) {
					returnValue = getFromKeyString(obj[currentKey], newKeyString);
				}
			}
			return returnValue;
		};

	/**
	 * @function
	 * @name distinctTypes
	 * @memberOf DBCollection
	 * @param {string} keyString The key (using dot notation) to return distinct types for
	 * @param {object} query A mongo query in the same format that db.myCollection.find() accepts.
	 * @param {number} limit Limit the result set by this number.
	 * @param {number} skip The number of records to skip.
	 */
	DBCollection.prototype.distinctTypes = function (keyString, query, limit, skip) {
		var fields = {},
			queryResult = null,
			result = [];
		if (typeof keyString !== 'string') {
			keyString = '';
		}
		fields[keyString] = 1;
		queryResult = new DBQuery(this._mongo, this._db, this, this._fullName,
				this._massageObject(query), fields, limit, skip).forEach(function (doc) {
			var type = '', currentValue = getFromKeyString(doc, keyString);
			if (currentValue.found) {
				type = getType(currentValue.value);
				if (result.indexOf(type) === -1) {
					result.push(type);
				}
			}
		});
		return result;
	};
}());/*global DBCollection: false, emit: false */
/*jslint devel: false, unparam: true, nomen: true, maxerr: 50, indent: 4 */
/**
 * MongoDB - flatten.js
 * 
 *      Version: 1.0
 *         Date: April 29, 2012
 *      Project: http://skratchdot.github.com/mongodb-flatten/
 *  Source Code: https://github.com/skratchdot/mongodb-flatten/
 *       Issues: https://github.com/skratchdot/mongodb-flatten/issues/
 * Dependencies: MongoDB v1.8+
 * 
 * Description:
 * 
 * The flatten() function is a mapReduce that flattens documents into
 * key/value pairs.  Since this is a mapReduce, you can access the 
 * keys via 'value.data.k' and the values via 'value.data.v'.
 * 
 * Usage:
 * 
 * // Flatten all user documents, and return the result inline.
 * result = db.users.flatten();
 * 
 * // Flatten all user documents, and store the result in the users_flattened collection
 * result = db.users.flatten('users_flattened');
 * 
 * // Flatten user documents that have the first name of Bob. Store in a collection
 * db.users.flatten({
 *     'out' : 'users_flattened',
 *     'query' : { 'name.first' : 'Bob' }
 * });
 * 
 * // Get the number of keys in one document
 * db.users.flatten({
 *     query : { '_id' : ObjectId('4f9c2374992274fc8d468675') }
 * }).results[0].value.data.length;
 * 
 * Copyright (c) 2012 SKRATCHDOT.COM
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function () {
	'use strict';

	/**
	 * @function
	 * @name flatten
	 * @memberOf DBCollection
	 * @param {object} optionsOrOutString This function accepts the same options as mapReduce
	 */
	DBCollection.prototype.flatten = function (optionsOrOutString) {
		var map, reduce, options = {};

		// Declare our map function
		// This will emit keyStrings for all the simple values (aka non-object and non-array)
		map = function () {
			var emitKeys = function (id, node, keyString) {
				var key, newKey, type = typeof (node);
				if (type === 'object' || type === 'array') {
					for (key in node) {
						if (node.hasOwnProperty(key)) {
							newKey = (keyString === '' ? key : keyString + '.' + key);
							if (newKey === '_id') {
								emit(id, {k : '_id', v : node[key]});
							} else {
								emitKeys(id, node[key], newKey);
							}
						}
					}
				} else {
					emit(id, {k : keyString, v : node});
				}
			};
			emitKeys(this._id, this, '');
		};

		// Declare our reduce function
		reduce = function (key, values) {
			return { data : values };
		};

		// Start to setup our options struct
		if (typeof optionsOrOutString === 'object') {
			options = optionsOrOutString;
		} else if (typeof optionsOrOutString === 'string') {
			options.out = optionsOrOutString;
		}

		// The default value for out is 'inline'
		if (!options.hasOwnProperty('out')) {
			options.out = { inline : 1 };
		}

		// Make sure to override certain options
		options.map = map;
		options.reduce = reduce;
		options.mapreduce = this._shortName;

		// Execute and return
		return this.mapReduce(map, reduce, options);
	};

}());/*global DBCollection: false, emit: false, print: false */
/*jslint devel: false, nomen: true, unparam: true, plusplus: true, maxerr: 50, indent: 4 */
/**
 * MongoDB - schema.js
 * 
 *      Version: 1.1
 *         Date: May 28, 2012
 *      Project: http://skratchdot.github.com/mongodb-schema/
 *  Source Code: https://github.com/skratchdot/mongodb-schema/
 *       Issues: https://github.com/skratchdot/mongodb-schema/issues/
 * Dependencies: MongoDB v1.8+
 * 
 * Description:
 * 
 * This is a schema analysis tool for MongoDB. It accomplishes this by
 * extended the mongo shell, and providing a new function called schema()
 * with the following signature:
 * 
 *     DBCollection.prototype.schema = function (optionsOrOutString)
 * 
 * Usage:
 * 
 *  The schema() function accepts all the same parameters that the mapReduce() function
 *  does. It adds/modifies the following 4 parameters that can be used as well:
 * 
 *      wildcards - array (default: [])
 *          By using the $, you can combine report results.
 *          For instance: '$' will group all top level keys and
 *          'foo.$.bar' will combine 'foo.baz.bar' and 'foo.bar.bar'
 * 
 *      arraysAreWildcards - boolean (default: true)
 *          When true, 'foo.0.bar' and 'foo.1.bar' will be
 *          combined into 'foo.$.bar'
 *          When false, all array keys will be reported
 * 
 *      fields - object (default: {})
 *          Similar to the usage in find(). You can pick the
 *          fields to include or exclude. Currently, you cannot
 *          pass in nested structures, you need to pass in dot notation keys.
 *      
 *      limit - number (default: 50)
 *          Behaves the same as the limit in mapReduce(), but defaults to 50.
 *          You can pass in 0 or -1 to process all documents.
 * 
 * Return schema results inline
 *     db.users.schema();
 * 
 * Create and store schema results in the 'users_schema' collection
 *     db.users.schema('users_schema'); // Option 1
 *     db.users.schema({out:'users_schema'}); // Option 2
 *     db.users.schema({out:{replace:'users_schema'}}); // Option 3
 * 
 * Only report on the key: 'name.first'
 *     db.users.schema({fields:{'name.first':1}});
 * 
 * Report on everything except 'name.first'
 *     db.users.schema({fields:{'name.first':-1}});
 * 
 * Combine the 'name.first' and 'name.last' keys into 'name.$'
 *     db.users.schema({wildcards:['name.$']});
 * 
 * Don't treat arrays as a wildcard
 *     db.users.schema({arraysAreWildcards:false});
 * 
 * Process 50 documents
 *     db.users.schema();
 * 
 * Process all documents
 *     db.users.schema({limit:-1});
 * 
 * Caveats:
 * 
 * By design, schema() returns 'bson' rather than 'object'.
 * It will return 'numberlong' rather than 'number', etc.
 * 
 * Inspired by:
 * 
 * Variety: https://github.com/JamesCropcho/variety
 * 
 * Copyright (c) 2012 SKRATCHDOT.COM
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function () {
	'use strict';

	/**
	 * You can pass in the same options object that mapReduce() accepts. Schema has the following
	 * defaults for options:
	 * 
	 * options.out = { inline : 1 };
	 * options.limit = 50;
	 * 
	 * You can pass in an options.limit value of 0 or -1 to parse _all_ documents.
	 * 
	 * @function
	 * @name flatten
	 * @memberOf DBCollection
	 * @param {object} optionsOrOutString This function accepts the same options as mapReduce
	 */
	DBCollection.prototype.schema = function (optionsOrOutString) {
		var statCount = 0, wildcards = [], arraysAreWildcards = true,
			field, fields = {}, usePositiveFields = false, useNegativeFields = false,
			getType, getNewKeyString, getKeyInfo, map, reduce, finalize, options = { limit : 50 };

		/**
		 * @function
		 * @name getType
		 * @private
		 * @param {object} obj The object to inspect
		 */
		getType = function (obj) {
			return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
		};

		/**
		 * @function
		 * @name getNewKeyString
		 * @private
		 * @param {string} key The current key
		 * @param {string} keyString The object to inspect
		 */
		getNewKeyString = function (key, keyString) {
			var i, j, keyArray, newKeyString, success, wc;
			newKeyString = (keyString === '' ? key : keyString + '.' + key);
			if (wildcards.length > 0) {
				keyArray = newKeyString.split('.');
				for (i = 0; i < wildcards.length; i++) {
					wc = wildcards[i].split('.');
					if (keyArray.length === wc.length) {
						success = true;
						for (j = 0; success && j <= wc.length; j++) {
							if (wc[j] !== '$' && wc[j] !== keyArray[j]) {
								success = false;
							}
						}
						if (success) {
							return wildcards[i];
						}
					}
				}
			}
			return newKeyString;
		};

		/**
		 * @function
		 * @name getKeyInfo
		 * @private
		 * @param {object} node The node from which we generate our keys
		 * @param {string} keyString A string representing the current key 'path'
		 * @param {object} keyInfo The struct that contains all our 'paths' as the key, and a count for it's value
		 */
		getKeyInfo = function (node, keyString, keyInfo) {
			var key, newKeyString, type, useArrayWildcard = false;

			// Store the mongo type. 'bson' instead of 'object', etc
			type = getType(node);

			// We need to handle objects and arrays by calling getKeyInfo() recursively
			if (['array', 'bson', 'object'].indexOf(type) >= 0) {

				// Set the flag to be used in our for loop below
				if (type === 'array' && arraysAreWildcards === true) {
					useArrayWildcard = true;
				}

				// Loop through each key
				for (key in node) {
					if (node.hasOwnProperty(key)) {
						if (useArrayWildcard) {
							newKeyString = keyString + '.$';
						} else {
							newKeyString = getNewKeyString(key, keyString);
						}
						keyInfo = getKeyInfo(node[key], newKeyString, keyInfo);
					}
				}

			}

			// We don't need to emit this key
			// Using a long statement to pass jslint
			// there are 3 parts to this:
			// 1: empty key
			// 2: usePostiveFields is true, and the current key is not valid
			// 3: useNegativeFields is true, and the current key exists in fields (and is -1)
			if (keyString === '' || (usePositiveFields && (!fields.hasOwnProperty(keyString) || fields[keyString] !== 1)) || (useNegativeFields && fields.hasOwnProperty(keyString) && fields[keyString] === -1)) {
				return keyInfo;
			}

			// We need to emit this key
			if (keyInfo.hasOwnProperty(keyString) && keyInfo[keyString].hasOwnProperty(type)) {
				keyInfo[keyString][type].perDoc += 1;
			} else {
				keyInfo[keyString] = {};
				keyInfo[keyString][type] = {
					docs : 1,
					coverage : 0,
					perDoc : 1
				};
			}

			return keyInfo;
		};

		/**
		 * @function
		 * @name map
		 * @private
		 */
		map = function () {
			var key, keyInfo, count, type;

			// Get our keyInfo struct
			keyInfo = getKeyInfo(this, '', {}, [], true);

			// Loop through keys, emitting info
			for (key in keyInfo) {
				if (keyInfo.hasOwnProperty(key)) {
					count = 0;
					for (type in keyInfo[key]) {
						if (keyInfo[key].hasOwnProperty(type)) {
							count += keyInfo[key][type].perDoc;
						}
					}
					keyInfo[key].all = {
						docs : 1,
						perDoc : count
					};
					emit(key, keyInfo[key]);
				}
			}
		};

		/**
		 * @function
		 * @name reduce
		 * @private
		 * @param {string} key The key that was emitted from our map function
		 * @param {array} values An array of values that was emitted from our map function
		 */
		reduce = function (key, values) {
			var result = {};
			values.forEach(function (value) {
				var type;
				for (type in value) {
					if (value.hasOwnProperty(type)) {
						if (!result.hasOwnProperty(type)) {
							result[type] = { docs : 0, coverage : 0, perDoc : 0 };
						}
						result[type].docs += value[type].docs;
						result[type].perDoc += value[type].perDoc;
					}
				}
			});
			return result;
		};

		/**
		 * @function
		 * @name finalize
		 * @private
		 * @param {string} key The key that was emitted/returned from our map/reduce functions
		 * @param {object} value The object that was returned from our reduce function
		 */
		finalize = function (key, value) {
			var type, result = {
				wildcard : (key.search(/^\$|\.\$/gi) >= 0),
				types : [],
				results : [{
					type : 'all',
					docs : value.all.docs,
					coverage : (value.all.docs / statCount) * 100,
					perDoc : value.all.perDoc / value.all.docs
				}]
			};
			for (type in value) {
				if (value.hasOwnProperty(type) && type !== 'all') {
					result.types.push(type);
					result.results.push({
						type : type,
						docs : value[type].docs,
						coverage : (value[type].docs / statCount) * 100,
						perDoc : value[type].perDoc / value[type].docs
					});
				}
			}
			return result;
		};

		// Start to setup our options struct
		if (typeof optionsOrOutString === 'object') {
			options = optionsOrOutString;
		} else if (typeof optionsOrOutString === 'string') {
			options.out = optionsOrOutString;
		}

		// The default value for out is 'inline'
		if (!options.hasOwnProperty('out')) {
			options.out = { inline : 1 };
		}

		// Was a valid wildcards option passed in?
		if (options.hasOwnProperty('wildcards') && getType(options.wildcards) === 'array') {
			wildcards = options.wildcards;
		}

		// Was a valid arraysAreWildcards option passed in?
		if (options.hasOwnProperty('arraysAreWildcards') && typeof options.arraysAreWildcards === 'boolean') {
			arraysAreWildcards = options.arraysAreWildcards;
		}

		// Was a valid fields option passed in?
		if (options.hasOwnProperty('fields') && getType(options.fields) === 'object' && Object.keySet(options.fields).length > 0) {
			fields = options.fields;
			for (field in fields) {
				if (fields.hasOwnProperty(field)) {
					if (fields[field] === 1 || fields[field] === true) {
						fields[field] = 1;
						usePositiveFields = true;
					} else {
						fields[field] = -1;
					}
				}
			}
			if (!usePositiveFields) {
				useNegativeFields = true;
			}
		}

		// Store the total number of documents to be used in the finalize function
		statCount = this.stats().count;
		if (options.hasOwnProperty('limit') && typeof options.limit === 'number' && options.limit > 0 && options.limit < statCount) {
			statCount = options.limit;
		} else if (options.hasOwnProperty('limit')) {
			delete options.limit;
		}

		// Make sure to override certain options
		options.map = map;
		options.reduce = reduce;
		options.finalize = finalize;
		options.mapreduce = this._shortName;
		options.scope = {
			getType : getType,
			getNewKeyString : getNewKeyString,
			getKeyInfo : getKeyInfo,
			statCount : statCount,
			wildcards : wildcards,
			arraysAreWildcards : arraysAreWildcards,
			fields : fields,
			usePositiveFields : usePositiveFields,
			useNegativeFields : useNegativeFields
		};

		// Execute and return
		print('Processing ' + statCount + ' document(s)...');
		return this.mapReduce(map, reduce, options);
	};

}());/*global DBCollection: false, DBQuery: false, tojson: false */
/*jslint devel: false, nomen: true, maxerr: 50, indent: 4 */
/**
 * MongoDB - wild.js
 * 
 *      Version: 1.0
 *         Date: April 29, 2012
 *      Project: http://skratchdot.github.com/mongodb-wild/
 *  Source Code: https://github.com/skratchdot/mongodb-wild/
 *       Issues: https://github.com/skratchdot/mongodb-wild/issues/
 * Dependencies: MongoDB v1.8+
 * 
 * Description:
 * 
 * Adds a wildcard search to the shell.  You can run the new
 * wild() function on a collection, or on a query result.
 * The search is performed by converting each document to json,
 * and then running a regex that json.
 * 
 * Usage:
 * 
 * // Search entire users collection for Bob
 * db.users.wild('Bob');
 * db.users.wild(/Bob/gi);
 * db.users.find().wild('Bob');
 * 
 * // Search for exact values of 'Bob'
 * db.users.wild(': "Bob"');
 * 
 * // Search for exact keys called 'Bob'
 * db.users.wild('"Bob" :');
 * 
 * // Search for documents containing 'Bob', filtering by last name of 'Smith'
 * db.users.wild('Bob', {'name.last' : 'Smith'});
 * db.users.find({'name.last' : 'Smith'}).wild('Bob');
 * 
 * Copyright (c) 2012 SKRATCHDOT.COM
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function () {
	'use strict';

	/**
	 * @function
	 * @name wild
	 * @memberOf DBQuery
	 * @param {String|RegExp} regex The regular expression to filter the query by
	 */
	DBQuery.prototype.wild = function (regex) {
		var doc, result = [];

		// Ensure we have a valid regex
		if (typeof regex === 'string') {
			regex = new RegExp(regex, 'gi');
		}
		if (regex instanceof RegExp === false) {
			regex = new RegExp();
		}

		// Build our result set.
		while (this.hasNext()) {
			doc = this.next();
			if (tojson(doc).search(regex) >= 0) {
				result.push(doc);
			}
		}

	    return result;
	};

	/**
	 * @function
	 * @name wild
	 * @memberOf DBCollection
	 * @param {String|RegExp} regex The regular expression to filter the query by
	 * @param {object} query This value will be passed through to the .find() function
	 * @param {object} fields This value will be passed through to the .find() function
	 * @param {number} limit This value will be passed through to the .find() function
	 * @param {number} skip This value will be passed through to the .find() function
	 * @param {number} batchSize This value will be passed through to the .find() function
	 * @param {object} options This value will be passed through to the .find() function
	 */
	DBCollection.prototype.wild = function (regex, query, fields, limit, skip, batchSize, options) {
		return this.find(query, fields, limit, skip, batchSize, options).wild(regex);
	};

}());
// HACK: so that moment.js works
// See: mesh.js
if (typeof window === 'function' && typeof window.moment !== 'undefined') {
	moment = window.moment;
	delete window;
}

// Mix in non-conflicting functions to the Underscore namespace
_.mixin(_.str.exports());

// Output the current version number when starting the shell.
mesh.version();
