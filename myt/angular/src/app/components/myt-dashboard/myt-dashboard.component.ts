import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { CdkDragDrop, copyArrayItem, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgxMasonryComponent, NgxMasonryOptions } from 'ngx-masonry';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DataService } from "../../services/data.service";
import { Myt, MytCard, MytMessage } from "../../models/myt.models";
import { MytMessageService } from '../../services/shared.service';
import { first, switchMap } from "rxjs/operators";

@Component({
  selector: 'myt-dashboard',
  templateUrl: './myt-dashboard.component.html',
  styleUrls: ['./myt-dashboard.component.scss']
})
export class MytDashboardComponent implements OnInit {
  @ViewChild(NgxMasonryComponent) masonry: NgxMasonryComponent | undefined;
  rippleColor: string = '#aeb1bb';
  myts: Myt[] = [];
  temporaryMyts: Myt[] = [];  // for adding a new card
  loadingNewCard: boolean = false;  // for adding a new card
  mytCards: MytCard[] = [];
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
  connectedUserNum: number;
  roomName: string;

  constructor(private mytService: DataService,
              private mytMessageService: MytMessageService,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute) {
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
    });
  }

  ngOnInit() {
    this.fetchData();
  }

  private fetchData() {
    this.mytService.getMyts(this.roomName).pipe(
      switchMap(myts => {
        this.myts = myts;
        this.setMytsColors(this.myts);
        return this.mytService.getMytCards(this.roomName);
      })
    ).subscribe(mytCards => {
      this.mytCards = mytCards;
      this.mytCards.forEach((mytCard) => {
        this.setMytsColors(mytCard.myts);
      })
    })
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
      switch (message.target) {
        case 'myts': {
          if (message.action === 'add') {
            if (!mytCard.myts.some(myt => myt.character === message.value.character)) {
              mytCard.myts.push(message.value);
            }
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

  private getMytCardDefault(): MytCard {
    return <MytCard>{
      name: 'myt-card-list-0',
      legion: 'kakul-saydon',
      day: '수',
      difficulty: '노',
      times: [18, 18],
      myts: [this.temporaryMyts.pop()]
    }
  }

  private deleteCardByName(name: string): void {
    this.mytCards = this.mytCards.filter(item => item.name !== name);
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

  private containerIdToCardName(containerId: string): string {
    let cardName = containerId;
    if (containerId.includes('grid-')) {
      cardName = cardName.replace('grid-', '');
    } else if (containerId.includes('accord-')) {
      cardName = cardName.replace('accord-', '');
    }
    return cardName;
  }

  private mytDragDropTransfer(event: CdkDragDrop<Myt[]>, isCopy: boolean) {
    // TODO: fix dirty work around with drag-drop item(element is correct) index(but previousIndex is wrong) bug(?).
    const droppedMytText = event.item.element.nativeElement.innerText.split('\n').pop();
    const previousIndex = event.previousContainer.data.findIndex(d => {
      return d.character === droppedMytText
    });
    let copyOrTransferMethod = isCopy ? copyArrayItem : transferArrayItem;
    copyOrTransferMethod(event.previousContainer.data,
      event.container.data,
      previousIndex,
      event.currentIndex);
  }

  reloadMasonryLayout() {
    if (this.masonry !== undefined) {
      this.masonry.layout();
    }
  }

  openErrorBar(message: string) {
    this.snackBar.open(message, 'Close');
  }

  onDropCard(event: CdkDragDrop<Myt[]>) {
    const isCopy: boolean = event.previousContainer.id.includes('source');
    // TODO: fix dirty work around with drag-drop item(element is correct) index(but previousIndex is wrong) bug(?).
    const droppedMytText = event.item.element.nativeElement.innerText.split('\n').pop();
    const droppedMyt = event.previousContainer.data.find(d => {
      return d.character === droppedMytText
    });
    if (droppedMyt === undefined) {
      throw new TypeError();
    }
    this.mytDragDropTransfer(event, isCopy);

    if (isCopy) { // Source -> Card
      this.mytMessageService.sendMessage(<MytMessage>{
        name: this.containerIdToCardName(event.container.id),
        action: 'add',
        target: 'myts',
        value: droppedMyt
      })
    } else {  // Card -> Card
      this.mytMessageService.sendMessage(<MytMessage>{
        name: this.containerIdToCardName(event.container.id),
        action: 'add',
        target: 'myts',
        value: droppedMyt
      })
      this.mytMessageService.sendMessage(<MytMessage>{
        name: this.containerIdToCardName(event.previousContainer.id),
        action: 'delete',
        target: 'myts',
        value: droppedMyt
      })
    }
    this.reloadMasonryLayout();
  }

  onDropAdd(event: CdkDragDrop<Myt[]>) {
    if (this.loadingNewCard) {
      return;
    }
    this.mytDragDropTransfer(event, true);
    this.loadingNewCard = true;
    const mytCard = this.getMytCardDefault();
    this.mytMessageService.sendMessage(<MytMessage>{
      name: 'source',
      action: 'add',
      target: 'mytCards',
      value: mytCard
    });
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
    this.mytService.addMyts(myt, this.roomName)
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
