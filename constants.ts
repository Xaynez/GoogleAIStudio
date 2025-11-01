import type { MarketplaceListing, MarketplaceCategory, Conversation, Locale, Post, OpportunityTeaser, FeedItem, Notification, NetworkUser, Reaction } from './types';
import {
    GoogleAccountIcon,
    GoogleAdsIcon,
    GoogleCalendarIcon,
    GoogleChatIcon,
    GoogleContactsIcon,
    GoogleDocsIcon,
    GoogleDriveIcon,
    GoogleFormsIcon,
    GoogleGeminiIcon,
    GoogleGmailIcon,
    GoogleKeepIcon,
    GoogleMapsIcon,
    GoogleMeetIcon,
    GoogleNewsIcon,
    GooglePhotosIcon,
    GooglePlayIcon,
    GoogleSearchIcon,
    GoogleSheetsIcon,
    GoogleSlidesIcon,
    GoogleTasksIcon,
    GoogleTranslateIcon,
    GoogleTravelIcon,
    GoogleWalletIcon,
    GoogleYoutubeIcon,
} from './components/GoogleAppIcons';

// A comprehensive list of locales for robust internationalization support.
export const SUPPORTED_LOCALES: Locale[] = [
  { id: 'en_US', code: 'en-US', name: 'English', nativeName: 'English', country: 'United States', dialCode: '+1', flag: '🇺🇸', rtl: false, font: 'Noto Sans', currency: 'USD' },
  { id: 'en_GB', code: 'en-GB', name: 'English UK', nativeName: 'English UK', country: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', rtl: false, font: 'Noto Sans', currency: 'GBP' },
  { id: 'en_CA', code: 'en-CA', name: 'English Canada', nativeName: 'English Canada', country: 'Canada', dialCode: '+1', flag: '🇨🇦', rtl: false, font: 'Noto Sans', currency: 'CAD' },
  { id: 'fr_FR', code: 'fr-FR', name: 'French', nativeName: 'Français', country: 'France', dialCode: '+33', flag: '🇫🇷', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'fr_CA', code: 'fr-CA', name: 'French Canada', nativeName: 'Français', country: 'Canada', dialCode: '+1', flag: '🇨🇦', rtl: false, font: 'Noto Sans', currency: 'CAD' },
  { id: 'es_ES', code: 'es-ES', name: 'Spanish', nativeName: 'Español', country: 'Spain', dialCode: '+34', flag: '🇪🇸', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'es_MX', code: 'es-MX', name: 'Spanish Mexico', nativeName: 'Español', country: 'México', dialCode: '+52', flag: '🇲🇽', rtl: false, font: 'Noto Sans', currency: 'MXN' },
  { id: 'pt_BR', code: 'pt-BR', name: 'Portuguese Brazil', nativeName: 'Português', country: 'Brasil', dialCode: '+55', flag: '🇧🇷', rtl: false, font: 'Noto Sans', currency: 'BRL' },
  { id: 'pt_PT', code: 'pt-PT', name: 'Portuguese', nativeName: 'Português', country: 'Portugal', dialCode: '+351', flag: '🇵🇹', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'de_DE', code: 'de-DE', name: 'German', nativeName: 'Deutsch', country: 'Germany', dialCode: '+49', flag: '🇩🇪', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'de_AT', code: 'de-AT', name: 'German Austria', nativeName: 'Deutsch', country: 'Austria', dialCode: '+43', flag: '🇦🇹', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'de_CH', code: 'de-CH', name: 'German Switzerland', nativeName: 'Deutsch', country: 'Switzerland', dialCode: '+41', flag: '🇨🇭', rtl: false, font: 'Noto Sans', currency: 'CHF' },
  { id: 'it_IT', code: 'it-IT', name: 'Italian', nativeName: 'Italiano', country: 'Italy', dialCode: '+39', flag: '🇮🇹', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'nl_NL', code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', country: 'Netherlands', dialCode: '+31', flag: '🇳🇱', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'sv_SE', code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', country: 'Sweden', dialCode: '+46', flag: '🇸🇪', rtl: false, font: 'Noto Sans', currency: 'SEK' },
  { id: 'da_DK', code: 'da-DK', name: 'Danish', nativeName: 'Dansk', country: 'Denmark', dialCode: '+45', flag: '🇩🇰', rtl: false, font: 'Noto Sans', currency: 'DKK' },
  { id: 'nb_NO', code: 'nb-NO', name: 'Norwegian', nativeName: 'Norsk', country: 'Norway', dialCode: '+47', flag: '🇳🇴', rtl: false, font: 'Noto Sans', currency: 'NOK' },
  { id: 'fi_FI', code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi', country: 'Finland', dialCode: '+358', flag: '🇫🇮', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'pl_PL', code: 'pl-PL', name: 'Polish', nativeName: 'Polski', country: 'Poland', dialCode: '+48', flag: '🇵🇱', rtl: false, font: 'Noto Sans', currency: 'PLN' },
  { id: 'ro_RO', code: 'ro-RO', name: 'Romanian', nativeName: 'Română', country: 'Romania', dialCode: '+40', flag: '🇷🇴', rtl: false, font: 'Noto Sans', currency: 'RON' },
  { id: 'hu_HU', code: 'hu-HU', name: 'Hungarian', nativeName: 'Magyar', country: 'Hungary', dialCode: '+36', flag: '🇭🇺', rtl: false, font: 'Noto Sans', currency: 'HUF' },
  { id: 'el_GR', code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά', country: 'Greece', dialCode: '+30', flag: '🇬🇷', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'cs_CZ', code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština', country: 'Czechia', dialCode: '+420', flag: '🇨🇿', rtl: false, font: 'Noto Sans', currency: 'CZK' },
  { id: 'sk_SK', code: 'sk-SK', name: 'Slovak', nativeName: 'Slovenčina', country: 'Slovakia', dialCode: '+421', flag: '🇸🇰', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'sl_SI', code: 'sl-SI', name: 'Slovenian', nativeName: 'Slovenščina', country: 'Slovenia', dialCode: '+386', flag: '🇸🇮', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'bg_BG', code: 'bg-BG', name: 'Bulgarian', nativeName: 'Български', country: 'Bulgaria', dialCode: '+359', flag: '🇧🇬', rtl: false, font: 'Noto Sans', currency: 'BGN' },
  { id: 'sr_RS', code: 'sr-RS', name: 'Serbian', nativeName: 'Српски', country: 'Serbia', dialCode: '+381', flag: '🇷🇸', rtl: false, font: 'Noto Sans', currency: 'RSD' },
  { id: 'hr_HR', code: 'hr-HR', name: 'Croatian', nativeName: 'Hrvatski', country: 'Croatia', dialCode: '+385', flag: '🇭🇷', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'lt_LT', code: 'lt-LT', name: 'Lithuanian', nativeName: 'Lietuvių', country: 'Lithuania', dialCode: '+370', flag: '🇱🇹', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'lv_LV', code: 'lv-LV', name: 'Latvian', nativeName: 'Latviešu', country: 'Latvia', dialCode: '+371', flag: '🇱🇻', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'et_EE', code: 'et-EE', name: 'Estonian', nativeName: 'Eesti', country: 'Estonia', dialCode: '+372', flag: '🇪🇪', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'uk_UA', code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', country: 'Ukraine', dialCode: '+380', flag: '🇺🇦', rtl: false, font: 'Noto Sans', currency: 'UAH' },
  { id: 'ru_RU', code: 'ru-RU', name: 'Russian', nativeName: 'Русский', country: 'Russia', dialCode: '+7', flag: '🇷🇺', rtl: false, font: 'Noto Sans', currency: 'RUB' },
  { id: 'tr_TR', code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', country: 'Türkiye', dialCode: '+90', flag: '🇹🇷', rtl: false, font: 'Noto Sans', currency: 'TRY' },
  { id: 'he_IL', code: 'he-IL', name: 'Hebrew', nativeName: 'עברית', country: 'Israel', dialCode: '+972', flag: '🇮🇱', rtl: true, font: 'Noto Sans Hebrew', currency: 'ILS' },
  { id: 'ar_SA', code: 'ar-SA', name: 'Arabic Saudi', nativeName: 'العربية', country: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', rtl: true, font: 'Noto Naskh Arabic', currency: 'SAR' },
  { id: 'ar_EG', code: 'ar-EG', name: 'Arabic Egypt', nativeName: 'العربية', country: 'Egypt', dialCode: '+20', flag: '🇪🇬', rtl: true, font: 'Noto Naskh Arabic', currency: 'EGP' },
  { id: 'ar_AE', code: 'ar-AE', name: 'Arabic UAE', nativeName: 'العربية', country: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', rtl: true, font: 'Noto Naskh Arabic', currency: 'AED' },
  { id: 'fa_IR', code: 'fa-IR', name: 'Persian', nativeName: 'فارسی', country: 'Iran', dialCode: '+98', flag: '🇮🇷', rtl: true, font: 'Vazirmatn', currency: 'IRR' },
  { id: 'ur_PK', code: 'ur-PK', name: 'Urdu', nativeName: 'اردو', country: 'Pakistan', dialCode: '+92', flag: '🇵🇰', rtl: true, font: 'Noto Nastaliq Urdu', currency: 'PKR' },
  { id: 'hi_IN', code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', country: 'India', dialCode: '+91', flag: '🇮🇳', rtl: false, font: 'Noto Sans Devanagari', currency: 'INR' },
  { id: 'bn_BD', code: 'bn-BD', name: 'Bengali', nativeName: 'বাংলা', country: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', rtl: false, font: 'Noto Sans Bengali', currency: 'BDT' },
  { id: 'pa_IN', code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', country: 'India', dialCode: '+91', flag: '🇮🇳', rtl: false, font: 'Noto Sans Gurmukhi', currency: 'INR' },
  { id: 'ta_IN', code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', country: 'India', dialCode: '+91', flag: '🇮🇳', rtl: false, font: 'Noto Sans Tamil', currency: 'INR' },
  { id: 'te_IN', code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', country: 'India', dialCode: '+91', flag: '🇮🇳', rtl: false, font: 'Noto Sans Telugu', currency: 'INR' },
  { id: 'ml_IN', code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', country: 'India', dialCode: '+91', flag: '🇮🇳', rtl: false, font: 'Noto Sans Malayalam', currency: 'INR' },
  { id: 'mr_IN', code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', country: 'India', dialCode: '+91', flag: '🇮🇳', rtl: false, font: 'Noto Sans Devanagari', currency: 'INR' },
  { id: 'gu_IN', code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', country: 'India', dialCode: '+91', flag: '🇮🇳', rtl: false, font: 'Noto Sans Gujarati', currency: 'INR' },
  { id: 'si_LK', code: 'si-LK', name: 'Sinhala', nativeName: 'සිංහල', country: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', rtl: false, font: 'Noto Sans Sinhala', currency: 'LKR' },
  { id: 'ne_NP', code: 'ne-NP', name: 'Nepali', nativeName: 'नेपाली', country: 'Nepal', dialCode: '+977', flag: '🇳🇵', rtl: false, font: 'Noto Sans Devanagari', currency: 'NPR' },
  { id: 'km_KH', code: 'km-KH', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', country: 'Cambodia', dialCode: '+855', flag: '🇰🇭', rtl: false, font: 'Noto Sans Khmer', currency: 'KHR' },
  { id: 'lo_LA', code: 'lo-LA', name: 'Lao', nativeName: 'ລາວ', country: 'Laos', dialCode: '+856', flag: '🇱🇦', rtl: false, font: 'Noto Sans Lao', currency: 'LAK' },
  { id: 'my_MM', code: 'my-MM', name: 'Burmese', nativeName: 'မြန်မာ', country: 'Myanmar', dialCode: '+95', flag: '🇲🇲', rtl: false, font: 'Noto Sans Myanmar', currency: 'MMK' },
  { id: 'id_ID', code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', country: 'Indonesia', dialCode: '+62', flag: '🇮🇩', rtl: false, font: 'Noto Sans', currency: 'IDR' },
  { id: 'ms_MY', code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu', country: 'Malaysia', dialCode: '+60', flag: '🇲🇾', rtl: false, font: 'Noto Sans', currency: 'MYR' },
  { id: 'th_TH', code: 'th-TH', name: 'Thai', nativeName: 'ไทย', country: 'Thailand', dialCode: '+66', flag: '🇹🇭', rtl: false, font: 'Noto Sans Thai', currency: 'THB' },
  { id: 'vi_VN', code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', country: 'Vietnam', dialCode: '+84', flag: '🇻🇳', rtl: false, font: 'Noto Sans', currency: 'VND' },
  { id: 'zh_CN', code: 'zh-CN', name: 'Chinese Simplified', nativeName: '中文 简体', country: 'China', dialCode: '+86', flag: '🇨🇳', rtl: false, font: 'Noto Sans SC', currency: 'CNY' },
  { id: 'zh_TW', code: 'zh-TW', name: 'Chinese Traditional', nativeName: '中文 繁體', country: 'Taiwan', dialCode: '+886', flag: '🇹🇼', rtl: false, font: 'Noto Sans TC', currency: 'TWD' },
  { id: 'zh_HK', code: 'zh-HK', name: 'Chinese Hong Kong', nativeName: '中文 香港', country: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', rtl: false, font: 'Noto Sans TC', currency: 'HKD' },
  { id: 'ja_JP', code: 'ja-JP', name: 'Japanese', nativeName: '日本語', country: 'Japan', dialCode: '+81', flag: '🇯🇵', rtl: false, font: 'Noto Sans JP', currency: 'JPY' },
  { id: 'ko_KR', code: 'ko-KR', name: 'Korean', nativeName: '한국어', country: 'South Korea', dialCode: '+82', flag: '🇰🇷', rtl: false, font: 'Noto Sans KR', currency: 'KRW' },
  { id: 'tl_PH', code: 'fil-PH', name: 'Filipino', nativeName: 'Filipino', country: 'Philippines', dialCode: '+63', flag: '🇵🇭', rtl: false, font: 'Noto Sans', currency: 'PHP' },
  { id: 'sw_KE', code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili', country: 'Kenya', dialCode: '+254', flag: '🇰🇪', rtl: false, font: 'Noto Sans', currency: 'KES' },
  { id: 'af_ZA', code: 'af-ZA', name: 'Afrikaans', nativeName: 'Afrikaans', country: 'South Africa', dialCode: '+27', flag: '🇿🇦', rtl: false, font: 'Noto Sans', currency: 'ZAR' },
  { id: 'zu_ZA', code: 'zu-ZA', name: 'Zulu', nativeName: 'isiZulu', country: 'South Africa', dialCode: '+27', flag: '🇿🇦', rtl: false, font: 'Noto Sans', currency: 'ZAR' },
  { id: 'yo_NG', code: 'yo-NG', name: 'Yoruba', nativeName: 'Yorùbá', country: 'Nigeria', dialCode: '+234', flag: '🇳🇬', rtl: false, font: 'Noto Sans', currency: 'NGN' },
  { id: 'ig_NG', code: 'ig-NG', name: 'Igbo', nativeName: 'Igbo', country: 'Nigeria', dialCode: '+234', flag: '🇳🇬', rtl: false, font: 'Noto Sans', currency: 'NGN' },
  { id: 'am_ET', code: 'am-ET', name: 'Amharic', nativeName: 'አማርኛ', country: 'Ethiopia', dialCode: '+251', flag: '🇪🇹', rtl: false, font: 'Noto Sans Ethiopic', currency: 'ETB' },
  { id: 'ga_IE', code: 'ga-IE', name: 'Irish', nativeName: 'Gaeilge', country: 'Ireland', dialCode: '+353', flag: '🇮🇪', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'ca_ES', code: 'ca-ES', name: 'Catalan', nativeName: 'Català', country: 'Spain', dialCode: '+34', flag: '🇪🇸', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'eu_ES', code: 'eu-ES', name: 'Basque', nativeName: 'Euskara', country: 'Spain', dialCode: '+34', flag: '🇪🇸', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'gl_ES', code: 'gl-ES', name: 'Galician', nativeName: 'Galego', country: 'Spain', dialCode: '+34', flag: '🇪🇸', rtl: false, font: 'Noto Sans', currency: 'EUR' },
  { id: 'is_IS', code: 'is-IS', name: 'Icelandic', nativeName: 'Íslenska', country: 'Iceland', dialCode: '+354', flag: '🇮🇸', rtl: false, font: 'Noto Sans', currency: 'ISK' },
];

export const REGIONAL_LOCALES = [
  { region: 'Americas', locales: [
      SUPPORTED_LOCALES.find(l => l.id === 'es_MX')!,
      SUPPORTED_LOCALES.find(l => l.id === 'pt_BR')!,
  ].sort((a,b) => a.nativeName.localeCompare(b.nativeName))},
  { region: 'Asia-Pacific', locales: [
      'id_ID', 'ms_MY', 'zh_CN', 'zh_HK', 'zh_TW', 'ja_JP', 'km_KH', 'ko_KR', 'lo_LA', 'my_MM', 'tl_PH', 'th_TH', 'vi_VN', 'hi_IN', 'bn_BD', 'pa_IN', 'ta_IN', 'te_IN', 'ml_IN', 'mr_IN', 'gu_IN', 'si_LK', 'ne_NP'
  ].map(id => SUPPORTED_LOCALES.find(l => l.id === id)!).sort((a,b) => a.nativeName.localeCompare(b.nativeName))},
  { region: 'Europe', locales: [
      'bg_BG', 'ca_ES', 'cs_CZ', 'da_DK', 'de_AT', 'de_CH', 'de_DE', 'el_GR', 'en_GB', 'es_ES', 'et_EE', 'eu_ES', 'fi_FI', 'fr_FR', 'ga_IE', 'gl_ES', 'hr_HR', 'hu_HU', 'is_IS', 'it_IT', 'lt_LT', 'lv_LV', 'nb_NO', 'nl_NL', 'pl_PL', 'pt_PT', 'ro_RO', 'ru_RU', 'sk_SK', 'sl_SI', 'sr_RS', 'sv_SE', 'uk_UA'
  ].map(id => SUPPORTED_LOCALES.find(l => l.id === id)!).sort((a,b) => a.nativeName.localeCompare(b.nativeName))},
  { region: 'Middle East & Africa', locales: [
      'af_ZA', 'am_ET', 'ar_AE', 'ar_EG', 'ar_SA', 'fa_IR', 'he_IL', 'ig_NG', 'sw_KE', 'tr_TR', 'ur_PK', 'yo_NG', 'zu_ZA'
  ].map(id => SUPPORTED_LOCALES.find(l => l.id === id)!).sort((a,b) => a.nativeName.localeCompare(b.nativeName))},
].sort((a, b) => a.region.localeCompare(b.region));

export const GOOGLE_APPS = [
    { id: 'account', name: 'Account', icon: GoogleAccountIcon, url: 'https://myaccount.google.com/' },
    { id: 'search', name: 'Search', icon: GoogleSearchIcon, url: 'https://www.google.com/' },
    { id: 'maps', name: 'Maps', icon: GoogleMapsIcon, url: 'https://maps.google.com/' },
    { id: 'play', name: 'Play', icon: GooglePlayIcon, url: 'https://play.google.com/' },
    { id: 'youtube', name: 'YouTube', icon: GoogleYoutubeIcon, url: 'https://www.youtube.com/' },
    { id: 'news', name: 'News', icon: GoogleNewsIcon, url: 'https://news.google.com/' },
    { id: 'gmail', name: 'Gmail', icon: GoogleGmailIcon, url: 'https://mail.google.com/' },
    { id: 'meet', name: 'Meet', icon: GoogleMeetIcon, url: 'https://meet.google.com/' },
    { id: 'chat', name: 'Chat', icon: GoogleChatIcon, url: 'https://chat.google.com/' },
    { id: 'contacts', name: 'Contacts', icon: GoogleContactsIcon, url: 'https://contacts.google.com/' },
    { id: 'drive', name: 'Drive', icon: GoogleDriveIcon, url: 'https://drive.google.com/' },
    { id: 'calendar', name: 'Calendar', icon: GoogleCalendarIcon, url: 'https://calendar.google.com/' },
    { id: 'translate', name: 'Translate', icon: GoogleTranslateIcon, url: 'https://translate.google.com/' },
    { id: 'photos', name: 'Photos', icon: GooglePhotosIcon, url: 'https://photos.google.com/' },
    { id: 'gemini', name: 'Gemini', icon: GoogleGeminiIcon, url: 'https://gemini.google.com/' },
    { id: 'docs', name: 'Docs', icon: GoogleDocsIcon, url: 'https://docs.google.com/' },
    { id: 'sheets', name: 'Sheets', icon: GoogleSheetsIcon, url: 'https://sheets.google.com/' },
    { id: 'slides', name: 'Slides', icon: GoogleSlidesIcon, url: 'https://slides.google.com/' },
    { id: 'forms', name: 'Forms', icon: GoogleFormsIcon, url: 'https://forms.google.com/' },
    { id: 'keep', name: 'Keep', icon: GoogleKeepIcon, url: 'https://keep.google.com/' },
    { id: 'tasks', name: 'Tasks', icon: GoogleTasksIcon, url: 'https://tasks.google.com/' },
    { id: 'travel', name: 'Travel', icon: GoogleTravelIcon, url: 'https://www.google.com/travel/' },
    { id: 'wallet', name: 'Wallet', icon: GoogleWalletIcon, url: 'https://wallet.google.com/' },
    { id: 'ads', name: 'Ads', icon: GoogleAdsIcon, url: 'https://ads.google.com/' },
];

export const MOCK_EXCHANGE_RATES: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    JPY: 157.0,
    GBP: 0.79,
    CAD: 1.37,
    CNY: 7.25,
    RUB: 91.0,
    BRL: 5.15,
    KRW: 1378.0,
    INR: 83.5,
};

export const NEW_MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
    'Investments',
    'Investors',
    'Partnerships',
    'Business for Sale',
    'Real Estate',
    'Suppliers & Logistics',
    'Intellectual Property',
    'Assets',
    'Fundraising',
    'C-level Jobs',
    'Events',
    'Courses',
];

export const CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'CAD', 'AUD'];

export const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
];

export const DUMMY_LISTING = `
For Sale: High-Growth SaaS Company in FinTech Space
Listing ID: SaaS-FT-8812

Location: San Francisco, CA, USA

Description:
We are offering a unique opportunity to acquire a profitable, bootstrapped SaaS company specializing in automated expense tracking for small to medium-sized businesses. Founded in 2018, our platform has seen consistent 40% year-over-year growth with a strong base of 5,000+ paying customers. The technology is built on a scalable, modern stack (React, Node.js, AWS) and features a user-friendly interface that customers love.

Financials:
- Annual Recurring Revenue (ARR): $1.2 Million
- Profit Margin: 35%
- Customer Lifetime Value (LTV): $2,500
- Customer Acquisition Cost (CAC): $450

Asking Price: 4,800,000 USD

Included in Sale:
- Full ownership of the proprietary source code and intellectual property.
- All customer contracts and associated revenue streams.
- Brand assets, domain names, and social media accounts.
- A small, highly-skilled remote team of 3 engineers and 2 support staff willing to transition.

Reason for Selling:
Founders are moving on to a new venture in the renewable energy sector. We are looking for a buyer who can take this solid foundation to the next level. Minimal documentation available until NDA is signed. Serious inquiries only. Contact via platform messenger.
`;

export const MOCK_MARKETPLACE_LISTINGS: MarketplaceListing[] = [
    // Approved Listings
    {
        id: 'inv-001',
        category: 'Investments',
        title: { originalLang: 'en-US', originalText: 'Seed Round for AI-Powered Logistics Platform' },
        location: 'Austin, TX',
        summary: { originalLang: 'en-US', originalText: 'Seeking $500K for 20% equity in a disruptive logistics startup using AI to optimize supply chains.' },
        media: [{ type: 'image', url: 'https://picsum.photos/seed/inv-001/800/400' }],
        amount: 500000,
        currency: 'USD',
        documents: [{ name: 'Pitch_Deck_LogiAI.pdf', url: '#' }],
        details: {
            description: { originalLang: 'en-US', originalText: 'Our proprietary AI model predicts shipping delays with 95% accuracy, saving clients an average of 15% on operational costs. Funds will be used for market expansion and hiring key engineering talent. We have 3 pilot customers and a strong pipeline.' },
            keyMetrics: [
                { label: 'Valuation', value: '$2.5M Post-Money' },
                { label: 'Target Market', value: 'North American Freight' },
                { label: 'Founding Team', value: 'Ex-Google & Uber Logistics' },
            ],
        },
        status: 'Approved',
        submittedBy: 'Jane Doe',
        submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        aiRiskScore: 15,
        aiFlags: [],
        reviewedBy: 'Compliance Officer',
        reviewedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        sponsorshipDetails: {
            plan: 'monthly',
            boost: true,
            cost: 250,
        }
    },
    {
        id: 'biz-001',
        category: 'Business for Sale',
        title: { originalLang: 'en-US', originalText: 'Profitable E-Commerce Brand in Home Goods' },
        location: 'Remote',
        summary: { originalLang: 'en-US', originalText: 'Acquire a 5-year-old e-commerce business with $1.2M in annual revenue and strong brand recognition.' },
        media: [{ type: 'image', url: 'https://picsum.photos/seed/biz-001/800/400' }],
        amount: 2500000,
        currency: 'USD',
        documents: [{ name: 'Financials_Overview_Q2.xlsx', url: '#' }],
        details: {
            description: { originalLang: 'en-US', originalText: 'This business has a loyal customer base and a highly optimized supply chain. It is fully relocatable and can be managed by a small team. Sale includes all digital assets, inventory, and supplier relationships.' },
            keyMetrics: [
                { label: 'Annual Revenue', value: '$1.2M' },
                { label: 'Net Profit', value: '$400K' },
                { label: 'Website Traffic', value: '150K monthly uniques' },
            ],
        },
        status: 'Approved',
        submittedBy: 'John Smith',
        submittedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        aiRiskScore: 10,
        aiFlags: [],
        reviewedBy: 'Compliance Officer',
        reviewedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
        sponsorshipDetails: {
            plan: 'daily',
            boost: false,
            cost: 5,
        }
    },
    {
        id: 'log-001',
        category: 'Suppliers & Logistics',
        title: { originalLang: 'en-US', originalText: 'Global Cold Chain Logistics Partner' },
        location: 'Global',
        summary: { originalLang: 'en-US', originalText: 'End-to-end refrigerated shipping solutions for pharmaceutical and perishable goods.' },
        media: [{ type: 'image', url: 'https://picsum.photos/seed/log-001/800/400' }],
        amount: 0, // Service-based, no direct price
        currency: 'USD',
        documents: [{ name: 'Service_Catalog.pdf', url: '#' }],
        details: {
            description: { originalLang: 'en-US', originalText: 'We offer a fleet of GDP-compliant refrigerated containers and real-time temperature monitoring. Our network covers over 120 countries.' },
            keyMetrics: [
                { label: 'Fleet Size', value: '5,000+ Containers' },
                { label: 'Certifications', value: 'GDP, ISO 9001' },
                { label: 'On-time Delivery', value: '99.2%' },
            ],
        },
        status: 'Approved',
        submittedBy: 'Global Freeze Inc.',
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        aiRiskScore: 5,
        aiFlags: [],
        reviewedBy: 'Compliance Officer',
        reviewedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
        id: 'ip-001',
        category: 'Intellectual Property',
        title: { originalLang: 'en-US', originalText: 'Patent Portfolio for Novel Battery Technology' },
        location: 'Palo Alto, CA',
        summary: { originalLang: 'en-US', originalText: 'Portfolio of 12 granted patents covering solid-state battery chemistry, increasing energy density by 40%.' },
        media: [{ type: 'image', url: 'https://picsum.photos/seed/ip-001/800/400' }],
        amount: 15000000,
        currency: 'USD',
        documents: [{ name: 'Patent_List.pdf', url: '#' }],
        details: {
            description: { originalLang: 'en-US', originalText: 'This technology is a breakthrough for EV and consumer electronics. The patents have been granted in the US, EU, and China. Licensing or full acquisition available.' },
            keyMetrics: [
                { label: 'Patents Granted', value: '12' },
                { label: 'Priority Date', value: '2019' },
                { label: 'Key Markets', value: 'US, EU, China' },
            ],
        },
        status: 'Approved',
        submittedBy: 'Tech Innovations LLC',
        submittedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        aiRiskScore: 20,
        aiFlags: [],
        reviewedBy: 'Compliance Officer',
        reviewedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
    // Listings Pending Review
    {
        id: 're-002',
        category: 'Real Estate',
        title: { originalLang: 'en-US', originalText: 'High-Value Commercial Tower' },
        location: 'New York, NY',
        summary: { originalLang: 'en-US', originalText: 'For sale: 50-story commercial skyscraper in downtown Manhattan. High-value deal requiring review.' },
        media: [{ type: 'image', url: 'https://picsum.photos/seed/re-002/800/400' }],
        amount: 850000000,
        currency: 'USD',
        documents: [],
        details: {
            description: { originalLang: 'en-US', originalText: 'This is a landmark property with 98% occupancy. Financials available upon signing an NDA. This is a highly sensitive and large-scale transaction.' },
            keyMetrics: [
                { label: 'Cap Rate', value: '4.5%' },
                { label: 'Building Size', value: '1.2M sq. ft.' },
                { label: 'Occupancy', value: '98%' },
            ],
        },
        status: 'Pending Review',
        submittedBy: 'Emily White',
        submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        aiRiskScore: 78,
        aiFlags: ['High-value transaction requires manual sign-off', 'International buyer interest', 'Complex legal structure'],
    },
    {
        id: 'sup-002',
        category: 'Partnerships',
        title: { originalLang: 'en-US', originalText: 'Bulk PPE Supplier - Vague Details' },
        location: 'Unknown',
        summary: { originalLang: 'en-US', originalText: 'Supplier of masks, gloves, and other PPE. Best prices. Contact for details.' },
        media: [{ type: 'image', url: 'https://picsum.photos/seed/sup-002/800/400' }],
        amount: 0,
        currency: 'USD',
        documents: [],
        details: {
            description: { originalLang: 'en-US', originalText: 'We can supply large quantities of PPE. Very cheap. Wire transfer only. No website available, contact on this platform only.' },
            keyMetrics: [
                { label: 'Certifications', value: 'Not specified' },
                { label: 'Lead Time', value: 'Varies' },
            ],
        },
        status: 'Pending Review',
        submittedBy: 'Anonymous User',
        submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        aiRiskScore: 95,
        aiFlags: ['Anonymous user', 'Vague location', 'Unusual payment terms (wire only)', 'Lack of documentation/website'],
    },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv-1',
        participant: { id: 'user-2', name: 'Dr. Alisha Chen', title: 'Chief Medical Officer, InnovateHealth' },
        lastMessage: 'Perfect, I\'ve attached the preliminary research. Let me know your thoughts.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        unreadCount: 1,
        messages: [
// Fix: Added .toISOString() to convert Date object to string for the timestamp property.
            { id: 'msg-1-1', senderId: 'user-2', senderName: 'Dr. Alisha Chen', text: { originalLang: 'en-US', originalText: 'Regarding the Series B for our med-tech venture, are you available for a brief sync tomorrow?' }, isOwn: false, timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString() },
            { id: 'msg-1-2', senderId: 'user-1', senderName: 'Alex Thornton', text: { originalLang: 'en-US', originalText: 'Yes, absolutely. 10 AM EST works for me. Looking forward to it.' }, isOwn: true, timestamp: new Date(Date.now() - 3600000 * 2.4).toISOString() },
            { id: 'msg-1-3', senderId: 'user-2', senderName: 'Dr. Alisha Chen', text: { originalLang: 'en-US', originalText: 'Perfect, I\'ve attached the preliminary research. Let me know your thoughts.' }, isOwn: false, timestamp: new Date(Date.now() - 3600000 * 2).toISOString() }
        ],
    },
    {
        id: 'conv-2',
        participant: { id: 'user-3', name: 'Ben Carter', title: 'Lead Architect, Stellar Structures' },
        lastMessage: 'The new sustainable materials are performing even better than expected in our simulations.',
        timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
        unreadCount: 0,
        messages: [
             { id: 'msg-2-1', senderId: 'user-3', senderName: 'Ben Carter', text: { originalLang: 'en-US', originalText: 'The new sustainable materials are performing even better than expected in our simulations.' }, isOwn: false, timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString() }
        ],
    },
    {
        id: 'conv-3',
        participant: { id: 'user-4', name: 'Chloe Davis', title: 'Venture Capitalist, Momentum Ventures' },
        lastMessage: 'Let\'s set up a call to discuss the LogiAI deal flow for next week.',
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        unreadCount: 0,
        messages: [
            { id: 'msg-3-1', senderId: 'user-4', senderName: 'Chloe Davis', text: { originalLang: 'en-US', originalText: 'Let\'s set up a call to discuss the LogiAI deal flow for next week.' }, isOwn: false, timestamp: new Date(Date.now() - 86400000 * 3).toISOString() }
        ],
    },
];

// Fix: Added MOCK_NETWORK_USERS to be exported and used in App.tsx.
export const MOCK_NETWORK_USERS: NetworkUser[] = [
    {
        id: 'user-2',
        fullName: 'Dr. Alisha Chen',
        jobTitle: 'Chief Medical Officer',
        company: 'InnovateHealth',
        location: 'Boston, MA',
        profileImageUrl: 'https://i.pravatar.cc/150?u=alisha.chen@example.com',
        industries: ['Healthcare', 'Biotech', 'AI'],
    },
    {
        id: 'user-3',
        fullName: 'Ben Carter',
        jobTitle: 'Lead Architect',
        company: 'Stellar Structures',
        location: 'London, UK',
        profileImageUrl: 'https://i.pravatar.cc/150?u=ben.carter@example.com',
        industries: ['Real Estate', 'Architecture', 'Sustainability'],
    },
    {
        id: 'user-4',
        fullName: 'Chloe Davis',
        jobTitle: 'Venture Capitalist',
        company: 'Momentum Ventures',
        location: 'Palo Alto, CA',
        profileImageUrl: 'https://i.pravatar.cc/150?u=chloe.davis@example.com',
        industries: ['Finance', 'Technology', 'Investments'],
    }
];

const MOCK_AUTHORS = {
    user1: { id: 'user-1', name: 'Alex Thornton', title: 'Chief Executive Officer', company: 'Quantum Dynamics Inc.', verified: true, profileImageUrl: 'https://i.pravatar.cc/150?u=alex.thornton@evolve.net' },
    user2: { id: 'user-2', name: 'Dr. Alisha Chen', title: 'Chief Medical Officer', company: 'InnovateHealth', verified: true, profileImageUrl: 'https://i.pravatar.cc/150?u=alisha.chen@example.com' },
    user3: { id: 'user-3', name: 'Ben Carter', title: 'Lead Architect', company: 'Stellar Structures', verified: false, profileImageUrl: 'https://i.pravatar.cc/150?u=ben.carter@example.com' },
};

// Fix: Added MOCK_FEED_ITEMS to be exported and used in App.tsx.
export const MOCK_FEED_ITEMS: FeedItem[] = [
    {
        id: 'post-1',
        type: 'text',
        author: MOCK_AUTHORS.user1,
        content: { originalLang: 'en-US', originalText: 'Excited to share our Q3 earnings report. We\'ve seen incredible growth in emerging markets, driven by our new product line. Huge thanks to the entire team for their hard work and dedication!' },
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        analytics: { allReactions: [], comments: 2, impressions: 15234, views: 8765, shares: 12, profileViews: 45, newConnections: 3 },
        comments: [
             {
                id: 'comment-1-1',
                author: MOCK_AUTHORS.user2,
                text: { originalLang: 'en-US', originalText: 'Congratulations on the fantastic results, Alex! Well deserved.' },
                timestamp: new Date(Date.now() - 86400000 * 0.9).toISOString(),
                allReactions: [],
                replies: [],
            },
            {
                id: 'comment-1-2',
                author: MOCK_AUTHORS.user3,
                text: { originalLang: 'en-US', originalText: 'Great work. What were the key challenges you faced in these new markets?' },
                timestamp: new Date(Date.now() - 86400000 * 0.8).toISOString(),
                allReactions: [],
                replies: [
                    {
                        id: 'reply-1-2-1',
                        author: MOCK_AUTHORS.user1,
                        text: { originalLang: 'en-US', originalText: 'Thanks, Ben. The main challenge was navigating the complex regulatory landscape. Our compliance team was instrumental.' },
                        timestamp: new Date(Date.now() - 86400000 * 0.7).toISOString(),
                        allReactions: [],
                        replies: [],
                    }
                ]
            }
        ]
    },
    {
        id: 'teaser-1',
        itemType: 'opportunity',
        listingId: 'inv-001',
        category: 'Investments',
        title: { originalLang: 'en-US', originalText: 'Seed Round for AI-Powered Logistics Platform' },
        shortValuation: 500000,
        currency: 'USD',
        location: 'Austin, TX'
    },
    {
        id: 'post-2',
        type: 'image',
        author: MOCK_AUTHORS.user2,
        content: { originalLang: 'en-US', originalText: 'Just returned from the Global Health Summit. Incredibly inspiring to see so much innovation in biotech. The future of personalized medicine is bright!' },
        media: [{ url: 'https://picsum.photos/seed/post-2/800/600', name: 'summit.jpg', type: 'image' }],
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        analytics: { allReactions: [], comments: 0, impressions: 9876, views: 5432, shares: 5, profileViews: 22, newConnections: 1 },
        comments: [],
    },
     {
        id: 'teaser-2',
        itemType: 'opportunity',
        listingId: 'biz-001',
        category: 'Business for Sale',
        title: { originalLang: 'en-US', originalText: 'Profitable E-Commerce Brand in Home Goods' },
        shortValuation: 2500000,
        currency: 'USD',
        location: 'Remote'
    },
];

// Fix: Added MOCK_NOTIFICATIONS to be exported and used in App.tsx.
export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'notif-1', type: 'new_message', text: 'Dr. Alisha Chen sent you a message.', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: false, link: { view: 'dashboard', itemId: 'conv-1' } },
    { id: 'notif-2', type: 'post_like', text: 'Ben Carter liked your post about AI in logistics.', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), isRead: false, link: { view: 'feed', itemId: 'post-1' } },
    { id: 'notif-3', type: 'system', text: 'Your profile verification has been approved.', timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true },
    { id: 'notif-4', type: 'new_listing', text: 'A new Investment opportunity in your industry was posted.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), isRead: true, link: { view: 'marketplace', itemId: 'inv-001' } },
];

// Fix: Added SEARCH_CATEGORIES to be exported and used in SearchResults.tsx.
export const SEARCH_CATEGORIES = [
    'All',
    'Posts',
    'People',
    'Companies',
    'Groups',
    'Schools',
    'Courses',
    'Jobs',
    'Events',
    'Services',
    'Products',
];