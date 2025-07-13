// Hooks React pour interagir avec FanStock
import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACT_ADDRESSES, FACTORY_ABI, CLUB_TOKEN_ABI } from '../contractConfig';

// Hook pour la Factory
export function useFactory() {
  // Lire le nombre total de clubs
  const { data: totalClubs } = useContractRead({
    address: CONTRACT_ADDRESSES.FACTORY,
    abi: FACTORY_ABI,
    functionName: 'getTotalClubs',
  });

  // Lire les frais de factory
  const { data: factoryFee } = useContractRead({
    address: CONTRACT_ADDRESSES.FACTORY,
    abi: FACTORY_ABI,
    functionName: 'factoryFee',
  });

  // Créer un nouveau club
  const { data: createTx, write: createClub, isLoading: isCreating } = useContractWrite({
    address: CONTRACT_ADDRESSES.FACTORY,
    abi: FACTORY_ABI,
    functionName: 'createClubToken',
  });

  // Attendre la confirmation de création
  const { isLoading: isWaitingCreation } = useWaitForTransaction({
    hash: createTx?.hash,
  });

  return {
    totalClubs: totalClubs ? Number(totalClubs) : 0,
    factoryFee: factoryFee ? formatEther(factoryFee) : '0',
    createClub,
    isCreating: isCreating || isWaitingCreation,
  };
}

// Hook pour récupérer la liste des clubs
export function useClubList() {
  const { totalClubs } = useFactory();
  
  const { data: clubAddresses } = useContractRead({
    address: CONTRACT_ADDRESSES.FACTORY,
    abi: FACTORY_ABI,
    functionName: 'getClubs',
    args: [0, totalClubs], // Récupérer tous les clubs
    enabled: totalClubs > 0,
  });

  return {
    clubAddresses: clubAddresses || [],
    totalClubs,
  };
}

// Hook pour un club spécifique
export function useClub(clubAddress) {
  // Informations de base du club
  const { data: clubName } = useContractRead({
    address: clubAddress,
    abi: CLUB_TOKEN_ABI,
    functionName: 'clubName',
    enabled: !!clubAddress,
  });

  const { data: tokenName } = useContractRead({
    address: clubAddress,
    abi: CLUB_TOKEN_ABI,
    functionName: 'name',
    enabled: !!clubAddress,
  });

  const { data: tokenPrice } = useContractRead({
    address: clubAddress,
    abi: CLUB_TOKEN_ABI,
    functionName: 'tokenPrice',
    enabled: !!clubAddress,
  });

  // Statistiques du club
  const { data: clubStats } = useContractRead({
    address: clubAddress,
    abi: CLUB_TOKEN_ABI,
    functionName: 'getClubStats',
    enabled: !!clubAddress,
  });

  // Acheter des tokens
  const { data: buyTx, write: buyTokens, isLoading: isBuying } = useContractWrite({
    address: clubAddress,
    abi: CLUB_TOKEN_ABI,
    functionName: 'buyTokens',
  });

  // Distribuer des revenus
  const { data: distributeTx, write: distributeRevenue, isLoading: isDistributing } = useContractWrite({
    address: clubAddress,
    abi: CLUB_TOKEN_ABI,
    functionName: 'distributeRevenue',
  });

  // Réclamer des revenus
  const { data: claimTx, write: claimRevenue, isLoading: isClaiming } = useContractWrite({
    address: clubAddress,
    abi: CLUB_TOKEN_ABI,
    functionName: 'claimRevenue',
  });

  return {
    // Infos
    clubName,
    tokenName,
    tokenPrice: tokenPrice ? formatEther(tokenPrice) : '0',
    
    // Stats
    tokensSold: clubStats ? Number(clubStats[0]) : 0,
    totalRevenue: clubStats ? formatEther(clubStats[1]) : '0',
    totalDistributed: clubStats ? formatEther(clubStats[2]) : '0',
    proposalCount: clubStats ? Number(clubStats[3]) : 0,
    saleActive: clubStats ? clubStats[4] : false,
    
    // Actions
    buyTokens: (amount, value) => buyTokens({
      args: [amount],
      value: parseEther(value),
    }),
    distributeRevenue: (value) => distributeRevenue({
      value: parseEther(value),
    }),
    claimRevenue,
    
    // Loading states
    isBuying,
    isDistributing,
    isClaiming,
  };
}

// Hook pour les tokens d'un utilisateur
export function useUserTokens(clubAddress, userAddress) {
  const { data: balance } = useContractRead({
    address: clubAddress,
    abi: CLUB_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
    enabled: !!clubAddress && !!userAddress,
  });

  const { data: claimableRevenue } = useContractRead({
    address: clubAddress,
    abi: CLUB_TOKEN_ABI,
    functionName: 'getClaimableRevenue',
    args: [userAddress],
    enabled: !!clubAddress && !!userAddress,
  });

  return {
    balance: balance ? formatEther(balance) : '0',
    claimableRevenue: claimableRevenue ? formatEther(claimableRevenue) : '0',
  };
}

// Hook pour la gouvernance
export function useGovernance(clubAddress) {
  const { data: proposalCount } = useContractRead({
    address: clubAddress,
    abi: CLUB_TOKEN_ABI,
    functionName: 'proposalCount',
    enabled: !!clubAddress,
  });

  // Créer une proposition
  const { data: proposalTx, write: createProposal, isLoading: isCreatingProposal } = useContractWrite({
    address: clubAddress,
    abi: CLUB_TOKEN_ABI,
    functionName: 'createProposal',
  });

  // Voter
  const { data: voteTx, write: vote, isLoading: isVoting } = useContractWrite({
    address: clubAddress,
    abi: CLUB_TOKEN_ABI,
    functionName: 'vote',
  });

  return {
    proposalCount: proposalCount ? Number(proposalCount) : 0,
    createProposal: (description) => createProposal({
      args: [description],
    }),
    vote: (proposalId, support) => vote({
      args: [proposalId, support],
    }),
    isCreatingProposal,
    isVoting,
  };
}

// Hook pour récupérer le prix CHZ/EUR
export function useChzPrice() {
  const [price, setPrice] = useState(0.034); // Valeur par défaut
  
  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=chiliz&vs_currencies=eur')
      .then(res => res.json())
      .then(data => {
        if (data.chiliz?.eur) {
          setPrice(data.chiliz.eur);
        }
      })
      .catch(() => {
        // Garder le prix par défaut en cas d'erreur
      });
  }, []);

  return price;
}