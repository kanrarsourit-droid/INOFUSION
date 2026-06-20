let twilioClient = null;

const getTwilioClient = () => {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken || accountSid.startsWith('twilio_placeholder')) {
    return null;
  }

  try {
    const twilio = require('twilio');
    twilioClient = twilio(accountSid, authToken);
    return twilioClient;
  } catch (err) {
    console.warn('⚠️ Failed to load Twilio module. Falling back to log-only SMS mode.', err.message);
    return null;
  }
};

const sendSms = async (to, body) => {
  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER || '+15017122661';

  if (!client) {
    console.log(`📱 [SMS Fallback Log] To: ${to} | Body: ${body}`);
    return { success: true, fallback: true };
  }

  try {
    const message = await client.messages.create({
      body,
      from,
      to
    });
    console.log(`📱 SMS sent successfully via Twilio! Message SID: ${message.sid}`);
    return { success: true, messageSid: message.sid };
  } catch (err) {
    console.error('❌ Twilio Error sending SMS:', err.message);
    // Return success: true in dev fallback even if credentials failed to prevent complete app crashes, but mark it
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 [Dev Recovery SMS Log] To: ${to} | Body: ${body}`);
      return { success: true, fallback: true, error: err.message };
    }
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendSms
};
