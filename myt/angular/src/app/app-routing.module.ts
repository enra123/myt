import { Injectable, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MytDashboardComponent } from "./components/myt-dashboard/myt-dashboard.component";
import { MytRoomComponent } from "./components/myt-room/myt-room.component";
import { SpinningWheelComponent } from "./components/spinning-wheel/spinning-wheel.component";
import { CanActivateRoom } from "./services/myt.service";


const routes: Routes = [
  { path: 'myt/:roomName', component: MytDashboardComponent, canActivate: [CanActivateRoom] },
  { path: 'myt', component: MytRoomComponent },
  { path: '', component: SpinningWheelComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
