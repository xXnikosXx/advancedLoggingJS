# advancedLoggingJS
A Lightweight Advanced Logging System for NodeJS

Add the file to your project, to use it, require(); it in your JS files and use the logger(); function to log either to a logging file system or to the console

logger(); usage:

// import ALS in order to call the logger() function
const logsys = require("./advancedLoggingSystem.js");

// to use the function:
logsys.logger(location, level, \_\_callerInfo, content, err);

location: Where to output: 'terminal' to output to terminal (similar to console.log();), 'log' to output to file, 'both' to output to both terminal and file.
level: the log's level: success OR test OR info OR debug OR warn OR error OR uncaughtexception. if set to something else, default will have no styles.
\_\_callerInfo: pass caller info to function (line number and file name)
content: the content to log; can be a string, variable, array, object, etc 
err: only used when logging for errors (level: 'error' or 'uncaughtexception'), to log the error object/stack.

Examples: 

logsys.logger("terminal", "success", \_\_callerInfo, "Hello, World!");
output to console: [dd/MM  hh:mm:ss.ms] -(filename.js | line)-> SUCCESS: Hello, World!

(promise).catch(err => { logsys.logger("terminal", "error", \_\_callerInfo, "An error has occured", err); });
output to console: [dd/MM  hh:mm:ss.ms] -(filename.js | line)-> ERROR: An error has occured : {STACK}

Output to logging file system is as seen above, whereas output in Terminal is coloured. A color reference guide is provided commented in the bottom of the file.
Output is timestamped with day/month, hour:minute:second.millisecond
