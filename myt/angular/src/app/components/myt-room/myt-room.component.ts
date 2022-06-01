import { Component, OnInit } from '@angular/core';
import { rippleColor } from "../../core/myt.constants";
import { DataService } from "../../services/shared.service";

import { Router } from '@angular/router';

@Component({
  selector: 'myt-room',
  templateUrl: './myt-room.component.html',
  styleUrls: ['./myt-room.component.scss']
})
export class MytRoomComponent implements OnInit {
  rippleColor: string = rippleColor
  loading: boolean = false
  roomName: string = ''

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
  }

  addRoom(): void {
    if (!this.roomName || this.loading) return
    this.loading = true;

    this.dataService.addRoom(this.roomName)
      .subscribe({
        next: (result: any) => {
          this.router.navigateByUrl('/myt/' + result.name);
        },
        error: () => {
          this.loading = false;
        },
        complete: () => this.loading = false
      });
  }

}
