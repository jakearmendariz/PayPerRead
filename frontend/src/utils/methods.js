function formatNumber(num) {
  if (typeof num === 'number') {
    num = num.toString();
  }
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatBalance(balance) {
  const convertedBalance = balance.dollars + balance.cents / 100;
  return formatNumber(`$${convertedBalance.toFixed(2)}`);
}

const fetchArticles = async (articles) => {
  let fetchedArticles = [];
  for (let i = 0; i < articles.length; i++) {
    const article_detail = fetch(`http://localhost:8000/articles/${articles[i]}`);
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
    dollars: parseInt(total / 100),
    cents: total % 100,
  };
}

export {
  formatNumber,
  formatBalance,
  fetchArticles,
  multiplyBalance,
};
