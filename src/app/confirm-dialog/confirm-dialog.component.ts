import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmDialogComponent implements OnInit {
  confirmText: string;
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnInit() {
  }

}
