const index = require('../index');
const should = require('should');
const path = require('path');

const url = "https://i.pximg.net/img-original/img/2017/05/03/12/57/16/62711018_p0.png";
const list = ['https://i.pximg.net/img-original/img/2017/05/03/12/57/16/62711018_p0.png',
    'https://i.pximg.net/img-original/img/2017/01/19/00/26/09/61002303_p0.jpg'
];
const fake_url = "https://i.pximg.net/img-original/img/2017/05/03/12/57/16.png";

describe('test/index.test.js', function() {
    // fetch() true response
    it('should be {name: "62711018_p0.png"}', function() {
        return index.fetch(url).should.be.eventually.have.value('name', '62711018_p0.png');
    });

    // fetchAll() true response
    it('should be [{name: "62711018_p0.png"},{name: "61002303_p0.jpg"}]', function() {
        return index.fetchAll(list).should.be.eventually.match({
            '0': function(it) {
                return it.should.have.property('name', '62711018_p0.png');
            },
            '1': function(it) {
                return it.should.have.property('name', '61002303_p0.jpg');
            }
        })
    });

    //url type error
    it('should throw type error: wrong url', function() {
        return index.fetch({ a: 1 }).should.be.rejectedWith(Error, { message: 'wrong url' });
    });

    // path type error
    it('should throw type error: wrong path', function() {
        return index.fetch(url, { a: 1 }).should.be.rejectedWith(Error, { message: 'wrong path' });
    });

    // path dosen't exists
    it('should throw error: no this dir', function() {
        return index.fetch(url, "./ppp").should.be.rejectedWith(Error);
    });

    // path is not a dir
    it('should throw error: this is not dir', function() {
        return index.fetch(url, path.resolve("./package.json")).should.be.rejectedWith(Error, { message: 'path should be a directory' });
    });

    // request error
    it('should throw error: request error', function() {
        return index.fetch(fake_url).should.be.rejectedWith(Error);
    });
});