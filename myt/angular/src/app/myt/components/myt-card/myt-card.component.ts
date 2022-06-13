import {Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { NzMarks } from 'ng-zorro-antd/slider';

import { Myt, MytCard } from "../../models/myt.models";
import { sliderTextColor, legions, days, difficulties } from "../../core/myt.constants";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { MytDragDropService, MytMessageService } from '../../services/myt.service';

@Component({
  selector: 'myt-card',
  templateUrl: './myt-card.component.html',
  styleUrls: ['./myt-card.component.scss']
})
export class MytCardComponent implements OnInit {
  @Input() mytCard: MytCard
  legions: string[] = legions
  legionIndexSelected: number = 0
  days: string[] = days
  difficulties: string[] = difficulties
  marks: NzMarks

  constructor(private mytMessageService: MytMessageService,
              private mytDragDropService: MytDragDropService) { }

  ngOnInit(): void {
    this.setTimeSliderMarksDefault();
  }

  onDrop(event: CdkDragDrop<Myt[]>) {
    this.mytDragDropService.onDrop(event)
  }

  protected setTimeSliderMarksDefault() {
    this.marks = {
      12: {
        style: {
          color: sliderTextColor
        },
        label: '12pm'
      },
      18: {
        style: {
          color: sliderTextColor
        },
        label: '6pm'
      },
      24: {
        style: {
          color: sliderTextColor
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
          color: sliderTextColor,
          fontSize: '0.8em'
        },
        label: (i - 12).toString()
      };
    }
  }

  protected cardValueOnChange(target: string, value: any) {
    this.mytMessageService.sendMessage({
      name: this.mytCard.name,
      action: 'edit',
      target: target,
      value: value
    });
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
