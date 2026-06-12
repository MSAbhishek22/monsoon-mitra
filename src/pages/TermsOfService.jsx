// src/pages/TermsOfService.jsx — Complete bilingual Terms
import React from 'react';

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

export default function TermsOfService() {
  const handleBack = () => window.history.back();

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', paddingBottom: 40 }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#FFFFFF', borderBottom: '1px solid #E0E0E0',
        padding: 16, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={handleBack}
          style={{
            minWidth: 44, minHeight: 44, background: '#F1F8E9',
            border: 'none', borderRadius: 12, cursor: 'pointer',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          id="terms-back-btn"
        >
          ←
        </button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>उपयोग की शर्तें</h1>
          <p style={{ fontSize: 12, color: '#757575', margin: 0 }}>Terms of Service</p>
        </div>
      </div>

      <div style={{ padding: '24px 16px' }}>
        <p style={{ fontSize: 13, color: '#757575', marginBottom: 24 }}>
          अंतिम अपडेट: जून 2026 | Last Updated: June 2026
        </p>

        <Section title="1. स्वीकृति / Acceptance">
          <p>इस ऐप का उपयोग करके आप इन शर्तों को मानते हैं।</p>
          <p>By using Monsoon Mitra, you agree to these Terms of Service. If you do not agree, please do not use the app.</p>
        </Section>

        <Section title="2. ऐप का उपयोग / Use of App">
          <p>• यह ऐप केवल व्यक्तिगत, गैर-व्यावसायिक उपयोग के लिए है।</p>
          <p>• This app is for personal, non-commercial use only.</p>
          <p>• ऐप को hack करना, reverse engineer करना, या misuse करना प्रतिबंधित है।</p>
          <p>• Hacking, reverse engineering, or misusing the app is prohibited.</p>
        </Section>

        <Section title="3. सूचना की सीमाएं / Information Limitations">
          <p>यह ऐप केवल जानकारी प्रदान करता है। फसल हानि के लिए हम जिम्मेदार नहीं हैं।</p>
          <p>This app provides information only. We are NOT liable for crop losses based on app recommendations. Always consult your local Krishi Vigyan Kendra (KVK) for critical agricultural decisions.</p>
          <p>मौसम की जानकारी Open-Meteo API पर आधारित है और 100% सटीक नहीं हो सकती।</p>
          <p>Weather data is sourced from Open-Meteo API and may not be 100% accurate.</p>
        </Section>

        <Section title="4. AI की सीमाएं / AI Limitations">
          <p>• AI सहायक की सलाह अनुमान पर आधारित है — यह 100% सही नहीं हो सकती।</p>
          <p>• AI Sahayak's advice is based on estimates and may not always be correct.</p>
          <p>• महत्वपूर्ण निर्णयों के लिए हमेशा स्थानीय कृषि विशेषज्ञ से सलाह लें।</p>
          <p>• For critical decisions, always consult a local agricultural expert.</p>
          <p>• AI गलत जानकारी दे सकता है। Verify important advice independently.</p>
        </Section>

        <Section title="5. बचत के अनुमान / Savings Estimates">
          <p>• ऐप में दिखाई जाने वाली "बचत" केवल अनुमानित आंकड़े हैं, गारंटी नहीं।</p>
          <p>• Savings amounts displayed in the app are estimates only and are not guaranteed.</p>
          <p>• वास्तविक बचत फसल, खेत, और स्थानीय परिस्थितियों पर निर्भर करती है।</p>
        </Section>

        <Section title="6. बौद्धिक संपदा / Intellectual Property">
          <p>• ऐप और इसकी सभी सामग्री MS Abhishek की संपत्ति है।</p>
          <p>• The app and all its content are owned by MS Abhishek.</p>
          <p>• App design, code, and content are protected under Indian copyright law.</p>
        </Section>

        <Section title="7. परिवर्तन / Changes to Terms">
          <p>हम इन शर्तों को बिना पूर्व सूचना के बदल सकते हैं। नवीनतम शर्तें हमेशा ऐप में उपलब्ध होंगी।</p>
          <p>We can change these terms without prior notice. The latest terms will always be available in the app.</p>
        </Section>

        <Section title="8. शासी कानून / Governing Law">
          <p>ये शर्तें भारत के कानूनों के अनुसार हैं। किसी भी विवाद के लिए उत्तर प्रदेश, मेरठ की अदालत का अधिकार क्षेत्र होगा।</p>
          <p>These terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of courts in Meerut, Uttar Pradesh, India.</p>
        </Section>

        <Section title="9. आयु सीमा / Age Requirement">
          <p>यह ऐप 13 वर्ष से अधिक आयु के व्यक्तियों के लिए है।</p>
          <p>This app is intended for persons aged 13 years and above.</p>
        </Section>

        <Section title="10. संपर्क / Contact">
          <p><strong>MS Abhishek</strong></p>
          <p>Shobhit University, Meerut, Uttar Pradesh, India</p>
          <p>Email: msabhishekanni10@gmail.com</p>
        </Section>
      </div>
    </div>
  );
}
