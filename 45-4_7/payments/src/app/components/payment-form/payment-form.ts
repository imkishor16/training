import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RazorpayService } from '../../services/razorpay';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.css'
})
export class PaymentForm {
  paymentForm: FormGroup;
  paymentResult: { success: boolean, message: string, paymentId?: string } | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private razorpayService: RazorpayService
  ) {
    this.paymentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });
  }

  get f() {
    return this.paymentForm.controls;
  }

  async onSubmit() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.paymentResult = null;

    try {
      // Load Razorpay script
      await this.razorpayService.loadRazorpayScript();

      // Create a test order
      const order = await this.razorpayService.createTestOrder(
        this.paymentForm.value.amount
      );

      // Prepare customer details
      const customerDetails = {
        name: this.paymentForm.value.name,
        email: this.paymentForm.value.email,
        contact: this.paymentForm.value.contact,
        upi: 'success@razorpay' // or 'failure@razorpay' to simulate failure
      };

      // Initiate the payment using RazorpayService
      const result = await this.razorpayService.initiatePayment(order, customerDetails);

      if (result.success) {
        this.paymentResult = {
          success: true,
          message: 'Payment completed successfully!',
          paymentId: result.paymentId
        };
      } else {
        this.paymentResult = {
          success: false,
          message: result.message || 'Payment failed or was cancelled.'
        };
      }

    } catch (error) {
      console.error('Payment error:', error);
      this.paymentResult = {
        success: false,
        message: 'An error occurred during payment.'
      };
    } finally {
      this.loading = false;
    }
  }
}
