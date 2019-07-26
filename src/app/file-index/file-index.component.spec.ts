import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileIndexComponent } from './file-index.component';

describe('FileIndexComponent', () => {
  let component: FileIndexComponent;
  let fixture: ComponentFixture<FileIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
