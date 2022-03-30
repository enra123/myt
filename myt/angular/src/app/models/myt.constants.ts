import {Myt, MytCard} from './myt.models'

export const badgeColors: string[] = [
  'gold',
  'orange',
  'green-dark',
  'pink',
  'red',
  'teal',
  'blue-dark',
  'purple'
]
export const rippleColor: string = '#aeb1bb'
export const sliderTextColor: string = '#8b92a9'
export const legions: string[] = [
  'kakul-saydon',
  'akkan',
  'thaemine',
  'brelshaza',
  'vykas',
  'valtan'
]
export const days: string[] = [
  '수',
  '목',
  '금',
  '토',
  '일',
  '월',
  '화'
]
export const difficulties: string[] = [
  '노',
  '하',
  '헬'
]
export const classKRMap = new Map<string, string>([
  [ "아르카나", 'arcana' ],
  [ "바드", 'bard' ],
  [ "배틀마스터", 'battle-master' ],
  [ "버서커", 'berserker' ],
  [ "블레이드", 'blade' ],
  [ "블래스터", 'blaster' ],
  [ "도화가", 'brush'],
  [ "데빌헌터", 'demon-hunter' ],
  [ "데모닉", 'demonic' ],
  [ "디스트로이어", 'destroyer' ],
  [ "건슬링어", 'gunsl' ],
  [ "호크아이", 'hawk-eye' ],
  [ "인파이터", 'in-fighter' ],
  [ "창술사", 'lancer' ],
  [ "홀리나이트", 'paladin' ],
  [ "리퍼", 'reaper' ],
  [ "스카우터", 'scouter' ],
  [ "소서리스", 'sorceress' ],
  [ "기공사", 'soul-fist' ],
  [ "스트라이커", 'striker' ],
  [ "서머너", 'summoner' ],
  [ "워로드", 'warlord' ],
])
export const defaultMyt: Myt = <Myt>{
  character: '',
  level: 0,
  account: 0,
  role: '',
  color: '',
}
export const defaultMytCard = <MytCard>{
  name: 'myt-card-list-0',
  legion: 'kakul-saydon',
  day: '수',
  difficulty: '노',
  times: [18, 18],
  myts: []
}
