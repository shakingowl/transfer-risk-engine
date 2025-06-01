
const fetch = require('node-fetch');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  const { from, to, pair, amount, bank } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key is missing' });
  }

  const prompt = `You are an expert in international currency transfers...
From Country: ${from}
To Country: ${to}
Currency Pair: ${pair}
Amount: ${amount}
Bank or Transfer Provider: ${bank || 'Not specified'}

Give a risk level (Low / Medium / High), explain the key reasons, and suggest actions.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${apiKey}\`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful AI that assesses international transfer risk.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 400
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error('No response from OpenAI');
    }

    res.status(200).json({ result: data.choices[0].message.content });
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = handler;
