import { Component, Input, OnInit } from '@angular/core';

import { Myt } from "../../models/myt.models";


@Component({
  selector: 'myt',
  templateUrl: './myt.component.html',
  styleUrls: ['./myt.component.scss']
})
export class MytComponent implements OnInit {
  @Input() myt: Myt = <Myt>{
    character: '',
    level: 0,
    account: 0,
    role: '',
    color: '',
  };
  @Input() size: string = 'normal';

  classKRMap = new Map<string, string>([
    [ "아르카나", 'arcana' ],
    [ "바드", 'bard' ],
    [ "배틀마스터", 'battle-master' ],
    [ "버서커", 'berserker' ],
    [ "블레이드", 'blade' ],
    [ "블래스터", 'blaster' ],
    [ "도화가", 'brush'],
    [ "데몬헌터", 'demon-hunter' ],
    [ "데모닉", 'demonic' ],
    [ "디스트로이어", 'destroyer' ],
    [ "건슬링어", 'gunsl' ],
    [ "호크아이", 'hawk-eye' ],
    [ "인파이터", 'in-fighter' ],
    [ "창술사", 'lancer' ],
    [ "홀리나이트", 'paladin' ],
    [ "리퍼", 'reaper' ],
    [ "스카우터", 'scouter' ],
    [ "소서러", 'sorceress' ],
    [ "기공사", 'soul-fist' ],
    [ "스트라이커", 'striker' ],
    [ "서머너", 'summoner' ],
    [ "워로드", 'warlord' ],
  ]);

  constructor() { }

  ngOnInit(): void {
  }

  getClassNameFromRoleKR(): string {
    return <string>this.classKRMap.get(this.myt.role)
  }

}
