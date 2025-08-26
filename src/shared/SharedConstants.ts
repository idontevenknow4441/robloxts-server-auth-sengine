/* eslint-disable @typescript-eslint/no-namespace */
import { ReplicatedStorage, Workspace } from "@rbxts/services";

export namespace SharedConst {
	export const ModelPath: Folder = ReplicatedStorage.WaitForChild("Models") as Folder;
	export const ModelResidence: Folder = Workspace.WaitForChild("Models") as Folder;
	export const UDP: UnreliableRemoteEvent = ReplicatedStorage.WaitForChild("UDP") as UnreliableRemoteEvent;
	export const TCP: RemoteEvent = ReplicatedStorage.WaitForChild("TCP") as RemoteEvent;
	export const FLOAT_TIME_REDUCTION = 1750000000;
}
