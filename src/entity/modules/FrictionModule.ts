import { Entity } from "../Entity";
import { Module } from "../Module";
import { MovementModule } from "./MovementModule";

interface FrictionModuleOptions {
  friction: number;
}

export class FrictionModule extends Module {
  friction: number;

  constructor(parent: Entity, options: FrictionModuleOptions) {
    super(parent);

    this.friction = options.friction;
  }

  update() {
    const movementModule = this.parent.findModule(MovementModule);
    if (!movementModule) throw new Error("Friction modules requires MovementModule to function");

    // TODO
  }
}
