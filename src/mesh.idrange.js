/*globals mesh, moment, DBCollection */
/**
 * MongoDB - mesh.idrange.js
 * Version: 1.0
 * Date: September 25, 2013
 * Description:
 * 
 * Search collections for documents with ids created between 2 datetimes.
 * 
 * Example Usage:
 * 
 * // method 1: search the users collection for users created on 3/20/2013
 * var query = mesh.idrange('3/20/2013', '3/21/2013');
 * db.users.find(query);
 * 
 * // method 2: search the users collection for users created on 3/20/2013
 * db.users.idrange('3/20/2013', '3/21/2013');
 * 
 * // search the users collection for users with first name "Bob" created in March
 * db.users.idrange('3/1/2013', '4/1/2013', {"name.first": "Bob"});
 * 
 * Copyright (c) 2013 SKRATCHDOT.COM
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function () {
	'use strict';
	var idrange, toMoment;

	/**
	 * @function
	 * @name idrange
	 * @private
	 * 
	 * Convert input to a valid moment object
	 */
	toMoment = function (input) {
		input = moment(input);
		if (!input || !input.isValid || !input.isValid()) {
			input = moment();
		}
		return input;
	};

	/**
	 * @function
	 * @name idrange
	 * @private
	 */
	idrange = function (one, two, properties) {
		var result = {_id:{}}, moments, prop;

		// create our moments
		moments = [toMoment(one), toMoment(two)];

		// put them in the right order
		moments.sort(function (a, b) {
			return a.diff(b);
		});

		// setup our result
		if (typeof properties === 'object') {
			for (prop in properties) {
				if (properties.hasOwnProperty(prop)) {
					result[prop] = properties[prop];
				}
			}
		}

		// add moments to our result, and return
		result._id.$gte = mesh.tid(moments[0]);
		result._id.$lt = mesh.tid(moments[1]);
		return result;
	};

	/**
	 * @function
	 * @name idrange
	 * @memberOf DBCollection
	 */
	DBCollection.prototype.idrange = function (one, two, properties) {
		return this.find(idrange(one, two, properties));
	};

	// store idrange on the mesh object
	mesh.idrange = idrange;
}());
