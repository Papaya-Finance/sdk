/**
 * Network configuration for Papaya Protocol
 * Contains contract addresses, token addresses, and price feed addresses for different networks and tokens
 */
export const NETWORKS = {
  polygon: {
    USDC: [
      {
        version: "1",
        contractAddress: "0x574DeD69a731B5e19e1dD6861D1Cc33cfE7dB45c",
        tokenAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        tokenPriceFeed: "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7",
        coinPriceFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
      },
      {
        version: "1.5",
        contractAddress: "0xb8fD71A4d29e2138056b2a309f97b96ec2A8EeD7",
        tokenAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        tokenPriceFeed: "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7",
        coinPriceFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
      },
      {
        version: "1.5.1",
        contractAddress: "0x43CFA1D8bd93179D89BF7bF3268E5861385a1c96",
        tokenAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        tokenPriceFeed: "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7",
        coinPriceFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
      },
      {
        version: "0.1.0",
        contractAddress: "0x0116d41a0075e416f7793bDdEc9ec7aCf0413684",
        tokenAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        tokenPriceFeed: "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7",
        coinPriceFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
      }
    ],
    USDT: [
      {
        version: "1",
        contractAddress: "0x1c3E45F2D9Dd65ceb6a644A646337015119952ff",
        tokenAddress: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        tokenPriceFeed: "0x0A6513e40db6EB1b165753AD52E80663aeA50545",
        coinPriceFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
      },
      {
        version: "1.5",
        contractAddress: "0xD3B79811fFb55708A4fe848D0b131030a347887C",
        tokenAddress: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        tokenPriceFeed: "0x0A6513e40db6EB1b165753AD52E80663aeA50545",
        coinPriceFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
      },
      {
        version: "1.5.1",
        contractAddress: "0x444a597c2dcadf71187b4c7034d73b8fa80744e2",
        tokenAddress: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        tokenPriceFeed: "0x0A6513e40db6EB1b165753AD52E80663aeA50545",
        coinPriceFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
      },
      {
        version: "0.1.0",
        contractAddress: "0x00532507902B8A78BacE140e3a88Dec52507d905",
        tokenAddress: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        tokenPriceFeed: "0x0A6513e40db6EB1b165753AD52E80663aeA50545",
        coinPriceFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
      }
    ]
  },
  bsc: {
    USDC: [
      {
        version: "1",
        contractAddress: "0x574DeD69a731B5e19e1dD6861D1Cc33cfE7dB45c",
        tokenAddress: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        tokenPriceFeed: "0x51597f405303C4377E36123cBc172b13269EA163",
        coinPriceFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"
      },
      {
        version: "1.5",
        contractAddress: "0xD3B79811fFb55708A4fe848D0b131030a347887C",
        tokenAddress: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        tokenPriceFeed: "0x51597f405303C4377E36123cBc172b13269EA163",
        coinPriceFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"
      },
      {
        version: "1.5.1",
        contractAddress: "0x43CFA1D8bd93179D89BF7bF3268E5861385a1c96",
        tokenAddress: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        tokenPriceFeed: "0x51597f405303C4377E36123cBc172b13269EA163",
        coinPriceFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"
      }
    ],
    USDT: [
      {
        version: "1",
        contractAddress: "0x1c3E45F2D9Dd65ceb6a644A646337015119952ff",
        tokenAddress: "0x55d398326f99059fF775485246999027B3197955",
        tokenPriceFeed: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
        coinPriceFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"
      },
      {
        version: "1.5",
        contractAddress: "0xB9BE933e8a17dc0d9bf69aFE9E91C54330CF6dF4",
        tokenAddress: "0x55d398326f99059fF775485246999027B3197955",
        tokenPriceFeed: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
        coinPriceFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"
      },
      {
        version: "1.5.1",
        contractAddress: "0x1BE4656C4C05Ce9E3f2447CC46148c043D2d4aD8",
        tokenAddress: "0x55d398326f99059fF775485246999027B3197955",
        tokenPriceFeed: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
        coinPriceFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"
      }
    ]
  },
  avalanche: {
    USDC: [
      {
        version: "1",
        contractAddress: "0x1c3E45F2D9Dd65ceb6a644A646337015119952ff",
        tokenAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        tokenPriceFeed: "0xF096872672F44d6EBA71458D74fe67F9a77a23B9",
        coinPriceFeed: "0x0A77230d17318075983913bC2145DB16C7366156"
      }
    ],
    USDT: [
      {
        version: "1",
        contractAddress: "0x574DeD69a731B5e19e1dD6861D1Cc33cfE7dB45c",
        tokenAddress: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
        tokenPriceFeed: "0xEBE676ee90Fe1112671f19b6B7459bC678B67e8a",
        coinPriceFeed: "0x0A77230d17318075983913bC2145DB16C7366156"
      }
    ]
  },
  base: {
    USDC: [
      {
        version: "1",
        contractAddress: "0x574DeD69a731B5e19e1dD6861D1Cc33cfE7dB45c",
        tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        tokenPriceFeed: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
        coinPriceFeed: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"
      }
    ]
  },
  scroll: {
    USDC: [
      {
        version: "1",
        contractAddress: "0x574DeD69a731B5e19e1dD6861D1Cc33cfE7dB45c",
        tokenAddress: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
        tokenPriceFeed: "0x43d12Fb3AfCAd5347fA764EeAB105478337b7200",
        coinPriceFeed: "0x6bF14CB0A831078629D993FDeBcB182b21A8774C"
      }
    ],
    USDT: [
      {
        version: "1",
        contractAddress: "0x1c3E45F2D9Dd65ceb6a644A646337015119952ff",
        tokenAddress: "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df",
        tokenPriceFeed: "0xf376A91Ae078927eb3686D6010a6f1482424954E",
        coinPriceFeed: "0x6bF14CB0A831078629D993FDeBcB182b21A8774C"
      }
    ]
  },
  arbitrum: {
    USDC: [
      {
        version: "1",
        contractAddress: "0x574DeD69a731B5e19e1dD6861D1Cc33cfE7dB45c",
        tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        tokenPriceFeed: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
        coinPriceFeed: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612"
      }
    ],
    USDT: [
      {
        version: "1",
        contractAddress: "0x1c3E45F2D9Dd65ceb6a644A646337015119952ff",
        tokenAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        tokenPriceFeed: "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
        coinPriceFeed: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612"
      }
    ]
  },
  mainnet: {
    USDC: [
      {
        version: "1",
        contractAddress: "0x1c3E45F2D9Dd65ceb6a644A646337015119952ff",
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        tokenPriceFeed: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
        coinPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
      }
    ],
    USDT: [
      {
        version: "1",
        contractAddress: "0xb8fD71A4d29e2138056b2a309f97b96ec2A8EeD7",
        tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        tokenPriceFeed: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
        coinPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
      }
    ],
    PYUSD: [
      {
        version: "1",
        contractAddress: "0x444a597c2DcaDF71187b4c7034D73B8Fa80744E2",
        tokenAddress: "0x6c3ea9036406852006290770bedfcaba0e23a0e8",
        tokenPriceFeed: "0x4f99C4AB8070CB83d369070Df10379EFA1B2915a",
        coinPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
      }
    ]
  },
  sei: {
    USDC: [
      {
        version: "1",
        contractAddress: "0xB9BE933e8a17dc0d9bf69aFE9E91C54330CF6dF4",
        tokenAddress: "0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1",
        tokenPriceFeed: "0xD3B79811fFb55708A4fe848D0b131030a347887C",
        coinPriceFeed: "0x1c3E45F2D9Dd65ceb6a644A646337015119952ff"
      }
    ],
    USDT: [
      {
        version: "1",
        contractAddress: "0xb8fD71A4d29e2138056b2a309f97b96ec2A8EeD7",
        tokenAddress: "0xb75d0b03c06a926e488e2659df1a861f860bd3d1",
        tokenPriceFeed: "0x574DeD69a731B5e19e1dD6861D1Cc33cfE7dB45c",
        coinPriceFeed: "0x1c3E45F2D9Dd65ceb6a644A646337015119952ff"
      }
    ]
  },
  zksync: {
    USDT: [
      {
        version: "1",
        contractAddress: "0xDa7E1B508d6974208C8C3D54e9De1ce8ADf715E9",
        tokenAddress: "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C",
        tokenPriceFeed: "0xB615075979AE1836B476F651f1eB79f0Cd3956a9",
        coinPriceFeed: "0x6D41d1dc818112880b40e26BD6FD347E41008eDA"
      }
    ]
  }
};

/**
 * Default versions for each network
 */
export const DEFAULT_VERSIONS = {
  polygon: "1.5.1",
  bsc: "1.5.1",
  avalanche: "1",
  base: "1",
  scroll: "1",
  arbitrum: "1",
  mainnet: "1",
  sei: "1",
  zksync: "1"
};

/**
 * Supported token symbols
 */
export type TokenSymbol = 'USDT' | 'USDC' | 'PYUSD';

/**
 * Supported network names
 */
export type NetworkName = 'polygon' | 'bsc' | 'avalanche' | 'base' | 'scroll' | 'arbitrum' | 'mainnet' | 'sei' | 'zksync'; 