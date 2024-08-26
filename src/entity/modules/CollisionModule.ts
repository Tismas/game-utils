import { CollisionShape } from "~/math/collision";

import { Entity } from "../Entity";
import { Module } from "../Module";
import { MovementModule } from "./MovementModule";

interface LayerEntry {
  entity: Entity;
  collisionModule: CollisionModule;
}

export interface CollisionModuleOptions {
  /** Layers with which the collision should occur @default [0] */
  layers?: Array<number>;

  /** Shapes that determine object hit box */
  collisionShapes: Array<CollisionShape>;

  /** This function will be called on every collision */
  onCollision?: (other: Entity) => void;
}

export class CollisionModule extends Module {
  private static layers: Array<Array<LayerEntry>> = [];

  entityLayers: Array<number> = [];
  collisionShapes: Array<CollisionShape>;

  onCollision?: (other: Entity) => void;

  constructor(parent: Entity, options: CollisionModuleOptions) {
    super(parent);

    this.entityLayers = options.layers || [0];
    this.collisionShapes = options.collisionShapes;
    this.onCollision = options.onCollision;

    for (const layer of this.entityLayers) {
      if (!CollisionModule.layers[layer]) CollisionModule.layers[layer] = [];

      CollisionModule.layers[layer].push({ entity: this.parent, collisionModule: this });
    }
  }

  update(): void {
    this.calculateCollisions();
  }

  isColliding(other: CollisionModule): [CollisionShape, CollisionShape] | false {
    for (const shape of this.collisionShapes) {
      for (const otherShape of other.collisionShapes) {
        if (shape.isColliding(otherShape)) {
          return [shape, otherShape];
        }
      }
    }

    return false;
  }

  calculateCollisions = () => {
    for (const layer of this.entityLayers) {
      const entries = CollisionModule.layers[layer];
      if (!entries) continue;

      for (const { collisionModule, entity } of entries) {
        if (entity === this.parent) continue;

        const collisionShapes = this.isColliding(collisionModule);
        if (collisionShapes) {
          this.collideWith(entity, ...collisionShapes);
          collisionModule.collideWith(this.parent, ...collisionShapes);
        }
      }
    }
  };

  collideWith(other: Entity, collisionShape: CollisionShape, otherCollisionShape: CollisionShape): void {
    const movementModule = this.parent.findModule(MovementModule);

    if (movementModule) {
      movementModule.setPosition(collisionShape.getPositionAfterCollision(otherCollisionShape));
      movementModule.collideWith(other);
    }

    this.onCollision?.(other);
  }
}
