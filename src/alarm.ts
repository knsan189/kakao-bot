const Alarms: Alarm[] = [];
const KAKAO = "com.kakao.talk";
const MSG_ADD_ALARM = "/알람등록";
const MSG_LIST_ALARM = "/알람목록";
let MODE: Mode = "ok";
let TEMP_ALARM: Alarm = {
  sender: "",
  title: "",
  time: undefined,
};

function clearTempAlarm() {
  MODE = "ok";
  TEMP_ALARM = {
    sender: "",
    title: "",
    time: undefined,
    room: "",
  };
}

function getFormattedTime(time: Date): string {
  let hours = time.getHours();
  const minutes = time.getMinutes();
  const ampm = hours >= 12 ? "오후" : "오전";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${ampm} ${hours}시 ${minutes}분`;
}

function response(
  room: string,
  msg: string,
  sender: string,
  isGroupChat: boolean,
  replier: any,
  imageDB: string,
  packageName: string,
) {
  try {
    if (msg === MSG_LIST_ALARM) {
      if (!Alarms.length) {
        replier.reply("📢 등록된 알람이 없어요 /알람등록 으로 알람을 등록해보세요 :)");
        return;
      }
      let message = "📢 현재 등록된 오늘 알람들 입니다.";
      const sortedAlarm = Alarms.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      );

      sortedAlarm.forEach((item, index) => {
        message += `\n${index + 1}. ${getFormattedTime(item.time)} - ${item.title}`;
      });
      replier.reply(message);
      return;
    }

    if (msg.indexOf(MSG_ADD_ALARM) === 0) {
      const parsedSender = sender.split("/")[0].trim();
      const title = msg.replace(MSG_ADD_ALARM, "").trim();
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
        clearTempAlarm();
        return;
      }

      let minute = 0;
      let hour = 0;
      let time = new Date();
      const tempArr = msg.split("시");
      const currentTime = new Date();
      hour = parseInt(tempArr[0], 10);

      if (hour < 12 && currentTime.getHours() >= 12) {
        hour += 12;
      }

      time = new Date(time.setHours(hour));

      if (msg.includes("분")) {
        minute = parseInt(tempArr[1].split("분")[0].trim(), 10);
      }

      time = new Date(time.setMinutes(minute));

      if (time.getTime() < currentTime.getTime()) {
        replier.reply("📢 현재시간보다 이전시간에는 등록할수 없어요. 시간을 다시 입력해주세요");
        return;
      }

      if (time.getDate() !== currentTime.getDate()) {
        replier.reply("📢 오늘 알림만 지원하고 있어요 :)");
        return;
      }

      TEMP_ALARM = {
        sender: TEMP_ALARM.sender,
        title: TEMP_ALARM.title,
        time,
        room,
      };

      Alarms.push(TEMP_ALARM);

      let message = `⏰ 알람명 : ${TEMP_ALARM.title}`;
      message += `\n (${getFormattedTime(time)}) 정상적으로 등록되었습니다. 😊`;
      replier.reply(message);
      clearTempAlarm();
      return;
    }
  } catch (err) {
    Log.i(err);
  }
}

function secondTick() {
  try {
    const realTime = new Date().getTime();
    Alarms.forEach((item, index) => {
      if (item.time.getTime() <= realTime) {
        const parsedSender = item.sender.split("/")[0].trim();
        let message = "[⏰ 알람] ";
        message += item.title;
        message += "\n";
        message += `\n ${parsedSender}님이 등록하셨네요. 😊`;
        Api.replyRoom(item.room, message, KAKAO);
        Alarms.splice(index, 1);
      }
    });
  } catch (err) {
    Log.i(err);
  }
}
