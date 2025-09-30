// Array para a DEMO substituir por banco de dados depois
export let subscriptions = [];

export default function handler(req, res) {
  if (req.method === 'POST') {
    const subscription = req.body;
    if (!subscriptions.some(s => s.endpoint === subscription.endpoint)) {
        subscriptions.push(subscription);
    }
    res.status(201).json({ message: 'Inscrição salva.' });
  } else {
    res.status(405).json({ error: 'Método não permitido.' });
  }
}