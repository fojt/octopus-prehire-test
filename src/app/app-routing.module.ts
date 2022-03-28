import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DetailComponent} from "./detail/detail.component";

const routes: Routes = [
  {
    path: ':currencyCode',
    pathMatch: 'full',
    component: DetailComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    component: DetailComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
