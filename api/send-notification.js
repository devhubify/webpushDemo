import webpush from 'web-push';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: 'Chaves VAPID não configuradas no servidor.' });
  }

  webpush.setVapidDetails(
    'mailto:alberto@hubify.com.br',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  try {
    // 1. Pega todas as chaves de inscrição do Vercel KV
    const keys = [];
    for await (const key of kv.scanIterator({ match: 'sub:*' })) {
        keys.push(key);
    }

    if (keys.length === 0) {
      return res.status(404).json({ message: 'Nenhuma inscrição ativa para notificar.' });
    }

    // 2. Pega os valores (objetos de inscrição) de todas as chaves
    const subscriptions = await kv.mget(...keys);

    const notificationPayload = JSON.stringify(req.body);

    // 3. Envia as notificações
    const sendPromises = subscriptions.map(sub => 
      webpush.sendNotification(sub, notificationPayload)
        .catch(error => {
            // Se a inscrição expirou (erro 410), removemos do banco
            if (error.statusCode === 410) {
                const keyToRemove = `sub:${sub.endpoint.slice(-20)}`;
                console.log('Removendo inscrição expirada:', keyToRemove);
                kv.del(keyToRemove);
            } else {
                console.error('Erro ao enviar notificação:', error.statusCode);
            }
        })
    );
    
    await Promise.all(sendPromises);

    res.status(200).json({ message: `Pedido de notificação enviado para ${subscriptions.length} clientes.` });
  } catch (error) {
    console.error('Erro geral ao enviar notificação:', error);
    res.status(500).json({ error: 'Falha ao enviar notificações.' });
  }
}