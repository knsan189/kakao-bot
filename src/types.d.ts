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

type Mode = "ok" | "register";

interface IslandResponse {
  Island: { Name: string; Reward: string }[];
  IslandDate: string;
}

interface String {
  format: (...args: any) => string;
}
