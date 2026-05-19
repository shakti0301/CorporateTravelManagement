import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { TravelRequestComponent } from './travel-request.component';
import { RequestService } from '../../../../services/request/request.service';

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

describe('TravelRequestComponent', () => {
  let component: TravelRequestComponent;
  let fixture: ComponentFixture<TravelRequestComponent>;
  let requestServiceSpy: jasmine.SpyObj<RequestService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    requestServiceSpy = jasmine.createSpyObj<RequestService>('RequestService', [
      'createRequest',
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TravelRequestComponent],
      providers: [
        { provide: RequestService, useValue: requestServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TravelRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark past dates as invalid', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    component.requestForm.patchValue({
      fromDate: formatDateForInput(yesterday),
      toDate: formatDateForInput(new Date()),
    });

    expect(component.fromDate?.hasError('pastDateNotAllowed')).toBeTrue();
  });

  it('should not save a draft with past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    component.requestForm.patchValue({
      destination: 'Pune, India',
      fromDate: formatDateForInput(yesterday),
      toDate: formatDateForInput(new Date()),
      purpose: 'Business review meeting',
      cost: 1500,
    });

    component.saveDraft();

    expect(requestServiceSpy.createRequest).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
