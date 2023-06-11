import java.math.BigInteger;
import java.util.List;

public class Main {
    public static void main(String[] args) {

        String message = "A black horizon approaches. Our scientific advancements have so dramatically " +
                "outpaced those of the human soul that man, a creation defined by passion and" +
                "greed, now stands at the base of a pyramid of knowledge which expands" +
                "heavenward with with no regard for the the frailty of its foundation. We will, as a" +
                "species, surely be crushed beneath its weight.";

        // convert message to numbers
        BigInteger numMessage = new BigInteger(message.getBytes());
        int KEY_LENGTH = 4096;

        // ////////////////////////////////////////////////////
        // check encryption and decryption via ElGamal

        // keys Generations
        List<List<BigInteger>> publicKeysAndSecretKeys = ElGamal.KeyGen(KEY_LENGTH);

        // public keys
        BigInteger p = publicKeysAndSecretKeys.get(0).get(0);
        BigInteger g = publicKeysAndSecretKeys.get(0).get(1);
        BigInteger pubKey = publicKeysAndSecretKeys.get(0).get(2);

        // private key
        BigInteger privKey = publicKeysAndSecretKeys.get(1).get(0);

        // encrypt via ElGamal (using public key)
        List<BigInteger> encrypt = ElGamal.Encrypt(p, g, pubKey, numMessage);

        BigInteger x = encrypt.get(0);
        BigInteger y = encrypt.get(1);

        // decrypt via Elgamal (using private key)
        BigInteger decrypt = ElGamal.Decrypt(p, privKey, x, y);

        // convert numbers to string
        String restoredMessage = new String(decrypt.toByteArray());

        // OUTPUT results
        System.out.println("Message:");
        System.out.println("\n" + message);
        System.out.println("\nPublic keys");
        System.out.println("p : " + p);
        System.out.println("g : " + g);
        System.out.println("pubKey : " + pubKey);
        System.out.println();
        System.out.println("Private key");
        System.out.println("privKey : " + privKey);
        System.out.println();
        System.out.println("Encrypted message");
        System.out.println("x : " + x);
        System.out.println("y : " + y);
        System.out.println();
        System.out.println("Decrypted message : " + decrypt);
        System.out.println("Restored message : " + restoredMessage);
        System.out.println("\nAre they equal? - " + message.equals(restoredMessage));


        // ////////////////////////////////////////////////////
        // check digital signature via ElGamal

        // sign via ElGamal (using private key)
        List<BigInteger> signedMessage = ElGamal.CreateDigitalSignature(p, g, message, privKey);
        BigInteger r = signedMessage.get(0);
        BigInteger s = signedMessage.get(1);

        System.out.println("r: " + r);
        System.out.println("s: " + s);

        // check signature via ElGamal (using public key)
        Boolean check = ElGamal.CheckDigitalSignature(g, p, s, message, pubKey, r);

        System.out.println("Signature verified? : " + check);


        // check incorrect signature
        List<List<BigInteger>> publicKeysAndSecretKeys2 = ElGamal.KeyGen(KEY_LENGTH);
        BigInteger privKey2 = publicKeysAndSecretKeys2.get(1).get(0);
        BigInteger p2 = publicKeysAndSecretKeys.get(0).get(0);
        BigInteger g2 = publicKeysAndSecretKeys.get(0).get(1);
        BigInteger pubKey2 = publicKeysAndSecretKeys.get(0).get(2);

        List<BigInteger> signedMessageIcorrect = ElGamal.CreateDigitalSignature(p2, g2, message, privKey2);
        BigInteger r2 = signedMessageIcorrect.get(0);
        BigInteger s2 = signedMessageIcorrect.get(1);

        System.out.println(" -------------------- ");
        //  check signature via ElGamal (using public key but from previous example)
        Boolean checkIncorrect = ElGamal.CheckDigitalSignature(g2, p2, s2, message, pubKey, r2);

        System.out.println("Signature verified? : " + checkIncorrect);

    }
}