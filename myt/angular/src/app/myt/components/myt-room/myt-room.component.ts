import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { rippleColor } from '../../core/myt.constants';
import { MytDataService } from '../../services/myt.service';

import { Router } from '@angular/router';

@Component({
  selector: 'myt-room',
  templateUrl: './myt-room.component.html',
  styleUrls: ['./myt-room.component.scss']
})
export class MytRoomComponent implements OnInit {
  title = '로스트아크 군단장 파티 플래너';
  rippleColor: string = rippleColor
  loading: boolean = false
  roomName: string = ''

  constructor(private dataService: MytDataService,
              private router: Router,
              private titleService: Title,
              private metaTagService: Meta) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.metaTagService.updateTag(
      { name: 'description', content: '로스트아크 군단장 파티 플래너'}
    )
  }

  addRoom(): void {
    if (!this.roomName || this.loading) { return }
    this.loading = true

    this.dataService.addRoom(this.roomName)
      .subscribe({
        next: (result: any) => {
          this.router.navigateByUrl('/myt/' + result.name)
        },
        error: () => {
          this.roomName = ''
          this.loading = false
        },
        complete: () => this.loading = false
      });
  }

}
