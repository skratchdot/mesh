VERSION="1.3.1"
DATE=`date +"%B %d, %Y"`
LIB=./lib
SRC=./src

modules = \
	$(SRC)/mesh.js \
	$(SRC)/console.js \
	$(LIB)/underscore/underscore-min.js \
	$(LIB)/underscore.string/dist/underscore.string.min.js \
	$(LIB)/moment/min/moment.min.js \
	$(LIB)/science.js/science.v1.min.js \
	$(LIB)/mongodb-distinct2/distinct2.js \
	$(LIB)/mongodb-distinct-types/distinct-types.js \
	$(LIB)/mongodb-flatten/flatten.js \
	$(LIB)/mongodb-schema/schema.js \
	$(LIB)/mongodb-wild/wild.js \
	$(SRC)/cleanup.js

mesh.js: $(modules)
	cat $^ | sed s/@VERSION@/"$(VERSION)"/g | sed s/@DATE@/"$(DATE)"/g > ./mesh.js
