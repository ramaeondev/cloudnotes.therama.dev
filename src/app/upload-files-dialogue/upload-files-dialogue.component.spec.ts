import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFilesDialogueComponent } from './upload-files-dialogue.component';

describe('UploadFilesDialogueComponent', () => {
  let component: UploadFilesDialogueComponent;
  let fixture: ComponentFixture<UploadFilesDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadFilesDialogueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadFilesDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
