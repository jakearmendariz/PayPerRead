import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';
import StripePayment from '../components/StripePayment';

const PUBLIC_KEY = 'pk_test_TYooMQauvdEDq54NiTphI7jx';

const stripeTestPromise = loadStripe(PUBLIC_KEY);

export default function AddBalance() {
  return (
    <Elements stripe={stripeTestPromise}>
      <StripePayment />
    </Elements>
  );
}
