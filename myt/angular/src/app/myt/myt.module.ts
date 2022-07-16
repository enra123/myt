import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxMasonryModule } from 'ngx-masonry';
import { NzSliderModule } from 'ng-zorro-antd/slider';

import { MytRoutingModule } from './myt-routing.module';
import { MytBadgeComponent } from './components/myt-badge/myt-badge.component';
import { MytDashboardComponent } from './components/myt-dashboard/myt-dashboard.component';
import { MytCardComponent } from './components/myt-card/myt-card.component';
import { MytAccordComponent } from './components/myt-accord/myt-accord.component';
import { MytOrderByPipe } from './pipes/mytOrderBy.pipe';
import { MytDialogComponent } from './components/myt-dialog/myt-dialog.component';
import { MytRoomComponent } from './components/myt-room/myt-room.component';


@NgModule({
  declarations: [
    MytBadgeComponent,
    MytDashboardComponent,
    MytCardComponent,
    MytAccordComponent,
    MytOrderByPipe,
    MytDialogComponent,
    MytRoomComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatRippleModule,
    MytRoutingModule,
    MatOptionModule,
    MatSelectModule,
    MatSliderModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatBadgeModule,
    CdkAccordionModule,
    NzSliderModule,
    DragDropModule,
    NgxMasonryModule,
  ],
})
export class MytModule { }
