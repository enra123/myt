import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MytDashboardComponent } from './components/myt-dashboard/myt-dashboard.component';
import { MytRoomComponent } from './components/myt-room/myt-room.component';
import { CanActivateRoom } from './services/myt.service';


const routes: Routes = [
  { path: '', component: MytRoomComponent, pathMatch: 'full' },
  { path: ':roomName', component: MytDashboardComponent, canActivate: [CanActivateRoom] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MytRoutingModule { }
