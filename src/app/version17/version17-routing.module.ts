import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTER_UTILS } from '../../app.router';
import { NewFeatureComponent } from './new-feature/new-feature.component';
import { WebContainerComponent } from './webcontainer/webcontainer.component';

const routes: Routes = [
  {
    path: ROUTER_UTILS.version.V17.categories,
    component: NewFeatureComponent,
  },
  {
    path: ROUTER_UTILS.version.V17.webContainer,
    component: WebContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Version17RoutingModule {}
