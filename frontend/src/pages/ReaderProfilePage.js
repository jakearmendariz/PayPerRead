import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';
import Table from 'react-bootstrap/Table';
import { formatBalance, formatNumber, fetchArticles } from '../utils/methods';
import { Row, Column, ResponsiveWidth } from '../utils/Adjustments';
import { buildApiUrl } from '../utils/ApiConfig';
import Card from '../components/Card';
import LoadingIcon from '../components/LoadingIcon';

const Subtitle = styled.span`
  color: grey;
`;

const Text = styled.span`
  font-size: 1.1rem;
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

function AccountDetails({ balance, articles }) {
  return (
    <Card style={{ width: '25rem', height: '13rem', marginBottom: '1rem' }} title="Account Details">
      <Subtitle>
        Balance
        <a
          href="reader/add-balance"
          style={{ marginLeft: '0.5rem', color: 'grey', textAlign: 'center' }}
        >
          <i className="fas fa-plus" />
        </a>
      </Subtitle>
      <Text>
        {formatBalance(balance)}
      </Text>
      <Subtitle>Articles Owned</Subtitle>
      <Text>
        {formatNumber(articles.length)}
      </Text>
    </Card>
  );
}

function PaymentMethod({name, email}) {
  return (
    <Card style={{ width: '25rem', height: '13rem', marginBottom: '1rem' }} title="Profile Info">
      <Text>Name: {name}</Text>
      <Text>Email: {email}</Text>
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

function PurchaseHistory({ purchases, loading }) {
  purchases = purchases.map((purchase, index) => <PurchaseEntry purchase={purchase} key={index} />);
  function Bottom() {
    return purchases.length === 0 ? <Placeholder>None</Placeholder> : <></>;
  }
  if (loading) {
    Bottom = function () {
      return <LoadingIcon />;
    };
  }
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
          {
            loading
              ? <></>
              : purchases
          }
        </tbody>
      </Table>
      <Bottom />
    </Card>
  );
}

function ReaderProfilePage() {
  const navigate = useNavigate();
  const [reader, setReader] = useState({
    name: '',
    email: '',
    balance: {
      dollars: 0,
      cents: 0,
    },
    articles: [],
  });

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(buildApiUrl('reader/account'), {
      credentials: 'include',
    })
      .then((resp) => resp.json())
      .then((data) => {
        setReader(data);
        // Convert article guids into purchase data
        fetchArticles(data.articles, setPurchases).then((result) => {
          setPurchases(result);
          setLoading(false);
        });
      })
      .catch((err) => {
        // Reader need to sign in first
        navigate('/signin/reader');
      });
  }, []);

  return (
    <div className="center-content" style={{ marginTop: '5rem' }}>
      <ResponsiveWidth maxWidth={sectionWidth}>
        <Column>
          <Row maxWidth={sectionWidth}>
            <AccountDetails
              balance={reader.balance}
              articles={reader.articles}
            />
            <PaymentMethod 
              name={reader.name}
              email={reader.email}
            />
          </Row>
          <PurchaseHistory
            purchases={purchases}
            loading={loading}
          />
        </Column>
      </ResponsiveWidth>
    </div>
  );
}

export default ReaderProfilePage;
