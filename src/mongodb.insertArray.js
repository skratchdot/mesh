/*jslint nomen: true, plusplus: true */
/*global _, DBCollection, print */
/**
 * Insert an array of objects into a collection.
 * 
 * This will loop through the array, calling DBCollection.insert() on each object.
 * 
 * Example usage:
 * 
 *   // insert 2 items into myCollection
 *   var myArray = [{_id:1,test:1}, {_id:2,test:"foo"}];
 *   db.myCollection.insertArray(myArray);
 *   
 *   // transfer a few items from collection1 into collection2
 *   db.collection2.insertArray(db.collection1.find().limit(10).toArray());
 * 
 * @function
 * @name insertArray
 * @memberOf DBCollection
 * @param {array} arr - The array of objects to insert.
 * @param {object} options - pass through to DBCollection.prototype.insert()
 * @param {boolean} _allow_dot - pass through to DBCollection.prototype.insert()
 * @throws {Exception} - when arr is not an Array.
 */
DBCollection.prototype.insertArray = function (arr, options, _allow_dot) {
	'use strict';
	var i, obj;
	if (_.isArray(arr)) {
		for (i = 0; i < arr.length; i++) {
			obj = arr[i];
			if (_.isObject(obj) && !_.isFunction(obj)) {
				this.insert(obj, options, _allow_dot);
			} else {
				print('Cannot insert a non-object, so skipping: ' + obj);
			}
		}
	} else {
		throw 'first argument is not an array!';
	}
};
