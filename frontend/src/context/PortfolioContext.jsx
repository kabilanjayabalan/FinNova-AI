import React, { createContext, useState, useContext } from 'react';
import { getPortfolios } from '../services/portfolioService';

export const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPortfolios = async () => {
    setLoading(true);
    try {
      const res = await getPortfolios();
      const data = res.data.data || [];
      setPortfolios(data);
      if (data.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(data[0]);
      }
    } catch (e) {
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortfolioContext.Provider value={{ portfolios, setPortfolios, selectedPortfolio, setSelectedPortfolio, loading, loadPortfolios }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
