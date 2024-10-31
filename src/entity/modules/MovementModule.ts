import { Canvas } from "~/Canvas";
import { Constraint } from "~/math/constraint";
import { Vector2 } from "~/math/vector/Vector2";

import { Entity } from "../Entity";
import { Module } from "../Module";
import { CollisionModule } from "./CollisionModule";

interface MovementModuleOptions {
  velocity?: Vector2;
  acceleration?: Vector2;
  constraint?: Constraint;
}

export class MovementModule extends Module {
  lastPosition: Vector2;
  acceleration: Vector2;
  constraint: Constraint | null;

  constructor(parent: Entity, options: MovementModuleOptions = {}) {
    super(parent);

    this.lastPosition = parent.position.clone();
    this.acceleration = options.acceleration || Vector2.zero();
    this.constraint = options.constraint || null;
  }

  update(deltaTime: number) {
    this.applyConstraint();

    const velocity = this.parent.position.subtract(this.lastPosition);
    this.lastPosition = this.parent.position.clone();
    this.parent.position = this.parent.position.add(velocity).add(this.acceleration.multiply(deltaTime * deltaTime));
    this.acceleration = Vector2.zero();
  }

  draw(canvas: Canvas): void {
    this.constraint?.draw(canvas);
  }

  accelerate(acceleration: Vector2) {
    this.acceleration = this.acceleration.add(acceleration);
  }

  setConstraint(shape: Constraint) {
    this.constraint = shape;
  }

  applyConstraint() {
    const collisionModule = this.parent.findModule(CollisionModule);
    if (!this.constraint || !collisionModule) return;
    for (const collisionShape of collisionModule.collisionShapes) {
      this.parent.position = this.constraint.constrainPosition(collisionShape);
    }
  }
}
