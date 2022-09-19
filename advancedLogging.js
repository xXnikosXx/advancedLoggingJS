// import node's path module to manipulate origin file path.
const path = require("path");

// import node's file system module (fs)
const fs = require("fs");

/*
	In short, the code below creates an artificial error, in order to capture it's stack and from that extract
	the line number contained in that stack.
*/

// takes the  __stack property of the "global" module
Object.defineProperty(global, "__stack", {
	// get() serves as a getter for the property
	get() {
		// orig: temp variable to save Error.prepareStackTrace initial value.
		const orig = Error.prepareStackTrace;
		// if there IS an error already, return it's stack.
		Error.prepareStackTrace = function(_, stack) {
			return stack;
		};
		// else, create a new error.
		const err = new Error;
		// capture it's stack.
		Error.captureStackTrace(err, arguments.callee);
		// save that stack in a constant,
		const stack = err.stack;
		// change the Error.prepareStackTrace value back to it's original.
		Error.prepareStackTrace = orig;
		// return artificial error's stack for further manipulation.
		return stack;
	},
});

Object.defineProperty(global, "__callerInfo", {
	get() {
		// get the line number that's in the stack of the artificial error created above.
		// eslint-disable-next-line no-undef
		return [__stack[1].getLineNumber(), __stack[1].getFileName()];
	},
});

// main function (sends info to other functions for logging and is invoked from other files to create logs)
function logger(location, level, callerInfo, message, err) {

	let file = callerInfo[1];
	const line = callerInfo[0];

	// take the absolute path of the file the function was invoked in, stringify it and only keep the file name and extention.
	file = path.basename(file.toString());

	const output = "";
	if (location === "terminal") {
		// only log to terminal
		logToTerminal(output, location, level, file, line, message, err);
	}
	else if (location === "log") {
		// only log to files
		logToFile(output, location, level, file, line, message, err);
	}
	else if (location === "both") {
		// log to both files and terminal
		logToTerminal(output, location, level, file, line, message, err);
		logToFile(output, location, level, file, line, message, err);
	}
	else {
		// in case of wrong value.
		console.log(`Wrong logger(); usage in line ${line}. 1st arguement must be "terminal", "log", or "both". see line 491 in app.js for more info.`);
	}
}

// log to terminal
function logToTerminal(output, location, level, file, line, message, err) {

	// change location value to "terminal" (incase it's "both")
	location = "terminal";

	// add timestamp, filename and line number to output string.
	output = `\x1b[36m${logTimestamps(location, output)} \x1b[36m-(${file} | ${line})->`;

	// change styling according to "level" provided (for codes see bottom of file)
	switch (level) {
	case "success":
		output = `${output} \x1b[32mSUCCESS: ${message}`;
		break;
	case "test":
		output = `${output} \x1b[30m\x1b[47m\x1b[1m${message}\x1b[0m`;
		break;
	case "info":
		output = `${output} \x1b[33mINFO: ${message}`;
		break;
	case "debug":
		output = `${output} \x1b[35mDEBUG: ${message}`;
		break;
	case "warn":
		output = `${output} \x1b[2m\x1b[31mWARN: ${message}`;
		break;
	case "error":
		output = `${output} \x1b[31m\x1b[4m\x1b[1mERROR: (${message}) ${err.stack}`;
		break;
	case "uncaughtexception":
		output = `${output} \x1b[4m\x1b[31mUNCAUGHT EXCEPTION: (${message}) ${err.stack}`;
		break;
	default:
		output = `${output} \x1b[0m${message}`;
	}

	// add reset code in the end for security (avoid styling issue)
	output = output + "\x1b[0m";

	// output to console
	console.log(output);
}

// similar functionality to previous function
function logToFile(output, location, level, file, line, message, err) {
	location = "log";
	output = `${logTimestamps(location, output)} -(${file} | ${line})->`;
	switch (level) {
	case "success":
		output = `${output} SUCCESS: ${message}`;
		writeToLogFiles(level, output);
		break;
	case "test":
		output = `${output} ${message}`;
		writeToLogFiles(level, output);
		break;
	case "info":
		output = `${output} INFO: ${message}`;
		writeToLogFiles(level, output);
		break;
	case "debug":
		output = `${output} DEBUG: ${message}`;
		writeToLogFiles(level, output);
		break;
	case "warn":
		output = `${output} WARN: ${message}`;
		writeToLogFiles(level, output);
		break;
	case "error":
		output = `${output} ERROR: (${message}) ${err.stack}`;
		writeToLogFiles(level, output);
		break;
	case "uncaughtexception":
		output = `${output} UNCAUGHT EXCEPTION: (${message}) ${err.stack}`;
		writeToLogFiles(level, output);
		break;
	default:
		output = `${output} ${message}`;
	}
	// console.log(output);
}

// function to log to files
function writeToLogFiles(level, output) {

	// write to complete-log.txt
	// we're using fs.appendFile instead of fs.writeFile because fs.writeFile overrides file's existing content, fs.appendFile does not.
	fs.appendFile("logs/complete-log.txt", output + "\n\n", function(err) {
		if (err) return console.log("log write err: " + err);
	});

	// write to level-specific log.txt
	fs.appendFile(`logs/${level}-log.txt`, output + "\n\n", function(err) {
		if (err) return console.log("log write err: " + err);
	});
}

// find and add timestamp to output depending on write location.
function logTimestamps(location, output) {
	// create a new Date object, and extract time and date info from it.
	const date = new Date;
	const [day, month, year] = date.toLocaleDateString("el-GR").split("/");
	const [hour, minute, second] = date.toLocaleTimeString("el-GR").split(/:| /);
	const millisecond = date.getMilliseconds();

	// if logging to terminal: [day/month  hour:minute:second.millisecond]
	if (location === "terminal") {
		output = `${output}[${day}/${month}  ${hour}:${minute}:${second}.${millisecond}]`;
	}
	// if logging to file: [day/month/year  hour:minute:second]
	else if (location === "log") {
		output = `[${day}/${month}/${year}  ${hour}:${minute}:${second}]`;
	}
	else {
		output = "null";
	}
	return output;
}

// export logger() to be imported from other files.
module.exports = { logger };

/* 	CONSOLE.LOG COLORS REFERENCE!

			Reset = "\x1b[0m"
			Bright = "\x1b[1m"
			Dim = "\x1b[2m"
			Underscore = "\x1b[4m"
			Blink = "\x1b[5m"
			Reverse = "\x1b[7m"
			Hidden = "\x1b[8m"

			FgBlack = "\x1b[30m"
			FgRed = "\x1b[31m"
			FgGreen = "\x1b[32m"
			FgYellow = "\x1b[33m"
			FgBlue = "\x1b[34m"
			FgMagenta = "\x1b[35m"
			FgCyan = "\x1b[36m"
			FgWhite = "\x1b[37m"

			BgBlack = "\x1b[40m"
			BgRed = "\x1b[41m"
			BgGreen = "\x1b[42m"
			BgYellow = "\x1b[43m"
			BgBlue = "\x1b[44m"
			BgMagenta = "\x1b[45m"
			BgCyan = "\x1b[46m"
			BgWhite = "\x1b[47m"
*/

// LOGGER FUNCTION USAGE!
// logsys.logger("location", "level", __callerInfo, "message", error);
// location: terminal (terminal only) OR log (log in files only) OR both (log in files *and* terminal.)
// level: success OR test OR info OR debug OR warn OR error OR uncaughtexception. if set to something else, default will have no styles.
// __callerInfo: pass caller info to function (line number and file name)
// message: string, message to log.
// error: only used in error and uncaughtexception levels, log error object/stack.
