export function writef16(buf: buffer, offset: number, value: number) {
	const sign = value < 0;
	value = math.abs(value);
	let [man, exp] = math.frexp(value);
	if (value === math.huge) {
		buffer.writeu8(buf, offset++, sign ? 252 : 124);
		buffer.writeu8(buf, offset, 0);
		return;
		// eslint-disable-next-line prettier/prettier
				//aka. value === nan
	} else if (value !== value) {
		buffer.writeu16(buf, offset, 0);
		return;
	} else if (exp <= -14) {
		man = math.floor(man * 1024 + 0.5);
		buffer.writeu8(buf, offset++, (man >>> 8) + (sign ? 128 : 0));
		buffer.writeu8(buf, offset, man & 255);
		return;
	}
	man = math.floor((man - 0.5) * 2048 + 0.5);
	buffer.writeu8(buf, offset++, ((exp + 14) << 2) + (man >>> 8) + (sign ? 128 : 0));
	buffer.writeu8(buf, offset, man & 255);
}
export function readf16(buf: buffer, offset: number): number {
	const [b0, b1] = [buffer.readu8(buf, offset++), buffer.readu8(buf, offset)];
	const sign = bit32.btest(b0, 128);
	const exp = (b0 & 127) >>> 2;
	let man = ((b0 & 3) << 8) + b1;
	if (exp === 31) {
		if (man !== 0) return 0 / 0;
		return sign ? -math.huge : math.huge;
	} else if (exp === 0) {
		if (man === 0) return 0;
		return math.ldexp(man / 1024, -14) * (sign ? -1 : 1);
	}
	man = man / 1024 + 1;
	return math.ldexp(man, exp - 15) * (sign ? -1 : 1);
}
