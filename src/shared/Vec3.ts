import { Vec3f32 } from "./Protos/Common";

export class Vec3 {
	x: number;
	y: number;
	z: number;
	static zero() {
		return new Vec3(0, 0, 0);
	}
	static Zero = Vec3.zero();
	constructor(x: number | { x: number; y: number; z: number } = 0, y: number = 0, z: number = 0) {
		if (typeIs(x, "number")) {
			this.x = x;
			this.y = y;
			this.z = z;
		} else {
			[this.x, this.y, this.z] = [0, 0, 0];
			this.CopyFrom(x);
		}
	}
	Magnitude(): number {
		return math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}
	SqrMagnitude(): number {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}
	Dot(other: Vec3): number {
		return this.x * other.x + this.y * other.y + this.z * other.z;
	}
	Cross(other: Vec3): Vec3 {
		return new Vec3(
			this.y * other.z - this.z * other.y,
			this.z * other.x - this.x * other.z,
			this.x * other.y - this.y * other.x,
		);
	}
	LerpTo(other: Vec3, alpha: number): Vec3 {
		return new Vec3(
			math.lerp(this.x, other.x, alpha),
			math.lerp(this.y, other.y, alpha),
			math.lerp(this.z, other.z, alpha),
		);
	}
	Lerp(other: Vec3, alpha: number) {
		this.x = math.lerp(this.x, other.x, alpha);
		this.y = math.lerp(this.y, other.y, alpha);
		this.z = math.lerp(this.z, other.z, alpha);
	}
	ToVec3f32(): Vec3f32 {
		const v3 = new Vec3f32();
		v3.x = this.x;
		v3.y = this.y;
		v3.z = this.z;
		return v3;
	}
	CopyToObject(obj: { x: number; y: number; z: number }) {
		obj.x = this.x;
		obj.y = this.y;
		obj.z = this.z;
		return obj;
	}
	CopyFrom(v: { x: number; y: number; z: number } | Vector3) {
		const [x, y, z] = typeIs(v, "Vector3") ? [v.X, v.Y, v.Z] : [v.x, v.y, v.z];
		this.x = x;
		this.y = y;
		this.z = z;
	}
	Compare(v: Vec3): boolean {
		return v.x === this.x && v.y === this.y && v.z === this.z;
	}
	Unit(): Vec3 {
		if (this.Magnitude() === 0) return this.mul(0);
		return this.div(this.Magnitude());
	}
	Clone(): Vec3 {
		return new Vec3(this.x, this.y, this.z);
	}
	AddTo(v: Vec3) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
	}
	SubFrom(v: Vec3) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
	}
	MulBy(v: Vec3 | number) {
		if (typeIs(v, "number")) v = new Vec3(v, v, v);
		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;
	}
	DivBy(v: Vec3 | number) {
		if (typeIs(v, "number")) v = new Vec3(v, v, v);
		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;
	}
	add(v: Vec3): Vec3 {
		return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
	}
	sub(v: Vec3): Vec3 {
		return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
	}
	mul(v: Vec3 | number): Vec3 {
		if (typeIs(v, "number")) v = new Vec3(v, v, v);
		return new Vec3(this.x * v.x, this.y * v.y, this.z * v.z);
	}
	div(v: Vec3 | number): Vec3 {
		if (typeIs(v, "number")) v = new Vec3(v, v, v);
		return new Vec3(this.x / v.x, this.y / v.y, this.z / v.z);
	}
	static FromVector3(v: Vector3): Vec3 {
		return new Vec3(v.X, v.Y, v.Z);
	}
	ToVector3(): Vector3 {
		return new Vector3(this.x, this.y, this.z);
	}
}
