// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract Aggregator {
    enum FeeLevel { ZERO, LOW, MID, HIGH }

    address public owner;
    address public feeCollector;
    FeeLevel public currentFeeLevel;
    uint256 public defaultSlippagePercent;

    address[] public whiteListedRouters;

    mapping(FeeLevel => uint256) public feeBasisPoints;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier validRouter(address routerAddress) {
        bool isWhiteListed = false;
        for (uint8 i = 0; i < whiteListedRouters.length; i++) {
            if (whiteListedRouters[i] == routerAddress) {
                isWhiteListed = true;
                break;
            }
        }
        require(isWhiteListed, "Router not whitelisted");
        _;
    }

    event Swap(address router, address[] path, uint256 amountIn, address user);
    event RouterAdded(address router);
    event RouterRemoved(address router);
    event FeeLevelChanged(FeeLevel newFee);
    event OwnerChanged(address newOwner);

    constructor(address[] memory _routers, uint16 _defaultSlippagePercent, address _feeCollector) {
        owner = msg.sender;
        whiteListedRouters = _routers;
        defaultSlippagePercent = _defaultSlippagePercent;
        feeCollector = _feeCollector;

        feeBasisPoints[FeeLevel.ZERO] = 0;
        feeBasisPoints[FeeLevel.LOW] = 5;     // 0.05%
        feeBasisPoints[FeeLevel.MID] = 10;    // 0.1%
        feeBasisPoints[FeeLevel.HIGH] = 25;   // 0.25%

        currentFeeLevel = FeeLevel.MID;
    }

    // 🧾 Configurações do proprietário
    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
        emit OwnerChanged(newOwner);
    }

    function setFeeLevel(FeeLevel newLevel) external onlyOwner {
        currentFeeLevel = newLevel;
        emit FeeLevelChanged(newLevel);
    }

    function addRouter(address router) external onlyOwner {
        require(router != address(0), "Invalid router");
        whiteListedRouters.push(router);
        emit RouterAdded(router);
    }

    function removeRouter(address router) external onlyOwner {
        for (uint i = 0; i < whiteListedRouters.length; i++) {
            if (whiteListedRouters[i] == router) {
                whiteListedRouters[i] = whiteListedRouters[whiteListedRouters.length - 1];
                whiteListedRouters.pop();
                emit RouterRemoved(router);
                break;
            }
        }
    }

    function getRouters() external view returns (address[] memory) {
        return whiteListedRouters;
    }

    // 🔁 SWAP AUTOMÁTICO COM MELHOR ROTA
    function swapOnBestRouter(
        address[] calldata path,
        uint256 amountIn,
        uint256 deadline
    ) external {
        (uint256 bestAmountOut, address bestRouter) = getBestAmountsOutOnUniswapForks(path, amountIn);
        require(bestRouter != address(0), "No valid route");

        uint256 slippage = (bestAmountOut * defaultSlippagePercent) / 1000;
        uint256 minAmountOut = bestAmountOut - slippage;

        // Aplicar fee ao amountIn
        uint256 fee = (amountIn * feeBasisPoints[currentFeeLevel]) / 10000;
        uint256 amountAfterFee = amountIn - fee;

        require(IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn), "Transfer failed");
        if (fee > 0) {
            require(IERC20(path[0]).transfer(feeCollector, fee), "Fee transfer failed");
        }

        require(IERC20(path[0]).approve(bestRouter, amountAfterFee), "Approval failed");

        IUniswapV2Router02(bestRouter).swapExactTokensForTokens(
            amountAfterFee,
            minAmountOut,
            path,
            msg.sender,
            deadline
        );

        emit Swap(bestRouter, path, amountIn, msg.sender);
    }

    // 📊 GET BEST AMOUNT OUT
    function getBestAmountsOutOnUniswapForks(
        address[] memory path,
        uint256 amount
    ) public view returns (uint256 bestAmountOut, address bestRouter) {
        if (amount == 0 || path.length < 2) return (0, address(0));
        uint lastHop = path.length - 1;

        for (uint8 i = 0; i < whiteListedRouters.length; i++) {
            try IUniswapV2Router02(whiteListedRouters[i]).getAmountsOut(amount, path) returns (uint256[] memory amounts) {
                if (amounts[lastHop] > bestAmountOut) {
                    bestAmountOut = amounts[lastHop];
                    bestRouter = whiteListedRouters[i];
                }
            } catch {
                continue;
            }
        }
    }

    function quoteBestRouter(
        address[] memory path,
        uint256 amountIn
    ) external view returns (uint256 amountOut, address router) {
        return getBestAmountsOutOnUniswapForks(path, amountIn);
    }
}
