import {Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';

import { NzMarks } from 'ng-zorro-antd/slider';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

import { Myt, MytCard } from '../../models/myt.models';
import { sliderTextColor, legions, days, difficulties } from '../../core/myt.constants';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MytDragDropService, MytMessageService } from '../../services/myt.service';


@Component({
  selector: 'myt-card',
  templateUrl: './myt-card.component.html',
  styleUrls: ['./myt-card.component.scss']
})
export class MytCardComponent implements OnInit {
  @Input() mytCard: MytCard
  @ViewChild('messageInput', {static: true})
  messageInput: ElementRef
  legions: string[] = legions
  oldMessage = ''
  customLegionChange = new Subject<string>()
  debounceDueTime = 1000
  legionIndexSelected = 0
  days: string[] = days
  difficulties: string[] = difficulties
  marks: NzMarks

  constructor(private mytMessageService: MytMessageService,
              private mytDragDropService: MytDragDropService) {}

  ngOnInit(): void {
    this.setTimeSliderMarksDefault()
    this.updateMessageDisplay()

    // ngModelOnChange not working as expected with korean input (not detecting character in 'building')
    // thus, natively binding keyup event of the textarea el and watching it changing with debounce time
    fromEvent(this.messageInput.nativeElement, 'keyup').pipe(
      filter(Boolean),
      debounceTime(this.debounceDueTime),
      distinctUntilChanged()
    ).subscribe(e => {
      this.mytCard.message = this.messageInput.nativeElement.value
      this.cardValueOnChange('message', this.mytCard.message)
    });
  }

  ngDoCheck() {
    this.updateMessageDisplay()
  }

  onDrop(event: CdkDragDrop<Myt[]>) {
    this.mytDragDropService.onDrop(event)
  }

  // this.mytCard.message ngModel was not bound to textarea (see the comment in [ngOnInit])
  // Manually checking it and updating it every ng cycle
  protected updateMessageDisplay() {
    if (this.oldMessage === this.mytCard.message) { return }

    this.messageInput.nativeElement.value = this.mytCard.message
    this.oldMessage = this.mytCard.message
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
      if ( i === 18) {
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
      target,
      value
    });
  }

  formatLabel(value: number) {
    return value + ':00';
  }

  pinUnpinCardOnClick(): void {
    this.mytCard.pinned = !this.mytCard.pinned
    this.cardValueOnChange('pinned', this.mytCard.pinned);
  }

  changeLegion(direction: number): void {
    this.legionIndexSelected = this.legionIndexSelected + direction;
    console.log(this.legionIndexSelected)
    if (this.legionIndexSelected < 0) {
      this.legionIndexSelected = this.legions.length - 1
    } else if (this.legionIndexSelected >= this.legions.length) {
      this.legionIndexSelected = 0
    }
    this.mytCard.legion = this.legions[this.legionIndexSelected]

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
