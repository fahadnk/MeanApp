import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerTasksComponent } from './manager-tasks.component';

describe('ManagerTasksComponent', () => {
  let component: ManagerTasksComponent;
  let fixture: ComponentFixture<ManagerTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagerTasksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
