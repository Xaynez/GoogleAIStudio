import React from 'react';

export const GoogleAccountIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#4285F4"/>
        <path d="M12 15C15.3137 15 18 17.6863 18 21V22H6V21C6 17.6863 8.68629 15 12 15Z" fill="white"/>
        <circle cx="12" cy="10" r="4" fill="white"/>
    </svg>
);

export const GoogleAdsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#4285F4"/>
        <path d="M12 4L4 8V16L12 20L20 16V8L12 4Z" fill="#2E66B6"/>
        <path d="M12 4L20 8V16L12 20L4 16V8L12 4Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 10L12 12L16 10" stroke="white" strokeWidth="1.5"/>
        <path d="M12 12V16" stroke="white" strokeWidth="1.5"/>
    </svg>
);

export const GoogleCalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M40 8H8c-2.2 0-4 1.8-4 4v28c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V12c0-2.2-1.8-4-4-4z"/>
        <path fill="#FFFFFF" d="M38 0H10C8.9 0 8 .9 8 2v6h32V2c0-1.1-.9-2-2-2z"/>
        <text x="24" y="34" fontFamily="Arial, sans-serif" fontSize="24" fill="white" textAnchor="middle" fontWeight="bold">31</text>
    </svg>
);

export const GoogleChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#00AC47" d="M36 28H12c-2.2 0-4-1.8-4-4V12c0-2.2 1.8-4 4-4h24c2.2 0 4 1.8 4 4v12c0 2.2-1.8 4-4 4z"/>
        <path fill="#FFFFFF" d="M14 14h20v8H14z"/>
        <path fill="#00832D" d="M12 40h24c2.2 0 4-1.8 4-4v-4H8v4c0 2.2 1.8 4 4 4z"/>
    </svg>
);

export const GoogleContactsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M40 8H8c-2.2 0-4 1.8-4 4v28c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V12c0-2.2-1.8-4-4-4z"/>
        <circle cx="24" cy="20" r="7" fill="white"/>
        <path fill="white" d="M14 36v-2c0-4.4 3.6-8 8-8h4c4.4 0 8 3.6 8 8v2z"/>
    </svg>
);

export const GoogleDocsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M38 0H10C7.8 0 6 1.8 6 4v40c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4V4c0-2.2-1.8-4-4-4z"/>
        <path fill="#FFFFFF" d="M14 14h20v4H14z M14 22h20v4H14z M14 30h20v4H14z"/>
    </svg>
);

export const GoogleDriveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#34A853" d="M33 32l-9-16 9-16H15L6 16l9 16z"/>
        <path fill="#188038" d="M24 0L15 16h18z"/>
        <path fill="#FBBC05" d="M9.8 17.7L6 24h18l-9-16 .8-1.7z"/>
        <path fill="#4285F4" d="M15 16l-9 16h18l9-16z"/>
        <path fill="#1A73E8" d="M24 48l9-16H15z"/>
        <path fill="#FFC107" d="M38.2 30.3L42 24H24l9 16-.8 1.7z"/>
    </svg>
);

export const GoogleFormsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#7E57C2" d="M38 4H10C7.8 4 6 5.8 6 8v32c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4V8c0-2.2-1.8-4-4-4z"/>
        <path fill="#FFFFFF" d="M14 14h20v4H14z M14 22h12v4H14z M14 30h20v4H14z"/>
    </svg>
);

export const GoogleGeminiIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4285F4"/><stop offset="100%" stopColor="#9b72cb"/></linearGradient></defs>
        <path fill="url(#gemini-gradient)" d="M12,2A10,10,0,0,0,5.12,4.73L9.3,10.5,4.73,5.12A10,10,0,0,0,2,12a10,10,0,0,0,3.12,7.27L10.5,14.7,5.12,19.27A10,10,0,0,0,12,22a10,10,0,0,0,7.27-3.12L14.7,13.5l4.57,4.57A10,10,0,0,0,22,12,10,10,0,0,0,19.27,5.12L13.5,9.3,19.27,4.73A10,10,0,0,0,12,2Z"/>
    </svg>
);

export const GoogleGmailIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EA4335" d="M4 35V13L24 26l20-13v22z"/>
        <path fill="#FBBC05" d="M4 13l20 13 20-13H4z"/>
        <path fill="#4285F4" d="M4 13h40v-2c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2z"/>
    </svg>
);

export const GoogleKeepIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFBB00" d="M10 4h28c2.2 0 4 1.8 4 4v32c0 2.2-1.8 4-4 4H10c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4z"/>
        <path fill="#FFFFFF" d="M22 14h4v12h-4z M22 28h4v4h-4z"/>
    </svg>
);

export const GoogleMapsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M24 4C16.8 4 11 9.8 11 17c0 7.8 13 27 13 27s13-19.2 13-27c0-7.2-5.8-13-13-13zm0 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
    </svg>
);

export const GoogleMeetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#00832D" d="M24 8H10c-2.2 0-4 1.8-4 4v16c0 2.2 1.8 4 4 4h14v-8l14 8V12l-14 8V8z"/>
        <path fill="#FFC107" d="M6 12h18v24H6z"/>
        <path fill="#00AC47" d="M24 12v24l18-12z"/>
    </svg>
);

export const GoogleNewsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M40 8H8c-2.2 0-4 1.8-4 4v28c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V12c0-2.2-1.8-4-4-4z"/>
        <path fill="#FFFFFF" d="M14 14h20v4H14z M14 22h20v4H14z M14 30h12v4H14z"/>
    </svg>
);

export const GooglePhotosIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M24 4L4 24l20 20V4z"/>
        <path fill="#EA4335" d="M44 24L24 4v40z"/>
        <path fill="#FBBC05" d="M24 44l20-20H24z"/>
        <path fill="#34A853" d="M24 4l20 20H24z"/>
    </svg>
);

export const GooglePlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#00C0F4" d="M3.2 2.6l19.2 19.2-19.2 19.2z"/>
        <path fill="#FFC000" d="M3.2 43.4L22.4 24 3.2 4.6z" transform="rotate(180 12.8 24)"/>
        <path fill="#F44336" d="M22.4 24L44.8 12v24z"/>
        <path fill="#00E575" d="M22.4 24l22.4-12-22.4-12z" transform="rotate(90 33.6 18)"/>
    </svg>
);

export const GoogleSearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
        <path fill="#34A853" d="M24 46c5.94 0 10.92-1.96 14.56-5.3l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.38v5.7C7.88 40.64 15.38 46 24 46z"/>
        <path fill="#FBBC05" d="M11.69 28.18c-.38-1.13-.6-2.33-.6-3.58s.22-2.45.6-3.58V15.31H4.38C2.9 18.25 2 21.52 2 25.22s.9 6.97 2.38 9.91l7.31-5.95z"/>
        <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.38 2 7.88 7.36 4.38 15.31l7.31 5.71c1.73-5.2 6.58-9.27 12.31-9.27z"/>
    </svg>
);

export const GoogleSheetsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#34A853" d="M38 4H10C7.8 4 6 5.8 6 8v32c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4V8c0-2.2-1.8-4-4-4z"/>
        <path fill="#FFFFFF" d="M14 14h8v8h-8z M26 14h8v8h-8z M14 26h8v8h-8z M26 26h8v8h-8z"/>
    </svg>
);

export const GoogleSlidesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M38 4H10C7.8 4 6 5.8 6 8v32c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4V8c0-2.2-1.8-4-4-4z"/>
        <path fill="#FFFFFF" d="M14 14h20v20H14z"/>
    </svg>
);

export const GoogleTasksIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" fill="#4285F4"/>
        <path d="M22 34l-8-8 2.8-2.8 5.2 5.2L31.2 18l2.8 2.8z" fill="#FFC107"/>
    </svg>
);

export const GoogleTranslateIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M24 4L4 24h10v20h20V24h10L24 4z"/>
        <path fill="#FFFFFF" d="M26 34h-4v-8h10v-4H22v-4h12v-4H22V10h-4v4H8v4h10v4H8v4h10z"/>
    </svg>
);

export const GoogleTravelIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M38 12H10c-2.2 0-4 1.8-4 4v20c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4z"/>
        <path fill="#FFFFFF" d="M20 18h8v16h-8z"/>
        <path fill="#1967D2" d="M18 12h12v-2c0-2.2-1.8-4-4-4h-4c-2.2 0-4 1.8-4 4v2z"/>
    </svg>
);

export const GoogleWalletIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M40 14H8c-2.2 0-4 1.8-4 4v16c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V18c0-2.2-1.8-4-4-4z"/>
        <path fill="#34A853" d="M40 14H8V10c0-2.2 1.8-4 4-4h24c2.2 0 4 1.8 4 4v4z"/>
        <circle cx="36" cy="30" r="4" fill="#FBBC05"/>
    </svg>
);

export const GoogleYoutubeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FF0000" d="M40 14H8c-2.2 0-4 1.8-4 4v12c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V18c0-2.2-1.8-4-4-4z"/>
        <path fill="#FFFFFF" d="M20 29l12-5-12-5v10z"/>
    </svg>
);
