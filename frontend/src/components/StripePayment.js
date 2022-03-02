import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import Card from './Card';
import { Row, Column } from '../utils/Adjustments';

import { selectPaymentRedirect } from '../redux/slice';

const Subtitle = styled.span`
  color: grey;
`;

const Text = styled.span`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const CARD_OPTIONS = {
  iconStyle: 'solid',
  style: {
    base: {
      fontWeight: 25,
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '20px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': { color: '#green' },
    },
    invalid: {
      iconColor: '#red',
      color: 'red',
    },
  },
};

export default function StripePayment() {
  const [success, setSuccess] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const paymentRedirect = useSelector(selectPaymentRedirect);

  const payload = {
    dollars: 0,
    cents: 0,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });
    payload.cents = event.target.amounts.value * 100;

    if (!error) {
      try {
        const p = JSON.stringify(payload);
        fetch('http://localhost:8000/reader/add-balance', {
          method: 'POST',
          credentials: 'include',
          body: p,
        }).then((response) => {
          setSuccess(true);
        });
      } catch (error) {
        console.log('Error', error);
      }
    } else {
      console.log(error.message);
    }
  };

  return (
    <>
      {!success
        ? (
          <Card
            title="Add to Balance"
            style={{ width: '25rem', height: '20rem', margin: '1rem auto' }}
          >
            <form onSubmit={handleSubmit}>
              <fieldset className="FormGroup">
                <label>Name on Card</label>
                <div className="FormRow">
                  <input placeholder="John Doe" />
                </div>
                <label>Amount</label>
                <div className="FormRow">
                  <input placeholder="5" id="amounts" />
                </div>
                <div className="FormRow" style={{ marginTop: '0.5rem' }}>
                  <CardElement options={CARD_OPTIONS} />
                </div>
              </fieldset>
              <button className="btn btn-primary btn-s" style={{width: '100%', marginTop: '1rem'}}>Pay</button>
            </form>
          </Card>
        )
        : (
          <Card
            title="Notice"
            style={{ width: '25rem', height: '13rem', margin: '1rem auto' }}
          >
            <Row>
              <Column style={{ marginRight: '1rem' }}>
                <Subtitle>Complete</Subtitle>
                <Text>Funds have been added to your account.</Text>
                <NavLink to={paymentRedirect} className="btn btn-primary btn-s" style={{marginTop: '1rem'}}>Done</NavLink>
              </Column>
            </Row>
          </Card>
        )}
    </>
  );
}
