import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Version17RoutingModule } from './version17-routing.module';
import { WebContainerComponent } from './webcontainer/webcontainer.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [WebContainerComponent],
  imports: [
    CommonModule,
    FormsModule,
    Version17RoutingModule
  ]
})
export class Version17Module { }
