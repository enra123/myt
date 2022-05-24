import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MytComponent } from "./components/myt/myt.component";
import { MytDashboardComponent } from './components/myt-dashboard/myt-dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MytCardComponent } from './components/myt-card/myt-card.component';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from "@angular/material/core";
import { MatSliderModule } from "@angular/material/slider";
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgxMasonryModule } from 'ngx-masonry';
import { MytAccordComponent } from './components/myt-accord/myt-accord.component';
import { MytOrderByPipe } from './pipes/mytOrderBy.pipe';
import { MytDialogComponent } from './components/myt-dialog/myt-dialog.component';
import { SpinningWheelComponent } from './components/spinning-wheel/spinning-wheel.component';


@NgModule({
  declarations: [
    AppComponent,
    MytComponent,
    MytDashboardComponent,
    MytCardComponent,
    MytAccordComponent,
    MytOrderByPipe,
    MytDialogComponent,
    SpinningWheelComponent
  ],
    imports: [
      BrowserModule,
      AppRoutingModule,
      HttpClientModule,
      FormsModule,
      BrowserAnimationsModule,
      MatIconModule,
      MatOptionModule,
      MatSelectModule,
      MatSliderModule,
      MatRippleModule,
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
      NgxMasonryModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
