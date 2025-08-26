import { CLagCompensationStruct, CUserCommand } from "./Protos/Movement";
import { Vec3 } from "./Vec3";
export interface LagCompInfo {
	tick0: number;
	tick1: number;
	lerpAlpha: number;
}
export class UserCmd {
	pitch: number = 0;
	yaw: number = 0;
	deltaTime: number = 0;
	commandIndex: number = 0;
	keysPressed: number = 0;
	ogWishmove: Vec3 = Vec3.zero();
	lagCompInfo: LagCompInfo;
	Encode(): CUserCommand {
		const cmd = new CUserCommand();
		cmd.pitch = math.deg(this.pitch);
		cmd.yaw = math.deg(this.yaw);
		cmd.wishkeys = this.keysPressed;
		cmd.deltaTime = this.deltaTime;
		cmd.commandIndex = this.commandIndex;
		cmd.lagComp = new CLagCompensationStruct();
		cmd.lagComp.tick1 = this.lagCompInfo.tick0;
		cmd.lagComp.tick2 = this.lagCompInfo.tick1;
		cmd.lagComp.alpha = this.lagCompInfo.lerpAlpha;
		return cmd;
	}
	constructor(
		pitch: number = 0,
		yaw: number = 0,
		wishmove: Vec3 = Vec3.zero(),
		delta: number = 0.0166,
		index: number = 0,
		optKeys: number = 0,
		lagComp: LagCompInfo,
	) {
		this.pitch = pitch;
		this.yaw = yaw;
		this.ogWishmove = wishmove;
		this.keysPressed =
			(wishmove.x === -1 ? 1 : 0) +
			(wishmove.x === 1 ? 2 : 0) +
			(wishmove.y === 1 ? 4 : 0) +
			(wishmove.z === 1 ? 8 : 0) +
			(wishmove.z === -1 ? 16 : 0) +
			optKeys;
		this.deltaTime = delta;
		this.commandIndex = index;
		this.lagCompInfo = lagComp;
	}
	static Decode(msg: CUserCommand): UserCmd {
		const [a, d, space, w, s] = [
			(msg.wishkeys & 1) !== 0 ? -1 : 0,
			(msg.wishkeys & 2) !== 0 ? 1 : 0,
			(msg.wishkeys & 4) !== 0 ? 1 : 0,
			(msg.wishkeys & 8) !== 0 ? 1 : 0,
			(msg.wishkeys & 16) !== 0 ? -1 : 0,
		];
		const pitch = math.rad(msg.pitch);
		const yaw = math.rad(msg.yaw);
		const delta = msg.deltaTime;
		const commandIndex = msg.commandIndex;
		const optKeys = (msg.wishkeys & 32) + (msg.wishkeys & 64) + (msg.wishkeys & 128);
		const lagcomp = msg.lagComp;
		return new UserCmd(pitch, yaw, new Vec3(a + d, space, w + s), delta, commandIndex, optKeys, {
			tick0: lagcomp.tick1,
			tick1: lagcomp.tick2,
			lerpAlpha: lagcomp.alpha,
		});
	}
}
