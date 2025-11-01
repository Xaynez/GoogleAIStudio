import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Locale } from './types';
import { SUPPORTED_LOCALES } from './constants';

// --- Translation Data ---
// Added keys for verification and bundles for fr-FR, ar-SA, ja-JP.
export const TRANSLATIONS: Record<string, Record<string, string>> = {
  'en-US': {
    homepage_title: "Where Leaders Come, \nand Visionaries Evolve",
    homepage_subtitle: "EVOLVE is the world's premier AI-powered ecosystem for verified executives, founders, and innovators to collaborate, transact, and shape the future.",
    menu_home: "Home",
    menu_overview: "Overview",
    menu_ecosystem: "Ecosystem",
    menu_marketplace: "Marketplace",
    menu_pricing: "Pricing",
    menu_languages: "Languages",
    menu_governance: "Governance & Compliance Hub",
    menu_contact: "Contact",
    cta_enter_marketplace: "Enter Marketplace",
    search_placeholder: "Search posts, people, and more...",
    button_create_listing: "Create Listing",
    section_pricing_title: "Pricing Plans for Every Vision",
    faq_title: "FAQ & Support",
    governance_title: "Governance & Compliance Hub",
    dashboard: "Dashboard",
    marketplace: "Marketplace",
    governanceHub: "Governance Hub",
    messages: "Messages",
    about: "About",
    activity: "Activity",
    aiStudio: "AI Studio",
    back: "Back",
    next: "Next",
    finish: "Finish",
    development: "Development",
    contactTitle: "Contact Us",
    contactSubtitle: "We are here to help.",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "e.g., Alex Thornton",
    emailLabel: "Email",
    emailPlaceholder: "e.g., a.thornton@corp.net",
    phoneLabel: "Phone Number",
    organizationLabel: "Organization",
    organizationPlaceholder: "e.g., Quantum Dynamics Inc.",
    inquiryTypeLabel: "Inquiry Type",
    inquiryTypeDefault: "Select a reason...",
    inquiryTypeGeneral: "General Support",
    inquiryTypeSales: "Sales",
    inquiryTypePartnerships: "Partnerships",
    inquiryTypeGovernance: "Governance & Compliance",
    inquiryTypeOther: "Other",
    subjectLabel: "Subject",
    subjectPlaceholder: "A brief summary of your inquiry",
    messageLabel: "Message",
    messagePlaceholder: "Please describe your inquiry in detail...",
    attachmentLabel: "File Attachment",
    attachmentPrompt: "Click to upload or drag and drop",
    attachmentHelp: "PDF, DOCX, PNG, JPG (Max 10MB)",
    consentTerms: "I have read and agree to the Terms of Use.",
    consentPrivacy: "I have read and agree to the Privacy Policy.",
    consentGovernance: "I acknowledge the Governance & Compliance Framework.",
    captchaLabel: "Security Check: What is {num1} + {num2}?",
    submitButton: "Submit Inquiry",
    submittingButton: "Submitting...",
    errorRequired: "This field is required.",
    errorInvalidEmail: "Please enter a valid email address.",
    errorFileTooLarge: "File size cannot exceed 10MB.",
    errorFileType: "Invalid file type. Please upload PDF, DOCX, PNG, or JPG.",
    errorCaptcha: "Incorrect answer to the security question.",
    errorConsent: "You must accept all terms and policies.",
    successTitle: "Thank You!",
    successMessage: "Your message has been received. Our team will get back to you shortly.",
    syncErrorTitle: "Received, Syncing...",
    syncErrorMessage: "Your message has been received and stored locally. We are experiencing a temporary issue syncing with our support system. We will follow up as soon as the connection is restored.",
    backToHomeButton: "Back to Home",
    altContactTitle: "Alternative Methods",
    altContactEmail: "Support Email",
    altContactHours: "Business Hours",
    altContactHoursValue: "Mon-Fri, 9am - 5pm (UTC)",
    altContactResponse: "Typical Response Time",
    altContactResponseValue: "Within 24 hours",
    openAISupportButton: "Open AI Support",

    // AI Studio & Profile
    aiStudioSubtitle: "Your creative and analytical powerhouse, powered by Gemini.",
    aiStudioUnlockTitle: "Unlock the AI Studio",
    aiStudioUnlockDesc: "This is a premium feature. Please upgrade your plan to gain access to the AI Studio and other exclusive tools.",
    businessSuiteTitle: "Business Strategy Suite",
    businessSuiteDescription: "Generate comprehensive business plans, pitch decks, and financial visualizations from your core data.",
    launchSuite: "Launch Business Suite",
    postIdeasTitle: "AI Post Assistant",
    postIdeasDescription: "Generate engaging post ideas and draft content based on your professional profile and interests.",
    getPostSuggestions: "Get Post Suggestions",
    generating: "Generating...",
    suggestionsForYou: "Suggestions for you",
    aiPostAssistant: "AI Post Assistant",
    enterTopic: "Enter topic or select a suggestion",
    generatePostBtn: "Generate Post",
    aiGeneratedPost: "AI-Generated Post",
    suggestedMedia: "Suggested Media",
    aiStudioMediaTitle: "AI Media Generation",
    aiStudioMediaDesc: "Create stunning visuals and videos from text prompts or by editing your own images.",
    aiStudioModeImage: "Image",
    aiStudioModeVideo: "Video",
    aiStudioImageUpload: "Upload an image to edit (optional)",
    aiStudioModel: "Model",
    aiStudioModelFast: "Fast (Veo 3.1)",
    aiStudioModelHQ: "High Quality (Veo 3.1)",
    aiStudioAspectRatio: "Aspect Ratio",
    aiStudioAspectLandscape: "16:9 Landscape",
    aiStudioAspectPortrait: "9:16 Portrait",
    aiStudioResolution: "Resolution",
    aiStudio720p: "720p",
    aiStudio1080p: "1080p",
    aiStudioImagePlaceholderEdit: "Describe the edits you want to make...",
    aiStudioImagePlaceholderGen: "e.g., A photorealistic image of a futuristic city skyline at dusk",
    aiStudioVideoPlaceholder: "e.g., A cinematic drone shot flying over a mountain range",
    aiStudioProcessing: "Processing...",
    aiStudioGenerate: "Generate",
    aiStudioDownloadVideo: "Download Video",
    aiStudioResearchTitle: "AI Research Assistant",
    aiStudioResearchDesc: "Leverage Google Search to get summarized, up-to-date information on any topic, complete with sources.",
    aiStudioResearchPlaceholder: "e.g., Latest trends in renewable energy",
    aiStudioSearching: "Searching...",
    aiStudioSearch: "Search",
    aiStudioSources: "Sources",
    aiStudioRewriteTitle: "AI Text Rewriter",
    aiStudioRewriteDesc: "Refine your writing for clarity, tone, and impact. Enter your text and choose a desired tone.",
    aiStudioRewritePlaceholder: "Paste your text here to rewrite...",
    aiStudioTone: "Tone:",
    aiStudioRewriting: "Rewriting...",
    aiStudioRewrite: "Rewrite",
    aiStudioRewrittenText: "Rewritten Text ({tone})",
    aiStudioTranscriptionTitle: "AI Transcription & Summary",
    aiStudioTranscriptionDesc: "Upload an audio or video file to get a full transcription and an optional summary.",
    aiStudioUploadAVPrompt: "Click to upload a file",
    aiStudioUploadAVFormats: "MP3, WAV, MP4, MOV, etc.",
    aiStudioTranscriptionSettings: "Settings",
    aiStudioTranscribe: "Transcribe",
    aiStudioTranscriptionLang: "Transcription Language",
    aiStudioTranscriptionPunctuation: "Add punctuation & formatting",
    aiStudioTranscriptionSummarize: "Generate summary",
    aiStudioSaveSettings: "Save Settings",
    aiStudioSettingsSaved: "Saved!",
    aiStudioTranscribing: "Transcribing...",
    aiStudioTranscriptionResult: "Transcription",
    aiStudioSummaryResult: "AI Summary",
    aiStudioTranscriptionHistoryTitle: "Transcription History",
    aiStudioHistoryView: "View",
    aiStudioHistoryDownload: "Download",
    aiStudioHistoryDelete: "Delete",
    aiStudioHistoryEmpty: "No transcriptions yet.",
    aiStudioConfirmDeleteTitle: "Delete Transcription",
    aiStudioConfirmDeleteMessage: "Are you sure you want to permanently delete this transcription history item?",
    delete: "Delete",
    aiStudioImageError: "Failed to generate image. Please try a different prompt.",
    aiStudioVideoStatusRequest: "Requesting video generation...",
    aiStudioVideoStatusStarted: "Video generation started. This may take a few minutes.",
    aiStudioVideoStatusPolling: "Processing video ({progress}%)",
    aiStudioVideoStatusComplete: "Video generated successfully!",
    aiStudioVideoError: "Video generation failed. Please check your prompt or API key.",
    aiStudioResearchError: "Failed to perform research. Please try again.",
    aiStudioRewriteError: "Failed to rewrite text. Please try again.",
    aiSuggestionsError: "Failed to generate suggestions.",
    aiStudioInvalidFileType: "Invalid file type. Please upload a supported audio or video file.",
    aiStudioTranscriptionError: "Failed to transcribe the file. Please try again.",
    enhanceWithAI: "Enhance with AI",
    enhancing: "Enhancing...",
    editProfile: "Edit Profile",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    editCoverImage: "Edit Cover Image",
    editProfilePhoto: "Edit Profile Photo",
    applyChanges: "Apply Changes",
    zoom: "Zoom",
    rotate: "Rotate",
    brightness: "Brightness",
    contrast: "Contrast",
    saturation: "Saturation",
    vignette: "Vignette",
    crop: "Crop",
    adjust: "Adjust",
    filters: "Filters",
    original: "Original",
    light: "Light",
    prime: "Prime",
    studio: "Studio",
    classic: "Classic",
    edge: "Edge",
    lumien: "Lumien",
    imagePreview: "Image Preview",
    uploadAnImage: "Upload an image to get started.",
    uploadNewImage: "Upload new image",
    deleteImage: "Delete Image",
  },
  'fr-FR': {
    homepage_title: "Où les leaders se rencontrent, \net les visionnaires évoluent",
    homepage_subtitle: "EVOLVE est le premier écosystème mondial alimenté par l'IA pour les dirigeants, fondateurs et innovateurs vérifiés, pour collaborer, effectuer des transactions et façonner l'avenir.",
    menu_home: "Accueil",
    menu_overview: "Aperçu",
    menu_ecosystem: "Écosystème",
    menu_marketplace: "Marché",
    menu_pricing: "Tarifs",
    menu_languages: "Langues",
    menu_governance: "Pôle Gouvernance & Conformité",
    menu_contact: "Contact",
    cta_enter_marketplace: "Entrer sur le marché",
    search_placeholder: "Rechercher publications, personnes...",
    button_create_listing: "Créer une annonce",
    section_pricing_title: "Des plans tarifaires pour chaque vision",
    faq_title: "FAQ & Support",
    governance_title: "Pôle Gouvernance & Conformité",
    contactTitle: "Nous Contacter",
    contactSubtitle: "Nous sommes là pour vous aider.",
    fullNameLabel: "Nom complet",
    fullNamePlaceholder: "ex: Alex Thornton",
    emailLabel: "E-mail",
    emailPlaceholder: "ex: a.thornton@corp.net",
    phoneLabel: "Numéro de téléphone",
    organizationLabel: "Organisation",
    organizationPlaceholder: "ex: Quantum Dynamics Inc.",
    inquiryTypeLabel: "Type de demande",
    inquiryTypeDefault: "Sélectionnez une raison...",
    inquiryTypeGeneral: "Support Général",
    inquiryTypeSales: "Ventes",
    inquiryTypePartnerships: "Partenariats",
    inquiryTypeGovernance: "Gouvernance & Conformité",
    inquiryTypeOther: "Autre",
    subjectLabel: "Sujet",
    subjectPlaceholder: "Un bref résumé de votre demande",
    messageLabel: "Message",
    messagePlaceholder: "Veuillez décrire votre demande en détail...",
    attachmentLabel: "Pièce jointe",
    attachmentPrompt: "Cliquez pour télécharger ou glisser-déposer",
    attachmentHelp: "PDF, DOCX, PNG, JPG (Max 10Mo)",
    consentTerms: "J'ai lu et j'accepte les Conditions d'utilisation.",
    consentPrivacy: "J'ai lu et j'accepte la Politique de confidentialité.",
    consentGovernance: "Je reconnais le Cadre de Gouvernance et de Conformité.",
    captchaLabel: "Vérification de sécurité : Que font {num1} + {num2} ?",
    submitButton: "Envoyer la demande",
    submittingButton: "Envoi en cours...",
    errorRequired: "Ce champ est obligatoire.",
    errorInvalidEmail: "Veuillez entrer une adresse e-mail valide.",
    errorFileTooLarge: "La taille du fichier ne peut pas dépasser 10 Mo.",
    errorFileType: "Type de fichier invalide. Veuillez télécharger un PDF, DOCX, PNG ou JPG.",
    errorCaptcha: "Réponse incorrecte à la question de sécurité.",
    errorConsent: "Vous devez accepter toutes les conditions et politiques.",
    successTitle: "Merci !",
    successMessage: "Votre message a bien été reçu. Notre équipe vous répondra sous peu.",
    syncErrorTitle: "Reçu, synchronisation en cours...",
    syncErrorMessage: "Votre message a été reçu et stocké localement. Nous rencontrons un problème temporaire pour la synchronisation avec notre système de support. Nous vous recontacterons dès que la connexion sera rétablie.",
    backToHomeButton: "Retour à l'accueil",
    altContactTitle: "Autres méthodes",
    altContactEmail: "E-mail de support",
    altContactHours: "Heures d'ouverture",
    altContactHoursValue: "Lun-Ven, 9h - 17h (UTC)",
    altContactResponse: "Temps de réponse typique",
    altContactResponseValue: "Sous 24 heures",
    openAISupportButton: "Ouvrir le support IA",
  },
  'ar-SA': {
    homepage_title: "حيث يأتي القادة، \nويتطور أصحاب الرؤى",
    homepage_subtitle: "EVOLVE هو النظام البيئي الأول في العالم المدعوم بالذكاء الاصطناعي للمديرين التنفيذيين المؤسسين والمبتكرين المعتمدين للتعاون وإجراء المعاملات وتشكيل المستقبل.",
    menu_home: "الرئيسية",
    menu_overview: "نظرة عامة",
    menu_ecosystem: "النظام البيئي",
    menu_marketplace: "السوق",
    menu_pricing: "الأسعار",
    menu_languages: "اللغات",
    menu_governance: "محور الحوكمة والامتثال",
    menu_contact: "اتصال",
    cta_enter_marketplace: "دخول السوق",
    search_placeholder: "ابحث في المنشورات، الأشخاص، والمزيد...",
    button_create_listing: "إنشاء قائمة",
    section_pricing_title: "خطط أسعار لكل رؤية",
    faq_title: "الأسئلة الشائعة والدعم",
    governance_title: "محور الحوكمة والامتثال",
    contactTitle: "اتصل بنا",
    contactSubtitle: "نحن هنا للمساعدة.",
    fullNameLabel: "الاسم الكامل",
    fullNamePlaceholder: "مثال: أليكس ثورنتون",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "مثال: a.thornton@corp.net",
    phoneLabel: "رقم الهاتف",
    organizationLabel: "المنظمة",
    organizationPlaceholder: "مثال: Quantum Dynamics Inc.",
    inquiryTypeLabel: "نوع الاستفسار",
    inquiryTypeDefault: "اختر سببًا...",
    inquiryTypeGeneral: "دعم عام",
    inquiryTypeSales: "مبيعات",
    inquiryTypePartnerships: "شراكات",
    inquiryTypeGovernance: "الحوكمة والامتثال",
    inquiryTypeOther: "أخرى",
    subjectLabel: "الموضوع",
    subjectPlaceholder: "ملخص موجز لاستفسارك",
    messageLabel: "الرسالة",
    messagePlaceholder: "يرجى وصف استفسارك بالتفصيل...",
    attachmentLabel: "مرفق ملف",
    attachmentPrompt: "انقر للتحميل أو السحب والإفلات",
    attachmentHelp: "PDF, DOCX, PNG, JPG (الحد الأقصى 10 ميجابايت)",
    consentTerms: "لقد قرأت ووافقت على شروط الاستخدام.",
    consentPrivacy: "لقد قرأت ووافقت على سياسة الخصوصية.",
    consentGovernance: "أقر بإطار الحوكمة والامتثال.",
    captchaLabel: "تحقق أمني: ما هو ناتج {num1} + {num2}؟",
    submitButton: "إرسال الاستفسار",
    submittingButton: "جارٍ الإرسال...",
    errorRequired: "هذا الحقل مطلوب.",
    errorInvalidEmail: "الرجاء إدخال بريد إلكتروني صالح.",
    errorFileTooLarge: "لا يمكن أن يتجاوز حجم الملف 10 ميجابايت.",
    errorFileType: "نوع الملف غير صالح. يرجى تحميل PDF أو DOCX أو PNG أو JPG.",
    errorCaptcha: "إجابة خاطئة على سؤال الأمان.",
    errorConsent: "يجب عليك قبول جميع الشروط والسياسات.",
    successTitle: "شكرًا لك!",
    successMessage: "لقد تم استلام رسالتك. سيعود فريقنا إليك قريبًا.",
    syncErrorTitle: "تم الاستلام، جارٍ المزامنة...",
    syncErrorMessage: "تم استلام رسالتك وتخزينها محليًا. نواجه مشكلة مؤقتة في المزامنة مع نظام الدعم لدينا. سنتواصل معك بمجرد استعادة الاتصال.",
    backToHomeButton: "العودة إلى الصفحة الرئيسية",
    altContactTitle: "طرق بديلة",
    altContactEmail: "بريد الدعم الإلكتروني",
    altContactHours: "ساعات العمل",
    altContactHoursValue: "الاثنين - الجمعة، 9 صباحًا - 5 مساءً (UTC)",
    altContactResponse: "وقت الاستجابة المعتاد",
    altContactResponseValue: "خلال 24 ساعة",
    openAISupportButton: "فتح دعم الذكاء الاصطناعي",
  },
  'ja-JP': {
    homepage_title: "リーダーが集い、\nビジョナリーが進化する場所",
    homepage_subtitle: "EVOLVEは、認証された経営者、創業者、イノベーターが協力し、取引し、未来を形作るための、世界最高のAI搭載エコシステムです。",
    menu_home: "ホーム",
    menu_overview: "概要",
    menu_ecosystem: "エコシステム",
    menu_marketplace: "マーケットプレイス",
    menu_pricing: "価格設定",
    menu_languages: "言語",
    menu_governance: "ガバナンス＆コンプライアンスハブ",
    menu_contact: "連絡先",
    cta_enter_marketplace: "マーケットプレイスに入る",
    search_placeholder: "投稿、人物などを検索...",
    button_create_listing: "リスティングを作成",
    section_pricing_title: "あらゆるビジョンに対応する料金プラン",
    faq_title: "よくある質問とサポート",
    governance_title: "ガバナンス＆コンプライアンスハブ",
    contactTitle: "お問い合わせ",
    contactSubtitle: "私たちがお手伝いします。",
    fullNameLabel: "氏名",
    fullNamePlaceholder: "例：アレックス・ソーントン",
    emailLabel: "メールアドレス",
    emailPlaceholder: "例： a.thornton@corp.net",
    phoneLabel: "電話番号",
    organizationLabel: "組織名",
    organizationPlaceholder: "例： Quantum Dynamics Inc.",
    inquiryTypeLabel: "お問い合わせの種類",
    inquiryTypeDefault: "理由を選択してください...",
    inquiryTypeGeneral: "一般サポート",
    inquiryTypeSales: "営業",
    inquiryTypePartnerships: "パートナーシップ",
    inquiryTypeGovernance: "ガバナンス＆コンプライアンス",
    inquiryTypeOther: "その他",
    subjectLabel: "件名",
    subjectPlaceholder: "お問い合わせ内容の簡単な要約",
    messageLabel: "メッセージ",
    messagePlaceholder: "お問い合わせ内容を詳しくご記入ください...",
    attachmentLabel: "添付ファイル",
    attachmentPrompt: "クリックしてアップロードまたはドラッグ＆ドロップ",
    attachmentHelp: "PDF, DOCX, PNG, JPG (最大10MB)",
    consentTerms: "利用規約を読み、同意します。",
    consentPrivacy: "プライバシーポリシーを読み、同意します。",
    consentGovernance: "ガバナンス＆コンプライアンスフレームワークを承認します。",
    captchaLabel: "セキュリティチェック： {num1} + {num2} は？",
    submitButton: "問い合わせを送信",
    submittingButton: "送信中...",
    errorRequired: "このフィールドは必須です。",
    errorInvalidEmail: "有効なメールアドレスを入力してください。",
    errorFileTooLarge: "ファイルサイズは10MBを超えることはできません。",
    errorFileType: "無効なファイルタイプです。PDF、DOCX、PNG、またはJPGをアップロードしてください。",
    errorCaptcha: "セキュリティの質問に対する答えが間違っています。",
    errorConsent: "すべての規約とポリシーに同意する必要があります。",
    successTitle: "ありがとうございます！",
    successMessage: "メッセージは正常に受信されました。担当者から折り返しご連絡いたします。",
    syncErrorTitle: "受信しましたが、同期中です...",
    syncErrorMessage: "メッセージは受信され、ローカルに保存されました。サポートシステムとの同期中に一時的な問題が発生しています。接続が回復次第、ご連絡いたします。",
    backToHomeButton: "ホームに戻る",
    altContactTitle: "その他の連絡方法",
    altContactEmail: "サポートメール",
    altContactHours: "営業時間",
    altContactHoursValue: "月〜金、午前9時〜午後5時 (UTC)",
    altContactResponse: "通常の応答時間",
    altContactResponseValue: "24時間以内",
    openAISupportButton: "AIサポートを開く",
  },
};

const LOCALE_CACHE_KEY = 'evolve-locale-v2';

class LocaleStore {
    current: Locale = SUPPORTED_LOCALES[0];
    bundles: Record<string, Record<string, string>> = {};
    subscribers: Set<() => void> = new Set();
    isLoading: boolean = false;

    constructor() {
        let loadedLocale: Locale | null = null;
        try {
            const storedLocaleJSON = localStorage.getItem(LOCALE_CACHE_KEY);
            if (storedLocaleJSON) {
                const storedLocale = JSON.parse(storedLocaleJSON);
                if (storedLocale.id && SUPPORTED_LOCALES.find(l => l.id === storedLocale.id)) {
                    loadedLocale = storedLocale;
                }
            }
        } catch {
            console.error("Failed to parse locale from localStorage.");
        }
        this.current = loadedLocale || SUPPORTED_LOCALES.find(l => l.id === 'en_US')!;
        
        // Preload essential bundles
        this.load(this.current.code);
        this.load('en-US');
    }

    subscribe(callback: () => void): () => void {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notify(): void {
        this.subscribers.forEach(cb => cb());
    }

    async load(localeCode: string): Promise<void> {
        if (this.bundles[localeCode]) return;
        this.bundles[localeCode] = TRANSLATIONS[localeCode] || {};
    }

    t(key: string, defaultTextOrParams?: string | { [key: string]: string | number }): string {
        const primaryBundle = this.bundles[this.current.code] || {};
        const fallbackBundle = this.bundles['en-US'] || {};

        let template = primaryBundle[key] || fallbackBundle[key];

        if (template === undefined) {
            console.warn(`Missing translation key: ${key}`);
            if (typeof defaultTextOrParams === 'string') return defaultTextOrParams;
            // Fallback to a formatted key: aiStudioTitle -> Ai Studio Title
            return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim().replace('Ai ', 'AI ');
        }

        if (typeof defaultTextOrParams === 'object' && defaultTextOrParams !== null) {
            Object.entries(defaultTextOrParams).forEach(([placeholder, value]) => {
                template = template.replace(`{${placeholder}}`, String(value));
            });
        }
        
        return template;
    }
    
    normalizeCode(code: string): string {
        const lowerCode = code.toLowerCase().replace('_', '-');
        
        // Find by canonical ID first
        let match = SUPPORTED_LOCALES.find(l => l.id.toLowerCase() === lowerCode.replace('-', '_'));
        if (match) return match.id;

        // Find by locale code (e.g., en-us)
        match = SUPPORTED_LOCALES.find(l => l.code.toLowerCase() === lowerCode);
        if (match) return match.id;
        
        // Handle variations (e.g., 'en' -> 'en_US')
        const langPart = lowerCode.split('-')[0];
        const normalizationMap: { [key: string]: string } = {
            en: 'en_US', fr: 'fr_FR', es: 'es_ES', ar: 'ar_SA', ja: 'ja_JP', he: 'he_IL',
        };
        if (normalizationMap[langPart]) {
            return normalizationMap[langPart];
        }
        
        // Fallback to find any locale starting with the language part
        match = SUPPORTED_LOCALES.find(l => l.code.toLowerCase().startsWith(langPart));
        if (match) return match.id;

        return 'en_US'; // Default fallback
    }

    async set(newLocaleOrCode: Locale | string): Promise<void> {
        let newLocale: Locale | undefined;

        if (typeof newLocaleOrCode === 'string') {
            const normalizedId = this.normalizeCode(newLocaleOrCode);
            newLocale = SUPPORTED_LOCALES.find(l => l.id === normalizedId);
        } else {
             // It's a Locale object, but we still normalize its ID to be safe
            const normalizedId = this.normalizeCode(newLocaleOrCode.id);
            newLocale = SUPPORTED_LOCALES.find(l => l.id === normalizedId);
        }

        if (!newLocale || this.current.id === newLocale.id) return;
        
        this.isLoading = true;
        this.notify();

        await this.load(newLocale.code);
        
        this.current = newLocale;
        
        try {
            localStorage.setItem(LOCALE_CACHE_KEY, JSON.stringify(newLocale));
        } catch (error) {
            console.error("Failed to save locale to localStorage.", error);
        }
        
        this.isLoading = false;
        this.notify();
    }
}

export const localeManager = new LocaleStore();

interface LocaleContextType {
  locale: Locale;
  isLoading: boolean;
  t: (key: any, defaultTextOrParams?: any) => string;
  setLocale: (locale: Locale | string) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: localeManager.current,
  isLoading: localeManager.isLoading,
  t: localeManager.t.bind(localeManager),
  setLocale: localeManager.set.bind(localeManager),
});

export const useTranslation = () => useContext(LocaleContext);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState({ locale: localeManager.current, isLoading: localeManager.isLoading });

    useEffect(() => {
        const handleStateChange = () => {
            setState({ locale: localeManager.current, isLoading: localeManager.isLoading });
        };
        const unsubscribe = localeManager.subscribe(handleStateChange);
        return unsubscribe;
    }, []);

    const value = {
        locale: state.locale,
        isLoading: state.isLoading,
        t: useCallback((key: any, defaultTextOrParams?: any) => localeManager.t(key, defaultTextOrParams), [state.locale]),
        setLocale: localeManager.set.bind(localeManager),
    };
    
    return React.createElement(LocaleContext.Provider, { value: value }, children);
};