import { Injectable, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MytDashboardComponent } from "./components/myt-dashboard/myt-dashboard.component";
import { CanActivateRoom } from "./services/myt.service";


const routes: Routes = [
  { path: 'myt/:roomName', component: MytDashboardComponent, canActivate: [CanActivateRoom] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
