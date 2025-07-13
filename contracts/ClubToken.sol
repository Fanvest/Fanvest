// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ClubToken
 * @dev Individual token contract for each football club
 * Core concept: 10,000 tokens @ 1€ each
 * - Fans get configurable revenues (0-15%) and voting power (10-49%)
 * - Club gets remaining revenues (85-100%) and voting power (51-90%) + veto
 */
contract ClubToken is ERC20, Ownable, ReentrancyGuard {
    
    // Constants
    uint256 public constant TOTAL_SUPPLY = 10_000;
    uint256 public constant MIN_FAN_REVENUE_SHARE = 0; // Minimum 0% for fans
    uint256 public constant MAX_FAN_REVENUE_SHARE = 15; // Maximum 15% for fans
    uint256 public constant MIN_FAN_VOTING_POWER = 10; // Minimum 10% for fans
    uint256 public constant MAX_FAN_VOTING_POWER = 49; // Maximum 49% for fans
    
    // Configurable revenue and voting power
    uint256 public fanRevenueShare; // Set by club at creation (0-15%)
    uint256 public clubRevenueShare; // Automatically calculated (85-100%)
    uint256 public fanVotingPower; // Set by club at creation (10-49%)
    uint256 public clubVotingPower; // Automatically calculated (51-90%)
    
    // Club information
    string public clubName;
    address public clubWallet;
    
    // Token sale state
    uint256 public tokenPrice; // Price per token in wei
    uint256 public tokensSold;
    bool public saleActive;
    
    // Revenue tracking
    uint256 public totalRevenueReceived;
    uint256 public totalRevenueDistributed;
    uint256 public revenuePerToken; // Revenue per token for dividend calculations
    mapping(address => uint256) public lastClaimedRevenue; // Track last claimed revenue per token for each holder
    
    // Governance
    struct Proposal {
        uint256 id;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 deadline;
        bool executed;
        bool clubVetoed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 paid);
    event RevenueReceived(uint256 amount, uint256 fanShare, uint256 clubShare);
    event RevenuesClaimed(address indexed fan, uint256 amount);
    event ProposalCreated(uint256 indexed proposalId, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, bool approved);
    event ClubVeto(uint256 indexed proposalId);
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _clubName,
        uint256 _tokenPrice,
        address _clubWallet,
        uint256 _fanVotingPower,
        uint256 _fanRevenueShare
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        require(_fanVotingPower >= MIN_FAN_VOTING_POWER && _fanVotingPower <= MAX_FAN_VOTING_POWER, "Fan voting power must be between 10-49%");
        require(_fanRevenueShare >= MIN_FAN_REVENUE_SHARE && _fanRevenueShare <= MAX_FAN_REVENUE_SHARE, "Fan revenue share must be between 0-15%");
        
        clubName = _clubName;
        tokenPrice = _tokenPrice;
        clubWallet = _clubWallet;
        fanVotingPower = _fanVotingPower;
        clubVotingPower = 100 - _fanVotingPower;
        fanRevenueShare = _fanRevenueShare;
        clubRevenueShare = 100 - _fanRevenueShare;
        saleActive = true;
    }
    
    /**
     * @dev Buy tokens with ETH/CHZ
     * Anyone can buy tokens while sale is active
     */
    function buyTokens(uint256 amount) external payable nonReentrant {
        require(saleActive, "Token sale not active");
        require(amount > 0, "Amount must be positive");
        require(tokensSold + amount <= TOTAL_SUPPLY, "Exceeds max supply");
        
        uint256 cost = amount * tokenPrice;
        require(msg.value >= cost, "Insufficient payment");
        
        // Refund excess payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
        
        tokensSold += amount;
        
        // Set their last claimed revenue to current level (no retroactive dividends)
        lastClaimedRevenue[msg.sender] = revenuePerToken;
        
        // Mint tokens (1 token = 1e18 units for ERC20 compatibility)
        _mint(msg.sender, amount * 10**decimals());
        
        emit TokensPurchased(msg.sender, amount, cost);
    }
    
    /**
     * @dev Distribute revenue to the contract
     * Can be called by anyone sending revenue to the club
     */
    function distributeRevenue() external payable {
        require(msg.value > 0, "No revenue to distribute");
        require(tokensSold > 0, "No tokens sold yet");
        
        uint256 fanShare = (msg.value * fanRevenueShare) / 100;
        uint256 clubShare = msg.value - fanShare;
        
        // Update revenue tracking
        totalRevenueReceived += msg.value;
        revenuePerToken += fanShare / tokensSold; // Revenue per individual token
        
        // Send club's share immediately
        payable(clubWallet).transfer(clubShare);
        
        emit RevenueReceived(msg.value, fanShare, clubShare);
    }
    
    /**
     * @dev Claim accumulated revenue dividends
     */
    function claimRevenue() external nonReentrant {
        require(balanceOf(msg.sender) > 0, "No tokens owned");
        
        uint256 tokensOwned = balanceOf(msg.sender) / 10**decimals();
        uint256 unclaimed = revenuePerToken - lastClaimedRevenue[msg.sender];
        uint256 owed = tokensOwned * unclaimed;
        
        require(owed > 0, "No revenue to claim");
        
        lastClaimedRevenue[msg.sender] = revenuePerToken;
        totalRevenueDistributed += owed;
        
        payable(msg.sender).transfer(owed);
        
        emit RevenuesClaimed(msg.sender, owed);
    }
    
    /**
     * @dev Calculate claimable revenue for a holder
     */
    function getClaimableRevenue(address holder) external view returns (uint256) {
        if (balanceOf(holder) == 0) return 0;
        
        uint256 tokensOwned = balanceOf(holder) / 10**decimals();
        uint256 unclaimed = revenuePerToken - lastClaimedRevenue[holder];
        return tokensOwned * unclaimed;
    }
    
    /**
     * @dev Create a governance proposal (only token holders)
     */
    function createProposal(string memory description) external returns (uint256) {
        require(balanceOf(msg.sender) > 0, "Must own tokens to propose");
        require(bytes(description).length > 0, "Description required");
        
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        proposal.id = proposalCount;
        proposal.description = description;
        proposal.deadline = block.timestamp + 7 days; // 1 week voting period
        proposal.executed = false;
        proposal.clubVetoed = false;
        
        emit ProposalCreated(proposalCount, description);
        return proposalCount;
    }
    
    /**
     * @dev Vote on a proposal
     */
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp < proposal.deadline, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(balanceOf(msg.sender) > 0, "Must own tokens to vote");
        
        uint256 votingWeight = balanceOf(msg.sender) / 10**decimals();
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.forVotes += votingWeight;
        } else {
            proposal.againstVotes += votingWeight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, votingWeight);
    }
    
    /**
     * @dev Club can veto any proposal (30% power = veto right)
     */
    function clubVeto(uint256 proposalId) external {
        require(msg.sender == clubWallet || msg.sender == owner(), "Only club can veto");
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(!proposal.executed, "Already executed");
        require(!proposal.clubVetoed, "Already vetoed");
        
        proposal.clubVetoed = true;
        emit ClubVeto(proposalId);
    }
    
    /**
     * @dev Execute a proposal after voting period
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp >= proposal.deadline, "Voting still active");
        require(!proposal.executed, "Already executed");
        
        proposal.executed = true;
        
        // Check if proposal passes
        bool approved = false;
        if (!proposal.clubVetoed && proposal.forVotes > proposal.againstVotes) {
            // Simple majority of fan votes wins
            // unless club vetoed (club has veto power regardless of percentage)
            approved = true;
        }
        
        emit ProposalExecuted(proposalId, approved);
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 deadline,
        bool executed,
        bool clubVetoed
    ) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        
        return (
            proposal.id,
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.deadline,
            proposal.executed,
            proposal.clubVetoed
        );
    }
    
    /**
     * @dev End token sale (only owner/club)
     */
    function endSale() external onlyOwner {
        saleActive = false;
    }
    
    /**
     * @dev Update token price (only owner/club)
     */
    function updatePrice(uint256 newPrice) external onlyOwner {
        tokenPrice = newPrice;
    }
    
    /**
     * @dev Emergency withdrawal of sale funds (only owner)
     */
    function withdrawSaleFunds() external onlyOwner {
        uint256 saleFunds = tokensSold * tokenPrice;
        require(address(this).balance >= saleFunds, "Insufficient balance");
        payable(owner()).transfer(saleFunds);
    }
    
    /**
     * @dev Get basic club stats
     */
    function getClubStats() external view returns (
        uint256 _tokensSold,
        uint256 _totalRevenue,
        uint256 _totalDistributed,
        uint256 _proposalCount,
        bool _saleActive
    ) {
        return (
            tokensSold,
            totalRevenueReceived,
            totalRevenueDistributed,
            proposalCount,
            saleActive
        );
    }
    
    /**
     * @dev Accept direct payments as revenue
     */
    receive() external payable {
        if (msg.value > 0 && tokensSold > 0) {
            this.distributeRevenue{value: msg.value}();
        }
    }
}