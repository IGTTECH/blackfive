
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
admin.initializeApp();

const PAYPAL_CLIENT = functions.config().paypal ? functions.config().paypal.client_id : '';
const PAYPAL_SECRET = functions.config().paypal ? functions.config().paypal.secret : '';
const PAYPAL_BASE = functions.config().paypal && functions.config().paypal.sandbox === 'true' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

async function getPayPalToken(){
  const auth = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  return res.json();
}

exports.verifyPayPalOrder = functions.https.onCall(async (data, context) => {
  if(!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
  const uid = context.auth.uid;
  const orderId = data.orderId;
  if(!orderId) throw new functions.https.HttpsError('invalid-argument', 'orderId missing');

  try{
    const tokenRes = await getPayPalToken();
    const accessToken = tokenRes.access_token;
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
    });
    const order = await orderRes.json();
    const approved = order && (order.status === 'COMPLETED' || order.status === 'APPROVED' || order.status === 'CAPTURED' || (order.purchase_units && order.purchase_units.some(u => u.payments && u.payments.captures && u.payments.captures.some(c=> c.status === 'COMPLETED'))));
    if(!approved) throw new functions.https.HttpsError('failed-precondition', 'Payment not completed');

    const db = admin.firestore();
    await db.collection('payments').doc(orderId).set({ uid, order, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    await db.collection('users').doc(uid).update({ paid: true });
    await admin.auth().setCustomUserClaims(uid, { paid: true });
    return { success: true };
  }catch(err){
    console.error(err);
    throw new functions.https.HttpsError('internal', err.message || String(err));
  }
});
