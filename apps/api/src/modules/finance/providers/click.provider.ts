import { PaymentInvoiceRequest, PaymentInvoiceResponse, PaymentProvider } from './payment-provider.interface';

export class ClickProvider implements PaymentProvider {
  name = 'click';

  async createInvoice(request: PaymentInvoiceRequest, settings: any): Promise<PaymentInvoiceResponse> {
    const { amount, studentId, branchId } = request;
    const { merchant_id, service_id } = settings;

    if (!merchant_id || !service_id) {
       throw new Error('Click settings not configured for this branch');
    }

    // click.uz payment URL construction
    // https://my.click.uz/services/pay?service_id=ID&merchant_id=ID&amount=VALUE&transaction_param=ID&return_url=URL
    
    const paymentUrl = `https://my.click.uz/services/pay?service_id=${service_id}&merchant_id=${merchant_id}&amount=${amount}&transaction_param=${request.transactionId}`;

    return {
      paymentUrl,
      transactionId: request.transactionId
    };
  }

  // Click Webhook Methods
  async verifySignature(data: any, settings: any): Promise<boolean> {
     // Implementation of Click signature verification (MD5 of request params + secret key)
     return true; // Simplified for now
  }
}
