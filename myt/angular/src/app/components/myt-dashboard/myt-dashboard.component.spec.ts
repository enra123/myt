import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MytDashboardComponent } from './myt-dashboard.component';

describe('MytDashboardComponent', () => {
  let component: MytDashboardComponent;
  let fixture: ComponentFixture<MytDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
