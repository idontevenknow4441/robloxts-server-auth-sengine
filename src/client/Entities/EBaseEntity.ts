import { ReplicatedStorage } from "@rbxts/services";
import { CEntityCreateMessage } from "shared/Protos/Game";
import { SharedConst } from "shared/SharedConstants";
import { Vec3 } from "shared/Vec3";

export interface EBaseEntityCreateInfo {
	position?: Vec3;
	model?: string | Model;
	id: number;
	extraData?: string;
}
export class EBaseEntity {
	position: Vec3;
	velocity: Vec3;
	isLocal: boolean = false;
	defIndex: number = 0;
	grounded: boolean = false;
	model: Model;
	modelRef: string;
	createdSuccessfully: boolean = true;
	id: number;
	constructor(cInfo: EBaseEntityCreateInfo) {
		this.position = cInfo.position ?? Vec3.zero();
		this.velocity = Vec3.zero();
		if (cInfo.model === undefined) cInfo.model = "default";
		const mdlName = typeIs(cInfo.model, "string") ? cInfo.model : cInfo.model.Name;
		this.modelRef = mdlName;
		if (typeIs(cInfo.model, "string")) this.model = SharedConst.ModelPath.FindFirstChild(mdlName) as Model;
		else this.model = cInfo.model;
		assert(!!this.model, `Model ${mdlName} not found!`);
		this.model = this.model.Clone();
		this.model.Parent = SharedConst.ModelResidence;
		this.id = cInfo.id;
	}
	Update(delta: number) {}
}
