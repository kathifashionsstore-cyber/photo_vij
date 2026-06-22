import { Router } from 'express';

const router = Router();

// Endpoint to send WhatsApp notifications
router.post('/send-notification', async (req, res) => {
  const { phone, templateName, variables } = req.body;

  if (!phone || !templateName) {
    return res.status(400).json({ error: "Missing phone or templateName parameters." });
  }

  try {
    console.log(`[WhatsApp Outbound] Sending template "${templateName}" to ${phone} with variables:`, variables);
    
    // Stub for actual Meta/Twilio Cloud API dispatch:
    // const response = await axios.post("META_API_ENDPOINT", { to: phone, template: templateName, vars: variables });

    return res.json({ 
      success: true, 
      message: `WhatsApp template "${templateName}" dispatched to ${phone} successfully.`,
      dispatchId: `wa_tx_${Date.now()}`
    });
  } catch (err) {
    console.error("WhatsApp notification failed:", err);
    return res.status(500).json({ error: "Failed to dispatch WhatsApp message." });
  }
});

export default router;
