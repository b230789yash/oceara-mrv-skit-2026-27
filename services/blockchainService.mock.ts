/**
 * Blockchain Service for Carbon Credit Tokenization
 * Simulates Web3 interactions with smart contracts
 */

export interface Transaction {
  txHash: string
  type: 'MINT' | 'TRANSFER' | 'BURN' | 'APPROVE'
  from: string
  to: string
  amount: number
  timestamp: string
  status: 'pending' | 'confirmed' | 'failed'
  blockNumber?: number
  gasUsed?: string
  projectId?: number
}

export interface WalletInfo {
  address: string
  balance: number
  network: string
  connected: boolean
}

class BlockchainService {
  private transactions: Transaction[] = []
  private wallet: WalletInfo | null = null

  /**
   * Simulate wallet connection
   */
  async connectWallet(): Promise<WalletInfo> {
    // Simulate MetaMask connection delay
    await this.delay(1500)

    const hex = this.generateRandomHex(40)
    const mockWallet: WalletInfo = {
      address: '0x' + hex,
      balance: Math.floor((hex.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 80) + 20),
      network: 'Polygon Mumbai Testnet',
      connected: true
    }

    this.wallet = mockWallet
    return mockWallet
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet(): void {
    this.wallet = null
  }

  /**
   * Get current wallet info
   */
  getWallet(): WalletInfo | null {
    return this.wallet
  }

  /**
   * Mint carbon credits as NFTs
   */
  async mintCredits(
    projectId: number,
    amount: number,
    recipientAddress: string
  ): Promise<Transaction> {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    const tx: Transaction = {
      txHash: '0x' + this.generateRandomHex(64),
      type: 'MINT',
      from: '0x0000000000000000000000000000000000000000', // Null address for minting
      to: recipientAddress,
      amount,
      timestamp: new Date().toISOString(),
      status: 'pending',
      projectId
    }

    this.transactions.push(tx)

    // Simulate blockchain confirmation
    await this.delay(3000)
    
    tx.status = 'confirmed'
    tx.blockNumber = 5000000 + (projectId * 12345) % 1000000
    tx.gasUsed = (0.001 + (amount % 100) / 100000).toFixed(6)

    return tx
  }

  /**
   * Transfer carbon credits between addresses
   */
  async transferCredits(
    to: string,
    amount: number,
    projectId?: number
  ): Promise<Transaction> {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    const tx: Transaction = {
      txHash: '0x' + this.generateRandomHex(64),
      type: 'TRANSFER',
      from: this.wallet.address,
      to,
      amount,
      timestamp: new Date().toISOString(),
      status: 'pending',
      projectId
    }

    this.transactions.push(tx)

    // Simulate blockchain confirmation
    await this.delay(2500)
    
    tx.status = 'confirmed'
    tx.blockNumber = 5000000 + (amount * 999 + (projectId ?? 0)) % 1000000
    tx.gasUsed = (0.001 + (amount % 50) / 100000).toFixed(6)

    return tx
  }

  /**
   * Approve spending of credits
   */
  async approveCredits(
    spender: string,
    amount: number
  ): Promise<Transaction> {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    const tx: Transaction = {
      txHash: '0x' + this.generateRandomHex(64),
      type: 'APPROVE',
      from: this.wallet.address,
      to: spender,
      amount,
      timestamp: new Date().toISOString(),
      status: 'pending'
    }

    this.transactions.push(tx)

    await this.delay(2000)
    
    tx.status = 'confirmed'
    tx.blockNumber = 5000000 + (amount * 777) % 1000000
    tx.gasUsed = (0.001 + (amount % 30) / 100000).toFixed(6)

    return tx
  }

  /**
   * Get transaction history
   */
  getTransactions(): Transaction[] {
    return [...this.transactions].reverse() // Most recent first
  }

  /**
   * Get single transaction by hash
   */
  getTransaction(txHash: string): Transaction | undefined {
    return this.transactions.find(tx => tx.txHash === txHash)
  }

  /**
   * Verify transaction on blockchain
   */
  async verifyTransaction(txHash: string): Promise<boolean> {
    await this.delay(1000)
    const tx = this.getTransaction(txHash)
    return tx?.status === 'confirmed'
  }

  /**
   * Get credit balance for an address
   */
  async getCreditBalance(address: string): Promise<number> {
    await this.delay(500)
    
    // Calculate based on transactions
    let balance = 0
    this.transactions.forEach(tx => {
      if (tx.status === 'confirmed') {
        if (tx.to === address) {
          balance += tx.amount
        }
        if (tx.from === address && tx.type !== 'APPROVE') {
          balance -= tx.amount
        }
      }
    })
    
    return Math.max(0, balance)
  }

  /**
   * Get blockchain explorer URL
   */
  getExplorerUrl(txHash: string): string {
    return `https://mumbai.polygonscan.com/tx/${txHash}`
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(type: 'MINT' | 'TRANSFER' | 'APPROVE'): Promise<string> {
    await this.delay(300)
    
    const gasEstimates = {
      MINT: '0.012',
      TRANSFER: '0.008',
      APPROVE: '0.005'
    }
    
    return gasEstimates[type]
  }

  // Helper methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateRandomHex(length: number): string {
    let result = ''
    const characters = '0123456789abcdef'
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  /**
   * Get contract address (mock)
   */
  getContractAddress(): string {
    return '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  }

  /**
   * Get network info
   */
  getNetworkInfo() {
    return {
      name: 'Polygon Mumbai Testnet',
      chainId: 80001,
      rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      blockExplorer: 'https://mumbai.polygonscan.com',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      }
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService()

