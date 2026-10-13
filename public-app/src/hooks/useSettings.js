import { useSettingsContext } from '../contexts/SettingsContext.jsx';

/** Platform brand + pricing configuration (backend-driven). */
export const useSettings = () => useSettingsContext();

export const useCurrency = () => {
  const { subscription } = useSettingsContext();
  return { code: subscription.currency, symbol: subscription.currencySymbol };
};
