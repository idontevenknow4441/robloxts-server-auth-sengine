import { u8s_to_u64 } from "shared/Math";
import { EBaseEntity, EBaseEntityCreateInfo } from "./EBaseEntity";
import { Players } from "@rbxts/services";

//export interface EPlayerCreateInfo extends EBaseEntityCreateInfo {}
export class EPlayer extends EBaseEntity {
	declare basePlayer: Player;
	yaw: number = 0;
	pitch: number = 0;
	constructor(info: EBaseEntityCreateInfo) {
		super(info);
		const userId = u8s_to_u64(info.extraData!);
		const plr = Players.GetPlayerByUserId(userId);
		if (!plr) {
			warn(`Player ${userId} doesn't exist!`);
			this.createdSuccessfully = false;
		} else this.basePlayer = plr;
	}
	Update(delta: number) {
		super.Update(delta);
	}
}
