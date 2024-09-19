import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Version17RoutingModule } from './version17-routing.module';
import { WebContainerComponent } from './webcontainer/webcontainer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from './chat/chat.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
@NgModule({
  declarations: [WebContainerComponent, ChatComponent],
  imports: [
    CommonModule,
    Version17RoutingModule,
    NzIconModule,
    NzSwitchModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class Version17Module { }
