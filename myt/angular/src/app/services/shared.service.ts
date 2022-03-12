import { Injectable } from '@angular/core';

import { Myt, MytMessage } from "../models/myt.models";
import {Subject, Observable, pipe, iif, of} from "rxjs";
import { WebSocketService } from "./data.service";
import {catchError, filter, map, switchMap, tap} from "rxjs/operators";


@Injectable({
  providedIn: 'root',
})
export class MytMessageService {
  public mytMessages: Observable<MytMessage>;
  public connectionNumbers: Observable<number>;

  constructor(private wsService: WebSocketService) {
    const messages = wsService.connect().pipe(
      map(response => response.message),
      catchError(err => {throw err})
    );

    this.mytMessages = messages.pipe(
      filter(msg => (<MytMessage>msg).name !== undefined)
    );

    this.connectionNumbers = messages.pipe(
      filter(msg => typeof msg === 'number')
    );
  }

  sendMessage(message: MytMessage) {
    this.wsService.sendMessage(message);
  }
}






