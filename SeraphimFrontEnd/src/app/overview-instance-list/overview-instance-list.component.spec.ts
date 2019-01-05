import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewInstanceListComponent } from './overview-instance-list.component';

describe('OverviewInstanceListComponent', () => {
  let component: OverviewInstanceListComponent;
  let fixture: ComponentFixture<OverviewInstanceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewInstanceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewInstanceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
