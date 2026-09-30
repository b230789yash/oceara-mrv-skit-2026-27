export const OCEARA_MRV_REGISTRY_ABI = [
  "function admin() view returns (address)",
  "function verifiers(address) view returns (bool)",

  "function setVerifier(address verifier, bool authorized)",

  "function registerProject(string projectId, string locationHash)",

  "function submitMRV(string projectId, string mrvHash, uint256 biomass, uint256 carbonEstimate)",

  "function verifyProject(string projectId)",

  "function rejectProject(string projectId)",

  "function getProject(string projectId) view returns (string, address, string, uint256, uint8)",

  "function getMRV(string projectId) view returns (string, uint256, uint256, address, uint256)",

  "event ProjectRegistered(string indexed projectId, address indexed owner, string locationHash)",

  "event MRVSubmitted(string indexed projectId, string mrvHash, uint256 biomass, uint256 carbonEstimate)",

  "event ProjectVerified(string indexed projectId, address indexed verifier)",

  "event ProjectRejected(string indexed projectId, address indexed verifier)",

  "event VerifierUpdated(address indexed verifier, bool authorized)"
] as const;