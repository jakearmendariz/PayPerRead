import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import styled from 'styled-components';
import Navbar from '../components/Navbar';
import Card from '../components/Card';

const Subtitle = styled.span`
  color: grey;
`;

const Text = styled.span`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  width: 55rem;
  margin-bottom: 2rem
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  height: 25rem;
`;

function AccountDetails() {
  return (
    <Card style={{ width: '20rem' }} title="Account Details">
      <Subtitle>Balance</Subtitle>
      <Text>
        $55.03
      </Text>
      <Subtitle>Articles Owned</Subtitle>
      <Text>
        38
      </Text>
    </Card>
  );
}

function PaymentMethod() {
  return (
    <Card style={{ width: '30rem' }} title="Payment Method">
      <Subtitle>Visa</Subtitle>
      <Text>
        ****-****-****-1234
      </Text>
    </Card>
  );
}

function PurchaseHistory() {
  return (
    <Card style={{ width: '55rem' }} title="Purchase History">
      <Subtitle>medium.com</Subtitle>
      <Text>
        One Article to Understand The Past, Present, and Future of Web 3.0 | $1.25
      </Text>

      <Subtitle>nytimes.com</Subtitle>
      <Text>
        How Long Covid Exhausts the Body | $0.75
      </Text>

      <Subtitle>theguardian.com</Subtitle>
      <Text>
        Bitcoin miners revived a dying coal plant - then CO2 emissions soared | $2.00
      </Text>
    </Card>
  );
}

function ReaderProfilePage() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/reader/account', {
      credentials: 'include',
    })
      .then((resp) => resp.json())
      .then((data) => console.log(data))
      .catch((err) => {
        // Reader need to sign in first
        navigate('/signin/reader');
      });
  });

  return (
    <>
      <Navbar />
      <div className="center-content">
        <Column>
          <Row>
            <AccountDetails />
            <PaymentMethod />
          </Row>
          <PurchaseHistory />
        </Column>
      </div>
    </>
  );
}

export default ReaderProfilePage;
