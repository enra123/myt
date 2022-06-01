import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MytRoomComponent } from './myt-room.component';

describe('MytRoomComponent', () => {
  let component: MytRoomComponent;
  let fixture: ComponentFixture<MytRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MytRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MytRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
