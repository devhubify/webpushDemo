import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const subscription = req.body;

    // Validação básica para garantir que recebemos um objeto de inscrição válido
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Objeto de inscrição inválido.' });
    }

    // CRUCIAL: Recriamos a chave exatamente da mesma forma que fizemos ao salvar
    const key = `sub:${subscription.endpoint.slice(-20)}`;

    // Deleta a chave do banco de dados KV
    await kv.del(key);
    
    console.log('Inscrição removida do Vercel KV:', key);
    res.status(200).json({ message: 'Inscrição removida com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover inscrição:', error);
    res.status(500).json({ error: 'Falha ao remover inscrição.' });
  }
}