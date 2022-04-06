import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { Myt, MytCard } from '../models/myt.models';


@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl: string = 'api/'

  constructor(private http: HttpClient) { }

  getRoom(roomName: string): Observable<string> {
    return this.http.get<string>(this.apiUrl + 'room/' + roomName)
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



