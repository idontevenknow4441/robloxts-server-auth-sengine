import { UserCmd } from "shared/UserCmd";
import { EBaseEntity, EBaseEntityCreateInfo } from "./EBaseEntity";
import { CEntityCreateMessage } from "shared/Protos/Game";
import { LerpAngle, u64_to_u8 } from "shared/Math";
import { GameMovement } from "shared/Movement";
import { Debris, Workspace } from "@rbxts/services";
import { CMovementResultMessage } from "shared/Protos/Movement";
import { SharedConst } from "shared/SharedConstants";
import { Vec3 } from "shared/Vec3";
export interface EPlayerCreateInfo extends EBaseEntityCreateInfo {
	player: Player;
}
export class EPlayer extends EBaseEntity {
	basePlayer: Player;
	pendingCmds: UserCmd[] = [];
	override defIndex: number = 1;
	yaw: number = 0;
	pitch: number = 0;
	movement: GameMovement;
	hasTeleported: boolean = false;
	constructor(info: EPlayerCreateInfo) {
		info.model = "player";
		super(info);
		this.basePlayer = info.player;
		this.movement = new GameMovement(this.velocity);
	}
	override GetCreatePacket(): CEntityCreateMessage {
		const pck = super.GetCreatePacket();
		pck.data = u64_to_u8(this.basePlayer.UserId);
		return pck;
	}
	Teleport(pos: Vec3) {
		this.position.CopyFrom(pos);
		this.movement.position.CopyFrom(pos);
		this.hasTeleported = true;
		this.pendingCmds.clear();
	}
	Update(delta: number) {
		super.Update(delta);
		let lastIndex = 0;
		for (const userCmd of this.pendingCmds) {
			this.yaw = userCmd.yaw;
			this.pitch = userCmd.pitch;

			this.movement.Process(userCmd, this.server.playerWorld);
			this.position.CopyFrom(this.movement.position);
			lastIndex = userCmd.commandIndex;
			if ((userCmd.keysPressed & 32) !== 0) {
				let pck0 = userCmd.lagCompInfo.tick0;
				let pck1 = userCmd.lagCompInfo.tick1;
				let rollback = this.server.rollbackPositions.get(pck0);
				if (!rollback) continue;
				let rollback2 = this.server.rollbackPositions.get(pck1);
				if (!rollback2) continue;
				for (const [idx, ent] of this.server.entities) {
					const mdl = ent.model.Clone();
					mdl.Parent = Workspace;
					for (const p of mdl.GetChildren() as Part[]) {
						p.Color = Color3.fromRGB(255, 0, 0);
					}
					const alpha = math.clamp(userCmd.lagCompInfo.lerpAlpha, 0, 1);
					const lerp = rollback[ent.id - 1].pos.LerpTo(rollback2[ent.id - 1].pos, alpha);
					const yaw = LerpAngle(
						math.rad(rollback[ent.id - 1].yaw),
						math.rad(rollback[ent.id - 1].yaw),
						alpha,
					);
					const dir = new Vector3(math.cos(-yaw + 1.5707), 0, math.sin(-yaw + 1.5707)).Unit;
					mdl.PivotTo(CFrame.lookAt(lerp.ToVector3(), lerp.ToVector3().add(dir)));
					Debris.AddItem(mdl, 3);
				}
			}
		}
		if (this.server.tick % 3 === 0 && lastIndex !== 0) {
			const mvtresult = new CMovementResultMessage();
			mvtresult.commandIndex = lastIndex;
			mvtresult.position = this.position.ToVec3f32();
			mvtresult.velocity = this.velocity.ToVec3f32();
			SharedConst.UDP.FireClient(this.basePlayer, mvtresult.serialize().intlBuffer);
		}
		this.pendingCmds.clear();
	}
}
