'use strict';

const fs = require('fs');
const request = require('superagent');
const path = require('path');

// savePath is a dir
function fetch(imgUrl, savePath) {
    return new Promise((resolve, reject) => {
        if ('string' !== typeof imgUrl)
            return reject(new TypeError('wrong url'));
        const name = path.basename(imgUrl);
        // if set path
        if (savePath) {
            if ('string' !== typeof savePath)
                return reject(new TypeError('wrong path'));
            // is path a dir
            let stats;
            try {
                stats = fs.statSync(savePath);
            } catch (e) {
                return reject(e);
            }

            if (!stats.isDirectory())
                return reject(new Error('path should be a directory'));
            // resolve file's absolute path
            savePath = path.resolve(savePath, name);
        } else {
            // default save dir
            savePath = path.resolve('./images');
            // existed?
            try {
                const stats = fs.statSync(savePath);
            } catch (e) {
                try {
                    fs.mkdirSync(savePath);
                } catch (e) {
                    return reject(e);
                }
            }
            // resolve file's absolute path
            savePath = path.resolve(savePath, name);
        }

        // return value
        const ret = {
            name: name
        }

        // request the img and save
        request
            .get(imgUrl)
            .set('Referer', 'http://www.pixiv.net/')
            .timeout({
                response: 10000,
                deadline: 60000
            })
            .end((err, res) => {
                if (err || typeof res === 'undefined')
                    return reject({ undefined: imgUrl });
                // save async
                fs.writeFile(savePath, res.body, err => {
                    if (err) return reject(err);
                    // promise resolve
                    return resolve(ret);
                });
            });
    });
}
module.exports.fetch = fetch;

// wrap a list of promide into single promise 
function fetchAll(imgUrls, savePath) {
    return Promise.all(imgUrls.map(imgUrl => fetch(imgUrl, savePath)));
}
module.exports.fetchAll = fetchAll;