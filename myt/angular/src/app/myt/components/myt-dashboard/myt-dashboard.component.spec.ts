import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';

import {MytDashboardComponent} from './myt-dashboard.component';
import {MytDataService, MytMessageService} from '../../services/myt.service';
import {Observable, of} from 'rxjs';
import {Myt, MytCard, MytMessage} from '../../models/myt.models';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MytRoutingModule} from '../../myt-routing.module';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatBadgeModule} from '@angular/material/badge';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {NgxMasonryModule} from 'ngx-masonry';
import {ActivatedRoute} from '@angular/router';
import {MytOrderByPipe} from '../../pipes/mytOrderBy.pipe';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {delay} from 'rxjs/operators';


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
      message: '',
      pinned: false,
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

class MockMytMessageService {
  public mytMessages: Observable<MytMessage>;
  public connectionNumbers: Observable<string>;
  public announcements: Observable<string>;
  public errorMessages: Observable<string>;

  constructor() {
  }

  connect(roomName: string) {
    this.mytMessages = of(
      {
        name: 'source',
        action: 'add',
        target: 'myts',
        value: {
          character: 'test-ch',
          level: 1000,
          account: 1,
          role: 'test-role'
        }
      } as MytMessage,
      {
        name: 'source',
        action: 'add',
        target: 'myts',
        value: {
          character: 'test-ch1',
          level: 1000,
          account: 2,
          role: 'test-role'
        }
      } as MytMessage,
    ).pipe(delay(1))

    this.connectionNumbers = of('')
    this.announcements = of('')
    this.errorMessages = of('')
  }
}

fdescribe('MytDashboardComponent', () => {
  let component: MytDashboardComponent;
  let fixture: ComponentFixture<MytDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        MatIconModule,
        MytRoutingModule,
        MatSnackBarModule,
        MatDialogModule,
        MatDividerModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatButtonToggleModule,
        MatBadgeModule,
        CdkAccordionModule,
        DragDropModule,
        NgxMasonryModule,
      ],
      providers: [
        { provide: MytDataService, useClass: MockDataService },
        { provide: MytMessageService, useClass: MockMytMessageService },
        { provide: ActivatedRoute, useValue: {params: of({roomName: 'test'})}}
      ],
      declarations: [ MytDashboardComponent, MytOrderByPipe ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MytDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    fixture.whenStable().then(() => {
      expect(component.myts).toEqual([{
        character: 'testCharacter',
        level: 1000,
        account: 1,
        role: 'testRole',
        color: 'gold',
      }])
      expect(component.mytCards).toEqual([{
        name: 'myt-card-test',
        legion: 'test-legion',
        day: 'test-day',
        message: '',
        pinned: false,
        difficulty: 'test-difficulty',
        times: [18, 18],
        myts: []
      }])
    })
  }));

  it('should myts added', fakeAsync(() => {
    tick(1);
    fixture.detectChanges();
    expect(component.myts).toEqual([{
      character: 'testCharacter',
      level: 1000,
      account: 1,
      role: 'testRole',
      color: 'gold',
    }, {
      character: 'test-ch',
      level: 1000,
      account: 1,
      role: 'test-role',
      color: 'gold',
    }, {
      character: 'test-ch1',
      level: 1000,
      account: 2,
      role: 'test-role',
      color: 'orange',
    }])
  }));

});
