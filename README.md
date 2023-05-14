# S-boxes & P-boxes

## The **SP_Network_Encryption** class is designed to ecnrypt and decrypt 8bits integers from 0 to 255.

Predefined values stored in S_Box1Tetrad, S_Box2Tetrad, S_Box1TetradInverse, S_Box2TetradInverse, P_Box.

### Implemented functions:
For encryption uses 2 S-boxes to substitute tetrads and 1 P-box that perturb bits.<br>
For decryption uses 1 P-box that perturb bits and 2 inversed S-boxes to substitute tetrads.

### To run localy and check:
```npm i``` <br>
```npm start```

### Usage example:
```
const plainText: number = 174; // AE

console.log(`
PlainText decimal: ${plainText}
PlainText hex: ${plainText.toString(16).padStart(2, '0')}`);

// Expect 0C
const encrypted: number = SP_Network_Encryption.encrypt(plainText);

console.log(`
Encrypted decimal: ${encrypted}
Encrypted hex: ${encrypted.toString(16).padStart(2, '0')}`);

// Expect AE
const decrypt: number = SP_Network_Encryption.decrypt(encrypted);

console.log(`
Decrypted decimal: ${decrypt}
Decrypted hex: ${decrypt.toString(16).padStart(2, '0')}`);
```
### Execution result:
![](/img/2023-05-14_15-36.png "Test")