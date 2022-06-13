import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MytAccordComponent } from './myt-accord.component';

describe('MytAccordComponent', () => {
  let component: MytAccordComponent;
  let fixture: ComponentFixture<MytAccordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MytAccordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MytAccordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
