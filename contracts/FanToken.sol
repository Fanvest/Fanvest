// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FanToken is ERC20, Ownable, ReentrancyGuard {
    string public clubName;
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;
    
    struct Poll {
        uint256 id;
        string question;
        string[] options;
        mapping(uint256 => uint256) votes;
        mapping(address => bool) hasVoted;
        uint256 endTime;
        bool active;
        uint256 totalVotes;
    }
    
    struct Reward {
        uint256 amount;
        string reason;
        uint256 timestamp;
    }
    
    mapping(uint256 => Poll) public polls;
    mapping(address => Reward[]) public fanRewards;
    mapping(address => uint256) public fanLoyaltyPoints;
    
    uint256 public pollCounter;
    uint256 public minimumTokensToVote = 100 * 10**18;
    
    event PollCreated(uint256 indexed pollId, string question, uint256 endTime);
    event Voted(uint256 indexed pollId, address indexed voter, uint256 option, uint256 tokensUsed);
    event RewardDistributed(address indexed fan, uint256 amount, string reason);
    event LoyaltyPointsAwarded(address indexed fan, uint256 points);
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _clubName
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        clubName = _clubName;
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    function createPoll(
        string memory _question,
        string[] memory _options,
        uint256 _durationInHours
    ) external onlyOwner {
        require(_options.length >= 2 && _options.length <= 10, "Invalid number of options");
        require(_durationInHours > 0 && _durationInHours <= 168, "Duration must be 1-168 hours");
        
        pollCounter++;
        Poll storage newPoll = polls[pollCounter];
        newPoll.id = pollCounter;
        newPoll.question = _question;
        newPoll.options = _options;
        newPoll.endTime = block.timestamp + (_durationInHours * 1 hours);
        newPoll.active = true;
        newPoll.totalVotes = 0;
        
        emit PollCreated(pollCounter, _question, newPoll.endTime);
    }
    
    function vote(uint256 _pollId, uint256 _option) external nonReentrant {
        Poll storage poll = polls[_pollId];
        require(poll.active, "Poll is not active");
        require(block.timestamp < poll.endTime, "Poll has ended");
        require(!poll.hasVoted[msg.sender], "Already voted");
        require(_option < poll.options.length, "Invalid option");
        require(balanceOf(msg.sender) >= minimumTokensToVote, "Insufficient tokens to vote");
        
        uint256 votingPower = balanceOf(msg.sender);
        poll.votes[_option] += votingPower;
        poll.hasVoted[msg.sender] = true;
        poll.totalVotes += votingPower;
        
        fanLoyaltyPoints[msg.sender] += 10;
        
        emit Voted(_pollId, msg.sender, _option, votingPower);
        emit LoyaltyPointsAwarded(msg.sender, 10);
    }
    
    function closePoll(uint256 _pollId) external onlyOwner {
        Poll storage poll = polls[_pollId];
        require(poll.active, "Poll is not active");
        poll.active = false;
    }
    
    function getPollResults(uint256 _pollId) external view returns (
        string memory question,
        string[] memory options,
        uint256[] memory votes,
        uint256 totalVotes,
        bool active,
        uint256 endTime
    ) {
        Poll storage poll = polls[_pollId];
        require(poll.id != 0, "Poll does not exist");
        
        uint256[] memory voteResults = new uint256[](poll.options.length);
        for (uint256 i = 0; i < poll.options.length; i++) {
            voteResults[i] = poll.votes[i];
        }
        
        return (
            poll.question,
            poll.options,
            voteResults,
            poll.totalVotes,
            poll.active,
            poll.endTime
        );
    }
    
    function distributeReward(
        address _fan,
        uint256 _amount,
        string memory _reason
    ) external onlyOwner {
        require(_fan != address(0), "Invalid address");
        require(_amount > 0, "Amount must be positive");
        require(balanceOf(owner()) >= _amount, "Insufficient owner balance");
        
        _transfer(owner(), _fan, _amount);
        
        fanRewards[_fan].push(Reward({
            amount: _amount,
            reason: _reason,
            timestamp: block.timestamp
        }));
        
        fanLoyaltyPoints[_fan] += _amount / 10**18;
        
        emit RewardDistributed(_fan, _amount, _reason);
        emit LoyaltyPointsAwarded(_fan, _amount / 10**18);
    }
    
    function batchDistributeRewards(
        address[] memory _fans,
        uint256[] memory _amounts,
        string memory _reason
    ) external onlyOwner {
        require(_fans.length == _amounts.length, "Arrays length mismatch");
        require(_fans.length <= 100, "Too many recipients");
        
        for (uint256 i = 0; i < _fans.length; i++) {
            require(_fans[i] != address(0), "Invalid address");
            require(_amounts[i] > 0, "Amount must be positive");
            require(balanceOf(owner()) >= _amounts[i], "Insufficient owner balance");
            
            _transfer(owner(), _fans[i], _amounts[i]);
            
            fanRewards[_fans[i]].push(Reward({
                amount: _amounts[i],
                reason: _reason,
                timestamp: block.timestamp
            }));
            
            fanLoyaltyPoints[_fans[i]] += _amounts[i] / 10**18;
            
            emit RewardDistributed(_fans[i], _amounts[i], _reason);
            emit LoyaltyPointsAwarded(_fans[i], _amounts[i] / 10**18);
        }
    }
    
    function getFanRewards(address _fan) external view returns (Reward[] memory) {
        return fanRewards[_fan];
    }
    
    function setMinimumTokensToVote(uint256 _minimum) external onlyOwner {
        minimumTokensToVote = _minimum;
    }
    
    function hasVoted(uint256 _pollId, address _voter) external view returns (bool) {
        return polls[_pollId].hasVoted[_voter];
    }
    
    function getActivePoll() external view returns (uint256) {
        for (uint256 i = pollCounter; i >= 1; i--) {
            if (polls[i].active && block.timestamp < polls[i].endTime) {
                return i;
            }
        }
        return 0;
    }
    
    function burnTokens(uint256 _amount) external {
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        _burn(msg.sender, _amount);
        fanLoyaltyPoints[msg.sender] += _amount / 10**17;
        emit LoyaltyPointsAwarded(msg.sender, _amount / 10**17);
    }
}