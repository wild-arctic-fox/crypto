from tinyec.ec import SubGroup, Curve, Point
from primePy import primes


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

    # Perform the addition of ANY points that belongs to curve to another point that belongs to curve
    def add_ec_points_extended(self, x1, y1, x2, y2):
        self.is_on_curve_check(x=x1, y=y1)
        self.is_on_curve_check(x=x2, y=y2)
        init_point = Point(curve=self.curve, x=x1, y=y1)
        addition_point = Point(curve=self.curve, x=x2, y=y2)
        new_point = init_point.__add__(other=addition_point)
        return [new_point.x, new_point.y]

    # Perform the multiplication point to some number (addition point k times)
    def scalar_mult(self, k):
        self._validate_positive_int(k)
        point = k * self.curve.g
        return point

    # Perform the multiplication of ANY point to some number (addition point k times)
    def scalar_mult_extended(self, k, x, y):
        self.is_on_curve_check(x=x, y=y)
        self._validate_positive_int(k)
        init_point = Point(curve=self.curve, x=x, y=y)
        point = k * init_point
        return point

    # Perform addition point 2 times
    def double_ec_point(self):
        doubled_point = self.scalar_mult(k=2)
        return doubled_point

    # Perform addition of ANY point 2 times
    def double_ec_point_extended(self, x, y):
        doubled_point = self.scalar_mult_extended(k=2, x=x, y=y)
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


print('---------------------------------')
print('Test scalar multiplication')
for k in range(0, 20):
    point = el_test_curve.scalar_mult(k=k)
    print(f"{k} * G = ({point.x}, {point.y})")

print('Test EXTENDED scalar multiplication')
for k in range(0, 20):
    point = el_test_curve.scalar_mult_extended(k=k, x=2, y=7)
    print(f"{k} * G = ({point.x}, {point.y})")

print('---------------------------------')
print('Test point addition')
new_added_point = el_test_curve.add_ec_points(x=6, y=6)
print('New added point([x=2, y=10] + [x=6, y=6]:', new_added_point)

print('---------------------------------')
print('Test EXTENDED point addition')
new_added_point = el_test_curve.add_ec_points_extended(x1=5, y1=9, x2=12, y2=1)
print('New added point ([x1=5, y1=9] + [x2=12, y2=1]):', new_added_point)
