// src/pages/PrivacyPolicy.jsx — Complete bilingual legal content
import React from 'react';
import { useApp } from '../context/AppContext';

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{
        fontSize: 17, fontWeight: 700, color: '#1A1A1A', marginBottom: 12,
        borderLeft: '4px solid #2E7D32', paddingLeft: 12,
      }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, color: '#4A4A4A', lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, children }) {
  return (
    <div style={{
      display: 'flex', gap: 12, marginBottom: 12,
      background: '#F9F9F9', borderRadius: 10, padding: 12,
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>{label}</p>
        <p style={{ fontSize: 13, color: '#4A4A4A', margin: 0, lineHeight: 1.6 }}>{children}</p>
      </div>
    </div>
  );
}

export default function PrivacyPolicy() {
  const { setActiveTab } = useApp();

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', paddingBottom: 40 }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#FFFFFF', borderBottom: '1px solid #E0E0E0',
        padding: 16, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            width: '44px', height: '44px', borderRadius: '22px',
            background: '#F1F8E9', border: '2px solid #C8E6C9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '18px', color: '#2E7D32'
          }}
          id="privacy-back-btn"
        >
          ←
        </button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>गोपनीयता नीति</h1>
          <p style={{ fontSize: 12, color: '#757575', margin: 0 }}>Privacy Policy</p>
        </div>
      </div>

      <div style={{ padding: '24px 16px' }}>
        <p style={{ fontSize: 13, color: '#757575', marginBottom: 24 }}>
          अंतिम अपडेट: जून 2026 | Last Updated: June 2026
        </p>

        <Section title="1. परिचय / Introduction">
          <p>Monsoon Mitra एक मुफ्त किसान सहायक ऐप है जो भारतीय किसानों को मौसम-आधारित सिंचाई सलाह देता है।</p>
          <p>Monsoon Mitra is a free farmer assistant app providing weather-based irrigation advice to Indian farmers. This policy explains what data we collect and how we use it.</p>
          <p><strong>Built together by MS Abhishek & Aayushi Goel</strong></p>
        </Section>

        <Section title="2. हम क्या जानकारी लेते हैं / What We Collect">
          <InfoRow icon="📍" label="स्थान / Location">
            आपके खेत का GPS स्थान केवल मौसम जानकारी के लिए उपयोग होता है। यह हमारे सर्वर पर सेव नहीं किया जाता।
            Your farm GPS location is used only for weather data. It is NOT stored on our servers.
          </InfoRow>
          <InfoRow icon="💬" label="AI Chat Messages">
            आपके सवाल Google Gemini API द्वारा संसाधित किए जाते हैं। हम चैट हिस्ट्री अपने सर्वर पर नहीं रखते।
            Your AI questions are processed by Google Gemini API via our secure proxy. We do NOT store chat history on our servers.
          </InfoRow>
          <InfoRow icon="📊" label="Usage Analytics">
            हम Firebase Analytics के माध्यम से अनाम उपयोग डेटा एकत्र करते हैं (जैसे: कौन सा tab ज़्यादा खुला)। कोई व्यक्तिगत पहचान नहीं।
            We collect anonymous usage analytics via Firebase (e.g., which tab is used most). No personal identification.
          </InfoRow>
          <InfoRow icon="🔔" label="Notification Token (FCM)">
            यदि आप सूचनाएं चालू करते हैं, तो आपका FCM device token सिर्फ आपके फोन पर सेव होता है।
            If you enable notifications, your FCM device token is stored only on your phone.
          </InfoRow>
          <InfoRow icon="🌾" label="फसल और प्राथमिकताएं / Preferences">
            आपका नाम, फसल, और भाषा केवल आपके फोन पर (localStorage) सेव होती है। यह हमारे पास नहीं जाती।
            Your name, crop, and language are stored only on your phone (localStorage). They never leave your device.
          </InfoRow>
        </Section>

        <Section title="3. Third-Party Services">
          <p>• <strong>Google Gemini API</strong> — AI responses | Google's Privacy Policy applies</p>
          <p>• <strong>Open-Meteo</strong> — Weather data | No personal data shared</p>
          <p>• <strong>Firebase Analytics</strong> — Anonymous usage analytics only</p>
          <p>• <strong>Firebase Cloud Messaging (FCM)</strong> — For push notifications (optional)</p>
          <p>• <strong>Vercel</strong> — Hosting and serverless functions</p>
        </Section>

        <Section title="4. डेटा की सुरक्षा / Data Security">
          <p>• आपकी Gemini API key कभी frontend में नहीं आती — हम एक secure server proxy use करते हैं।</p>
          <p>• Your AI requests are proxied through our secure Vercel serverless function. The Gemini API key is server-side only.</p>
          <p>• All communication uses HTTPS with HSTS headers.</p>
          <p>• We implement Content Security Policy (CSP) headers to prevent XSS attacks.</p>
        </Section>

        <Section title="5. आपके अधिकार / Your Rights">
          <p>• Settings → "सभी डेटा हटाएं" बटन से आप सारा डेटा मिटा सकते हैं।</p>
          <p>• You can delete all your data at any time via Settings → "Delete All Data".</p>
          <p>• For data requests or concerns: msabhishekanni10@gmail.com</p>
          <p>• We comply with India's Information Technology Act, 2000.</p>
        </Section>

        <Section title="6. बच्चों की सुरक्षा / Children's Safety">
          <p>यह ऐप 13 वर्ष से कम आयु के बच्चों के लिए नहीं है। हम जानबूझकर बच्चों का डेटा नहीं लेते।</p>
          <p>This app is not intended for children under 13. We do not knowingly collect data from children.</p>
        </Section>

        <Section title="7. परिवर्तन / Changes to This Policy">
          <p>हम इस नीति को अपडेट कर सकते हैं। बड़े बदलावों की जानकारी ऐप के ज़रिए दी जाएगी।</p>
          <p>We may update this policy. Significant changes will be communicated through the app.</p>
        </Section>

        <Section title="8. संपर्क / Contact">
          <div>
            <p style={{ fontWeight: 700, color: '#1A1A1A' }}>MS Abhishek</p>
            <p>Email: msabhishekanni10@gmail.com</p>
            <p>GitHub: MSAbhishek22</p>
            <br/>
            <p style={{ fontWeight: 700, color: '#1A1A1A' }}>Aayushi Goel</p>
            <p>Email: aayushigoel73@gmail.com</p>
            <br/>
            <p style={{ color: '#757575', fontSize: '14px' }}>Built together by MS Abhishek & Aayushi Goel</p>
          </div>
        </Section>
      </div>
    </div>
  );
}
