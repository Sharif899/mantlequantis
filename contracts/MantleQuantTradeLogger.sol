// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MantleQuantTradeLogger
 * @notice Logs paper trades on-chain for transparency and verifiability.
 *         Deployed on Mantle Sepolia Testnet for the Turing Test Hackathon 2026.
 *
 * BGA Alignment: Every trade decision made by an AI agent is recorded
 * permanently on Mantle, reducing "black box" opacity and giving retail
 * users full auditability of AI strategy performance.
 *
 * Deploy: npx hardhat run scripts/deploy.js --network mantleSepolia
 */
contract MantleQuantTradeLogger {

    struct TradeRecord {
        address trader;
        string  pair;
        string  side;
        uint256 amountUsdtCents;  // amount * 100
        uint256 priceScaled;      // price * 10000
        uint256 timestamp;
        string  strategyId;
        uint256 blockNumber;
    }

    // ERC-8004 style agent identity registry
    struct AgentIdentity {
        address owner;
        string  strategyId;
        string  strategyName;
        uint256 registeredAt;
        uint256 totalTrades;
        int256  totalPnlCents;   // cumulative pnl * 100
    }

    mapping(address => TradeRecord[]) public tradesByTrader;
    mapping(address => AgentIdentity) public agentIdentities;
    mapping(address => bool) public registeredAgents;

    address[] public allTraders;
    uint256 public totalTradesLogged;

    event TradeLogged(
        address indexed trader,
        string pair,
        string side,
        uint256 amountUsdtCents,
        uint256 priceScaled,
        uint256 timestamp,
        string strategyId
    );

    event AgentRegistered(
        address indexed owner,
        string strategyId,
        string strategyName,
        uint256 timestamp
    );

    // Register an AI agent with an identity (ERC-8004 inspired)
    function registerAgent(
        string calldata strategyId,
        string calldata strategyName
    ) external {
        if (!registeredAgents[msg.sender]) {
            allTraders.push(msg.sender);
            registeredAgents[msg.sender] = true;
        }

        agentIdentities[msg.sender] = AgentIdentity({
            owner: msg.sender,
            strategyId: strategyId,
            strategyName: strategyName,
            registeredAt: block.timestamp,
            totalTrades: 0,
            totalPnlCents: 0
        });

        emit AgentRegistered(msg.sender, strategyId, strategyName, block.timestamp);
    }

    // Log a paper trade on-chain
    function logTrade(
        string calldata pair,
        string calldata side,
        uint256 amountUsdtCents,
        uint256 priceScaled,
        string calldata strategyId
    ) external {
        if (!registeredAgents[msg.sender]) {
            allTraders.push(msg.sender);
            registeredAgents[msg.sender] = true;
        }

        TradeRecord memory record = TradeRecord({
            trader: msg.sender,
            pair: pair,
            side: side,
            amountUsdtCents: amountUsdtCents,
            priceScaled: priceScaled,
            timestamp: block.timestamp,
            strategyId: strategyId,
            blockNumber: block.number
        });

        tradesByTrader[msg.sender].push(record);
        agentIdentities[msg.sender].totalTrades++;
        totalTradesLogged++;

        emit TradeLogged(
            msg.sender,
            pair,
            side,
            amountUsdtCents,
            priceScaled,
            block.timestamp,
            strategyId
        );
    }

    // View functions
    function getMyTrades() external view returns (TradeRecord[] memory) {
        return tradesByTrader[msg.sender];
    }

    function getTraderTrades(address trader) external view returns (TradeRecord[] memory) {
        return tradesByTrader[trader];
    }

    function getTraderCount() external view returns (uint256) {
        return allTraders.length;
    }

    function getMyTradeCount() external view returns (uint256) {
        return tradesByTrader[msg.sender].length;
    }
}
