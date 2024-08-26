import { Vector2 } from "~/math/Vector2";

import { Entity } from "../Entity";
import { Module } from "../Module";
import { MovementModule } from "./MovementModule";

interface GravityModuleOptions {
  gravity: number;
}

export class GravityModule extends Module {
  gravity: number;

  constructor(parent: Entity, options: GravityModuleOptions) {
    super(parent);

    this.gravity = options.gravity;
  }

  update(deltaTime: number) {
    const movementModule = this.parent.findModule(MovementModule);
    if (!movementModule) throw new Error("Gravity modules requires MovementModule to function");

    movementModule.acceleration = movementModule.acceleration.add(new Vector2(0, this.gravity * deltaTime));
  }
}
