import {Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { NzMarks } from 'ng-zorro-antd/slider';

import { Myt, MytCard, MytMessage } from "../../models/myt.models";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { MytMessageService } from '../../services/shared.service';
import { MatSelectChange } from "@angular/material/select";
import { MatButtonToggleChange } from "@angular/material/button-toggle";

@Component({
  selector: 'myt-card',
  templateUrl: './myt-card.component.html',
  styleUrls: ['./myt-card.component.scss']
})
export class MytCardComponent implements OnInit {
  @Output() mytOnDrop = new EventEmitter();
  @Input() mytCard: MytCard;
  legions: string[] = ['kakul-saydon', 'akkan', 'thaemine', 'brelshaza', 'vykas', 'valtan'];
  legionIndexSelected: number = 0;
  days: string[] = ['수', '목', '금', '토', '일', '월', '화']
  difficulties: string[] = ['노', '하', '헬']
  marks: NzMarks;

  constructor(private mytMessageService:MytMessageService) { }

  ngOnInit(): void {
    this.setTimeSliderMarksDefault();
  }

  onDrop(event: CdkDragDrop<Myt[]>) {
    const droppedMyt = event.previousContainer.data[event.previousIndex];
    // delete out of drop zone myt
    if (event.previousContainer.id === event.container.id && !event.isPointerOverContainer) {
      this.mytCard.myts = this.mytCard.myts.filter(myt => myt.character !== droppedMyt.character);
      this.mytMessageService.sendMessage(<MytMessage>{
        name: event.previousContainer.id,
        action: 'delete',
        target: 'myts',
        value: droppedMyt
      })
      return;
    }
    // forbidding duplicated characters in a container
    if (this.mytCard.myts.some(myt => myt.character === droppedMyt.character)) {
      return;
    }
    this.mytOnDrop.emit(event);
  }

  private setTimeSliderMarksDefault() {
    this.marks = {
      12: {
        style: {
          color: '#8b92a9'
        },
        label: '12pm'
      },
      18: {
        style: {
          color: '#8b92a9'
        },
        label: '6pm'
      },
      24: {
        style: {
          color: '#8b92a9'
        },
        label: '12am'
      }
    };
    for (let i = 13; i < 24; i++) {
      if ( i == 18) {
        continue;
      }
      this.marks[i] = {
        style: {
          color: '#8b92a9',
          fontSize: '0.8em'
        },
        label: (i - 12).toString()
      };
    }
  }

  formatLabel(value: number) {
    return value + ':00';
  }

  showPrevLegion(): void {
    this.legionIndexSelected = this.legionIndexSelected - 1;
    if (this.legionIndexSelected < 0) {
      this.legionIndexSelected = this.legions.length - 1;
    }
    this.mytCard.legion = this.legions[this.legionIndexSelected];
    this.mytMessageService.sendMessage(<MytMessage>{
      name: this.mytCard.name,
      action: 'edit',
      target: 'legion',
      value: this.mytCard.legion
    })
  }

  showNextLegion(): void {
    this.legionIndexSelected = this.legionIndexSelected + 1;
    if (this.legionIndexSelected >= this.legions.length) {
      this.legionIndexSelected = 0;
    }
    this.mytCard.legion = this.legions[this.legionIndexSelected];
    this.mytMessageService.sendMessage(<MytMessage>{
      name: this.mytCard.name,
      action: 'edit',
      target: 'legion',
      value: this.mytCard.legion
    })
  }

  dayOnChange(event: MatSelectChange) {
    this.mytMessageService.sendMessage(<MytMessage>{
      name: this.mytCard.name,
      action: 'edit',
      target: 'day',
      value: this.mytCard.day
    })
  }

  difficultyOnChange(event: MatButtonToggleChange) {
    this.mytMessageService.sendMessage(<MytMessage>{
      name: this.mytCard.name,
      action: 'edit',
      target: 'difficulty',
      value: this.mytCard.difficulty
    })
  }

  sliderOnChange(value: number[] | number): void {
    if (typeof(value) === 'number') {
      return;
    }
    this.mytMessageService.sendMessage(<MytMessage>{
      name: this.mytCard.name,
      action: 'edit',
      target: 'times',
      value: this.mytCard.times
    })
  }
}
