export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).end();
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');

  const FRED_KEY = 'b2a5034e0c27aa0ef1a6ba5ec7607a36';

  async function fred(id) {
    const r = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${id}&sort_order=desc&limit=2&file_type=json&api_key=${FRED_KEY}`);
    const d = await r.json();
    return d.observations.filter(o => o.value !== '.');
  }

  try {
    const [t, m, f] = await Promise.all([
      fred('DGS10'),
      fred('MORTGAGE30US'),
      fred('FEDFUNDS')
    ]);

    res.status(200).json({
      success: true,
      macro: {
        treasury10yr: { value: parseFloat(t[0].value), prev: parseFloat(t[1].value), date: t[0].date },
        mortgage30yr: { value: parseFloat(m[0].value), date: m[0].date },
        fedFunds: { value: parseFloat(f[0].value), date: f[0].date }
      }
    });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
