import { ReplicatedStorage } from "@rbxts/services";
import { type Server } from "server/Server";
import { CEntityCreateMessage } from "shared/Protos/Game";
import { SharedConst } from "shared/SharedConstants";
import { Vec3 } from "shared/Vec3";
import { RequiredWorldModule } from "shared/WorldClassWrapper";

export interface EBaseEntityCreateInfo {
	position?: Vec3;
	model?: string | Model;
	server: Server;
}
export class EBaseEntity {
	position: Vec3;
	velocity: Vec3;
	defIndex: number = 0;
	grounded: boolean = false;
	model: Model;
	modelRef: string;
	id: number;
	server: Server;
	constructor(cInfo: EBaseEntityCreateInfo) {
		this.server = cInfo.server as Server;
		this.position = cInfo.position ?? Vec3.zero();
		this.velocity = Vec3.zero();
		if (cInfo.model === undefined) cInfo.model = "default";
		const mdlName = typeIs(cInfo.model, "string") ? cInfo.model : cInfo.model.Name;
		this.modelRef = mdlName;
		if (typeIs(cInfo.model, "string")) this.model = SharedConst.ModelPath.FindFirstChild(mdlName) as Model;
		else this.model = cInfo.model;
		this.model = this.model.Clone();
		//this.model.Parent = SharedConst.ModelResidence;
		assert(!!this.model, `Model ${mdlName} not found!`);
		this.id = this.server.AllocateEntityId();
	}
	GetCreatePacket(): CEntityCreateMessage {
		const pck = new CEntityCreateMessage();
		pck.entId = this.id;
		pck.entDefIndex = this.defIndex;
		pck.model = this.modelRef;
		return pck;
	}
	Update(delta: number) {}
}
