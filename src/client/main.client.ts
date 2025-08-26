import { SharedConst } from "shared/SharedConstants";
import { LocalState } from "./LocalState";
import { CInitializeMeMessage } from "shared/Protos/Game";
import { Debris, ReplicatedStorage, RunService, StarterGui, UserInputService, Workspace } from "@rbxts/services";
import { UserCmd } from "shared/UserCmd";
import { Vec3 } from "shared/Vec3";
import { CUserCommand } from "shared/Protos/Movement";
const Camera = Workspace.CurrentCamera!;
StarterGui.SetCoreGuiEnabled("Backpack", false);
let CMD = 0;
const LOCALSTATE = new LocalState();
const World = ReplicatedStorage.WaitForChild("WorldRem") as RemoteEvent;
const WorldPath = Workspace.WaitForChild("Map");
function Handler(msg: unknown) {
	if (typeIs(msg, "buffer")) {
		LOCALSTATE.HandlePacket(msg);
		return;
	} else {
		for (const buf of msg as buffer[]) {
			LOCALSTATE.HandlePacket(buf);
		}
	}
}

World.OnClientEvent.Connect((data) => {
	let size = buffer.len(data) / 22;
	for (let i = 0; i < size; i++) {
		const name = buffer.readu32(data, i * 22);
		const p = WorldPath.WaitForChild(name) as Part;
		const e = CFrame.fromOrientation(
			math.rad(buffer.readi16(data, i * 22 + 4)),
			math.rad(buffer.readi16(data, i * 22 + 6)),
			math.rad(buffer.readi16(data, i * 22 + 8)),
		);
		const pos = new Vector3(
			buffer.readf32(data, i * 22 + 10),
			buffer.readf32(data, i * 22 + 14),
			buffer.readf32(data, i * 22 + 18),
		);
		p.PivotTo(new CFrame(pos).mul(e));
	}
	LOCALSTATE.MakeWorld();
});
const testBox = new Instance("Part");
testBox.Parent = Workspace;
testBox.Anchored = true;
testBox.Size = new Vector3(3, 5, 3);
SharedConst.TCP.OnClientEvent.Connect(Handler);
SharedConst.UDP.OnClientEvent.Connect(Handler);
const msg = new CInitializeMeMessage();
SharedConst.TCP.FireServer(msg.serialize().intlBuffer);
const k = (x: CastsToEnum<Enum.KeyCode>) => {
	return UserInputService.IsKeyDown(x) ? 1 : 0;
};
const HALF_PI = math.pi * 0.5;
let wasDone = false;
RunService.RenderStepped.Connect((delta) => {
	LOCALSTATE.Update(delta);
	const LV = Camera.CFrame.LookVector;
	const pitch = math.atan(LV.Y / math.cos(math.asin(LV.Y)));
	const yaw = math.atan2(LV.Z, -LV.X) + HALF_PI;
	let forward = k("S") - k("W");
	let side = k("D") - k("A");
	let jump = k("Space");
	let wishKeys = 0;
	if (!wasDone) {
		if (UserInputService.IsKeyDown("E")) {
			wishKeys += 32;
			wasDone = true;
			for (const [_, ent] of LOCALSTATE.entities) {
				const mdl = ent.model.Clone();
				mdl.Parent = Workspace;
				for (const child of mdl.GetChildren() as Part[]) {
					child.Color = Color3.fromRGB(0, 255, 0);
				}
				Debris.AddItem(mdl, 3);
			}
		}
	} else {
		wasDone = UserInputService.IsKeyDown("E");
	}
	const uscmd = new UserCmd(pitch, yaw, new Vec3(side, jump, forward), delta, CMD++, wishKeys, {
		tick0: LOCALSTATE.currentLagCompInfo.pck0,
		tick1: LOCALSTATE.currentLagCompInfo.pck1,
		lerpAlpha: LOCALSTATE.currentLagCompInfo.alpha,
	});
	if (!LOCALSTATE.repredicting) {
		const finalBuf = uscmd.Encode().serialize();
		SharedConst.UDP.FireServer(finalBuf.intlBuffer);
		const newcmd = UserCmd.Decode(CUserCommand.deserialize(finalBuf));
		if (LOCALSTATE.localMovement && LOCALSTATE.playerWorld) {
			LOCALSTATE.Predict(newcmd);
		}
	}
});
