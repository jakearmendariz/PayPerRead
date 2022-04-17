import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';
import Table from 'react-bootstrap/Table';
import {
  formatBalance, formatNumber,
  fetchArticles, multiplyBalance, zeroBalance,
} from '../utils/methods';
import { Row, Column, ResponsiveWidth } from '../utils/Adjustments';
import Card from '../components/Card';
import { buildApiUrl } from '../utils/ApiConfig';
import LoadingIcon from '../components/LoadingIcon';

const Subtitle = styled.span`
  color: grey;
`;

const Text = styled.span`
  font-size: 1rem;
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

function Deposit() {
  return (
    <a
      style={{ fontSize: '2rem', textAlign: 'center' }}
      href="publisher"
      onClick={zeroBalance}
    >
      <i className="fab fa-cc-stripe" />
    </a>
  );
}

function AccountOverview({
  domain, balance, articlesRegistered, articleViews, apiKey,
}) {
  return (
    <Card
      title="Account Overview"
      style={{ width: '25rem', height: '13rem', marginBottom: '1rem' }}
    >
      <Row>
        <Column style={{ marginRight: '1rem' }}>
          <Subtitle>Domain</Subtitle>
          <Text>{domain}</Text>
          <Subtitle>
            Balance
          </Subtitle>
          <Text>{formatBalance(balance)}</Text>
        </Column>

        <Column>
          <Subtitle>Articles Registered</Subtitle>
          <Text>{formatNumber(articlesRegistered)}</Text>
          <Subtitle>Total Article Views</Subtitle>
          <Text>{formatNumber(articleViews)}</Text>
        </Column>
      </Row>
    </Card>
  );
}

function DirectDeposit({ name, apiKey }) {
  return (
    <Card
      title="Direct Deposit"
      style={{ width: '25rem', height: '13rem', marginBottom: '1rem' }}
    >
      <Text>Api Key: { apiKey }</Text>

      <Subtitle> Payout Using Stripe</Subtitle>
      <Deposit></Deposit>
    </Card>
  );
}

function ArticleEntry({ article }) {
  const revenue = multiplyBalance(article.price, article.views);
  return (
    <tr>
      <td>{article.article_name}</td>
      <td>{article.views}</td>
      <td>{formatBalance(revenue)}</td>
    </tr>
  );
}

function RegisteredArticles({ articles, loading }) {
  articles = articles.map((article, index) => <ArticleEntry article={article} key={index} />);
  function Bottom() {
    return articles.length === 0 ? <Placeholder>None</Placeholder> : <></>;
  }
  if (loading) {
    Bottom = function () {
      return <LoadingIcon />;
    };
  }
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
        {
          loading
            ? <></>
            : (
              <tbody>
                {articles}
              </tbody>
            )
        }
      </Table>
      <Bottom />

    </Card>
  );
}

function PublisherProfilePage() {
  const [publisher, setPublisher] = useState({
    domain: '',
    apiKey: '',
    balance: {
      dollars: 0,
      cents: 0,
    },
    articles: [],
  });

  const [registeredArticles, setRegisteredArticles] = useState([]);
  const [articleViews, setArticleViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(buildApiUrl('publisher'), {
      credentials: 'include',
    })
      .then((resp) => resp.json())
      .then((data) => {
        setPublisher({
          ...data,
        });
        fetchArticles(data.articles).then((result) => {
          setRegisteredArticles(result);
          let tempArticleViews = 0;
          result.forEach((article) => {
            tempArticleViews += article.views;
          });
          setArticleViews(tempArticleViews);
          setLoading(false);
        });
      })
      .catch((err) => {
        // Sign in first
        navigate('/signin/publisher');
      });
  }, []);

  return (
    <div className="center-content" style={{ marginTop: '5rem' }}>
      <ResponsiveWidth maxWidth={sectionWidth}>
        <Column>
          <Row maxWidth={sectionWidth}>
            <AccountOverview
              domain={publisher.domain}
              balance={publisher.balance}
              articlesRegistered={publisher.articles.length}
              articleViews={articleViews}
              apiKey={publisher.apiKey}
            />
            <DirectDeposit
              name={publisher.name}
              apiKey={publisher.apiKey}
            />
          </Row>
          <RegisteredArticles
            loading={loading}
            articles={registeredArticles}
          />
        </Column>
      </ResponsiveWidth>
    </div>
  );
}

export default PublisherProfilePage;
