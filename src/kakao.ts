const MSG_ADD_ALARM = "/알람등록";
const MSG_LIST_ALARM = "/알람목록";
const MSG_FIND_USER = "/유저";
const MSG_COMMANDS = "/명령어";
const MSG_TEST = "/테스트";
const MSG_TODAY_ISLAND = "/오늘모험섬";
const MSG_FORTUNE = "/운세";
const MSG_CHAT = "/대화";
const FortuneSet = new Set();
let timeStamp = new Date();

function response(
  room: string,
  msg: string,
  sender: string,
  isGroupChat: boolean,
  replier: any,
  imageDB: string,
  packageName: string,
) {
  if (msg === MSG_COMMANDS) {
    const message =
      "⌨ 현재 사용 가능한 명령어는" +
      `\n 1. ${MSG_FIND_USER} 닉네임` +
      "\n - 유저정보를 가지고 옵니다." +
      `\n 2. ${MSG_FORTUNE}` +
      "\n - 오늘 나의 게임 운을 확인해 볼수 있어요." +
      `\n 3. ${MSG_COMMANDS}` +
      "\n - 전체 명령어를 확인합니다." +
      `\n 4. ${MSG_TODAY_ISLAND}` +
      "\n - 오늘 모험섬과 보상물을 확인합니다." +
      `\n 5. ${MSG_TEST}` +
      "\n - 입력한 채팅을 따라합니다." +
      `\n 6. ${MSG_CHAT}` +
      "\n - AI 봇인 저와 대화할 수 있어요!" +
      `\n 7. ${MSG_LIST_ALARM}` +
      "\n - 현재 채팅방에 등록되어있는 모든 알람을 확인해보실 수 있어요." +
      `\n 7. ${MSG_ADD_ALARM}` +
      "\n - 명령어를 치시게 되면 제가 몇시에 등록할지 물어보게 되요. 그때 '7시 30분', '10시' 와 같이 입력을 한번더 입력해주시면 등록 완료됩니다." +
      "\n ※ '시', '분'을 빼먹으면 제가 이해를 못해요. 😪 꼭 넣어주셔야 해요. 제가 빨리 똑똑해질게요 !" +
      `\n` +
      `\n 📌 주의사항` +
      `\n 너무 자주 쓰시면 카카오에서 절 쫓아낼수도 있어요. 😪`;
    replier.reply(message);
    return;
  }

  if (msg.includes(MSG_TEST)) {
    replier.reply(`${sender}님:${msg.replace(MSG_TEST, "")}`);
    return;
  }

  if (msg === MSG_TODAY_ISLAND) {
    const response = org.jsoup.Jsoup.connect("http://152.70.248.4:5000/adventureisland/")
      .ignoreContentType(true)
      .ignoreHttpErrors(true)
      .get()
      .text();

    const { Island, IslandDate } = JSON.parse(response);
    let message = "🧭 오늘의 모험섬";
    message += "\n" + IslandDate;
    Island.forEach((item) => {
      message += "\n " + item.Name + " - " + item.Reward;
    });
    replier.reply(message);
    return;
  }

  if (msg.includes(MSG_FIND_USER)) {
    const nickname = msg.replace(MSG_FIND_USER, "").replace(/\s/g, "");
    const response = org.jsoup.Jsoup.connect("http://starlight.cafe24app.com/api/proxy2")
      .data("nickname", nickname)
      .ignoreContentType(true)
      .ignoreHttpErrors(true)
      .get()
      .text();

    if (response === "not found") {
      replier.reply("❌ 존재하지 않은 캐릭터명입니다");
      return;
    }

    const {
      charLevel,
      charClass,
      itemLevel,
      serverName,
      guildName,
      equipments,
      abilities,
      engraves,
    } = JSON.parse(response);

    let message = "📃 " + nickname;

    message += "\n";
    message += `\n@${serverName} / ${guildName}`;
    message += `\n${charClass} 💎 Lv ${itemLevel} (${charLevel})`;
    message += "\n";
    message += `\n⚡ [각인]`;
    engraves.forEach((item) => {
      message += `\n ${item}`;
    });
    message += "\n";
    message += "\n🎲 [특성]";
    abilities.forEach((item, index) => {
      if (index % 4 === 0) {
        message += "\n";
      }
      message += `${item} `;
    });
    message += "\n";
    message += `\n⚔ [장비]`;
    equipments.forEach((item) => {
      message += `\n ${item}`;
    });

    replier.reply(message);
    return;
  }

  if (msg === MSG_FORTUNE) {
    if (timeStamp.getDate() !== new Date().getDate()) {
      FortuneSet.clear();
      timeStamp = new Date();
    }

    if (FortuneSet.has(sender)) {
      replier.reply("📢 운세 기능은 하루에 한번만 가능해요. 내일 다시 해주세요.");
      return;
    }

    const response = org.jsoup.Jsoup.connect("http://starlight.cafe24app.com/api/bot/fortune")
      .ignoreContentType(true)
      .ignoreHttpErrors(true)
      .get()
      .text();

    const parsedSender = sender.split("/")[0].trim();
    let message = `🔮 ${parsedSender}님의 로아 운세`;
    message += "\n";
    message += "\n " + `"${response}"`;

    replier.reply(message);
    FortuneSet.add(sender);
    return;
  }

  if (msg.indexOf(MSG_CHAT) === 0) {
    const parsedSender = sender.split("/")[0].trim();
    const response = org.jsoup.Jsoup.connect("http://starlight.cafe24app.com/api/bot/chat")
      .ignoreContentType(true)
      .ignoreHttpErrors(true)
      .data("msg", msg.replace(MSG_CHAT, ""))
      .data("sender", parsedSender)
      .get()
      .text();

    if (response === "Bad Request") {
      replier.reply("이런말 몰라요 ㅠㅠ");
    }
    replier.reply(response);
  }
}

export {};
