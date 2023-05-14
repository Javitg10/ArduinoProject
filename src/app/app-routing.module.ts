import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './core/components/home/home.component';
import { AboutUsComponent } from './core/components/about-us/about-us.component';
import { DatosComponent } from './core/components/datos/datos.component';

const routes: Routes = [
  {path:'', component:HomeComponent},
  {path:'about', component:AboutUsComponent},
  {path:'datos', component:DatosComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
