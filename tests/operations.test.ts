import { GigantoUnsignedInteger, ERadix } from '../src/huge_num';

describe('Giganto numbers creation and format Test', () => {
    test('Test Creating from HEX', () => {
        const x: GigantoUnsignedInteger = new GigantoUnsignedInteger({
            radix: ERadix.Hex,
            value: '36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80',
        });

        const result = BigInt('0x36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80');
        expect(x.getBin()).toBe(result.toString(2));
    });
    test('Test Creating from BIN', () => {
        const x: GigantoUnsignedInteger = new GigantoUnsignedInteger({
            radix: ERadix.Binary,
            value: '1010111000101011101010111010101110101011101010111010101110',
        });

        const result = BigInt('0b1010111000101011101010111010101110101011101010111010101110');
        expect(x.getHex()).toBe(result.toString(16));
    });
    test('Test Creating from Uint8Array', () => {
        const x: GigantoUnsignedInteger = new GigantoUnsignedInteger({
            bytes: new Uint8Array([255, 174, 0, 174]),
        });

        const result = 'ffae00ae';
        expect(x.getHex()).toBe(result);
    });
});

describe('Logical Operations Test', () => {
    /////////////////////////////////////////////////
    // Init values
    const x: GigantoUnsignedInteger = new GigantoUnsignedInteger({
        radix: ERadix.Hex,
        value: '51bf608414ad5726a3c1bec098f77b1b54ffb2787f8d528a74c1d7fde6470ea4',
    });
    const y: GigantoUnsignedInteger = new GigantoUnsignedInteger({
        radix: ERadix.Hex,
        value: '403db8ad88a3932a0b7e8189aed9eeffb8121dfac05c3512fdb396dd73f6331c',
    });
    test('Test AND', () => {
        // x AND y
        const result: string = '403d208400a113220340808088d16a1b10121078400c1002748196dd62460204';
        expect(x.and(y).getHex()).toBe(result);
    });
    test('Test OR', () => {
        // x OR y
        const result: string = '51bff8ad9cafd72eabffbfc9befffffffcffbffaffdd779afdf3d7fdf7f73fbc';
        expect(x.or(y).getHex()).toBe(result);
    });
    test('Test XOR', () => {
        // x XOR y
        const result: string = '1182d8299c0ec40ca8bf3f49362e95e4ecedaf82bfd167988972412095b13db8';
        expect(x.xor(y).getHex()).toBe(result);
    });
    test('Test shiftLeft', () => {
        // x shiftLeft 13
        const result: string = 'a37ec108295aae4d47837d8131eef636a9ff64f0ff1aa514e983affbcc8e1d48000';
        expect(x.shiftLeft(13).getHex()).toBe(result);
    });
    test('Test shiftRight', () => {
        // x shiftRight 13
        const result: string = '28dfb0420a56ab9351e0df604c7bbd8daa7fd93c3fc6a9453a60ebfef3238';
        expect(x.shiftRight(13).getHex()).toBe(result);
    });
    test('Test Inversion', () => {
        // x Inversion
        const result: string = 'ae409f7beb52a8d95c3e413f670884e4ab004d878072ad758b3e280219b8f15b';
        expect(x.inv().getHex()).toBe(result);
    });
});

describe('Math Operations Test', () => {
    test('Test ADD', () => {
        const x: GigantoUnsignedInteger = new GigantoUnsignedInteger({
            radix: ERadix.Hex,
            value: '36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80',
        });
        const y: GigantoUnsignedInteger = new GigantoUnsignedInteger({
            radix: ERadix.Hex,
            value: '70983d692f648185febe6d6fa607630ae68649f7e6fc45b94680096c06e4fadb',
        });
        // x + y
        const result: string = 'a78865c13b14ae4e25e90771b54963ee2d68c0a64d4a8ba7c6f45ee0e9daa65b';
        expect(x.add(y).getHex()).toBe(result);
    });
    test('Test SUB', () => {
        const x: GigantoUnsignedInteger = new GigantoUnsignedInteger({
            radix: ERadix.Hex,
            value: '33ced2c76b26cae94e162c4c0d2c0ff7c13094b0185a3c122e732d5ba77efebc',
        });
        const y: GigantoUnsignedInteger = new GigantoUnsignedInteger({
            radix: ERadix.Hex,
            value: '22e962951cb6cd2ce279ab0e2095825c141d48ef3ca9dabf253e38760b57fe03',
        });
        // x - y
        const result: string = '10e570324e6ffdbc6b9c813dec968d9bad134bc0dbb061530934f4e59c2700b9';
        expect(x.sub(y).getHex()).toBe(result);
    });
    test('Test MUL (Karatsuba)', () => {
        const x: GigantoUnsignedInteger = new GigantoUnsignedInteger({
            radix: ERadix.Hex,
            value: '7d7deab2affa38154326e96d350deee1',
        });
        const y: GigantoUnsignedInteger = new GigantoUnsignedInteger({
            radix: ERadix.Hex,
            value: '97f92a75b3faf8939e8e98b96476fd22',
        });
        // x * y
        const result: string = '4a7f69b908e167eb0dc9af7bbaa5456039c38359e4de4f169ca10c44d0a416e2';
        expect(x.mul(y).getHex()).toBe(result);
    });
    test('Test Comparation', () => {
        const x: GigantoUnsignedInteger = new GigantoUnsignedInteger({
            radix: ERadix.Hex,
            value: '51bf608414ad5726a3c1bec098f77b1b54ffb2787f8d528a74c1d7fde6470ea4',
        });
        const y: GigantoUnsignedInteger = new GigantoUnsignedInteger({
            radix: ERadix.Hex,
            value: '403db8ad88a3932a0b7e8189aed9eeffb8121dfac05c3512fdb396dd73f6331c',
        });
        // x > < = y
        expect(x.compare(y).toString()).toBe('1');
        expect(y.compare(x).toString()).toBe('-1');
        expect(y.compare(y).toString()).toBe('0');
    });
});
