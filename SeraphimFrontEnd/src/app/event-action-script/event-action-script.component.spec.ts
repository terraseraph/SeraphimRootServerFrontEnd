import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventActionScriptComponent } from './event-action-script.component';

describe('EventActionScriptComponent', () => {
  let component: EventActionScriptComponent;
  let fixture: ComponentFixture<EventActionScriptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventActionScriptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventActionScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
