lib=./lib
src=./src

modules = \
	$(src)/mesh.js \
	$(src)/console.js \
	$(lib)/underscore/underscore-min.js \
	$(lib)/underscore.string/dist/underscore.string.min.js \
	$(lib)/moment/min/moment.min.js \
	$(lib)/Sugar/release/edge/sugar-edge.min.js \
	$(lib)/science.js/science.v1.min.js \
	$(lib)/mongodb-distinct2/distinct2.js \
	$(lib)/mongodb-distinct-types/distinct-types.js \
	$(lib)/mongodb-flatten/flatten.js \
	$(lib)/mongodb-schema/schema.js \
	$(lib)/mongodb-wild/wild.js \
	$(src)/cleanup.js

mesh.js: $(modules)
	cat $^ > ./mesh.js
