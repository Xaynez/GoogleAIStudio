// Fix: Define and export PricingTier to resolve circular dependency and export errors.
export type PricingTier = 'Standard' | 'Pro' | 'Elite';
export type AppView = 'feed' | 'dashboard' | 'marketplace' | 'governanceHub' | 'network' | 'search' | 'connectors' | 'terms' | 'privacy';

export interface Translation {
    text: string;
    confidence: number;
    edited?: boolean;
}

export interface TranslatableContent {
  originalLang: string; // e.g., 'en-US'
  originalText: string;
  translations?: Record<string, Translation>; // e.g., { 'es-ES': { text: '...', confidence: 0.95 } }
}

export interface PriceConverted {
  [currencyCode: string]: number;
}

export interface SuggestedMatch {
  userID: string;
  userName:string;
  matchScore: number;
  reason: string;
  profile: {
    location: string;
    industry: string;
    title: string;
  };
}

export interface HealthScoreDetail {
    metric: string;
    score: number;
    weighting: number;
}

export interface ListingAnalysis {
  listingSummary: string;
  voiceSummary: string;
  verification: {
    status: 'Verified' | 'Unverified' | 'Requires Review';
    flags: string[];
  };
  financials: {
    priceOriginal: number;
    currency: string;
    priceConverted: PriceConverted;
    predictedROI: string;
  };
  suggestedMatches: SuggestedMatch[];
  recommendedActions: string[];
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  healthScore: {
      score: number;
      details: HealthScoreDetail[];
  };
}

export interface CalendarEvent {
    id: string;
    title: string;
    time: string;
    attendees: string[];
}

export type IdType = 'driversLicense' | 'passport' | 'nationalId';

export type DegreeType = 'BA' | 'Masters' | 'PhD' | 'Diploma' | 'Micro-credential' | 'Certificate';

export interface EducationEntry {
    degreeType: DegreeType | '';
    fieldOfStudy: string;
    institutionName: string;
    startDate: string;
    endDate: string;
}

export interface ExperienceEntry {
    role: string;
    company: string;
    startDate: string;

    endDate: string;
    description: string;
}

export type PostType = 'text' | 'image' | 'video' | 'document' | 'live' | 'scheduled-live';
export type ReactionType = 'like' | 'applaud' | 'support' | 'love' | 'insightful' | 'funny';

export interface PostAuthor {
    id: string;
    name: string;
    title: string;
    company: string;
    verified: boolean;
    profileImageUrl?: string;
}

export interface Reaction {
    user: PostAuthor;
    type: ReactionType;
}

export interface Comment {
    id: string;
    author: PostAuthor;
    text: TranslatableContent;
    timestamp: string;
    allReactions: Reaction[];
    currentUserReaction?: ReactionType;
    replies?: Comment[];
}

export interface Post {
    id: string;
    type: PostType;
    author: PostAuthor;
    content: TranslatableContent;
    media?: { url: string; name: string; type: 'image' | 'video' | 'document' }[];
    timestamp: string;
    analytics: {
        allReactions: Reaction[];
        comments: number;
        impressions: number;
        views: number;
        shares: number;
        profileViews: number;
        newConnections: number;
    };
    currentUserReaction?: ReactionType;
    comments?: Comment[];
    isSponsored?: boolean;
    tags?: string[];
    isLive?: boolean;
    scheduledTime?: string;
    repostOf?: Post;
    isBookmarked?: boolean;
}

export interface OnboardingData {
    fullName: string;
    idType: IdType | null;
    idFrontPhoto: string | null;
    idBackPhoto: string | null;
    selfieVerified: boolean;
    ssoEmail: string;
    jobTitle: string;
    company: string;
    location: string;
    summary: TranslatableContent;
    education: EducationEntry[];
    experience: ExperienceEntry[];
    languages: string[];
    industries: string[];
    interests: string[];
    termsAccepted: boolean;
    privacyAccepted: boolean;
    governanceAccepted: boolean;
}

export type UserRole = 'User' | 'Compliance Officer' | 'Admin';

export interface Locale {
  id: string;
  code: string; // e.g., 'en-US'
  name: string; // e.g., 'English (US)'
  nativeName: string; // e.g., 'English'
  country: string; // e.g., 'United States'
  dialCode: string; // e.g., '+1'
  flag: string; // e.g., '🇺🇸'
  rtl: boolean;
  font: string;
  currency: string; // e.g., 'USD'
}

export interface UserProfile extends OnboardingData {
    tier: PricingTier;
    isBiometricEnrolled: boolean;
    activity: Post[];
    role: UserRole;
    yearsExperience: number;
    achievements: string[];
    preferredCurrency: string;
    verifiedStatus: 'Verified' | 'Pending' | 'Rejected';
    trustScore: number;
    locale: Locale;
    profileImageUrl?: string;
    coverImageUrl?: string;
    selectedImageModel: 'gemini-image' | 'imagen';
    selectedVideoModel: 'gemini-storyboard' | 'veo-3';
    hasVeoApiKey: boolean;
}

// Marketplace Types
export type MarketplaceCategory = 'Investments' | 'Investors' | 'Partnerships' | 'Business for Sale' | 'Real Estate' | 'Suppliers & Logistics' | 'Intellectual Property' | 'Assets' | 'C-level Jobs' | 'Events' | 'Courses' | 'Fundraising';

export type TransactionStatus = 'Offer' | 'Escrow' | 'Due Diligence' | 'Completed' | 'Cancelled';

export type ListingStatus = 'Pending Review' | 'Approved' | 'Rejected' | 'Flagged';

export interface SponsorshipDetails {
    plan: 'daily' | 'monthly';
    boost: boolean;
    cost: number;
}

export interface MarketplaceListing {
    id: string;
    category: MarketplaceCategory;
    title: TranslatableContent;
    location: string;
    summary: TranslatableContent;
    media: { type: 'image' | 'video'; url: string; name?: string }[];
    amount: number; // Represents valuation, salary, price, etc.
    currency: 'USD'; // Base currency is always USD
    documents: { name: string; url: string }[];
    details: {
        description: TranslatableContent;
        keyMetrics: { label: string; value: string }[];
        // Category-specific details
        jobDetails?: {
            responsibilities: string;
            qualifications: string;
            salaryRange: string;
        };
        eventDetails?: {
            startDate: string;
            endDate: string;
            format: 'Online' | 'In-Person';
        };
        courseDetails?: {
            instructor: string;
            duration: string;
            outcomes: string[];
        };
        fundraisingDetails?: {
            targetAmount: number;
            equityOffered: string;
            stage: string;
        };
    };
    // Governance Fields
    status: ListingStatus;
    submittedBy: string; // User's full name
    submittedAt: string; // ISO Date string
    aiRiskScore: number; // 0-100
    aiFlags: string[];
    reviewedBy?: string; // Compliance Officer's name
    reviewedAt?: string; // ISO Date string
    rejectionReason?: string;
    sponsorshipDetails?: SponsorshipDetails;
}

export interface Transaction {
    id: string;
    listingId: string;
    status: TransactionStatus;
    documents: { name: string; status: 'Uploaded' | 'Verified' | 'Rejected' }[];
}

// Messaging Types
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: TranslatableContent;
  timestamp: string;
  isOwn: boolean;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    title: string;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: Message[];
}

// Feed Types
export interface OpportunityTeaser {
    id: string;
    itemType: 'opportunity';
    listingId: string;
    category: MarketplaceCategory;
    title: TranslatableContent;
    shortValuation: number;
    currency: 'USD';
    location: string;
}

export type FeedItem = Post | OpportunityTeaser;

// Notification Types
export type NotificationType = 'new_message' | 'post_like' | 'post_comment' | 'new_listing' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  text: string;
  timestamp: string; // ISO Date string
  isRead: boolean;
  link?: {
    view: AppView;
    itemId: string; // conversationId, postId, listingId etc.
  };
}

// Network Types
export interface NetworkUser {
    id: string;
    fullName: string;
    jobTitle: string;
    company: string;
    location: string;
    profileImageUrl: string;
    industries: string[];
}

// Search Types
export type SearchResultItem = Post | NetworkUser | MarketplaceListing;

export type SearchResults = {
    [key: string]: SearchResultItem[];
};

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  }
}

export interface WebSearchResults {
  summary: string;
  sources: GroundingSource[];
  categorized?: SearchResults;
  imageUrl?: string;
}

// AI Studio Types
export interface TranscriptionSettings {
  language: string; // locale code e.g., 'en-US'
  addPunctuation: boolean;
  summarize: boolean;
}

export interface TranscriptionResult {
  transcription: string;
  summary?: string;
}

export interface TranscriptionHistoryItem {
  id: number; // Using timestamp as a simple unique ID
  filename: string;
  timestamp: string;
  result: TranscriptionResult;
  settings: TranscriptionSettings;
}

export type BusinessSuiteTool = 'plan' | 'deck' | 'visuals';

export interface BusinessPlanData {
    companyName: string;
    industry: string;
    mission: string;
    vision: string;
    productDetails: string;
    financialsFile?: File;
}

export interface BusinessPlanOutput {
    executiveSummary: string;
    sections: string[];
}

export interface PitchDeckOutput {
    slides: { title: string; content: string }[];
}

export interface FinancialVisualsOutput {
    charts: { title: string; type: 'bar' | 'line' | 'pie'; data: any }[];
}

export interface ValidationIssue {
    type: 'error' | 'warning';
    field: string;
    row?: number;
    message: string;
    suggestedFix?: string;
}

export interface FinancialAnalysisInsights {
    trends: string[];
    risks: string[];
    strengths: string[];
    recommendations: string[];
}


// Live API Types
export interface LiveSession {
  sendRealtimeInput: (input: { media: { data: string, mimeType: string }}) => void;
  close: () => void;
}

export interface LiveServerMessage {
  serverContent?: {
    modelTurn?: {
      parts: {
        inlineData: {
          data: string;
          mimeType: string;
        }
      }[];
    };
    inputTranscription?: { text: string };
    outputTranscription?: { text: string };
    turnComplete?: boolean;
    interrupted?: boolean;
  };
}

// Governance Types
export interface AuditLog {
    id: string;
    timestamp: string;
    actor: string; // User's full name or 'System'
    event: string;
    details: Record<string, any>;
}