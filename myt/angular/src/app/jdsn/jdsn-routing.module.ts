import { Injectable, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpinningWheelComponent } from './components/spinning-wheel/spinning-wheel.component';


const routes: Routes = [
  { path: '', component: SpinningWheelComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JdsnRoutingModule { }
