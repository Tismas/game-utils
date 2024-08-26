import { Canvas } from "~/Canvas";
import { Vector2 } from "~/math/Vector2";
import { clampLeft, clampRight } from "~/math/bounds";

import { Entity } from "../Entity";
import { Module } from "../Module";

type ClampOption = boolean | { readonly type: "paddingAllSides"; padding: number };
type ClampOptions =
  | ClampOption
  | {
      readonly type: "paddingSelective";
      left?: number | boolean;
      right?: number | boolean;
      top?: number | boolean;
      bottom?: number | boolean;
    };

class ClampConfig {
  left: number | false;
  right: number | false;
  top: number | false;
  bottom: number | false;

  getValueFromOption(value: ClampOption | number): number | false {
    if (typeof value === "boolean") {
      return value ? 0 : false;
    } else if (typeof value === "number") {
      return value;
    } else {
      return value.padding;
    }
  }

  constructor(config: ClampOptions) {
    if (typeof config === "boolean" || "padding" in config) {
      this.left = this.right = this.top = this.bottom = this.getValueFromOption(config);
    } else {
      this.left = this.getValueFromOption(config.left || false);
      this.right = this.getValueFromOption(config.right || false);
      this.top = this.getValueFromOption(config.top || false);
      this.bottom = this.getValueFromOption(config.bottom || false);
    }
  }
}

interface MovementModuleOptions {
  velocity?: Vector2;
  acceleration?: Vector2;
  /** Whether to decrease velocity after colliding with other object. @default false */
  keepMomentumOnCollision?: boolean;
  /** Whether to make entity bounce off the screen borders. @default false */
  clampToScreen?: ClampOptions;
}

export class MovementModule extends Module {
  velocity: Vector2;
  acceleration: Vector2;
  keepMomentumOnCollision: boolean;
  clampConfig: ClampConfig;

  constructor(parent: Entity, options: MovementModuleOptions = {}) {
    super(parent);

    this.velocity = options.velocity || Vector2.zero();
    this.acceleration = options.acceleration || Vector2.zero();
    this.keepMomentumOnCollision = options.keepMomentumOnCollision || false;
    this.clampConfig = new ClampConfig(options.clampToScreen || false);
  }

  onXClamp = () => {
    this.velocity.x *= -1;
    this.onCollision();
  };
  onYClamp = () => {
    this.velocity.y *= -1;
    this.onCollision();
  };

  update(deltaTime: number, canvas: Canvas) {
    this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime));
    this.parent.position = this.parent.position.add(this.velocity.multiply(deltaTime));

    if (this.clampConfig.left !== false) {
      this.parent.position.x = clampLeft(this.parent.position.x, this.clampConfig.left, this.onXClamp);
    }
    if (this.clampConfig.right !== false) {
      this.parent.position.x = clampRight(this.parent.position.x, canvas.screenWidth - this.clampConfig.right, this.onXClamp);
    }
    if (this.clampConfig.top !== false) {
      this.parent.position.y = clampLeft(this.parent.position.y, this.clampConfig.top, this.onYClamp);
    }
    if (this.clampConfig.bottom !== false) {
      this.parent.position.y = clampRight(this.parent.position.y, canvas.screenHeight - this.clampConfig.bottom, this.onYClamp);
    }
  }

  collideWith(other: Entity) {
    const otherMovementModule = other.findModule(MovementModule);

    const otherVelocity = otherMovementModule?.velocity || Vector2.zero();
    const avgSpeed = (this.velocity.length + otherVelocity.length) / 2;

    this.velocity = this.parent.position
      .withAngle(other.position.angleTo(this.parent.position))
      .add(otherVelocity)
      .add(this.velocity)
      .withLength(this.keepMomentumOnCollision ? this.velocity.length : avgSpeed);
  }

  onCollision() {
    this.acceleration = this.acceleration.multiply(0.9);
    if (!this.keepMomentumOnCollision) {
      this.velocity = this.velocity.multiply(0.9);
    }
  }

  setPosition(position: Vector2) {
    this.parent.position = position;
  }
}
