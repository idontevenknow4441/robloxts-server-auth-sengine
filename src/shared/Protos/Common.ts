/* eslint-disable prettier/prettier */
import { readf16, writef16 } from "shared/BufferF16"
import { Buffer } from "shared/Buffer"
export class Vec3f32 {
	static protoIndex: number = 1;
	protoIndex: number = 1
	x: number = 0;
	y: number = 0;
	z: number = 0;
	fulfillsOptional(): boolean {
		return this.x === 0 && this.y === 0 && this.z === 0;
	}
	serialize(): Buffer {
		const buf = new Buffer(this.getSize() + 2);
		buf.wuint16(this.protoIndex);
		this.serializeTo(buf, 2);
		return buf;
	}
	serializeTo(buf: Buffer, start: number): number {
		buf.cursor = start;
		let index = start;
		let _s1 = "";
		let _s1_size = 0;
		let has_opt2 = false;
		buf.wuint16(this.getSize());
		buf.wfloat32(this.x);
		buf.wfloat32(this.y);
		buf.wfloat32(this.z);
		return buf.cursor;
	}
	static deserialize(buf: Buffer, start: number = 4): Vec3f32 {
		let index = start;
		let _msg = new Vec3f32();
		if (buffer.len(buf.intlBuffer) === 0) return _msg;
		buf.cursor = start;
		let _has_optional = false;
		let _repeat_count = 0;
		let _len = 0;
		let _s1_size = 0;
		_msg.x = buf.rfloat32();
		_msg.y = buf.rfloat32();
		_msg.z = buf.rfloat32();
		return _msg;
	}
	getSize(): number {
		return 0 + 14
	}
}
