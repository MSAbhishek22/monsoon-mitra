const fs = require('fs');

const files = [
  'src/App.jsx',
  'src/components/alerts/AlertBanner.jsx',
  'src/components/alerts/AlertModal.jsx',
  'src/components/common/BottomNav.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/SavingsPage.jsx',
  'src/pages/SettingsPage.jsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace inset: 0 overlay patterns
  content = content.replace(
    /position:\s*'fixed',\s*inset:\s*0/g,
    "position: 'fixed', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px'"
  );

  // Replace Top-centered Toast in SettingsPage.jsx
  if (file.includes('SettingsPage.jsx')) {
    content = content.replace(
      /position:\s*'fixed',\s*top:\s*'20px',\s*left:\s*'50%',\s*transform:\s*'translateX\(-50%\)'/g,
      "position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', width: 'max-content', maxWidth: '400px'"
    );
  }

  // Ensure LocationSearch Modal is fixed
  if (file.includes('SettingsPage.jsx') && content.includes("background: 'rgba(0,0,0,0.5)', zIndex: 1000")) {
    content = content.replace(
      /position:\s*'fixed',\s*inset:\s*0,\s*background:\s*'rgba\(0,0,0,0.5\)',\s*zIndex:\s*1000/g,
      "position: 'fixed', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: 'rgba(0,0,0,0.5)', zIndex: 1000"
    );
  }

  // Update App.jsx update banner
  if (file.includes('App.jsx')) {
    // handled by manual replace earlier but just in case
  }

  fs.writeFileSync(file, content);
});

console.log('Fixed Modals');
