// Configuration des contrats pour le frontend
export const CONTRACT_ADDRESSES = {
  // Remplacez par vos vraies adresses après déploiement
  FACTORY: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  // Les adresses des clubs seront récupérées dynamiquement
};

export const FACTORY_ABI = [
  // Fonctions principales de la Factory
  "function createClubToken(string memory clubName, string memory tokenName, string memory tokenSymbol, address clubWallet, uint256 customPrice) external payable returns (address)",
  "function getClubToken(string memory clubName) external view returns (address)",
  "function clubExists(string memory clubName) external view returns (bool)",
  "function getTotalClubs() external view returns (uint256)",
  "function getClubByIndex(uint256 index) external view returns (address)",
  "function getClubs(uint256 start, uint256 limit) external view returns (address[] memory)",
  "function defaultTokenPrice() external view returns (uint256)",
  "function factoryFee() external view returns (uint256)",
  
  // Events
  "event ClubTokenCreated(string indexed clubName, address indexed tokenAddress, address indexed clubWallet, string tokenName, string tokenSymbol)"
];

export const CLUB_TOKEN_ABI = [
  // Token info
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function clubName() external view returns (string memory)",
  "function tokenPrice() external view returns (uint256)",
  "function clubWallet() external view returns (address)",
  "function TOTAL_SUPPLY() external view returns (uint256)",
  
  // Token operations
  "function buyTokens(uint256 amount) external payable",
  "function balanceOf(address account) external view returns (uint256)",
  "function getClubStats() external view returns (uint256 _tokensSold, uint256 _totalRevenue, uint256 _totalDistributed, uint256 _proposalCount, bool _saleActive)",
  
  // Revenue
  "function distributeRevenue() external payable",
  "function getClaimableRevenue(address holder) external view returns (uint256)",
  "function claimRevenue() external",
  
  // Governance
  "function createProposal(string memory description) external returns (uint256)",
  "function vote(uint256 proposalId, bool support) external",
  "function clubVeto(uint256 proposalId) external",
  "function getProposal(uint256 proposalId) external view returns (uint256 id, string memory description, uint256 forVotes, uint256 againstVotes, uint256 deadline, bool executed, bool clubVetoed)",
  "function proposalCount() external view returns (uint256)",
  
  // Events
  "event TokensPurchased(address indexed buyer, uint256 amount, uint256 paid)",
  "event RevenueReceived(uint256 amount, uint256 fanShare, uint256 clubShare)",
  "event RevenuesClaimed(address indexed fan, uint256 amount)",
  "event ProposalCreated(uint256 indexed proposalId, string description)",
  "event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight)"
];

// Configuration réseau
export const NETWORKS = {
  hardhat: {
    id: 1337,
    name: "Hardhat Local",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: "http://localhost:8545"
  },
  chilizTestnet: {
    id: 88882,
    name: "Chiliz Testnet",
    rpcUrl: "https://spicy-rpc.chiliz.com",
    blockExplorer: "https://testnet.chiliscan.com"
  }
};

// Prix et conversions
export const PRICE_CONFIG = {
  // API pour récupérer le prix CHZ/EUR
  COINGECKO_API: "https://api.coingecko.com/api/v3/simple/price?ids=chiliz&vs_currencies=eur",
  DEFAULT_CHZ_PRICE_EUR: 0.034, // Fallback
  TOKEN_DECIMALS: 18
};