var request = require('request');
var redis = require('redis');
var config = require('../config');

var redisClient = redis.createClient();
redisClient.on('error', function (err) {
    throw new Error('Redis服务器连接失败！');
});

exports.redisClient = redisClient;

exports.noop = function () {};

exports.extend = function (obj, obj2) {
    for (var key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            obj[key] =obj2[key];
        }
    }

    return obj;
};

exports.parseXmlMessage = function (xml) {
    var result = {};
    xml.replace(/<xml>|<\/xml>/, '').replace(/<!\[CDATA\[(.*?)\]\]>/ig, '$1').replace(/<(\w+)>(.*?)<\/\1>/g, function (_, key, val) {
        key = key.replace(/(\w)/, function (str) { return str.toLowerCase();});
        result[key] = val;
    });

    return result;
};

exports.getWeatherInfo = function (location, cb) {

    var url = config.weatherApi.replace('{{location}}', location);
    request.get(url, {json: true}, function (err, _, data) {
        if (err) return cb(err);

        if (data.error) {
            return cb(null, null);
        }

        var result = data.results[0];
        var content = [];
        result.weather_data.forEach(function (item) {
            var info = {};
            if (content.length == 0) {
                info.title = result.currentCity + '天气预报';
                info.picurl = item.dayPictureUrl;
                content.push(info);
                content.push({title: [item.weather, item.wind, item.temperature, result.index[0].des].join('，')});
            } else {
                info.title = item.date + ' ' + [item.weather, item.wind, item.temperature].join('，');
                info.picurl = item.dayPictureUrl;
                content.push(info);
            }
        });

        cb(null, content);
    });
};

exports.getCity = function (req, cb) {
    var cityMap = {
        'CITY_BJ': '北京',
        'CITY_SH': '上海',
        'CITY_GZ': '广州',
        'CITY_SZ': '深圳',
        'CITY_CD': '成都'
    };

    if (req.message.eventKey !== 'CITY_CURRENT') {
        return cb(null, cityMap[req.message.eventKey]);
    } else {
        redisClient.hgetall('user:' + req.message.fromUserName, function (err, data) {
            if (err) return cb(err);
            cb(null, data.longitude + ',' + data.latitude);
        });
    }
};
