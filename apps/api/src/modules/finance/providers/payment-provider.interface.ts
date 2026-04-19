export interface PaymentInvoiceRequest {
  amount: number;
  studentId: string;
  branchId: string;
  transactionId: string;
  description?: string;
  metadata?: any;
}

export interface PaymentInvoiceResponse {
  paymentUrl?: string;
  transactionId: string;
}

export interface PaymentProvider {
  name: string;
  createInvoice(request: PaymentInvoiceRequest, settings: any): Promise<PaymentInvoiceResponse>;
  // Webhook handling methods will be added as we implement each provider
}
