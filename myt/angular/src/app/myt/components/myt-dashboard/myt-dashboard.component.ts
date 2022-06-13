import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { NgxMasonryComponent, NgxMasonryOptions } from 'ngx-masonry';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { Myt, MytCard, MytMessage } from "../../models/myt.models";
import { badgeColors, rippleColor, defaultMytCard, defaultMyt } from "../../core/myt.constants";
import { MytDragDropService, MytMessageService, MytDataService } from '../../services/myt.service';
import { first, switchMap } from "rxjs/operators";
import { MytDialogComponent } from "../myt-dialog/myt-dialog.component";


@Component({
  selector: 'myt-dashboard',
  templateUrl: './myt-dashboard.component.html',
  styleUrls: ['./myt-dashboard.component.scss']
})
export class MytDashboardComponent implements OnInit {
  @ViewChild(NgxMasonryComponent) masonry: NgxMasonryComponent | undefined;
  ANNOUNCEMENT_MAX_SIZE: number = 5
  rippleColor: string = rippleColor
  btnClass: string = ''
  myts: Myt[] = []
  dialogRef: MatDialogRef<MytDialogComponent>
  announcements: string[] = []
  loadingNewCard: boolean = false  // for adding a new card
  mytCards: MytCard[] = []
  characterName: string = ''
  colorIndex: number = 0
  mytColorMap: Record<number, string> = {}
  ngxMasonryOptions: NgxMasonryOptions = {
    gutter: 0,
    percentPosition: true,
  }
  loading: boolean = false
  displayOption: string = 'card'
  connectedUserNum: number
  roomName: string

  constructor(private dataService: MytDataService,
              private mytMessageService: MytMessageService,
              private mytDragDropService: MytDragDropService,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
    this.route.params.pipe(first()).subscribe( (params) => {
      this.roomName = params['roomName'];
      mytMessageService.connect(this.roomName);
      mytMessageService.mytMessages.subscribe(
          msg => this.processMytMessage(msg),
          err => this.openErrorBar('실시간 연동 오류. 새로고침해주세요')
        );

      mytMessageService.connectionNumbers.subscribe(
          msg => this.connectedUserNum = msg,
          err => this.openErrorBar('실시간 연동 오류. 새로고침해주세요')
        );

      mytMessageService.announcements.subscribe(
          msg => this.updateAnnouncement(msg),
          err => this.openErrorBar('실시간 연동 오류. 새로고침해주세요')
        );
    });

  }

  ngOnInit() {
    this.fetchData();
  }

  private fetchData() {
    this.dataService.getMyts(this.roomName).pipe(
      switchMap(myts => {
        this.myts = myts;
        this.setMytsColors(this.myts);
        return this.dataService.getAnnouncements(this.roomName);
      }),
      switchMap(announcements => {
        if (announcements.length) {
          this.openAnnounceBar(announcements[0]);
        }
        this.announcements = announcements.reverse();
        return this.dataService.getMytCards(this.roomName);
      })
    ).subscribe(mytCards => {
      this.mytCards = mytCards;
      this.mytCards.forEach((mytCard) => {
        this.setMytsColors(mytCard.myts);
      });
    })
  }

  private updateAnnouncement(announcement: string) {
    if (this.announcements.length >= this.ANNOUNCEMENT_MAX_SIZE) {
      this.announcements.shift()
    }
    this.announcements.push(announcement)
    if (this.dialogRef && this.dialogRef.componentInstance) {
      this.dialogRef.componentInstance.data = this.announcements;
    } else {
      this.btnClass = 'btn-alarmed'
    }
  }

  private processMytMessage(message: MytMessage) {
    const msgType = message.name.includes('source') ? 'source' : 'card';

    if (msgType === 'source') {
      if (message.action === 'add') {
        if (message.target === 'myts') {
          const myt = message.value;
          if (this.myts.findIndex((m => m.character === myt.character)) > -1) {
            return;
          }
          this.setMytColor(myt);
          this.myts.push(myt);
        } else if (message.target === 'mytCards') {
          const mytCard = message.value;
          if (this.mytCards.findIndex((m => m.name === mytCard.name)) > -1) {
            return;
          }
          this.mytCards.unshift(mytCard);
          this.loadingNewCard = false;
          this.reloadMasonryLayout();
        }
      } else if (message.action === 'delete') {
        this.deleteCardByName(message.value);
      }
    } else {
      const mytCardIndex = this.mytCards.findIndex((card => card.name == message.name));
      if (mytCardIndex === -1) {
        return;
      }
      let mytCard = this.mytCards[mytCardIndex];
      if (message.target === 'myts') {
        if (message.action === 'add') {
          if (!mytCard.myts.some(myt => myt.character === message.value.character)) {
            mytCard.myts.push(message.value);
          }
        } else if (message.action === 'delete') {
          mytCard.myts = mytCard.myts.filter(
            myt => myt.character != message.value.character
          );
        }
      } else {
        // @ts-ignore
        mytCard[message.target] = message.value;
      }
    }
  }

  private deleteCardByName(name: string): void {
    this.mytCards = this.mytCards.filter(item => item.name !== name);
  }

  private setMytColor(myt: Myt): void {
    let color = this.getMytColor(myt);
    if (color === '') {
      color = badgeColors[this.colorIndex];
      this.mytColorMap[myt.account] = color;
      this.colorIndex = this.colorIndex + 1
      if (this.colorIndex >= badgeColors.length) {
        this.colorIndex = 0;
      }
    }
    myt.color = color;
  }

  private setMytsColors(myts: Myt[]): void {
    myts.forEach((myt) => {
      this.setMytColor(myt);
    })
  }

  reloadMasonryLayout() {
    if (this.masonry !== undefined) {
      this.masonry.layout();
    }
  }

  openDialog() {
    this.dialogRef = this.dialog.open(MytDialogComponent, {
      position: {top: '0'},
      data: this.announcements,
    });
    this.btnClass = ''
  }

  openErrorBar(message: string) {
    this.snackBar.open(message, 'Close');
  }

  openAnnounceBar(message: string) {
    this.snackBar.open(message, 'Close', {
      verticalPosition: 'top',
      panelClass: ['announce-snackbar']
    });
  }

  getMytColor(myt: Myt): string {
    let color = this.mytColorMap[myt.account];
    if (color === undefined) {
      return '';
    }
    return color;
  }

  onDropAdd(event: CdkDragDrop<Myt[]>) {
    if (this.loadingNewCard) {
      return;
    }
    this.mytDragDropService.onDrop(event)
    this.loadingNewCard = true;
  }

  onDropSource(event: CdkDragDrop<Myt[]>) {
  }

  addMyt(): void {
    // Trying to add already existing
    if (this.myts.some(myt => myt.character === this.characterName)) {
      return;
    }
    this.loading = true;
    let myt = <Myt>{
      ...defaultMyt,
      character: this.characterName,
    }
    // TODO: making this ws instead of http, currently it's doing two round-trips
    this.dataService.addMyts(myt, this.roomName)
      .subscribe({
        next: (myt: Myt) => {
          this.loading = false;
          this.myts.push(myt);
          this.setMytColor(myt);
          this.mytMessageService.sendMessage({
            name: 'source',
            action: 'add',
            target: 'myts',
            value: myt
          });
        },
        error: () => {
          this.loading = false;
          this.openErrorBar('캐릭 못찾음');
        },
        complete: () => this.loading = false
      });
  }

  deleteCardOnClick(mytCard: MytCard): void {
    this.deleteCardByName(mytCard.name);
    this.mytMessageService.sendMessage({
      name: 'source',
      action: 'delete',
      target: 'mytCards',
      value: mytCard.name
    });
  }

}
