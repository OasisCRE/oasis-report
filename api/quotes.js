export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300');

  const fallback = {
    PSA:  { price: 281.50, change: -1.20, changePct: -0.42 },
    CUBE: { price: 36.80,  change: 0.15,  changePct:  0.41 },
    EXR:  { price: 131.20, change: -0.85, changePct: -0.64 },
    NSA:  { price: 31.40,  change: 0.22,  changePct:  0.71 },
    VNQ:  { price: 85.60,  change: -0.30, changePct: -0.35 },
    TNX:  { price: 4.27,   change: 0.02,  changePct:  0.47 }
  };

  try {
    const joined = 'PSA,CUBE,EXR,NSA,VNQ,%5ETNX';
    const r = await fetch('https://query2.finance.yahoo.com/v7/finance/quote?symbols=' + joined + '&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent', {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://finance.yahoo.com/' }
    });
    const data = await r.json();
    const results = data?.quoteResponse?.result || [];
    const quotes = {};
    results.forEach(q => {
      const sym = q.symbol === '^TNX' ? 'TNX' : q.symbol;
      quotes[sym] = { price: q.regularMarketPrice, change: q.regularMarketChange, changePct: q.regularMarketChangePercent };
    });
    return res.status(200).json({ success: true, quotes: Object.keys(quotes).length > 0 ? quotes : fallback });
  } catch(e) {
    return res.status(200).json({ success: true, source: 'fallback', quotes: fallback });
  }
}
