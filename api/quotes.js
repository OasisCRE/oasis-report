export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).end();
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300');

  const symbols = ['PSA', 'CUBE', 'EXR', 'NSA', 'VNQ', '%5ETNX'];
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent`;

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://finance.yahoo.com/'
      }
    });
    const data = await r.json();
    const results = data?.quoteResponse?.result || [];
    const quotes = {};
    results.forEach(q => {
      const sym = q.symbol === '^TNX' ? 'TNX' : q.symbol;
      quotes[sym] = {
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePct: q.regularMarketChangePercent
      };
    });
    res.status(200).json({ success: true, quotes });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
