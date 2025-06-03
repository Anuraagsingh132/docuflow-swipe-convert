import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types for application settings
interface SettingsContextType {
  usePdfApi: boolean;
  togglePdfApi: () => void;
  pdfApiKey: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for using PDF.co API integration
  const [usePdfApi, setUsePdfApi] = useState<boolean>(false);
  
  // PDF.co API key
  const pdfApiKey = "rockinitesh77@gmail.com_092yozuR6VffeyE0EZbXXJOwsFKsqVSD5vUGuF585IrCiPLTZAW9TmB1xvjO7DUU";
  
  // Toggle PDF API usage
  const togglePdfApi = () => {
    setUsePdfApi(prev => !prev);
  };
  
  // Initialize UnifiedPDFService with the current API setting
  useEffect(() => {
    // Dynamically import to avoid circular dependencies
    import('../services/unifiedPdfService').then(({ UnifiedPDFService }) => {
      UnifiedPDFService.setUseApiProcessing(usePdfApi);
    });
  }, [usePdfApi]);
  
  return (
    <SettingsContext.Provider value={{
      usePdfApi,
      togglePdfApi,
      pdfApiKey
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
