import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("OcearaMRVRegistry", function ()  {

  const { ethers } = await network.connect();

  async function deployRegistry() {
    const [admin, projectOwner, verifier, stranger] =
      await ethers.getSigners();

    const Registry =
      await ethers.getContractFactory("OcearaMRVRegistry");

    const registry = await Registry.deploy();

    await registry.waitForDeployment();

    return {
      registry,
      admin,
      projectOwner,
      verifier,
      stranger,
    };
  }

  describe("Deployment", function () {

    it("should set deployer as admin", async function () {
      const {
        registry,
        admin
      } = await deployRegistry();

      expect(await registry.admin())
        .to.equal(admin.address);
    });

    it("should authorize deployer as verifier", async function () {
      const {
        registry,
        admin
      } = await deployRegistry();

      expect(
        await registry.verifiers(admin.address)
      ).to.equal(true);
    });

  });

  describe("Verifier Management", function () {

    it("should allow admin to add a verifier", async function () {

      const {
        registry,
        admin,
        verifier
      } = await deployRegistry();

      await registry
        .connect(admin)
        .setVerifier(verifier.address, true);

      expect(
        await registry.verifiers(verifier.address)
      ).to.equal(true);
    });

    it("should prevent non-admin from adding a verifier", async function () {

      const {
        registry,
        stranger,
        verifier
      } = await deployRegistry();

      await expect(
        registry
          .connect(stranger)
          .setVerifier(verifier.address, true)
      ).to.be.revertedWith("Only admin");
    });

  });

  describe("Project Registration", function () {

    it("should register a project", async function () {

      const {
        registry,
        projectOwner
      } = await deployRegistry();

      await registry
        .connect(projectOwner)
        .registerProject(
          "OCEARA-001",
          "location-hash-001"
        );

      const project =
        await registry.getProject("OCEARA-001");

      expect(project[0])
        .to.equal("OCEARA-001");

      expect(project[1])
        .to.equal(projectOwner.address);

      expect(project[2])
        .to.equal("location-hash-001");

      expect(project[4])
        .to.equal(0); // PENDING
    });

    it("should reject duplicate project IDs", async function () {

      const {
        registry,
        projectOwner
      } = await deployRegistry();

      await registry
        .connect(projectOwner)
        .registerProject(
          "OCEARA-001",
          "location-hash-001"
        );

      await expect(
        registry
          .connect(projectOwner)
          .registerProject(
            "OCEARA-001",
            "another-location"
          )
      ).to.be.revertedWith(
        "Project already exists"
      );
    });

  });

  describe("MRV Submission", function () {

    it("should allow project owner to submit MRV", async function () {

      const {
        registry,
        projectOwner
      } = await deployRegistry();

      await registry
        .connect(projectOwner)
        .registerProject(
          "OCEARA-001",
          "location-hash-001"
        );

      await registry
        .connect(projectOwner)
        .submitMRV(
          "OCEARA-001",
          "mrv-hash-001",
          1500,
          750
        );

      const mrv =
        await registry.getMRV("OCEARA-001");

      expect(mrv[0])
        .to.equal("mrv-hash-001");

      expect(mrv[1])
        .to.equal(1500);

      expect(mrv[2])
        .to.equal(750);

      expect(mrv[3])
        .to.equal(projectOwner.address);
    });

    it("should prevent another wallet from submitting MRV", async function () {

      const {
        registry,
        projectOwner,
        stranger
      } = await deployRegistry();

      await registry
        .connect(projectOwner)
        .registerProject(
          "OCEARA-001",
          "location-hash-001"
        );

      await expect(
        registry
          .connect(stranger)
          .submitMRV(
            "OCEARA-001",
            "fake-mrv",
            100,
            50
          )
      ).to.be.revertedWith(
        "Not project owner"
      );
    });

    it("should reject MRV for an unknown project", async function () {

      const {
        registry,
        projectOwner
      } = await deployRegistry();

      await expect(
        registry
          .connect(projectOwner)
          .submitMRV(
            "UNKNOWN",
            "mrv-hash",
            100,
            50
          )
      ).to.be.revertedWith(
        "Project does not exist"
      );
    });

  });

  describe("Project Verification", function () {

    it("should prevent unauthorized verification", async function () {

      const {
        registry,
        projectOwner,
        stranger
      } = await deployRegistry();

      await registry
        .connect(projectOwner)
        .registerProject(
          "OCEARA-001",
          "location-hash-001"
        );

      await registry
        .connect(projectOwner)
        .submitMRV(
          "OCEARA-001",
          "mrv-hash-001",
          1500,
          750
        );

      await expect(
        registry
          .connect(stranger)
          .verifyProject("OCEARA-001")
      ).to.be.revertedWith(
        "Not authorized verifier"
      );
    });

    it("should verify a project when called by a verifier", async function () {

      const {
        registry,
        admin,
        projectOwner
      } = await deployRegistry();

      await registry
        .connect(projectOwner)
        .registerProject(
          "OCEARA-001",
          "location-hash-001"
        );

      await registry
        .connect(projectOwner)
        .submitMRV(
          "OCEARA-001",
          "mrv-hash-001",
          1500,
          750
        );

      await registry
        .connect(admin)
        .verifyProject("OCEARA-001");

      const project =
        await registry.getProject("OCEARA-001");

      expect(project[4])
        .to.equal(1); // VERIFIED
    });

    it("should reject verification without an MRV record", async function () {

      const {
        registry,
        admin,
        projectOwner
      } = await deployRegistry();

      await registry
        .connect(projectOwner)
        .registerProject(
          "OCEARA-001",
          "location-hash-001"
        );

      await expect(
        registry
          .connect(admin)
          .verifyProject("OCEARA-001")
      ).to.be.revertedWith(
        "MRV record does not exist"
      );
    });

  });

  describe("Project Rejection", function () {

    it("should allow verifier to reject a project", async function () {

      const {
        registry,
        admin,
        projectOwner
      } = await deployRegistry();

      await registry
        .connect(projectOwner)
        .registerProject(
          "OCEARA-001",
          "location-hash-001"
        );

      await registry
        .connect(admin)
        .rejectProject("OCEARA-001");

      const project =
        await registry.getProject("OCEARA-001");

      expect(project[4])
        .to.equal(2); // REJECTED
    });

  });

});