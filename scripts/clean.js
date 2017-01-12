var quake = require('./tasks');
quake.start('clean', function (err) {
  if (err) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});