import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Material modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { LogoAppnameComponent } from '../shared/logo-appname/logo-appname.component';
import { FolderListComponent } from '../folder-list/folder-list.component';
import { SharedModule } from '../shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    ReactiveFormsModule 
  ]
})
export class DashboardModule { }
