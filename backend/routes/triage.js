const express = require('express');
const router = express.Router();
const { GoogleGenAI, GoogleGenAIError, GoogleGenAIFetchError } = require('@google/generative-ai');

// Rule-based local fallback engine
const runLocalTriage = (symptoms, age, gender) => {
  const query = symptoms.toLowerCase();
  
  if (
    query.includes('chest') || 
    query.includes('heart') || 
    query.includes('cardiac') || 
    query.includes('shortness of breath') || 
    query.includes('difficulty breathing') || 
    query.includes('palpitations')
  ) {
    return {
      urgency: 'Critical',
      specialist: 'Cardiologist',
      nextAction: 'Seek emergency medical attention immediately or go to the nearest emergency room. Avoid physical exertion.'
    };
  }

  if (
    query.includes('skin') || 
    query.includes('rash') || 
    query.includes('itch') || 
    query.includes('acne') || 
    query.includes('pimple') || 
    query.includes('dermatitis') || 
    query.includes('spots')
  ) {
    return {
      urgency: 'Low',
      specialist: 'Dermatologist',
      nextAction: 'Schedule a routine outpatient consultation with a dermatologist. Keep the area clean and avoid scratching.'
    };
  }

  if (
    query.includes('eye') || 
    query.includes('vision') || 
    query.includes('blurry') || 
    query.includes('blind') || 
    query.includes('cataract') || 
    query.includes('glaucoma')
  ) {
    return {
      urgency: 'Medium',
      specialist: 'Ophthalmologist',
      nextAction: 'Book an eye examination with an ophthalmologist. Avoid rubbing your eyes.'
    };
  }

  if (
    query.includes('child') || 
    query.includes('baby') || 
    query.includes('infant') || 
    query.includes('toddler') || 
    query.includes('pediatric')
  ) {
    return {
      urgency: 'Medium',
      specialist: 'Pediatrician',
      nextAction: 'Consult with a pediatrician. Track the child\'s temperature and fluid intake.'
    };
  }

  if (
    query.includes('brain') || 
    query.includes('stroke') || 
    query.includes('seizure') || 
    query.includes('neuropathy') || 
    query.includes('migraine') || 
    query.includes('numbness') || 
    query.includes('dizzy')
  ) {
    return {
      urgency: 'High',
      specialist: 'Neurologist',
      nextAction: 'Schedule a neurological consultation. Seek immediate help if there is facial drooping or speech difficulty.'
    };
  }

  if (
    query.includes('bone') || 
    query.includes('fracture') || 
    query.includes('joint') || 
    query.includes('muscle') || 
    query.includes('back pain') || 
    query.includes('sprain') || 
    query.includes('ortho')
  ) {
    return {
      urgency: 'Medium',
      specialist: 'Orthopedic Specialist',
      nextAction: 'Consult with an orthopedic specialist. Apply the RICE method (Rest, Ice, Compression, Elevation) if sprained.'
    };
  }

  // Default fallback (General Physician)
  return {
    urgency: 'Medium',
    specialist: 'General Physician',
    nextAction: 'Consult a General Physician for a primary check-up. Rest, stay hydrated, and monitor your symptoms.'
  };
};

// @route   POST /api/triage/analyze
// @desc    Analyze symptoms using Gemini AI with Local Fallback
// @access  Public (or Private)
router.post('/analyze', async (req, res) => {
  const { symptoms, age, gender } = req.body;

  if (!symptoms) {
    return res.status(400).json({ success: false, message: 'Please enter symptoms description' });
  }

  console.log(`🤖 Triage Request Received - Symptoms: "${symptoms}", Age: ${age}, Gender: ${gender}`);

  // Check if Gemini API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === '' || apiKey.startsWith('AIzaSy...')) {
    console.log('🔌 Gemini API Key is unconfigured. Utilizing Local Fallback Engine.');
    const result = runLocalTriage(symptoms, age, gender);
    return res.json({ success: true, method: 'Local Triage Engine (Fallback)', ...result });
  }

  try {
    const { GoogleGenAI } = require('@google/generative-ai');
    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-1.5-flash as the fast, lightweight model
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert medical triage assistant. Analyze the symptoms of the patient below and provide critical routing decisions.
Patient Info:
- Age: ${age || 'Unknown'}
- Gender: ${gender || 'Unknown'}
- Symptoms: "${symptoms}"

You must respond ONLY with a valid raw JSON object. Do not include markdown backticks (like \`\`\`json), do not include any other conversational text. Just the raw JSON.
The JSON object must follow this structure:
{
  "urgency": "Low" | "Medium" | "High" | "Critical",
  "specialist": "Cardiologist" | "Dermatologist" | "Ophthalmologist" | "General Physician" | "Neurologist" | "Orthopedic Specialist" | "Pediatrician",
  "nextAction": "A single clear recommendation sentence on what step to take next."
}
Ensure the specialist is strictly chosen from the list above.`;

    const response = await model.generateContent(prompt);
    const text = response.response.text().trim();
    
    console.log('🤖 Raw Gemini Output:', text);

    // Parse JSON safely
    let parsedData;
    try {
      // Stripping potential markdown formatting if returned
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.warn('⚠️ Gemini returned non-JSON or formatting issue. Falling back to regex parsing.');
      // Attempt manual extraction
      const urgencyMatch = text.match(/"urgency"\s*:\s*"([^"]+)"/);
      const specialistMatch = text.match(/"specialist"\s*:\s*"([^"]+)"/);
      const actionMatch = text.match(/"nextAction"\s*:\s*"([^"]+)"/);
      
      parsedData = {
        urgency: urgencyMatch ? urgencyMatch[1] : 'Medium',
        specialist: specialistMatch ? specialistMatch[1] : 'General Physician',
        nextAction: actionMatch ? actionMatch[1] : 'Consult a healthcare professional for further evaluation.'
      };
    }

    return res.json({
      success: true,
      method: 'Gemini AI Engine',
      urgency: parsedData.urgency,
      specialist: parsedData.specialist,
      nextAction: parsedData.nextAction
    });

  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    console.log('🔌 Switching to Local Triage Engine due to API error.');
    const result = runLocalTriage(symptoms, age, gender);
    return res.json({ success: true, method: 'Local Triage Engine (Error Fallback)', ...result });
  }
});

module.exports = router;
