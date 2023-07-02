from tinyec.ec import SubGroup, Curve, Point
from primePy import primes
from Crypto.Util import number


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


# Using secp192r1 params
p = 0xfffffffffffffffffffffffffffffffeffffffffffffffff
a = 0xfffffffffffffffffffffffffffffffefffffffffffffffc
b = 0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1
x = 0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012
y = 0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811
n = 0xffffffffffffffffffffffff99def836146bc9b1b4d22831
h = 0x1

el_test_curve = EllipticCurve(x=x, y=y, p=p, a=a, b=b, n=n, h=h)
print("Curve: ", el_test_curve.curve)

print("Base point G:", el_test_curve.get_generator_point())

alicePrivKey = int(input("Input private key [0-(n-1)]:"))
print("Alice private key:", alicePrivKey)
alicePubKey = el_test_curve.scalar_mult(k=alicePrivKey)
alice_ec = EllipticCurve(x=alicePubKey.x, y=alicePubKey.y, p=p, a=a, b=b, n=n, h=h)
print("Alice public key:", alicePubKey.x, alicePubKey.y)

bobPrivKey = int(input("Input private key [0-(n-1)]:"))
print("Bob private key:", alicePrivKey)
bobPubKey = el_test_curve.scalar_mult(k=bobPrivKey)
bob_ec = EllipticCurve(x=bobPubKey.x, y=bobPubKey.y, p=p, a=a, b=b, n=n, h=h)
print("Bob public key:", bobPubKey.x, bobPubKey.y)

print("Now exchange the public keys (e.g. through Internet)")

aliceSharedKey = bob_ec.scalar_mult(alicePrivKey)
print("Alice shared key:", aliceSharedKey.x, aliceSharedKey.y)

bobSharedKey = alice_ec.scalar_mult(bobPrivKey)
print("Bob shared key:", bobSharedKey.x, bobSharedKey.y)

print("Equal shared keys:", aliceSharedKey.x == bobSharedKey.x)