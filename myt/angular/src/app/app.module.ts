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
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgxMasonryModule } from 'ngx-masonry';


@NgModule({
  declarations: [
    AppComponent,
    MytComponent,
    MytDashboardComponent,
    MytCardComponent
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
      MatButtonToggleModule,
      NzSliderModule,
      DragDropModule,
      NgxMasonryModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
