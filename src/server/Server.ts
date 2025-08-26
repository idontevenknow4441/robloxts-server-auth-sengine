import { CInitializeMeMessage } from "shared/Protos/Game";
import { EBaseEntity } from "./Entities/EBaseEntity";
import { EPlayer, EPlayerCreateInfo } from "./Entities/EPlayer";
import { CUserCommand } from "shared/Protos/Movement";
import { UserCmd } from "shared/UserCmd";
import { Vec3 } from "shared/Vec3";
import { u64_to_u8 } from "shared/Math";
import { SharedConst } from "shared/SharedConstants";
import { Buffer } from "shared/Buffer";
import { MakeWorld, RequiredWorldModule } from "shared/WorldClassWrapper";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
const World = ReplicatedStorage.WaitForChild("WorldRem") as RemoteEvent;
export interface MetaWorld extends Folder {
	CTSpawns: Folder;
	TSpawns: Folder;
}

export class Server {
	entities = new Map<number, EBaseEntity>();
	players = new Map<Player, EPlayer>();
	lastIndex: number = 1;
	tick: number = 0;
	playerWorld: RequiredWorldModule;
	serializedWorld: buffer;
	rollbackPositions = new Map<number, { pos: Vec3; yaw: number; pitch: number; plr: EPlayer }[]>();
	ProcessPacket(buff: buffer, plr: Player) {
		const uType = buffer.readu16(buff, 0);
		const buf = new Buffer(buff);
		switch (uType) {
			case CInitializeMeMessage.protoIndex: {
				const info: EPlayerCreateInfo = {
					player: plr,
					server: this,
				};
				const p = new EPlayer(info);
				this.entities.set(p.id, p);
				this.players.set(plr, p);
				const pck = p.GetCreatePacket();
				SharedConst.TCP.FireAllClients(pck.serialize().intlBuffer);
				World.FireClient(plr, this.serializedWorld);
				let arr = [];
				for (const [_, ent] of this.entities) {
					if (ent === p) continue;
					arr.push(ent.GetCreatePacket().serialize().intlBuffer);
				}
				SharedConst.TCP.FireClient(plr, arr);
				break;
			}
			case CUserCommand.protoIndex: {
				const data = CUserCommand.deserialize(buf);
				const userCmd = UserCmd.Decode(data);
				const eplr = this.players.get(plr);
				if (!eplr) return warn(`Player ${plr.Name} attempted to move while not in playermap`);
				eplr.pendingCmds.push(userCmd);
			}
		}
	}
	AllocateEntityId(): number {
		return this.lastIndex++;
	}
	Update(delta: number) {}
	constructor() {
		let [playerWorld, buf] = MakeWorld("PlayerWorld", Workspace.WaitForChild("Map"), new Vector3(2, 5, 2));
		this.playerWorld = playerWorld as RequiredWorldModule;
		this.serializedWorld = buf as buffer;
	}
}
