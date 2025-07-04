import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PaymentForm } from './payment-form';
import { RazorpayService } from '../../services/razorpay';

describe('PaymentForm', () => {
  let component: PaymentForm;
  let fixture: ComponentFixture<PaymentForm>;
  let razorpayService: jasmine.SpyObj<RazorpayService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('RazorpayService', [
      'loadRazorpayScript',
      'createTestOrder',
      'initiatePayment'
    ]);

    await TestBed.configureTestingModule({
      imports: [PaymentForm, ReactiveFormsModule],
      providers: [
        { provide: RazorpayService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentForm);
    component = fixture.componentInstance;
    razorpayService = TestBed.inject(RazorpayService) as jasmine.SpyObj<RazorpayService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.paymentForm.get('amount')?.value).toBeNull();
    expect(component.paymentForm.get('name')?.value).toBe('');
    expect(component.paymentForm.get('email')?.value).toBe('');
    expect(component.paymentForm.get('contact')?.value).toBe('');
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const form = component.paymentForm;
      
      expect(form.get('amount')?.errors?.['required']).toBeTruthy();
      expect(form.get('name')?.errors?.['required']).toBeTruthy();
      expect(form.get('email')?.errors?.['required']).toBeTruthy();
      expect(form.get('contact')?.errors?.['required']).toBeTruthy();
    });

    it('should validate amount is greater than 0', () => {
      const amountControl = component.paymentForm.get('amount');
      amountControl?.setValue(0);
      expect(amountControl?.errors?.['min']).toBeTruthy();
      
      amountControl?.setValue(-1);
      expect(amountControl?.errors?.['min']).toBeTruthy();
      
      amountControl?.setValue(1);
      expect(amountControl?.errors?.['min']).toBeFalsy();
    });

    it('should validate email format', () => {
      const emailControl = component.paymentForm.get('email');
      
      emailControl?.setValue('invalid-email');
      expect(emailControl?.errors?.['email']).toBeTruthy();
      
      emailControl?.setValue('valid@email.com');
      expect(emailControl?.errors?.['email']).toBeFalsy();
    });

    it('should validate contact number is 10 digits', () => {
      const contactControl = component.paymentForm.get('contact');
      
      contactControl?.setValue('123');
      expect(contactControl?.errors?.['pattern']).toBeTruthy();
      
      contactControl?.setValue('12345678901');
      expect(contactControl?.errors?.['pattern']).toBeTruthy();
      
      contactControl?.setValue('1234567890');
      expect(contactControl?.errors?.['pattern']).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    it('should not submit if form is invalid', async () => {
      await component.onSubmit();
      
      expect(razorpayService.loadRazorpayScript).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when submitting invalid form', async () => {
      await component.onSubmit();
      
      expect(component.paymentForm.get('amount')?.touched).toBeTruthy();
      expect(component.paymentForm.get('name')?.touched).toBeTruthy();
      expect(component.paymentForm.get('email')?.touched).toBeTruthy();
      expect(component.paymentForm.get('contact')?.touched).toBeTruthy();
    });

    it('should submit if form is valid', async () => {
      // Fill form with valid data
      component.paymentForm.patchValue({
        amount: 100,
        name: 'Test User',
        email: 'test@example.com',
        contact: '1234567890'
      });
      
      razorpayService.loadRazorpayScript.and.returnValue(Promise.resolve());
      razorpayService.createTestOrder.and.returnValue(Promise.resolve({ amount: 10000 }));
      razorpayService.initiatePayment.and.returnValue(Promise.resolve({ success: true }));
      
      await component.onSubmit();
      
      expect(razorpayService.loadRazorpayScript).toHaveBeenCalled();
      expect(razorpayService.createTestOrder).toHaveBeenCalledWith(100);
      expect(razorpayService.initiatePayment).toHaveBeenCalled();
    });
  });

  describe('Payment Processing', () => {
    beforeEach(() => {
      // Fill form with valid data
      component.paymentForm.patchValue({
        amount: 100,
        name: 'Test User',
        email: 'test@example.com',
        contact: '1234567890'
      });
    });

    it('should handle successful payment', async () => {
      const mockOrder = { amount: 10000 };
      const mockPaymentResult = {
        success: true,
        paymentId: 'pay_123',
        orderId: 'order_123',
        signature: 'signature_123'
      };

      razorpayService.loadRazorpayScript.and.returnValue(Promise.resolve());
      razorpayService.createTestOrder.and.returnValue(Promise.resolve(mockOrder));
      razorpayService.initiatePayment.and.returnValue(Promise.resolve(mockPaymentResult));

      await component.onSubmit();

      expect(razorpayService.loadRazorpayScript).toHaveBeenCalled();
      expect(razorpayService.createTestOrder).toHaveBeenCalledWith(100);
      expect(razorpayService.initiatePayment).toHaveBeenCalledWith(mockOrder, {
        name: 'Test User',
        email: 'test@example.com',
        contact: '1234567890',
        upi: 'success@razorpay'
      });
      expect(component.paymentResult).toEqual({
        success: true,
        message: 'Payment completed successfully!',
        paymentId: 'pay_123'
      });
      expect(component.loading).toBeFalse();
    });

    it('should handle failed payment', async () => {
      const mockOrder = { amount: 10000 };
      const mockPaymentResult = {
        success: false,
        message: 'Payment was cancelled by user'
      };

      razorpayService.loadRazorpayScript.and.returnValue(Promise.resolve());
      razorpayService.createTestOrder.and.returnValue(Promise.resolve(mockOrder));
      razorpayService.initiatePayment.and.returnValue(Promise.resolve(mockPaymentResult));

      await component.onSubmit();

      expect(component.paymentResult).toEqual({
        success: false,
        message: 'Payment was cancelled by user'
      });
      expect(component.loading).toBeFalse();
    });

    it('should handle payment errors', async () => {
      razorpayService.loadRazorpayScript.and.returnValue(Promise.reject(new Error('Script load failed')));

      await component.onSubmit();

      expect(component.paymentResult).toEqual({
        success: false,
        message: 'An error occurred during payment.'
      });
      expect(component.loading).toBeFalse();
    });
  });

  describe('Loading States', () => {
    

    it('should set loading to false when payment completes', async () => {
      component.paymentForm.patchValue({
        amount: 100,
        name: 'Test User',
        email: 'test@example.com',
        contact: '1234567890'
      });

      razorpayService.loadRazorpayScript.and.returnValue(Promise.resolve());
      razorpayService.createTestOrder.and.returnValue(Promise.resolve({}));
      razorpayService.initiatePayment.and.returnValue(Promise.resolve({ success: true }));

      await component.onSubmit();

      expect(component.loading).toBeFalse();
    });
  });
});
