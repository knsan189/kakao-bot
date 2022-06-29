declare const org: any;
declare const Log: {
  i: (err?: any) => void;
};

declare const Api: {
  replyRoom: (roomName: string, message: string, packageName: string) => void;
};

interface Alarm {
  room?: string;
  sender: string;
  title: string;
  time?: Date;
}

type MessageResponse = (
  room: string,
  msg: string,
  sender,
  isGroupChat,
  replier,
  ImageDB,
  packageName,
  isMultiChat,
) => void;

type Mode = "ok" | "register";
