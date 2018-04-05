var fs = require("fs"),
  path = require("path"),
  Canvas = require("canvas"),
  getRenderer = require("../renderer/"),
  https = require('https');

var download = function (url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function (err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

function initializeCanvas(theme, cb) {
  // Fonts pre-registered in bin/worker
  var renderer = getRenderer(theme);

  if (!theme.backgroundImage) {
    return cb(null, renderer);
  }

  // Load background image from file (done separately so renderer code can work in browser too)
  if (theme.backgroundImage.startsWith("https:")) {
    var ext = theme.backgroundImage.substr(theme.backgroundImage.lastIndexOf('.') + 1);
    var fileName = "file." + ext;
    var filePath = path.join(__dirname, "..", "settings", "backgrounds", fileName);

    download(theme.backgroundImage, filePath, function () {
      fs.readFile(filePath, function (err, raw) {
        if (err) {
          return cb(err);
        }

        var bg = new Canvas.Image;
        bg.src = raw;
        renderer.backgroundImage(bg);

        return cb(null, renderer);
      });
    });
  }
}

module.exports = initializeCanvas;
