import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MytDashboardComponent } from "./components/myt-dashboard/myt-dashboard.component";


const routes: Routes = [
  { path: 'myt', component: MytDashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
