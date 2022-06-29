/*
 * room - 채팅이 수신된 채팅방의 방 이름. 1:1채팅방이라면 채팅을 보낸 사람의 닉네임
 * msg - 수신된 채팅 내용
 * sender - 채팅을 보낸 사람의 닉네임
 * isGroupChat - 단체채팅방이면 true, 1:1 채팅방이면 false
 * replier - 채팅방에 응답을 보낼 때 사용하는 객체
   - .reply(String msg); - 채팅이 수신된 채팅방으로 응답 전송 
   - .reply(String room, String msg); - 해당 채팅방으로 응답 전송 
   - .reply(String room, String msg, String packageName); - 해당 메신저 앱의 해당 채팅방으로 응답 전송
   - .replier.replyDelayed(String msg, long ms); - ms 밀리초 뒤에 채팅이 수신된 채팅방으로 응답 전송 
   - .replier.replyDelayed(String room, String msg, long ms); - ms 밀리초 뒤에 해당 채팅방으로 응답 전송 
   - .replier.markAsRead(); - 채팅이 수신된 채팅방에 응답을 보내지 않고 읽음으로 처리
   - .replier.markAsRead(String room); - 해당 채팅방에 응답을 보내지 않고 읽음으로 처리
   - .replier.markAsRead(String room, String packageName); - 해당 앱의 해당 채팅방에 응답을 보내지 않고 읽음으로 처리
 * imageDB - 이미지 정보가 담겨 있는 객체
   - .getProfileImage(); - 채팅을 보낸 사람의 프로필 사진을 Base64로 인코딩된 문자열로 가지고 옴
   - .getProfileImageBitmap(); - 채팅을 보낸 사람의 프로필 사진을 android.graphics.Bitmap 인스턴스로 가지고 옴
   - .getProfileBitmap(); - imageDB.getProfileImageBitmap();과 동일
   - .getProfileHash(); - 채팅을 보낸 사람의 프로필 사진을 Base64로 인코딩된 문자열에 java.lang.String.hashCode(); 메서드를 실행한 결과를 가지고 옴
   - .getImage(); - 사진이 수신된 경우, 해당 사진을 Base64로 인코딩된 문자열로 가지고 옴
   - .getImageBitmap(); - 사진이 수신된 경우, 해당 사진을 android.graphics.Bitmap 인스턴스로 가지고 옴
 * packageName - 채팅이 수신된 앱의 패키지명
 * isMultiChat - 듀얼 메신저 등으로 복제된 앱이라면 true, 아니라면 false. 배포 중인 버전에는 아직 미구현
 */

var MSG_ADD_ALARM = "/알람등록";
var MSG_LIST_ALARM = "/알람목록";
var MSG_FIND_USER = "/유저";
var MSG_COMMANDS = "/명령어";
var MSG_TEST = "/테스트";
var MSG_TODAY_ISLAND = "/오늘모험섬";
var MSG_FORTUNE = "/운세";
var MSG_CHAT = "/대화";
var FortuneSet = new Set();
var timeStamp = new Date();

function response(
  room,
  msg,
  sender,
  isGroupChat,
  replier,
  ImageDB,
  packageName,
  isMultiChat
) {
  if (msg === MSG_COMMANDS) {
    var message =
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
    var response = org.jsoup.Jsoup.connect(
      "http://152.70.248.4:5000/adventureisland/"
    )
      .ignoreContentType(true)
      .ignoreHttpErrors(true)
      .get()
      .text();

    var { Island, IslandDate } = JSON.parse(response);
    var message = "🧭 오늘의 모험섬";
    message += "\n" + IslandDate;
    Island.forEach((item) => {
      message += "\n " + item.Name + " - " + item.Reward;
    });
    replier.reply(message);
    return;
  }

  if (msg.includes(MSG_FIND_USER)) {
    var nickname = msg.replace(MSG_FIND_USER, "").replace(/\s/g, "");
    var response = org.jsoup.Jsoup.connect(
      "http://starlight.cafe24app.com/api/proxy2"
    )
      .data("nickname", nickname)
      .ignoreContentType(true)
      .ignoreHttpErrors(true)
      .get()
      .text();

    if (response === "not found") {
      replier.reply("❌ 존재하지 않은 캐릭터명입니다");
      return;
    }

    var {
      charLevel,
      charClass,
      itemLevel,
      serverName,
      guildName,
      equipments,
      abilities,
      engraves,
    } = JSON.parse(response);

    var message = "📃 " + nickname;

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
      replier.reply(
        "📢 운세 기능은 하루에 한번만 가능해요. 내일 다시 해주세요."
      );
      return;
    }

    var response = org.jsoup.Jsoup.connect(
      "http://starlight.cafe24app.com/api/bot/fortune"
    )
      .ignoreContentType(true)
      .ignoreHttpErrors(true)
      .get()
      .text();

    var parsedSender = sender.split("/")[0].trim();
    var message = `🔮 ${parsedSender}님의 로아 운세`;
    message += "\n";
    message += "\n " + `"${response}"`;

    replier.reply(message);
    FortuneSet.add(sender);
    return;
  }

  if (msg.indexOf(MSG_CHAT) === 0) {
    var parsedSender = sender.split("/")[0].trim();
    var response = org.jsoup.Jsoup.connect(
      "http://starlight.cafe24app.com/api/bot/chat"
    )
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
