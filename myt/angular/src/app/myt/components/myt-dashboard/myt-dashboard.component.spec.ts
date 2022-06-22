import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MytDashboardComponent } from './myt-dashboard.component';
import {MytDataService} from "../../services/myt.service";
import {Observable, of} from "rxjs";
import {Myt, MytCard} from "../../models/myt.models";


class MockDataService {
  private readonly myts: Myt[];
  private readonly mytCards: MytCard[];

  constructor() {
    this.myts = new Array<Myt>();
    this.mytCards = new Array<MytCard>();
    this.myts.push({
      character: 'testCharacter',
      level: 1000,
      account: 1,
      role: 'testRole'
    })
    this.mytCards.push({
      name: 'myt-card-test',
      legion: 'test-legion',
      day: 'test-day',
      difficulty: 'test-difficulty',
      times: [18, 18],
      myts: []
    })
  }

  getAnnouncements(roomName: string): Observable<string[]> {
    return of([])
  }

  getMyts(roomName: string): Observable<Myt[]> {
    return of([...this.myts]);
  }

  getMytCards(roomName: string): Observable<MytCard[]> {
    return of([...this.mytCards])
  }
}

describe('MytDashboardComponent', () => {
  let component: MytDashboardComponent;
  let fixture: ComponentFixture<MytDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
      MytDashboardComponent,
        { provide: MytDataService, useClass: MockDataService }
      ],
      declarations: [ MytDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MytDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
