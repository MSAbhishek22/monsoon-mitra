import { sendMessage } from '../../api/gemini';

export async function askGemini(question) {
  try {
    if (!question || !question.trim()) return '';
    if (!navigator.onLine) {
      return 'आप ऑफलाइन हैं, आखिरी सलाह दिखाई जा रही है';
    }

    // Call the serverless proxy to keep API keys secure on the server
    const response = await sendMessage({ 
      message: question, 
      // Default to hindi as expected by original AISahayak implementation,
      // but the server proxy will automatically adapt to other languages based on prompt.
      language: 'hi' 
    });

    if (response.reply) {
      return response.reply;
    }

    return 'यह सुविधा जल्द ही आ रही है';
  } catch (err) {
    console.warn('Gemini error:', err);
    return `⚠️ AI त्रुटि: सेवा उपलब्ध नहीं है (कृपया बाद में प्रयास करें)`;
  }
}
