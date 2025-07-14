// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ClubToken is ERC20, Ownable, ReentrancyGuard {
    
    string public clubName;
    uint256 public tokenPrice;
    address public clubWallet;
    uint256 public fanVotingPower;
    uint256 public fanRevenueShare;
    
    uint256 public constant MIN_FAN_VOTING_POWER = 10;
    uint256 public constant MAX_FAN_VOTING_POWER = 49;
    uint256 public constant MIN_FAN_REVENUE_SHARE = 0;
    uint256 public constant MAX_FAN_REVENUE_SHARE = 15;
    
    uint256 public totalRevenue;
    uint256 public lastRevenueDistribution;
    uint256 public proposalCount;
    
    struct Proposal {
        uint256 id;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 deadline;
        bool executed;
        bool vetoed;
        address proposer;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public claimableRevenue;
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 totalCost);
    event RevenueAdded(uint256 amount, uint256 newTotal);
    event RevenueDistributed(uint256 fanShare, uint256 clubShare);
    event RevenueClaimed(address indexed claimer, uint256 amount);
    event ProposalCreated(uint256 indexed proposalId, string description, address proposer);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalVetoed(uint256 indexed proposalId);

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
        require(_clubWallet != address(0), "Club wallet cannot be zero address");
        require(_tokenPrice > 0, "Token price must be greater than 0");
        
        clubName = _clubName;
        tokenPrice = _tokenPrice;
        clubWallet = _clubWallet;
        fanVotingPower = _fanVotingPower;
        fanRevenueShare = _fanRevenueShare;
    }
    
    function buyTokens(uint256 _amount) external payable nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        uint256 totalCost = _amount * tokenPrice;
        require(msg.value >= totalCost, "Insufficient payment");
        
        _mint(msg.sender, _amount);
        
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TokensPurchased(msg.sender, _amount, totalCost);
    }
    
    function addRevenue() external payable onlyOwner {
        require(msg.value > 0, "Revenue must be greater than 0");
        totalRevenue += msg.value;
        emit RevenueAdded(msg.value, totalRevenue);
    }
    
    function distributeRevenue() external onlyOwner nonReentrant {
        require(totalRevenue > lastRevenueDistribution, "No new revenue to distribute");
        
        uint256 newRevenue = totalRevenue - lastRevenueDistribution;
        uint256 fanShare = (newRevenue * fanRevenueShare) / 100;
        uint256 clubShare = newRevenue - fanShare;
        
        if (fanShare > 0 && totalSupply() > 0) {
            uint256 revenuePerToken = fanShare / totalSupply();
            
            // Note: In a production environment, you'd want to implement a more efficient
            // distribution mechanism to avoid gas limit issues with many token holders
        }
        
        if (clubShare > 0) {
            payable(clubWallet).transfer(clubShare);
        }
        
        lastRevenueDistribution = totalRevenue;
        emit RevenueDistributed(fanShare, clubShare);
    }
    
    function claimRevenue() external nonReentrant {
        uint256 amount = claimableRevenue[msg.sender];
        require(amount > 0, "No revenue to claim");
        
        claimableRevenue[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        
        emit RevenueClaimed(msg.sender, amount);
    }
    
    function createProposal(string memory _description) external returns (uint256) {
        require(balanceOf(msg.sender) > 0, "Must hold tokens to create proposals");
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.description = _description;
        proposal.deadline = block.timestamp + 7 days;
        proposal.proposer = msg.sender;
        
        emit ProposalCreated(proposalId, _description, msg.sender);
        return proposalId;
    }
    
    function vote(uint256 _proposalId, bool _support) external {
        require(balanceOf(msg.sender) > 0, "Must hold tokens to vote");
        
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.deadline > block.timestamp, "Voting period has ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.vetoed, "Proposal was vetoed");
        
        uint256 voterWeight = balanceOf(msg.sender);
        proposal.hasVoted[msg.sender] = true;
        
        if (_support) {
            proposal.forVotes += voterWeight;
        } else {
            proposal.againstVotes += voterWeight;
        }
        
        emit VoteCast(_proposalId, msg.sender, _support, voterWeight);
    }
    
    function executeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.deadline <= block.timestamp, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.vetoed, "Proposal was vetoed");
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 fanVotingPowerTotal = (totalSupply() * fanVotingPower) / 100;
        
        require(totalVotes >= fanVotingPowerTotal / 2, "Insufficient participation");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.executed = true;
        emit ProposalExecuted(_proposalId);
    }
    
    function vetoProposal(uint256 _proposalId) external {
        require(msg.sender == clubWallet || msg.sender == owner(), "Only club or owner can veto");
        
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.vetoed, "Proposal already vetoed");
        
        proposal.vetoed = true;
        emit ProposalVetoed(_proposalId);
    }
    
    function getProposal(uint256 _proposalId) external view returns (
        uint256 id,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 deadline,
        bool executed,
        bool vetoed,
        address proposer
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.deadline,
            proposal.executed,
            proposal.vetoed,
            proposal.proposer
        );
    }
    
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }
    
    function getClubInfo() external view returns (
        string memory name,
        uint256 price,
        address wallet,
        uint256 fanVoting,
        uint256 fanRevenue,
        uint256 supply,
        uint256 revenue
    ) {
        return (
            clubName,
            tokenPrice,
            clubWallet,
            fanVotingPower,
            fanRevenueShare,
            totalSupply(),
            totalRevenue
        );
    }
}