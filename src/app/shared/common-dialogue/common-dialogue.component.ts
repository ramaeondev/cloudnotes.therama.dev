import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { NgxSpinnerService } from 'ngx-spinner';
import { StripUserIdPipe } from '../../pipes/strip-user-id.pipe';
import { BytesToMbPipe } from '../../pipes/bytes-to-mb.pipe';

export interface DialogData {
  id:string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  data: any;
}

@Component({
  selector: 'app-common-dialogue',
  standalone: true,
  templateUrl: './common-dialogue.component.html',
  styleUrl: './common-dialogue.component.scss',
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, BytesToMbPipe,
    MatIconModule, MatListModule, ReactiveFormsModule, CommonModule, StripUserIdPipe ]
})
export class CommonDialogueComponent {



  constructor(
    public dialogRef: MatDialogRef<CommonDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly spinner: NgxSpinnerService
  ) {
    console.log(data);    
  }


    // Close the dialog and pass back a response
    onConfirm(): void {
      this.dialogRef.close(true);
    }
  
    onCancel(): void {
      this.dialogRef.close(false);
    }

}
