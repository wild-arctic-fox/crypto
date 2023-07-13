const { createHash } = require('crypto');

export class SHA_256 {
    //  Initialize Hash Constants (h)
    private static readonly H = {
        h0: 0x6a09e667,
        h1: 0xbb67ae85,
        h2: 0x3c6ef372,
        h3: 0xa54ff53a,
        h4: 0x510e527f,
        h5: 0x9b05688c,
        h6: 0x1f83d9ab,
        h7: 0x5be0cd19,
    };

    //  Initialize Round Constants (k)
    private static readonly K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];

    private static readonly BIT_BLOCK_SIZE: number = 512;
    private static readonly BIT_64: number = 64;

    // Convert Uint8Array to binary string
    private static uint8ArrayToBin(uint8arr: Uint8Array): string {
        let binaryString: string = '';
        uint8arr.forEach((byte) => {
            for (let i = 7; i >= 0; i--) {
                binaryString += (byte >> i) & 1 ? '1' : '0';
            }
        });
        return binaryString;
    }

    private static leftrotate(str: string, d: number) {
        const ans = str.substring(d, str.length) + str.substring(0, d);
        return SHA_256.padZeros(ans);
    }

    // Function that rotates s towards right by d
    private static rightrotate(str: string, d: number) {
        return SHA_256.padZeros(SHA_256.leftrotate(str, str.length - d));
    }

    // Function that shifts s towards right by d
    private static binaryRightShift(binaryString: string, shift: number) {
        let shifted = binaryString.substring(0, binaryString.length - shift);
        const zeros = new Array(shift).fill('0', 0, shift);
        return zeros.join('') + shifted;
    }

    private static padHex(hex: string): string {
        if (hex.length % 2 !== 0) {
            return '0' + hex;
        }
        return hex;
    }

    // /////////////////////////////////
    // Create Message Schedule
    private static createMessageScheduleGently(finalPaddedArr: string): string[] {
        const w = finalPaddedArr.match(/.{1,32}/g);

        // Add 48 more words initialized to zero, such that we have an array w[0…63]
        for (let index = w.length; index <= SHA_256.BIT_64; index++) {
            w.push('00000000000000000000000000000000');
        }

        // For i from w[16…63]:
        for (let i = 16; i < SHA_256.BIT_64; i++) {
            // s0 = (w[i-15] rightrotate 7) xor (w[i-15] rightrotate 18) xor (w[i-15] rightshift 3)
            const s0 = SHA_256.xorMeGently(SHA_256.xorMeGently(SHA_256.rightrotate(w[i - 15], 7), SHA_256.rightrotate(w[i - 15], 18)), SHA_256.binaryRightShift(w[i - 15], 3));

            // s1 = (w[i- 2] rightrotate 17) xor (w[i- 2] rightrotate 19) xor (w[i- 2] rightshift 10)
            const s1 = SHA_256.xorMeGently(SHA_256.xorMeGently(SHA_256.rightrotate(w[i - 2], 17), SHA_256.rightrotate(w[i - 2], 19)), SHA_256.binaryRightShift(w[i - 2], 10));

            // w[i] = w[i - 16] + s0 + w[i - 7] + s1
            w[i] = SHA_256.addMeGently(SHA_256.addMeGently(SHA_256.addMeGently(w[i - 16], s0), w[i - 7]), s1);
        }
        return w;
    }

    // /////////////////////////////////
    // Add Padding (1 bit + zeros + 64 bit message length)
    private static padMeGently(chunks: string[], mLenBit: string): string {
        if (chunks[chunks.length - 1].length <= SHA_256.BIT_BLOCK_SIZE - SHA_256.BIT_64) {
            // padd message
            let lastChunk = chunks[chunks.length - 1];
            lastChunk += '1';
            let paddedArr: string[] = [];

            for (let index = 0; index < SHA_256.BIT_BLOCK_SIZE - mLenBit.length; index++) {
                if (lastChunk[index] === undefined) {
                    paddedArr.push('0');
                } else {
                    paddedArr.push(lastChunk[index]);
                }
            }
            paddedArr = paddedArr.join('').concat(mLenBit).split('');
            return paddedArr.join('');
        } else {
            // TODO
            throw new Error('Not Implemented Yet');
        }
    }

    private static padZeros(str: string, length: number = 32): string {
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }

    private static xorMeGently(str1: string, str2: string): string {
        let xored: any[] = [];
        for (let index = 0; index < str1.length; index++) {
            const element1 = str1[index] === '1' ? 1 : 0;
            const element2 = str2[index] === '1' ? 1 : 0;
            xored.push((element1 ^ element2).toString(2));
        }
        return xored.join('');
    }

    private static andMeGently(str1: string, str2: string): string {
        let anded: any[] = [];
        for (let index = 0; index < str1.length; index++) {
            const element1 = str1[index] === '1' ? 1 : 0;
            const element2 = str2[index] === '1' ? 1 : 0;
            anded.push((element1 & element2).toString(2));
        }
        return anded.join('');
    }

    private static invertMeGently(str1: string): string {
        let inverted: any[] = [];
        for (let index = 0; index < str1.length; index++) {
            const element1 = str1[index] === '1' ? 0 : 1;
            inverted.push(element1.toString(2));
        }
        return inverted.join('');
    }

    private static addMeGently(str1: string, str2: string): string {
        let res = (parseInt(str1, 2) + parseInt(str2, 2)).toString(2);
        if (res.length > 32) {
            res = res.substring(res.length - 32);
        } else {
            res = SHA_256.padZeros(res);
        }
        return res;
    }

    public static hashMeGently(message: string): string {
        const uint8arr = new Uint8Array(Buffer.from(message));
        const binaryMessage = SHA_256.uint8ArrayToBin(uint8arr);
        const messageLength = binaryMessage.length;
        const mLenBit = SHA_256.uint8ArrayToBin(new Uint8Array([messageLength]));

        // /////////////////////////////////
        // Split message to 512 bits chunks
        const chunks = binaryMessage.match(/.{1,512}/g);

        // /////////////////////////////////
        // Pad chunks
        let finalPaddedArr: string = SHA_256.padMeGently(chunks, mLenBit);

        // /////////////////////////////////
        // Create Message Schedule
        const w = SHA_256.createMessageScheduleGently(finalPaddedArr);

        // /////////////////////////////////
        // Commpression

        let a = SHA_256.padZeros(SHA_256.H.h0.toString(2)),
            b = SHA_256.padZeros(SHA_256.H.h1.toString(2)),
            c = SHA_256.padZeros(SHA_256.H.h2.toString(2)),
            d = SHA_256.padZeros(SHA_256.H.h3.toString(2)),
            e = SHA_256.padZeros(SHA_256.H.h4.toString(2)),
            f = SHA_256.padZeros(SHA_256.H.h5.toString(2)),
            g = SHA_256.padZeros(SHA_256.H.h6.toString(2)),
            h = SHA_256.padZeros(SHA_256.H.h7.toString(2));

        //for i from 0 to 63
        for (let i = 0; i < SHA_256.BIT_64; i++) {
            // S1 = (e rightrotate 6) xor (e rightrotate 11) xor (e rightrotate 25)
            const S1 = SHA_256.xorMeGently(SHA_256.xorMeGently(SHA_256.rightrotate(e, 6), SHA_256.rightrotate(e, 11)), SHA_256.rightrotate(e, 25));

            // ch = (e and f) xor ((not e) and g)
            const choice = SHA_256.xorMeGently(SHA_256.andMeGently(e, f), SHA_256.andMeGently(SHA_256.invertMeGently(e), g));

            // temp1 = h + S1 + ch + k[i] + w[i]
            const Temp1 = SHA_256.addMeGently(SHA_256.addMeGently(SHA_256.addMeGently(SHA_256.addMeGently(h, S1), choice), SHA_256.padZeros(SHA_256.K[i].toString(2))), w[i]);

            // S0 = (a rightrotate 2) xor (a rightrotate 13) xor (a rightrotate 22)
            const S0 = SHA_256.xorMeGently(SHA_256.xorMeGently(SHA_256.rightrotate(a, 2), SHA_256.rightrotate(a, 13)), SHA_256.rightrotate(a, 22));

            // maj = (a and b) xor (a and c) xor (b and c)
            const maj = SHA_256.xorMeGently(SHA_256.xorMeGently(SHA_256.andMeGently(a, b), SHA_256.andMeGently(a, c)), SHA_256.andMeGently(b, c));

            // temp2 := S0 + maj
            const Temp2 = SHA_256.addMeGently(S0, maj);

            // update working wars
            h = g;
            g = f;
            f = e;
            e = SHA_256.addMeGently(d, Temp1);
            d = c;
            c = b;
            b = a;
            a = SHA_256.addMeGently(Temp1, Temp2);
        }

        const finalA = SHA_256.padZeros(SHA_256.addMeGently(SHA_256.padZeros(a), SHA_256.padZeros(SHA_256.H.h0.toString(2))));
        const finalB = SHA_256.padZeros(SHA_256.addMeGently(SHA_256.padZeros(b), SHA_256.padZeros(SHA_256.H.h1.toString(2))));
        const finalC = SHA_256.padZeros(SHA_256.addMeGently(SHA_256.padZeros(c), SHA_256.padZeros(SHA_256.H.h2.toString(2))));

        const finalD = SHA_256.padZeros(SHA_256.addMeGently(SHA_256.padZeros(d), SHA_256.padZeros(SHA_256.H.h3.toString(2))));
        const finalE = SHA_256.padZeros(SHA_256.addMeGently(SHA_256.padZeros(e), SHA_256.padZeros(SHA_256.H.h4.toString(2))));
        const finalF = SHA_256.padZeros(SHA_256.addMeGently(SHA_256.padZeros(f), SHA_256.padZeros(SHA_256.H.h5.toString(2))));

        const finalG = SHA_256.padZeros(SHA_256.addMeGently(SHA_256.padZeros(g), SHA_256.padZeros(SHA_256.H.h6.toString(2))));
        const finalH = SHA_256.padZeros(SHA_256.addMeGently(SHA_256.padZeros(h), SHA_256.padZeros(SHA_256.H.h7.toString(2))));

        console.log('a - ', finalA);
        console.log('b - ', finalB);
        console.log('c - ', finalC);

        console.log('d - ', finalD);
        console.log('e - ', finalE);
        console.log('f - ', finalF);

        console.log('g - ', finalG);
        console.log('h - ', finalH);

        const hash =
            SHA_256.padHex(parseInt(finalA, 2).toString(16)) +
            SHA_256.padHex(parseInt(finalB, 2).toString(16)) +
            SHA_256.padHex(parseInt(finalC, 2).toString(16)) +
            SHA_256.padHex(parseInt(finalD, 2).toString(16)) +
            SHA_256.padHex(parseInt(finalE, 2).toString(16)) +
            SHA_256.padHex(parseInt(finalF, 2).toString(16)) +
            SHA_256.padHex(parseInt(finalG, 2).toString(16)) +
            SHA_256.padHex(parseInt(finalH, 2).toString(16));

        console.log(hash);

        return hash;
    }
}

function main() {
    const message = 'wubba lubba dub dub';
    // Max message size 2⁶⁴ for SHA256, 448bits for current implementation
    let start = Date.now();
    const myHash = SHA_256.hashMeGently(message);
    let timeTaken = Date.now() - start;
    console.log('Total time taken for implemented hash: ' + timeTaken + ' milliseconds');

    let start2 = Date.now();
    const cryptoHash = createHash('sha256').update(message).digest('hex');
    let timeTaken2 = Date.now() - start2;
    console.log('Total time taken for embeded Nodejs hash: ' + timeTaken2 + ' milliseconds');

    console.log('Are they equal?', myHash === cryptoHash);
}

main();
