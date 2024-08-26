import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTER_UTILS } from '../../app.router';
import { NewFeatureComponent } from './new-feature/new-feature.component';

const routes: Routes = [
  {
    path: ROUTER_UTILS.version.V17.categories,
    component: NewFeatureComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Version17RoutingModule {}
