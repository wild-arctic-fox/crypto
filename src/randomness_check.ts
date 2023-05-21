import * as crypto from 'crypto';

type bin = '0' | '1';
type range = { min: number; max: number };

export class RandomCheckFIPS140 {
    public static readonly ONE: bin = '1';
    public static readonly ZERO: string = '0';
    public static readonly MONO_MAX: number = 10346;
    public static readonly MONO_MIN: number = 9654;
    public static readonly SERIES_MAX_REGEX: RegExp = /(0{36,})|(1{36,})/;
    public static readonly POKER_RANGE: range = { min: 1.03, max: 57.4 };
    public static readonly POKER_BLOCK_SIZE: number = 4;
    public static readonly SERIES_SEQUENCE_RANGES: { [key: string]: range } = {
        '1': { min: 2267, max: 2733 },
        '2': { min: 1079, max: 1421 },
        '3': { min: 502, max: 748 },
        '4': { min: 223, max: 402 },
        '5': { min: 90, max: 223 },
        '6+': { min: 90, max: 223 },
    };

    public static checkMonobits = (bits: bin[]): boolean => {
        const min = RandomCheckFIPS140.MONO_MIN;
        const max = RandomCheckFIPS140.MONO_MAX;

        if (bits.filter((e) => e === RandomCheckFIPS140.ZERO).length >= min && bits.filter((e) => e === RandomCheckFIPS140.ZERO).length <= max) {
            return true;
        }
        return false;
    };

    public static checkSeriesSize = (bits: bin[]): boolean => {
        const regex = RandomCheckFIPS140.SERIES_MAX_REGEX;
        const match = regex.test(bits.join(''));

        return !match;
    };

    public static checkSequenceSizes = (bits: bin[]): boolean => {
        const sequences = [];
        let seqStart = 0;
        for (let index = 1; index < bits.length; index++) {
            const element = bits[index];
            const prev = bits[index - 1];
            if (element !== prev) {
                // stop sequence
                const seqStop = index - 1;
                const size = seqStop - seqStart + 1;
                sequences.push({ size, num: prev });
                seqStart = index;
            }
            if (index === bits.length - 1) {
                // end sequence
                const size = index - seqStart + 1;
                sequences.push({ size, num: prev });
            }
        }

        const countsOnes: { [key: string]: number } = {};
        const countsZeros: { [key: string]: number } = {};
        sequences.forEach(({ num, size }) => {
            if (num === RandomCheckFIPS140.ONE) {
                size >= 6 ? (countsOnes['6+'] = (countsOnes['6+'] || 0) + 1) : (countsOnes[size] = (countsOnes[size] || 0) + 1);
            } else {
                size >= 6 ? (countsZeros['6+'] = (countsZeros['6+'] || 0) + 1) : (countsZeros[size] = (countsZeros[size] || 0) + 1);
            }
        });

        console.log(`Ones sequence: `);
        console.log(countsOnes);
        console.log(`Zeros sequence: `);
        console.log(countsZeros);

        return (
            countsOnes['1'] >= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[1].min &&
            countsOnes['1'] <= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[1].max &&
            countsOnes['2'] >= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[2].min &&
            countsOnes['2'] <= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[2].max &&
            countsOnes['3'] >= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[3].min &&
            countsOnes['3'] <= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[3].max &&
            countsOnes['4'] >= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[4].min &&
            countsOnes['4'] <= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[4].max &&
            countsOnes['5'] >= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[5].min &&
            countsOnes['5'] <= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[5].max &&
            countsOnes['6+'] >= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES['6+'].min &&
            countsOnes['6+'] <= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES['6+'].max &&
            countsZeros['1'] >= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[1].min &&
            countsZeros['1'] <= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[1].max &&
            countsZeros['2'] >= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[2].min &&
            countsZeros['2'] <= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[2].max &&
            countsZeros['3'] >= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[3].min &&
            countsZeros['3'] <= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[3].max &&
            countsZeros['4'] >= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[4].min &&
            countsZeros['4'] <= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[4].max &&
            countsZeros['5'] >= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[5].min &&
            countsZeros['5'] <= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES[5].max &&
            countsZeros['6+'] >= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES['6+'].min &&
            countsZeros['6+'] <= RandomCheckFIPS140.SERIES_SEQUENCE_RANGES['6+'].max
        );
    };

    public static checkPoker = (bits: bin[]): boolean => {
        const m = RandomCheckFIPS140.POKER_BLOCK_SIZE;
        const k = bits.length / m;

        // split by 4bits sequences
        let blocks: string[] = bits.join('').match(/.{1,4}/g);

        // count 4bits sequences
        const counts: { [key: string]: number } = {};
        blocks.forEach((el) => {
            counts[el] = (counts[el] || 0) + 1;
        });

        // Poker formula
        const n: number[] = Object.values(counts);
        const limit = Math.pow(2, m);
        let x = 0;
        for (let i = 1; i <= limit; i++) {
            x += Math.pow(n[i - 1], 2);
        }
        const x3 = (Math.pow(2, m) / k) * x - k;

        console.log(`Poker coeff: ${x3}`);

        return x3 >= RandomCheckFIPS140.POKER_RANGE.min && x3 <= RandomCheckFIPS140.POKER_RANGE.max;
    };
}

function generateSecureRandomFixedBitSequence(bitLength: number): string {
    const byteLength = Math.ceil(bitLength / 32);
    const randomBytes = new Uint32Array(byteLength);
    crypto.getRandomValues(randomBytes);

    let binaryString = '';
    randomBytes.forEach((byte) => {
        binaryString += byte.toString(2).padStart(32, '0');
    });

    return binaryString.slice(0, bitLength);
}

function generateUnbalancedRandomFixedBitSequence(bitLength: number): string {
    let sequence = '';
    for (let i = 0; i < bitLength; i++) {
        const bit = Math.random() < 0.65 ? 0 : 1;
        sequence += bit;
    }
    return sequence;
}

function main() {
    const bitLength = 20_000;

    const randomSequenceUnbalanced = generateUnbalancedRandomFixedBitSequence(bitLength).split('') as bin[];

    console.log(`Monobit check success: ${RandomCheckFIPS140.checkMonobits(randomSequenceUnbalanced)}`);
    console.log(`Series36 check success: ${RandomCheckFIPS140.checkSeriesSize(randomSequenceUnbalanced)}`);
    console.log(`Sequence check success: ${RandomCheckFIPS140.checkSequenceSizes(randomSequenceUnbalanced)}`);
    console.log(`Poker check success: ${RandomCheckFIPS140.checkPoker(randomSequenceUnbalanced)}`);
    console.log(`----------------------------------------------------------------------------------------`);

    const randomSequence = generateSecureRandomFixedBitSequence(bitLength).split('') as bin[];

    console.log(`Monobit check success: ${RandomCheckFIPS140.checkMonobits(randomSequence)}`);
    console.log(`Series36 check success: ${RandomCheckFIPS140.checkSeriesSize(randomSequence)}`);
    console.log(`Sequence check success: ${RandomCheckFIPS140.checkSequenceSizes(randomSequence)}`);
    console.log(`Poker check success: ${RandomCheckFIPS140.checkPoker(randomSequence)}`);
}

main();
