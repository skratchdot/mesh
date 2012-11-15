
// Mix in non-conflicting functions to the Underscore namespace
_.mixin(_.str.exports());

// Output the current version number when starting the shell.
mesh.version();
