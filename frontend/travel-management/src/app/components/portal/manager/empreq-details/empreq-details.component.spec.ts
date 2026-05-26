import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpreqDetailsComponent } from './empreq-details.component';

describe('EmpreqDetailsComponent', () => {
  let component: EmpreqDetailsComponent;
  let fixture: ComponentFixture<EmpreqDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpreqDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpreqDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
