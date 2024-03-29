import { Component, Input, OnInit } from '@angular/core';

import { Myt } from '../../models/myt.models';
import { classKRMap, defaultMyt } from '../../core/myt.constants';


@Component({
  selector: 'myt',
  templateUrl: './myt-badge.component.html',
  styleUrls: ['./myt-badge.component.scss']
})
export class MytBadgeComponent implements OnInit {
  @Input() myt: Myt = defaultMyt
  @Input() size = 'normal'

  constructor() { }

  ngOnInit(): void {
  }

  getClassNameFromRoleKR(): string {
    return classKRMap[this.myt.role] as string
  }

}
