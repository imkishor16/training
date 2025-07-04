import { TestBed } from '@angular/core/testing';
import { RazorpayService } from './razorpay';

describe('RazorpayService', () => {
  let service: RazorpayService;
  let mockScript: any;

  beforeEach(() => {
    // Mock document methods
    mockScript = {
      id: '',
      src: '',
      onload: null,
      onerror: null
    };

    spyOn(document, 'getElementById').and.returnValue(null);
    spyOn(document, 'createElement').and.returnValue(mockScript);
    spyOn(document.body, 'appendChild');

    TestBed.configureTestingModule({
      providers: [RazorpayService]
    });
    service = TestBed.inject(RazorpayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadRazorpayScript', () => {
    

    it('should load script if not already loaded', (done) => {
      service.loadRazorpayScript().then(() => {
        expect(document.createElement).toHaveBeenCalledWith('script');
        expect(mockScript.id).toBe('razorpay-script');
        expect(mockScript.src).toBe('https://checkout.razorpay.com/v1/checkout.js');
        expect(document.body.appendChild).toHaveBeenCalledWith(mockScript);
        done();
      });

      // Simulate script load success
      mockScript.onload();
    });

    it('should reject if script fails to load', (done) => {
      service.loadRazorpayScript().catch((error) => {
        expect(error).toBe('Razorpay SDK failed to load.');
        done();
      });

      // Simulate script load error
      mockScript.onerror();
    });
  });

  describe('createTestOrder', () => {
    it('should create a test order with correct amount in paise', async () => {
      const amount = 100;
      const order = await service.createTestOrder(amount);

      expect(order.amount).toBe(amount * 100); // Should be in paise
    });
  });

  describe('initiatePayment', () => {
    it('should create Razorpay instance with correct options', (done) => {
      const mockRazorpay = jasmine.createSpyObj('Razorpay', ['open']);
      const mockOrder = {
        id: 'order_123',
        amount: 10000,
        currency: 'INR'
      };
      const mockCustomerDetails = {
        name: 'Test User',
        email: 'test@example.com',
        contact: '1234567890'
      };

      // Mock Razorpay constructor
      (window as any).Razorpay = jasmine.createSpy('Razorpay').and.returnValue(mockRazorpay);

      service.initiatePayment(mockOrder, mockCustomerDetails).then(() => {
        expect((window as any).Razorpay).toHaveBeenCalledWith({
          key: 'rzp_test_aQKIAGNVcCPIh0',
          amount: 10000,
          currency: 'INR',
          name: 'Test Payment App',
          description: 'UPI Payment Test',
          order_id: 'order_123',
          prefill: {
            name: 'Test User',
            email: 'test@example.com',
            contact: '1234567890'
          },
          notes: {
            address: 'Test Address'
          },
          theme: {
            color: '#3399cc'
          },
          handler: jasmine.any(Function),
          modal: {
            ondismiss: jasmine.any(Function)
          }
        });
        expect(mockRazorpay.open).toHaveBeenCalled();
        done();
      });

      // Simulate successful payment
      const options = (window as any).Razorpay.calls.mostRecent().args[0];
      options.handler({
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'signature_123'
      });
    });

    it('should resolve with success result when payment is successful', (done) => {
      const mockRazorpay = jasmine.createSpyObj('Razorpay', ['open']);
      const mockOrder = { id: 'order_123', amount: 10000, currency: 'INR' };
      const mockCustomerDetails = { name: 'Test', email: 'test@test.com', contact: '1234567890' };

      (window as any).Razorpay = jasmine.createSpy('Razorpay').and.returnValue(mockRazorpay);

      service.initiatePayment(mockOrder, mockCustomerDetails).then((result) => {
        expect(result).toEqual({
          success: true,
          paymentId: 'pay_123',
          orderId: 'order_123',
          signature: 'signature_123'
        });
        done();
      });

      const options = (window as any).Razorpay.calls.mostRecent().args[0];
      options.handler({
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'signature_123'
      });
    });

    it('should resolve with failure result when payment is cancelled', (done) => {
      const mockRazorpay = jasmine.createSpyObj('Razorpay', ['open']);
      const mockOrder = { id: 'order_123', amount: 10000, currency: 'INR' };
      const mockCustomerDetails = { name: 'Test', email: 'test@test.com', contact: '1234567890' };

      (window as any).Razorpay = jasmine.createSpy('Razorpay').and.returnValue(mockRazorpay);

      service.initiatePayment(mockOrder, mockCustomerDetails).then((result) => {
        expect(result).toEqual({
          success: false,
          message: 'Payment was cancelled by user'
        });
        done();
      });

      const options = (window as any).Razorpay.calls.mostRecent().args[0];
      options.modal.ondismiss();
    });
  });
});
