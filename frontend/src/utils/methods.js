import { buildApiUrl } from './ApiConfig';

function formatNumber(num) {
  const numString = typeof num === 'number' ? num.toString() : num;
  return numString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatBalance(balance) {
  const convertedBalance = balance.dollars + balance.cents / 100;
  return formatNumber(`$${convertedBalance.toFixed(2)}`);
}

const fetchArticles = async (articles) => {
  let fetchedArticles = [];
  for (let i = 0; i < articles.length; i += 1) {
    const article_detail = fetch(buildApiUrl(`articles/${articles[i]}`));
    fetchedArticles.push(article_detail);
  }

  fetchedArticles = await Promise.all(fetchedArticles);
  fetchedArticles = fetchedArticles.map((result) => result.json());
  return Promise.all(fetchedArticles);
};

function multiplyBalance(balance, multiplier) {
  let total = balance.cents + balance.dollars * 100;
  total *= multiplier;
  return {
    dollars: parseInt(total / 100, 10),
    cents: total % 100,
  };
}

function zeroBalance() {
  console.log('zero');
  fetch(buildApiUrl('publisher/deposit'), {
    method: 'POST',
    credentials: 'include',
  }).then((response) => {
    console.log(response);
  });
}

function remValue(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export {
  formatNumber,
  formatBalance,
  fetchArticles,
  multiplyBalance,
  zeroBalance,
  remValue,
};
