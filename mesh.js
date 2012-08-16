/*jslint maxerr: 50, indent: 4, nomen: true */
/*global print, _, moment, db */
/*!
 * mesh - the MongoDB Extended Shell
 * 
 *      Version: 1.1.1
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
		return print('mesh (the MongoDB Extended Shell) version: 1.1.1');
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

(function (Date, undefined) {

    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = "1.7.0",
        round = Math.round, i,
        // internal storage for language config files
        languages = {},
        currentLanguage = 'en',

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        // Parameters to check for on the lang config.  This list of properties
        // will be inherited from English if not provided in a language
        // definition.  monthsParse is also a lang config property, but it
        // cannot be inherited and as such cannot be enumerated here.
        langConfigProperties = 'months|monthsShort|weekdays|weekdaysShort|weekdaysMin|longDateFormat|calendar|relativeTime|ordinal|meridiem'.split('|'),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|zz?|ZZ?)/g,
        localFormattingTokens = /(LT|LL?L?L?)/g,
        formattingRemoveEscapes = /(^\[)|(\\)|\]$/g,

        // parsing tokens
        parseMultipleFormatChunker = /([0-9a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/gi,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenWord = /[0-9a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+/i, // any word characters or numbers
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO seperator)

        // preliminary iso regex 
        // 0000-00-00 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000
        isoRegex = /^\s*\d{4}-\d\d-\d\d(T(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,
        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.S', /T\d\d:\d\d:\d\d\.\d{1,3}/],
            ['HH:mm:ss', /T\d\d:\d\d:\d\d/],
            ['HH:mm', /T\d\d:\d\d/],
            ['HH', /T\d\d/]
        ],

        // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Month|Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        // format function strings
        formatFunctions = {},

        /*
         * moment.fn.format uses new Function() to create an inlined formatting function.
         * Results are a 3x speed boost
         * http://jsperf.com/momentjs-cached-format-functions
         *
         * These strings are appended into a function using replaceFormatTokens and makeFormatFunction
         */
        formatFunctionStrings = {
            // a = placeholder
            // b = placeholder
            // t = the current moment being formatted
            // v = getValueAtKey function
            // o = language.ordinal function
            // p = leftZeroFill function
            // m = language.meridiem value or function
            M    : '(a=t.month()+1)',
            MMM  : 'v("monthsShort",t.month())',
            MMMM : 'v("months",t.month())',
            D    : '(a=t.date())',
            DDD  : '(a=new Date(t.year(),t.month(),t.date()),b=new Date(t.year(),0,1),a=~~(((a-b)/864e5)+1.5))',
            d    : '(a=t.day())',
            dd   : 'v("weekdaysMin",t.day())',
            ddd  : 'v("weekdaysShort",t.day())',
            dddd : 'v("weekdays",t.day())',
            w    : '(a=new Date(t.year(),t.month(),t.date()-t.day()+5),b=new Date(a.getFullYear(),0,4),a=~~((a-b)/864e5/7+1.5))',
            YY   : 'p(t.year()%100,2)',
            YYYY : 'p(t.year(),4)',
            a    : 'm(t.hours(),t.minutes(),!0)',
            A    : 'm(t.hours(),t.minutes(),!1)',
            H    : 't.hours()',
            h    : 't.hours()%12||12',
            m    : 't.minutes()',
            s    : 't.seconds()',
            S    : '~~(t.milliseconds()/100)',
            SS   : 'p(~~(t.milliseconds()/10),2)',
            SSS  : 'p(t.milliseconds(),3)',
            Z    : '((a=-t.zone())<0?((a=-a),"-"):"+")+p(~~(a/60),2)+":"+p(~~a%60,2)',
            ZZ   : '((a=-t.zone())<0?((a=-a),"-"):"+")+p(~~(10*a/6),4)'
        },

        ordinalizeTokens = 'DDD w M D d'.split(' '),
        paddedTokens = 'M D H h m s w'.split(' ');

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatFunctionStrings[i + 'o'] = formatFunctionStrings[i] + '+o(a)';
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatFunctionStrings[i + i] = 'p(' + formatFunctionStrings[i] + ',2)';
    }
    formatFunctionStrings.DDDD = 'p(' + formatFunctionStrings.DDD + ',3)';


    /************************************
        Constructors
    ************************************/


    // Moment prototype object
    function Moment(date, isUTC, lang) {
        this._d = date;
        this._isUTC = !!isUTC;
        this._a = date._a || null;
        date._a = null;
        this._lang = lang || false;
    }

    // Duration Constructor
    function Duration(duration) {
        var data = this._data = {},
            years = duration.years || duration.y || 0,
            months = duration.months || duration.M || 0, 
            weeks = duration.weeks || duration.w || 0,
            days = duration.days || duration.d || 0,
            hours = duration.hours || duration.h || 0,
            minutes = duration.minutes || duration.m || 0,
            seconds = duration.seconds || duration.s || 0,
            milliseconds = duration.milliseconds || duration.ms || 0;

        // representation for dateAddRemove
        this._milliseconds = milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = months +
            years * 12;
            
        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;
        seconds += absRound(milliseconds / 1000);

        data.seconds = seconds % 60;
        minutes += absRound(seconds / 60);

        data.minutes = minutes % 60;
        hours += absRound(minutes / 60);

        data.hours = hours % 24;
        days += absRound(hours / 24);

        days += weeks * 7;
        data.days = days % 30;
        
        months += absRound(days / 30);

        data.months = months % 12;
        years += absRound(months / 12);

        data.years = years;

        this._lang = false;
    }


    /************************************
        Helpers
    ************************************/


    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength) {
        var output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    }

    // helper function for _.addTime and _.subtractTime
    function addOrSubtractDurationFromMoment(mom, duration, isAdding) {
        var ms = duration._milliseconds,
            d = duration._days,
            M = duration._months,
            currentDate;

        if (ms) {
            mom._d.setTime(+mom + ms * isAdding);
        }
        if (d) {
            mom.date(mom.date() + d * isAdding);
        }
        if (M) {
            currentDate = mom.date();
            mom.date(1)
                .month(mom.month() + M * isAdding)
                .date(Math.min(currentDate, mom.daysInMonth()));
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if (~~array1[i] !== ~~array2[i]) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromArray(input, asUTC) {
        var i, date;
        for (i = 1; i < 7; i++) {
            input[i] = (input[i] == null) ? (i === 2 ? 1 : 0) : input[i];
        }
        // we store whether we used utc or not in the input array
        input[7] = asUTC;
        date = new Date(0);
        if (asUTC) {
            date.setUTCFullYear(input[0], input[1], input[2]);
            date.setUTCHours(input[3], input[4], input[5], input[6]);
        } else {
            date.setFullYear(input[0], input[1], input[2]);
            date.setHours(input[3], input[4], input[5], input[6]);
        }
        date._a = input;
        return date;
    }

    // Loads a language definition into the `languages` cache.  The function
    // takes a key and optionally values.  If not in the browser and no values
    // are provided, it will load the language file module.  As a convenience,
    // this function also returns the language values.
    function loadLang(key, values) {
        var i, m,
            parse = [];

        if (!values && hasModule) {
            values = require('./lang/' + key);
        }
        
        for (i = 0; i < langConfigProperties.length; i++) {
            // If a language definition does not provide a value, inherit
            // from English
            values[langConfigProperties[i]] = values[langConfigProperties[i]] ||
              languages.en[langConfigProperties[i]];
        }

        for (i = 0; i < 12; i++) {
            m = moment([2000, i]);
            parse[i] = new RegExp('^' + (values.months[i] || values.months(m, '')) + 
                '|^' + (values.monthsShort[i] || values.monthsShort(m, '')).replace('.', ''), 'i');
        }
        values.monthsParse = values.monthsParse || parse;

        languages[key] = values;
        
        return values;
    }

    // Determines which language definition to use and returns it.
    //
    // With no parameters, it will return the global language.  If you
    // pass in a language key, such as 'en', it will return the
    // definition for 'en', so long as 'en' has already been loaded using
    // moment.lang.  If you pass in a moment or duration instance, it
    // will decide the language based on that, or default to the global
    // language.
    function getLangDefinition(m) {
        var langKey = (typeof m === 'string') && m ||
                      m && m._lang ||
                      null;

        return langKey ? (languages[langKey] || loadLang(langKey)) : moment;
    }


    /************************************
        Formatting
    ************************************/


    // helper for building inline formatting functions
    function replaceFormatTokens(token) {
        return formatFunctionStrings[token] ? 
            ("'+(" + formatFunctionStrings[token] + ")+'") :
            token.replace(formattingRemoveEscapes, "").replace(/\\?'/g, "\\'");
    }

    // helper for recursing long date formatting tokens
    function replaceLongDateFormatTokens(input) {
        return getLangDefinition().longDateFormat[input] || input;
    }

    function makeFormatFunction(format) {
        var output = "var a,b;return '" +
            format.replace(formattingTokens, replaceFormatTokens) + "';",
            Fn = Function; // get around jshint
        // t = the current moment being formatted
        // v = getValueAtKey function
        // o = language.ordinal function
        // p = leftZeroFill function
        // m = language.meridiem value or function
        return new Fn('t', 'v', 'o', 'p', 'm', output);
    }

    function makeOrGetFormatFunction(format) {
        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }
        return formatFunctions[format];
    }

    // format date using native date object
    function formatMoment(m, format) {
        var lang = getLangDefinition(m);

        function getValueFromArray(key, index) {
            return lang[key].call ? lang[key](m, format) : lang[key][index];
        }

        while (localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
        }

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m, getValueFromArray, lang.ordinal, leftZeroFill, lang.meridiem);
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token) {
        switch (token) {
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
            return parseTokenFourDigits;
        case 'S':
        case 'SS':
        case 'SSS':
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
        case 'a':
        case 'A':
            return parseTokenWord;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
            return parseTokenOneOrTwoDigits;
        default :
            return new RegExp(token.replace('\\', ''));
        }
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, datePartArray, config) {
        var a;
        //console.log('addTime', format, input);
        switch (token) {
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            datePartArray[1] = (input == null) ? 0 : ~~input - 1;
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            for (a = 0; a < 12; a++) {
                if (getLangDefinition().monthsParse[a].test(input)) {
                    datePartArray[1] = a;
                    break;
                }
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DDDD
        case 'DD' : // fall through to DDDD
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                datePartArray[2] = ~~input;
            }
            break;
        // YEAR
        case 'YY' :
            input = ~~input;
            datePartArray[0] = input + (input > 70 ? 1900 : 2000);
            break;
        case 'YYYY' :
            datePartArray[0] = ~~Math.abs(input);
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config.isPm = ((input + '').toLowerCase() === 'pm');
            break;
        // 24 HOUR
        case 'H' : // fall through to hh
        case 'HH' : // fall through to hh
        case 'h' : // fall through to hh
        case 'hh' :
            datePartArray[3] = ~~input;
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[4] = ~~input;
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[5] = ~~input;
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
            datePartArray[6] = ~~ (('0.' + input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config.isUTC = true;
            a = (input + '').match(parseTimezoneChunker);
            if (a && a[1]) {
                config.tzh = ~~a[1];
            }
            if (a && a[2]) {
                config.tzm = ~~a[2];
            }
            // reverse offsets
            if (a && a[0] === '+') {
                config.tzh = -config.tzh;
                config.tzm = -config.tzm;
            }
            break;
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(string, format) {
        var datePartArray = [0, 0, 1, 0, 0, 0, 0],
            config = {
                tzh : 0, // timezone hour offset
                tzm : 0  // timezone minute offset
            },
            tokens = format.match(formattingTokens),
            i, parsedInput;

        for (i = 0; i < tokens.length; i++) {
            parsedInput = (getParseRegexForToken(tokens[i]).exec(string) || [])[0];
            string = string.replace(getParseRegexForToken(tokens[i]), '');
            addTimeToArrayFromToken(tokens[i], parsedInput, datePartArray, config);
        }
        // handle am pm
        if (config.isPm && datePartArray[3] < 12) {
            datePartArray[3] += 12;
        }
        // if is 12 am, change hours to 0
        if (config.isPm === false && datePartArray[3] === 12) {
            datePartArray[3] = 0;
        }
        // handle timezone
        datePartArray[3] += config.tzh;
        datePartArray[4] += config.tzm;
        // return
        return dateFromArray(datePartArray, config.isUTC);
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(string, formats) {
        var output,
            inputParts = string.match(parseMultipleFormatChunker) || [],
            formattedInputParts,
            scoreToBeat = 99,
            i,
            currentDate,
            currentScore;
        for (i = 0; i < formats.length; i++) {
            currentDate = makeDateFromStringAndFormat(string, formats[i]);
            formattedInputParts = formatMoment(new Moment(currentDate), formats[i]).match(parseMultipleFormatChunker) || [];
            currentScore = compareArrays(inputParts, formattedInputParts);
            if (currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                output = currentDate;
            }
        }
        return output;
    }

    // date from iso format
    function makeDateFromString(string) {
        var format = 'YYYY-MM-DDT',
            i;
        if (isoRegex.exec(string)) {
            for (i = 0; i < 4; i++) {
                if (isoTimes[i][1].exec(string)) {
                    format += isoTimes[i][0];
                    break;
                }
            }
            return parseTokenTimezone.exec(string) ? 
                makeDateFromStringAndFormat(string, format + ' Z') :
                makeDateFromStringAndFormat(string, format);
        }
        return new Date(string);
    }


    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        var rt = lang.relativeTime[string];
        return (typeof rt === 'function') ?
            rt(number || 1, !!withoutSuffix, string, isFuture) :
            rt.replace(/%d/i, number || 1);
    }

    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1000),
            minutes = round(seconds / 60),
            hours = round(minutes / 60),
            days = round(hours / 24),
            years = round(days / 365),
            args = seconds < 45 && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < 45 && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < 22 && ['hh', hours] ||
                days === 1 && ['d'] ||
                days <= 25 && ['dd', days] ||
                days <= 45 && ['M'] ||
                days < 345 && ['MM', round(days / 30)] ||
                years === 1 && ['y'] || ['yy', years];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Top Level Functions
    ************************************/


    moment = function (input, format) {
        if (input === null || input === '') {
            return null;
        }
        var date,
            matched;
        // parse Moment object
        if (moment.isMoment(input)) {
            return new Moment(new Date(+input._d), input._isUTC, input._lang);
        // parse string and format
        } else if (format) {
            if (isArray(format)) {
                date = makeDateFromStringAndArray(input, format);
            } else {
                date = makeDateFromStringAndFormat(input, format);
            }
        // evaluate it as a JSON-encoded date
        } else {
            matched = aspNetJsonRegex.exec(input);
            date = input === undefined ? new Date() :
                matched ? new Date(+matched[1]) :
                input instanceof Date ? input :
                isArray(input) ? dateFromArray(input) :
                typeof input === 'string' ? makeDateFromString(input) :
                new Date(input);
        }

        return new Moment(date);
    };

    // creating with utc
    moment.utc = function (input, format) {
        if (isArray(input)) {
            return new Moment(dateFromArray(input, true), true);
        }
        // if we don't have a timezone, we need to add one to trigger parsing into utc
        if (typeof input === 'string' && !parseTokenTimezone.exec(input)) {
            input += ' +0000';
            if (format) {
                format += ' Z';
            }
        }
        return moment(input, format).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var isDuration = moment.isDuration(input),
            isNumber = (typeof input === 'number'),
            duration = (isDuration ? input._data : (isNumber ? {} : input)),
            ret;

        if (isNumber) {
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        }

        ret = new Duration(duration);

        if (isDuration) {
            ret._lang = input._lang;
        }

        return ret;
    };

    // humanizeDuration
    // This method is deprecated in favor of the new Duration object.  Please
    // see the moment.duration method.
    moment.humanizeDuration = function (num, type, withSuffix) {
        return moment.duration(num, type === true ? null : type).humanize(type === true ? true : withSuffix);
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    moment.lang = function (key, values) {
        var i;

        if (!key) {
            return currentLanguage;
        }
        if (values || !languages[key]) {
            loadLang(key, values);
        }
        if (languages[key]) {
            // deprecated, to get the language definition variables, use the
            // moment.fn.lang method or the getLangDefinition function.
            for (i = 0; i < langConfigProperties.length; i++) {
                moment[langConfigProperties[i]] = languages[key][langConfigProperties[i]];
            }
            moment.monthsParse = languages[key].monthsParse;
            currentLanguage = key;
        }
    };

    // returns language data
    moment.langData = getLangDefinition;

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment;
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    // Set default language, other languages will inherit from English.
    moment.lang('en', {
        months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        longDateFormat : {
            LT : "h:mm A",
            L : "MM/DD/YYYY",
            LL : "MMMM D YYYY",
            LLL : "MMMM D YYYY LT",
            LLLL : "dddd, MMMM D YYYY LT"
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : "in %s",
            past : "%s ago",
            s : "a few seconds",
            m : "a minute",
            mm : "%d minutes",
            h : "an hour",
            hh : "%d hours",
            d : "a day",
            dd : "%d days",
            M : "a month",
            MM : "%d months",
            y : "a year",
            yy : "%d years"
        },
        ordinal : function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        }
    });


    /************************************
        Moment Prototype
    ************************************/


    moment.fn = Moment.prototype = {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d;
        },

        unix : function () {
            return Math.floor(+this._d / 1000);
        },

        toString : function () {
            return this._d.toString();
        },

        toDate : function () {
            return this._d;
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds(),
                !!this._isUTC
            ];
        },

        isValid : function () {
            if (this._a) {
                return !compareArrays(this._a, (this._a[7] ? moment.utc(this) : this).toArray());
            }
            return !isNaN(this._d.getTime());
        },

        utc : function () {
            this._isUTC = true;
            return this;
        },

        local : function () {
            this._isUTC = false;
            return this;
        },

        format : function (inputString) {
            return formatMoment(this, inputString ? inputString : moment.defaultFormat);
        },

        add : function (input, val) {
            var dur = val ? moment.duration(+val, input) : moment.duration(input);
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },

        subtract : function (input, val) {
            var dur = val ? moment.duration(+val, input) : moment.duration(input);
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },

        diff : function (input, val, asFloat) {
            var inputMoment = this._isUTC ? moment(input).utc() : moment(input).local(),
                zoneDiff = (this.zone() - inputMoment.zone()) * 6e4,
                diff = this._d - inputMoment._d - zoneDiff,
                year = this.year() - inputMoment.year(),
                month = this.month() - inputMoment.month(),
                date = this.date() - inputMoment.date(),
                output;
            if (val === 'months') {
                output = year * 12 + month + date / 30;
            } else if (val === 'years') {
                output = year + (month + date / 30) / 12;
            } else {
                output = val === 'seconds' ? diff / 1e3 : // 1000
                    val === 'minutes' ? diff / 6e4 : // 1000 * 60
                    val === 'hours' ? diff / 36e5 : // 1000 * 60 * 60
                    val === 'days' ? diff / 864e5 : // 1000 * 60 * 60 * 24
                    val === 'weeks' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7
                    diff;
            }
            return asFloat ? output : round(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this._lang).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function () {
            var diff = this.diff(moment().sod(), 'days', true),
                calendar = this.lang().calendar,
                allElse = calendar.sameElse,
                format = diff < -6 ? allElse :
                diff < -1 ? calendar.lastWeek :
                diff < 0 ? calendar.lastDay :
                diff < 1 ? calendar.sameDay :
                diff < 2 ? calendar.nextDay :
                diff < 7 ? calendar.nextWeek : allElse;
            return this.format(typeof format === 'function' ? format.apply(this) : format);
        },

        isLeapYear : function () {
            var year = this.year();
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        },

        isDST : function () {
            return (this.zone() < moment([this.year()]).zone() || 
                this.zone() < moment([this.year(), 5]).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            return input == null ? day :
                this.add({ d : input - day });
        },

        startOf: function (val) {
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (val.replace(/s$/, '')) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'month':
                this.date(1);
                /* falls through */
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }
            return this;
        },

        endOf: function (val) {
            return this.startOf(val).add(val.replace(/s?$/, 's'), 1).subtract('ms', 1);
        },
        
        sod: function () {
            return this.clone().startOf('day');
        },

        eod: function () {
            // end of day = start of day plus 1 day, minus 1 millisecond
            return this.clone().endOf('day');
        },

        zone : function () {
            return this._isUTC ? 0 : this._d.getTimezoneOffset();
        },

        daysInMonth : function () {
            return moment.utc([this.year(), this.month() + 1, 0]).date();
        },

        // If passed a language key, it will set the language for this
        // instance.  Otherwise, it will return the language configuration
        // variables for this instance.
        lang : function (lang) {
            if (lang === undefined) {
                return getLangDefinition(this);
            } else {
                this._lang = lang;
                return this;
            }
        }
    };

    // helper for adding shortcuts
    function makeGetterAndSetter(name, key) {
        moment.fn[name] = function (input) {
            var utc = this._isUTC ? 'UTC' : '';
            if (input != null) {
                this._d['set' + utc + key](input);
                return this;
            } else {
                return this._d['get' + utc + key]();
            }
        };
    }

    // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
    for (i = 0; i < proxyGettersAndSetters.length; i ++) {
        makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase(), proxyGettersAndSetters[i]);
    }

    // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
    makeGetterAndSetter('year', 'FullYear');


    /************************************
        Duration Prototype
    ************************************/


    moment.duration.fn = Duration.prototype = {
        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              this._months * 2592e6;
        },

        humanize : function (withSuffix) {
            var difference = +this,
                rel = this.lang().relativeTime,
                output = relativeTime(difference, !withSuffix, this.lang());

            if (withSuffix) {
                output = (difference <= 0 ? rel.past : rel.future).replace(/%s/i, output);
            }

            return output;
        },

        lang : moment.fn.lang
    };

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    function makeDurationAsGetter(name, factor) {
        moment.duration.fn['as' + name] = function () {
            return +this / factor;
        };
    }

    for (i in unitMillisecondFactors) {
        if (unitMillisecondFactors.hasOwnProperty(i)) {
            makeDurationAsGetter(i, unitMillisecondFactors[i]);
            makeDurationGetter(i.toLowerCase());
        }
    }

    makeDurationAsGetter('Weeks', 6048e5);


    /************************************
        Exposing Moment
    ************************************/


    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    }
    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `moment` as a global object via a string identifier,
        // for Closure Compiler "advanced" mode
        this['moment'] = moment;
    }
    /*global define:false */
    if (typeof define === "function" && define.amd) {
        define("moment", [], function () {
            return moment;
        });
    }
}).call(this, Date);
/*global DBCollection: false, DBQuery: false */
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

// Output the current version number when starting the shell.
mesh.version();
