import express from 'express';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import fs from 'fs';
 
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL('./serviceAccountKey.json', import.meta.url))
);
 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
 
const app = express();
app.use(bodyParser.json());
 
const PORT = 1000;
 
let deviceTokens = [];
 
// Register device token
app.get('/', (req, res) => {
    res.send('Woocom Backend Running!');
})

app.post('/register-token', (req, res) => {
  const { token } = req.body;
  if (token && !deviceTokens.includes(token)) {
    deviceTokens.push(token);
    console.log('Token registered:', token);
  }
  res.status(200).send({ message: 'Token registered successfully' });
});
 
// WooCommerce Webhook
app.post('/woocommerce-webhook', (req, res) => {
  const order = req.body;
  console.log('New Order Received:', order);
 
  const payload = {
    notification: {
      title: 'New WooCommerce Order',
      body: `Order #${order.id} for ${order.billing?.first_name || 'customer'}`,
      sound: 'default',
    },
  };
 
  deviceTokens.forEach(token => {
    admin.messaging().sendToDevice(token, payload)
      .then(response => console.log('Notification sent:', response))
      .catch(err => console.error('Notification error:', err));
  });
 
  res.status(200).send('Webhook received');
});
 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));