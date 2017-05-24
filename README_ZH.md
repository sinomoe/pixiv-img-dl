# pixiv-img-dl

[![Build Status](https://travis-ci.org/sino2322/pixiv-img-dl.svg?branch=master)](https://travis-ci.org/sino2322/pixiv-img-dl)

[English](./README.md)


使用 Node.js 快捷的存储 pixiv 图片。

## 安装

```bash
npm i pixiv-img-dl --save
```

## 测试

```bash
npm install --save-dev
npm test
```

## API

### fetch(imgUrl[, savePath])

* imgUrl: pixiv 图片链接, 字符串格式
* savePath: 用来存储图片的路径，它应该是一个目录. 当不填写此参数时，默认是 `path.resolve('./images')`.
* 返回值: 一个 promise 对象，其参数参考下面的例子.

#### 示例

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

### fetchAll(imgUrls[, savePath])

* imgUrls: imgUrl 的数组。
* 返回值: 其实这个函数就是用 Promise.all 对 promise 做了一个包装，参数形式如下例所示。
* 其他的和上面一样。

#### 示例

```js
const pixiv = require('pixiv-img-dl');
const urls = ['https://i.pximg.net/img-original/img/2017/05/01/23/42/02/62683748_p0.png',
 'https://i.pximg.net/img-original/img/2017/05/20/15/28/57/62982851_p0.png'];

pixiv
  .fetchAll(urls)
  .then(values => {
      console.log(value); // [{name: '62683748_p0.png'}, {name: '62982851_p0.png'}]
  })
  .catch(console.log);
```

## 联系我

sino2322@gmail.com

## 许可证

MIT © [sino](http://onesino.com)