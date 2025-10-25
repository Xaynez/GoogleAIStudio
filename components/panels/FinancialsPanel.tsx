
import React, { useState, useMemo } from 'react';
import type { PriceConverted } from '../../types';
import { DollarSign, BarChart2, ChevronsUpDown } from 'lucide-react';
import { Card } from '../common/Card';
import { CURRENCIES } from '../../constants';

interface FinancialsPanelProps {
  priceOriginal: number;
  currency: string;
  priceConverted: PriceConverted;
  predictedROI: string;
}

export const FinancialsPanel: React.FC<FinancialsPanelProps> = ({ priceOriginal, currency, priceConverted, predictedROI }) => {
  const [targetCurrency, setTargetCurrency] = useState('EUR');

  const convertedAmount = useMemo(() => {
    return priceConverted[targetCurrency] || 0;
  }, [targetCurrency, priceConverted]);

  return (
    <Card title="Financial Overview" icon={<DollarSign className="h-6 w-6" />}>
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-slate-300 mb-2">Asking Price</h4>
          <p className="text-3xl font-bold text-white">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(priceOriginal)}
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-slate-300 mb-2">Currency Converter</h4>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <p className="text-2xl font-semibold text-cyan-400">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: targetCurrency }).format(convertedAmount)}
              </p>
            </div>
            <div className="relative">
              <select
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="appearance-none w-full bg-slate-800 border border-slate-700 text-slate-200 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {CURRENCIES.filter(c => c !== currency).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronsUpDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-300 mb-2">Predicted ROI</h4>
          <div className="flex items-center space-x-2 bg-slate-800/50 p-3 rounded-lg">
            <BarChart2 className="h-5 w-5 text-green-400" />
            <p className="text-slate-100 font-medium">{predictedROI}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
