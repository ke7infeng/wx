//var request = require('request');
//
//request.post('http://127.0.0.1/', function(error, response, body) {
//	console.log(error, response, body);
//}).form({ad: 123});


//var url = require('url');
//
//console.log(url.parse('http://127.9.9.1/', true).query);

//var xml = require('xml2js');
//var s = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[fromUser]]></FromUserName><CreateTime>12345678</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[你好]]></Content></xml>';
//xml.parseString(s, function (err, result) {
//    console.dir(result.xml);
//});


// var xml = require('node-xml-lite');
// var o = xml.parseString(s);
// console.log(xml.parseString("<xml>hello</xml>"));


// var app = require('./app');
// app.test();
// console.log(app, this, '夏天');

//var fs = require('fs');
//var ejs = require('ejs');
//var tpl = fs.readFileSync('message.ejs', 'utf-8');
var data = {
	toUserName: 'gh_adf0dae53950',
  	fromUserName: 'oZAVyt2s2Lim_fpUCM-4eePv4JR4',
  	createTime: '1407491082',
  	msgType: 'text',
  	content: '/::)'
};
//
//
//console.log(ejs.render(tpl, data));

/*var redis = require('redis');

var redisClient = redis.createClient();
redisClient.on("error", function (err) {
    console.log("Error " + err);
});


*//*redisClient.hmset('user:tianxia', {x:123}, function (err, res) {
    console.log(err, res);
});*//*

redisClient.hgetall('user:tianxia', function (err, obj) {
    console.log(err, obj);
});*/

var request = require('request');
var url = 'http://api.map.baidu.com/telematics/v3/weather?location=%E6%B7%B1%E5%9C%B3&output=json&ak=8d1adf74721c74049b3a34cead2af7a0';
request.get(url, {json: true}, function (err, res, body) {
    console.log(body.results[0].currentCity,body.results[0].weather_data[0].weather);
});