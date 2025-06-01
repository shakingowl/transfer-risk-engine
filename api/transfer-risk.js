export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' 
});
  }

  const { from, to, pair, amount, bank } = req.body;

  const prompt = `You are an expert in international currency transfers. 
Please assess the potential risk of a money transfer based on the 
following:

From Country: ${from}
To Country: ${to}
Currency Pair: ${pair}
Amount: ${amount}
Bank or Transfer Provider: ${bank || 'Not specified'}

Give a risk level (Low / Medium / High), explain the key reasons, and 
suggest any actions to reduce risk.`;

  try {
    const openaiRes = await 
fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful AI that assesses 
international transfer risk.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 400
      })
    });

    const data = await openaiRes.json();
    res.status(200).json({ result: data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

