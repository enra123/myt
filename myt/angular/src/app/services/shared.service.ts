import { Injectable } from '@angular/core';
import { CdkDragDrop, transferArrayItem,copyArrayItem } from '@angular/cdk/drag-drop';

import { Myt, MytMessage } from "../models/myt.models";
import { Subject } from "rxjs";
import { WebSocketService } from "./data.service";
import { catchError, map } from "rxjs/operators";


@Injectable({
  providedIn: 'root',
})
export class DragDropService {

  constructor() { }

  public mytDrop(event: CdkDragDrop<Myt[]>, isCopy: boolean) {
    let copyOrTransferMethod = isCopy ? copyArrayItem : transferArrayItem;
    copyOrTransferMethod(event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex);
  }
}


@Injectable({
  providedIn: 'root',
})
export class MytMessageService {
  public messages: Subject<MytMessage>;

  constructor(private wsService: WebSocketService) {
    this.messages = <Subject<MytMessage>>wsService.connect().pipe(
      // tap(console.log),
      map(response => response.message),
      catchError(error => { throw error })
    );
  }

  sendMessage(message: MytMessage) {
    this.wsService.sendMessage(message);
  }
}






