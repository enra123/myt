import { Component, Input, OnInit } from '@angular/core';

import { Myt } from "../../models/myt.models";
import { classKRMap, defaultMyt } from "../../core/myt.constants";


@Component({
  selector: 'myt',
  templateUrl: './myt.component.html',
  styleUrls: ['./myt.component.scss']
})
export class MytComponent implements OnInit {
  @Input() myt: Myt = defaultMyt
  @Input() size: string = 'normal'

  constructor() { }

  ngOnInit(): void {
  }

  getClassNameFromRoleKR(): string {
    return <string>classKRMap[this.myt.role]
  }

}
