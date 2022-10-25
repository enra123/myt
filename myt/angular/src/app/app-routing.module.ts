import { Injectable, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './shared/home/home.component';


const routes: Routes = [
  {
    path: 'myt',
    loadChildren: () => import('./myt/myt.module').then(m => m.MytModule)
  },
  {
    path: 'jdsn',
    loadChildren: () => import('./jdsn/jdsn.module').then(m => m.JdsnModule)
  },
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
