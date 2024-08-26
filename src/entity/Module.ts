import { Canvas } from "~/Canvas";

import { Entity } from "./Entity";
import { CollisionModule } from "./modules/CollisionModule";
import { FrictionModule } from "./modules/FrictionModule";
import { GravityModule } from "./modules/GravityModule";
import { MouseModule } from "./modules/MouseModule";
import { MovementModule } from "./modules/MovementModule";

export abstract class Module {
  draw?(canvas: Canvas): void;
  update?(deltaTime: number, canvas: Canvas): void;
  onRemove?(): void;
  init?(): void;

  parent: Entity;

  constructor(parent: Entity) {
    this.parent = parent;
  }
}

export type EntityModule = CollisionModule | MovementModule | GravityModule | FrictionModule | MouseModule;
