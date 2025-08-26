/* eslint-disable prettier/prettier */
import { readf16, writef16 } from "shared/BufferF16"
import { Vec3f32 } from "shared/Protos/Common"
import { Buffer } from "shared/Buffer"
export class CLagCompensationStruct {
	static protoIndex: number = 8;
	protoIndex: number = 8
	tick1: number = 0;
	tick2: number = 0;
	alpha: number = 0;
	fulfillsOptional(): boolean {
		return this.tick1 === 0 && this.tick2 === 0 && this.alpha === 0;
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
		buf.wuint16(this.tick1);
		buf.wuint16(this.tick2);
		buf.wfloat32(this.alpha);
		return buf.cursor;
	}
	static deserialize(buf: Buffer, start: number = 4): CLagCompensationStruct {
		let index = start;
		let _msg = new CLagCompensationStruct();
		if (buffer.len(buf.intlBuffer) === 0) return _msg;
		buf.cursor = start;
		let _has_optional = false;
		let _repeat_count = 0;
		let _len = 0;
		let _s1_size = 0;
		_msg.tick1 = buf.ruint16();
		_msg.tick2 = buf.ruint16();
		_msg.alpha = buf.rfloat32();
		return _msg;
	}
	getSize(): number {
		return 0 + 10
	}
}
export class CUserCommand {
	static protoIndex: number = 9;
	protoIndex: number = 9
	pitch: number = 0;
	yaw: number = 0;
	wishkeys: number = 0;
	deltaTime: number = 0;
	commandIndex: number = 0;
	lagComp: CLagCompensationStruct = new CLagCompensationStruct();
	fulfillsOptional(): boolean {
		return this.pitch === 0 && this.yaw === 0 && this.wishkeys === 0 && this.deltaTime === 0 && this.commandIndex === 0 && this.lagComp.fulfillsOptional();
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
		buf.wint16(this.pitch);
		buf.wint16(this.yaw);
		buf.wuint8(this.wishkeys);
		buf.wfloat16(this.deltaTime);
		buf.wuint32(this.commandIndex);
		has_opt2 = !this.lagComp.fulfillsOptional();
		buf.wbool(has_opt2);
		if (has_opt2) {
			this.lagComp.serializeTo(buf, buf.cursor);
		}
		return buf.cursor;
	}
	static deserialize(buf: Buffer, start: number = 4): CUserCommand {
		let index = start;
		let _msg = new CUserCommand();
		if (buffer.len(buf.intlBuffer) === 0) return _msg;
		buf.cursor = start;
		let _has_optional = false;
		let _repeat_count = 0;
		let _len = 0;
		let _s1_size = 0;
		_msg.pitch = buf.rint16();
		_msg.yaw = buf.rint16();
		_msg.wishkeys = buf.ruint8();
		_msg.deltaTime = buf.rfloat16();
		_msg.commandIndex = buf.ruint32();
		_has_optional = buf.rbool();
		if (_has_optional) {
			_len = buf.ruint16(); _msg.lagComp = CLagCompensationStruct.deserialize(buf, buf.cursor);
		} else {
			_msg.lagComp = new CLagCompensationStruct();
		}
		return _msg;
	}
	getSize(): number {
		return 0 + this.lagComp.getSize() + 2 + 14
	}
}
export class CMovementResultMessage {
	static protoIndex: number = 10;
	protoIndex: number = 10
	commandIndex: number = 0;
	position: Vec3f32 = new Vec3f32();
	velocity: Vec3f32 = new Vec3f32();
	fulfillsOptional(): boolean {
		return this.commandIndex === 0 && this.position.fulfillsOptional() && this.velocity.fulfillsOptional();
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
		buf.wuint32(this.commandIndex);
		this.position.serializeTo(buf, buf.cursor);
		this.velocity.serializeTo(buf, buf.cursor);
		return buf.cursor;
	}
	static deserialize(buf: Buffer, start: number = 4): CMovementResultMessage {
		let index = start;
		let _msg = new CMovementResultMessage();
		if (buffer.len(buf.intlBuffer) === 0) return _msg;
		buf.cursor = start;
		let _has_optional = false;
		let _repeat_count = 0;
		let _len = 0;
		let _s1_size = 0;
		_msg.commandIndex = buf.ruint32();
		_len = buf.ruint16(); _msg.position = Vec3f32.deserialize(buf, buf.cursor);
		_len = buf.ruint16(); _msg.velocity = Vec3f32.deserialize(buf, buf.cursor);
		return _msg;
	}
	getSize(): number {
		return 0 + this.position.getSize() + 2 + this.velocity.getSize() + 2 + 6
	}
}
