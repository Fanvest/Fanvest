// Hooks FanStock adaptés pour Privy
import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useContracts } from '../contractsWithPrivy';

// Hook pour la Factory
export function useFanStockFactory() {
  const { factoryContract } = useContracts();
  const [loading, setLoading] = useState(false);
  const [totalClubs, setTotalClubs] = useState(0);
  const [factoryFee, setFactoryFee] = useState('0');

  // Charger les données de base
  useEffect(() => {
    if (factoryContract) {
      loadFactoryData();
    }
  }, [factoryContract]);

  const loadFactoryData = async () => {
    try {
      const [clubs, fee] = await Promise.all([
        factoryContract.getTotalClubs(),
        factoryContract.factoryFee(),
      ]);
      
      setTotalClubs(clubs.toNumber());
      setFactoryFee(ethers.utils.formatEther(fee));
    } catch (error) {
      console.error('Erreur chargement factory:', error);
    }
  };

  // Créer un nouveau club
  const createClub = async (clubData) => {
    if (!factoryContract) throw new Error('Contrat non initialisé');
    
    setLoading(true);
    try {
      const { clubName, tokenName, tokenSymbol, priceInChz } = clubData;
      
      // Obtenir l'adresse du wallet pour le club
      const { user } = usePrivy();
      const clubWallet = user.wallet.address;
      
      const priceWei = ethers.utils.parseEther(priceInChz.toString());
      const feeWei = ethers.utils.parseEther(factoryFee);
      
      const tx = await factoryContract.createClubToken(
        clubName,
        tokenName,
        tokenSymbol,
        clubWallet,
        priceWei,
        { value: feeWei }
      );
      
      const receipt = await tx.wait();
      
      // Extraire l'adresse du nouveau token depuis les events
      const event = receipt.events?.find(e => e.event === 'ClubTokenCreated');
      const newTokenAddress = event?.args?.tokenAddress;
      
      await loadFactoryData(); // Recharger les données
      
      return { success: true, tokenAddress: newTokenAddress, tx: receipt };
      
    } catch (error) {
      console.error('Erreur création club:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la liste des clubs
  const getClubsList = async (start = 0, limit = 10) => {
    if (!factoryContract) return [];
    
    try {
      const clubAddresses = await factoryContract.getClubs(start, limit);
      return clubAddresses;
    } catch (error) {
      console.error('Erreur récupération clubs:', error);
      return [];
    }
  };

  return {
    totalClubs,
    factoryFee,
    loading,
    createClub,
    getClubsList,
    reload: loadFactoryData,
  };
}

// Hook pour un club spécifique
export function useClub(clubAddress) {
  const { getClubContract } = useContracts();
  const { user } = usePrivy();
  
  const [clubData, setClubData] = useState({
    name: '',
    tokenName: '',
    tokenPrice: '0',
    tokensSold: 0,
    totalRevenue: '0',
    proposalCount: 0,
    saleActive: false,
  });
  
  const [userTokens, setUserTokens] = useState({
    balance: '0',
    claimableRevenue: '0',
  });
  
  const [loading, setLoading] = useState(false);

  // Charger les données du club
  const loadClubData = async () => {
    if (!clubAddress) return;
    
    try {
      const contract = getClubContract(clubAddress);
      if (!contract) return;

      const [name, tokenName, price, stats] = await Promise.all([
        contract.clubName(),
        contract.name(),
        contract.tokenPrice(),
        contract.getClubStats(),
      ]);

      setClubData({
        name,
        tokenName,
        tokenPrice: ethers.utils.formatEther(price),
        tokensSold: stats[0].toNumber(),
        totalRevenue: ethers.utils.formatEther(stats[1]),
        proposalCount: stats[3].toNumber(),
        saleActive: stats[4],
      });

      // Charger les données utilisateur si connecté
      if (user?.wallet?.address) {
        const [balance, claimable] = await Promise.all([
          contract.balanceOf(user.wallet.address),
          contract.getClaimableRevenue(user.wallet.address),
        ]);

        setUserTokens({
          balance: ethers.utils.formatEther(balance),
          claimableRevenue: ethers.utils.formatEther(claimable),
        });
      }

    } catch (error) {
      console.error('Erreur chargement club:', error);
    }
  };

  useEffect(() => {
    loadClubData();
  }, [clubAddress, user]);

  // Acheter des tokens
  const buyTokens = async (amount) => {
    if (!clubAddress || !amount) return { success: false };
    
    setLoading(true);
    try {
      const contract = getClubContract(clubAddress);
      const cost = ethers.utils.parseEther((amount * parseFloat(clubData.tokenPrice)).toString());
      
      const tx = await contract.buyTokens(amount, { value: cost });
      const receipt = await tx.wait();
      
      await loadClubData(); // Recharger les données
      
      return { success: true, tx: receipt };
      
    } catch (error) {
      console.error('Erreur achat tokens:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Réclamer les revenus
  const claimRevenue = async () => {
    if (!clubAddress) return { success: false };
    
    setLoading(true);
    try {
      const contract = getClubContract(clubAddress);
      const tx = await contract.claimRevenue();
      const receipt = await tx.wait();
      
      await loadClubData(); // Recharger les données
      
      return { success: true, tx: receipt };
      
    } catch (error) {
      console.error('Erreur réclamation revenus:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Distribuer des revenus (pour le club)
  const distributeRevenue = async (amount) => {
    if (!clubAddress || !amount) return { success: false };
    
    setLoading(true);
    try {
      const contract = getClubContract(clubAddress);
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      const tx = await contract.distributeRevenue({ value: amountWei });
      const receipt = await tx.wait();
      
      await loadClubData(); // Recharger les données
      
      return { success: true, tx: receipt };
      
    } catch (error) {
      console.error('Erreur distribution revenus:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    ...clubData,
    ...userTokens,
    loading,
    actions: {
      buyTokens,
      claimRevenue,
      distributeRevenue,
      reload: loadClubData,
    },
  };
}

// Hook pour récupérer le prix CHZ/EUR
export function useChzPrice() {
  const [price, setPrice] = useState(0.034);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=chiliz&vs_currencies=eur');
        const data = await response.json();
        
        if (data.chiliz?.eur) {
          setPrice(data.chiliz.eur);
        }
      } catch (error) {
        console.error('Erreur récupération prix CHZ:', error);
        // Garder le prix par défaut
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    
    // Actualiser toutes les 5 minutes
    const interval = setInterval(fetchPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { price, loading };
}