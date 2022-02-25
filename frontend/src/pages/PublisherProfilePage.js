import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import styled from 'styled-components';
import { formatBalance, formatNumber } from '../utils/methods';
import { Row, Column } from '../utils/Adjustments';

import Card from '../components/Card';

const Subtitle = styled.span`
  color: grey;
`;

const Text = styled.span`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

function AccountOverview(props) {
  return (
    <Card title="Account Overview" style={{ width: '25rem' }}>
      <Row>
        <Column style={{ marginRight: '1rem' }}>
          <Subtitle>Domain</Subtitle>
          <Text>ABC.com</Text>
          <Subtitle>Balance</Subtitle>
          <Text>{formatNumber('$1938.55')}</Text>
        </Column>

        <Column>
          <Subtitle>Articles Registered</Subtitle>
          <Text>{formatNumber('1271')}</Text>
          <Subtitle>Total Article Views</Subtitle>
          <Text>{formatNumber('38299')}</Text>
        </Column>
      </Row>
    </Card>
  );
}

function DirectDeposit() {
  return (
    <Card title="Direct Deposit" style={{ width: '25rem' }} />
  );
}

function PublisherProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="center-content" style={{ marginTop: '5rem' }}>
      <Column style={{ width: '55rem' }}>
        <Row>
          <AccountOverview />
          <DirectDeposit />
        </Row>
      </Column>
    </div>
  );
}

export default PublisherProfilePage;
