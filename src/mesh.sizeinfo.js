/*global DBQuery, DBCollection */
/**
 * MongoDB - mesh.sizeinfo.js
 * Version: 1.0
 * Date: September 25, 2013
 * Description:
 * 
 * Get the size stats for the given query/collection. Reports count/sum/avg/max/min of all bson sizes.
 * 
 * Example Usage:
 * 
 * // method 1: get the size stats for all documents in the users collection with first name "Bob"
 * db.users.sizeinfo({"first.name": "Bob"});
 * 
 * // method 2: get the size stats for all documents in the users collection with first name "Bob"
 * db.users.find({"first.name": "Bob"}).sizeinfo();
 * 
 * Copyright (c) 2013 SKRATCHDOT.COM
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function () {
	var sizeinfo;

	/**
	 * @function
	 * @name sizeinfo
	 * @private
	 */
	sizeinfo = function (cursor) {
		var doc, size, count = 0, sum = 0, max, min;
		while (cursor.hasNext()) {
			doc = cursor.next();
			size = Object.bsonsize(doc);
			count += 1;
			sum += size;
			if (typeof max !== 'number' || max < size) {
				max = size;
			}
			if (typeof min !== 'number' || min > size) {
				min = size;
			}
		}
		return {
			count: count,
			sum: sum,
			max: max,
			min: min,
			avg: count > 0 ? sum / count : 0
		};
	};

	/**
	 * @function
	 * @name sizeinfo
	 * @memberOf DBCollection
	 */
	DBQuery.prototype.sizeinfo = function () {
		return sizeinfo(this);
	};

	/**
	 * @function
	 * @name sizeinfo
	 * @memberOf DBCollection
	 */
	DBCollection.prototype.sizeinfo = function (query, fields, limit, skip, batchSize, options) {
		return this.find(query, fields, limit, skip, batchSize, options).sizeinfo();
	};

}());
