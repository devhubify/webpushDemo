import webpush from 'web-push';
import { subscriptions } from './save-subscription.js';

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
    const notificationPayload = JSON.stringify(req.body);
    const sendPromises = subscriptions.map(sub => webpush.sendNotification(sub, notificationPayload));
    
    await Promise.all(sendPromises);

    res.status(200).json({ message: 'Notificações enviadas.' });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ error: 'Falha ao enviar notificações.' });
  }
}