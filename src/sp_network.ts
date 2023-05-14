type PBox = { initPosition: number; finalPosition: number };
export class SP_Network_Encryption {
    // S-box mappings
    private static readonly S_Box1Tetrad: { [key: string]: string } = { '0': 'a', '1': '6', '2': 'f', '3': '0', '4': '1', '5': '2', '6': '4', '7': 'd', '8': '9', '9': '3', a: '8', b: 'e', c: 'c', d: '7', e: '5', f: 'b' };
    private static readonly S_Box2Tetrad: { [key: string]: string } = { '0': '2', '1': '5', '2': 'a', '3': 'f', '4': '6', '5': 'd', '6': '0', '7': 'e', '8': 'b', '9': '4', a: 'c', b: '7', c: '9', d: '8', e: '1', f: '3' };

    // Inverse S-box mappings
    private static readonly S_Box1TetradInverse: { [key: string]: string } = { '0': '3', '1': '4', '2': '5', '3': '9', '4': '6', '5': 'e', '6': '1', '7': 'd', '8': 'a', '9': '8', a: '0', b: 'f', c: 'c', d: '7', e: 'b', f: '2' };
    private static readonly S_Box2TetradInverse: { [key: string]: string } = { '0': '6', '1': 'e', '2': '0', '3': 'f', '4': '9', '5': '1', '6': '4', '7': 'b', '8': 'd', '9': 'c', a: '2', b: '8', c: 'a', d: '5', e: '7', f: '3' };

    // P-box mappings
    private static readonly P_Box: PBox[] = [
        {
            initPosition: 0,
            finalPosition: 4,
        },
        {
            initPosition: 1,
            finalPosition: 3,
        },
        {
            initPosition: 2,
            finalPosition: 7,
        },
        {
            initPosition: 3,
            finalPosition: 0,
        },
        {
            initPosition: 4,
            finalPosition: 1,
        },
        {
            initPosition: 5,
            finalPosition: 6,
        },
        {
            initPosition: 6,
            finalPosition: 2,
        },
        {
            initPosition: 7,
            finalPosition: 5,
        },
    ];

    private static checkRange(uint8: number): void {
        if (uint8 > 255 || uint8 < 0) {
            throw new Error('Error: max integer range [0,255], 8 bits');
        }
    }

    // Substitutes hex to hex
    private static substitute(tetrad: string, sBox: { [key: string]: string }): string {
        const newValue16 = sBox[tetrad];
        return newValue16;
    }

    private static perturb(input: number, pBox: PBox[], inverse: boolean = false): number {
        // Convert the input to binary string representation
        let binary: string = input.toString(2).padStart(8, '0');

        // Convert the binary string to an array of bits
        let bits: string[] = Array.from(binary);

        const perturbed: string[] = [];
        for (let index = 0; index < bits.length; index++) {
            if (inverse) {
                // @ts-ignore
                const p: PBox = pBox.find((e) => e.finalPosition === index);
                perturbed[p.initPosition] = bits[index];
            } else {
                // @ts-ignore
                const p: PBox = pBox.find((e) => e.initPosition === index);
                perturbed[p.finalPosition] = bits[index];
            }
        }

        // Convert the modified bits array back to a binary string
        binary = perturbed.join('');

        // Convert the binary string to an integer output
        let output = parseInt(binary, 2);

        return output;
    }

    public static encrypt(plainText: number): number {
        SP_Network_Encryption.checkRange(plainText);

        // convert to 16
        const input16: string = plainText.toString(16).padStart(2, '0');
        // substitute
        const substitutedFirstTetrad = SP_Network_Encryption.substitute(input16[0], SP_Network_Encryption.S_Box1Tetrad);
        const substitutedSecondTetrad = SP_Network_Encryption.substitute(input16[1], SP_Network_Encryption.S_Box2Tetrad);

        // get number from hex
        const substituted: number = parseInt(`${substitutedFirstTetrad}${substitutedSecondTetrad}`, 16);

        // perturb
        const perturbed = SP_Network_Encryption.perturb(substituted, SP_Network_Encryption.P_Box);

        return perturbed;
    }

    public static decrypt(plainText: number): number {
        SP_Network_Encryption.checkRange(plainText);

        // perturb
        const perturbed = SP_Network_Encryption.perturb(plainText, SP_Network_Encryption.P_Box, true);

        // convert to 16
        const perturbed16: string = perturbed.toString(16).padStart(2, '0');

        // substitute
        const substitutedFirstTetrad = SP_Network_Encryption.substitute(perturbed16[0], SP_Network_Encryption.S_Box1TetradInverse);
        const substitutedSecondTetrad = SP_Network_Encryption.substitute(perturbed16[1], SP_Network_Encryption.S_Box2TetradInverse);

        // get number from hex
        const substituted: number = parseInt(`${substitutedFirstTetrad}${substitutedSecondTetrad}`, 16);

        return substituted;
    }
}

function main() {
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
}

main();
