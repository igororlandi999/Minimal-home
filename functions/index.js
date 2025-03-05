const functions = require("firebase-functions");
const admin = require("firebase-admin");
const mercadopago = require("mercadopago");

// Inicializar o Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Configurar o Mercado Pago
mercadopago.configure({
  access_token: "TEST-f7c3f39d-7df7-42b0-96d6-9393f63cfde8" // Substitua pelo seu token de produção quando estiver pronto
});

exports.mercadoPagoWebhook = functions.https.onRequest(async (req, res) => {
  // Configurar CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  
  // Responder a requisições OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  
  try {
    // Extrair os dados da notificação
    const { type, data } = req.body;
    
    console.log("Notificação recebida:", type, data);
    
    // Processar apenas notificações de pagamento
    if (type === "payment") {
      const paymentId = data.id;
      
      // Obter detalhes do pagamento
      const payment = await mercadopago.payment.findById(paymentId);
      
      if (payment && payment.response) {
        const paymentData = payment.response;
        const externalReference = paymentData.external_reference; // ID do pedido
        const status = paymentData.status; // approved, pending, rejected, etc.
        
        // Atualizar o pedido no Firestore
        const db = admin.firestore();
        const orderRef = db.collection("orders").doc(externalReference);
        
        // Verificar se o pedido existe
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) {
          console.log("Pedido não encontrado:", externalReference);
          return res.status(404).send("Order not found");
        }
        
        // Atualizar o status do pedido
        await orderRef.update({
          paymentStatus: status,
          paymentId: paymentId,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Pedido ${externalReference} atualizado com status: ${status}`);
      }
    }
    
    res.status(200).send("OK");
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(500).send("Error processing webhook");
  }
});