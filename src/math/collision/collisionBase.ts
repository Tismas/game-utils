import { Vector2 } from "@naszos/utils";
import { Canvas } from "~/Canvas";
import { Entity } from "~/entity/Entity";

import { CollisionShape } from ".";

export interface CollisionShapeOptions {
  parent: Entity;
  offset?: Vector2;
  triggerCollisionCallback?: boolean;
  onRemove?: () => void;
  onCollision?: () => void;
}

export abstract class CollisionShapeBase {
  parent: Entity;
  offset: Vector2;
  triggerCollisionCallback: boolean;
  onRemove?: () => void;
  onCollision?: () => void;

  constructor({ parent, offset, triggerCollisionCallback, onRemove, onCollision }: CollisionShapeOptions) {
    if (!(parent instanceof Entity)) throw new Error("CollisionShape parent must be an Entity");

    this.parent = parent;
    this.offset = offset || Vector2.zero();
    this.triggerCollisionCallback = triggerCollisionCallback ?? true;
    this.onRemove = onRemove;
    this.onCollision = onCollision;
  }

  get position(): Vector2 {
    return this.parent.position.add(this.offset);
  }

  abstract draw(canvas: Canvas): void;
  abstract getCollision(other: CollisionShape): Vector2 | false;
}
