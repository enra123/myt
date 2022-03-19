import { Injectable } from '@angular/core';

import { Myt, MytMessage } from "../models/myt.models";
import { Subject, Observable, of} from "rxjs";
import { DataService, WebSocketService } from "./data.service";
import { catchError, filter, map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";


export const WS_ENDPOINT = environment.wsEndpoint;

@Injectable({
  providedIn: 'root',
})
export class MytMessageService {
  public mytMessages: Observable<MytMessage>;
  public connectionNumbers: Observable<number>;

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
  }

  sendMessage(message: MytMessage) {
    this.wsService.sendMessage(message);
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






