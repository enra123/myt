import { Injectable } from '@angular/core';

import { Myt, MytMessage } from "../models/myt.models";
import { Subject } from "rxjs";
import { WebSocketService } from "./data.service";
import { catchError, map } from "rxjs/operators";


@Injectable({
  providedIn: 'root',
})
export class MytMessageService {
  public messages: Subject<MytMessage>;

  constructor(private wsService: WebSocketService) {
    this.messages = <Subject<MytMessage>>wsService.connect().pipe(
      // tap(console.log),
      map(response => response.message),
      catchError(err => { throw err })
    );
  }

  sendMessage(message: MytMessage) {
    this.wsService.sendMessage(message);
  }
}






