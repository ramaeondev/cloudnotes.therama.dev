import { Component, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileUploadService } from '../services/file-upload.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { Folder } from '../models/folder.interface';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-upload-files-dialogue',
  standalone: true,
  templateUrl: './upload-files-dialogue.component.html',
  styleUrl: './upload-files-dialogue.component.scss',
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatListModule, ReactiveFormsModule, CommonModule ]
})
export class UploadFilesDialogueComponent {

  files: File[] = [];
  dropZoneActive = false;
  fileControl = new FormControl();
  folder: Folder;

  constructor(
    public dialogRef: MatDialogRef<UploadFilesDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly fileUploadService: FileUploadService,
    private readonly spinner: NgxSpinnerService
  ) {
    this.folder = data.folder;
  }

  // Open file dialog (manual file selection)
  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      this.files.push(...files);
    }
  }

  // Handle file drop
  onDrop(event: any): void {
    event.preventDefault();
    this.dropZoneActive = false;
    const files = event.dataTransfer.files;
    if (files) {
      this.files.push(...files);
    }
  }

  // Drag over event to highlight the drop zone
  onDragOver(event: any): void {
    event.preventDefault();
    this.dropZoneActive = true;
  }

  // Drag leave event to remove the highlight
  onDragLeave(event: any): void {
    this.dropZoneActive = false;
  }

  // Upload files when the user clicks the upload button
  onUpload(): void {
    if (this.files.length === 0) {
      return; // No files selected
    }
    this.spinner.show();
    this.fileUploadService.uploadFiles(this.files, this.folder.id)
      .then(() => {
        this.dialogRef.close(true); // Indicate success
      })
      .catch((error) => {
        console.error('File upload failed:', error);
        this.dialogRef.close(false); // Indicate failure
      })
      .finally(() => {
        this.spinner.hide();
      })
  }

}
