import { Component, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { NgxMasonryComponent, NgxMasonryOptions } from 'ngx-masonry';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DataService } from "../../services/data.service";
import { Myt, MytCard, MytMessage } from "../../models/myt.models";
import { DragDropService, MytMessageService } from '../../services/shared.service';
import { map, switchMap } from "rxjs/operators";

@Component({
  selector: 'myt-dashboard',
  templateUrl: './myt-dashboard.component.html',
  styleUrls: ['./myt-dashboard.component.scss']
})
export class MytDashboardComponent implements OnInit {
  private MYTCARDIDPREFIX: string = 'myt-card-list-';
  @ViewChild(NgxMasonryComponent) masonry: NgxMasonryComponent | undefined;
  rippleColor: string = '#aeb1bb';
  myts: Myt[] = [];
  temporaryMyts: Myt[] = [];
  mytCards: MytCard[] = [];
  mytCardNextNum: number = 1;
  characterName: string = '';
  colors: string[] = ['gold', 'orange', 'green-dark', 'pink',
    'red', 'teal', 'blue-dark', 'purple']
  colorIndex: number = 0;
  mytColorMap = new Map<number, string>([])
  ngxMasonryOptions: NgxMasonryOptions = {
    gutter: 0,
    percentPosition: true,
  };
  loading: boolean = false;
  displayOption: string = 'card';

  constructor(private mytService: DataService,
              private mytMessageService: MytMessageService,
              private dragDropService: DragDropService,
              private snackBar: MatSnackBar) {
    mytMessageService.messages.subscribe(
        msg => this.processMytMessage(msg),
        err => this.openErrorBar('실시간 연동 오류. 새로고침해주세요')
      );
  }

  ngOnInit() {
    this.fetchData();
  }

  private fetchData() {
    this.mytService.getMyts().pipe(
      switchMap(myts => {
        this.myts = myts
        this.setMytsColors(this.myts)
        return this.mytService.getMytCards()
      })
    ).subscribe(mytCards => {
      this.mytCards = mytCards
      this.mytCards.forEach((mytCard) => {
        this.setMytsColors(mytCard.myts);
        this.setMytCardNextNum();
      })
    })
  }

  private reloadMasonryLayout() {
    if (this.masonry !== undefined) {
      this.masonry.layout();
    }
  }

  private processMytMessage(message: MytMessage) {
    const msgType = message.name.includes('source') ? 'source' : 'card';

    if (msgType === 'source') {
      if (message.action === 'add') {
        if (message.target === 'myts') {
          const myt = message.value;
          this.setMytColor(myt);
          this.myts.push(myt);
        } else if (message.target === 'mytCards') {
          this.addMytCard(message.value);
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
      switch (message.target) {
        case 'myts': {
          if (message.action === 'add') {
            mytCard.myts.push(message.value);
          } else if (message.action === 'delete') {
            mytCard.myts = mytCard.myts.filter(
              myt => myt.character != message.value.character
            );
          }
          break;
        }
        case 'difficulty': {
          mytCard.difficulty = message.value;
          break;
        }
        case 'legion': {
          mytCard.legion = message.value;
          break;
        }
        case 'day': {
          mytCard.day = message.value;
          break;
        }
        case 'times': {
          mytCard.times = message.value;
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  private getMytCardDefault(cardName: string): MytCard {
    return <MytCard>{
      name: cardName,
      legion: 'kakul-saydon',
      day: '수',
      difficulty: '노',
      times: [18, 18],
      myts: [this.temporaryMyts.pop()]
    }
  }

  private addMytCard(mytCard?: MytCard) {
    if (!mytCard) {
      const cardName = this.MYTCARDIDPREFIX + this.mytCardNextNum;
      this.mytCardNextNum++;
      mytCard = this.getMytCardDefault(cardName);
      this.mytMessageService.sendMessage(<MytMessage>{
        name: 'source',
        action: 'add',
        target: 'mytCards',
        value: mytCard
      });
    }

    this.mytCards.unshift(mytCard);
    this.reloadMasonryLayout();
  }

  private deleteCardByName(name: string): void {
    this.mytCards = this.mytCards.filter(item => item.name !== name);
  }

  private setMytCardNextNum() {
    const cardsLength = this.mytCards.length;
    if (!cardsLength) {
      this.mytCardNextNum = 1;
      return;
    }
    const lastCard = this.mytCards[cardsLength - 1];
    this.mytCardNextNum = Number(lastCard.name.split("-", 4)[3]) + 1;
  }

  private setMytColor(myt: Myt): void {
    let color = this.getMytColor(myt);
    if (color === '') {
      color = this.colors[this.colorIndex];
      this.mytColorMap.set(myt.account, color);
      this.colorIndex = this.colorIndex + 1
      if (this.colorIndex >= this.colors.length) {
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

  openErrorBar(message: string) {
    this.snackBar.open(message, 'Close');
  }

  onDropCard(event: CdkDragDrop<Myt[]>) {
    const isCopy: boolean = event.previousContainer.id.includes('source');
    const myt = event.previousContainer.data[event.previousIndex];
    this.dragDropService.mytDrop(event, isCopy);

    if (isCopy) { // Source -> Card
      this.mytMessageService.sendMessage(<MytMessage>{
        name: event.container.id,
        action: 'add',
        target: 'myts',
        value: myt
      })
    } else {  // Card -> Card
      this.mytMessageService.sendMessage(<MytMessage>{
        name: event.container.id,
        action: 'add',
        target: 'myts',
        value: myt
      })
      this.mytMessageService.sendMessage(<MytMessage>{
        name: event.previousContainer.id,
        action: 'delete',
        target: 'myts',
        value: myt
      })
    }
    this.reloadMasonryLayout();
  }

  onDropAdd(event: CdkDragDrop<Myt[]>) {
    this.dragDropService.mytDrop(event, true);
    this.addMytCard();
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
      character: this.characterName,
      level: 0,
      account: 0,
      role: '',
      color: '',
    }
    this.mytService.addMyts(myt)
      .subscribe({
        next: (myt: Myt) => {
          this.loading = false;
          this.myts.push(myt);
          this.setMytColor(myt);
          this.mytMessageService.sendMessage(<MytMessage>{
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
    this.mytMessageService.sendMessage(<MytMessage>{
      name: 'source',
      action: 'delete',
      target: 'mytCards',
      value: mytCard.name
    });
  }

  getMytColor(myt: Myt): string {
    let color = this.mytColorMap.get(myt.account);
    if (color === undefined) {
      return '';
    }
    return color;
  }

}
