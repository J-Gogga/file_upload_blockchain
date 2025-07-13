// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileUpload {
    struct FileRecord {
        address uploader;
        string fileHash;
        string cid;
        string signature;
        uint256 timestamp;
    }

    FileRecord[] public files;

    mapping(string => bool) public uploadedHashes;

    event FileUploaded(
        address indexed uploader,
        string fileHash,
        string cid,
        string signature,
        uint256 timestamp
    );

    function uploadFile(
        string memory _fileHash,
        string memory _cid,
        string memory _signature
    ) public {
        require(!uploadedHashes[_fileHash], "Duplicate file");

        files.push(FileRecord(msg.sender, _fileHash, _cid, _signature, block.timestamp));
        uploadedHashes[_fileHash] = true;

        emit FileUploaded(msg.sender, _fileHash, _cid, _signature, block.timestamp);
    }

    function verifyFile(string memory _fileHash)
        public
        view
        returns (address uploader, string memory cid, string memory signature, uint256 timestamp)
    {
        for (uint i = 0; i < files.length; i++) {
            if (
                keccak256(abi.encodePacked(files[i].fileHash)) ==
                keccak256(abi.encodePacked(_fileHash))
            ) {
                return (
                    files[i].uploader,
                    files[i].cid,
                    files[i].signature,
                    files[i].timestamp
                );
            }
        }
        return (address(0), "", "", 0);
    }

    function verifySignature(string memory _message, string memory _signature)
        public
        pure
        returns (address)
    {
        bytes32 messageHash = prefixed(keccak256(abi.encodePacked(_message)));
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(messageHash, v, r, s);
    }

    function splitSignature(string memory sig)
        internal
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        bytes memory sigBytes = bytes(sig);
        require(sigBytes.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sigBytes, 32))
            s := mload(add(sigBytes, 64))
            v := byte(0, mload(add(sigBytes, 96)))
        }
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function isAlreadyUploaded(string memory _fileHash) public view returns (bool) {
        return uploadedHashes[_fileHash];
    }
}
