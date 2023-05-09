export enum ERadix {
    Binary = 2,
    Hex = 16,
}

interface IGigantoBytes {
    bytes: Uint8Array;
}

interface IGigantoString {
    value: string;
    radix: ERadix;
}

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
type IGigantoSource = XOR<IGigantoBytes, IGigantoString>;

export class GigantoUnsignedInteger {
    private magnitude: Uint8Array;
    private bitLength: number;

    private static readonly UINT8_MAX_BIT_AMOUNT: number = 256;
    public static readonly GIGANTO_ONE = GigantoUnsignedInteger.valueOf(new Uint8Array([1]));
    public static readonly GIGANTO_ZERO = GigantoUnsignedInteger.valueOf(new Uint8Array([0]));

    constructor(source: IGigantoSource) {
        if (source.bytes) {
            this.magnitude = source.bytes;
            this.bitLength = source.bytes.length;
        } else {
            if (source.radix === ERadix.Hex) {
                const bytes = this.setHex(source.value);
                this.magnitude = bytes;
                this.bitLength = bytes.length;
            }
            if (source.radix === ERadix.Binary) {
                const bytes = this.setBin(source.value);
                this.magnitude = bytes;
                this.bitLength = bytes.length;
            }
        }
    }

    ///////////////////////////////////////////////////
    // Auxiliary methods

    // The function pads a binary string with leading zeros so that its length is a multiple of 8
    private padBin(bin: string): string {
        if (bin.length % 8 !== 0) {
            const padding = '0'.repeat(8 - (bin.length % 8));
            return padding + bin;
        }
        return bin;
    }

    // The function takes a string representing a hexadecimal value and pads it with a leading "0" if the length of the string is odd.
    private padHex(hex: string): string {
        if (hex.length % 2 !== 0) {
            return '0' + hex;
        }
        return hex;
    }

    // The function creates a Uint8Array from a hexadecimal value
    private setHex(hexString: string): Uint8Array {
        let hex = hexString;
        if (hex.length % 2 !== 0) {
            hex = this.padHex(hex);
        }
        const result = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            result[i / 2] = parseInt(hex.slice(i, i + 2), 16);
        }

        return new Uint8Array(result);
    }

    // The function creates a Uint8Array from a binary value
    private setBin(binaryString: string): Uint8Array {
        let binary = binaryString;
        if (binary.length % 8 !== 0) {
            binary = this.padBin(binary);
        }
        const result = new Uint8Array(binary.length / 8);
        for (let i = 0; i < binary.length; i += 8) {
            const byteString = binary.slice(i, i + 8);
            const byte = parseInt(byteString, 2);
            result[i / 8] = byte;
        }

        return new Uint8Array(result);
    }

    // Helper function to pad a number with leading zeros
    private padNumber(num: string, zeros: any): string {
        return num.padStart(zeros, '0'.repeat(zeros));
    }

    private static replaceFirstZeros(str: string, replacement: string): string {
        let result = str;
        for (let i = 0; i < str.length; i++) {
            if (str[i] !== '0') {
                break;
            }
            result = result.replace('0', replacement);
        }
        return result;
    }

    private static valueOf(mag: Uint8Array): GigantoUnsignedInteger {
        return new GigantoUnsignedInteger({ bytes: mag });
    }

    // Obtaining a number in an comlement code (if the number is negative)
    private getComplementNegativeNumber(bytes: Uint8Array): GigantoUnsignedInteger {
        const gigantoNum = new GigantoUnsignedInteger({ bytes });
        const invertedGigantoNum = gigantoNum.inv();
        const complement = invertedGigantoNum.add(GigantoUnsignedInteger.GIGANTO_ONE);
        return complement;
    }

    // Equalize the lengths of the arrays, adding zeros to the smaller one
    private equalUint8Arrays(arr1: Uint8Array, arr2: Uint8Array): { a: Uint8Array; b: Uint8Array } {
        const maxLength = Math.max(arr1.length, arr2.length);
        const finalArrA = new Uint8Array(maxLength);
        const finalArrB = new Uint8Array(maxLength);
        if (arr1.length > arr2.length) {
            finalArrB.set(arr2, arr1.length - arr2.length);
            finalArrA.set(arr1, 0);
        } else {
            finalArrA.set(arr1, arr2.length - arr1.length);
            finalArrB.set(arr2, 0);
        }
        return {
            a: finalArrA,
            b: finalArrB,
        };
    }

    /////////////////////////////////////////////////////
    // Obtaining giganto numbers in different formats

    // Getting a number as an array of integers (0-255)
    public getUint8Array(): Uint8Array {
        return this.magnitude;
    }

    // Obtaining a number in the hexadecimal number system
    public getHex(): string {
        return GigantoUnsignedInteger.replaceFirstZeros(
            Array.from(this.magnitude)
                .map((byte) => byte.toString(16).padStart(2, '0'))
                .join(''),
            '',
        );
    }

    // Obtaining a number in the binary number system
    public getBin(): string {
        let binaryString: string = '';
        this.magnitude.forEach((byte) => {
            for (let i = 7; i >= 0; i--) {
                binaryString += (byte >> i) & 1 ? '1' : '0';
            }
        });
        return GigantoUnsignedInteger.replaceFirstZeros(binaryString, '');
    }

    /////////////////////////////////////////////////////
    // Logical functions

    // Logical NOT (inversion)
    public inv(): GigantoUnsignedInteger {
        let inverted: Uint8Array = new Uint8Array(this.magnitude.length);
        for (let i = 0; i < this.magnitude.length; i++) {
            const element = this.magnitude[i];
            inverted[i] = ~element;
        }
        return GigantoUnsignedInteger.valueOf(inverted);
    }

    // Logical AND
    public and(num: GigantoUnsignedInteger): GigantoUnsignedInteger {
        const resultLength = Math.min(this.bitLength, num.bitLength);
        const result = new Uint8Array(resultLength);
        for (let i = 0; i < resultLength; i++) {
            result[i] = this.magnitude[this.bitLength - resultLength + i] & num.magnitude[num.bitLength - resultLength + i];
        }
        return GigantoUnsignedInteger.valueOf(result);
    }

    // Logical OR
    public or(num: GigantoUnsignedInteger): GigantoUnsignedInteger {
        const resultLength = Math.max(this.bitLength, num.bitLength);
        const result = new Uint8Array(resultLength);
        for (let i = 0; i < resultLength; i++) {
            result[i] = this.magnitude[this.bitLength - resultLength + i] | num.magnitude[num.bitLength - resultLength + i];
        }
        return GigantoUnsignedInteger.valueOf(result);
    }

    // Logical XOR
    public xor(num: GigantoUnsignedInteger): GigantoUnsignedInteger {
        const resultLength = Math.max(this.bitLength, num.bitLength);
        const result = new Uint8Array(resultLength);
        for (let i = 0; i < resultLength; i++) {
            result[i] = this.magnitude[this.bitLength - resultLength + i] ^ num.magnitude[num.bitLength - resultLength + i];
        }
        return GigantoUnsignedInteger.valueOf(result);
    }

    // Logical shiftLeft
    public shiftLeft(n: number): GigantoUnsignedInteger {
        const bin: string = this.getBin();
        const newBin = `${bin}${'0'.repeat(n)}`;
        return new GigantoUnsignedInteger({
            radix: ERadix.Binary,
            value: newBin,
        });
    }

    // Logical shiftRigth
    public shiftRight(n: number): GigantoUnsignedInteger {
        const bin: string = this.getBin();
        const newBin = `${bin.slice(0, -n)}`;
        return new GigantoUnsignedInteger({
            radix: ERadix.Binary,
            value: newBin,
        });
    }

    ///////////////////////////////////////////////////////////
    // Math methods

    // Math ADD
    public add(num: GigantoUnsignedInteger): GigantoUnsignedInteger {
        const maxLength = Math.max(this.bitLength, num.bitLength);
        const result = new Uint8Array(maxLength);
        const { a: finalArrA, b: finalArrB } = this.equalUint8Arrays(this.magnitude, num.magnitude);

        // We start adding from the end, taking into account the maximum value of Uint8Array [0-255]
        let carry = 0;
        for (let i = maxLength - 1; i >= 0; i--) {
            const sum = (finalArrA[i] || 0) + (finalArrB[i] || 0) + carry;
            if (sum >= GigantoUnsignedInteger.UINT8_MAX_BIT_AMOUNT) {
                result[i] = sum - GigantoUnsignedInteger.UINT8_MAX_BIT_AMOUNT;
                carry = 1;
            } else {
                result[i] = sum;
                carry = 0;
            }
        }

        // We add the carry if it is available
        if (carry > 0) {
            const extendedResult = new Uint8Array(maxLength + 1);
            extendedResult.set(result, 1);
            extendedResult[0] = carry;
            return GigantoUnsignedInteger.valueOf(extendedResult);
        }

        return GigantoUnsignedInteger.valueOf(result);
    }

    // Comparing large numbers
    public compare(num: GigantoUnsignedInteger): number {
        for (let i = 0; i < this.bitLength; i++) {
            if ((this.magnitude[i] || 0) > (num.magnitude[i] || 0)) {
                return 1;
            } else if ((this.magnitude[i] || 0) < (num.magnitude[i] || 0)) {
                return -1;
            }
        }
        return 0;
    }

    // Math subtraction
    public sub(num: GigantoUnsignedInteger): GigantoUnsignedInteger {
        const maxLength = Math.max(this.bitLength, num.bitLength);
        const result = new Uint8Array(maxLength);
        const { a, b } = this.equalUint8Arrays(this.magnitude, num.magnitude);
        let finalArrA: Uint8Array, finalArrB: Uint8Array, isNegative: boolean;
        if (this.compare(num) === -1) {
            finalArrA = b;
            finalArrB = a;
            isNegative = true;
        } else {
            finalArrA = a;
            finalArrB = b;
            isNegative = false;
        }

        // We start subtracting from the end, taking into account the maximum value of Uint8Array [0-255]
        let borrow = 0;
        for (let i = maxLength - 1; i >= 0; i--) {
            if (finalArrA[i] >= finalArrB[i]) {
                if (borrow) {
                    finalArrA[i] = finalArrA[i] - 1;
                    borrow -= 1;
                }
                result[i] = finalArrA[i] - finalArrB[i];
            } else {
                if (borrow) {
                    finalArrA[i] = finalArrA[i] - 1;
                } else {
                    borrow += 1;
                }
                finalArrA[i] = finalArrA[i] + GigantoUnsignedInteger.UINT8_MAX_BIT_AMOUNT;
                const tmp = finalArrA[i] - finalArrB[i];
                result[i] = tmp;
            }
        }

        if (isNegative) {
            // We translate the number into an complement code
            return this.getComplementNegativeNumber(result);
        }

        return GigantoUnsignedInteger.valueOf(result);
    }

    // Math multiplication
    public mul(num: GigantoUnsignedInteger): GigantoUnsignedInteger {
        const x = this.getHex();
        const y = num.getHex();

        const result = this.karatsubaMultiply(x, y);
        return new GigantoUnsignedInteger({
            value: result,
            radix: ERadix.Hex,
        });
    }

    private splitKaratsubaNumber(num: string, half: number): string[] {
        const numStr = num;
        const len = numStr.length;
        const upper = len > half ? numStr.slice(0, len - half) : '0';
        const lower = len > half ? numStr.slice(len - half) : numStr;
        return [upper, lower];
    }

    private karatsubaMultiply(x: string, y: string): string {
        if (x.length === 1 && y.length === 1) {
            return (parseInt(x, 16) * parseInt(y, 16)).toString(16);
        }

        const n = Math.max(x.length, y.length);
        const half = Math.round(n / 2);

        // Split numbers into upper and lower halves
        const [xUpper, xLower] = this.splitKaratsubaNumber(x, half);
        const [yUpper, yLower] = this.splitKaratsubaNumber(y, half);

        // Recursively compute sub-parts
        const p1 = this.karatsubaMultiply(xUpper, yUpper);
        const p2 = this.karatsubaMultiply(xLower, yLower);

        const gig1 = GigantoUnsignedInteger.replaceFirstZeros(
            new GigantoUnsignedInteger({
                value: xUpper,
                radix: ERadix.Hex,
            })
                .add(
                    new GigantoUnsignedInteger({
                        value: xLower,
                        radix: ERadix.Hex,
                    }),
                )
                .getHex(),
            '',
        );
        const gig2 = GigantoUnsignedInteger.replaceFirstZeros(
            new GigantoUnsignedInteger({
                value: yUpper,
                radix: ERadix.Hex,
            })
                .add(
                    new GigantoUnsignedInteger({
                        value: yLower,
                        radix: ERadix.Hex,
                    }),
                )
                .getHex(),
            '',
        );

        const p3 = this.karatsubaMultiply(this.padNumber(gig1, half), this.padNumber(gig2, half));

        const result = BigInt(`0x${p1}`) * BigInt(16 ** (2 * half)) + (BigInt(`0x${p3}`) - BigInt(`0x${p1}`) - BigInt(`0x${p2}`)) * BigInt(16 ** half) + BigInt(`0x${p2}`);
        return result.toString(16);
    }

    /////////////////////////////////////////
    // Super Slow Operations
    private static superSlowMul(multiplierOne: GigantoUnsignedInteger, multiplierTwo: GigantoUnsignedInteger) {
        let result = GigantoUnsignedInteger.GIGANTO_ZERO;
        let count = new GigantoUnsignedInteger({ bytes: multiplierTwo.magnitude });

        while (count.magnitude > GigantoUnsignedInteger.GIGANTO_ZERO.magnitude) {
            result = result.add(multiplierOne);
            count = count.sub(GigantoUnsignedInteger.GIGANTO_ONE);
        }

        return result;
    }

    private superSlowPow(power: GigantoUnsignedInteger) {
        let result = GigantoUnsignedInteger.GIGANTO_ONE;
        let count = new GigantoUnsignedInteger({ bytes: power.magnitude });

        while (count.magnitude > GigantoUnsignedInteger.GIGANTO_ZERO.magnitude) {
            console.log(result);
            result = GigantoUnsignedInteger.superSlowMul(result, this);
            count = count.sub(GigantoUnsignedInteger.GIGANTO_ONE);
        }
        return result;
    }
}

// function mainFunc() {
//     //Uint8Array 0-255

//     let tenarr: Uint8Array = new Uint8Array([107, 205, 21, 7, 91, 205, 21]);

//     // 3034331270950427710
//     // console.log(convert(tenarr));
//     // let arr174: Uint8Array = new Uint8Array([67]);

//     // BigInteger num = new BigInteger("aef56d", 16);
//     // BigInteger num_2 = new BigInteger("f0f0", 16);
//     // BigInteger num_3 = new BigInteger("5c34", 16);

//     let number_2: GigantoUnsignedInteger = new GigantoUnsignedInteger({
//         value: '33ced2c76b26cae94e162c4c0d2c0ff7c13094b0185a3c122e732d5ba77efebc',
//         radix: ERadix.Hex,
//     });
//     let number_3: GigantoUnsignedInteger = new GigantoUnsignedInteger({
//         value: 'f4cd',
//         radix: ERadix.Hex,
//     });
//     let number_4: GigantoUnsignedInteger = new GigantoUnsignedInteger({
//         value: '56',
//         radix: ERadix.Hex,
//     });

//     // console.log(number_3.getDecimal());
//     // console.log(number_2.compare(number_3));
//     // 101001011111001111110000000000000000000000000001
//     // console.log(number_2.getHex(), number_3.getHex());

//     console.log('--------------------------');
//     //  console.log(number_2.sub(number_3).getHex());
//     // console.log(number_2.mod(number_3).getHex());

//     //   number_2.fromAnyRadix('174', 10);
//     // console.log(number_2.superSlowPow(number_3).getHex());

//     console.log(number_2.mod(number_3).getHex());

//     // console.log(GigantoUnsignedInteger.superSlowPow(number_2, number_3).getHex());
//     // console.log(number_3.getDecimal());
//     // console.log(number_2.getHex());
//     //  console.log(number_3.getDecimal());

//     // console.log(new Uint8Array([0x01, 0x74]))

//     // console.log(number_0.getBin())
//     // console.log(number_1.getBin())

//     // console.log(number_0.getHex())
//     // console.log(number_1.getHex())

//     let number_0: GigantoUnsignedInteger = new GigantoUnsignedInteger({
//         value: '33ced2c76b26cae94e162c4c0d2c0ff7c13094b0185a3c122e732d5ba77efebc',
//         radix: ERadix.Hex,
//     });
//     let number_1: GigantoUnsignedInteger = new GigantoUnsignedInteger({
//         value: '22e962951cb6cd2ce279ab0e2095825c141d48ef3ca9dabf253e38760b57fe03',
//         radix: ERadix.Hex,
//     });

//     //  console.log(number_0.getUint8Array(), number_1.getUint8Array());

//     const bin1 =
//         '1000011100101011100000011001001001110011011111111110110111100011010111001110010000001001111011110110010010110100011011001101110101101000100110100101111000000110110111011000001100001010100110000100100110100111101001110010110011100000000000000000001000111';
//     // const bin2 = "101000001110010111100000010100010010100001111100000111111010101111110101011001100100000000000000111001101111000001011011110000101001011000100000001000101110100000110111101000011000101110011010110101110100110010001110100001100110000"

//     // const ten1 =
//     //     '2168900130103760554766560771236255135082610370997465198821022206739248'
//     // const ten2 =
//     //     '1475754734141190620012548283893522514086699508934695626936599685095'

//     // let number_9: GigantoUnsignedInteger = new GigantoUnsignedInteger({
//     //     value: '4c9',
//     //     radix: ERadix.Hex,
//     // });
//     // console.log(number_9.getUint8Array());
//     console.log(number_0.sub(number_1).getHex());
//     // let number_1: GigantoUnsignedInteger = new GigantoUnsignedInteger({
//     //     value: ten2,
//     //     radix: ERadix.Hex,
//     // })

//     // console.log(number_1.and(number_0).getHex());

//     // console.log(number_1.or(number_0).getHex());

//     // console.log(number_1.xor(number_0).getHex());

//     // console.log(number_1.shiftLeft(174).getHex());

//     // console.log(number_1.shiftRight(174).getHex());

//     // console.log(10 >>> 3);

//     // const test = new GigantoUnsignedInteger({
//     //     radix: ERadix.Hex,
//     //     value: '109d',
//     // }).getUint8Array();
//     // console.log('test: ', test);
//     // let number56: GigantoUnsignedInteger = new GigantoUnsignedInteger({ bytes: add(number_0.getUint8Array(), number_1.getUint8Array()) });
//     // console.log(number56.getHex());

//     // console.log('test: ', test.getHex());
//     // console.log(new_num.getHex());

//     // const arr1 = new Uint8Array(hexToUint8Array('5072f028943e0fd5fab3273782de14b1011741bd0c5cd6ba6474330'));
//     // const arr2 = new Uint8Array(hexToUint8Array('e035c6cfa42609b998b883bc1699df885cef74e2b2cc372eb8fa7e7'));

//     // const result = bitwiseAnd(arr1, arr2);

//     // console.log(result); // Uint8Array [ 0x0a ]
// }

// mainFunc();

// // 507cf374f8c44db5612aab8848b9447cb395df8355fbe90e194dc8e4d7
// // 507cf374f8c44db5612aab8848b9447cb395df8355fbe9e194dc8e4d7
