// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title  GameRewardWEI
 * @notice WEI token — Bitcoin-style ERC-20 on Base / Arbitrum L2.
 *         - Hard cap: 21,000,000 WEI (18 decimals)
 *         - Halving: block reward halves every 10,500,000 WEI distributed
 *         - Game rewards: ECDSA server signature required (trusted game server)
 *         - Daily cooldown: 24 hours per wallet per claim
 *         - Burn: exchange mechanism burns WEI on fiat conversion
 *
 * @dev    Deploy on Base Mainnet (chainId: 8453) or Arbitrum One (chainId: 42161).
 *         trustedSigner = the Node.js game server secp256k1 public key address.
 *         Use `npx hardhat run scripts/deploy.ts --network base` to deploy.
 */
contract GameRewardWEI is ERC20, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ─── Bitcoin Tokenomics ───────────────────────────────────────────────────
    uint256 public constant MAX_SUPPLY        = 21_000_000 * 10**18;
    uint256 public constant HALVING_THRESHOLD = 10_500_000 * 10**18;
    uint256 public constant INITIAL_REWARD    = 1_000 * 10**18;
    uint256 public constant DAILY_COOLDOWN    = 24 hours;

    // ─── Mutable State ────────────────────────────────────────────────────────
    uint256 public totalDistributed;
    uint256 public halvingCount;
    uint256 public currentBlockReward;
    address public trustedSigner;

    mapping(address => uint256) public lastClaimTimestamp;
    mapping(bytes32 => bool)    public usedSignatures;

    // ─── Events ───────────────────────────────────────────────────────────────
    event RewardClaimed(address indexed player, uint256 amount, bytes32 sigHash);
    event Halving(uint256 halvingNumber, uint256 newBlockReward, uint256 totalDistributed);
    event Burned(address indexed from, uint256 amount, string reason);
    event TrustedSignerUpdated(address indexed oldSigner, address indexed newSigner);

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(address _trustedSigner) ERC20("WEI", "WEI") Ownable(msg.sender) {
        require(_trustedSigner != address(0), "GameRewardWEI: zero signer address");
        trustedSigner = _trustedSigner;
        currentBlockReward = INITIAL_REWARD;
    }

    // ─── Claim Game Reward ────────────────────────────────────────────────────
    /**
     * @notice Claim a game reward. Requires valid ECDSA signature from trusted game server.
     * @dev    Server signs: keccak256(abi.encodePacked(player, gameId, rewardAmount, nonce, address(this), block.chainid))
     *         then applies Ethereum signed message prefix.
     * @param  gameId        Unique game session ID
     * @param  rewardAmount  Exact WEI reward in wei units (18 decimals)
     * @param  nonce         Single-use server nonce (anti-replay)
     * @param  signature     ECDSA bytes from trustedSigner
     */
    function claimGameReward(
        string calldata gameId,
        uint256 rewardAmount,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant {
        address player = msg.sender;

        // 1. Daily cooldown
        require(
            block.timestamp >= lastClaimTimestamp[player] + DAILY_COOLDOWN,
            "GameRewardWEI: daily cooldown active"
        );

        // 2. Hard cap
        require(
            totalDistributed + rewardAmount <= MAX_SUPPLY,
            "GameRewardWEI: hard cap reached"
        );

        // 3. Reward cap at current block reward
        require(
            rewardAmount <= currentBlockReward,
            "GameRewardWEI: exceeds block reward"
        );

        // 4. ECDSA verification — server proves the win is legitimate
        bytes32 msgHash = keccak256(
            abi.encodePacked(player, gameId, rewardAmount, nonce, address(this), block.chainid)
        );
        bytes32 ethHash = msgHash.toEthSignedMessageHash();

        require(!usedSignatures[ethHash], "GameRewardWEI: signature already used");
        require(ethHash.recover(signature) == trustedSigner, "GameRewardWEI: invalid server signature");

        // 5. Mark signature as used (anti-replay)
        usedSignatures[ethHash] = true;

        // 6. Update state
        lastClaimTimestamp[player] = block.timestamp;
        totalDistributed += rewardAmount;

        // 7. Halving check
        _checkAndApplyHalving();

        // 8. Mint to player
        _mint(player, rewardAmount);

        emit RewardClaimed(player, rewardAmount, ethHash);
    }

    // ─── Internal Halving Logic ───────────────────────────────────────────────
    function _checkAndApplyHalving() internal {
        uint256 expected = totalDistributed / HALVING_THRESHOLD;
        if (expected > halvingCount) {
            halvingCount = expected;
            // Bitcoin-style: right-shift by number of halvings
            currentBlockReward = INITIAL_REWARD >> halvingCount;
            if (currentBlockReward == 0) currentBlockReward = 1; // minimum 1 wei reward
            emit Halving(halvingCount, currentBlockReward, totalDistributed);
        }
    }

    // ─── Burn Mechanisms ─────────────────────────────────────────────────────
    /**
     * @notice Burns WEI during exchange for fiat. Called by owner/exchange contract.
     */
    function burnForExchange(address from, uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "GameRewardWEI: zero amount");
        _burn(from, amount);
        emit Burned(from, amount, "EXCHANGE");
    }

    /**
     * @notice User voluntarily burns their own WEI.
     */
    function burn(uint256 amount) external nonReentrant {
        require(amount > 0, "GameRewardWEI: zero amount");
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount, "USER_BURN");
    }

    // ─── View Helpers ─────────────────────────────────────────────────────────
    /** Seconds until next claim for a player (0 if ready). */
    function cooldownRemaining(address player) external view returns (uint256) {
        uint256 next = lastClaimTimestamp[player] + DAILY_COOLDOWN;
        return block.timestamp >= next ? 0 : next - block.timestamp;
    }

    /** Halving progress as 0–100 percent. */
    function halvingProgressPercent() external view returns (uint256) {
        uint256 from = halvingCount * HALVING_THRESHOLD;
        uint256 to   = (halvingCount + 1) * HALVING_THRESHOLD;
        if (to > MAX_SUPPLY) to = MAX_SUPPLY;
        if (totalDistributed <= from) return 0;
        return ((totalDistributed - from) * 100) / (to - from);
    }

    /** Remaining mintable supply (in wei units). */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY > totalDistributed ? MAX_SUPPLY - totalDistributed : 0;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────
    function updateTrustedSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "GameRewardWEI: zero address");
        emit TrustedSignerUpdated(trustedSigner, newSigner);
        trustedSigner = newSigner;
    }
}
