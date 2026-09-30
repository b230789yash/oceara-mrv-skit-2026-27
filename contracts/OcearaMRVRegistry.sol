// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract OcearaMRVRegistry {

    enum ProjectStatus {
        PENDING,
        VERIFIED,
        REJECTED
    }

    struct Project {
        string projectId;
        address owner;
        string locationHash;
        uint256 createdAt;
        ProjectStatus status;
        bool exists;
    }

    struct MRVRecord {
        string mrvHash;
        uint256 biomass;
        uint256 carbonEstimate;
        address submittedBy;
        uint256 timestamp;
        bool exists;
    }

    address public admin;

    mapping(address => bool) public verifiers;
    mapping(string => Project) private projects;
    mapping(string => MRVRecord) private mrvRecords;

    event ProjectRegistered(
        string indexed projectId,
        address indexed owner,
        string locationHash
    );

    event MRVSubmitted(
        string indexed projectId,
        string mrvHash,
        uint256 biomass,
        uint256 carbonEstimate
    );

    event ProjectVerified(
        string indexed projectId,
        address indexed verifier
    );

    event ProjectRejected(
        string indexed projectId,
        address indexed verifier
    );

    event VerifierUpdated(
        address indexed verifier,
        bool authorized
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Not authorized verifier");
        _;
    }

    constructor() {
        admin = msg.sender;
        verifiers[msg.sender] = true;
    }

    function setVerifier(
        address verifier,
        bool authorized
    ) external onlyAdmin {
        verifiers[verifier] = authorized;

        emit VerifierUpdated(verifier, authorized);
    }

    function registerProject(
        string calldata projectId,
        string calldata locationHash
    ) external {
        require(
            !projects[projectId].exists,
            "Project already exists"
        );

        projects[projectId] = Project({
            projectId: projectId,
            owner: msg.sender,
            locationHash: locationHash,
            createdAt: block.timestamp,
            status: ProjectStatus.PENDING,
            exists: true
        });

        emit ProjectRegistered(
            projectId,
            msg.sender,
            locationHash
        );
    }

    function submitMRV(
        string calldata projectId,
        string calldata mrvHash,
        uint256 biomass,
        uint256 carbonEstimate
    ) external {
        require(
            projects[projectId].exists,
            "Project does not exist"
        );

        require(
            projects[projectId].owner == msg.sender,
            "Not project owner"
        );

        mrvRecords[projectId] = MRVRecord({
            mrvHash: mrvHash,
            biomass: biomass,
            carbonEstimate: carbonEstimate,
            submittedBy: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit MRVSubmitted(
            projectId,
            mrvHash,
            biomass,
            carbonEstimate
        );
    }

    function verifyProject(
        string calldata projectId
    ) external onlyVerifier {
        require(
            projects[projectId].exists,
            "Project does not exist"
        );

        require(
            mrvRecords[projectId].exists,
            "MRV record does not exist"
        );

        projects[projectId].status = ProjectStatus.VERIFIED;

        emit ProjectVerified(projectId, msg.sender);
    }

    function rejectProject(
        string calldata projectId
    ) external onlyVerifier {
        require(
            projects[projectId].exists,
            "Project does not exist"
        );

        projects[projectId].status = ProjectStatus.REJECTED;

        emit ProjectRejected(projectId, msg.sender);
    }

    function getProject(
        string calldata projectId
    )
        external
        view
        returns (
            string memory,
            address,
            string memory,
            uint256,
            ProjectStatus
        )
    {
        require(
            projects[projectId].exists,
            "Project does not exist"
        );

        Project memory project = projects[projectId];

        return (
            project.projectId,
            project.owner,
            project.locationHash,
            project.createdAt,
            project.status
        );
    }

    function getMRV(
        string calldata projectId
    )
        external
        view
        returns (
            string memory,
            uint256,
            uint256,
            address,
            uint256
        )
    {
        require(
            mrvRecords[projectId].exists,
            "MRV record does not exist"
        );

        MRVRecord memory record = mrvRecords[projectId];

        return (
            record.mrvHash,
            record.biomass,
            record.carbonEstimate,
            record.submittedBy,
            record.timestamp
        );
    }
}