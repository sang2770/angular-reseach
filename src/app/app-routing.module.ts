import { RouterModule, Routes } from '@angular/router';
import { HelloComponent } from './hello/hello.component';
import { ROUTER_UTILS } from '../app.router';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    component: HelloComponent,
    pathMatch: 'full',
  },
  {
    path: ROUTER_UTILS.version.V17.root,
    loadChildren: () =>
      import('./version17/version17.module').then((m) => m.Version17Module),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
