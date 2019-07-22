import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatProgressSpinnerModule, MatRadioModule, MatSliderModule, MatProgressBarModule, MatSlideToggleModule,
  MatFormFieldModule, MatDialogModule, MatInputModule} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { UploadComponent } from './upload/upload.component';
import { MainComponent } from './main/main.component';
import { ViewFileComponent } from './view-file/view-file.component';
import {AngularFileViewerModule} from '@taldor-ltd/angular-file-viewer';
import { ViewPortalComponent } from './view-portal/view-portal.component';
import {ToastrModule} from 'ngx-toastr';
import { AnonymousComponent } from './anonymous/anonymous.component';
import { DevComponent } from './dev/dev.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    MainComponent,
    ViewFileComponent,
    ViewPortalComponent,
    AnonymousComponent,
    DevComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule, MatRadioModule, MatSliderModule, MatProgressBarModule, MatSlideToggleModule,
    MatFormFieldModule, MatDialogModule, MatInputModule,
    ToastrModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    AngularFileViewerModule
  ],
  entryComponents: [ConfirmDialogComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
