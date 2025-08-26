type HullRecord = {
	instance: Instance;
	Update: (() => void) | undefined;
	isLadder: boolean;
	collideEvent: BindableEvent;
};
type EndType = {
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
};
interface CollisionModule {
	MakeWorld(descendant: Folder, playerSize: Vector3): buffer;
	Sweep(startPos: Vector3, endPos: Vector3): EndType;
}

declare const Module: CollisionModule;

export = Module;
