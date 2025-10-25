import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, User, Briefcase, GraduationCap, Languages, Building2, Sparkles, Send, Image as ImageIcon, Video, FileText, Edit, Plus, Trash2, ThumbsUp, MessageSquare, ChevronsUpDown, Bot, Loader, BadgePercent, MapPin, Award, TrendingUp, ChevronDown, BarChart2, CalendarClock, Eye, Users, Camera } from 'lucide-react';
import type { UserProfile, Post, PostType, ExperienceEntry, EducationEntry, Comment, DegreeType, TranslatableContent } from '../types';
import { LANGUAGES as allLanguages } from '../constants';
import { NEW_MARKETPLACE_CATEGORIES as allInterests } from '../../constants';
import { AIStudioPanel } from './AIStudioPanel';
import { PostCard } from './feed/PostCard';
import { enhanceSummaryWithGemini } from '../../services/geminiService';
import { useTranslation } from '../../i18n';
import { TranslatedText } from './common/TranslatedText';
import { ImageEditorModal } from './common/ImageEditorModal';

const allIndustries = ["Technology", "Finance", "Healthcare", "Real Estate", "Manufacturing", "Energy", "Consulting", "Media"];
const DEGREE_TYPES: DegreeType[] = ['BA', 'Masters', 'PhD', 'Diploma', 'Micro-credential', 'Certificate'];

const POST_TYPE_ICONS: Record<PostType, React.ReactNode> = {
    'text': <FileText size={16} />,
    'image': <ImageIcon size={16} />,
    'video': <Video size={16} />,
    'document': <FileText size={16} />,
    'live': <Video size={16} className="text-red-400" />,
    'scheduled-live': <CalendarClock size={16} />,
};

const AnalyticsTab: React.FC<{ posts: Post[] }> = ({ posts }) => {
    type TimeFilter = 'day' | 'week' | 'month' | '90d' | 'year';
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
    const [typeFilters, setTypeFilters] = useState<PostType[]>([]);

    const filteredPosts = useMemo(() => {
        const now = new Date();
        let startDate = new Date();

        switch (timeFilter) {
            case 'day': startDate.setDate(now.getDate() - 1); break;
            case 'week': startDate.setDate(now.getDate() - 7); break;
            case 'month': startDate.setMonth(now.getMonth() - 1); break;
            case '90d': startDate.setDate(now.getDate() - 90); break;
            case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
        }

        return posts.filter(post => {
            const postDate = new Date(post.timestamp);
            const timeCondition = postDate >= startDate;
            const typeCondition = typeFilters.length === 0 || typeFilters.includes(post.type);
            return timeCondition && typeCondition;
        });
    }, [posts, timeFilter, typeFilters]);

    const overallStats = useMemo(() => {
        return filteredPosts.reduce((acc, post) => {
            acc.impressions += post.analytics.impressions;
            acc.interactions += (post.analytics.allReactions.length + post.analytics.comments + post.analytics.shares);
            acc.profileViews += post.analytics.profileViews;
            acc.newConnections += post.analytics.newConnections;
            return acc;
        }, { impressions: 0, interactions: 0, profileViews: 0, newConnections: 0 });
    }, [filteredPosts]);

    const toggleTypeFilter = (type: PostType) => {
        setTypeFilters(prev => 
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const StatCard: React.FC<{ label: string; value: number, icon: React.ReactNode }> = ({ label, value, icon }) => (
        <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
                {icon}
                <span>{label}</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{value.toLocaleString()}</p>
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Overall Performance</h3>
                     <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as TimeFilter)} className="bg-slate-800 border border-slate-700 rounded-lg py-1 px-3 text-sm text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none">
                        <option value="day">Last 24 hours</option>
                        <option value="week">Last 7 days</option>
                        <option value="month">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="year">Last year</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Impressions" value={overallStats.impressions} icon={<Eye size={16}/>} />
                    <StatCard label="Interactions" value={overallStats.interactions} icon={<ThumbsUp size={16}/>} />
                    <StatCard label="Profile Views" value={overallStats.profileViews} icon={<User size={16}/>} />
                    <StatCard label="New Connections" value={overallStats.newConnections} icon={<Users size={16}/>} />
                </div>
            </div>

            <div>
                 <h3 className="text-xl font-bold text-white mb-2">Post Breakdown</h3>
                 <div className="flex flex-wrap gap-2 mb-4">
                    {Object.keys(POST_TYPE_ICONS).map(type => (
                        <button key={type} onClick={() => toggleTypeFilter(type as PostType)} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition-colors capitalize ${typeFilters.includes(type as PostType) ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                           {POST_TYPE_ICONS[type as PostType]} {type.replace('-',' ')}
                        </button>
                    ))}
                    {typeFilters.length > 0 && <button onClick={() => setTypeFilters([])} className="text-xs text-slate-400 hover:underline">Clear Filters</button>}
                 </div>

                 <div className="space-y-4">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                             <div className="flex gap-4">
                                <div className="flex-shrink-0 w-24 h-16 bg-slate-700 rounded-md flex items-center justify-center">
                                    {post.media && (post.media[0].type === 'image' || post.media[0].type === 'video') ? (
                                        <img src={post.media[0].url} alt="Post media" className="w-full h-full object-cover rounded-md" />
                                    ) : (
                                        POST_TYPE_ICONS[post.type]
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-slate-300 line-clamp-2">{post.content.originalText}</p>
                                    <p className="text-xs text-slate-500">{new Date(post.timestamp).toLocaleString()}</p>
                                </div>
                             </div>
                             <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-3 text-center text-xs">
                                <div className="bg-slate-800 p-2 rounded"><p className="font-bold text-lg text-white">{post.analytics.impressions.toLocaleString()}</p><p className="text-slate-400">Impressions</p></div>
                                <div className="bg-slate-800 p-2 rounded"><p className="font-bold text-lg text-white">{post.analytics.allReactions.length.toLocaleString()}</p><p className="text-slate-400">Reactions</p></div>
                                <div className="bg-slate-800 p-2 rounded"><p className="font-bold text-lg text-white">{post.analytics.comments.toLocaleString()}</p><p className="text-slate-400">Comments</p></div>
                                <div className="bg-slate-800 p-2 rounded"><p className="font-bold text-lg text-white">{post.analytics.shares.toLocaleString()}</p><p className="text-slate-400">Shares</p></div>
                                <div className="bg-slate-800 p-2 rounded"><p className="font-bold text-lg text-white">{post.analytics.profileViews.toLocaleString()}</p><p className="text-slate-400">Profile Views</p></div>
                             </div>
                        </div>
                    ))}
                    {filteredPosts.length === 0 && <p className="text-center text-slate-500 py-8">No posts match the current filters.</p>}
                 </div>
            </div>
        </div>
    );
};


interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  initialTab?: string;
  isCurrentUser: boolean;
}

const MultiSelectChip: React.FC<{
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}> = ({ options, selected, onChange }) => {
    const handleToggle = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option}
                    onClick={() => handleToggle(option)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        selected.includes(option)
                            ? 'bg-cyan-500 text-slate-900'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userProfile, setUserProfile, initialTab, isCurrentUser }) => {
    const { t } = useTranslation();
    const [isClosing, setIsClosing] = useState(false);
    const [activeTab, setActiveTab] = useState(initialTab || 'About');
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<UserProfile>(userProfile);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
    const [imageToEdit, setImageToEdit] = useState<{ type: 'profile' | 'cover'; url: string | null }>({ type: 'profile', url: null });
    
    useEffect(() => {
        if(isOpen) {
            setEditedProfile(userProfile); // Reset edits when modal is opened
            setActiveTab(initialTab || 'About'); // Default to about tab
        }
    }, [isOpen, userProfile, initialTab]);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setIsEditing(false); // Reset edit mode on close
        }, 300); // Animation duration
    };
    
    const openImageEditor = (type: 'profile' | 'cover') => {
        setImageToEdit({
            type,
            url: type === 'profile' ? editedProfile.profileImageUrl || null : editedProfile.coverImageUrl || null
        });
        setIsImageEditorOpen(true);
    };

    const handleImageSave = (newImageUrl: string | null) => {
        if (imageToEdit) {
            const fieldName = imageToEdit.type === 'profile' ? 'profileImageUrl' : 'coverImageUrl';
            setEditedProfile(prev => ({ ...prev, [fieldName]: newImageUrl }));
        }
        setIsImageEditorOpen(false);
    };

    const handleEnhanceSummary = async () => {
        setIsEnhancing(true);
        try {
            const enhancedSummary = await enhanceSummaryWithGemini(editedProfile);
            setEditedProfile(prev => ({ ...prev, summary: { ...prev.summary, originalText: enhancedSummary } }));
        } catch (error) {
            console.error("Failed to enhance summary", error);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleSaveChanges = () => {
        setUserProfile(editedProfile);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedProfile(userProfile);
        setIsEditing(false);
    };
    
    const handleAboutChange = (field: keyof UserProfile, value: any) => {
        setEditedProfile(prev => ({...prev, [field]: value }));
    };

    const handleExperienceChange = (index: number, field: keyof ExperienceEntry, value: string) => {
        const newExperience = [...editedProfile.experience];
        newExperience[index] = { ...newExperience[index], [field]: value };
        setEditedProfile({ ...editedProfile, experience: newExperience });
    };
    const addExperienceEntry = () => {
        const newExperience = [...editedProfile.experience, { role: '', company: '', startDate: '', endDate: '', description: '' }];
        setEditedProfile({ ...editedProfile, experience: newExperience });
    };
    const removeExperienceEntry = (index: number) => {
        const newExperience = editedProfile.experience.filter((_, i) => i !== index);
        setEditedProfile({ ...editedProfile, experience: newExperience });
    };
    
    const handleEducationChange = (index: number, field: keyof EducationEntry, value: string) => {
        const newEducation = [...editedProfile.education];
        newEducation[index] = { ...newEducation[index], [field]: value };
        setEditedProfile({ ...editedProfile, education: newEducation });
    };
    const addEducationEntry = () => {
        const newEducation = [...editedProfile.education, { degreeType: '', fieldOfStudy: '', institutionName: '', startDate: '', endDate: '' }];
        setEditedProfile({ ...editedProfile, education: newEducation });
    };
    const removeEducationEntry = (index: number) => {
        const newEducation = editedProfile.education.filter((_, i) => i !== index);
        setEditedProfile({ ...editedProfile, education: newEducation });
    };
    
    const handleAchievementChange = (index: number, value: string) => {
        const newAchievements = [...editedProfile.achievements];
        newAchievements[index] = value;
        handleAboutChange('achievements', newAchievements);
    };
    const addAchievement = () => handleAboutChange('achievements', [...editedProfile.achievements, '']);
    const removeAchievement = (index: number) => handleAboutChange('achievements', editedProfile.achievements.filter((_, i) => i !== index));

    if (!isOpen) return null;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'AI Studio':
                return <AIStudioPanel userProfile={userProfile} />;
            case 'Analytics':
                return <AnalyticsTab posts={userProfile.activity} />;
            case 'Activity':
                return (
                    <div className="space-y-6">
                       {userProfile.activity.length > 0 ? userProfile.activity.map(post => (
                           <PostCard 
                                key={post.id} 
                                item={post}
                                currentUserProfile={userProfile}
                                // Mock handlers as profile modal is read-only for interactions
                                onLikePost={() => {}} 
                                onAddComment={() => {}}
                                onViewOpportunity={() => {}}
                                onAuthorClick={() => {}}
                                onEndLiveStream={() => {}}
                                onArchiveLiveStream={() => {}}
                                onStartScheduledStream={() => {}}
                                onUpdatePost={() => {}}
                                onRepost={() => {}}
                                onQuotePost={() => {}}
                                onDeletePost={() => {}}
                                onBookmarkPost={() => {}}
                                onShareByMessage={() => {}}
                            />
                       )) : (
                           <div className="text-center py-8 text-slate-400">
                               <p>No activity to display.</p>
                           </div>
                       )}
                    </div>
                );
            case 'About':
            default:
                if (isEditing) {
                    return (
                        <div className="space-y-6">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">{t('currentRole')}</label>
                                    <input type="text" value={editedProfile.jobTitle} onChange={e => handleAboutChange('jobTitle', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">{t('company')}</label>
                                    <input type="text" value={editedProfile.company} onChange={e => handleAboutChange('company', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">{t('location')}</label>
                                    <input type="text" value={editedProfile.location} onChange={e => handleAboutChange('location', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Years of Experience</label>
                                    <input type="number" value={editedProfile.yearsExperience} onChange={e => handleAboutChange('yearsExperience', Number(e.target.value))} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                </div>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">{t('professionalSummary')}</label>
                                <textarea value={editedProfile.summary.originalText} onChange={e => handleAboutChange('summary', { ...editedProfile.summary, originalText: e.target.value } as TranslatableContent)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white resize-y focus:ring-1 focus:ring-cyan-500 focus:outline-none" rows={4}></textarea>
                                <button onClick={handleEnhanceSummary} disabled={isEnhancing} className="flex items-center justify-center gap-2 text-sm mt-2 px-3 py-1.5 bg-cyan-600/20 text-cyan-300 rounded-full hover:bg-cyan-600/40 disabled:opacity-50">
                                    <Sparkles size={16} /> {isEnhancing ? t('enhancing') : t('enhanceWithAI')}
                                </button>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Key Achievements</label>
                                <div className="space-y-2">
                                    {editedProfile.achievements.map((ach, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="text" value={ach} onChange={e => handleAchievementChange(index, e.target.value)} className="flex-grow bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                            <button onClick={() => removeAchievement(index)} className="text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                    <button onClick={addAchievement} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><Plus size={14} /> Add Achievement</button>
                                </div>
                             </div>
                             {/* Experience Edit Section */}
                            <div>
                                <label className="block text-lg font-medium text-slate-200 mb-2 flex items-center gap-2">
                                    <Briefcase /> {t('workExperience')}
                                </label>
                                <div className="space-y-4">
                                    {editedProfile.experience.map((exp, index) => (
                                        <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3 relative">
                                            <button onClick={() => removeExperienceEntry(index)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                                            <input type="text" placeholder="Role" value={exp.role} onChange={e => handleExperienceChange(index, 'role', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                            <input type="text" placeholder="Company" value={exp.company} onChange={e => handleExperienceChange(index, 'company', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                            <div className="flex gap-4">
                                                <input type="month" placeholder="Start Date" value={exp.startDate} onChange={e => handleExperienceChange(index, 'startDate', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                                <input type="month" placeholder="End Date" value={exp.endDate} onChange={e => handleExperienceChange(index, 'endDate', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                            </div>
                                            <textarea placeholder="Description" value={exp.description} onChange={e => handleExperienceChange(index, 'description', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white resize-y focus:ring-1 focus:ring-cyan-500 focus:outline-none" rows={3}></textarea>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addExperienceEntry} className="w-full flex items-center justify-center gap-2 text-sm py-2 px-4 bg-slate-800 text-cyan-400 font-semibold rounded-lg border border-slate-700 hover:bg-slate-700">
                                        <Plus className="h-4 w-4" /> {t('addExperience')}
                                    </button>
                                </div>
                            </div>
                            {/* Education Edit Section */}
                            <div>
                                <label className="block text-lg font-medium text-slate-200 mb-2 flex items-center gap-2">
                                    <GraduationCap /> {t('education')}
                                </label>
                                <div className="space-y-4">
                                    {editedProfile.education.map((edu, index) => (
                                        <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3 relative">
                                            <button onClick={() => removeEducationEntry(index)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                                            <input type="text" placeholder="Institution" value={edu.institutionName} onChange={e => handleEducationChange(index, 'institutionName', e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <select value={edu.degreeType} onChange={e => handleEducationChange(index, 'degreeType', e.target.value)} className="w-full appearance-none bg-slate-700 border border-slate-600 rounded-md py-2 pl-3 pr-8 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none">
                                                        <option value="" disabled>Select a degree</option>
                                                        {DEGREE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                                    </select>
                                                    <ChevronsUpDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                </div>
                                                <input type="text" placeholder="Field of Study" value={edu.fieldOfStudy} onChange={e => handleEducationChange(index, 'fieldOfStudy', e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                            </div>
                                            <div className="flex gap-4">
                                                <input type="month" value={edu.startDate} onChange={e => handleEducationChange(index, 'startDate', e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                                <input type="month" value={edu.endDate} onChange={e => handleEducationChange(index, 'endDate', e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addEducationEntry} className="w-full flex items-center justify-center gap-2 text-sm py-2 px-4 bg-slate-800 text-cyan-400 font-semibold rounded-lg border border-slate-700 hover:bg-slate-700">
                                        <Plus className="h-4 w-4" /> {t('addEducation')}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">{t('languagesSpoken')}</label>
                                <MultiSelectChip options={allLanguages.map(l => l.name)} selected={editedProfile.languages} onChange={s => handleAboutChange('languages', s)} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">{t('primaryIndustries')}</label>
                                <MultiSelectChip options={allIndustries} selected={editedProfile.industries} onChange={s => handleAboutChange('industries', s)} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">{t('stepInterests')}</label>
                                <MultiSelectChip options={allInterests} selected={editedProfile.interests} onChange={s => handleAboutChange('interests', s)} />
                            </div>
                        </div>
                    )
                }
                const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | string[] | React.ReactNode; isParagraph?: boolean; }> = ({ icon, label, value, isParagraph=false }) => (
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-cyan-400 mt-1">{icon}</div>
                        <div>
                            <p className="text-sm font-semibold text-slate-400">{label}</p>
                            {Array.isArray(value) ? (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {value.map(item => (<span key={item} className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded-full">{item}</span>))}
                                </div>
                            ) : isParagraph ? (
                                <div className="text-slate-200 whitespace-pre-wrap">{value}</div>
                            ) : (
                                <p className="text-slate-200">{value as string}</p>
                            )}
                        </div>
                    </div>
                );
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoRow icon={<Briefcase size={20} />} label={t('currentRole')} value={`${userProfile.jobTitle} at ${userProfile.company}`} />
                            <InfoRow icon={<MapPin size={20} />} label={t('location')} value={userProfile.location} />
                        </div>
                        <InfoRow icon={<FileText size={20} />} label={t('professionalSummary')} value={<TranslatedText contentId={`${userProfile.ssoEmail}_summary`} content={userProfile.summary} showToggle />} isParagraph />
                         <div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 text-cyan-400 mt-1"><Award size={20} /></div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-400">Key Achievements</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1 text-slate-200">
                                        {userProfile.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                                    </ul>
                                </div>
                            </div>
                         </div>
                        <div className="mt-8 pt-6 border-t border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Briefcase /> {t('experience')}
                            </h3>
                            <div className="space-y-4">
                                {userProfile.experience.map((exp, index) => (
                                    <div key={index} className="flex gap-4">
                                        <Briefcase className="h-8 w-8 text-cyan-400 flex-shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-lg text-white">{exp.role}</h4>
                                            <p className="font-semibold text-slate-300">{exp.company}</p>
                                            <p className="text-sm text-slate-400 my-1">{exp.startDate} - {exp.endDate || 'Present'}</p>
                                            <p className="text-slate-300 whitespace-pre-wrap">{exp.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <GraduationCap /> {t('education')}
                            </h3>
                            <div className="space-y-4">
                                {userProfile.education.map((edu, index) => (
                                    <div key={index} className="flex gap-4">
                                        <GraduationCap className="h-8 w-8 text-cyan-400 flex-shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-lg text-white">{edu.institutionName}</h4>
                                            <p className="font-semibold text-slate-300">{edu.degreeType} in {edu.fieldOfStudy}</p>
                                            <p className="text-sm text-slate-400 mt-1">{edu.startDate} - {edu.endDate}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <InfoRow icon={<Languages size={20} />} label={t('languagesSpoken')} value={userProfile.languages} />
                        <InfoRow icon={<Building2 size={20} />} label={t('primaryIndustries')} value={userProfile.industries} />
                        <InfoRow icon={<Sparkles size={20} />} label={t('stepInterests')} value={userProfile.interests} />
                    </div>
                );
        }
    };

    const tabs = [
        { key: 'About', label: t('about') },
        { key: 'Activity', label: t('activity') },
    ];
    if (isCurrentUser) {
        tabs.splice(2, 0, { key: 'Analytics', label: 'Analytics' });
    }
    if (isCurrentUser && userProfile.tier !== 'Standard') {
        tabs.push({ key: 'AI Studio', label: t('aiStudio') });
    }


    return (
        <>
            <ImageEditorModal
                isOpen={isImageEditorOpen}
                onClose={() => setIsImageEditorOpen(false)}
                onSave={handleImageSave}
                imageUrl={imageToEdit.url}
                title={imageToEdit.type === 'cover' ? t('editCoverImage') : t('editProfilePhoto')}
            />
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                    <div className="relative">
                        <div className="h-48 bg-slate-700 rounded-t-2xl relative group">
                            {editedProfile.coverImageUrl && (
                                <img src={editedProfile.coverImageUrl} alt="Cover" className="w-full h-full object-cover rounded-t-2xl" />
                            )}
                            {isEditing && (
                                <button onClick={() => openImageEditor('cover')} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera size={24} />
                                    <span className="ml-2 font-semibold">{t('editCoverImage')}</span>
                                </button>
                            )}
                        </div>
                        
                        <div className="absolute -bottom-12 left-6">
                            <div className="relative group">
                                <img 
                                    src={editedProfile.profileImageUrl || `https://i.pravatar.cc/150?u=${editedProfile.ssoEmail}`} 
                                    alt={editedProfile.fullName} 
                                    className="h-24 w-24 rounded-full border-4 border-slate-900 object-cover bg-slate-700" 
                                />
                                {isEditing && (
                                    <button onClick={() => openImageEditor('profile')} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                         <button onClick={triggerClose} className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="pt-16 px-6 pb-4 border-b border-slate-800 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{editedProfile.fullName}</h2>
                            <p className="text-base text-slate-400">{editedProfile.jobTitle}</p>
                        </div>
                         {isCurrentUser && !isEditing && (
                           <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 font-semibold rounded-lg hover:bg-slate-700 transition-colors text-sm">
                                <Edit size={16}/> {t('editProfile')}
                           </button>
                        )}
                    </div>


                    <div className="border-b border-slate-800 px-6">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto">
                            {tabs.map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
                                    {tab.key === 'AI Studio' && <Bot size={16} />}
                                    {tab.key === 'Analytics' && <BarChart2 size={16} />}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6 max-h-[50vh] overflow-y-auto">
                        {renderTabContent()}
                    </div>

                    {isEditing && (
                        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end gap-4">
                            <button onClick={handleCancelEdit} className="px-6 py-2 text-slate-300 font-semibold rounded-lg hover:bg-slate-800">{t('cancel')}</button>
                            <button onClick={handleSaveChanges} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700">{t('saveChanges')}</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};