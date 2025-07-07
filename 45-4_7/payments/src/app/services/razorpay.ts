import { Injectable } from '@angular/core';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {

  constructor() { }

  loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptId = 'razorpay-script';
      if (document.getElementById(scriptId)) {
        resolve();
        return;
      }
  
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject('Razorpay SDK failed to load.');
      document.body.appendChild(script);
    });
  }
  
  createTestOrder(amount: number): Promise<any> {
    return Promise.resolve({
      amount: amount * 100        
    });
  }

  initiatePayment(order: any, customerDetails: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        key: 'rzp_test_aQKIAGNVcCPIh0', 
        amount: order.amount,
        currency: order.currency,
        name: 'Test Payment App',
        description: 'UPI Payment Test',
        order_id: order.id,
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.contact
        },
        notes: {
          address: 'Test Address'
        },
        theme: {
          color: '#3399cc'
        },
        handler: (response: any) => {
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature
          });
        },
        modal: {
          ondismiss: () => {
            resolve({
              success: false,
              message: 'Payment was cancelled by user'
            });
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    });
  }
}
