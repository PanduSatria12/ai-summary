import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend hidup');
});

app.post('/api/chat', async (req, res) => {
  const { text, systemPrompt } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost',
        'X-Title': 'Smart Notes'
      },
      body: JSON.stringify({
        model: 'google/gemma-4-26b-a4b-it:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ]
      })
    });

    // Debug kalau error
    if (!response.ok) {
      const err = await response.text();
      console.error('API ERROR:', err);
      return res.status(500).json({ error: err });
    }

    const data = await response.json();
    console.log('RAW RESPONSE:', JSON.stringify(data, null, 2));

    // parsing lebih aman
    let result = '';

    if (data.choices && data.choices.length > 0) {
      result = data.choices[0].message?.content || '';
    }

    if (!result) {
      result = 'Tidak ada hasil dari model';
    }

    res.json({ result });

  } catch (err) {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
