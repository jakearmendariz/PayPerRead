import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';
import StripePayment from '../components/StripePayment';

const PUBLIC_KEY = 'pk_test_51KYcymLgAc4XBmZdeNPcH4loZzUuHC0OhRWfPcMO1BISKc8qnlGTVvJd2XZjspvOxpgQu2aglXdVBNMDuotROWWu00VYMu5eTd';

const stripeTestPromise = loadStripe(PUBLIC_KEY);

export default function AddBalance() {
  return (
    <Elements stripe={stripeTestPromise}>
      <StripePayment />
    </Elements>
  );
}
