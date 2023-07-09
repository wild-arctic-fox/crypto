from tinyec.ec import SubGroup, Curve, Point
from primePy import primes
from sympy import mod_inverse, Mod, gcd, ntheory
import hashlib


# Wrapper class that used for educational purpose only (full crypto libs had already implemented all ec cryptography)
class EllipticCurve:
    def __init__(self, x, y, p, a, b, n, h):

        field = SubGroup(p=p, g=(x, y), n=n, h=h)
        curve = Curve(a=a, b=b, field=field, name='any')
        self.curve = curve
        self.x = x
        self.y = y
        self.p = p
        self.a = a
        self.b = b

    def _validate_positive_int(self, val):
        if not isinstance(val, int):
            raise ValueError("val must be a integer.")
        if val < 0:
            raise ValueError("val must be a grater than 0.")

    def _validate_mod(self, p):
        # Check if p is prime and p > 3
        if not primes.check(p) and p < 3:
            raise ValueError("p must be a prime number greater than 3.")

    def _validate_coordinates(self, x, y, p):
        # Check if 0 ≤ x, y < p
        if x < 0 or x >= p or y < 0 or y >= p:
            raise ValueError("x and y must satisfy 0 ≤ x, y < p.")

    # Return the base point G (generator)
    def get_generator_point(self):
        return self.x, self.y

    # Perform the check to determine if point (x,y) is on the curve
    def is_on_curve_check(self, x, y):
        if not self.curve.on_curve(x, y):
            raise ValueError(f"Point ({x}, {y}) is not on the curve.")

    # Perform the check to determine if points are equal
    def equals_points(self, x2, y2):
        point_1 = Point(curve=self.curve, x=self.x, y=self.y)
        point_2 = Point(curve=self.curve, x=x2, y=y2)
        return point_1.__eq__(other=point_2)

    # Perform the addition of point that belongs to curve to another point belongs to curve
    def add_ec_points(self, x, y):
        self.is_on_curve_check(x=x, y=y)
        init_point = Point(curve=self.curve, x=self.x, y=self.y)
        addition_point = Point(curve=self.curve, x=x, y=y)
        new_point = init_point.__add__(other=addition_point)
        return [new_point.x, new_point.y]

    # Perform the multiplication point to some number (addition point k times)
    def scalar_mult(self, k):
        self._validate_positive_int(k)
        point = k * self.curve.g
        return point

    # Perform addition point 2 times
    def double_ec_point(self):
        doubled_point = self.scalar_mult(k=2)
        return doubled_point

    # Compress an EC point to a compressed key representation
    def compress(self, point):
        return hex(point.x) + hex(point.y % 2)[2:]

    # Print the coordinates of the ECPoint
    def print_ec_point(point):
        print(f"({point.x}, {point.y})")

    # Perform the addition of ANY points that belongs to curve to another point that belongs to curve
    def add_ec_points_extended(self, x1, y1, x2, y2):
        self.is_on_curve_check(x=x1, y=y1)
        self.is_on_curve_check(x=x2, y=y2)
        init_point = Point(curve=self.curve, x=x1, y=y1)
        addition_point = Point(curve=self.curve, x=x2, y=y2)
        new_point = init_point.__add__(other=addition_point)
        return [new_point.x, new_point.y]

    # Perform the multiplication of ANY point to some number (addition point k times)
    def scalar_mult_extended(self, k, x, y):
        init_point = Point(curve=self.curve, x=x, y=y)
        point = k * init_point
        return point


class EllipticCurveSignature:
    # # ##############################################
    # # Generate Keys & Fill Curve Params
    #
    def __init__(self):
        # Using secp192r1 params
        p = 0xfffffffffffffffffffffffffffffffeffffffffffffffff
        a = 0xfffffffffffffffffffffffffffffffefffffffffffffffc
        b = 0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1
        x = 0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012
        y = 0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811
        n = 0xffffffffffffffffffffffff99def836146bc9b1b4d22831
        h = 0x1

        # init curve
        el_test_curve = EllipticCurve(x=x, y=y, p=p, a=a, b=b, n=n, h=h)

        # private key = random [0...n-1]
        privKey = self._generate_coprime(n=n)

        # public key = G * privKey
        pubKey = el_test_curve.scalar_mult(k=privKey)

        self.privKey = privKey
        self.pubKey = pubKey
        self.n = n
        self.curve = el_test_curve

    def get_key_pair(self):
        return [self.privKey, self.pubKey]

    # # ##############################################
    # # Helpers
    #
    def _generate_coprime(self, n):
        while True:
            # Generate a random prime number
            p = ntheory.randprime(1, n)

            # Check if p is coprime with n
            if gcd(p, n) == 1:
                return p

    def _hash_to_number(self, hash_string):
        hash_bytes = hashlib.sha256(hash_string.encode()).digest()
        hash_number = int.from_bytes(hash_bytes, byteorder='big')
        return hash_number

    # # ##############################################
    # # ECDSA Sign
    #
    def sign_message(self, message, privKey):
        data_bytes = message.encode('utf-8')
        sha256_hash = self._hash_to_number(hashlib.sha256(data_bytes).hexdigest())

        # Generate random k = random [1..n-1]
        k = self._generate_coprime(n=self.n)

        # Calculate random point R = k * G
        R = self.curve.scalar_mult(k=k)
        r = R.x

        # calculate k^-1 mod n
        k_inverse_n = mod_inverse(a=k, m=self.n)

        # calculate (h + r * privateKey) mod n
        addition = Mod(sha256_hash + r * privKey, self.n)

        # calculate s = (k^-1 * (h + r * privateKey)) mod n
        s = Mod(k_inverse_n * addition, self.n)
        return [r, s]

    # # ##############################################
    # # ECDSA Verify Signature
    #
    def verify_signed_message(self, message, pubKey, s, r):
        data_bytes = message.encode('utf-8')
        sha256_hash = self._hash_to_number(hashlib.sha256(data_bytes).hexdigest())

        # calculate s^-1 mod n
        s1 = mod_inverse(a=s, m=self.n)

        # Recover the random point used during the signing R_recovered = (hash * s1)mod n * G + (r * s1)mod n * pubKey
        hash_s1 = int(Mod(sha256_hash * s1, self.n))
        r_s1 = int(Mod(r * s1, self.n))

        hash_s1_G = self.curve.scalar_mult(k=hash_s1)
        r_s1_pubKey = self.curve.scalar_mult_extended(k=r_s1, x=pubKey.x, y=pubKey.y)

        R_recovered = self.curve.add_ec_points_extended(x1=hash_s1_G.x, y1=hash_s1_G.y, x2=r_s1_pubKey.x,
                                                        y2=r_s1_pubKey.y)

        return R_recovered[0] == r


print("####################################################################################")
print("Generate Keys")
print()

ellipticCurveSignature = EllipticCurveSignature()
key_pair = ellipticCurveSignature.get_key_pair()

private = key_pair[0]
public = key_pair[1]

print("PrivKey:", private)
print("PubKey:", public)

print()
print("####################################################################################")
print("ECDSA Sign")

msg = input("Input message that need to be signed:")

signature = ellipticCurveSignature.sign_message(message=msg, privKey=private)

r = signature[0]
s = signature[1]

print("Signature {r, s}:", r, s)

print()
print("####################################################################################")
print("ECDSA Verify Signature")

verification = ellipticCurveSignature.verify_signed_message(message=msg, pubKey=public, s=s, r=r)

print("Signature is valid?", verification)
