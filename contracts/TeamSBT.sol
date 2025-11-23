// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// IERC5192 インターフェース (SBT規格)
interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

contract TeamSBT is ERC1155, Ownable, ERC1155Supply, IERC5192 {
    
    // コントラクトの名前とシンボル (OpenSea表示用)
    string public name = "UTokyo Community NFT";
    string public symbol = "UTCN";

    // 一般公開ミント（期間外）が有効かどうか
    bool public isPublicMintEnabled = false;

    constructor() ERC1155("ipfs://YOUR_BASE_CID_HERE/{id}.json") Ownable(msg.sender) {}

    // --------------------------------------------------------
    // 1. ガス代無料期間用 (PDF: バックエンド/スポンサー主導)
    // --------------------------------------------------------
    // オーナー（バックエンドのウォレット）が、ユーザーのアドレスを指定して配る
    function airdropMint(address to, uint256 id) external onlyOwner {
        require(!hasMinted(to, id), "User already has this NFT");
        
        _mint(to, id, 1, "");
        emit Locked(id); // SBTとしてロック宣言
    }

    // --------------------------------------------------------
    // 2. ガス代有料期間用 (PDF: 個人ウォレット主導)
    // --------------------------------------------------------
    // ユーザー自身がガス代を払って実行する
    function publicMint(uint256 id) external {
        require(isPublicMintEnabled, "Public mint is closed");
        require(!hasMinted(msg.sender, id), "User already has this NFT"); // 1人1つ制限

        _mint(msg.sender, id, 1, "");
        emit Locked(id); // SBTとしてロック宣言
    }

    // --------------------------------------------------------
    // ユーティリティ & 設定
    // --------------------------------------------------------

    // すでに持っているかチェックする便利関数
    function hasMinted(address user, uint256 id) public view returns (bool) {
        return balanceOf(user, id) > 0;
    }

    // 公開ミントのON/OFF切り替え
    function setPublicMintEnabled(bool _state) external onlyOwner {
        isPublicMintEnabled = _state;
    }

    // メタデータURIの変更 (IPFSのCIDが変わった時用)
    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    // --------------------------------------------------------
    // SBT (転送不可) の実装
    // --------------------------------------------------------

    // IERC5192準拠: 常にロック状態であることを返す
    function locked(uint256 tokenId) external view override returns (bool) {
        return true;
    }

    // OpenZeppelin v5のERC1155における転送フック
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        // ミント(from=0) と バーン(to=0) 以外は転送禁止
        if (from != address(0) && to != address(0)) {
            revert("SBT: Transfer is disabled");
        }
        super._update(from, to, ids, values);
    }
}