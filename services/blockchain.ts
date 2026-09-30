import { BrowserProvider, Contract, TransactionResponse } from "ethers";
import { OCEARA_MRV_REGISTRY_ABI } from "@/blockchain/OcearaMRVRegistry.abi";

const CONTRACT_ADDRESS =
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export interface Transaction {
  txHash: string;
  type: 'MINT' | 'TRANSFER' | 'BURN' | 'APPROVE';
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  projectId?: number;
}

export interface WalletInfo {
  address: string;
  balance: number;
  network: string;
  connected: boolean;
  chainId?: number;
}

export interface ProjectData {
  projectId: string;
  owner: string;
  locationHash: string;
  createdAt: number;
  status: number;
}

export interface MRVData {
  mrvHash: string;
  biomass: number;
  carbonEstimate: number;
  submittedBy: string;
  timestamp: number;
}

class BlockchainService {
  private provider: BrowserProvider | null = null;
  private contract: Contract | null = null;

  async connectWallet(): Promise<WalletInfo> {
    if (typeof window === "undefined") {
      throw new Error("Wallet connection is only available in the browser");
    }

    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      throw new Error("MetaMask is not installed");
    }

    this.provider = new BrowserProvider(ethereum);

    await this.provider.send("eth_requestAccounts", []);

    const signer = await this.provider.getSigner();
    const address = await signer.getAddress();
    const network = await this.provider.getNetwork();
    const balance = await this.provider.getBalance(address);

    this.contract = new Contract(
      CONTRACT_ADDRESS,
      OCEARA_MRV_REGISTRY_ABI,
      signer
    );

    return {
      address,
      balance: Number(balance) / 1e18,
      network: network.name,
      connected: true,
      chainId: Number(network.chainId),
    };
  }

  disconnectWallet(): void {
    this.provider = null;
    this.contract = null;
  }

  getWallet(): WalletInfo | null {
    return null;
  }

  /*
   * Legacy UI compatibility.
   * The old wallet screen expects transaction history.
   * Registry transactions will be added here as we integrate the UI.
   */
  getTransactions(): Transaction[] {
    return [];
  }

  getTransaction(_txHash: string): Transaction | undefined {
    return undefined;
  }

  async verifyTransaction(_txHash: string): Promise<boolean> {
    return false;
  }

  async getCreditBalance(_address: string): Promise<number> {
    return 0;
  }

  getExplorerUrl(txHash: string): string {
    return `http://127.0.0.1:8545/tx/${txHash}`;
  }

  async registerProject(
    projectId: string,
    locationHash: string
  ) {
    this.ensureContract();

    const tx: TransactionResponse =
      await this.contract!.registerProject(
        projectId,
        locationHash
      );

    const receipt = await tx.wait();

    return {
      txHash: receipt?.hash ?? tx.hash,
      projectId,
      status: "confirmed",
    };
  }

  async submitMRV(
    projectId: string,
    mrvHash: string,
    biomass: number,
    carbonEstimate: number
  ) {
    this.ensureContract();

    const tx: TransactionResponse =
      await this.contract!.submitMRV(
        projectId,
        mrvHash,
        biomass,
        carbonEstimate
      );

    const receipt = await tx.wait();

    return {
      txHash: receipt?.hash ?? tx.hash,
      projectId,
      status: "confirmed",
    };
  }

  async verifyProject(projectId: string) {
    this.ensureContract();

    const tx: TransactionResponse =
      await this.contract!.verifyProject(projectId);

    const receipt = await tx.wait();

    return {
      txHash: receipt?.hash ?? tx.hash,
      projectId,
      status: "verified",
    };
  }

  async rejectProject(projectId: string) {
    this.ensureContract();

    const tx: TransactionResponse =
      await this.contract!.rejectProject(projectId);

    const receipt = await tx.wait();

    return {
      txHash: receipt?.hash ?? tx.hash,
      projectId,
      status: "rejected",
    };
  }

  async getProject(
    projectId: string
  ): Promise<ProjectData> {
    this.ensureContract();

    const result =
      await this.contract!.getProject(projectId);

    return {
      projectId: result[0],
      owner: result[1],
      locationHash: result[2],
      createdAt: Number(result[3]),
      status: Number(result[4]),
    };
  }

  async getMRV(
    projectId: string
  ): Promise<MRVData> {
    this.ensureContract();

    const result =
      await this.contract!.getMRV(projectId);

    return {
      mrvHash: result[0],
      biomass: Number(result[1]),
      carbonEstimate: Number(result[2]),
      submittedBy: result[3],
      timestamp: Number(result[4]),
    };
  }

  async isVerifier(address: string): Promise<boolean> {
    this.ensureContract();

    return await this.contract!.verifiers(address);
  }

  getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }

  getProvider(): BrowserProvider | null {
    return this.provider;
  }

  getNetworkInfo() {
    return {
      name: "Hardhat Local",
      chainId: 31337,
      rpcUrl: "http://127.0.0.1:8545",
      blockExplorer: "http://127.0.0.1:8545",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
    };
  }

  async estimateGas(
    _type: 'MINT' | 'TRANSFER' | 'APPROVE'
  ): Promise<string> {
    return "0";
  }

  private ensureContract() {
    if (!this.contract) {
      throw new Error(
        "Wallet not connected. Connect MetaMask first."
      );
    }
  }
}

export const blockchainService =
  new BlockchainService();