 mesh - MongoDB Extended Shell
===============================


## Description ##

mesh (**M**ongoDB **E**xtended **Sh**ell) is a javascript file that extends
the mongo shell.  It includes some useful libraries, as well as new functions
for dealing with Mongo collections and queries.


## What's Included? ##

- [underscore.js](http://documentcloud.github.com/underscore/) 

- [underscore.string.js](http://epeli.github.com/underscore.string/)

- [moment.js](http://momentjs.com/)

- [distinct2()](http://skratchdot.com/projects/mongodb-distinct2/)

- [distinctTypes()](http://skratchdot.com/projects/mongodb-distinct-types/)

- [flatten()](http://skratchdot.com/projects/mongodb-flatten/)

- [schema()](http://skratchdot.com/projects/mongodb-schema/)

- [wild()](http://skratchdot.com/projects/mongodb-wild/)

- A console wrapper so calls like console.log() and console.dir() don't error out

- mesh.setPrompt(): a way to configure your prompt. Can set a default in mesh.config.js

- mesh.keys(): will return all the "global" properties as a sorted array.


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


## Version History ##

#### v1.0.0 - Released July 17, 2012 ####
  * Initial Release

#### v1.1.0 - Released August 15, 2012 ####
  * Updating submodules
  * Adding [distinct2.js](http://skratchdot.com/projects/mongodb-distinct2/)
  * implementing mesh.toString() so the console prints help info

