/*jslint nomen: true, plusplus: true, smarttabs: true, unused: false */
/*global print, _, moment, db, ObjectId, hostname */
/*!
 * mesh - the MongoDB Extended Shell
 * 
 *	          Version: @VERSION@ 
 *		         Date: @DATE@
 *	          Project: http://skratchdot.com/projects/mesh/
 *        Source Code: https://github.com/skratchdot/mesh/
 *	           Issues: https://github.com/skratchdot/mesh/issues/
 * Included Libraries: https://github.com/skratchdot/mesh/#whats-included
 *       Dependencies: MongoDB v1.8+
 * 
 * Copyright @YEAR@ <skratchdot.com>
 *   Dual licensed under the MIT or GPL Version 2 licenses.
 *   https://raw.github.com/skratchdot/mesh/master/LICENSE-MIT.txt
 *   https://raw.github.com/skratchdot/mesh/master/LICENSE-GPL.txt
 * 
 */
var mesh = (function (global) {
	'use strict';

	var api,
		version = "@VERSION@",
		lastTime = null,
		config = {
			defaultPrompt : 0,	// 0-4 or a string
			aliases : {}		// can pass in a map of aliases. see: mesh.setAliases();
		};

	/*
	 * This is the "mesh" function. If someone types: mesh(), then we will just
	 * print the current version info.
	 */
	api = function () {
		return api.version();
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
			api.prompt(config.defaultPrompt);
		}
		if (settings.hasOwnProperty('aliases') && typeof settings.aliases === 'object') {
			api.setAliases(settings.aliases);
		}
	};

	/*
	 * Print the current version
	 */
	api.version = function () {
		return print('mesh (the MongoDB Extended Shell) version: ' + version);
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
	 * Accept a map of aliases.  The keys are the aliases, and the values
	 * are the paths to the variable.
	 * 
	 * For instance, if we want to create an aliase for mesh.keys() to be k(), then
	 * we can call:
	 * 
	 *	 mesh.setAliases({'k':'mesh.keys'});
	 * 
	 * We can create an alias for printjson() by doing something like:
	 * 
	 *	 mesh.setAliases({'pj':'printjson'});
	 * 
	 */
	api.setAliases = function (aliases) {
		var alias, keys, i, skip, obj;

		// do nothing if we weren't passed key/value pairs
		if (typeof aliases !== 'object') {
			return;
		}

		// loop through our aliases
		for (alias in aliases) {
			if (aliases.hasOwnProperty(alias)) {
				// we process dot delimited strings
				keys = aliases[alias];
				if (typeof keys === 'string' && keys.length > 0) {
					// we will drill down into the dot delimited string.
					// if the given variable path doesn't exist, let's
					// try to process the next alias
					skip = false;
					obj = global;
					keys = keys.split('.');
					for (i = 0; i < keys.length; i++) {
						if (obj && obj[keys[i]]) {
							obj = obj[keys[i]];
						} else {
							i = keys.length;
							skip = true;
						}
					}
					if (!skip) {
						global[alias] = obj;
					}
				}
			}
		}
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
	api.prompt = function (newPrompt) {
		var base = '> ';
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
					hostname() + ":" +
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
		} else if (typeof newPrompt === 'string') {
			global.prompt = function () {
				return newPrompt;
			};
		} else {
			delete global.prompt;
		}
	};

	/*
	 * A simple wrapper for ObjectId();
	 */
	api.oid = function (oidString) {
		if (typeof oidString === 'string') {
			return new ObjectId(oidString);
		}
		return new ObjectId();
	};

	/*
	 * Generate an ObjectId() based on a time stamp.
	 *
	 * usage:
	 *
	 *		 // pass in nothing to get an ObjectId based on the current timestamp
	 *		 mesh.tid();
	 *		 // you can pass in any valid Date object
	 *		 mesh.tid(new Date());
	 *		 // you can pass in any valid moment object
	 *		 mesh.tid(moment());
	 *		 mesh.tid('2 minutes ago');
	 *		 mesh.tid('June 1, 2012'); // returns ObjectId("4fc83e400000000000000000")
	 *		 // you can pass in an optional increment value
	 *		 mesh.tid('June 1, 2012', 3); // returns ObjectId("4fc83e400000000000000003")
	 *
	 * see:
	 *
	 *		 http://www.kchodorow.com/blog/2011/12/20/querying-for-timestamps-using-objectids/
	 *		 http://www.mongodb.org/display/DOCS/Object+IDs
	 *
	 * ObjectIds are 12-byte BSON objects:
	 *
	 * TimeStamp [bytes 0-3]:
	 *		 This is a unix style timestamp. It is a signed int representing
	 *		 the number of seconds before or after January 1st 1970 (UTC).
	 *
	 * Machine [bytes 4-6]
	 *		 This is the first three bytes of the (md5) hash of the machine host
	 *		 name, or of the mac/network address, or the virtual machine id.
	 *
	 * Pid [bytes 7-8]
	 *		 This is 2 bytes of the process id (or thread id) of the process
	 *		 generating the ObjectId.
	 *
	 * Increment [bytes 9-11]
	 *		 This is an ever incrementing value starting with a random number.
	 */
	api.tid = function (newMoment, inc) {
		var theDate, seconds, hexSecs, hexInc;

		// build timestamp portion of ObjectId
		newMoment = moment(newMoment);
		if (newMoment && newMoment.isValid && newMoment.isValid()) {
			theDate = newMoment.toDate();
		} else {
			theDate = new Date();
		}
		seconds = parseInt(theDate.getTime() / 1000, 10);
		hexSecs = seconds.toString(16);

		// build increment portion of ObjectId
		if (typeof inc !== 'number') {
			inc = 0;
		}
		hexInc = _.lpad(parseInt(inc, 10).toString(16), 3, '0').substring(0, 3);
		return new ObjectId(hexSecs + '0000000000000' + hexInc);
	};

	/*
	 * Returns a sorted array of all the keys in an object
	 */
	api.keys = function (obj) {
		return _.keys(obj || global).sort();
	};

	/*
	 * If passed a function, it will display the function execution time.
	 * 
	 * If passed anything else, it will just print the current time.
	 * 
	 * This function keeps track of the last time it was called, and will output
	 * how long it's been since the last time it was called.
	 */
	api.time = function (obj) {
		var start = moment(),
			formatString = 'YYYY-MM-DD hh:mm:ss a';

		// Current Time
		print('Current Time: ' + start.format(formatString));

		// Last time called
		if (lastTime !== null) {
			print('Last time called ' + lastTime.fromNow() + ' [' + start.format(formatString) + ']');
		}

		// Execute function if one is passed
		if (typeof obj === 'function') {
			print('Executing function...');
			obj.apply();
			print(' Started ' + start.fromNow());
			print('Finished: ' + moment().format(formatString));
		}

		// Save last time
		lastTime = start;
	};

	return api;
}(this));
