var http = require('http');
var connect = require('connect');
var bodyParser = require('body-parser');
var weixin = require('./lib/weixin');

var app = connect();
app.use(bodyParser.text({type: 'text/xml'}));
app.use(weixin.checkSignature); // 检测收到的请求是否是来自微信text
app.use(weixin.message);
app.use(weixin.text);
app.use(weixin.location);
app.use(weixin.menu);
app.use(weixin.subscribe);
app.use(weixin.unsubscribe);
app.use(weixin.log);

http.createServer(app).listen(80, function () {
    console.log('Server is running on 80');
});