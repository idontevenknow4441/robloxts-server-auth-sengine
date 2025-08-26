import { Vec3 } from "./Vec3";
const TAU = math.pi * 2;
const FLATNORMAL = new Vector3(1, 0, 1);
export function Lerp(a: number, b: number, c: number) {
	return a + c * (b - a);
}
export function FlattenVector(vec: Vector3) {
	return vec.mul(FLATNORMAL);
}
export function ClipVector(vec: Vector3, normal: Vector3) {
	const dot = normal.Dot(vec);
	const second = normal.mul(dot);
	return vec.sub(second);
}
export function ClipVelocity(vec: Vec3, normal: Vec3) {
	let backoff = vec.Dot(normal);
	return vec.sub(normal.mul(backoff));
}
export function u64_to_u8(n: number): string {
	let bytes: string = "";
	let high = math.floor(n / 0x100000000);
	let low = n % 0x100000000;

	for (let i = 3; i >= 0; i--) {
		bytes += string.char(math.floor(high / 2 ** (i * 8)) & 0xff);
	}
	for (let i = 3; i >= 0; i--) {
		bytes += string.char(math.floor(low / 2 ** (i * 8)) & 0xff);
	}
	return bytes;
}
export function u8s_to_u64(bytes: string): number {
	let high = 0;
	let low = 0;

	for (let i = 0; i < 4; i++) {
		high = high * 256 + string.byte(bytes.sub(i + 1, i + 1))[0];
	}
	for (let i = 4; i < 8; i++) {
		low = low * 256 + string.byte(bytes.sub(i + 1, i + 1))[0];
	}

	return high * 0x100000000 + low;
}
export function LerpAngle(a: number, b: number, c: number) {
	while (a > TAU) a -= TAU;
	while (a < 0) a += TAU;
	while (b > TAU) b -= TAU;
	while (b < 0) b += TAU;
	const diff = b - a;
	let newAngle = a;
	if (math.abs(diff) < math.pi) {
		newAngle += diff * c;
	} else {
		let newDiff = TAU - math.abs(diff);
		if (diff > 0) newDiff *= -1;

		newAngle += newDiff * c;
	}
	return newAngle;
}
export function LerpAngle2(a: number, b: number, c: number) {
	let diff = b - a;
	if (diff > 180) diff -= 360;
	if (diff < -180) diff += 360;

	return a + diff * c;
}
export function VectorMa(start: Vec3, scale: number, direction: Vec3) {
	return start.Clone().add(direction.mul(scale));
}
export function ReplaceCharacterAtIndex(s: string, i: number, rep: string): string {
	return string.format("%s%s%s", s.sub(1, i - 1), rep, s.sub(i + 1));
}
