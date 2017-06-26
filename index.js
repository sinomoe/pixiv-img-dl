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
            return Promise.reject({ name: name, url: imgUrl });
        await fsWriteFilePromise(savePath, res.body);
    } catch (e) {
        return Promise.reject({ name: name, url: imgUrl });
    }
    return Promise.resolve(ret);
}
module.exports.fetch = fetch;

// download with concurrency control and failed retry
async function fetchAll(imgUrls, concurrencyQueue, savePath) {
    let tryUrls = imgUrls;
    let urlIndex = 0;

    function tryFetchAll(imgUrls, concurrency, savePath) {
        return new Promise((resolve, reject) => {
            let failedUrls = [];

            async.mapLimit(imgUrls, concurrency, (url, callback) => {
                fetch(url, savePath).then(v => {
                    console.log(`saved ${v.name}, progress: ${++urlIndex}/${imgUrls.length}, concurrency: ${concurrency}`);
                    callback(null, v);
                }).catch(v => {
                    console.log(`failed ${v.name}, progress: ${urlIndex}/${imgUrls.length}, concurrency: ${concurrency}`);
                    if (typeof v.url !== undefined)
                        failedUrls.push(v.url);
                    callback(null, v);
                });
            }, (err, results) => {
                if (err) return Promise.reject(err);
                resolve(failedUrls);
            });
        });
    };

    // gen concurrent try queue, queue's length is depended on concurrencyQueue.length
    for (let i = 0; i < concurrencyQueue.length; i++) {
        tryUrls = await tryFetchAll(tryUrls, concurrencyQueue[i], savePath);
        // downloaded all ok
        if (!tryUrls.length) {
            console.log(`finished! ${tryUrls.length} failed, ${imgUrls.length - tryUrls.length} succeeded.`);
            return Promise.resolve();
        }
        // after concurrencyQueue.length times' try, still not completed
        if (i === concurrencyQueue.length - 1) {
            console.log('dead urls', tryUrls);
            return Promise.reject(tryUrls);
        }
        // still trying
        console.log(`${tryUrls.length} urls fetch failed, retrying ${i+1}`);
    }
}
module.exports.fetchAll = fetchAll;