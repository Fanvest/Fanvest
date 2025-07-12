// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FanToken
 * @dev Template de token fan pour les clubs de sport
 * Chaque club peut déployer ce contrat avec ses propres paramètres
 */
contract FanToken is ERC20, Ownable {
    
    // Informations du club
    string public clubName;
    string public clubDescription;
    
    /**
     * @dev Constructeur du token fan
     * @param _name Nom du token (ex: "Paris Saint-Germain Fan Token")
     * @param _symbol Symbole du token (ex: "PSG")
     * @param _initialSupply Supply initial du token
     * @param _clubName Nom du club
     * @param _clubDescription Description du club
     * @param _owner Adresse du propriétaire (le club)
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        string memory _clubName,
        string memory _clubDescription,
        address _owner
    ) ERC20(_name, _symbol) Ownable(_owner) {
        clubName = _clubName;
        clubDescription = _clubDescription;
        
        // Mint tous les tokens au propriétaire (le club)
        _mint(_owner, _initialSupply * 10**decimals());
    }
    
    /**
     * @dev Permet au club de mettre à jour sa description
     */
    function updateClubDescription(string memory _newDescription) external onlyOwner {
        clubDescription = _newDescription;
    }
    
    /**
     * @dev Retourne les informations du club
     */
    function getClubInfo() external view returns (string memory, string memory) {
        return (clubName, clubDescription);
    }
}