/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
/* eslint-disable roblox-ts/lua-truthiness */
const fs = require("fs");
const protos = fs.readdirSync("./src/shared/Protos");
function searchFrom(str, search, index) {
	const ind = str.slice(index).search(search);
	return ind === -1 ? -1 : ind + index;
}
function toTSType(t) {
	if (t.includes("int") || t.includes("float")) {
		return "number";
	}
	if (t === "bool") return "boolean";
	return t;
}
function getCode(t, val) {
	switch (t) {
		case "uint8":
			return `buf.wuint8(this.${val});`;
		case "uint16":
			return `buf.wuint16(this.${val});`;

		case "uint32":
			return `buf.wuint32(this.${val});`;
		case "int8":
			return `buf.wint8(this.${val});`;
		case "int16":
			return `buf.wint16(this.${val});`;
		case "int32":
			return `buf.wint32(this.${val});`;
		case "bool":
			return `buf.wbool(this.${val});`;
		case "float16":
			return `buf.wfloat16(this.${val});`;
		case "float32":
			return `buf.wfloat32(this.${val});`;
		case "float64":
			return `buf.wfloat64(this.${val});`;
		case "string":
			return `buf.wstringsized(this.${val});`;
		default:
			return `this.${val}.serializeTo(buf, buf.cursor);`;
	}
}
function getDefaultForT(t) {
	if (t === "string") return `""`;
	if (t === "number") return "0";
	if (t === "boolean") return "false";
	return `new ${t}()`;
}
function getReadCode(t, val) {
	switch (t) {
		case "uint8":
			return `_msg.${val} = buf.ruint8();`;
		case "uint16":
			return `_msg.${val} = buf.ruint16();`;
		case "uint32":
			return `_msg.${val} = buf.ruint32();`;
		case "int8":
			return `_msg.${val} = buf.rint8();`;
		case "int16":
			return `_msg.${val} = buf.rint16();`;
		case "int32":
			return `_msg.${val} = buf.rint32();`;
		case "float16":
			return `_msg.${val} = buf.rfloat16();`;
		case "float32":
			return `_msg.${val} = buf.rfloat32();`;
		case "float64":
			return `_msg.${val} = buf.rfloat64();`;
		case "bool":
			return `_msg.${val} = buf.rbool();`;
		case "string":
			return `_msg.${val} = buf.rstringsized();`;
		default:
			return `_len = buf.ruint16(); _msg.${val} = ${t}.deserialize(buf, buf.cursor);`;
	}
}
function getSizeCode(t, v, arr = "") {
	if (t === "string") return `this.${v + arr}.size() + 1`;
	return `this.${v + arr}.getSize() + 2`;
}
function getSizeOf(t) {
	switch (t) {
		case "uint8":
			return 1;
		case "uint16":
			return 2;
		case "uint32":
			return 4;
		case "int8":
			return 1;
		case "int16":
			return 2;
		case "int32":
			return 4;
		case "float16":
			return 2;
		case "float32":
			return 4;
		case "float64":
			return 8;
		case "bool":
			return 1;
		default:
			return 0;
	}
}
function getDefaultAssign(t, isRepeat) {
	if (isRepeat) return "[]";
	return getDefaultForT(toTSType(t));
}
let i = 0;
for (const file of protos) {
	const readBuffer = fs.readFileSync("./src/shared/Protos/" + file).toString();
	let message = readBuffer.search("message");
	let totalBuffer = '/* eslint-disable prettier/prettier */\nimport { readf16, writef16 } from "shared/BufferF16"\n';
	if (file !== "Common.proto") {
		totalBuffer += `import { Vec3f32 } from "shared/Protos/Common"\n`;
	}
	totalBuffer += `import { Buffer } from "shared/Buffer"\n`;
	while (message !== -1) {
		const braceStart = searchFrom(readBuffer, "{", message + 1) + 1;
		const protoName = readBuffer.slice(message + 8, braceStart - 2);
		const braceEnd = searchFrom(readBuffer, "}", message + 1);
		const text = readBuffer.slice(braceStart, braceEnd).replaceAll("\t", "");
		if (text.includes("_NOCOMPILE")) {
			message = searchFrom(readBuffer, "message", braceEnd);
			continue;
		}
		console.log(`Reading message ${protoName}:`);
		let tsSource = `export class ${protoName} {\n\tstatic protoIndex: number = ${++i};\n\tprotoIndex: number = ${i}\n`;
		const messageVariables = [];
		for (const line of text.split("\n")) {
			if (line.length === 0) continue;
			const keywords = line.split(" ");
			const accessType = keywords[0];
			const typeName = keywords[1];
			const varName = keywords[2];
			messageVariables.push({ access: accessType, type: typeName, varName: varName });
			tsSource += `\t${varName}: ${toTSType(typeName) + (accessType === "repeated" ? "[]" : "")} = ${getDefaultAssign(typeName, accessType === "repeated")};\n`;
			console.log(
				`\t(${accessType.slice(0, 1).toUpperCase() + accessType.slice(1)}) field ${varName}: ${typeName}`,
			);
		}
		tsSource += "\tfulfillsOptional(): boolean {\n";
		tsSource += "\t\treturn ";
		let isFirst = true;
		for (const vars of messageVariables) {
			if (!isFirst) tsSource += " && ";
			isFirst = false;
			if (vars.access === "repeated") {
				tsSource += `this.${vars.varName}.size() === 0`;
			} else {
				const thisType = toTSType(vars.type);
				if (thisType === vars.type && thisType !== "string")
					tsSource += `this.${vars.varName}.fulfillsOptional()`;
				else tsSource += `this.${vars.varName} === ${getDefaultForT(thisType)}`;
			}
		}
		tsSource += ";\n\t}\n";
		tsSource += "\tserialize(): Buffer {\n";
		tsSource += "\t\tconst buf = new Buffer(this.getSize() + 2);\n";
		tsSource += "\t\tbuf.wuint16(this.protoIndex);\n";
		tsSource += "\t\tthis.serializeTo(buf, 2);\n";
		tsSource += "\t\treturn buf;\n";
		tsSource += "\t}\n";
		tsSource += "\tserializeTo(buf: Buffer, start: number): number {\n";
		tsSource += "\t\tbuf.cursor = start;\n";
		tsSource += "\t\tlet index = start;\n";
		tsSource += '\t\tlet _s1 = "";\n\t\tlet _s1_size = 0;\n\t\tlet has_opt2 = false;\n';
		tsSource += "\t\tbuf.wuint16(this.getSize());\n";
		for (const vars of messageVariables) {
			if (vars.access === "optional") {
				if (vars.type === toTSType(vars.type) && vars.type !== "string") {
					tsSource += `\t\thas_opt2 = !this.${vars.varName}.fulfillsOptional();\n`;
					tsSource += `\t\tbuf.wbool(has_opt2);\n`;
					tsSource += `\t\tif (has_opt2) {\n`;
					const code = getCode(vars.type, vars.varName);
					tsSource += `\t\t\t${code}\n`;
					tsSource += "\t\t}\n";
				} else {
					tsSource += `\t\thas_opt2 = this.${vars.varName} !== ${getDefaultForT(toTSType(vars.type))};\n`;
					tsSource += `\t\tbuf.wbool(has_opt2);\n`;
					tsSource += `\t\tif (has_opt2) {\n`;
					const code = getCode(vars.type, vars.varName);
					tsSource += `\t\t\t${code}\n`;
					tsSource += "\t\t}\n";
				}
			} else {
				if (vars.access !== "repeated") {
					const code = getCode(vars.type, vars.varName);
					tsSource += `\t\t${code}\n`;
				} else {
					if (getSizeOf(vars.type) !== 0 || vars.type === "string") {
						tsSource += `\t\tbuf.w${vars.type}a(this.${vars.varName});\n`;
					} else {
						tsSource += `\t\tbuf.wuint8(this.${vars.varName}.size());\n`;
						tsSource += `\t\tfor (let i = 0; i < this.${vars.varName}.size(); i++) {\n`;
						tsSource += `\t\t\tthis.${vars.varName}[i].serializeTo(buf, buf.cursor);\n`;
						tsSource += `\t\t}\n`;
					}
				}
			}
		}
		tsSource += "\t\treturn buf.cursor;\n";
		tsSource += "\t}\n";
		tsSource += `\tstatic deserialize(buf: Buffer, start: number = 4): ${protoName} {\n`;
		tsSource += `\t\tlet index = start;\n\t\tlet _msg = new ${protoName}();\n\t\tif (buffer.len(buf.intlBuffer) === 0) return _msg;\n`;
		tsSource += `\t\tbuf.cursor = start;\n`;
		tsSource +=
			"\t\tlet _has_optional = false;\n\t\tlet _repeat_count = 0;\n\t\tlet _len = 0;\n\t\tlet _s1_size = 0;\n";
		for (const vars of messageVariables) {
			if (vars.access === "optional") {
				tsSource += `\t\t_has_optional = buf.rbool();\n`;
				tsSource += `\t\tif (_has_optional) {\n`;
				tsSource += `\t\t\t${getReadCode(vars.type, vars.varName)}\n`;
				tsSource += `\t\t} else {\n`;
				tsSource += `\t\t\t_msg.${vars.varName} = ${getDefaultForT(toTSType(vars.type))};\n`;
				tsSource += "\t\t}\n";
			} else if (vars.access === "required") tsSource += `\t\t${getReadCode(vars.type, vars.varName)}\n`;
			else {
				if (getSizeOf(vars.type) !== 0 || vars.type === "string") {
					tsSource += `\t\t_msg.${vars.varName} = buf.r${vars.type}a();\n`;
				} else {
					tsSource += `\t\t_msg.${vars.varName} = [];\n`;
					tsSource += `\t\t_repeat_count = buf.ruint8();\n`;
					tsSource += `\t\tfor (let i = 0; i < _repeat_count; i++) {\n`;
					tsSource += `\t\t\tbuf.ruint16();\n`;
					tsSource += `\t\t\t_msg.${vars.varName}.push(${vars.type}.deserialize(buf, buf.cursor));\n`;
					tsSource += `\t\t}\n`;
				}
			}
		}
		tsSource += "\t\treturn _msg;\n";
		tsSource += "\t}\n";
		tsSource += "\tgetSize(): number {\n";
		tsSource += "\t\treturn 0";
		let staticSize = 2; //protoIndex u16
		for (const vars of messageVariables) {
			if (vars.access === "optional") staticSize++;
			if (vars.access === "repeated") staticSize++;
			const sizeofThis = getSizeOf(vars.type);
			if (sizeofThis !== 0) {
				if (vars.access !== "repeated") staticSize += sizeofThis;
				else {
					staticSize++;
					tsSource += ` + (${sizeofThis} * this.${vars.varName}.size())`;
				}
			} else {
				if (vars.access !== "repeated") {
					tsSource += ` + ${getSizeCode(vars.type, vars.varName)}`;
				} else {
					if (vars.type !== "string") {
						tsSource += ` + this.${vars.varName}.reduce((a, b) => a + b.getSize(), 0)`;
					} else {
						tsSource += ` + this.${vars.varName}.reduce((a, b) => a + b.size() + 1, 0)`;
					}
				}
			}
		}
		tsSource += ` + ${staticSize}\n\t}\n}`;
		totalBuffer += `${tsSource}\n`;
		message = searchFrom(readBuffer, "message", braceEnd);
		const dir = `./src/shared/Protos/${file.replace(".proto", ".ts")}`;
		if (fs.existsSync(dir)) fs.rmSync(dir);
		fs.writeFileSync(dir, totalBuffer);
	}
	/*const openHandle = fs.openSync("./src/shared/Protos/" + file.replace(".proto", ".ts"));
	fs.writeSync(openHandle, totalBuffer)*/
}
