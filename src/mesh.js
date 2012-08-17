/*jslint maxerr: 50, indent: 4, nomen: true */
/*global print, _, moment, db */
/*!
 * mesh - the MongoDB Extended Shell
 * 
 *      Version: 1.1.2
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
		return print('mesh (the MongoDB Extended Shell) version: 1.1.2');
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

