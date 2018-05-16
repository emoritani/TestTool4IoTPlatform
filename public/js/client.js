$(document).ready(function() {
  // メッセージのクリア処理
  hideAllMsg();

  // stopボタンの無効化
  var stopButton = false;
  enableStartButton();

  var client = null; // MQTTクライアント
  var msg = ""; // MQTTメッセージ
  var logMsg = ""; // ログメッセージ

  // Startボタンをクリックした場合
  $("#str-btn").click(function(e) {
    stopButton = false;
    showSendingMsg();
    enableStopButton();

    // フォームの値を取得
    var orgId = $("#orgIdBox").val();
    var deviceType = $("#deviceTypeBox").val();
    var deviceId = $("#deviceIdBox").val();
    var token = $("#tokenBox").val();
    msg = $("#msgBox").val();

    logMsg = "orgId: " + orgId +
             ", deviceType: " + deviceType +
             ", deviceId: " + deviceId +
             ", token: " + token;
    appendLogMsg(logMsg);

    // ポート番号の取得（443 or 8883）
    var portNumber = Number($('#ports [name=port]:checked').val());

    // ここからサーバー接続処理
    // clientIdの形式は d:<org-id>:<type-id>:<device-id>
    var clientId = 'd:' + orgId + ':' + deviceType + ':' + deviceId;
    var hostName = orgId + '.messaging.internetofthings.ibmcloud.com';
    client = new Paho.MQTT.Client(hostName, portNumber, clientId);

    // MQTT接続オプションの設定
    var options = {
      timeout: 30, // Connection attempt timeout in seconds
      userName: 'use-token-auth',
      password: token,
      useSSL: true,
      keepAliveInterval: 120,
      onSuccess: successOnMQTT,
      onFailure: failureOnMQTT
    };

    // MQTT接続の実施
    client.connect(options);
    // ここまでサーバー接続処理

    return e.preventDefault();
  });

  // Stopボタンをクリックした場合
  $("#stp-btn").click(function(e) {
    stopButton = true;
    showStoppedMsg();
    enableStartButton();
  });

  // MQTT接続成功時の処理
  function successOnMQTT() {
    _connected = true;
    var timestamp = createTimestamp();
    var logMsg = 'Successfully connected to the IBM IoT broker:' + timestamp
    appendLogMsg(logMsg);

    var count = 0;
    var sendMsg = function() {
      // ここからがメッセージpublish処理
      timestamp = createTimestamp();
      var mqttMsg = new Paho.MQTT.Message(timestamp + ":" + msg);
      mqttMsg.destinationName = "iot-2/evt/myevent/fmt/txt";
      client.send(mqttMsg);
      logMsg = "[" + count +"] Success fully send message to the IBM IoT broker: " + timestamp + ":" + msg
      appendLogMsg(logMsg);

      //ここまでがメッセージpublish処理
      count++;
    }

    // ここからがタイマー処理
    var id = setInterval(function() {
      sendMsg();
      if(stopButton){
        logMsg = "stopボタンが押されました";
        appendLogMsg(logMsg);
        clearInterval(id);　
      }}, 1000);
      //ここまでがタイマー処理
  };

  // MQTT接続エラー時の処理
  function failureOnMQTT(message) {
    _connected = false;
    logMsg = 'Error connecting to the IBM IoT broker: ' + JSON.stringify(message);
    appendLogMsg(logMsg);
  };

  // 送信開始メッセージの表示
  function showSendingMsg() {
    $("#stopped").hide();
    $("#sending").show();
  };

  // 送信停止メッセージの表示
  function showStoppedMsg() {
    $("#stopped").show();
    $("#sending").hide();
  };

  // 送信開始/停止メッセージを隠蔽
  function hideAllMsg() {
    $("#stopped").hide();
    $("#sending").hide();
  };

  // Startボタンの有効化/Stopボタンの無効化
  function enableStartButton() {
    $("#str-btn").attr('disabled', false);
    $("#stp-btn").attr('disabled', true);
  };

  // Startボタンの無効化/Stopボタンの有効化
  function enableStopButton() {
    $("#str-btn").attr('disabled', true);
    $("#stp-btn").attr('disabled', false);
  };

  // Timestampの作成
  function createTimestamp() {
    var d = new Date();
    var year  = d.getFullYear();
    var month = d.getMonth() + 1;
    var day   = d.getDate();
    var hour  = ( d.getHours()   < 10 ) ? '0' + d.getHours()   : d.getHours();
    var min   = ( d.getMinutes() < 10 ) ? '0' + d.getMinutes() : d.getMinutes();
    var sec   = ( d.getSeconds() < 10 ) ? '0' + d.getSeconds() : d.getSeconds();
    var timestamp = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;

    return timestamp;
  };

  // ログを画面に表示
  function appendLogMsg(msg) {
    console.log(msg);
    $("#sMsg").prepend(msg + "<br>");
  }
});
