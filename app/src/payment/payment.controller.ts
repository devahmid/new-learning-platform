import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import * as paypal from '@paypal/checkout-server-sdk';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Get('stripe')
    createStripeCheckout(
        @Query('amount') amount: string,
        @Query('userId') userId: string
    ) {
        return this.paymentService.createStripeSession(+userId, +amount);
    }

    @Get('paypal')
    createPayPalOrder(
        @Query('amount') amount: string,
        @Query('userId') userId: string
    ) {
        return this.paymentService.createPayPalOrder(+userId, amount);
    }

    @Get('history')
    getUserPayments(@Query('userId') userId: string) {
        return this.paymentService.getUserPayments(+userId);
    }

    @Get('paypal-client-id')
    getPayPalClientId() {
        return { clientId: process.env.PAYPAL_CLIENT_ID };
    }

    @Post('stripe-session')
    createStripeSessionPost(@Body() body: { userId: number; amount: number }) {
        return this.paymentService.createStripeSession(body.userId, body.amount);
    }

    @Post('paypal-capture')
    async capturePayPalOrder(@Body() body: { orderId: string }) {
        return this.paymentService.capturePayPalOrder(body.orderId);
    }

    @Post('intent')
    createIntent(@Body() body: { userId: number; amount: number }) {
        return this.paymentService.createPaymentIntent(body.userId, body.amount);
    }



}
