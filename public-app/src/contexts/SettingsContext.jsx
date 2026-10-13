import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsService } from '../services/index.js';

export const SettingsContext = createContext(null);

const FALLBACK = {
  brand: { name: 'LibraDesk', tagline: 'Manage Your Library. Grow Your Business.', supportEmail: 'team@balochdev.com', supportPhone: '03158750992', address: '' },
  subscription: { currency: 'PKR', currencySymbol: 'Rs.', trialMonths: 1, registrationFee: 2000, priceMonthly: 1000, priceYearly: 10000, yearlyDiscountPercent: 17, gracePeriodDays: 7, billingCycleMonths: 1 },
  registration: { requireAdminApproval: true, allowPublicDiscovery: true },
  marketing: { showLiveStats: true, supportHours: '' },
  maintenance: { enabled: false, message: '' },
};

/**
 * Platform configuration (brand, pricing, trial length) loaded from the API.
 * Pricing and trial length are NEVER hardcoded in components — this provider is
 * the single source the landing page, pricing section and registration form read.
 */
export function SettingsProvider({ children }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['settings', 'public'],
    queryFn: () => settingsService.public(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const value = useMemo(() => {
    const settings = data?.data || FALLBACK;
    return {
      settings,
      brand: settings.brand || FALLBACK.brand,
      subscription: settings.subscription || FALLBACK.subscription,
      registration: settings.registration || FALLBACK.registration,
      marketing: settings.marketing || FALLBACK.marketing,
      maintenance: settings.maintenance || FALLBACK.maintenance,
      currency: settings.subscription || FALLBACK.subscription,
      isOfflineFallback: isError && !data,
      isLoading,
    };
  }, [data, isLoading, isError]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettingsContext = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
};
