// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FanStockToken is ERC20, Ownable, ReentrancyGuard {
    struct ClubInfo {
        string name;
        string location;
        uint256 foundedYear;
        string league;
    }
    
    struct TokenSale {
        uint256 pricePerToken; // Price in CHZ wei
        uint256 maxSupply;
        uint256 soldTokens;
        bool saleActive;
        uint256 minPurchase; // Minimum tokens to buy
        uint256 maxPurchase; // Maximum tokens per user
    }
    
    struct RevenueShare {
        uint256 playerSalesShare; // % of player sales (e.g., 20%)
        uint256 sponsorshipShare; // % of sponsorships (e.g., 15%)
        uint256 tournamentShare; // % of tournament winnings
        uint256 totalRevenue; // Total revenue collected
        uint256 totalDistributed; // Total already distributed
    }
    
    struct GovernanceProposal {
        uint256 id;
        string title;
        string description;
        ProposalType proposalType;
        uint256 amount; // For budget proposals
        string details; // Additional details (coach name, equipment specs, etc.)
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    enum ProposalType {
        COACH_HIRING,
        EQUIPMENT_PURCHASE,
        STADIUM_IMPROVEMENT,
        YOUTH_ACADEMY,
        COMMUNITY_PROGRAM,
        BUDGET_ALLOCATION
    }
    
    ClubInfo public clubInfo;
    TokenSale public tokenSale;
    RevenueShare public revenueShare;
    
    mapping(uint256 => GovernanceProposal) public proposals;
    mapping(address => uint256) public userPurchases; // Track purchases per user
    mapping(address => uint256) public pendingDividends; // Pending dividend claims
    
    uint256 public proposalCounter;
    uint256 public constant MIN_VOTING_PERIOD = 3 days;
    uint256 public constant MAX_VOTING_PERIOD = 14 days;
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event RevenueAdded(string source, uint256 amount);
    event DividendsDistributed(uint256 totalAmount, uint256 perToken);
    event DividendClaimed(address indexed holder, uint256 amount);
    event ProposalCreated(uint256 indexed proposalId, string title, ProposalType proposalType);
    event ProposalVoted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, bool approved);
    
    constructor(
        string memory _name,
        string memory _symbol,
        ClubInfo memory _clubInfo,
        TokenSale memory _tokenSale,
        RevenueShare memory _revenueShare
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        clubInfo = _clubInfo;
        tokenSale = _tokenSale;
        revenueShare = _revenueShare;
    }
    
    function buyTokens(uint256 _amount) external payable nonReentrant {
        require(tokenSale.saleActive, "Token sale not active");
        require(_amount >= tokenSale.minPurchase, "Below minimum purchase");
        require(userPurchases[msg.sender] + _amount <= tokenSale.maxPurchase, "Exceeds max purchase per user");
        require(tokenSale.soldTokens + _amount <= tokenSale.maxSupply, "Exceeds max supply");
        
        uint256 cost = _amount * tokenSale.pricePerToken;
        require(msg.value >= cost, "Insufficient payment");
        
        // Refund excess payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
        
        tokenSale.soldTokens += _amount;
        userPurchases[msg.sender] += _amount;
        
        _mint(msg.sender, _amount * 10**decimals());
        
        emit TokensPurchased(msg.sender, _amount, cost);
    }
    
    function addRevenue(string memory _source, uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be positive");
        revenueShare.totalRevenue += _amount;
        emit RevenueAdded(_source, _amount);
    }
    
    function distributeDividends() external onlyOwner nonReentrant {
        uint256 availableRevenue = revenueShare.totalRevenue - revenueShare.totalDistributed;
        require(availableRevenue > 0, "No revenue to distribute");
        require(totalSupply() > 0, "No tokens issued");
        
        uint256 dividendPerToken = availableRevenue / totalSupply();
        require(dividendPerToken > 0, "Dividend too small");
        
        // Update distributed amount
        uint256 totalDividends = dividendPerToken * totalSupply();
        revenueShare.totalDistributed += totalDividends;
        
        // We'll distribute to all holders proportionally
        // In a real implementation, you might use a merkle tree for gas efficiency
        emit DividendsDistributed(totalDividends, dividendPerToken);
    }
    
    function calculateDividends(address _holder) external view returns (uint256) {
        if (totalSupply() == 0 || balanceOf(_holder) == 0) return 0;
        
        uint256 availableRevenue = revenueShare.totalRevenue - revenueShare.totalDistributed;
        if (availableRevenue == 0) return 0;
        
        return (availableRevenue * balanceOf(_holder)) / totalSupply();
    }
    
    function claimDividends() external nonReentrant {
        uint256 dividends = this.calculateDividends(msg.sender);
        require(dividends > 0, "No dividends to claim");
        
        pendingDividends[msg.sender] = 0;
        payable(msg.sender).transfer(dividends);
        
        emit DividendClaimed(msg.sender, dividends);
    }
    
    function createProposal(
        string memory _title,
        string memory _description,
        ProposalType _proposalType,
        uint256 _amount,
        string memory _details,
        uint256 _votingDays
    ) external onlyOwner {
        require(_votingDays >= MIN_VOTING_PERIOD / 1 days && _votingDays <= MAX_VOTING_PERIOD / 1 days, "Invalid voting period");
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");
        
        proposalCounter++;
        GovernanceProposal storage proposal = proposals[proposalCounter];
        proposal.id = proposalCounter;
        proposal.title = _title;
        proposal.description = _description;
        proposal.proposalType = _proposalType;
        proposal.amount = _amount;
        proposal.details = _details;
        proposal.endTime = block.timestamp + (_votingDays * 1 days);
        proposal.executed = false;
        
        emit ProposalCreated(proposalCounter, _title, _proposalType);
    }
    
    function voteOnProposal(uint256 _proposalId, bool _support) external {
        GovernanceProposal storage proposal = proposals[_proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp < proposal.endTime, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(balanceOf(msg.sender) > 0, "Must own tokens to vote");
        
        uint256 votingWeight = balanceOf(msg.sender);
        proposal.hasVoted[msg.sender] = true;
        
        if (_support) {
            proposal.votesFor += votingWeight;
        } else {
            proposal.votesAgainst += votingWeight;
        }
        
        emit ProposalVoted(_proposalId, msg.sender, _support, votingWeight);
    }
    
    function executeProposal(uint256 _proposalId) external onlyOwner {
        GovernanceProposal storage proposal = proposals[_proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp >= proposal.endTime, "Voting still active");
        require(!proposal.executed, "Already executed");
        
        proposal.executed = true;
        bool approved = proposal.votesFor > proposal.votesAgainst;
        
        emit ProposalExecuted(_proposalId, approved);
    }
    
    function getProposalResults(uint256 _proposalId) external view returns (
        string memory title,
        string memory description,
        ProposalType proposalType,
        uint256 amount,
        string memory details,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 endTime,
        bool executed
    ) {
        GovernanceProposal storage proposal = proposals[_proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        
        return (
            proposal.title,
            proposal.description,
            proposal.proposalType,
            proposal.amount,
            proposal.details,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.endTime,
            proposal.executed
        );
    }
    
    function updateTokenSale(
        uint256 _pricePerToken,
        bool _saleActive,
        uint256 _minPurchase,
        uint256 _maxPurchase
    ) external onlyOwner {
        tokenSale.pricePerToken = _pricePerToken;
        tokenSale.saleActive = _saleActive;
        tokenSale.minPurchase = _minPurchase;
        tokenSale.maxPurchase = _maxPurchase;
    }
    
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    function getClubInfo() external view returns (ClubInfo memory) {
        return clubInfo;
    }
    
    function getTokenSaleInfo() external view returns (TokenSale memory) {
        return tokenSale;
    }
    
    function getRevenueInfo() external view returns (RevenueShare memory) {
        return revenueShare;
    }
    
    function hasUserVoted(uint256 _proposalId, address _user) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_user];
    }
    
    receive() external payable {
        // Accept direct payments as revenue
        revenueShare.totalRevenue += msg.value;
        emit RevenueAdded("Direct payment", msg.value);
    }
}