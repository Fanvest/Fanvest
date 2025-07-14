// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ClubToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FanStockFactory is Ownable, ReentrancyGuard {
    
    uint256 public factoryFee = 0.001 ether;
    uint256 public totalClubsCreated;
    
    struct ClubInfo {
        address tokenAddress;
        string clubName;
        address creator;
        uint256 createdAt;
        bool active;
    }
    
    mapping(address => ClubInfo) public clubTokens;
    mapping(address => address[]) public creatorClubs;
    address[] public allClubTokens;
    
    event ClubTokenCreated(
        address indexed tokenAddress,
        string clubName,
        address indexed creator,
        string tokenName,
        string tokenSymbol,
        uint256 tokenPrice,
        uint256 fanVotingPower,
        uint256 fanRevenueShare
    );
    
    event FactoryFeeUpdated(uint256 oldFee, uint256 newFee);
    event ClubStatusUpdated(address indexed tokenAddress, bool active);
    
    constructor() Ownable(msg.sender) {}
    
    function createClubToken(
        string memory clubName,
        string memory tokenName,
        string memory tokenSymbol,
        address clubWallet,
        uint256 customPrice,
        uint256 fanVotingPower,
        uint256 fanRevenueShare
    ) external payable nonReentrant returns (address) {
        require(msg.value >= factoryFee, "Insufficient factory fee");
        require(bytes(clubName).length > 0, "Club name cannot be empty");
        require(bytes(tokenName).length > 0, "Token name cannot be empty");
        require(bytes(tokenSymbol).length > 0, "Token symbol cannot be empty");
        require(clubWallet != address(0), "Club wallet cannot be zero address");
        require(customPrice > 0, "Price must be greater than 0");
        
        ClubToken newToken = new ClubToken(
            tokenName,
            tokenSymbol,
            clubName,
            customPrice,
            clubWallet,
            fanVotingPower,
            fanRevenueShare
        );
        
        address tokenAddress = address(newToken);
        
        clubTokens[tokenAddress] = ClubInfo({
            tokenAddress: tokenAddress,
            clubName: clubName,
            creator: msg.sender,
            createdAt: block.timestamp,
            active: true
        });
        
        creatorClubs[msg.sender].push(tokenAddress);
        allClubTokens.push(tokenAddress);
        totalClubsCreated++;
        
        if (msg.value > factoryFee) {
            payable(msg.sender).transfer(msg.value - factoryFee);
        }
        
        emit ClubTokenCreated(
            tokenAddress,
            clubName,
            msg.sender,
            tokenName,
            tokenSymbol,
            customPrice,
            fanVotingPower,
            fanRevenueShare
        );
        
        return tokenAddress;
    }
    
    function updateFactoryFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = factoryFee;
        factoryFee = _newFee;
        emit FactoryFeeUpdated(oldFee, _newFee);
    }
    
    function updateClubStatus(address _tokenAddress, bool _active) external onlyOwner {
        require(clubTokens[_tokenAddress].tokenAddress != address(0), "Club token does not exist");
        clubTokens[_tokenAddress].active = _active;
        emit ClubStatusUpdated(_tokenAddress, _active);
    }
    
    function getClubInfo(address _tokenAddress) external view returns (ClubInfo memory) {
        return clubTokens[_tokenAddress];
    }
    
    function getCreatorClubs(address _creator) external view returns (address[] memory) {
        return creatorClubs[_creator];
    }
    
    function getAllClubTokens() external view returns (address[] memory) {
        return allClubTokens;
    }
    
    function getActiveClubTokens() external view returns (address[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < allClubTokens.length; i++) {
            if (clubTokens[allClubTokens[i]].active) {
                activeCount++;
            }
        }
        
        address[] memory activeTokens = new address[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allClubTokens.length; i++) {
            if (clubTokens[allClubTokens[i]].active) {
                activeTokens[currentIndex] = allClubTokens[i];
                currentIndex++;
            }
        }
        
        return activeTokens;
    }
    
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function isValidClubToken(address _tokenAddress) external view returns (bool) {
        return clubTokens[_tokenAddress].tokenAddress != address(0) && 
               clubTokens[_tokenAddress].active;
    }
}