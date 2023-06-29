const fs = require('fs');
var path = require('path');
var outPath = '~/Library/Application Support/Adobe/';
// /Users/edwise/Library/Application Support/Adobe/CEP
var cepPath = 'CEP';
var extensionPath = 'extensions';
// if (!fs.existsSync(outPath + cepPath)) {

//     fs.mkdirSync(outPath + cepPath);
// }

console.info(fs.existsSync(outPath + cepPath))
// console.info(fs.existsSync(path.resolve(outPath)))