import { randomInRange } from "../util/random";

export class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  set length(length: number) {
    const angle = this.angle;
    this.x = Math.cos(angle) * length;
    this.y = Math.sin(angle) * length;
  }

  get angle(): number {
    return Math.atan2(this.y, this.x);
  }

  set angle(angle: number) {
    const length = this.length;
    this.x = Math.cos(angle) * length;
    this.y = Math.sin(angle) * length;
  }

  withLength(length: number) {
    const v = this.clone();
    v.length = length;
    return v;
  }

  withAngle(angle: number) {
    const v = this.clone();
    v.angle = angle;
    return v;
  }

  withX(x: number) {
    return new Vector2(x, this.y);
  }
  withY(y: number) {
    return new Vector2(this.x, y);
  }

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  multiply(value: number): Vector2 {
    return new Vector2(this.x * value, this.y * value);
  }

  divide(value: number): Vector2 {
    return new Vector2(this.x / value, this.y / value);
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  normalized() {
    return this.withLength(1);
  }

  distanceTo(v: Vector2): number {
    return this.subtract(v).length;
  }

  angleTo(v: Vector2): number {
    return Math.atan2(v.y - this.y, v.x - this.x);
  }

  abs() {
    return new Vector2(Math.abs(this.x), Math.abs(this.y));
  }

  static random([minX, minY]: [number, number] = [-1, -1], [maxX, maxY]: [number, number] = [1, 1]) {
    return new Vector2(randomInRange(minX, maxX), randomInRange(minY, maxY));
  }

  static zero() {
    return new Vector2(0, 0);
  }

  static one() {
    return new Vector2(1, 1);
  }

  static up() {
    return new Vector2(0, -1);
  }
  static down() {
    return new Vector2(0, 1);
  }
  static left() {
    return new Vector2(-1, 0);
  }
  static right() {
    return new Vector2(1, 0);
  }
}
