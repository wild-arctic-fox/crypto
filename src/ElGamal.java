import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

/**
 * Security of the ElGamal algorithm depends on the difficulty of computing discrete logs
 * in a large prime modulus
 */
public final class ElGamal {
    /**
     * Generate the public key and the secret key for the ElGamal encryption.
     *
     * @param bitLength key size
     * @return key pair (public & private)
     */
    public static List<List<BigInteger>> KeyGen(int bitLength) {
        // take a random prime p
        BigInteger p = getPrime(bitLength);

        // take a random element g the primitive root p (coprime with p).
        BigInteger g = randNum(p, new Random());
        while (!g.gcd(p).equals(BigInteger.ONE)) {
            g = randNum(p, new Random());
        }

        // private (secret) key is a random element a in interval 1 < x < p - 1
        BigInteger a = randNum(p.subtract(BigInteger.ONE), new Random()); //1 < x < p - 1

        // public key generated using private key, b = g^a mod p.
        BigInteger b = g.modPow(a, p);

        // private (secret) key is (a) and public key is (p, g, b)
        List<BigInteger> secretKey = new ArrayList<>(Collections.singletonList(a));
        List<BigInteger> publicKey = new ArrayList<>(Arrays.asList(p, g, b));
        // [0] = public key
        // [1] = private key
        return new ArrayList<>(Arrays.asList(publicKey, secretKey));
    }

    /**
     * Encrypt ElGamal
     *
     * @param (p,g,b) public keys
     * @param (m)     message
     * @return message (x, y) - encrypted message
     */
    public static List<BigInteger> Encrypt(BigInteger p, BigInteger g, BigInteger b, BigInteger m) {
        // 1. choose a random number k (1 < k < p - 1)
        BigInteger pSubtractOne = p.subtract(BigInteger.ONE);
        BigInteger k = randNum(pSubtractOne, new Random());

        // 2. x = g^k mod p
        BigInteger x = g.modPow(k, p);

        // 3. y = (b^k * m) mod p
        BigInteger y = m.multiply(b.modPow(k, p));

        return new ArrayList<>(Arrays.asList(x, y));
    }

    /**
     * Decrypt ElGamal
     *
     * @param (a)   secret key
     * @param (p)   public prime
     * @param (x,y) encrypted message
     * @return the decrypted message
     */
    public static BigInteger Decrypt(BigInteger p, BigInteger a, BigInteger x, BigInteger y) {
        // 1. s = x^a mod p
        BigInteger aPowX = x.modPow(a, p);

        // 2. m = (y * (s^(-1))) mod p
        return y.multiply(aPowX.modInverse(p)).mod(p);
    }

    private static BigInteger getSHA512(String message) {
        try {
            MessageDigest sha512algorithm = MessageDigest.getInstance("SHA-512");
            byte[] messageDigest = sha512algorithm.digest(message.getBytes());
            return new BigInteger(messageDigest);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Check Signature ElGamal
     *
     * @param (r,s)           signed message
     * @param (p,g,publicKey) public keys
     * @param (message)       plain message
     * @return true if signature is correct
     */
    public static Boolean CheckDigitalSignature(BigInteger g, BigInteger p, BigInteger s, String message, BigInteger publicKey, BigInteger r) {

        // (pubKey^r * r^s) mod p
        BigInteger leftEquation = publicKey.modPow(r, p).multiply(r.modPow(s, p)).mod(p);

        BigInteger hashMessage = ElGamal.getSHA512(message);

        // g^hash(message) mod p
        BigInteger rightEquation = g.modPow(hashMessage, p);

        return leftEquation.equals(rightEquation);
    }

    /**
     * Create Signature ElGamal
     *
     * @param (p,g)        public keys
     * @param (privateKey) private key
     * @param (message)    plain message
     * @return signed message
     */
    public static List<BigInteger> CreateDigitalSignature(BigInteger p, BigInteger g, String message, BigInteger privateKey) {
        // random k in interval [1, p-1].
        BigInteger pSubtractOne = p.subtract(BigInteger.ONE);
        BigInteger k = randNum(pSubtractOne, new Random());

        // k^-1 mod p-1
        BigInteger kInverse = k.modInverse(pSubtractOne);

        // r = g^k mod p
        BigInteger r = g.modPow(k, p);

        BigInteger messageHash = ElGamal.getSHA512(message);

        // s = (hash(message) − privateKey * r) * k^−1 mod (p − 1)
        BigInteger s = messageHash.subtract(privateKey.multiply(r)).multiply(kInverse).mod(pSubtractOne);
        return new ArrayList<>(Arrays.asList(r, s));
    }

    /**
     * Generates a random large prime number of specified bitlength *
     */
    public static BigInteger getPrime(int bits) {
        return BigInteger.probablePrime(bits, new Random());
    }

    /**
     * Return a random integer in [1, N - 1]
     */
    public static BigInteger randNum(BigInteger N, Random prg) {
        return new BigInteger(N.bitLength(), prg).mod(N);
    }
}