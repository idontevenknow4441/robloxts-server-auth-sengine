/* eslint-disable no-constant-condition */
/* eslint-disable roblox-ts/lua-truthiness */
import { Workspace } from "@rbxts/services";
import { ClipVector, ClipVelocity, VectorMa } from "./Math";
import { UserCmd } from "./UserCmd";
import { Vec3 } from "./Vec3";
import { EndType, RequiredWorldModule } from "./WorldClassWrapper";
export class GameMovement {
	position: Vec3;
	grounded: boolean = true;
	velocity: Vec3;
	deltaTime: number = 0;
	lastLadder?: EndType;
	gravityScale: number = 1;
	lastWishdir: Vec3;
	constructor(vel: Vec3) {
		this.velocity = vel;
		this.position = Vec3.zero();
		this.lastWishdir = Vec3.zero();
	}
	Accelerate(wishdir: Vec3, wishspeed: number = 14, accel: number = 1600) {
		const speed = this.velocity.Dot(wishdir);
		const addspeed = wishspeed - speed;
		if (addspeed < 0) return;
		let accelSpeed = accel * wishspeed * this.deltaTime;
		if (accelSpeed > addspeed) accelSpeed = addspeed;
		this.velocity.x += wishdir.x * accelSpeed;
		this.velocity.z += wishdir.z * accelSpeed;
		if (this.grounded) {
			let flat = this.velocity.Clone();
			flat.y = 0;
			let magn = flat.Magnitude();
			if (magn > wishspeed) {
				this.velocity.CopyFrom(this.velocity.Unit().mul(wishspeed));
			}
		}
	}
	Friction() {
		const speed = this.velocity.Magnitude();
		if (speed < 0.01) return this.velocity.MulBy(0);
		let newspeed = speed - (speed < 5 ? 5 : speed) * 4 * this.deltaTime;
		if (newspeed < 0) newspeed = 0;
		if (newspeed !== speed) newspeed /= speed;
		this.velocity.MulBy(newspeed);
	}
	Gravity() {
		if (this.grounded) this.velocity.y = 0;
		else this.velocity.y -= this.deltaTime * 40 * this.gravityScale;
	}
	MakeWishdir(keys: Vec3, yaw: number, pitch: number) {
		let moveVector = new Vec3(keys.x, 0, keys.z).Unit();
		const forward = new Vec3(-math.sin(yaw), 0, -math.cos(yaw));
		const right = new Vec3(-forward.z, 0, forward.x);
		const back = forward.mul(-1);

		if (moveVector.Magnitude() !== 0) {
			moveVector = back.mul(moveVector.z).add(right.mul(moveVector.x));
			moveVector = Vec3.FromVector3(ClipVector(moveVector.ToVector3(), Vector3.yAxis));
		}
		moveVector = moveVector.Unit();
		moveVector.y = keys.y;
		return moveVector;
	}
	DoGroundCheck(world: RequiredWorldModule) {
		const sp = this.position.add(new Vec3(0, 0.1, 0)).ToVector3();
		const ep = sp.add(new Vector3(0, -0.2, 0));
		const res = world.Sweep(sp, ep);
		return res.fraction < 1 ? res : undefined;
	}
	LadderMove(world: RequiredWorldModule, wishdir: Vec3, pitch: number, yaw: number, wishmove: Vec3) {
		let trace: EndType = undefined!;
		//const [epX, epZ] = [-math.sign(this.lastLadder?.endPos.X || 0), -math.sign(this.lastLadder?.endPos.Z || 0)];
		/*let hypothetical = this.lastLadder; /* !== undefined
				? world.Sweep(
						this.position.ToVector3(),
						new Vector3(
							this.lastLadder?.endPos.X + 0.1 * epX,
							this.position.y,
							this.lastLadder?.endPos.Z + 0.1 * epZ,
						),
					)
				: undefined;*/
		/*if (hypothetical) {
			let v = Vec3.FromVector3(hypothetical.normal);
			const res = world.Sweep(
				this.position.ToVector3(),
				hypothetical.endPos.Unit, //new Vector3(-hypothetical.normal.X, -hypothetical.normal.Y, -hypothetical.normal.Z),
			);
			hypothetical = res;
			print(hypothetical.normal);
		}*/
		let [sy, cy] = [math.sin(yaw), math.cos(yaw)];
		let [sp, cp] = [math.sin(pitch), math.cos(pitch)];
		let [sr, cr] = [0, 1];
		/*const forward = new Vec3(cp * cy, sp, -sy * cp);
		const right = new Vec3(-sy, 0, -cy);*/
		const forward = new Vec3(-cp * sy, sp, -cp * cy);
		const right = new Vec3(-(-1 * sr * sp * sy + -1 * cr * cy), 0, -(-1 * sr * sp * cy + -1 * cr * -sy));
		let wdUsed = wishdir.Compare(Vec3.Zero) ? this.lastWishdir : wishdir;
		if (
			true
			//this.lastLadder === undefined ||
			//!hypothetical?.hullRecord?.isLadder
			//hypothetical.endPos.sub(hypothetical.startPos).Magnitude > 0.001
		) {
			//let wd = right.mul(wishmove.z);
			const traceEnd = VectorMa(this.position, 0.1, wdUsed);
			trace = world.Sweep(this.position.ToVector3(), traceEnd.ToVector3());
			/*if (!trace.hullRecord?.isLadder) {
				const newWd = forward.mul(wishmove.x);
				const newTraceEnd = VectorMa(this.position, 0.1, newWd);
				trace = world.Sweep(this.position.ToVector3(), newTraceEnd.ToVector3());
			}*/
			if (!trace.hullRecord?.isLadder) return false;
		} else {
			//trace = this.lastLadder;
		}
		if (!trace.hullRecord.isLadder) return false;
		this.lastLadder = trace;
		this.gravityScale = 0;
		let [forwardSpeed, rightSpeed] = [0, 0];

		const speedMult = 15;
		this.lastWishdir.CopyFrom(wdUsed);

		if (wishmove.x === -1) rightSpeed -= speedMult;
		else if (wishmove.x === 1) rightSpeed += speedMult;
		if (wishmove.z === -1) forwardSpeed += speedMult;
		else if (wishmove.z === 1) forwardSpeed -= speedMult;
		if (wishmove.y === 1) {
			this.velocity.CopyFrom(trace.normal.mul(20));
			this.lastLadder = undefined;
			return false;
		} else {
			print(forwardSpeed, rightSpeed);
			this.grounded = false;
			if (forwardSpeed !== 0 || rightSpeed !== 0) {
				let vel = forward.mul(forwardSpeed);
				/*let vel = (forward as unknown as Vec3)
					.mul(forwardSpeed)
					.add((right as unknown as Vec3).mul(rightSpeed));*/
				vel = VectorMa(vel, rightSpeed, right);
				let tmp = Vector3.yAxis;
				let perp = tmp.Cross(trace.normal);
				if (perp.Magnitude > 0) perp = perp.Unit;

				const normal = vel.ToVector3().Dot(trace.normal);
				const cross = trace.normal.mul(normal);
				let lateral = vel.sub(Vec3.FromVector3(cross)).ToVector3();
				tmp = trace.normal.Cross(perp);

				const [tmpDist, perpDist] = [tmp.Dot(lateral), perp.Dot(lateral)];
				let angle = perp.mul(perpDist).add(cross);

				if (angle.Magnitude > 0) angle = angle.Unit;
				if (angle.Dot(trace.normal) < -0.7) lateral = tmp.mul(tmpDist).add(perp.mul(perpDist * 0.2));
				this.velocity.CopyFrom(VectorMa(Vec3.FromVector3(lateral), -normal, Vec3.FromVector3(tmp)));
				if (this.grounded && normal > 0) {
					this.velocity.CopyFrom(VectorMa(this.velocity, 30, Vec3.FromVector3(trace.normal)));
				}
			} else {
				this.velocity.CopyFrom(Vec3.zero());
				return true;
			}
		}
		return true;
	}
	StepUp(world: RequiredWorldModule) {
		let flatVel = this.velocity.Clone();
		flatVel.y = 0;
		let step = new Vec3(0, 1.2, 0);
		let head = world.Sweep(this.position.ToVector3(), this.position.add(step).ToVector3());
		let [spP, spV] = this.Step(world, Vec3.FromVector3(head.endPos), flatVel);
		let traceDown = spP.ToVector3();
		const hit = world.Sweep(traceDown, traceDown.sub(step.ToVector3()));
		spP.CopyFrom(hit.endPos);

		const ground = this.DoGroundCheck(world);
		if (ground !== undefined) {
			if (ground.normal.Y < 0.7 || ground.startSolid) return;
			const delta = this.position.y - spP.y;
			if (math.abs(delta) < 0.001) return;
			return {
				stepUp: delta,
				pos: spP,
				vel: spV,
			};
		}
		return;
	}
	StepDown(world: RequiredWorldModule) {
		const step = new Vector3(0, 1.5, 0);
		const res = this.position.ToVector3();
		const hit = world.Sweep(res, res.sub(step));
		if (!hit.startSolid && hit.fraction < 1 && hit.normal.Y > 0.7) {
			if (math.abs(res.Y - hit.endPos.Y) > 0.001) return Vec3.FromVector3(hit.endPos);
		}
	}
	Step(world: RequiredWorldModule, p: Vec3 = this.position, v: Vec3 = this.velocity) {
		let newVel = v.Clone();
		let newPos = p.Clone();
		let oldVel = v.Clone();
		let timeLeft = this.deltaTime;
		const planes: boolean[] = [];
		for (let i = 0; i < 3; i++) {
			if (newVel.Dot(oldVel) < 0) {
				newVel.CopyFrom(Vec3.zero());
				break;
			}
			const res = world.Sweep(newPos.ToVector3(), newPos.ToVector3().add(newVel.mul(timeLeft).ToVector3()));
			if (res.fraction > 0) newPos.CopyFrom(res.endPos);
			if (res.fraction === 1) break;
			timeLeft -= timeLeft * res.fraction;
			if (planes[res.planeNum] === undefined) {
				planes[res.planeNum] = true;
				newVel.CopyFrom(ClipVelocity(newVel, Vec3.FromVector3(res.normal)));
			} else {
				newPos.CopyFrom(newPos.add(Vec3.FromVector3(res.normal.mul(0.01))));
				newVel.CopyFrom(newVel.add(Vec3.FromVector3(res.normal)));
			}
		}
		return [newPos, newVel];
	}
	Process(usercmd: UserCmd, world: RequiredWorldModule) {
		const gc = this.DoGroundCheck(world);
		let startedOnGround = gc && gc.normal.Y > 0.7;
		if (gc && gc.normal.Y > 0.7) {
			this.grounded = true;
		} else this.grounded = false;
		const wishdir = this.MakeWishdir(usercmd.ogWishmove, usercmd.yaw, usercmd.pitch);
		this.deltaTime = usercmd.deltaTime;
		if (this.grounded && wishdir.y !== 0) {
			this.grounded = false;
			this.velocity.y = 20;
		}
		if (this.grounded) this.Friction();
		this.gravityScale = 1;
		if (!this.LadderMove(world, wishdir, usercmd.pitch, usercmd.yaw, usercmd.ogWishmove)) {
			wishdir.y = 0;
			this.lastLadder = undefined;
			this.Accelerate(wishdir, this.grounded ? 14 : 1.3);
		}
		wishdir.y = 0;
		this.Gravity();
		let [np, nv] = this.Step(world);
		let res = this.StepUp(world);
		if (res) {
			this.position.CopyFrom(res.pos);
			this.velocity.CopyFrom(res.vel);
		} else {
			this.position.CopyFrom(np);
			this.velocity.CopyFrom(nv);
		}
		if (startedOnGround && usercmd.ogWishmove.y === 0 && this.velocity.y <= 0 && this.grounded) {
			const stepdown = this.StepDown(world);
			if (stepdown) this.position.CopyFrom(stepdown);
		}
	}
}
