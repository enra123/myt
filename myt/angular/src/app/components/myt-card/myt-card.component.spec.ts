import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MytCardComponent } from './myt-card.component';

describe('MytCardComponent', () => {
  let component: MytCardComponent;
  let fixture: ComponentFixture<MytCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MytCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MytCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
