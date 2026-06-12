export const OFFLINE_RESPONSES = {
  hi: {
    irrigation: [
      'सिंचाई का सबसे अच्छा समय सुबह 6-9 बजे या शाम 5-7 बजे है। इससे पानी का वाष्पीकरण कम होता है। 💧',
      'अगर मिट्टी को 2 इंच गहराई तक दबाने पर सूखी लगे, तो पानी देने का समय है।'
    ],
    weather: [
      'मौसम की सटीक जानकारी के लिए मौसम टैब खोलें। वहां 7 दिन का पूर्वानुमान है। 🌦️',
      'बारिश से पहले नाइट्रोजन खाद न डालें — बह जाएगी। बारिश के 2-3 दिन बाद डालें।'
    ],
    pest: [
      'कीटनाशक छिड़काव सुबह जल्दी या शाम को करें। अपने नजदीकी कृषि केंद्र से सही दवाई पूछें।',
      'नीम का तेल एक प्राकृतिक कीटनाशक है। 5 मिली प्रति लीटर पानी में मिलाकर छिड़काव करें।'
    ],
    government: [
      'PM-KISAN योजना में हर साल ₹6,000 तीन किस्तों में मिलते हैं। pmkisan.gov.in पर आवेदन करें।',
      'फसल बीमा के लिए PMFBY में शामिल हों। बुआई के 10 दिन के अंदर आवेदन करें।'
    ],
    soil: [
      'मिट्टी की जांच हर 3 साल में कराएं। कृषि विज्ञान केंद्र (KVK) में मुफ्त या कम दाम में होती है।',
      'गोबर की खाद डालने से मिट्टी की उर्वरकता बढ़ती है और पानी सोखने की क्षमता बेहतर होती है।'
    ],
    general: [
      'मैं अभी ऑफलाइन हूं। इंटरनेट वापस आने पर पूरा जवाब दे पाऊंगा। मौसम टैब से आज का मौसम देखें। 🌾',
      'ऑफलाइन मोड में हूं। मौसम टैब देखें — अगर 50% से ज्यादा बारिश की संभावना है तो पानी न दें।'
    ]
  },
  en: {
    irrigation: [
      'Best time to irrigate is 6-9 AM or 5-7 PM. This minimizes evaporation. 💧'
    ],
    general: [
      'Currently offline. Check the Weather tab for today\'s forecast — it works offline. 🌾'
    ]
  },
  bn: { general: ['আমি এখন অফলাইনে আছি। আবহাওয়া ট্যাব দেখুন। 🌾'] },
  mr: { general: ['मी सध्या ऑफलाइन आहे. हवामान टॅब पहा. 🌾'] },
  pa: { general: ['ਮੈਂ ਹੁਣ ਆਫਲਾਈਨ ਹਾਂ। ਮੌਸਮ ਟੈਬ ਦੇਖੋ। 🌾'] }
};

export function getOfflineResponse(userMessage = '', language = 'hi') {
  const msg = userMessage.toLowerCase();
  const responses = OFFLINE_RESPONSES[language] || OFFLINE_RESPONSES.hi;

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (msg.match(/पानी|सिंचाई|irrigat|water/)) return pick(responses.irrigation || OFFLINE_RESPONSES.hi.irrigation);
  if (msg.match(/मौसम|बारिश|weather|rain/)) return pick(responses.weather || OFFLINE_RESPONSES.hi.weather);
  if (msg.match(/कीड़|रोग|pest|disease/)) return pick(responses.pest || OFFLINE_RESPONSES.hi.pest);
  if (msg.match(/सरकार|योजना|kisan|scheme|pmkisan/)) return pick(responses.government || OFFLINE_RESPONSES.hi.government);
  if (msg.match(/मिट्टी|खाद|soil|fertil/)) return pick(responses.soil || OFFLINE_RESPONSES.hi.soil);
  return pick(responses.general);
}
