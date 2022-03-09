import {Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { NzMarks } from 'ng-zorro-antd/slider';

import { Myt, MytCard, MytMessage } from "../../models/myt.models";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { MytMessageService } from '../../services/shared.service';

@Component({
  selector: 'myt-card',
  templateUrl: './myt-card.component.html',
  styleUrls: ['./myt-card.component.scss']
})
export class MytCardComponent implements OnInit {
  @Output() mytOnDrop = new EventEmitter();
  @Input() mytCard: MytCard;
  private sliderTextColor: string = '#8b92a9';
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
    // TODO: fix dirty work around with drag-drop item(element is correct) index(but previousIndex is wrong) bug(?).
    const droppedMytText = event.item.element.nativeElement.innerText.split('\n').pop();
    const droppedMyt = event.previousContainer.data.find(d => {
      return d.character === droppedMytText
    });
    if (droppedMyt === undefined) {
      throw new TypeError();
    }
    // delete out of drop zone myt
    if (event.previousContainer.id === event.container.id && !event.isPointerOverContainer) {
      this.mytCard.myts = this.mytCard.myts.filter(myt => myt.character !== droppedMyt.character);
      this.mytMessageService.sendMessage(<MytMessage>{
        name: this.mytCard.name,
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

  protected setTimeSliderMarksDefault() {
    this.marks = {
      12: {
        style: {
          color: this.sliderTextColor
        },
        label: '12pm'
      },
      18: {
        style: {
          color: this.sliderTextColor
        },
        label: '6pm'
      },
      24: {
        style: {
          color: this.sliderTextColor
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
          color: this.sliderTextColor,
          fontSize: '0.8em'
        },
        label: (i - 12).toString()
      };
    }
  }

  protected cardValueOnChange(target: string, value: any) {
    this.mytMessageService.sendMessage(<MytMessage>{
      name: this.mytCard.name,
      action: 'edit',
      target: target,
      value: value
    })
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
    this.cardValueOnChange('legion', this.mytCard.legion);
  }

  showNextLegion(): void {
    this.legionIndexSelected = this.legionIndexSelected + 1;
    if (this.legionIndexSelected >= this.legions.length) {
      this.legionIndexSelected = 0;
    }
    this.mytCard.legion = this.legions[this.legionIndexSelected];
    this.cardValueOnChange('legion', this.mytCard.legion);
  }

  dayOnChange() {
    this.cardValueOnChange('day', this.mytCard.day);
  }

  difficultyOnChange() {
    this.cardValueOnChange('difficulty', this.mytCard.difficulty);
  }

  sliderOnChange(value: number[] | number): void {
    if (typeof(value) === 'number') {
      return;
    }
    this.cardValueOnChange('times', this.mytCard.times);
  }
}
