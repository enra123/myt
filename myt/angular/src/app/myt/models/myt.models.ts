export interface Myt {
  character: string;
  level: number;
  account: number;
  role: string;
  color?: string;
}

export interface MytCard {
  name: string;
  legion: string;
  day: string;
  difficulty: string;
  times: number[];
  pinned: boolean;
  myts: Myt[];
}

export interface MytMessage {
  name: string;
  action: string;
  target: string;
  value: any;
}

export interface WsMessage {
  type: string;
  content: string;
}


