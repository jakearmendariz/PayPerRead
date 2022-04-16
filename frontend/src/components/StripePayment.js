import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useState, useEffect } from 'react';
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

  const initialValues = { name: "", amount: "" };
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const stripeTokenHandler = (token) => {
    // Insert the token ID into the form so it gets submitted to the server
    const form = document.getElementById('payment-form');
    const hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'stripeToken');
    hiddenInput.setAttribute('value', token.id);
    form.appendChild(hiddenInput);
  
    // Submit the form
    form.submit();
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormErrors(validate(formValues));
    setIsSubmit(true);

    const {token, error} = await stripe.createToken(elements.getElement(CardElement));
    payload.cents = event.target.amount.value * 100;
    payload.id = token.id;
    console.log("TOKEN",token.id);

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

  useEffect(() => {
    console.log(formErrors);
    if (Object.keys(formErrors).length === 0 && isSubmit) {
      console.log(formValues);
    }
  }, [formErrors]);
  const validate = (values) => {
    const errors = {};
    const nameCheck = /^[a-z ,.'-]+$/i;
    const amountCheck = /^\$?\-?([1-9]{1}[0-9]{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\-?\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\(\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))\)$/i;
    if (!nameCheck.test(values.name)){
      errors.name = "Name must match name on the card.";
    } else if (!values.name) {
      errors.name = "Name must match name on the card.";
    }
    if (!values.amount) {
      errors.amount = "Please enter a numeric amount.";
    } else if (!amountCheck.test(values.amount)){
      errors.amount = "Please enter a numeric amount.";
    }
    return errors;
  };

  return (
    <>
      {!success
        ? (
          <Card
            title="Add to Balance"
            style={{ width: '25rem', height: '22rem', margin: '1rem auto' }}
          >
            <form onSubmit={handleSubmit}>
              <fieldset className="FormGroup">
                <label>Name on Card</label>
                <div className="FormRow">
                  <input placeholder="John Doe"
                    name="name"
                    value={formValues.name}
                    onChange={handleChange}
                  />
                </div>
                <p style={{color: "red"}}>{formErrors.name}</p>
                <label>Amount</label>
                <div className="FormRow">
                  <input placeholder="5"
                    name = "amount"
                    value = {formValues.amount}
                    onChange={handleChange} />
                </div>
                <p style={{color: "red"}}>{formErrors.amount}</p>
                <div className="FormRow" style={{ marginTop: '0.5rem' }}>
                  <CardElement options={CARD_OPTIONS} />
                </div>
              </fieldset>
              <button className="btn btn-primary btn-s" style={{ width: '100%', marginTop: '1rem' }}>Pay</button>
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
                <NavLink to={paymentRedirect} className="btn btn-primary btn-s" style={{ marginTop: '1rem' }}>Done</NavLink>
              </Column>
            </Row>
          </Card>
        )}
    </>
  );
}
