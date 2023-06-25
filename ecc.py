from tinyec.ec import SubGroup, Curve, Point
from primePy import primes
from Crypto.Util import number


# Wrapper class that used for educational purpose only (full crypto libs had already implemented all ec cryptography)
class EllipticCurve:
    def __init__(self, x, y, p, a, b):
        self._validate_coordinates(x=x, y=y, p=p)
        self._validate_mod(p=p)

        field = SubGroup(p=p, g=(x, y), n=p + 1, h=1)
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
        if not primes.check(p):
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
    def compress(self):
        return hex(self.x) + hex(self.y % 2)[2:]

    # Print the coordinates of the ECPoint
    def print_ec_point(point):
        print(f"({point.x}, {point.y})")


# Set up all parameters for elliptic curve (a,b: curve vars, p: mod, x,y: start point)
el_test_curve = EllipticCurve(x=2, y=10, p=17, a=0, b=7)
print("Curve: y^2=x^3+7. Mod = 17")

# Set up k and d (will use that numbers as private keys in the future)
k = number.getPrime(256)
d = number.getPrime(256)
print("k:", k)
print("d:", d)

print("Base point G:", el_test_curve.get_generator_point())
print("Is on Curve (12, 1):", el_test_curve.is_on_curve_check(x=12, y=1))

point_str = el_test_curve.compress()
print("Convert point to string:", point_str)

print('---------------------------------')
print('Test scalar multiplication')
for k in range(0, 29):
    point = el_test_curve.scalar_mult(k=k)
    print(f"{k} * G = ({point.x}, {point.y})")

print('---------------------------------')
print('Test point addition')
new_added_point = el_test_curve.add_ec_points(x=6, y=6)
print('New added point:', new_added_point)

print('---------------------------------')
print('Final test')
G = EllipticCurve(x=15, y=13, p=17, a=0, b=7)

H1 = el_test_curve.scalar_mult(k=d)
G2 = EllipticCurve(x=H1.x, y=H1.y, p=17, a=0, b=7)
H2 = G2.scalar_mult(k=k)

H3 = el_test_curve.scalar_mult(k=k)
G3 = EllipticCurve(x=H3.x, y=H3.y, p=17, a=0, b=7)
H4 = G3.scalar_mult(k=d)

G5 = EllipticCurve(x=H2.x, y=H2.y, p=17, a=0, b=7)

eq = G5.equals_points(H4.x, H4.y)
print("Check equality:", eq)
print("Point 1:", H2)
print("Point 2:", H4)
