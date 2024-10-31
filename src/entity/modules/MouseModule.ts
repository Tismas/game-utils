import { getMousePosition } from "~/input/mouse";
import { CollisionShape } from "~/math/collision";
import { CollisionCircle } from "~/math/collision/circle";

import { Entity } from "../Entity";
import { Module } from "../Module";
import { CollisionModule } from "./CollisionModule";

type OnClick = (entity: Entity) => void;

interface MouseModuleOptions {
  /** Defaults to CollisionModule collision shapes if they exist */
  collisionShapes?: CollisionShape[];
  onClick?: OnClick;
}

export class MouseModule extends Module {
  onClick?: OnClick;
  collisionShapes?: CollisionShape[];

  constructor(parent: Entity, options: MouseModuleOptions) {
    super(parent);

    this.collisionShapes = options.collisionShapes;
    this.onClick = options.onClick;
    window.addEventListener("click", this.handleClick);
  }

  init() {
    const collisionModule = this.parent.findModule(CollisionModule);
    this.collisionShapes ||= [...(collisionModule?.collisionShapes || [])];
  }

  private handleClick = () => {
    if (this.onClick && this.isCollidingWithMouse()) {
      this.onClick(this.parent);
    }
  };

  isCollidingWithMouse(): boolean {
    const mousePos = getMousePosition();

    return Boolean(
      this.collisionShapes?.find((shape) => {
        return shape.getCollision(
          new CollisionCircle({
            parent: this.parent,
            offset: this.parent.position.subtract(mousePos),
            radius: 1,
            triggerCollisionCallback: false,
          }),
        );
      }),
    );
  }

  onRemove(): void {
    window.removeEventListener("click", this.handleClick);
  }
}
