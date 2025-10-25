import React, { useState } from 'react';
import { Fingerprint, CheckCircle, Loader } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface Step4Props {
  onEnable: () => void;
  onComplete: () => void;
}

export const Step4Biometrics: React.FC<Step4Props> = ({ onEnable, onComplete }) => {
    const [status, setStatus] = useState<'idle' | 'enabling' | 'enabled'>('idle');
    const { t } = useTranslation();

    const handleEnable = () => {
        setStatus('enabling');
        // Simulate device API call for WebAuthn
        setTimeout(() => {
            onEnable();
            setStatus('enabled');
            setTimeout(() => {
                onComplete();
            }, 1000); // Wait a moment on the success message before proceeding
        }, 1500);
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div className="text-center flex flex-col items-center justify-center h-full max-w-md mx-auto">
            {status === 'enabled' ? (
                <>
                    <CheckCircle className="h-24 w-24 text-green-400" />
                    <h2 className="text-3xl font-extrabold text-white mt-6">{t('biometricsEnabled')}</h2>
                    <p className="text-slate-300 mt-2">
                        You can now log in instantly and securely.
                    </p>
                </>
            ) : status === 'enabling' ? (
                 <>
                    <Loader className="h-24 w-24 text-cyan-400 animate-spin" />
                    <h2 className="text-3xl font-extrabold text-white mt-6">{t('biometricsEnabling')}</h2>
                    <p className="text-slate-300 mt-2">
                        Please follow the prompts from your device to set up biometric authentication.
                    </p>
                </>
            ) : (
                <>
                    <Fingerprint className="h-24 w-24 text-cyan-400" />
                    <h2 className="text-3xl font-extrabold text-white mt-6">{t('biometricsTitle')}</h2>
                    <p className="text-slate-300 mt-2">
                        {t('biometricsSubtitle')}
                    </p>
                    <div className="mt-8 w-full space-y-4">
                        <button 
                            onClick={handleEnable}
                            className="w-full px-8 py-4 bg-cyan-600 text-white font-bold rounded-lg shadow-md hover:bg-cyan-700 transition-all duration-300 text-lg"
                        >
                            {t('enableBiometrics')}
                        </button>
                        <button 
                            onClick={handleSkip}
                            className="w-full px-8 py-3 text-slate-400 font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            {t('skipForNow')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};