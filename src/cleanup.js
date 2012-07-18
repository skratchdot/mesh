
// HACK: so that moment.js works
// See: mesh.js
if (typeof window === 'function' && typeof window.moment !== 'undefined') {
	moment = window.moment;
	delete window;
}

// Output the current version number when starting the shell.
mesh.version();
