/**
 * Module dependencies.
 */

var connect = require('connect')
  , fs = require('fs')
  , path = require('path');

/**
 * Log buffer.
 */

var buf = [];

/**
 * Default log buffer duration.
 */

var defaultBufferDuration = 1000;

var mkdirs = function(dirpath, mode, callback) {
    if(typeof(mode) === 'function') {
        callback = mode;
        mode = null;
    }   
    mode = String(mode || 755);
    path.exists(dirpath, function(exists) {
        if(exists) {
            callback();
        } else {
            //尝试创建父目录，然后再创建当前目录
            mkdirs(path.dirname(dirpath), mode, function(){
                fs.mkdir(dirpath, mode, callback);
            }); 
        }   
    }); 
};

function get_log_stream(logpath, cb) {
	var now = new Date();
	var logname = path.join(logpath, now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() + '.log');
	console.log(logname);
	mkdirs(path.dirname(logname), function() {
		cb(fs.createWriteStream(logname, {flags: 'a', encoding: 'utf8'}));
	});
};

function logger(options) {
  if ('object' == typeof options) {
    options = options || {};
  } else if (options) {
    options = { format: options };
  } else {
    options = {};
  }

  var logfs = {stream: null};
  var logpath = path.join(options.path || './log');
  get_log_stream(logpath, function(stream) {
	  logfs.stream = stream;
  });
  setInterval(function(){
	  logfs.stream.end();
	  logfs.stream = null;
	  get_log_stream(logpath, function(stream) {
		  logfs.stream = stream;
	  });
  }, 3600000 * 24);
  
  // buffering support
  var interval = defaultBufferDuration;
  //flush interval
  setInterval(function(){
    if(buf.length && logfs.stream) {
      logfs.stream.write(buf.join(''), 'utf8');
      buf.length = 0;
    }
  }, interval); 
  //swap the stream
  var stream = {
    write: function(str){
      buf.push(str);
    }
  };

  return function logger(req, res, next) {
    var end = res.end
      , url = req.originalUrl;

    // mount safety
    if (req._logging) return next();

    // flag as logging
    req._logging = true;

    res.end = function(chunk, encoding) {
	    res.end = end;
	    res.end(chunk, encoding);
	    var ip = (req.socket && (req.socket.remoteAddress || (req.socket.socket && req.socket.socket.remoteAddress)));
	    stream.write(ip + '|' + (new Date().getTime()) + '|' + url + '|' + (req.headers['user-agent'] || '') + '\n', 'utf8');
	};

    next();
  };
};

connect(logger(), function(req, res) {
    res.end('1');
}).listen(9999);
