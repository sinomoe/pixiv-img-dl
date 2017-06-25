'use strict';

const fs = require('fs');
const request = require('superagent');
const path = require('path');
const async = require('async');
const util = require('util');

const fsStatPromise = util.promisify(fs.stat);
const fsMkdirPromise = util.promisify(fs.mkdir);
const fsWriteFilePromise = util.promisify(fs.writeFile);

// savePath is a dir
async function fetch(imgUrl, savePath) {
    if ('string' !== typeof imgUrl)
        return Promise.reject(new TypeError('wrong url'));
    let name = path.basename(imgUrl);
    // if set path
    if (savePath) {
        if ('string' !== typeof savePath)
            return Promise.reject(new TypeError('wrong path'));
        // is path a dir
        let stats;
        try {
            stats = await fsStatPromise(savePath);
        } catch (e) {
            return Promise.reject(e);
        }
        if (!stats.isDirectory())
            return Promise.reject(new Error('path should be a directory'));
        // resolve file's absolute path
        savePath = path.resolve(savePath, name);
    } else {
        // existed?
        savePath = path.resolve('./images');
        try {
            await fsStatPromise(savePath);
        } catch (e) {
            try {
                await fsMkdirPromise(savePath);
            } catch (e) {
                return Promise.reject(e);
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
    try {
        let res = await request
            .get(imgUrl)
            .set('Referer', 'http://www.pixiv.net/')
            .timeout({
                response: 10000,
                deadline: 60000
            });
        if (typeof res === 'undefined')
            return Promise.reject({ undefined: imgUrl });
        await fsWriteFilePromise(savePath, res.body);
    } catch (e) {
        return Promise.reject({ undefined: imgUrl });
    }
    return Promise.resolve(ret);
}
module.exports.fetch = fetch;

// download with concurrency control and failed retry
async function fetchAll(imgUrls, concurrency, savePath) {
    let failedUrls = [];
    let ret = [];

    function tryFetchAll(imgUrls, concurrency, savePath) {
        return new Promise((resolve, reject) => {
            failedUrls = [];
            async.mapLimit(imgUrls, concurrency, (url, callback) => {
                fetch(url, savePath).then(v => {
                    console.log(v);
                    callback(null, v);
                }).catch(v => {
                    console.log(v);
                    if (typeof v.undefined !== undefined)
                        failedUrls.push(v.undefined);
                    callback(null, v);
                });
            }, (err, results) => {
                ret = results;
                resolve();
            });
        });
    };
    // try 1
    await tryFetchAll(imgUrls, concurrency, savePath);
    if (!failedUrls.length) return Promise.resolve(ret);
    console.log(failedUrls.length + ' urls fetch failed, retrying');
    // retry 2
    await tryFetchAll(failedUrls, 6, savePath);
    if (!failedUrls.length) return Promise.resolve(ret);
    console.log(failedUrls.length + ' urls fetch failed, retrying');
    // retry 3
    await tryFetchAll(failedUrls, 2, savePath);
    if (!failedUrls.length) return Promise.resolve(ret);
    console.log('dead urls', failedUrls);
    // failed
    return Promise.reject(failedUrls);
}
module.exports.fetchAll = fetchAll;