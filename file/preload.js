const fs = require("fs");
const crypto = require("crypto");
const path = require('path')
var progressStream = require('progress-stream');
window.pluginInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'plugin.json')));
window.openFile = () => {
  const paths = utools.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  })
  if (!paths) {
    return paths
  }
  return paths.map(filePath => {
    const file = {}
    file.name = path.basename(filePath) + path.extname(filePath)
    file.path = filePath
    return file
  })
}
// 加密
window.xencode = (by, filePath, key, iv, callback) => {
  return new Promise((resolve) => {
    const encryptStream = crypto.createCipheriv(by, key, iv);
    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(filePath + ".xu");
    if (callback) {
      const progress = progressStream({
        time: 100
      });
      progress.on('progress', function (progress) {
        callback(Math.round(progress.percentage) + '%')
      });
      readStream
        .pipe(encryptStream) // 加密
        .pipe(progress)
        .pipe(writeStream)
        .on("finish", function () {
          resolve("完成");
        });
    } else {
      readStream
        .pipe(encryptStream) // 加密
        .pipe(writeStream)
        .on("finish", function () {
          resolve("完成");
        });
    }
  });
};
// 解密
window.xdecode = (by, filePath, key, iv, callback) => {
  return new Promise((resolve) => {
    const decryptStream = crypto.createDecipheriv(by, key, iv, {
      authTagLength: 16,
    });
    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(filePath.replace(".xu", ""));
    if (callback) {
      const progress = progressStream({
        time: 200
      });
      progress.on('progress', function (progress) {
        callback(Math.round(progress.percentage) + '%')
      });
      readStream
        .pipe(decryptStream) // 加密
        .pipe(progress)
        .pipe(writeStream)
        .on("finish", function () {
          resolve("完成");
        });
    } else {
      readStream
        .pipe(decryptStream) // 加密
        .pipe(writeStream)
        .on("finish", function () {
          resolve("完成");
        });
    }

  });
};
window.openUrl = (url) => {
  utools.shellOpenExternal(url);
};
// 创建更新窗口
window.createUpdateWindow = () => {
  const optional = {
    width: 800,
    height: 600,
    title: '更新说明',
    transparent: false,
    frame: true,
    alwaysOnTop: true
  }
  const win = utools.createBrowserWindow("./README.html", optional);
};