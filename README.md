# Working with elliptic curves (custom)

## Using secp192r1 params for keys generation and ECDH Signature

### The **EllipticCurve** class is designed to wrapp tinyec library that implements all elliptic curve logic. There no use standard approved curves, other libs provide all options for using ecc. Here is class and examples for understanding only.
### The **EllipticCurveSignature** class is designed to create ECC Asymmetric Key Pair, sign messages and verify signatures.


### Implemented functions:
- get_key_pair
- sign_message
- verify_signed_message
- helper functions:
    - _generate_coprime
    - _hash_to_number
    
### To run locally:
``` 
pip install pycryptodome
pip install primePy
pip install tinyec
pip install sympy
python3 ecc.py
```

### Execution result:
![](/img/2023-07-09_19-01.png "Test")

### Resources 
Description ECC Signature Algorithm:
- https://wizardforcel.gitbooks.io/practical-cryptography-for-developers-book/content/digital-signatures/eddsa-and-ed25519.html

Demonstration ECC Signature Algorithm:
- https://www.youtube.com/watch?v=6TI5YOpnrgI