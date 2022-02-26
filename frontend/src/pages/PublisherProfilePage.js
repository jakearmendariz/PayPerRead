import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import styled from 'styled-components';
import { formatBalance, formatNumber } from '../utils/methods';
import { Row, Column, ResponsiveWidth } from '../utils/Adjustments';
import Table from 'react-bootstrap/Table';
import Card from '../components/Card';

const Subtitle = styled.span`
  color: grey;
`;

const Text = styled.span`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const Placeholder = styled.div`
  width: 100%;
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: #bbb;
  padding: 2rem 0;
`;

const sectionWidth = '55rem';

const AccountOverview = (props) => {
  return (
    <Card
      title="Account Overview"
      style={{ width: '25rem', height: '13rem', marginBottom: '1rem' }}>
      <Row >
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

const DirectDeposit = () => {
  return (
    <Card
      title="Direct Deposit"
      style={{ width: '25rem', height: '13rem', marginBottom: '1rem' }} />
  );
}

const RegisteredArticles = () => {

  return (
    <Card style={{ width: '100%', minHeight: '100%' }} title="Registered Articles">
      <Table responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Views</th>
            <th>Revenue</th>
          </tr>
        </thead>
      </Table>
      <Placeholder>
        None
      </Placeholder>
    </Card>
  )
}

function PublisherProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="center-content" style={{ marginTop: '5rem' }}>
      <ResponsiveWidth maxWidth={sectionWidth}>
        <Column>
          <Row maxWidth={sectionWidth}>
            <AccountOverview />
            <DirectDeposit />
          </Row>
          <RegisteredArticles />
        </Column>
      </ResponsiveWidth>
    </div>
  );
}

export default PublisherProfilePage;
