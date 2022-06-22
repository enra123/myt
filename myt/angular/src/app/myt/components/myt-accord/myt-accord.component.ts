import {Component, Input} from '@angular/core';
import { CdkAccordionItem } from '@angular/cdk/accordion';

import { MytCardComponent } from '../myt-card/myt-card.component';

@Component({
  selector: 'myt-accord',
  templateUrl: './myt-accord.component.html',
  styleUrls: ['./myt-accord.component.scss']
})
export class MytAccordComponent extends MytCardComponent {
  @Input() accordionItem: CdkAccordionItem;
  @Input() index: number;
  expandedIndex = 0;

  ngOnInit(): void {
    this.setTimeSliderMarksDefault();
  }

  ngDoCheck() {}

  legionOnChange() {
    this.cardValueOnChange('legion', this.mytCard.legion);
  }
}
