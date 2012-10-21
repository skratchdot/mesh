 mesh - MongoDB Extended Shell
===============================


## Description ##

mesh (**M**ongoDB **E**xtended **Sh**ell) is a javascript file that extends
the mongo shell.  It includes some useful libraries, as well as new functions
for dealing with Mongo collections and queries.


## What's Included? ##

- [underscore.js](http://documentcloud.github.com/underscore/) - Underscore.js is a
  utility-belt library for JavaScript that provides support for the usual functional
  suspects (each, map, reduce, filter...) without extending any core JavaScript objects.

- [underscore.string.js](http://epeli.github.com/underscore.string/) - Javascript lacks
  complete string manipulation operations.  This an attempt to fill that gap.

- [moment.js](http://momentjs.com/) - A lightweight javascript date library for parsing,
  validating, manipulating, and formatting dates.

- [science.js](https://github.com/jasondavies/science.js) - Scientific and statistical computing
  in JavaScript.

- [distinct2()](http://skratchdot.com/projects/mongodb-distinct2/) - Similar to the built-in distinct()
  function, but with more capabilities.

- [distinctTypes()](http://skratchdot.com/projects/mongodb-distinct-types/) - Similar to the 
  db.myCollection.distinct() function, distinctTypes() will return "types" rather than "values".

- [flatten()](http://skratchdot.com/projects/mongodb-flatten/) - The flatten() function is a 
  mapReduce that flattens documents into key/value pairs.

- [schema()](http://skratchdot.com/projects/mongodb-schema/) - A schema analysis tool for MongoDB.

- [wild()](http://skratchdot.com/projects/mongodb-wild/) - Adds a wildcard search to the mongodb shell.

- A console wrapper so calls like console.log() and console.dir() don't error out

- mesh.setPrompt(): a way to configure your prompt. Can set a default in mesh.config.js

- mesh.keys(): will return all the "global" properties as a sorted array.

- [JSON2.js](https://github.com/douglascrockford/JSON-js) - JSON.stringify() and JSON.parse()


## Installation ##

**Download:** [mesh.js](https://github.com/skratchdot/mesh/raw/master/mesh.js)

### Option 1 ###

Add this script to your .mongorc.js file.  

_See:_ [http://www.mongodb.org/display/DOCS/Overview+-+The+MongoDB+Interactive+Shell#Overview-TheMongoDBInteractiveShell-.mongorc.js](http://www.mongodb.org/display/DOCS/Overview+-+The+MongoDB+Interactive+Shell#Overview-TheMongoDBInteractiveShell-.mongorc.js)

_Example:_

    load('mesh.js');
    load('mesh.config.js');


### Option 2 ###

Start the shell after executing this script  

    mongo --shell mesh.js


## Configuration ##

You can configure mesh by calling **mesh.config(settings)**. The benefit of keeping a config file, is that
you won't lose your default settings when updating mesh. Currently, there is only 1 config value:
	defaultPrompt

You can create a file "mesh.config.js".  It might look like:

    mesh.config({
        defaultPrompt : 4
    });

Now, when starting the shell, you can pass in the **mesh.config.js** file along with your 
**mesh.js** file like:

    mongo --shell mesh.js mesh.config.js


## Usage ##

coming soon


## For Developers ##


#### Getting The Code ####

    git clone git://github.com/skratchdot/mesh.git
    cd mesh
    git submodule update --init --recursive


#### Updating submodule sources ####

    git submodule foreach git pull


## Version History ##

#### v1.2.3 - Released October 21, 2012
  * updating libraries: mongodb-flatten.js

#### v1.2.2 - Released October 20, 2012
  * updating libraries: mongodb-flatten.js, underscore.js, and underscore.string.js

#### v1.2.1 - Released October 7, 2012
  * updating libraries: moment.js, mongodb-distinct2.js, and underscore.js
  * [json2.js](https://github.com/douglascrockford/JSON-js) is now included due 
    to the mongodb-distinct2.js upgrade

#### v1.2.0 - Released September 24, 2012
  * mesh.setPrompt() is now mesh.prompt()
  * updating libraries
  * adding mesh.time() which displays function execution times

#### v1.1.4 - Released August 20, 2012
  * removing [Sugar](http://sugarjs.com/) (rely on [underscore.js](http://documentcloud.github.com/underscore/) instead)
  * updating submodules

#### v1.1.3 - Released August 16, 2012
  * adding [science.js](https://github.com/jasondavies/science.js)

#### v1.1.2 - Released August 16, 2012
  * Mix in non-conflicting string functions to the Underscore namespace
  * adding [Sugar](http://sugarjs.com/)
  * using minified version of [moment.js](http://momentjs.com/)

#### v1.1.1 - Released August 16, 2012
  * Updating submodules
  * Updating README.md with "What's Included?" descriptions
  * Updating README.md with "For Deveopers" section
  * Small fix to [distinct2.js](http://skratchdot.com/projects/mongodb-distinct2/)

#### v1.1.0 - Released August 15, 2012 ####
  * Adding [distinct2.js](http://skratchdot.com/projects/mongodb-distinct2/)
  * implementing mesh.toString() so the console prints help info

#### v1.0.0 - Released July 17, 2012 ####
  * Initial Release
