import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewEventActionListComponent } from './overview-event-action-list.component';

describe('OverviewEventActionListComponent', () => {
  let component: OverviewEventActionListComponent;
  let fixture: ComponentFixture<OverviewEventActionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewEventActionListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewEventActionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
