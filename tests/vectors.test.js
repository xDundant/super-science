// Run with:  node tests/vectors.test.js
const assert = require("assert");
const { fromPolar, add, magnitude, angleDeg } = require("../concepts/vectors.js");
const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} is not close to ${b}`);

// Length 1 at 45° -> (0.7071, 0.7071)
const v45 = fromPolar(1, 45);
close(v45.x, Math.SQRT1_2); close(v45.y, Math.SQRT1_2);

// Classic 3-4-5 triangle: 3 along x, then 4 straight up
const R = add(fromPolar(3, 0), fromPolar(4, 90));
close(R.x, 3); close(R.y, 4);
close(magnitude(R), 5);
close(angleDeg(R), 53.13010235415598); // atan(4/3)
console.log("3 @ 0° + 4 @ 90° =", magnitude(R).toFixed(2), "@", angleDeg(R).toFixed(2) + "°");

// Equal and opposite vectors cancel out
close(magnitude(add(fromPolar(2.5, 30), fromPolar(2.5, 210))), 0);

// Same direction: lengths simply add
const same = add(fromPolar(2, 60), fromPolar(3, 60));
close(magnitude(same), 5); close(angleDeg(same), 60);

// Angles are reported 0..360, anticlockwise from +x
close(angleDeg({ x: -1, y: -1 }), 225);
close(angleDeg({ x: 0, y: -2 }), 270);
close(angleDeg({ x: -1, y: 0 }), 180);

// Order doesn't matter: A + B = B + A
const A = fromPolar(4, 20), B = fromPolar(3, 100);
close(add(A, B).x, add(B, A).x); close(add(A, B).y, add(B, A).y);

// Default view: A = 4 @ 20°, B = 3 @ 100° (checked with the law of cosines: 80° between them)
close(magnitude(add(A, B)), Math.sqrt(16 + 9 + 2 * 4 * 3 * Math.cos((80 * Math.PI) / 180)));

console.log("All vector tests passed ✅");
