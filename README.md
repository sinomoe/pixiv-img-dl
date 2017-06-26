# pixiv-img-dl

[![Build Status](https://travis-ci.org/sino2322/pixiv-img-dl.svg?branch=master)](https://travis-ci.org/sino2322/pixiv-img-dl)

[中文](./README_ZH.md)

a simple way to save pixiv images to local using nodejs

## Installation

```bash
npm i pixiv-img-dl --save
```

## Test

```bash
npm test
```

## API

### fetch(imgUrl[, savePath])

* imgUrl: pixiv image url, just a string
* savePath: path to save image, it should be a existed directory. by default it's `path.resolve('./images')`.
* return value: a promise.

#### example

```js
const pixiv = require('pixiv-img-dl');
const url = 'https://i.pximg.net/img-original/img/2017/05/01/23/42/02/62683748_p0.png';

pixiv
  .fetch(url)
  .then(value => {
      console.log(value); // {name: '62683748_p0.png'}
  })
  .catch(console.log);
```

### fetchAll(imgUrls, concurrencyQueue[, savePath])

* imgUrls: a array of imgUrl.
* concurrencyQueue: an array of concurrency, eg. [10,5,2], the first time, concurrency is 10, if someting failed, it will retry in concurrency 5, finally 2.

#### example

```js
const pixiv = require('pixiv-img-dl');
const urls = ['https://i.pximg.net/img-original/img/2017/05/01/23/42/02/62683748_p0.png',
 'https://i.pximg.net/img-original/img/2017/05/20/15/28/57/62982851_p0.png'];

pixiv
  .fetchAll(urls, [5, 2])
  .then(console.log) // undefined
  .catch(console.log);
```

## Cotact me

sino2322@gmail.com

## License

MIT © [sino](http://onesino.com)