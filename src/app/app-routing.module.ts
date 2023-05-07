import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './core/components/home/home.component';
import { AboutUsComponent } from './core/components/about-us/about-us.component';

const routes: Routes = [
  {path:'', component:HomeComponent},
  {path:'about', component:AboutUsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
