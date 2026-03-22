import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ta" | "te" | "kn" | "ml" | "hi" | "fr" | "es" | "ar" | "zh";

export const LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  { code: "zh", label: "Chinese", nativeLabel: "中文" },
];

// Translation keys
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & Common
    "nav.back": "← Back",
    "nav.signIn": "Sign In",
    "nav.tryNow": "Try Now",
    "nav.home": "Home",
    "nav.tools": "Tools",
    "nav.settings": "Settings",
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.submit": "Submit",
    "common.close": "Close",
    "common.language": "Language",

    // Landing
    "landing.tagline": "AI-Powered Dental Triage",
    "landing.headline": "Your Pocket Dentist.",
    "landing.headlineSub": "Detect Early. Act Fast.",
    "landing.description": "DentaScan AI uses computer vision to detect cavities, map plaque build-up, and track oral lesions — giving you clinical-grade insights from your phone's camera.",
    "landing.startScan": "Start Scan",
    "landing.installApp": "Install App",

    // Pricing
    "pricing.title": "Choose Your Plan",
    "pricing.subtitle": "Unlock the full Monster Hunter experience",
    "pricing.free": "Free",
    "pricing.foreverFree": "Forever free",
    "pricing.pro": "Pro",
    "pricing.perMonth": "/month",
    "pricing.recommended": "RECOMMENDED",
    "pricing.currentPlan": "Current Plan",
    "pricing.activePro": "Active Pro Member",
    "pricing.trialActive": "Free Trial Active",
    "pricing.daysLeft": "days left",
    "pricing.allProUnlocked": "All Pro features unlocked",
    "pricing.payViaUPI": "Pay via UPI",
    "pricing.scanQR": "Or scan QR to pay",
    "pricing.hideQR": "Hide QR Code",
    "pricing.upiId": "UPI ID",
    "pricing.securePayment": "Secure payment via UPI",
    "pricing.confirmPayment": "I have paid — Confirm payment",
    "pricing.enterTxnId": "Enter your UPI transaction ID (optional) to help us verify faster.",
    "pricing.txnIdPlaceholder": "UPI Transaction ID (optional)",
    "pricing.submitClaim": "Submit Claim",
    "pricing.submitting": "Submitting...",
    "pricing.paymentReview": "Payment Under Review",
    "pricing.paymentReviewSub": "We'll activate your Pro account once verified",
    "pricing.claimSuccess": "Payment claim submitted! We'll verify and activate your Pro account shortly.",
    "pricing.signInFirst": "Please sign in first",

    // Features
    "feature.aiScanner": "AI Dental Scanner",
    "feature.parentSync": "Real-time parent-child sync",
    "feature.unlimitedBattles": "Unlimited battle events",
    "feature.monsterEvolution": "Monster evolution system",
    "feature.prioritySupport": "Priority support",
    "feature.familySync": "Family sync across devices",
    "feature.detailedReports": "Detailed progress reports",
    "feature.basicGame": "Basic brushing game",
    "feature.threeBattles": "3 monster battles/day",
    "feature.localOnly": "Local progress only",

    // Monster Hunter
    "mh.dentalDefense": "DENTAL DEFENSE",
    "mh.trophyRoom": "TROPHY ROOM",
    "mh.battlesRemaining": "battles remaining today",
    "mh.limitReached": "Daily battle limit reached",
    "mh.goPro": "Go Pro",
    "mh.rescanIdentity": "Re-scan identity",
    "mh.guildMasterPortal": "Guild Master Portal",
    "mh.commander": "Commander",
    "mh.enterPin": "Enter Parent PIN",
    "mh.unlockCommand": "Unlock Command Center",
    "mh.commandCenter": "Command Center",
    "mh.managing": "Managing Hunter",

    // Checklist
    "checklist.title": "First Siege Checklist",
    "checklist.subtitle": "Complete these checks before your Hunter's first battle to ensure the Mirror of Truth works perfectly.",
    "checklist.preflight": "Pre-flight Check",
    "checklist.launch": "Launch First Siege!",
    "checklist.completeAll": "Complete all checks to proceed",
    "checklist.skip": "Skip checklist (experienced Guild Master)",
    "checklist.verified": "Verified ✓",
    "checklist.markVerified": "Mark as verified",

    // Auth
    "auth.signUp": "Sign Up",
    "auth.logIn": "Log In",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.fullName": "Full Name",
    "auth.signOut": "Sign Out",
    "auth.signInToAccount": "Sign in to your account",
    "auth.createAccount": "Create a new account",
    "auth.pleaseWait": "Please wait…",
    "auth.createAccountBtn": "Create Account",
    "auth.noAccount": "Don't have an account?",
    "auth.haveAccount": "Already have an account?",
    "auth.signedIn": "Signed in successfully!",
    "auth.checkEmail": "Check your email to verify your account!",

    // Index
    "index.aiAnalysis": "AI Dental Analysis",
    "index.aiAnalysisDesc": "Capture or upload a dental photo and let AI analyze it for cavities, plaque, gum health, and more.",
    "index.triageEngine": "Triage Engine",
    "index.triageDesc": "Priority-based triage with actionable next steps — emergency calls, appointment booking, sensitivity tracking, and cleaning countdowns.",
    "index.lesionTracker": "Lesion Tracker · 14-Day Protocol",
    "index.lesionDesc": "Longitudinal tracking with photo gallery, progress timeline, and automatic biopsy alert when a lesion persists beyond 10 days.",
    "index.scannerInterface": "Scanner Interface",
    "index.scannerDesc": "Simulated scanner with stability meter and focus check.",
    "index.plaqueHeatmap": "Plaque Heatmap Toggle",
    "index.plaqueDesc": "Gaussian-blur heatmap overlays with a glowing pulse effect simulating AI detection zones.",
    "index.toothNavigator": "Tooth-by-Tooth Navigator",
    "index.providerPortal": "Provider Portal",
    "index.allTools": "All Tools",
    "index.privacyPolicy": "Privacy Policy",
    "index.forDentists": "For Dentists",
    "index.about": "About",
    "index.disclaimer": "AI analysis for informational purposes only. Not a medical device.",
    "index.developedBy": "Developed by Shreemathrae, Shobica Rani, Dharshana, Dhamayenthi & Dhanushri",

    // Tools
    "tools.title": "DentaScan Tools",
    "tools.hero": "AI-Powered Dental Suite",
    "tools.headline": "Six clinical-grade tools, one intelligent platform",
    "tools.heroDesc": "From computer vision to acoustic diagnostics — advanced dental analysis powered by AI, accessible from your phone.",
    "tools.disclaimer": "All tools provide AI-assisted analysis only. Not a substitute for professional dental care.",
  },
  ta: {
    "nav.back": "← பின்",
    "nav.signIn": "உள்நுழைக",
    "nav.tryNow": "இப்போது முயற்சிக்கவும்",
    "common.loading": "ஏற்றுகிறது...",
    "common.save": "சேமி",
    "common.cancel": "ரத்து",
    "common.submit": "சமர்ப்பி",
    "common.close": "மூடு",
    "common.language": "மொழி",
    "landing.tagline": "AI-இயக்கப்படும் பல் முன்னுரிமை",
    "landing.headline": "உங்கள் பாக்கெட் பல் மருத்துவர்.",
    "landing.headlineSub": "முன்கூட்டியே கண்டறியுங்கள். வேகமாக செயல்படுங்கள்.",
    "landing.description": "DentaScan AI கம்ப்யூட்டர் விஷன் பயன்படுத்தி பல் சொத்தையை கண்டறிகிறது.",
    "pricing.title": "உங்கள் திட்டத்தை தேர்வு செய்யுங்கள்",
    "pricing.subtitle": "முழு Monster Hunter அனுபவத்தை திறக்கவும்",
    "pricing.free": "இலவசம்",
    "pricing.foreverFree": "எப்போதும் இலவசம்",
    "pricing.pro": "Pro",
    "pricing.perMonth": "/மாதம்",
    "pricing.recommended": "பரிந்துரைக்கப்படுகிறது",
    "pricing.currentPlan": "தற்போதைய திட்டம்",
    "pricing.payViaUPI": "UPI வழியாக செலுத்துங்கள்",
    "pricing.confirmPayment": "நான் செலுத்திவிட்டேன் — பணத்தை உறுதிப்படுத்து",
    "pricing.submitClaim": "கோரிக்கையை சமர்ப்பிக்கவும்",
    "pricing.activePro": "செயலில் உள்ள Pro உறுப்பினர்",
    "pricing.securePayment": "UPI வழியாக பாதுகாப்பான பணம்",
    "pricing.submitting": "சமர்ப்பிக்கிறது...",
    "pricing.signInFirst": "முதலில் உள்நுழையவும்",
    "mh.dentalDefense": "பல் பாதுகாப்பு",
    "mh.trophyRoom": "கோப்பை அறை",
    "mh.battlesRemaining": "போர்கள் இன்று மீதம்",
    "mh.limitReached": "தினசரி போர் வரம்பை எட்டியது",
    "mh.goPro": "Pro பெறுங்கள்",
    "mh.rescanIdentity": "அடையாளத்தை மீண்டும் ஸ்கேன் செய்",
    "mh.guildMasterPortal": "கில்ட் மாஸ்டர் போர்ட்டல்",
    "mh.commander": "தளபதி",
    "mh.enterPin": "பெற்றோர் PIN உள்ளிடவும்",
    "mh.unlockCommand": "கட்டளை மையத்தை திறக்கவும்",
    "checklist.title": "முதல் முற்றுகை சரிபார்ப்பு பட்டியல்",
    "auth.signUp": "பதிவு செய்க",
    "auth.logIn": "உள்நுழைக",
    "auth.email": "மின்னஞ்சல்",
    "auth.password": "கடவுச்சொல்",
    "auth.fullName": "முழு பெயர்",
    "auth.signOut": "வெளியேறு",
    "auth.signInToAccount": "உங்கள் கணக்கில் உள்நுழையவும்",
    "auth.createAccount": "புதிய கணக்கை உருவாக்கவும்",
    "auth.pleaseWait": "காத்திருங்கள்…",
    "auth.createAccountBtn": "கணக்கை உருவாக்கு",
    "auth.noAccount": "கணக்கு இல்லையா?",
    "auth.haveAccount": "ஏற்கனவே கணக்கு உள்ளதா?",
    "index.aiAnalysis": "AI பல் பகுப்பாய்வு",
    "index.aiAnalysisDesc": "பல் புகைப்படத்தை எடுத்து AI பகுப்பாய்வு பெறுங்கள்.",
    "index.triageEngine": "முன்னுரிமை இயந்திரம்",
    "index.lesionTracker": "புண் கண்காணிப்பு · 14-நாள் நெறிமுறை",
    "index.allTools": "அனைத்து கருவிகள்",
    "index.privacyPolicy": "தனியுரிமைக் கொள்கை",
    "index.forDentists": "பல் மருத்துவர்களுக்கு",
    "index.about": "பற்றி",
    "tools.hero": "AI-இயக்கப்படும் பல் தொகுப்பு",
    "tools.headline": "ஆறு கருவிகள், ஒரு தளம்",
    "tools.disclaimer": "அனைத்து கருவிகளும் AI-உதவி பகுப்பாய்வை மட்டுமே வழங்குகின்றன.",
  },
  te: {
    "nav.back": "← వెనుకకు",
    "nav.signIn": "సైన్ ఇన్",
    "common.loading": "లోడ్ అవుతోంది...",
    "common.save": "సేవ్",
    "common.cancel": "రద్దు",
    "common.language": "భాష",
    "landing.tagline": "AI-ఆధారిత దంత ట్రైయేజ్",
    "landing.headline": "మీ పాకెట్ దంతవైద్యుడు.",
    "landing.headlineSub": "ముందుగా గుర్తించండి. త్వరగా పనిచేయండి.",
    "pricing.title": "మీ ప్లాన్ ఎంచుకోండి",
    "pricing.free": "ఉచితం",
    "pricing.pro": "Pro",
    "pricing.payViaUPI": "UPI ద్వారా చెల్లించండి",
    "mh.dentalDefense": "డెంటల్ డిఫెన్స్",
    "mh.guildMasterPortal": "గిల్డ్ మాస్టర్ పోర్టల్",
    "mh.enterPin": "పేరెంట్ PIN నమోదు చేయండి",
    "auth.signUp": "సైన్ అప్",
    "auth.logIn": "లాగిన్",
    "auth.signOut": "సైన్ అవుట్",
  },
  kn: {
    "nav.back": "← ಹಿಂದೆ",
    "nav.signIn": "ಸೈನ್ ಇನ್",
    "common.loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    "common.language": "ಭಾಷೆ",
    "landing.tagline": "AI-ಚಾಲಿತ ದಂತ ಟ್ರಯಾಜ್",
    "landing.headline": "ನಿಮ್ಮ ಪಾಕೆಟ್ ದಂತವೈದ್ಯ.",
    "landing.headlineSub": "ಬೇಗ ಪತ್ತೆ ಮಾಡಿ. ವೇಗವಾಗಿ ಕ್ರಿಯೆ ಮಾಡಿ.",
    "pricing.title": "ನಿಮ್ಮ ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "pricing.free": "ಉಚಿತ",
    "pricing.payViaUPI": "UPI ಮೂಲಕ ಪಾವತಿಸಿ",
    "mh.dentalDefense": "ಡೆಂಟಲ್ ಡಿಫೆನ್ಸ್",
    "mh.guildMasterPortal": "ಗಿಲ್ಡ್ ಮಾಸ್ಟರ್ ಪೋರ್ಟಲ್",
    "mh.enterPin": "ಪೋಷಕರ PIN ನಮೂದಿಸಿ",
    "auth.signUp": "ಸೈನ್ ಅಪ್",
    "auth.logIn": "ಲಾಗಿನ್",
    "auth.signOut": "ಸೈನ್ ಔಟ್",
  },
  ml: {
    "nav.back": "← പിന്നിലേക്ക്",
    "nav.signIn": "സൈൻ ഇൻ",
    "common.loading": "ലോഡ് ചെയ്യുന്നു...",
    "common.language": "ഭാഷ",
    "landing.tagline": "AI-പ്രവർത്തിത ഡെന്റൽ ട്രയേജ്",
    "landing.headline": "നിങ്ങളുടെ പോക്കറ്റ് ഡെന്റിസ്റ്റ്.",
    "landing.headlineSub": "നേരത്തെ കണ്ടെത്തുക. വേഗം പ്രവർത്തിക്കുക.",
    "pricing.title": "നിങ്ങളുടെ പ്ലാൻ തിരഞ്ഞെടുക്കുക",
    "pricing.free": "സൗജന്യം",
    "pricing.payViaUPI": "UPI വഴി പണമടയ്ക്കുക",
    "mh.dentalDefense": "ഡെന്റൽ ഡിഫൻസ്",
    "mh.guildMasterPortal": "ഗിൽഡ് മാസ്റ്റർ പോർട്ടൽ",
    "mh.enterPin": "രക്ഷാകർതൃ PIN നൽകുക",
    "auth.signUp": "സൈൻ അപ്പ്",
    "auth.logIn": "ലോഗിൻ",
    "auth.signOut": "സൈൻ ഔട്ട്",
  },
  hi: {
    "nav.back": "← वापस",
    "nav.signIn": "साइन इन करें",
    "nav.tryNow": "अभी आज़माएं",
    "common.loading": "लोड हो रहा है...",
    "common.save": "सहेजें",
    "common.cancel": "रद्द करें",
    "common.submit": "जमा करें",
    "common.language": "भाषा",
    "landing.tagline": "AI-संचालित डेंटल ट्राइएज",
    "landing.headline": "आपका पॉकेट डेंटिस्ट।",
    "landing.headlineSub": "जल्दी पहचानें। तेज़ी से कार्रवाई करें।",
    "landing.description": "DentaScan AI कंप्यूटर विज़न का उपयोग करके कैविटी का पता लगाता है।",
    "pricing.title": "अपना प्लान चुनें",
    "pricing.subtitle": "पूर्ण Monster Hunter अनुभव अनलॉक करें",
    "pricing.free": "मुफ़्त",
    "pricing.foreverFree": "हमेशा मुफ़्त",
    "pricing.pro": "Pro",
    "pricing.perMonth": "/महीना",
    "pricing.payViaUPI": "UPI से भुगतान करें",
    "pricing.confirmPayment": "मैंने भुगतान किया — भुगतान की पुष्टि करें",
    "mh.dentalDefense": "डेंटल डिफेंस",
    "mh.trophyRoom": "ट्रॉफी रूम",
    "mh.guildMasterPortal": "गिल्ड मास्टर पोर्टल",
    "mh.enterPin": "पैरेंट PIN दर्ज करें",
    "mh.unlockCommand": "कमांड सेंटर अनलॉक करें",
    "checklist.title": "पहला युद्ध चेकलिस्ट",
    "auth.signUp": "साइन अप",
    "auth.logIn": "लॉग इन",
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.fullName": "पूरा नाम",
    "auth.signOut": "साइन आउट",
  },
  fr: {
    "nav.back": "← Retour",
    "nav.signIn": "Connexion",
    "nav.tryNow": "Essayer",
    "common.loading": "Chargement...",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.submit": "Soumettre",
    "common.close": "Fermer",
    "common.language": "Langue",
    "landing.tagline": "Triage dentaire alimenté par IA",
    "landing.headline": "Votre dentiste de poche.",
    "landing.headlineSub": "Détectez tôt. Agissez vite.",
    "landing.description": "DentaScan AI utilise la vision par ordinateur pour détecter les caries et cartographier la plaque.",
    "pricing.title": "Choisissez votre plan",
    "pricing.subtitle": "Débloquez l'expérience complète Monster Hunter",
    "pricing.free": "Gratuit",
    "pricing.foreverFree": "Gratuit pour toujours",
    "pricing.pro": "Pro",
    "pricing.perMonth": "/mois",
    "pricing.recommended": "RECOMMANDÉ",
    "pricing.payViaUPI": "Payer via UPI",
    "pricing.confirmPayment": "J'ai payé — Confirmer le paiement",
    "mh.dentalDefense": "DÉFENSE DENTAIRE",
    "mh.trophyRoom": "SALLE DES TROPHÉES",
    "mh.guildMasterPortal": "Portail du Maître de Guilde",
    "mh.enterPin": "Entrez le PIN parental",
    "mh.unlockCommand": "Déverrouiller le Centre de Commande",
    "checklist.title": "Liste de vérification du premier siège",
    "auth.signUp": "S'inscrire",
    "auth.logIn": "Se connecter",
    "auth.email": "E-mail",
    "auth.password": "Mot de passe",
    "auth.fullName": "Nom complet",
    "auth.signOut": "Déconnexion",
  },
  es: {
    "nav.back": "← Volver",
    "nav.signIn": "Iniciar sesión",
    "common.loading": "Cargando...",
    "common.language": "Idioma",
    "landing.tagline": "Triaje dental con IA",
    "landing.headline": "Tu dentista de bolsillo.",
    "landing.headlineSub": "Detecta temprano. Actúa rápido.",
    "pricing.title": "Elige tu plan",
    "pricing.free": "Gratis",
    "pricing.pro": "Pro",
    "pricing.payViaUPI": "Pagar con UPI",
    "mh.dentalDefense": "DEFENSA DENTAL",
    "mh.guildMasterPortal": "Portal del Maestro del Gremio",
    "mh.enterPin": "Ingrese el PIN de los padres",
    "auth.signUp": "Registrarse",
    "auth.logIn": "Iniciar sesión",
    "auth.signOut": "Cerrar sesión",
  },
  ar: {
    "nav.back": "← رجوع",
    "nav.signIn": "تسجيل الدخول",
    "common.loading": "جاري التحميل...",
    "common.language": "اللغة",
    "landing.headline": "طبيب أسنانك الشخصي.",
    "landing.headlineSub": "اكتشف مبكراً. تصرف بسرعة.",
    "pricing.title": "اختر خطتك",
    "pricing.free": "مجاني",
    "pricing.payViaUPI": "ادفع عبر UPI",
    "mh.dentalDefense": "الدفاع عن الأسنان",
    "mh.enterPin": "أدخل رقم التعريف الأبوي",
    "auth.signUp": "التسجيل",
    "auth.logIn": "تسجيل الدخول",
    "auth.signOut": "تسجيل الخروج",
  },
  zh: {
    "nav.back": "← 返回",
    "nav.signIn": "登录",
    "common.loading": "加载中...",
    "common.language": "语言",
    "landing.headline": "您的口袋牙医。",
    "landing.headlineSub": "早期发现，快速行动。",
    "pricing.title": "选择您的方案",
    "pricing.free": "免费",
    "pricing.payViaUPI": "通过UPI付款",
    "mh.dentalDefense": "牙齿防御",
    "mh.enterPin": "输入家长PIN",
    "auth.signUp": "注册",
    "auth.logIn": "登录",
    "auth.signOut": "退出",
  },
};

const STORAGE_KEY = "dentascan-language";
const CHOSEN_KEY = "dentascan-language-chosen";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  hasChosenLanguage: boolean;
  markLanguageChosen: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && LANGUAGES.some(l => l.code === stored)) return stored as Language;
    } catch {}
    return "en";
  });

  const [hasChosenLanguage, setHasChosenLanguage] = useState(() => {
    try { return localStorage.getItem(CHOSEN_KEY) === "true"; } catch { return false; }
  });

  const markLanguageChosen = () => {
    setHasChosenLanguage(true);
    try { localStorage.setItem(CHOSEN_KEY, "true"); } catch {}
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, []);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, hasChosenLanguage, markLanguageChosen }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
