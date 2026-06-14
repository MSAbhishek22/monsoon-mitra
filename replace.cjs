const fs = require('fs');
const files = [
  'src/pages/HomePage.jsx',
  'src/pages/WeatherPage.jsx',
  'src/pages/AIPage.jsx',
  'src/pages/SavingsPage.jsx',
  'src/pages/SettingsPage.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Add useT import
  content = content.replace(
    /import \{ useApp \} from '\.\.\/context\/AppContext';/g,
    "import { useApp, useT } from '../context/AppContext';"
  );

  // Remove old i18n import
  content = content.replace(
    /import \{ t.*?\} from '\.\.\/i18n.*?';\n?/g,
    ''
  );

  // Add const t = useT(); after useApp();
  if (!content.includes('const t = useT();')) {
    content = content.replace(
      /(const \{.*?\} = useApp\(\);)/g,
      "$1\n  const t = useT();"
    );
  }

  // Replace t(lang, 'key') with t('key')
  content = content.replace(/t\(\s*lang\s*,\s*'([^']+)'\)/g, "t('$1')");
  
  // Hardcoded strings replacement map
  const replacements = {
    'होम': 'home',
    'मौसम': 'weather',
    'बचत': 'savings',
    'सेटिंग': 'settings',
    'मेरा खेत': 'myField',
    'त्वरित सहायता': 'quickHelp',
    'आपकी बचत': 'yourSavings',
    'सरकारी योजनाएं': 'govtSchemes',
    'फसल गाइड': 'cropGuide',
    'कीट और बीमारी': 'pestGuide',
    'किसान हेल्पलाइन': 'helpline',
    'खेती कैलेंडर': 'farmCalendar',
    'आज का फैसला': 'todayDecision',
    'आज पानी दें': 'irrigateToday',
    'आज पानी मत दें': 'skipToday',
    'आज का मौसम — दोस्त या दुश्मन?': 'weatherFriend',
    'बोलकर या लिखकर': 'askAISub',
    '7 दिन मौसम': 'sevenDayWeather',
    'बारिश का पूरा हाल': 'sevenDaySub',
    'बचत देखें': 'viewSavings',
    'भाषा व फसल': 'settingsSub',
    'इस महीने की कुल बचत': 'thisMonthSavings',
    'पूरी जानकारी देखें →': 'viewDetails',
    'खेती का कोई भी सवाल पूछें...': 'chatPlaceholder',
    'ऑनलाइन — Gemini AI': 'online',
    'ऑफलाइन मोड': 'offline',
    '⚠️ इंटरनेट नहीं है — सीमित जवाब मिलेंगे': 'noInternet',
    'नमस्ते! मैं AI सहायक हूं': 'aiWelcome',
    'खेती से जुड़ा कोई भी सवाल पूछें': 'aiWelcomeSub',
    '🔊 सुनें': 'listen',
    '⭐ सेव': 'save',
    'आपकी कुल बचत': 'totalSavings',
    'आज तक': 'toDate',
    'इस महीने': 'thisMonth',
    'इस हफ्ते': 'thisWeek',
    'बार बचाया': 'timesSaved',
    'सिंचाई लॉग': 'irrigationLog',
    '+ आज की सिंचाई दर्ज करें': 'logIrrigation',
    'इस महीने का लक्ष्य': 'monthGoal',
    'पानी की बचत': 'waterSaved',
    'लीटर': 'liters',
    'टंकियां': 'tankers',
    'मेरी जानकारी': 'myInfo',
    'सूचनाएं': 'notifications',
    'ऐप की जानकारी': 'appInfo',
    'नाम': 'name',
    'फसल': 'crop',
    'स्थान': 'location',
    'भाषा': 'language',
    'सेट करें': 'setName',
    'संस्करण': 'version',
    'गोपनीयता नीति': 'privacyPolicy',
    'उपयोग की शर्तें': 'terms',
    'ऐप को रेट करें': 'rateApp',
    'दोस्तों को शेयर करें': 'shareApp',
    'सभी डेटा हटाएं': 'deleteData',
    'प्रिय किसान': 'dearFarmer',
    'से सदस्य': 'memberSince',
    '⚠️ बाढ़ की चेतावनी!': 'floodAlert',
    '🌡️ सूखे की चेतावनी': 'droughtAlert',
    'बारिश की संभावना': 'rainChance',
    'नमी': 'humidity',
    'हवा': 'wind',
    'दबाव': 'pressure',
    'महसूस होता है': 'feelsLike',
    '🕐 आज का घंटेवार मौसम': 'hourlyForecast',
    '📅 7 दिन का पूर्वानुमान': 'sevenDayForecast',
    '🌧️ बारिश की संभावना (7 दिन)': 'rainChart',
    'ताज़ा करें': 'refresh',
    'लोड हो रहा है...': 'refreshing',
    'अभी': 'now',
    'आज': 'today',
    'कल': 'tomorrow',
    'सिंचाई का फैसला': 'irrigationDecision',
    '💰 इस निर्णय को लॉग करें और बचत देखें →': 'logAndSee'
  };

  // Only replace text nodes or placeholders in JSX
  // We'll just do a global replace for these exact strings, BUT carefully wrapping them in t('key') if they are plain text
  // Actually, since React expects {t('key')}, we need to replace >TEXT< with >{t('key')}<
  // and 'TEXT' with t('key')
  
  for (const [hindi, key] of Object.entries(replacements)) {
    const safeHindi = hindi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 1. >Hindi< to >{t('key')}<
    const regex1 = new RegExp(`>\\s*${safeHindi}\\s*<`, 'g');
    content = content.replace(regex1, `>{t('${key}')}<`);
    
    // 2. "Hindi" to t('key')
    const regex2 = new RegExp(`"${safeHindi}"`, 'g');
    content = content.replace(regex2, `t('${key}')`);
    
    // 3. 'Hindi' to t('key')
    const regex3 = new RegExp(`'${safeHindi}'`, 'g');
    content = content.replace(regex3, `t('${key}')`);
  }

  fs.writeFileSync(file, content);
});
console.log('Updated all pages');
