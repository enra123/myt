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
  myts: Myt[];
}

export interface MytMessage {
  name: string;
  action: string;
  target: string;
  value: any;
}


