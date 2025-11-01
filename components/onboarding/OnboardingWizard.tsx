import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { OnboardingData } from '../../types';
import { StepIndicator } from './StepIndicator';
import { Step1Verification } from './Step1_Verification';
import { Step2_Legal } from './Step2_Legal';
import { Step2Profile } from './Step2_Profile';
import { Step3Interests } from './Step3_Interests';
import { Step4Biometrics } from './Step4_Biometrics';
import { Step5Complete } from './Step5_Complete';
import { useTranslation } from '../../i18n';


interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
  onEnableBiometrics: () => void;
}

const TOTAL_STEPS = 6;

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose, onComplete, onEnableBiometrics }) => {
  const { t, locale } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    idType: null,
    idFrontPhoto: null,
    idBackPhoto: null,
    selfieVerified: false,
    ssoEmail: '',
    jobTitle: '',
    company: '',
    location: '',
    summary: { originalLang: locale.code, originalText: '' },
    education: [],
    experience: [],
    languages: [],
    industries: [],
    interests: [],
    termsAccepted: false,
    privacyAccepted: false,
    governanceAccepted: false,
  });
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setIsClosing(false);
    }
  }, [isOpen]);

  const updateData = (update: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...update }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
        onComplete(data); // Finish on the last step
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const triggerClose = () => {
      setIsClosing(true);
      setTimeout(() => {
          onClose();
          // Reset state for next time it opens
          setCurrentStep(1); 
      }, 300); // Match animation duration
  };

  const isNextDisabled = () => {
    switch (currentStep) {
        case 1:
            const needsBackPhoto = data.idType === 'driversLicense' || data.idType === 'nationalId';
            return !data.fullName
                || !data.idType
                || !data.idFrontPhoto
                || (needsBackPhoto && !data.idBackPhoto)
                || !data.selfieVerified
                || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ssoEmail);
        case 2:
            return !data.termsAccepted || !data.privacyAccepted || !data.governanceAccepted;
        case 3:
            const isEducationInvalid = data.education.length === 0 || 
                data.education.some(edu => !edu.institutionName || !edu.degreeType || !edu.fieldOfStudy);
            const isExperienceInvalid = data.experience.length === 0 ||
                data.experience.some(exp => !exp.role || !exp.company);
            return !data.jobTitle || !data.summary.originalText || !data.company || !data.location || isEducationInvalid || isExperienceInvalid || data.languages.length === 0 || data.industries.length === 0;
        case 4:
            return data.interests.length === 0;
        case 5:
            return false; // Biometrics step is optional
        default:
            return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-bold text-white">{t('onboardingTitle')}</h2>
            <button onClick={triggerClose} title="Close onboarding" className="text-slate-400 hover:text-white transition-colors rounded-full p-1">
                <X className="h-6 w-6" />
            </button>
        </div>
        
        <div className="p-6 flex-shrink-0">
            <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>

        <div className="flex-grow p-6 overflow-y-auto">
            {currentStep === 1 && <Step1Verification data={data} updateData={updateData} />}
            {currentStep === 2 && <Step2_Legal data={data} updateData={updateData} />}
            {currentStep === 3 && <Step2Profile data={data} updateData={updateData} />}
            {currentStep === 4 && <Step3Interests data={data} updateData={updateData} />}
            {currentStep === 5 && <Step4Biometrics onEnable={onEnableBiometrics} onComplete={nextStep} />}
            {currentStep === 6 && <Step5Complete name={data.fullName} />}
        </div>
        
        <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center flex-shrink-0">
            <button 
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {t('back')}
            </button>
            <button 
                onClick={nextStep}
                disabled={isNextDisabled()}
                className="px-8 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300"
            >
                {currentStep === TOTAL_STEPS ? t('finish') : t('next')}
            </button>
        </div>
      </div>
    </div>
  );
};