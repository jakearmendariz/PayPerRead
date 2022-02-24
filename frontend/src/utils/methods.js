
function formatNumber(num) {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatBalance(balance) {
    const convertedBalance = balance.dollars + balance.cents / 100;
    return formatNumber(`$${convertedBalance.toFixed(2)}`);
}

export {
    formatNumber,
    formatBalance
}