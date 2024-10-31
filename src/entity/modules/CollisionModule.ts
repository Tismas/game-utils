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
}
