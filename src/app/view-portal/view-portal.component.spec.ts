import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPortalComponent } from './view-portal.component';

describe('ViewPortalComponent', () => {
  let component: ViewPortalComponent;
  let fixture: ComponentFixture<ViewPortalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPortalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
