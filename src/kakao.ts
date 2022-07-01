const MSG_ADD_ALARM = "/알람등록";
const MSG_LIST_ALARM = "/알람목록";
const MSG_FIND_USER = "/유저";
const MSG_COMMANDS = "/명령어";
const MSG_TEST = "/테스트";
const MSG_TODAY_ISLAND = "/오늘모험섬";
const MSG_FORTUNE = "/운세";
const MSG_CHAT = ["/대화", "별빛"];
const FortuneSet = new Set();
let timeStamp = new Date();

String.prototype.format = function (...args: any[]) {
  return this.replace(/{([0-9]+)}/g, function (match, index) {
    return typeof args[index] === "undefined" ? match : args[index];
  });
};

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

    if (msg.indexOf(MSG_TEST) === 0) {
      replier.reply(`${sender}님:${msg.replace(MSG_TEST, "")}`);
      return;
    }

    if (msg === MSG_TODAY_ISLAND) {
      const response = org.jsoup.Jsoup.connect("http://152.70.248.4:5000/adventureisland/")
        .ignoreContentType(true)
        .ignoreHttpErrors(true)
        .get()
        .text();

      const { Island, IslandDate }: IslandResponse = JSON.parse(response);

      let message = "🏝 오늘의 모험섬이에요.";
      message += "\n";
      message += "\n시작시간 : " + IslandDate.replace("시작", "").split(" ")[1];
      message += "\n";
      Island.forEach(({ Name, Reward }) => {
        let icon: string;
        if (Reward.includes("실링")) {
          icon = "💲";
        } else if (Reward.includes("카드")) {
          icon = "🃏";
        } else if (Reward.includes("골드")) {
          icon = "💰";
        } else {
          icon = "⛵";
        }
        message += `\n- ${Name} (${icon} ${Reward})`;
      });

      replier.reply(message);
      return;
    }

    if (msg.indexOf(MSG_FIND_USER) === 0) {
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

      const response: string = org.jsoup.Jsoup.connect(
        "http://starlight.cafe24app.com/api/bot/fortune",
      )
        .ignoreContentType(true)
        .ignoreHttpErrors(true)
        .get()
        .text();

      let parsedSender = sender.split("/")[0].trim();

      if (parsedSender.length > 2) {
        parsedSender = parsedSender.substring(-2);
      }

      const message = `🔮 ${response.format(parsedSender)}`;
      replier.reply(message);
      FortuneSet.add(sender);
      return;
    }

    if (MSG_CHAT.some((item) => msg.indexOf(item) === 0)) {
      const keyword = MSG_CHAT.find((item) => msg.indexOf(item) === 0);
      const parsedSender = sender.split("/")[0].trim();
      const parsedMsg = msg.replace(keyword, "");

      if (!parsedMsg.length) {
        replier.reply("네? 왜 말을 안하세용");
        return;
      }

      const response = org.jsoup.Jsoup.connect("http://starlight.cafe24app.com/api/bot/chat")
        .ignoreContentType(true)
        .ignoreHttpErrors(true)
        .data("msg", parsedMsg)
        .data("sender", parsedSender)
        .get()
        .text();

      if (response === "Bad Request") {
        replier.reply("이런말 몰라요 ㅠㅠ");
        return;
      }
      replier.reply(response);
    }
  } catch (err) {
    Log.i(err);
  }
}

export {};
