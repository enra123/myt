import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MytDialogComponent } from './myt-dialog.component';

describe('MytDialogComponent', () => {
  let component: MytDialogComponent;
  let fixture: ComponentFixture<MytDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MytDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MytDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
