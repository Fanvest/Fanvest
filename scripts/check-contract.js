const { createPublicClient, http } = require('viem');

const chilizSpicy = {
  id: 88882,
  name: 'Chiliz Spicy Testnet',
  rpcUrls: {
    default: { http: ['https://spicy-rpc.chiliz.com'] }
  }
};

async function checkContract(address) {
  if (!address) {
    console.log('❌ Please provide a contract address');
    console.log('Usage: node scripts/check-contract.js 0x...');
    return;
  }

  try {
    console.log(`🔍 Checking contract at: ${address}`);
    
    const publicClient = createPublicClient({
      chain: chilizSpicy,
      transport: http()
    });

    // Vérifier si l'adresse contient du code
    const code = await publicClient.getBytecode({ address });
    
    if (!code || code === '0x') {
      console.log('❌ No contract found at this address');
      console.log('💡 This address does not contain a smart contract');
      return false;
    }

    console.log('✅ Contract found!');
    console.log(`📊 Bytecode length: ${code.length} characters`);
    
    // Essayer de lire des informations basiques si c'est notre factory
    try {
      const factoryFee = await publicClient.readContract({
        address,
        abi: [
          {
            inputs: [],
            name: 'factoryFee',
            outputs: [{ type: 'uint256' }],
            stateMutability: 'view',
            type: 'function'
          }
        ],
        functionName: 'factoryFee'
      });
      
      console.log(`💰 Factory fee: ${Number(factoryFee) / 1e18} CHZ`);
      console.log('🏭 This appears to be a FanStockFactory contract!');
      
    } catch (e) {
      console.log('📋 Contract exists but may not be a FanStockFactory');
    }

    console.log(`🌐 Explorer: https://testnet.chiliscan.com/address/${address}`);
    return true;

  } catch (error) {
    console.error('❌ Error checking contract:', error.message);
    return false;
  }
}

// Obtenir l'adresse depuis les arguments de ligne de commande
const address = process.argv[2];
checkContract(address);