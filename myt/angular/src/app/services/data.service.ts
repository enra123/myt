import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment} from '../../environments/environment';

import { Myt, MytCard } from '../models/myt.models';

export const WS_ENDPOINT = environment.wsEndpoint;

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl: string = 'api/'

  constructor(private http: HttpClient) { }

  getMyts(): Observable<Myt[]> {
    return this.http.get<Myt[]>(this.apiUrl + 'myt')
  }

  getMytCards(): Observable<MytCard[]> {
    return this.http.get<MytCard[]>(this.apiUrl + 'myt-card')
  }

  addMyts(myt: Myt): Observable<Myt> {
    return this.http.post<Myt>(this.apiUrl + 'myt', myt)
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

  connect(): WebSocketSubject<any> {
    if (!this.ws || this.ws.closed) {
      this.ws = webSocket(WS_ENDPOINT);
    }
    return this.ws;
  }

  sendMessage(msg: any) {
    this.ws.next(msg);
  }
}



