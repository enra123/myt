import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { CdkDragDrop, copyArrayItem, transferArrayItem } from '@angular/cdk/drag-drop';

import { Observable, of } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { environment } from '../../../environments/environment';
import { Myt, MytCard, MytMessage, WsMessage } from '../models/myt.models';
import { defaultMytCard } from '../core/myt.constants';

export const WS_ENDPOINT = environment.wsEndpoint;


@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private ws: WebSocketSubject<any>;
  // // @ts-ignore
  // public messages = this.messagesSubject.pipe(concatAll(), catchError(e => { throw e }));

  constructor() {
  }

  connect(wsEndpoint: string): WebSocketSubject<any> {
    if (!this.ws || this.ws.closed) {
      this.ws = webSocket(wsEndpoint);
    }
    return this.ws;
  }

  sendMessage(msg: any) {
    this.ws.next(msg);
  }
}

@Injectable({
  providedIn: 'root',
})
export class MytDataService {
  private apiUrl: string = 'api/'

  constructor(private http: HttpClient) { }

  getRoom(roomName: string): Observable<string> {
    return this.http.get<string>(this.apiUrl + 'room/' + roomName)
  }

  addRoom(roomName: string): Observable<string> {
    return this.http.post<any>(this.apiUrl + 'room/', {name: roomName})
  }

  getAnnouncements(roomName: string): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl + 'announcement/' + roomName)
  }

  getMyts(roomName: string): Observable<Myt[]> {
    return this.http.get<Myt[]>(this.apiUrl + 'myt/' + roomName)
  }

  getMytCards(roomName: string): Observable<MytCard[]> {
    return this.http.get<MytCard[]>(this.apiUrl + 'myt-card/' + roomName)
  }

  addMyts(myt: Myt, roomName: string): Observable<Myt> {
    return this.http.post<Myt>(this.apiUrl + 'myt/' + roomName, myt)
  }
}

@Injectable({
  providedIn: 'root',
})
export class MytMessageService {
  public mytMessages: Observable<MytMessage>;
  public connectionNumbers: Observable<WsMessage>;
  public announcements: Observable<WsMessage>;
  public errorMessages: Observable<WsMessage>;

  constructor(private wsService: WebSocketService) {}

  connect(roomName: string) {
    const messages = this.wsService.connect(WS_ENDPOINT + roomName).pipe(
      map(response => response.message),
      catchError(err => {throw err})
    );

    this.mytMessages = messages.pipe(
      filter(msg => (msg as MytMessage).name !== undefined)
    );

    this.errorMessages = messages.pipe(
      filter(msg => (msg as WsMessage).type === 'error')
    );

    this.connectionNumbers = messages.pipe(
      filter(msg => (msg as WsMessage).type === 'ping')
    );

    this.announcements = messages.pipe(
      filter(msg => (msg as WsMessage).type === 'announcement')
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
    // thus, manually getting the right 'previousIndex'
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
    } else if (idString.includes('delete')) {
      type = 'delete'
    }

    let cardName = idString;
    if (idString.includes('grid-')) {
      cardName = cardName.replace('grid-', '');
    } else if (idString.includes('accord-')) {
      cardName = cardName.replace('accord-', '');
    }

    return {
      type,
      cardName
    }
  }

  onDrop(event: CdkDragDrop<Myt[]>) {
    const previousIndex = this.getMytDragDropPreviousIndex(event)
    const previousContainer = this.setContainerValues(event.previousContainer.id)
    const currentContainer = this.setContainerValues(event.container.id)
    const droppedMyt = event.previousContainer.data[previousIndex]
    const mytMessages: MytMessage[] = []

    switch (previousContainer.type.concat('->', currentContainer.type)) {
      case 'source->card':
        if (event.container.data.some(myt => myt.character === droppedMyt.character)) { break; } // prevent duplicate
        copyArrayItem(event.previousContainer.data, event.container.data, previousIndex, event.currentIndex)
        mytMessages.push({name: currentContainer.cardName, action: 'add', target: 'myts', value: droppedMyt})
        break
      case 'source->delete':
        event.previousContainer.data.splice(previousIndex, 1)
        mytMessages.push({name: 'source', action: 'delete', target: 'myts', value: droppedMyt})
        break
      case 'source->add': {
        const mytCard = {
          ...defaultMytCard,
          myts: [droppedMyt]
        } as MytCard
        mytMessages.push({name: 'source', action: 'add', target: 'mytCards', value: mytCard})
        break
      }
      case 'card->add': {
        const mytCard = {
          ...event.item.data,
          myts: [droppedMyt]
        } as MytCard
        mytMessages.push({name: 'source', action: 'add', target: 'mytCards', value: mytCard})
        break
      }
      case 'card->card':
        if (previousContainer.cardName === currentContainer.cardName && !event.isPointerOverContainer) {
          // drag-drop out of box deletes the myt
          event.previousContainer.data.splice(previousIndex, 1)
          mytMessages.push({name: previousContainer.cardName, action: 'delete', target: 'myts', value: droppedMyt})
        } else {
          if (event.container.data.some(myt => myt.character === droppedMyt.character)) { break; } // prevent duplicate
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
  constructor(private dataService: MytDataService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
      return this.dataService.getRoom(route.params.roomName).pipe(
        map(_ => true),
        catchError(_ => {
          this.router.navigateByUrl('/myt');
          return of(false)
        })
      )
  }
}






