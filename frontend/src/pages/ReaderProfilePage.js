import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import styled from 'styled-components';
import { setUseProxies } from 'immer';
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

function formatBalance(balance) {
  const convertedBalance = balance.dollars + balance.cents / 100;
  return `$${convertedBalance.toFixed(2)}`;
}

function AccountDetails({ balance, articles }) {
  return (
    <Card style={{ width: '20rem' }} title="Account Details">
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
    <Card style={{ width: '30rem' }} title="Payment Method">
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
      <Articleth>
        <TableDomain>
          {purchase.domain}
        </TableDomain>
        <div>
          {purchase.article_name}
        </div>
      </Articleth>
      <PriceTh>{formatBalance(purchase.price)}</PriceTh>
    </tr>
  );
}

function PurchaseHistory({ purchases }) {
  purchases = purchases.map((purchase, index) => <PurchaseEntry purchase={purchase} key={index} />);

  return (
    <Card style={{ width: '55rem', minHeight: '20rem' }} title="Purchase History">
      <table style={{ fontSize: '1rem' }}>
        <tbody>
          <tr>
            <Articleth
              style={{ paddingBottom: '0.5rem', fontSize: '1.2rem' }}
            >
              Article
            </Articleth>
            <PriceTh
              style={{ fontSize: '1.2rem' }}
            >
              Price
            </PriceTh>
          </tr>
          {purchases}
        </tbody>
      </table>
    </Card>
  );
}

const fetchPurchases = async (articles) => {
  const purchases = [];
  for (let i = 0; i < articles.length; i++) {
    console.log(articles[i])
    let article_detail = await fetch(`http://localhost:8000/articles/${articles[i]}`);
    article_detail = await article_detail.json();
    purchases.push({
      domain: article_detail.domain,
      article_name: article_detail.article_name,
      price: article_detail.price,
    });
  }
  console.log(purchases);
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
      <Column>
        <Row>
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
    </div>
  );
}

export default ReaderProfilePage;
