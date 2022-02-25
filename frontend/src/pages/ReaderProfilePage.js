import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';
import { formatBalance } from '../utils/methods';
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

const sectionWidth = '55rem'

function AccountDetails({ balance, articles }) {
  return (
    <Card style={{ width: '25rem', height: '13rem', marginBottom: "1rem" }} title="Account Details">
      <Subtitle>Balance</Subtitle>
      <Text>
        {formatBalance(balance)}
      </Text>
      <Subtitle>Articles Owned</Subtitle>
      <Text>
        {articles.length}
      </Text>
    </Card>
  );
}

function PaymentMethod() {
  return (
    <Card style={{ width: '25rem', height: '13rem', marginBottom: "1rem" }} title="Payment Method">
      <Subtitle>Visa</Subtitle>
      <Text>
        ****-****-****-1234
      </Text>
    </Card>
  );
}

function PurchaseEntry({ purchase }) {
  return (
    <tr>
      <td>{purchase.domain}</td>
      <td>{purchase.article_name}</td>
      <td>{formatBalance(purchase.price)}</td>
    </tr>
  );
}

function PurchaseHistory({ purchases }) {
  purchases = purchases.map((purchase, index) => <PurchaseEntry purchase={purchase} key={index} />);

  return (
    <Card style={{ width: '100%', minHeight: '100%' }} title="Purchase History">
      <Table responsive>
        <thead>
          <tr>
            <th>Domain</th>
            <th>Article</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {purchases}
        </tbody>
      </Table>
    </Card>
  );
}

const fetchPurchases = async (articles) => {
  const purchases = [];
  for (let i = 0; i < articles.length; i++) {
    let article_detail = await fetch(`http://localhost:8000/articles/${articles[i]}`);
    article_detail = await article_detail.json();
    purchases.push({
      domain: article_detail.domain,
      article_name: article_detail.article_name,
      price: article_detail.price,
    });
  }
  return purchases;
};

function ReaderProfilePage() {
  const navigate = useNavigate();
  const [reader, setReader] = useState({
    balance: {
      dollars: 0,
      cents: 0,
    },
    articles: [],
  });

  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/reader/account', {
      credentials: 'include',
    })
      .then((resp) => resp.json())
      .then((data) => {
        setReader(data);
        // Convert article guids into purchase data
        fetchPurchases(data.articles, setPurchases).then((result) => {
          setPurchases(result);
        });
      })
      .catch((err) => {
        // Reader need to sign in first
        navigate('/signin/reader');
      });
  }, []);

  return (
    <div className="center-content" style={{ marginTop: '5rem' }}>
      <ResponsiveWidth style={{ minHeight: '20rem' }} maxWidth={sectionWidth}>
        <Column>
          <Row maxWidth={sectionWidth}>
            <AccountDetails
              balance={reader.balance}
              articles={reader.articles}
            />
            <PaymentMethod />
          </Row>
          <PurchaseHistory
            purchases={purchases}
          />
        </Column>
      </ResponsiveWidth>
    </div>
  );
}

export default ReaderProfilePage;
