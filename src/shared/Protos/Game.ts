/* eslint-disable prettier/prettier */
import { readf16, writef16 } from "shared/BufferF16"
import { Vec3f32 } from "shared/Protos/Common"
import { Buffer } from "shared/Buffer"
export class CInitializeMeMessage {
	static protoIndex: number = 2;
	protoIndex: number = 2
	hello: number = 0;
	fulfillsOptional(): boolean {
		return this.hello === 0;
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
		buf.wuint8(this.hello);
		return buf.cursor;
	}
	static deserialize(buf: Buffer, start: number = 4): CInitializeMeMessage {
		let index = start;
		let _msg = new CInitializeMeMessage();
		if (buffer.len(buf.intlBuffer) === 0) return _msg;
		buf.cursor = start;
		let _has_optional = false;
		let _repeat_count = 0;
		let _len = 0;
		let _s1_size = 0;
		_msg.hello = buf.ruint8();
		return _msg;
	}
	getSize(): number {
		return 0 + 3
	}
}
export class CPlayerPositionUpdate {
	static protoIndex: number = 3;
	protoIndex: number = 3
	pos: Vec3f32 = new Vec3f32();
	yaw: number = 0;
	pitch: number = 0;
	playerId: number = 0;
	wasTeleport: boolean = false;
	fulfillsOptional(): boolean {
		return this.pos.fulfillsOptional() && this.yaw === 0 && this.pitch === 0 && this.playerId === 0 && this.wasTeleport === false;
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
		this.pos.serializeTo(buf, buf.cursor);
		buf.wint16(this.yaw);
		buf.wint16(this.pitch);
		buf.wuint16(this.playerId);
		buf.wbool(this.wasTeleport);
		return buf.cursor;
	}
	static deserialize(buf: Buffer, start: number = 4): CPlayerPositionUpdate {
		let index = start;
		let _msg = new CPlayerPositionUpdate();
		if (buffer.len(buf.intlBuffer) === 0) return _msg;
		buf.cursor = start;
		let _has_optional = false;
		let _repeat_count = 0;
		let _len = 0;
		let _s1_size = 0;
		_len = buf.ruint16(); _msg.pos = Vec3f32.deserialize(buf, buf.cursor);
		_msg.yaw = buf.rint16();
		_msg.pitch = buf.rint16();
		_msg.playerId = buf.ruint16();
		_msg.wasTeleport = buf.rbool();
		return _msg;
	}
	getSize(): number {
		return 0 + this.pos.getSize() + 2 + 9
	}
}
export class CPlayerPositionsUpdate {
	static protoIndex: number = 4;
	protoIndex: number = 4
	tick: number = 0;
	time: number = 0;
	positions: CPlayerPositionUpdate[] = [];
	fulfillsOptional(): boolean {
		return this.tick === 0 && this.time === 0 && this.positions.size() === 0;
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
		buf.wuint32(this.tick);
		buf.wfloat64(this.time);
		buf.wuint8(this.positions.size());
		for (let i = 0; i < this.positions.size(); i++) {
			this.positions[i].serializeTo(buf, buf.cursor);
		}
		return buf.cursor;
	}
	static deserialize(buf: Buffer, start: number = 4): CPlayerPositionsUpdate {
		let index = start;
		let _msg = new CPlayerPositionsUpdate();
		if (buffer.len(buf.intlBuffer) === 0) return _msg;
		buf.cursor = start;
		let _has_optional = false;
		let _repeat_count = 0;
		let _len = 0;
		let _s1_size = 0;
		_msg.tick = buf.ruint32();
		_msg.time = buf.rfloat64();
		_msg.positions = [];
		_repeat_count = buf.ruint8();
		for (let i = 0; i < _repeat_count; i++) {
			buf.ruint16();
			_msg.positions.push(CPlayerPositionUpdate.deserialize(buf, buf.cursor));
		}
		return _msg;
	}
	getSize(): number {
		return 0 + this.positions.reduce((a, b) => a + b.getSize(), 0) + 15
	}
}
export class CEntityCreateMessage {
	static protoIndex: number = 5;
	protoIndex: number = 5
	entId: number = 0;
	entDefIndex: number = 0;
	position: Vec3f32 = new Vec3f32();
	model: string = "";
	data: string = "";
	fulfillsOptional(): boolean {
		return this.entId === 0 && this.entDefIndex === 0 && this.position.fulfillsOptional() && this.model === "" && this.data === "";
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
		buf.wuint16(this.entId);
		buf.wuint16(this.entDefIndex);
		this.position.serializeTo(buf, buf.cursor);
		has_opt2 = this.model !== "";
		buf.wbool(has_opt2);
		if (has_opt2) {
			buf.wstringsized(this.model);
		}
		has_opt2 = this.data !== "";
		buf.wbool(has_opt2);
		if (has_opt2) {
			buf.wstringsized(this.data);
		}
		return buf.cursor;
	}
	static deserialize(buf: Buffer, start: number = 4): CEntityCreateMessage {
		let index = start;
		let _msg = new CEntityCreateMessage();
		if (buffer.len(buf.intlBuffer) === 0) return _msg;
		buf.cursor = start;
		let _has_optional = false;
		let _repeat_count = 0;
		let _len = 0;
		let _s1_size = 0;
		_msg.entId = buf.ruint16();
		_msg.entDefIndex = buf.ruint16();
		_len = buf.ruint16(); _msg.position = Vec3f32.deserialize(buf, buf.cursor);
		_has_optional = buf.rbool();
		if (_has_optional) {
			_msg.model = buf.rstringsized();
		} else {
			_msg.model = "";
		}
		_has_optional = buf.rbool();
		if (_has_optional) {
			_msg.data = buf.rstringsized();
		} else {
			_msg.data = "";
		}
		return _msg;
	}
	getSize(): number {
		return 0 + this.position.getSize() + 2 + this.model.size() + 1 + this.data.size() + 1 + 8
	}
}
