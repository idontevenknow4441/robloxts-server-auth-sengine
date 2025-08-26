/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable roblox-ts/lua-truthiness */
import { ReplicatedFirst, ReplicatedStorage, RunService, ServerStorage, Workspace } from "@rbxts/services";
import { type Vec3 } from "./Vec3";

export type HullRecord = {
	instance: Instance;
	isLadder: boolean;
	collideEvent: BindableEvent;
};
export type EndType = {
	startPos: Vector3;
	endPos: Vector3;
	fraction: number;
	startSolid: boolean;
	allSolid: boolean;
	planeNum: number;
	planeD: number;
	normal: Vector3;
	checks: number;
	hullRecord: HullRecord;
	penetration: number;
	pnormal: Vector3;
};
export type CollideEventCallback = {
	colliderEntityId: number;
	wasStrongHit: boolean;
	result: EndType;
	wasCrashLand: boolean;
};
const CLIENT_WORLDS = ReplicatedFirst.WaitForChild("Worlds");
const SERVER_WORLDS = RunService.IsServer() ? ServerStorage.WaitForChild("Worlds") : undefined;
export type RequiredWorldModule = {
	Sweep: (startPos: Vector3, endPos: Vector3, caller?: number, wasHardHit?: boolean, x?: boolean[]) => EndType;
	MakeWorld: (r: RequiredWorldModule, descendant: Instance, size: Vector3) => buffer;
	AddDynamicPart: (p: Instance) => void;
	RemoveDynamicPart: (p: Instance) => void;
	UpdateDynamicParts: () => void;
	GetHullsInRegion: (pos: Vector3, size: Vec3 | Vector3) => HullRecord[];
	FindAABB: (r: RequiredWorldModule, part: BasePart, x: boolean) => [number, number, number, number, number, number];
};
const template = ReplicatedStorage.WaitForChild("TS")
	.WaitForChild("LuaDependencies")
	.WaitForChild("CollisionModule") as ModuleScript;
export function MakeWorld(identifier: string, fold: Instance, hullSize: Vector3) {
	const modl = (SERVER_WORLDS || CLIENT_WORLDS).FindFirstChild(identifier) as ModuleScript;
	if (modl) {
		const req = require(modl) as RequiredWorldModule;
		let buf = req.MakeWorld(req, fold, hullSize);
		return [req as RequiredWorldModule, buf];
	}
	const mod = template.Clone() as ModuleScript;
	mod.Name = identifier;
	mod.Parent = SERVER_WORLDS || CLIENT_WORLDS;
	const req = require(mod) as RequiredWorldModule;
	let buf = req.MakeWorld(req, fold, hullSize);
	return [req as RequiredWorldModule, buf];
}
export function GetWorld(identifier: string): RequiredWorldModule {
	let path = SERVER_WORLDS || CLIENT_WORLDS;
	const world = path.FindFirstChild(identifier);
	assert(world !== undefined, `The world ${identifier} could not be found!`);
	return require(world as ModuleScript) as RequiredWorldModule;
}
export function GetWorldSafe(identifier: string): RequiredWorldModule | undefined {
	let path = SERVER_WORLDS || CLIENT_WORLDS;
	const world = path.FindFirstChild(identifier);
	if (world === undefined) return;
	return require(world as ModuleScript) as RequiredWorldModule;
}
export let rcWorld = GetWorldSafe("RaycastWorld");
export function Raycast(
	pos: Vec3,
	dir: Vec3,
	updateDynamicParts: boolean = false,
	x: number[] = [],
): EndType | undefined {
	if (!rcWorld && !(rcWorld = GetWorldSafe("RaycastWorld"))) return;
	if (updateDynamicParts) rcWorld.UpdateDynamicParts();
	let nm: boolean[] = [];
	x.forEach((v) => {
		nm[v - 1] = true;
	});
	return rcWorld.Sweep(pos.ToVector3(), pos.add(dir).ToVector3(), -1, false, nm);
}
