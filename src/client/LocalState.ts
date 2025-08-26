import { CEntityCreateMessage, CPlayerPositionsUpdate, CPlayerPositionUpdate } from "shared/Protos/Game";
import { EPlayer } from "./Entities/EPlayer";
import { EBaseEntity } from "./Entities/EBaseEntity";
import { Vec3 } from "shared/Vec3";
import { SharedConst } from "shared/SharedConstants";
import { Buffer } from "shared/Buffer";
import { Players, Workspace } from "@rbxts/services";
import { Lerp, LerpAngle, LerpAngle2 } from "shared/Math";
import { MakeWorld, RequiredWorldModule } from "shared/WorldClassWrapper";
import { GameMovement } from "shared/Movement";
import { UserCmd } from "shared/UserCmd";
import { CMovementResultMessage } from "shared/Protos/Movement";

export class LocalState {
	declare localEnt: EPlayer;
	entities = new Map<number, EBaseEntity>();
	updates: CPlayerPositionsUpdate[] = [];
	currentLagCompInfo = { pck0: 0, pck1: 0, alpha: 0 };
	predictions: { cmd: UserCmd; pos: Vec3; vel: Vec3 }[] = [];
	highestIndex: number = 0;
	declare playerWorld: RequiredWorldModule;
	declare localMovement: GameMovement;
	repredicting: boolean = false;
	constructor() {}
	HandlePacket(buff: buffer) {
		const uType = buffer.readu16(buff, 0);
		const buf = new Buffer(buff);
		switch (uType) {
			case CEntityCreateMessage.protoIndex: {
				const msg = CEntityCreateMessage.deserialize(buf);
				print(msg);
				if (msg.model === "") msg.model = undefined!;
				let ent;
				switch (msg.entDefIndex) {
					case 0:
						ent = new EBaseEntity({
							position: new Vec3(msg.position),
							model: msg.model ?? "default",
							id: msg.entId,
						});
						break;
					case 1:
						ent = new EPlayer({
							position: new Vec3(msg.position),
							model: msg.model ?? "player",
							id: msg.entId,
							extraData: msg.data,
						});
						if (ent.basePlayer === Players.LocalPlayer) {
							this.localEnt = ent;
							Workspace.CurrentCamera!.CameraSubject = ent.model.FindFirstChild("Head") as Part;
							Workspace.CurrentCamera!.CameraType = Enum.CameraType.Custom;
							this.localMovement = new GameMovement(ent.velocity);
							ent.isLocal = true;
						}
						break;
				}
				if (!ent?.createdSuccessfully) return;
				this.entities.set(ent.id, ent);
				break;
			}
			case CPlayerPositionsUpdate.protoIndex: {
				const msg = CPlayerPositionsUpdate.deserialize(buf);
				msg.time = tick() - 0.01;
				this.updates.push(msg);
				break;
			}
			case CMovementResultMessage.protoIndex: {
				const msg = CMovementResultMessage.deserialize(buf);
				const pred = this.predictions[msg.commandIndex - 1];
				if (!pred) return warn("Empty prediction", msg.commandIndex);
				const p1 = pred.pos;
				const p2 = new Vec3(msg.position);
				const diff = p2.sub(p1).Magnitude();
				let pos = p2.Clone();
				let vel = new Vec3(msg.velocity);
				if (diff > 0.01) {
					this.repredicting = true;
					/*this.localMovement.position.CopyFrom(p2);
					this.localMovement.velocity.CopyFrom(vel);
					this.localEnt.position.CopyFrom(p2);*/
					for (let i = msg.commandIndex + 1; i <= this.highestIndex; i++) {
						this.Predict(this.predictions[i - 1].cmd, vel, pos);
						pos.CopyFrom(this.localMovement.position);
						vel.CopyFrom(this.localMovement.velocity);
					}
					this.repredicting = false;
				}
				break;
			}
		}
	}
	Predict(cmd: UserCmd, vel: Vec3 = this.localMovement.velocity, pos: Vec3 = this.localEnt.position) {
		this.localMovement.velocity.CopyFrom(vel);
		this.localMovement.position.CopyFrom(pos);
		this.localMovement.Process(cmd, this.playerWorld);
		this.localEnt.pitch = cmd.pitch;
		this.localEnt.yaw = cmd.yaw;
		this.localEnt.position.CopyFrom(this.localMovement.position);
		const yaw = cmd.yaw;
		const dir = new Vector3(math.cos(-yaw + 1.5707), 0, math.sin(-yaw + 1.5707)).Unit;
		const pos2 = this.localMovement.position.ToVector3();
		this.localEnt?.model.PivotTo(CFrame.lookAt(pos2, pos2.add(dir)));
		this.predictions[cmd.commandIndex - 1] = {
			cmd: cmd,
			pos: this.localEnt.position.Clone(),
			vel: this.localMovement.velocity.Clone(),
		};
		this.highestIndex = math.max(cmd.commandIndex, this.highestIndex);
	}
	Update(delta: number) {
		const time = tick() - 0.1;
		while (this.updates.size() >= 2) {
			if (this.updates[1].time <= time) {
				this.updates.shift();
			} else break;
		}
		if (this.updates.size() < 2) return;
		let sp1 = this.updates[0];
		let sp2 = this.updates[1];

		let t1 = sp1.time;
		let t2 = sp2.time;
		let alpha = math.clamp((time - t1) / (t2 - t1), 0, 1);
		// eslint-disable-next-line roblox-ts/lua-truthiness
		if (sp2.positions[0].wasTeleport) alpha = 1;
		this.currentLagCompInfo.pck0 = sp1.tick;
		this.currentLagCompInfo.pck1 = sp2.tick;
		this.currentLagCompInfo.alpha = alpha;
		for (const plr of sp2.positions) {
			const ent = this.entities.get(plr.playerId);
			if (!ent) continue;
			if (ent.isLocal) continue;
			const oldPos = sp1.positions.find((x) => x.playerId === plr.playerId);
			if (!oldPos) continue;
			const lerp = new Vec3(oldPos.pos).LerpTo(new Vec3(plr.pos), alpha);
			const yaw = LerpAngle(math.rad(oldPos.yaw), math.rad(plr.yaw), alpha);
			const dir = new Vector3(math.cos(-yaw + 1.5707), 0, math.sin(-yaw + 1.5707)).Unit;
			ent.model.PivotTo(CFrame.lookAt(lerp.ToVector3(), lerp.ToVector3().add(dir)));
			//ent.model.PivotTo(new CFrame(lerp.ToVector3()).mul(CFrame.Angles(r1, math.rad(r2), r3)));
			ent.position.CopyFrom(lerp);
		}
	}
	MakeWorld() {
		this.playerWorld = MakeWorld(
			"PlayerWorld",
			Workspace.WaitForChild("Map"),
			new Vector3(2, 5, 2),
		)[0] as RequiredWorldModule;
	}
}
