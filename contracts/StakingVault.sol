// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StakingVault
 * @dev A simple staking contract that allows users to stake ERC20 tokens and earn rewards
 */
contract StakingVault is ReentrancyGuard, Ownable {
    IERC20 public stakingToken;
    IERC20 public rewardToken;
    
    uint256 public rewardRate = 100; // 100 reward tokens per staked token per day
    uint256 public constant REWARD_PRECISION = 1e18;
    
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardDebt;
    }
    
    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    
    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }
    
    /**
     * @dev Stake tokens
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0 tokens");
        
        // Claim any pending rewards first
        if (stakes[msg.sender].amount > 0) {
            _claimReward();
        }
        
        stakingToken.transferFrom(msg.sender, address(this), amount);
        
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw staked tokens
     * @param amount Amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot withdraw 0 tokens");
        require(stakes[msg.sender].amount >= amount, "Insufficient staked balance");
        
        // Claim rewards first
        _claimReward();
        
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        
        stakingToken.transfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Claim pending rewards
     */
    function claimReward() external nonReentrant {
        _claimReward();
    }
    
    /**
     * @dev Internal function to claim rewards
     */
    function _claimReward() internal {
        uint256 reward = calculateReward(msg.sender);
        
        if (reward > 0) {
            stakes[msg.sender].rewardDebt = reward;
            stakes[msg.sender].timestamp = block.timestamp;
            rewardToken.transfer(msg.sender, reward);
            
            emit RewardClaimed(msg.sender, reward);
        }
    }
    
    /**
     * @dev Calculate pending rewards for a user
     * @param user Address of the user
     * @return Pending reward amount
     */
    function calculateReward(address user) public view returns (uint256) {
        Stake memory userStake = stakes[user];
        
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 stakingDuration = block.timestamp - userStake.timestamp;
        uint256 reward = (userStake.amount * rewardRate * stakingDuration) / (1 days * REWARD_PRECISION);
        
        return reward;
    }
    
    /**
     * @dev Get staking info for a user
     * @param user Address of the user
     */
    function getStakeInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 stakingTimestamp,
        uint256 pendingReward
    ) {
        Stake memory userStake = stakes[user];
        return (
            userStake.amount,
            userStake.timestamp,
            calculateReward(user)
        );
    }
    
    /**
     * @dev Update reward rate (only owner)
     * @param newRate New reward rate
     */
    function updateRewardRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Invalid reward rate");
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }
    
    /**
     * @dev Emergency withdraw function for owner
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}
