
const process = require("child_process");
const path = require("path");



exports.attrCheck = (target, attrName) => {
    if (!target[attrName]){
        throw new Error(`require attr ${attrName}`);
    }
}

exports.baseDir = path.join(__dirname, '../');

exports.exec = function (shell) {
    return new Promise((resolve, reject) => {
        process.exec(shell, (error, stdout, stderr) => {
            if (error) {
                console.error(`${error}`);
                resolve();
            }
            console.log(`${stdout}`);
            resolve(stdout);
        })
    })

}




