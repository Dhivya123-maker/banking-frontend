import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountStatementComponent } from './account-statement.component';

describe('AccountStatement', () => {
  let component: AccountStatementComponent;
  let fixture: ComponentFixture<AccountStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountStatementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountStatementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
