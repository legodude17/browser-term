var quake = require('quake-task');
var rx = require('rxjs');
var uuid = require('uuid/v4');
var rollup = require('rollup');
var fs = require('fs');
var rp_cjs = require('rollup-plugin-commonjs');
var rp_noderes = require('rollup-plugin-node-resolve');
var rp_babel = require('rollup-plugin-babel');
var rp_uglify = require('rollup-plugin-uglify');
var del = require('del');
module.exports = quake;
quake.add('commands', [
  quake.src('./src/commands.json', 'utf-8'),
  quake.name(quake.sync(res => JSON.parse(res)), "Parse JSON"),
  quake.name(quake.sync(generateExports), "Generate Exports"),
  quake.dest('./src/commands/index.js')
]);

function generateExports(commands) {
  return commands.commands.map(v => "export {" + v + "} from './" + v + ".js';").join('\n') + "\n";
}
quake.add('build', ['commands'], [
  quake.name((res, cb) => {
    fs.mkdir(quake.resolve('./build'), () => cb(null));
  }, "Make build dir"),
  quake.name(quake.sync(uuid), "Generate uuid"),
  quake.name(uuid => new rx.Observable(function (subber) {
    rollup.rollup({
      entry: quake.resolve('./src/index.js'),
      onwarn: subber.next.bind(subber),
      plugins: [
        rp_noderes({
          jsnext: true,
          main: true
        }),
        rp_cjs(),
        rp_babel({
          exclude: 'node_modules/**'
        }),
        rp_uglify()
      ]
    }).then(bundle => {
      return bundle.write({
        dest: quake.resolve('./build/bundle.' + uuid + '.js'),
        sourceMap: true,
        format: 'umd'
      });
    }).then(() => {
      subber.next('bundle.' + uuid + '.js');
      subber.complete();
    }).catch(err => subber.error(err));
  }), 'Rollup'),
  quake.name((file, cb) => {
    fs.readFile(quake.resolve('./index.html'), 'utf-8', (err, res) => {
      fs.writeFile(
        quake.resolve('./build/index.html'),
        res.replace("__JAVASCRCIPT GOES HERE IN BUILD__", file),
        cb);
    });
  }, 'HTML')
]);

quake.add('clean', [quake.name(() => del('build/*'), 'Delete all files from build')]);