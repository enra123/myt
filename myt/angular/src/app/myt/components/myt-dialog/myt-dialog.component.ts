import { Component, Inject } from '@angular/core';

import { rippleColor } from '../../core/myt.constants';
import { MytMessageService } from '../../services/myt.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-myt-dialog',
  templateUrl: './myt-dialog.component.html',
  styleUrls: ['./myt-dialog.component.scss']
})
export class MytDialogComponent {
  rippleColor: string = rippleColor
  announcement: string = ''

  constructor(@Inject(MAT_DIALOG_DATA) public data: string[],
              private mytMessageService: MytMessageService) {
  }

  submitAnnouncement(): void {
    if (!this.announcement) return
    this.mytMessageService.sendAnnouncement(this.announcement)
    this.announcement = ''
  }
}
