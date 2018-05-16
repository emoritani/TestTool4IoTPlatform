/*eslint-env node*/
var express = require('express');
var cfenv = require('cfenv');

// サーバーの作成
var app = express();

// 静的コンテンツ配置用ディレクトリの設定
app.use(express.static(__dirname + '/public'));

// Cloud Foundryアプリケーション用変数の取得
var appEnv = cfenv.getAppEnv();

// サーバーの起動
app.listen(appEnv.port, '0.0.0.0', function() {
  console.log("server starting on " + appEnv.url);
});
