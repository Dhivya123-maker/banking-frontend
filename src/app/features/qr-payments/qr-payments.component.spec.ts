import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrPaymentsComponent } from './qr-payments.component';

describe('QrPaymentsComponent', () => {
  let component: QrPaymentsComponent;
  let fixture: ComponentFixture<QrPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrPaymentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrPaymentsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
