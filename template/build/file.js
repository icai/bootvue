const fs = require('fs');
const path = require('path');
// file system
let pathSeparatorRe = /[\/\\]/g;
let file = {};
file.exists = function () {
  var filepath = path.join.apply(path, arguments);
  return fs.existsSync(filepath);
};
file.mkdir = function (dirpath, mode) {
  // Set directory mode in a strict-mode-friendly way.
  if (mode == null) {
    mode = parseInt('0777', 8) & (~process.umask());
  }
  dirpath.split(pathSeparatorRe).reduce(function (parts, part) {
    parts += part + '/';
    var subpath = path.resolve(parts);
    if (!file.exists(subpath)) {
      try {
        fs.mkdirSync(subpath, mode);
      } catch (e) {
        throw file.error('Unable to create directory "' + subpath + '" (Error code: ' + e.code + ').', e);
      }
    }
    return parts;
  }, '');
};
file.error = function (message, error) {
  return new Error(['\u001b[31m', message, '\u001b[39m'].join(""));
};

file.writeFile = function (filepath, contents, options, callback) {
  if (typeof options == 'function') {
    callback = options;
    options = {};
  }
  if (!options) { options = {}; callback = function () { } }
  // Create path, if necessary.
  file.mkdir(path.dirname(filepath));
  try {
    // Actually write file.
    fs.writeFile(filepath, contents, 'mode' in options ? { mode: options.mode } : {}, callback);
  } catch (e) {
    throw file.error('Unable to write "' + filepath + '" file (Error code: ' + e.code + ').', e);
  }
}

file.writeFileSync = function (filepath, contents, options) {
  if (!options) { options = {}; }
  // Create path, if necessary.
  file.mkdir(path.dirname(filepath));
  try {
    // Actually write file.
    fs.writeFileSync(filepath, contents, 'mode' in options ? { mode: options.mode } : {});
    return true;
  } catch (e) {
    throw file.error('Unable to write "' + filepath + '" file (Error code: ' + e.code + ').', e);
  }
};

module.exports = file
