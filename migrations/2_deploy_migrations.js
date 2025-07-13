const FileStorage = artifacts.require("FileUpload");

module.exports = function (deployer) {
  deployer.deploy(FileStorage);
};
