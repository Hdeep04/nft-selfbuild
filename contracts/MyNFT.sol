// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC5192.sol"; // 【追加1】定義ファイルを読み込む

// 【追加2】IERC5192 を継承する
contract MyNFT is ERC721, ERC721URIStorage, Ownable, IERC5192 {
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("My Community NFT", "MCNFT")
        Ownable(initialOwner)
    {}

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // 【追加3】「このトークンはロック(SBT化)されました」と世界に叫ぶ
        emit Locked(tokenId);
    }

    // 【追加4】「このトークンはロックされていますか？」という質問に「はい(true)」と答える
    function locked(uint256 tokenId) external view override returns (bool) {
        // 所有者が存在するかチェック（存在しないトークンはエラーにするお作法）
        require(_ownerOf(tokenId) != address(0), "ERC721: invalid token ID");
        return true;
    }

    // 転送を禁止する機能（これは前回実装したまま）
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        // 新規発行(ミント)以外の転送ならエラーにする
        if (_ownerOf(tokenId) != address(0)) {
            revert("ERC721: token transfer is disabled");
        }
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    // 【追加5】「あなたはSBT規格(IERC5192)に対応していますか？」という質問に答える設定
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return interfaceId == type(IERC5192).interfaceId || super.supportsInterface(interfaceId);
    }
}