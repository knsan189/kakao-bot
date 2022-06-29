var Alarm = [];
var KAKAO = "com.kakao.talk";
var flag = false;
var ROOM_NAME = "별빛노을";
var MSG_ADD_ALARM = "/알람등록";
var MSG_LIST_ALARM = "/알람목록";
var MODE = "ok";
var TEMP_ALARM = {
  sender: "",
  title: "",
  time: "",
};

function clearTemp() {
  MODE = "ok";
  TEMP_ALARM = {
    sender: "",
    title: "",
    time: "",
    room: "",
  };
}

function formatTime(time) {
  var hours = time.getHours();
  var minutes = time.getMinutes();
  var ampm = hours >= 12 ? "오후" : "오전";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${ampm} ${hours}시 ${minutes}분`;
}

function response(
  room,
  msg,
  sender,
  isGroupChat,
  replier,
  imageDB,
  packageName
) {
  try {
    if (msg === MSG_LIST_ALARM) {
      if (!Alarm.length) {
        replier.reply(
          "📢 등록된 알람이 없어요 /알람등록 으로 알람을 등록해보세요 :)"
        );
        return;
      }
      var message = "📢 현재 등록된 오늘 알람들 입니다.";
      var sortedAlarm = Alarm.sort(
        (a, b) => new Date(a.time) - new Date(b.time)
      );

      sortedAlarm.forEach((item, index) => {
        message += `\n${index + 1}. ${formatTime(item.time)} - ${item.title}`;
      });
      replier.reply(message);
      return;
    }

    if (msg.indexOf(MSG_ADD_ALARM) === 0) {
      var parsedSender = sender.split("/")[0].trim();
      var title = msg.replace(MSG_ADD_ALARM, "").trim();
      if (!title.length) {
        replier.reply("📢 알람 이름도 적어 주셔야해요 XD");
        return;
      }
      MODE = "register";
      TEMP_ALARM = { sender, title };
      replier.reply(`📢 ${parsedSender}님 ` + "오늘 몇시로 등록할까요?");
      return;
    }

    if (MODE === "register" && sender === TEMP_ALARM.sender) {
      if (!msg.includes("시")) {
        replier.reply("📢 입력이 잘못되었어요. 처음부터 다시 시작해주세용");
        clearTemp();
        return;
      }
      var minute = 0;
      var hour = 0;
      var tempArr = msg.split("시");
      var time = new Date();
      hour = parseInt(tempArr[0], 10);

      if (hour <= 12 && new Date().getHours() >= 12) {
        hour += 12;
      }

      time = new Date(time.setHours(hour));

      if (msg.includes("분")) {
        minute = parseInt(tempArr[1].split("분")[0].trim(), 10);
      }

      time = new Date(time.setMinutes(minute));

      if (time.getTime() < new Date()) {
        replier.reply(
          "📢 현재시간보다 이전시간에는 등록할수 없어요. 시간을 다시 입력해주세요"
        );
        return;
      }

      if (time.getDate() !== new Date().getDate()) {
        replier.reply("📢 오늘 알림만 지원하고 있어요 :)");
        return;
      }

      TEMP_ALARM = {
        sender: TEMP_ALARM.sender,
        title: TEMP_ALARM.title,
        time,
        room,
      };
      Alarm.push(TEMP_ALARM);

      var message = `⏰ 알람명 : ${TEMP_ALARM.title}`;
      message += `\n (${formatTime(time)}) 정상적으로 등록되었습니다. 😊`;
      replier.reply(message);

      clearTemp();
      return;
    }
  } catch (err) {
    Log.i(err);
  }
}

function secondTick() {
  try {
    var realTime = new Date().getTime();
    Alarm.forEach((item, index) => {
      if (item.time.getTime() <= realTime) {
        var message = "[⏰ 알람] ";
        var parsedSender = item.sender.split("/")[0].trim();
        message += item.title;
        message += "\n";
        message += `\n ${parsedSender}님이 등록하셨네요. 😊`;
        Api.replyRoom(item.room, message, KAKAO);
        Alarm.splice(index, 1);
      }
    });
  } catch (err) {
    Log.i(err);
  }
}
