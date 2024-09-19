import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Version17RoutingModule } from './version17-routing.module';
import { WebContainerComponent } from './webcontainer/webcontainer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from './chat/chat.component';
import { NzIconModule } from 'ng-zorro-antd/icon';

@NgModule({
  declarations: [WebContainerComponent, ChatComponent],
  imports: [
    CommonModule,
    FormsModule,
    Version17RoutingModule,
    ReactiveFormsModule,
    NzIconModule
  ]
})
export class Version17Module { }
