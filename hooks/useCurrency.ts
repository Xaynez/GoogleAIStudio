import { useMemo } from 'react';
import { useTranslation } from '../i18n';
import { MOCK_EXCHANGE_RATES } from '../constants';

export const useCurrency = () => {
    const { locale } = useTranslation();

    const formatCurrency = useMemo(() => {
        return (amount: number, fromCurrency: 'USD' = 'USD') => {
            const toCurrency = locale.currency;
            
            if (fromCurrency === toCurrency) {
                return new Intl.NumberFormat(locale.code, {
                    style: 'currency',
                    currency: toCurrency,
                    notation: 'compact',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 1,
                }).format(amount);
            }
            
            // Perform conversion
            const rate = MOCK_EXCHANGE_RATES[toCurrency] / MOCK_EXCHANGE_RATES[fromCurrency];
            const convertedAmount = amount * rate;
            
            return new Intl.NumberFormat(locale.code, {
                style: 'currency',
                currency: toCurrency,
                notation: 'compact',
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
            }).format(convertedAmount);
        };
    }, [locale]);

    return { formatCurrency };
};
