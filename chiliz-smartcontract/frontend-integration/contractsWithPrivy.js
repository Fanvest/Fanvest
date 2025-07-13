// Configuration pour utiliser vos contrats avec Privy
import { Contract } from 'ethers';

// Adresses de vos contrats déployés
export const CONTRACTS = {
  FACTORY_ADDRESS: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Remplacez par votre vraie adresse
  NETWORK_ID: 1337, // Hardhat local, changez pour Chiliz testnet (88882)
};

// ABIs simplifiés pour Privy
export const FACTORY_ABI = [
  "function createClubToken(string clubName, string tokenName, string tokenSymbol, address clubWallet, uint256 customPrice) external payable returns (address)",
  "function getClubToken(string clubName) external view returns (address)",
  "function getTotalClubs() external view returns (uint256)",
  "function getClubs(uint256 start, uint256 limit) external view returns (address[])",
  "function factoryFee() external view returns (uint256)",
  "event ClubTokenCreated(string indexed clubName, address indexed tokenAddress, address indexed clubWallet, string tokenName, string tokenSymbol)"
];

export const CLUB_TOKEN_ABI = [
  "function clubName() external view returns (string)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function tokenPrice() external view returns (uint256)",
  "function balanceOf(address) external view returns (uint256)",
  "function buyTokens(uint256 amount) external payable",
  "function getClubStats() external view returns (uint256, uint256, uint256, uint256, bool)",
  "function getClaimableRevenue(address) external view returns (uint256)",
  "function claimRevenue() external",
  "function createProposal(string description) external returns (uint256)",
  "function vote(uint256 proposalId, bool support) external",
  "function getProposal(uint256 proposalId) external view returns (uint256, string, uint256, uint256, uint256, bool, bool)"
];

// Hook pour utiliser les contrats avec Privy
export function useContracts() {
  const { ready, authenticated, user } = usePrivy();
  const { wallet } = useWallets();
  
  const [factoryContract, setFactoryContract] = useState(null);
  const [provider, setProvider] = useState(null);
  
  useEffect(() => {
    if (ready && authenticated && wallet) {
      const initContracts = async () => {
        try {
          // Obtenir le provider depuis Privy
          const ethersProvider = await wallet.getEthersProvider();
          const signer = ethersProvider.getSigner();
          
          // Créer le contrat Factory
          const factory = new Contract(CONTRACTS.FACTORY_ADDRESS, FACTORY_ABI, signer);
          
          setProvider(ethersProvider);
          setFactoryContract(factory);
          
        } catch (error) {
          console.error('Erreur init contrats:', error);
        }
      };
      
      initContracts();
    }
  }, [ready, authenticated, wallet]);
  
  // Fonction pour obtenir un contrat de club
  const getClubContract = (clubAddress) => {
    if (!provider) return null;
    return new Contract(clubAddress, CLUB_TOKEN_ABI, provider.getSigner());
  };
  
  return {
    factoryContract,
    getClubContract,
    provider,
    isReady: !!factoryContract,
  };
}