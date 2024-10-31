import { CollisionShape } from "~/math/collision";

import { Entity } from "../Entity";
import { Module } from "../Module";

interface LayerEntry {
  entity: Entity;
  collisionModule: CollisionModule;
}

export interface CollisionModuleOptions {
  /** Layers with which the collision should occur @default [0] */
  layers?: Array<number>;

  /** Shapes that determine object hit box */
  collisionShape: CollisionShape;

  /** This function will be called on every collision */
  onCollision?: (other: Entity) => void;
}

export class CollisionModule extends Module {
  private static layers: Array<Array<LayerEntry>> = [];

  collisionLayers: Array<number> = [];
  collisionShape: CollisionShape;

  onCollision?: (other: Entity) => void;

  constructor(parent: Entity, options: CollisionModuleOptions) {
    super(parent);

    this.collisionLayers = options.layers || [0];
    this.collisionShape = options.collisionShape;
    this.onCollision = options.onCollision;

    for (const layer of this.collisionLayers) {
      if (!CollisionModule.layers[layer]) CollisionModule.layers[layer] = [];

      CollisionModule.layers[layer].push({ entity: this.parent, collisionModule: this });
    }
  }

  update(): void {
    for (const layer of this.collisionLayers) {
      const entities = CollisionModule.layers[layer];
      for (const { entity, collisionModule } of entities) {
        if (entity === this.parent) continue;
        const moveVector = this.collisionShape.getCollision(collisionModule.collisionShape);
        if (moveVector) {
          this.parent.position = this.parent.position.add(moveVector.multiply(0.5));
          entity.position = entity.position.add(moveVector.multiply(-0.5));
        }
      }
    }
  }
}
