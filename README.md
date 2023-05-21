# Testing keys for randomness according to the FIPS-140 standard

## The **RandomCheckFIPS140** class is designed to testing keys for randomness according to the FIPS-140 standard (20_000 bits length)

### Implemented functions:
- Functions that generates random bit sequences:
    - generateSecureRandomFixedBitSequence() - generates secure balanced bit sequeces that should pass all tests
    - generateUnbalancedRandomFixedBitSequence() - generates unbalanced bit sequeces that should not pass tests (all or partially)
- Randomness checks:
    - checkMonobits() - monobit test 
    - checkSeriesSize() - test maximum series length (36 bit)
    - checkSequenceSizes() - test series length
    - checkPoker() - poker test

### To run localy use:
```npm i``` <br>
```npm start```

### Test execution result:
![](/img/2023-05-21_14-38.png "Test")

