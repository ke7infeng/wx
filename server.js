var http = require('http');
var connect = require('connect');
var bodyParser = require('body-parser');
var weixin = require('./lib/weixin');

var app = connect();
app.use(bodyParser.text({type: 'text/xml'}));
app.use(weixin.checkSignature); // 检测收到的请求是否是来自微信
app.use(weixin.message); // 微信消息解析
app.use(weixin.text); // 文本消息处理
app.use(weixin.location); // 地理位置消息处理
app.use(weixin.menu); // 自定义菜单消息处理
app.use(weixin.subscribe); // 关注消息处理
app.use(weixin.unsubscribe); // 取消关注消息处理
app.use(weixin.log); // 日志处理

http.createServer(app).listen(80, function () {
    console.log('Server is running on 80');
});