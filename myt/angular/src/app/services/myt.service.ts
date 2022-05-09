import { Injectable } from '@angular/core';

import { Myt, MytCard, MytMessage } from "../models/myt.models";
import { Observable, of } from "rxjs";
import { DataService, WebSocketService } from "./shared.service";
import { catchError, filter, map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { CdkDragDrop, copyArrayItem, transferArrayItem } from "@angular/cdk/drag-drop";
import { defaultMytCard } from "../core/myt.constants";

export const WS_ENDPOINT = environment.wsEndpoint;

@Injectable({
  providedIn: 'root',
})
export class MytMessageService {
  public mytMessages: Observable<MytMessage>;
  public connectionNumbers: Observable<number>;
  public announcements: Observable<string>;

  constructor(private wsService: WebSocketService) {}

  connect(roomName: string) {
    const messages = this.wsService.connect(WS_ENDPOINT + roomName).pipe(
      map(response => response.message),
      catchError(err => {throw err})
    );

    this.mytMessages = messages.pipe(
      filter(msg => (<MytMessage>msg).name !== undefined)
    );

    this.connectionNumbers = messages.pipe(
      filter(msg => typeof msg === 'number')
    );

    this.announcements = messages.pipe(
      filter(msg => typeof msg === 'string')
    );
  }

  sendMessage(message: MytMessage) {
    this.wsService.sendMessage(message);
  }

  sendAnnouncement(announcement: string) {
    this.wsService.sendMessage(announcement);
  }
}

@Injectable({
  providedIn: 'root',
})
export class MytDragDropService {
  constructor(private mytMessageService: MytMessageService) {}

  private getMytDragDropPreviousIndex(event: CdkDragDrop<Myt[]>) {
    // TODO: find the reasoon and fix this dirty work around
    // 'event.previousIndex' was meant to work but it's not giving the correct index
    const droppedMytText = event.item.element.nativeElement.innerText.split('\n').pop();
    const previousIndex = event.previousContainer.data.findIndex(d => {
      return d.character === droppedMytText
    });
    if (previousIndex === -1) {
      throw new TypeError();
    }
    return previousIndex
  }

  private setContainerValues(idString: string) {
    let type = ''
    if (idString.includes('source')) {
      type = 'source'
    } else if (idString.includes('add')) {
      type = 'add'
    } else if (idString.includes('card')) {
      type = 'card'
    }

    let cardName = idString;
    if (idString.includes('grid-')) {
      cardName = cardName.replace('grid-', '');
    } else if (idString.includes('accord-')) {
      cardName = cardName.replace('accord-', '');
    }

    return {
      type: type,
      cardName: cardName
    }
  }

  onDrop(event: CdkDragDrop<Myt[]>) {
    const previousIndex = this.getMytDragDropPreviousIndex(event)
    const previousContainer = this.setContainerValues(event.previousContainer.id)
    const currentContainer = this.setContainerValues(event.container.id)
    const droppedMyt = event.previousContainer.data[previousIndex]
    let mytMessages: MytMessage[] = []

    switch (previousContainer.type.concat('->', currentContainer.type)) {
      case 'source->card':
        if (event.container.data.some(myt => myt.character === droppedMyt.character)) break; // prevent duplicate
        copyArrayItem(event.previousContainer.data, event.container.data, previousIndex, event.currentIndex)
        mytMessages.push({name: currentContainer.cardName, action: 'add', target: 'myts', value: droppedMyt})
        break
      case 'source->add': {
        const mytCard = <MytCard>{
          ...defaultMytCard,
          myts: [droppedMyt]
        }
        mytMessages.push({name: 'source', action: 'add', target: 'mytCards', value: mytCard})
        break
      }
      case 'card->add': {
        const mytCard = <MytCard>{
          ...event.item.data,
          myts: [droppedMyt]
        }
        mytMessages.push({name: 'source', action: 'add', target: 'mytCards', value: mytCard})
        break
      }
      case 'card->card':
        if (previousContainer.cardName === currentContainer.cardName && !event.isPointerOverContainer) {
          // drag-drop out of box deletes the myt
          event.previousContainer.data.splice(previousIndex, 1)
          mytMessages.push({name: previousContainer.cardName, action: 'delete', target: 'myts', value: droppedMyt})
        } else {
          if (event.container.data.some(myt => myt.character === droppedMyt.character)) break; // prevent duplicate
          transferArrayItem(event.previousContainer.data, event.container.data, previousIndex, event.currentIndex)
          mytMessages.push({name: currentContainer.cardName, action: 'add', target: 'myts', value: droppedMyt})
          mytMessages.push({name: previousContainer.cardName, action: 'delete', target: 'myts', value: droppedMyt})
        }
        break
      default:
        break
    }
    mytMessages.forEach(msg => {
      this.mytMessageService.sendMessage(msg)
    })
  }
}

@Injectable({
  providedIn: 'root',
})
export class CanActivateRoom implements CanActivate {
  constructor(private dataService: DataService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
      return this.dataService.getRoom(route.params['roomName']).pipe(
        map(_ => true),
        catchError(_ => of(false))
      )
  }
}






