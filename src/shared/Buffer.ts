import { readf16, writef16 } from "./BufferF16";

export class Buffer {
	cursor: number = 0;
	intlBuffer: buffer;
	constructor(size: number | buffer) {
		if (typeIs(size, "buffer")) {
			this.intlBuffer = size;
			return;
		}
		this.intlBuffer = buffer.create(size);
	}
	wint8(n: number) {
		buffer.writei8(this.intlBuffer, this.cursor, n);
		this.cursor++;
	}
	wuint8(n: number) {
		buffer.writeu8(this.intlBuffer, this.cursor, n);
		this.cursor++;
	}
	wint16(n: number) {
		buffer.writei16(this.intlBuffer, this.cursor, n);
		this.cursor += 2;
	}
	wuint16(n: number) {
		buffer.writeu16(this.intlBuffer, this.cursor, n);
		this.cursor += 2;
	}
	wint32(n: number) {
		buffer.writei32(this.intlBuffer, this.cursor, n);
		this.cursor += 4;
	}
	wuint32(n: number) {
		buffer.writeu32(this.intlBuffer, this.cursor, n);
		this.cursor += 4;
	}
	wfloat16(n: number) {
		writef16(this.intlBuffer, this.cursor, n);
		this.cursor += 2;
	}
	wfloat32(n: number) {
		buffer.writef32(this.intlBuffer, this.cursor, n);
		this.cursor += 4;
	}
	wfloat64(n: number) {
		buffer.writef64(this.intlBuffer, this.cursor, n);
		this.cursor += 8;
	}
	wstringsized(n: string) {
		this.wuint8(n.size());
		buffer.writestring(this.intlBuffer, this.cursor, n);
		this.cursor += n.size();
	}
	wstringunsized(n: string) {
		buffer.writestring(this.intlBuffer, this.cursor, n);
		this.cursor += n.size();
	}
	rint8() {
		let x = buffer.readi8(this.intlBuffer, this.cursor);
		this.cursor++;
		return x;
	}
	ruint8() {
		let x = buffer.readu8(this.intlBuffer, this.cursor);
		this.cursor++;
		return x;
	}
	rint16() {
		let x = buffer.readi16(this.intlBuffer, this.cursor);
		this.cursor += 2;
		return x;
	}
	ruint16() {
		let x = buffer.readu16(this.intlBuffer, this.cursor);
		this.cursor += 2;
		return x;
	}
	rint32() {
		let x = buffer.readi32(this.intlBuffer, this.cursor);
		this.cursor += 4;
		return x;
	}
	ruint32() {
		let x = buffer.readu32(this.intlBuffer, this.cursor);
		this.cursor += 4;
		return x;
	}
	rfloat16() {
		let x = readf16(this.intlBuffer, this.cursor);
		this.cursor += 2;
		return x;
	}
	rfloat32() {
		let x = buffer.readf32(this.intlBuffer, this.cursor);
		this.cursor += 4;
		return x;
	}
	rfloat64() {
		let x = buffer.readf64(this.intlBuffer, this.cursor);
		this.cursor += 8;
		return x;
	}
	rstringsized() {
		let size = this.ruint8();
		let x = buffer.readstring(this.intlBuffer, this.cursor, size);
		this.cursor += size;
		return x;
	}
	rstringunsized(n: number) {
		let x = buffer.readstring(this.intlBuffer, this.cursor, n);
		this.cursor += n;
		return x;
	}
	wint8a(n: number[]) {
		this.wuint8(n.size());
		for (const x of n) {
			this.wint8(x);
		}
	}
	wuint8a(n: number[]) {
		this.wuint8(n.size());
		for (const x of n) {
			this.wuint8(x);
		}
	}
	wint16a(n: number[]) {
		this.wuint8(n.size());
		for (const x of n) {
			this.wint16(x);
		}
	}
	wuint16a(n: number[]) {
		this.wuint8(n.size());
		for (const x of n) {
			this.wuint16(x);
		}
	}
	wint32a(n: number[]) {
		this.wuint8(n.size());
		for (const x of n) {
			this.wint32(x);
		}
	}
	wuint32a(n: number[]) {
		this.wuint8(n.size());
		for (const x of n) {
			this.wuint32(x);
		}
	}
	wfloat16a(n: number[]) {
		this.wuint8(n.size());
		for (const x of n) {
			this.wfloat16(x);
		}
	}
	wfloat32a(n: number[]) {
		this.wuint8(n.size());
		for (const x of n) {
			this.wfloat32(x);
		}
	}
	wfloat64a(n: number[]) {
		this.wuint8(n.size());
		for (const x of n) {
			this.wfloat64(x);
		}
	}
	wstringsizeda(n: string[]) {
		this.wuint8(n.size());
		for (const x of n) {
			this.wstringsized(x);
		}
	}
	wstringunsizeda(n: string[]) {
		this.wuint8(n.size());
		for (const x of n) {
			this.wstringunsized(x);
		}
	}
	wbool(n: boolean) {
		if (n) this.wuint8(1);
		else this.wuint8(0);
	}
	rbool() {
		return this.ruint8() === 1;
	}
	wany(n: string | number | boolean) {
		if (typeIs(n, "string")) {
			this.wuint8(0);
			this.wstringsized(n);
		} else if (typeIs(n, "number")) {
			this.wuint8(1);
			this.wfloat64(n);
		} else {
			this.wuint8(2);
			this.wbool(n);
		}
	}
	wanya(n: (string | number | boolean)[]) {
		this.wuint8(n.size());
		for (const x of n) {
			this.wany(x);
		}
	}
	rany() {
		switch (this.ruint8()) {
			case 0:
				return this.rstringsized();
			case 1:
				return this.rfloat64();
			default:
				return this.rbool();
		}
	}
	rint8a() {
		const size = this.ruint8();
		let arr = [];
		for (let i = 0; i < size; i++) {
			arr.push(this.rint8());
		}
		return arr;
	}
	ruint8a() {
		const size = this.ruint8();
		let arr = [];
		for (let i = 0; i < size; i++) {
			arr.push(this.ruint8());
		}
		return arr;
	}
	rint16a() {
		const size = this.ruint8();
		let arr = [];
		for (let i = 0; i < size; i++) {
			arr.push(this.rint16());
		}
		return arr;
	}
	ruint16a() {
		const size = this.ruint8();
		let arr = [];
		for (let i = 0; i < size; i++) {
			arr.push(this.ruint16());
		}
		return arr;
	}
	rfloat16a() {
		const size = this.ruint8();
		let arr = [];
		for (let i = 0; i < size; i++) {
			arr.push(this.rfloat16());
		}
		return arr;
	}
	rint32a() {
		const size = this.ruint8();
		let arr = [];
		for (let i = 0; i < size; i++) {
			arr.push(this.rint32());
		}
		return arr;
	}
	ruint32a() {
		const size = this.ruint8();
		let arr = [];
		for (let i = 0; i < size; i++) {
			arr.push(this.ruint32());
		}
		return arr;
	}
	rfloat32a() {
		const size = this.ruint8();
		let arr = [];
		for (let i = 0; i < size; i++) {
			arr.push(this.rfloat32());
		}
		return arr;
	}
	rfloat64a() {
		const size = this.ruint8();
		let arr = [];
		for (let i = 0; i < size; i++) {
			arr.push(this.rfloat64());
		}
		return arr;
	}
	rstringsizeda() {
		const size = this.ruint8();
		let arr = [];
		for (let i = 0; i < size; i++) {
			arr.push(this.rstringsized());
		}
		return arr;
	}
	rstringunsizeda(n: number) {
		const size = this.ruint8();
		let arr = [];
		for (let i = 0; i < size; i++) {
			arr.push(this.rstringunsized(n));
		}
		return arr;
	}
	rboola() {
		const size = this.ruint8();
		let arr = [];
		for (let i = 0; i < size; i++) {
			arr.push(this.rbool());
		}
		return arr;
	}
	ranya() {
		const size = this.ruint8();
		let arr = [];
		for (let i = 0; i < size; i++) {
			arr.push(this.rany());
		}
		return arr;
	}
}
