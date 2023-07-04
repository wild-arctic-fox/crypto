package src;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

public class Main {

    private static String[] splitMessageByBytes(String message, int maxBytes) {
        int messageLength = message.length();
        int partCount = (int) Math.ceil((double) messageLength / maxBytes);
        String[] splitMessage = new String[partCount];

        for (int i = 0; i < partCount; i++) {
            int startIndex = i * maxBytes;
            int endIndex = Math.min(startIndex + maxBytes, messageLength);
            splitMessage[i] = message.substring(startIndex, endIndex);
        }

        return splitMessage;
    }

    public static void main(String[] args) {

        String message = "" +
                "So the boy . . . the boy must die? asked Snape quite calmly.\n" +
                "And Voldemort himself must do it, Severus. That is essential.\n" +
                "Another long silence. Then Snape said, I thought . . . all those\n" +
                "years . . . that we were protecting him for her. For Lily.\n" +
                "We have protected him because it has been essential to teach\n" +
                "him, to raise him, to let him try his strength, said Dumbledore,\n" +
                "his eyes still tight shut. Meanwhile, the connection between them\n" +
                "grows ever stronger, a parasitic growth. Sometimes I have thought\n" +
                "he suspects it himself. If I know him, he will have arranged matters\n" +
                "so that when he does set out to meet his death, it will truly mean the end of Voldemort.\n" +
                "Dumbledore opened his eyes. Snape looked horrified.\n" +
                "You have kept him alive so that he can die at the right moment?\n" +
                "Don't be shocked, Severus. How many men and women have you watched die?\n" +
                "Lately, only those whom I could not save, said Snape. He stood up. You have used me.\n" +
                "Meaning?" +
                "I have spied for you and lied for you, put myself in mortal danger for you. Everything was supposed to be to keep Lily Potter's\n" +
                "son safe. Now you tell me you have been raising him like a pig for slaughter.\n" +
                "But this is touching, Severus, said Dumbledore seriously.\n" +
                "Have you grown to care for the boy, after all?\n" +
                "For him? shouted Snape. Expecto Patronum!\n" +
                "From the tip of his wand burst the silver doe. She landed on\n" +
                "the office floor, bounded once across the office, and soared out of\n" +
                "the window. Dumbledore watched her fly away, and as her silvery" +
                "glow faded he turned back to Snape, and his eyes were full of tears.\n" +
                "After all this time?\n" +
                "Always, said Snape";

        System.out.println("Message length: " + message.getBytes().length);

        int KEY_LENGTH = 4096;

        int BLOCK_SIZE = KEY_LENGTH / 8;

        // ////////////////////////////////////////////////////
        // check encryption and decryption via src.ElGamal

        // keys Generations
        List<List<BigInteger>> publicKeysAndSecretKeys = ElGamal.KeyGen(KEY_LENGTH);

        // public keys
        BigInteger p = publicKeysAndSecretKeys.get(0).get(0);
        BigInteger g = publicKeysAndSecretKeys.get(0).get(1);
        BigInteger pubKey = publicKeysAndSecretKeys.get(0).get(2);

        // private key
        BigInteger privKey = publicKeysAndSecretKeys.get(1).get(0);

        // encrypt via src.ElGamal (using public key)6
        String[] splitMessage = splitMessageByBytes(message, BLOCK_SIZE);

        ArrayList<BigInteger> x = new ArrayList<>();
        ArrayList<BigInteger> y = new ArrayList<>();
        for (String part : splitMessage) {
            BigInteger numMessage = new BigInteger(part.getBytes());
            List<BigInteger> encrypt = ElGamal.Encrypt(p, g, pubKey, numMessage);
            x.add(encrypt.get(0));
            y.add(encrypt.get(1));
        }

        StringBuilder restoredMessage = new StringBuilder();
        int i = 0;
        for (BigInteger el : x) {
            // decrypt via Elgamal (using private key)
            BigInteger decrypt = ElGamal.Decrypt(p, privKey, el, y.get(i));
            ++i;
            restoredMessage.append(new String(decrypt.toByteArray()));

        }

        // OUTPUT results
        System.out.println("\nPublic keys");
        System.out.println("p : " + p);
        System.out.println("g : " + g);
        System.out.println("pubKey : " + pubKey);
        System.out.println("Private key");
        System.out.println("privKey : " + privKey);
        System.out.println("Restored message : " + restoredMessage);
        System.out.println("\nAre they equal? - " + message.equals(new String(restoredMessage)));


        // ////////////////////////////////////////////////////
        // check digital signature via src.ElGamal

        // sign via src.ElGamal (using private key)
        List<BigInteger> signedMessage = ElGamal.CreateDigitalSignature(p, g, message, privKey);
        BigInteger r = signedMessage.get(0);
        BigInteger s = signedMessage.get(1);

        System.out.println("r: " + r);
        System.out.println("s: " + s);

        // check signature via src.ElGamal (using public key)
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
        //  check signature via src.ElGamal (using public key but from previous example)
        Boolean checkIncorrect = ElGamal.CheckDigitalSignature(g2, p2, s2, message, pubKey, r2);

        System.out.println("Signature verified? : " + checkIncorrect);

    }
}