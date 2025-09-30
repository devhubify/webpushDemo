import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const subscription = req.body;
    
    // Usaremos o endpoint como uma chave única para a inscrição
    const key = `sub:${subscription.endpoint.slice(-20)}`; // Usa os últimos 20 chars para uma chave curta

    // Salva a inscrição no Vercel KV
    await kv.set(key, subscription);
    
    console.log('Inscrição salva no Vercel KV:', key);
    res.status(201).json({ message: 'Inscrição salva com sucesso.' });
  } else {
    res.status(405).json({ error: 'Método não permitido.' });
  }
}