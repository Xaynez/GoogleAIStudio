import React from 'react';
import type { OnboardingData, EducationEntry, DegreeType, ExperienceEntry } from '../../types';
import { Briefcase, GraduationCap, Languages as LanguagesIcon, Building2, Plus, Trash2, ChevronsUpDown, FileText, MapPin } from 'lucide-react';
import { LANGUAGES } from '../../constants';
import { useTranslation } from '../../i18n';

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Real Estate", "Manufacturing", "Energy", "Consulting", "Media"];
const DEGREE_TYPES: DegreeType[] = ['BA', 'Masters', 'PhD', 'Diploma', 'Micro-credential', 'Certificate'];

interface Step2Props {
  data: OnboardingData;
  updateData: (update: Partial<OnboardingData>) => void;
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

export const Step2Profile: React.FC<Step2Props> = ({ data, updateData }) => {
    const { t } = useTranslation();

    const handleEducationChange = (index: number, field: keyof EducationEntry, value: string) => {
        const newEducation = [...data.education];
        (newEducation[index] as any)[field] = value;
        updateData({ education: newEducation });
    };

    const addEducationEntry = () => {
        const newEducation = [...data.education, {
            degreeType: '',
            fieldOfStudy: '',
            institutionName: '',
            startDate: '',
            endDate: '',
        }];
        updateData({ education: newEducation });
    };

    const removeEducationEntry = (index: number) => {
        const newEducation = data.education.filter((_, i) => i !== index);
        updateData({ education: newEducation });
    };

    const handleExperienceChange = (index: number, field: keyof ExperienceEntry, value: string) => {
        const newExperience = [...data.experience];
        (newExperience[index] as any)[field] = value;
        updateData({ experience: newExperience });
    };

    const addExperienceEntry = () => {
        const newExperience = [...data.experience, {
            role: '',
            company: '',
            startDate: '',
            endDate: '',
            description: '',
        }];
        updateData({ experience: newExperience });
    };

    const removeExperienceEntry = (index: number) => {
        const newExperience = data.experience.filter((_, i) => i !== index);
        updateData({ experience: newExperience });
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">{t('profileEnrichmentTitle')}</h2>
            <p className="text-slate-400 mb-8">{t('profileEnrichmentSubtitle')}</p>
            
            <div className="space-y-6">
                {/* Job Title & Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-300 mb-2">{t('currentRole')}</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input 
                                type="text" 
                                id="jobTitle" 
                                value={data.jobTitle}
                                onChange={(e) => updateData({ jobTitle: e.target.value })}
                                placeholder="e.g., CEO, Founder"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-2">{t('company')}</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input 
                                type="text" 
                                id="company" 
                                value={data.company}
                                onChange={(e) => updateData({ company: e.target.value })}
                                placeholder="e.g., ACME Corporation"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                 <div>
                    <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-2">{t('location')}</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input 
                            type="text" 
                            id="location" 
                            value={data.location}
                            onChange={(e) => updateData({ location: e.target.value })}
                            placeholder="e.g., New York, NY"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Professional Summary */}
                <div>
                    <label htmlFor="summary" className="block text-sm font-medium text-slate-300 mb-2">{t('professionalSummary')}</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                        <textarea 
                            id="summary" 
                            value={data.summary.originalText}
                            onChange={(e) => updateData({ summary: { ...data.summary, originalText: e.target.value } })}
                            placeholder="A brief summary of your professional background, skills, and goals..."
                            rows={4}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y"
                        />
                    </div>
                </div>

                {/* Work Experience */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                        <Briefcase className="h-5 w-5" /> {t('workExperience')}
                    </label>
                    <div className="space-y-4">
                        {data.experience.map((entry, index) => (
                            <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-4 relative">
                                <button onClick={() => removeExperienceEntry(index)} title="Remove experience entry" className="absolute top-2 right-2 text-slate-500 hover:text-red-400 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-400">Role</label>
                                        <input type="text" value={entry.role} onChange={(e) => handleExperienceChange(index, 'role', e.target.value)} placeholder="e.g., Product Manager" className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-400">Company</label>
                                        <input type="text" value={entry.company} onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} placeholder="e.g., Tech Solutions Inc." className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <label className="text-xs font-medium text-slate-400">Start Date</label>
                                        <input type="month" value={entry.startDate} onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)} className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                    </div>
                                     <div>
                                        <label className="text-xs font-medium text-slate-400">End Date</label>
                                        <input type="month" value={entry.endDate} onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)} className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-400">Description</label>
                                    <textarea value={entry.description} onChange={(e) => handleExperienceChange(index, 'description', e.target.value)} placeholder="Briefly describe your responsibilities and achievements..." className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none resize-y" rows={3}></textarea>
                                </div>
                            </div>
                        ))}
                         <button onClick={addExperienceEntry} className="w-full flex items-center justify-center gap-2 text-sm py-2 px-4 bg-slate-800 text-cyan-400 font-semibold rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">
                            <Plus className="h-4 w-4" /> {t('addExperience')}
                        </button>
                    </div>
                </div>

                {/* Education */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" /> {t('education')}
                    </label>
                    <div className="space-y-4">
                        {data.education.map((entry, index) => (
                            <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-4 relative">
                                <button onClick={() => removeEducationEntry(index)} title="Remove education entry" className="absolute top-2 right-2 text-slate-500 hover:text-red-400 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-400">Degree Type</label>
                                        <div className="relative mt-1">
                                            <select
                                                value={entry.degreeType}
                                                onChange={(e) => handleEducationChange(index, 'degreeType', e.target.value)}
                                                className="w-full appearance-none bg-slate-700 border border-slate-600 rounded-md py-2 pl-3 pr-8 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                                            >
                                                <option value="" disabled>Select a degree</option>
                                                {DEGREE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                            <ChevronsUpDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-400">Major/Field of Study</label>
                                        <input 
                                            type="text" 
                                            value={entry.fieldOfStudy}
                                            onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                                            placeholder="e.g., Computer Science"
                                            className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-400">Institution Name</label>
                                    <input 
                                        type="text" 
                                        value={entry.institutionName}
                                        onChange={(e) => handleEducationChange(index, 'institutionName', e.target.value)}
                                        placeholder="e.g., University of Example"
                                        className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <label className="text-xs font-medium text-slate-400">Start Date</label>
                                        <input 
                                            type="month"
                                            value={entry.startDate}
                                            onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                                            className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                                        />
                                    </div>
                                     <div>
                                        <label className="text-xs font-medium text-slate-400">End Date</label>
                                        <input 
                                            type="month"
                                            value={entry.endDate}
                                            onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                                            className="w-full mt-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                         <button onClick={addEducationEntry} className="w-full flex items-center justify-center gap-2 text-sm py-2 px-4 bg-slate-800 text-cyan-400 font-semibold rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">
                            <Plus className="h-4 w-4" /> {t('addEducation')}
                        </button>
                    </div>
                </div>

                {/* Languages */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                        <LanguagesIcon className="h-5 w-5" /> {t('languagesSpoken')}
                    </label>
                    <MultiSelectChip 
                        options={LANGUAGES.map(l => l.name)}
                        selected={data.languages}
                        onChange={(selected) => updateData({ languages: selected })}
                    />
                </div>

                {/* Industries */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                        <Building2 className="h-5 w-5" /> {t('primaryIndustries')}
                    </label>
                     <MultiSelectChip 
                        options={INDUSTRIES}
                        selected={data.industries}
                        onChange={(selected) => updateData({ industries: selected })}
                    />
                </div>
            </div>
        </div>
    );
};