var url = require('url');
var crypto = require('crypto');
var fs = require('fs');
var ejs = require('ejs');
var util = require('util');

var config = require('../config');
var utils = require('./utils');
var redisClient = utils.redisClient;
var messageTpl = fs.readFileSync(__dirname + '/../message.ejs', 'utf-8');

exports.checkSignature = function (req, res, next) {
    req.query = url.parse(req.url, true).query;
    if (!req.query.signature) {
        console.log('Access Denied!');
        return res.end('Access Denied!');
    }

    var tmp = [config.appToken, req.query.timestamp, req.query.nonce].sort().join('');
    var signature = crypto.createHash('sha1').update(tmp).digest('hex');
    if (req.query.signature != signature) {
        console.log('Auth failed!');
        return res.end('Auth failed!');
    }

    if (req.query.echostr) {
        return res.end(req.query.echostr); // 验证接口是否正常
    }

    return next();
};

exports.message = function (req, res, next) {
    if (req.method !== 'POST' || req.headers['content-type'] !== 'text/xml') {
        return next();
    }

    req.message = utils.parseXmlMessage(req.body);
    console.log(req.message);

    var reply = {
        toUserName: req.message.fromUserName,
        fromUserName: req.message.toUserName,
        createTime: new Date().getTime()
    };

    res.reply = function (data) {
        res.end(ejs.render(messageTpl, utils.extend(reply, data)));
    };

    next();
};

exports.text = function (req, res, next) {
    if (req.message.msgType !== 'text') return next();

    utils.getWeatherInfo(req.message.content, function (err, content) {
        if (err) return next(err);

        if (!content) {
            return res.reply({msgType: 'text', content: '没有找到您输入的地方！'});
        }

        res.reply({msgType: 'news', content: content});
    });
};

exports.menu = function (req, res, next) {
    if (req.message.msgType === 'event' && req.message.event !== 'CLICK') return next();

    utils.getCity(req, function (err, location) {
        if (err) return next(err);

        utils.getWeatherInfo(location, function (err, content) {
            if (err) return next(err);

            if (!content) {
                return res.reply({msgType: 'text', content: '没有找到您输入的地方！'});
            }

            res.reply({msgType: 'news', content: content});
        });
    });
};

exports.location = function (req, res, next) {
    if (req.message.msgType === 'event' && req.message.event !== 'LOCATION') return next();

    var id = 'user:' + req.message.fromUserName;
    var location = {
        longitude: req.message.longitude,
        latitude: req.message.latitude,
        precision: req.message.precision
    };
    redisClient.hmset(id, location, function (err, _) {
        if (err) return next(new Error('Redis：保存用户位置失败！'));

        utils.getWeatherInfo(location.longitude + ',' + location.latitude, function (err, content) {
            if (err) return next(err);

            if (!content) {
                return res.reply({msgType: 'text', content: '没有找到您输入的地方！'});
            }

            res.reply({msgType: 'news', content: content});
        });
    });
};

exports.subscribe = function (req, res, next) {
    if (req.message.msgType === 'event' && req.message.event !== 'subscribe') return next();

    var id = 'user:' + req.message.fromUserName;
    var user = {id: req.message.fromUserName, followTime: req.message.createTime};
    redisClient.hmset(id, user, function (err, _) {
        if (err) return next(new Error('Redis：保存关注用户失败！'));
        res.reply({msgType: 'text', content: '感谢订阅，您可以点击菜单查看城市天气或者在聊天框输入您要看的城市！'});
    });
};

exports.unsubscribe = function (req, res, next) {
    if (req.message.msgType === 'event' && req.message.event !== 'unsubscribe') return next();

    var id = 'user:' + req.message.fromUserName;
    var user = {unsubscribe: new Date()};
    redisClient.hmset(id, user, function (err, _) {
        if (err) return next(new Error('Redis：保存关注用户失败！'));
    });
};

exports.error = function (err, req, res, next) {
    console.log(err);
    res.end('');
};

exports.log = function (req, res) {
    res.reply({msgType: 'text', content: util.inspect(req.message)});
};