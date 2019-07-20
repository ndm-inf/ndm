import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from './main/main.component';
import {UploadComponent} from './upload/upload.component';
import {ViewFileComponent} from './view-file/view-file.component';
import {ViewPortalComponent} from './view-portal/view-portal.component';
import {AnonymousComponent} from './anonymous/anonymous.component';
import {DevComponent} from './dev/dev.component';

const routes: Routes = [
   {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'main',
    component: MainComponent
  },
  {
    path: 'viewPortal',
    component: ViewPortalComponent
  },
  {
    path: 'upload',
    component: UploadComponent
  },
  {
    path: 'viewFile/:txLedger',
    component: ViewFileComponent
  },
  {
    path: 'anonymous',
    component: AnonymousComponent
  },
  {
    path: 'dev',
    component: DevComponent
  }
 ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
