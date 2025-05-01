import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

import { LogoAppnameComponent } from '../shared/logo-appname/logo-appname.component';
import { FolderListComponent } from '../folder-list/folder-list.component';
import { SharedModule } from '../shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from "ngx-spinner";

@NgModule({
  declarations: [
    DashboardComponent,
    FolderListComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    LogoAppnameComponent,
    SharedModule,
    FormsModule,
    ReactiveFormsModule ,
    NgxSpinnerModule
  ]
})
export class DashboardModule { }
