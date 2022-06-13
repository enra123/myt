import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatIconModule } from "@angular/material/icon";

import { JdsnRoutingModule } from './jdsn-routing.module';
import { SpinningWheelComponent } from "./components/spinning-wheel/spinning-wheel.component";


@NgModule({
  declarations: [
    SpinningWheelComponent,
  ],
  imports: [
    CommonModule,
    JdsnRoutingModule,
    MatIconModule,
  ],
})
export class JdsnModule { }
