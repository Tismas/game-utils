import { Vector2 } from "~/math/vector/Vector2";

import { Entity } from "../Entity";
import { Module } from "../Module";
import { MovementModule } from "./MovementModule";

interface GravityModuleOptions {
  gravity: number | Vector2;
}

export class GravityModule extends Module {
  gravity: Vector2;

  constructor(parent: Entity, options: GravityModuleOptions) {
    super(parent);

    this.gravity = typeof options.gravity === "number" ? new Vector2(0, options.gravity) : options.gravity;
  }

  update() {
    const movementModule = this.parent.findModule(MovementModule);
    if (!movementModule) throw new Error("Gravity modules requires MovementModule to function");

    movementModule.accelerate(this.gravity);
  }
}
