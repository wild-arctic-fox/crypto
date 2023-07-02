# Working with elliptic curves (custom)

## Using secp192r1 params for keys generation and ECDH

### The **EllipticCurve** class is designed to wrapp tinyec library that implements all elliptic curve logic. There no use standard approved curves, other libs provide all options for using ecc. Here is class and examples for understanding only.

### Implemented functions:
- Checks:
    - is_on_curve_check
    - equals_points
- Math operations:
    - double_ec_point
    - scalar_mult
    - add_ec_points
- Internal validation:
    - _validate_positive_int
    - _validate_mod
    - _validate_coordinates
- Other:
    - compress
    - print_ec_point
    - get_generator_point

### To run localy:
``` 
pip install pycryptodome
pip install primePy
pip install tinyec
python3 ecc.py
```

### Execution result:
![](/img/2023-07-02_20-59.png "Test")

### Resources 
https://wizardforcel.gitbooks.io/practical-cryptography-for-developers-book/content/asymmetric-key-ciphers/elliptic-curve-cryptography-ecc.html

http://www.secg.org/sec1-v2.pdf


https://www.youtube.com/watch?v=F3zzNa42-tQ

https://www.youtube.com/watch?v=NF1pwjL9-DE