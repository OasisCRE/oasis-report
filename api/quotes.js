export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300');

  const POLYGON_KEY = 'aLpvmHKwuBKiIGlLGjRhpD4em_8MAy81';
  const symbols = ['PSA', 'CUBE', 'EXR', 'NSA', 'VNQ'];

  const fallback = {
    PSA:  { price: 281.50, change: -1.20, changePct: -0.42 },
    CUBE: { price: 36.80,  change:  0.15, changePct:  0.41 },
    EXR:  { price: 131.20, change: -0.85, changePct: -0.64 },
    NSA:  { price: 31.40,  change:  0.22, changePct:  0.71 },
    VNQ:  { price: 85.60,  change: -0.30, changePct: -0.35 },
    TNX:  { price: 4.27,   change:  0.02, changePct:  0.47 }
  };

  try {
    const results = await Promise.all(
      symbols.map(sym =>
        fetch('https://api.polygon.io/v2/aggs/ticker/' + sym + '/prev?adjusted=true&apiKey=' + POLYGON_KEY)
          .then(r => r.json())
          .then(d => {
            const r = d && d.results && d.results[0];
            if (!r) return null;
            const change = r.c - r.o;
            const changePct = (change / r.o) * 100;
            return { sym, price: r.c, change, changePct };
          })
          .catch(() => null)
      )
    );

    const quotes = {};
    results.forEach(r => { if (r) quotes[r.sym] = { price: r.price, change: r.change, changePct: r.changePct }; });

    if (Object.keys(quotes).length === 0) {
      return res.status(200).json({ success: true, source: 'fallback', quotes: fallback });
    }

    quotes.TNX = fallback.TNX;
    return res.status(200).json({ success: true, quotes });
  } catch(e) {
    return res.status(200).json({ success: true, source: 'fallback', quotes: fallback });
  }
}
