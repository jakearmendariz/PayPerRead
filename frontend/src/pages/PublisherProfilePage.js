import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { formatBalance, formatNumber } from '../utils/methods';
import { Row, Column } from '../utils/Alignments';

import styled from 'styled-components';
import Card from '../components/Card';



const Subtitle = styled.span`
  color: grey;
`;

const Text = styled.span`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const PriceTh = styled.th`
  width: 7rem;
  padding-left: 2rem;
  font-weight: normal;
  vertical-align: top;
`;

const Articleth = styled.th`
  font-weight: normal;
`;
const Divider = styled.hr`
    border-top: 2px solid #bbb;
`;

const TableDomain = styled.span`
  color: grey;
`;

const AccountOverview = (props) => {
  return (
    <Card title="Account Overview" style={{ width: '25rem' }}>
      <Row>
        <Column style={{marginRight: '1rem'}}>
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
  )
}


const DirectDeposit = () => {
  return (
    <Card title="Direct Deposit" style={{width: '25rem'}}>

    </Card>
  )
}

function PublisherProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="center-content" style={{ marginTop: '5rem' }}>
      <Column style={{width: "55rem"}}>
      <Row>
        <AccountOverview />
        <DirectDeposit />
      </Row>
      </Column>
    </div>
  );
}

export default PublisherProfilePage;
