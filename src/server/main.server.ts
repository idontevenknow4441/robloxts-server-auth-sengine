import { SharedConst } from "shared/SharedConstants";
import { Server } from "./Server";
import { RunService, Workspace } from "@rbxts/services";
import { EPlayer } from "./Entities/EPlayer";
import { CPlayerPositionsUpdate, CPlayerPositionUpdate } from "shared/Protos/Game";
import { CMovementResultMessage } from "shared/Protos/Movement";

const SERVER = new Server();
function Handler(player: Player, data: unknown) {
	if (typeIs(data, "table")) {
		(data as []).forEach((x) => {
			if (!typeIs(x, "buffer")) return;
			SERVER.ProcessPacket(x, player);
		});
	} else {
		if (!typeIs(data, "buffer")) return;
		SERVER.ProcessPacket(data, player);
	}
}
SharedConst.TCP.OnServerEvent.Connect(Handler);
SharedConst.UDP.OnServerEvent.Connect(Handler);
RunService.Stepped.Connect((_, delta) => {
	SERVER.tick++;
	const updMessage = new CPlayerPositionsUpdate();
	updMessage.tick = SERVER.tick;
	updMessage.time = Workspace.GetServerTimeNow() - SharedConst.FLOAT_TIME_REDUCTION;
	for (const [id, ent] of SERVER.entities) {
		ent.Update(delta);
		if (ent instanceof EPlayer) {
			const msg = new CPlayerPositionUpdate();
			msg.pitch = math.deg(ent.pitch);
			msg.yaw = math.deg(ent.yaw);
			msg.playerId = id;
			msg.pos = ent.position.ToVec3f32();
			if (ent.hasTeleported) {
				ent.hasTeleported = false;
				msg.wasTeleport = true;
			}
			updMessage.positions.push(msg);
			if (!SERVER.rollbackPositions.get(SERVER.tick)) {
				SERVER.rollbackPositions.set(SERVER.tick, []);
			}
			SERVER.rollbackPositions.get(SERVER.tick)![ent.id - 1] = {
				pos: ent.position.Clone(),
				yaw: msg.yaw,
				pitch: msg.pitch,
				plr: ent,
			};
		}
	}
	if (SERVER.tick % 3 === 0) {
		SharedConst.UDP.FireAllClients(updMessage.serialize().intlBuffer);
	}
	SERVER.Update(delta);
});
