// src/pages/HomePage.jsx — Section 8 complete spec
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useWeather, getWeatherEmoji } from '../hooks/useWeather';
import { useNotifications } from '../hooks/useNotifications';
import { t } from '../i18n/index';
import { getWeatherCondition } from '../api/weather';
import FarmerHook from '../components/FarmerHook';
import SavingsTracker from '../components/SavingsTracker';
import ForecastStrip from '../components/weather/ForecastStrip';
import { WeatherCardSkeleton, ForecastStripSkeleton } from '../components/common/LoadingSpinner';
import { getIrrigationDecision } from '../utils/irrigationLogic';

export default function HomePage() {
  const { user, setActiveTab } = useApp();
  const { weatherData, loading, error } = useWeather();
  const { permission, requestPermission } = useNotifications();
  const [showSchemesModal, setShowSchemesModal] = useState(false);
  const [showCropGuideModal, setShowCropGuideModal] = useState(false);
  const [showPestModal, setShowPestModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const lang = user.language || 'hi';
  
  const userName = user.name || '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'सुप्रभात' : hour < 17 ? 'नमस्ते' : hour < 20 ? 'शुभ संध्या' : 'शुभ रात्रि';
  const greetingEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : hour < 20 ? '🌇' : '🌙';

  const irrigationDecision = weatherData ? getIrrigationDecision(weatherData.rainProbabilityNext24h, weatherData.current.temperature, lang) : null;
  const temp = weatherData?.temperatureCelsius;
  const rainProb = weatherData?.rainProbabilityNext24h || 0;
  const weatherEmoji = getWeatherEmoji(rainProb, temp);
  const condition = getWeatherCondition(rainProb, temp, lang);

  return (
    <div className="min-h-screen bg-[#F1F8E9] pb-20 px-4 pt-4 scroll-container" style={{ paddingBottom: 'max(80px, calc(64px + env(safe-area-inset-bottom)))' }}>
      {/* Top Header */}
      <div className="flex items-center justify-between h-14">
        <span className="text-lg font-bold text-primary-900">🌾 Monsoon Mitra</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={async () => {
              if (permission !== 'granted') {
                const res = await requestPermission();
                if (res) alert('सूचनाएं चालू हो गईं!');
                else alert('सूचनाएं चालू नहीं हो सकीं। सेटिंग्स देखें।');
              } else {
                alert('सूचनाएं पहले से चालू हैं!');
              }
            }}
            className="w-10 h-10 bg-white rounded-full shadow-card flex items-center justify-center tap-feedback relative"
          >
            <span className="text-lg">🔔</span>
            {permission !== 'granted' && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}
          </button>
          {user.name && (
            <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Greeting Card */}
      <div
        className="mt-4 rounded-[20px] p-5 animate-slide-down"
        style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 50%, #1B5E20 100%)', boxShadow: '0 8px 24px rgba(46,125,50,0.3)' }}
      >
        <p style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          {greeting}{userName ? `, ${userName} जी` : '!'} {greetingEmoji}
        </p>
        <p className="text-[15px] text-white/90 mt-1.5">
          {irrigationDecision ? (irrigationDecision.decision === 'skip' ? 'आज पानी मत दें' : 'आज पानी दें') : ''}
        </p>
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-4xl font-extrabold text-white">{temp?.toFixed(0) ?? '--'}°C</span>
            <p className="text-sm text-white/85 mt-1">{condition}</p>
          </div>
          <span className="text-5xl">{weatherEmoji}</span>
        </div>
      </div>

      {/* Farmer Hook Card */}
      <div className="mt-4">
        {loading ? <WeatherCardSkeleton /> : <FarmerHook irrigationDecision={irrigationDecision} language={lang} />}
      </div>

      {/* Today's Forecast Strip */}
      <div className="mt-4">
        {loading ? <ForecastStripSkeleton /> : (
          <ForecastStrip hourlyData={weatherData?.raw?.hourly} label={t(lang, 'todayForecast')} />
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-5">
        <h3 className="text-base font-bold text-[#1A1A1A] mb-3">{t(lang, 'quickHelp')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🤖', emoji: true, title: 'AI से पूछें', sub: 'कोई भी सवाल पूछें', tab: 'ai', color: '#E8F5E9' },
            { icon: '📊', emoji: true, title: '7 दिन मौसम', sub: 'पूरे हफ्ते का हाल', tab: 'weather', color: '#E1F5FE' },
            { icon: '💰', emoji: true, title: 'बचत देखें', sub: 'आपकी कुल बचत', tab: 'savings', color: '#FFF8E1' },
            { icon: '⚙️', emoji: true, title: 'सेटिंग', sub: 'भाषा व फसल बदलें', tab: 'settings', color: '#F3E5F5' },
          ].map(action => (
            <button
              key={action.tab}
              onClick={() => setActiveTab(action.tab)}
              style={{
                height: '80px', background: action.color, borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
                padding: '0 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '12px',
                textAlign: 'left', width: '100%',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                WebkitTapHighlightColor: 'transparent'
              }}
              onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'; }}
              onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)'; }}
            >
              <span style={{ fontSize: '28px' }}>{action.icon}</span>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#0D1B0D', margin: 0 }}>{action.title}</p>
                <p style={{ fontSize: '12px', color: '#5A7A5A', margin: '2px 0 0' }}>{action.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: '12px' }}>
          <p style={{ fontSize: '16px', fontWeight: 800, color: '#0D1B0D', margin: 0 }}>🛠️ किसान के औज़ार</p>
          <span style={{ fontSize: '12px', color: '#5A7A5A' }}>स्वाइप करें →</span>
        </div>
        <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', padding: '0 16px 8px' }} className="hide-scrollbar">
          {[
            { icon: '📋', title: 'सरकारी योजनाएं', desc: 'PM-KISAN, PMFBY और 10+ योजनाएं', color: '#E8F5E9', border: '#A5D6A7', textColor: '#1B5E20', action: () => setShowSchemesModal(true) },
            { icon: '📚', title: 'फसल गाइड', desc: 'गेहूं, धान, सब्जी का पूरा ज्ञान', color: '#FFF3E0', border: '#FFCC80', textColor: '#E65100', action: () => setShowCropGuideModal(true) },
            { icon: '🐛', title: 'कीट और बीमारी', desc: 'पहचानें और इलाज करें', color: '#FCE4EC', border: '#F48FB1', textColor: '#C62828', action: () => setShowPestModal(true) },
            { icon: '📞', title: 'किसान हेल्पलाइन', desc: 'मुफ्त, हिंदी में सलाह', color: '#E3F2FD', border: '#90CAF9', textColor: '#0277BD', action: () => window.open('tel:18001801551') },
            { icon: '🌱', title: 'खेती कैलेंडर', desc: 'क्या बोएं, कब बोएं', color: '#F3E5F5', border: '#CE93D8', textColor: '#6A1B9A', action: () => setShowCalendarModal(true) },
          ].map(tool => (
            <button key={tool.title} onClick={tool.action} style={{
              minWidth: '155px', height: '106px', background: tool.color,
              border: `2px solid ${tool.border}`, borderRadius: '20px',
              padding: '14px 12px', cursor: 'pointer', textAlign: 'left',
              flexShrink: 0, boxShadow: '0 3px 12px rgba(0,0,0,0.07)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              WebkitTapHighlightColor: 'transparent',
            }}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '26px' }}>{tool.icon}</span>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: tool.textColor, margin: 0 }}>{tool.title}</p>
                <p style={{ fontSize: '11px', color: '#5A7A5A', margin: '3px 0 0', lineHeight: 1.4 }}>{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Savings Snapshot */}
      <div className="mt-5">
        <SavingsTracker language={lang} onNavigate={setActiveTab} />
      </div>

      {showSchemesModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 800, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowSchemesModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', padding: '24px 20px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }} className="hide-scrollbar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0D1B0D', margin: 0 }}>📋 सरकारी योजनाएं</h2>
              <button onClick={() => setShowSchemesModal(false)} style={{ background: '#F5F5F5', border: 'none', borderRadius: '20px', width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer' }}>×</button>
            </div>
            {[
              { name: 'PM-KISAN', emoji: '💰', benefit: '₹6,000 प्रति वर्ष — तीन किस्तों में', who: 'सभी छोटे और सीमांत किसान', how: 'pmkisan.gov.in पर या नजदीकी CSC केंद्र', helpline: '155261' },
              { name: 'PMFBY — फसल बीमा', emoji: '🛡️', benefit: 'फसल खराब होने पर मुआवज़ा', who: 'सभी किसान — खरीफ व रबी', how: 'बुआई के 10 दिन के अंदर बैंक या CSC में', helpline: '14447' },
              { name: 'Kisan Credit Card', emoji: '💳', benefit: '3 लाख तक 4% ब्याज पर कर्ज़', who: 'सभी किसान जिनके पास जमीन है', how: 'नजदीकी बैंक शाखा में जाएं — जमीन के कागज लेकर', helpline: null },
              { name: 'मृदा स्वास्थ्य कार्ड', emoji: '🧪', benefit: 'मिट्टी जांच और खाद सलाह — मुफ्त', who: 'सभी किसान', how: 'नजदीकी KVK या कृषि विभाग', helpline: null },
              { name: 'PM किसान मानधन', emoji: '👴', benefit: '60 साल बाद ₹3,000/माह पेंशन', who: '18-40 साल के छोटे किसान', how: 'pmkmy.gov.in या CSC केंद्र', helpline: '1800-267-6888' },
            ].map(s => (
              <div key={s.name} style={{ background: '#F8FAF8', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '1.5px solid #E8F5E9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '26px' }}>{s.emoji}</span>
                  <p style={{ fontSize: '17px', fontWeight: 800, color: '#1B5E20', margin: 0 }}>{s.name}</p>
                </div>
                <p style={{ fontSize: '14px', margin: '0 0 4px' }}><strong>लाभ:</strong> {s.benefit}</p>
                <p style={{ fontSize: '14px', margin: '0 0 4px' }}><strong>कौन:</strong> {s.who}</p>
                <p style={{ fontSize: '14px', margin: '0 0 0' }}><strong>कैसे:</strong> {s.how}</p>
                {s.helpline && (
                  <button onClick={() => window.open(`tel:${s.helpline}`)} style={{ marginTop: '12px', width: '100%', height: '44px', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                    📞 {s.helpline} पर कॉल करें
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showCropGuideModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 800, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowCropGuideModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: '24px 24px 0 0', padding: '24px 20px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }} className="hide-scrollbar">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0D1B0D', margin: 0 }}>📚 फसल गाइड</h2>
              <button onClick={() => setShowCropGuideModal(false)} style={{ background: '#F5F5F5', border: 'none', borderRadius: '20px', width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer' }}>×</button>
            </div>
            {[
              { name: 'गेहूं', emoji: '🌾', season: 'रबी (अक्टूबर-मार्च)', water: 'हर 10-12 दिन', fertilizer: 'DAP 50kg/एकड़ बुआई पर, यूरिया कल्ले फूटने पर', tip: 'पीला रस्ट: पत्ते पीले हों तो Propiconazole छिड़कें — KVK से पूछें' },
              { name: 'धान', emoji: '🌾', season: 'खरीफ (जून-नवंबर)', water: '5-7 दिन में एक बार', fertilizer: 'DAP + पोटाश बुआई पर, यूरिया 3 बार', tip: 'पानी 24 घंटे से ज्यादा खड़ा न रहने दें — जड़ सड़ती है' },
              { name: 'सब्जियां', emoji: '🥕', season: 'पूरे साल', water: 'गर्मी में रोज़, ठंड में 3-4 दिन', fertilizer: 'गोबर की खाद + DAP', tip: 'नीम का काढ़ा: 100% जैविक कीट नाशक' },
              { name: 'आलू', emoji: '🥔', season: 'रबी (अक्टूबर-जनवरी)', water: 'हर 7-10 दिन', fertilizer: 'पोटाश ज़रूरी — 40kg/एकड़', tip: 'पछेता झुलसा: काले धब्बे दिखें तो KVK से Mancozeb की सलाह लें' },
            ].map(crop => (
              <div key={crop.name} style={{ background: '#F8FAF8', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '1.5px solid #E8F5E9' }}>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#1B5E20', marginBottom: '10px' }}>{crop.emoji} {crop.name}</p>
                <p style={{ fontSize: '14px', margin: '0 0 4px' }}><strong>मौसम:</strong> {crop.season}</p>
                <p style={{ fontSize: '14px', margin: '0 0 4px' }}><strong>सिंचाई:</strong> {crop.water}</p>
                <p style={{ fontSize: '14px', margin: '0 0 8px' }}><strong>खाद:</strong> {crop.fertilizer}</p>
                <div style={{ background: '#FFF8E1', borderRadius: '10px', padding: '10px' }}>
                  <p style={{ fontSize: '13px', color: '#E65100', margin: 0, fontWeight: 600 }}>💡 {crop.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 800, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowPestModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: '24px 24px 0 0', padding: '24px 20px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }} className="hide-scrollbar">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0D1B0D', margin: 0 }}>🐛 कीट और बीमारी</h2>
              <button onClick={() => setShowPestModal(false)} style={{ background: '#F5F5F5', border: 'none', borderRadius: '20px', width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ background: '#FFF8E1', borderRadius: '12px', padding: '12px', marginBottom: '14px', border: '2px solid #FFE082' }}>
              <p style={{ fontSize: '13px', color: '#E65100', margin: 0, fontWeight: 600 }}>⚠️ दवाई की मात्रा के लिए हमेशा KVK या कृषि केंद्र से पूछें</p>
            </div>
            {[
              { pest: 'माहू (Aphids)', emoji: '🐜', sign: 'पत्तों पर छोटे हरे-काले कीड़े, पत्ते मुड़ जाएं', remedy: 'साबुन का घोल या नीम का काढ़ा छिड़कें' },
              { pest: 'तना छेदक (Stem Borer)', emoji: '🪲', sign: 'तने में सुराख, पत्ते सूख जाएं', remedy: 'फेरोमोन ट्रैप लगाएं — KVK से लें' },
              { pest: 'पत्ती झुलसा (Blight)', emoji: '🍂', sign: 'पत्तों पर भूरे-काले धब्बे', remedy: 'Trichoderma जैव फफूंदनाशी — KVK से' },
              { pest: 'सफेद मक्खी (Whitefly)', emoji: '🦟', sign: 'पत्तों के नीचे सफेद धूल जैसे कीड़े', remedy: 'पीले चिपचिपे ट्रैप, नीम तेल 5% घोल' },
            ].map(item => (
              <div key={item.pest} style={{ background: '#F8FAF8', borderRadius: '14px', padding: '14px', marginBottom: '10px', border: '1.5px solid #FCE4EC' }}>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#C62828', marginBottom: '6px' }}>{item.emoji} {item.pest}</p>
                <p style={{ fontSize: '14px', margin: '0 0 4px' }}><strong>पहचान:</strong> {item.sign}</p>
                <p style={{ fontSize: '14px', margin: 0 }}><strong>उपाय:</strong> {item.remedy}</p>
              </div>
            ))}
            <button onClick={() => window.open('tel:18001801551')} style={{ width: '100%', height: '52px', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', color: '#FFF', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}>
              📞 किसान हेल्पलाइन: 1800-180-1551
            </button>
          </div>
        </div>
      )}

      {showCalendarModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 800, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowCalendarModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: '24px 24px 0 0', padding: '24px 20px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }} className="hide-scrollbar">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0D1B0D', margin: 0 }}>🌱 खेती कैलेंडर</h2>
              <button onClick={() => setShowCalendarModal(false)} style={{ background: '#F5F5F5', border: 'none', borderRadius: '20px', width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer' }}>×</button>
            </div>
            {[
              { season: 'रबी', crop: 'गेहूं, आलू, सरसों', sow: 'अक्टूबर से दिसंबर', harvest: 'मार्च-अप्रैल' },
              { season: 'खरीफ', crop: 'धान, मक्का, बाजरा', sow: 'जून-जुलाई', harvest: 'सितंबर-अक्टूबर' },
              { season: 'गरमी', crop: 'सब्जियां, तरबूज, खीरा', sow: 'मार्च से जून', harvest: 'मई-जुलाई' },
              { season: 'सर्दी', crop: 'पालक, ब्रोकली, चुकंदर', sow: 'अक्टूबर से दिसंबर', harvest: 'जनवरी-फरवरी' },
            ].map(item => (
              <div key={item.crop} style={{ background: '#F8FAF8', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '1.5px solid #E8F5E9' }}>
                <p style={{ fontSize: '17px', fontWeight: 800, color: '#1B5E20', marginBottom: '8px' }}>{item.season}</p>
                <p style={{ fontSize: '14px', margin: '0 0 4px' }}><strong>फसल:</strong> {item.crop}</p>
                <p style={{ fontSize: '14px', margin: '0 0 4px' }}><strong>बुआई:</strong> {item.sow}</p>
                <p style={{ fontSize: '14px', margin: 0 }}><strong>कटनी:</strong> {item.harvest}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
