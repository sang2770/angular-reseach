import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTER_UTILS } from '../../app.router';
import { NewFeatureComponent } from './new-feature/new-feature.component';
import { WebContainerComponent } from './webcontainer/webcontainer.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
  {
    path: ROUTER_UTILS.version.V17.categories,
    component: NewFeatureComponent,
  },
  {
    path: ROUTER_UTILS.version.V17.webContainer,
    component: WebContainerComponent
  },
  {
    path: ROUTER_UTILS.version.V17.chat,
    component: ChatComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Version17RoutingModule {}
