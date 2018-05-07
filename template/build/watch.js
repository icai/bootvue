const watch = require('glob-watcher');
const path = require('path')
const route = require('./route');
let paths = ['./src/pages/**/app.vue']
const watcher = watch(paths, {
  cwd: path.resolve(__dirname, '../')
});
// 'add', 'change', 'unlink'

let watchAction = function (path, stat) {
  if (path) {
    console.info(path, ': chnaged');
  }
  route();
  // `path` is the path of the changed file
  // `stat` is an `fs.Stat` object (not always available)
}

watcher.on('add', watchAction);
watcher.on('unlink', watchAction);

watchAction();
