// Temporary Decimal type for build compatibility
// This will be replaced by Prisma's Decimal after generation

export class Decimal {
  private value: string;

  constructor(value: string | number | Decimal) {
    this.value = value.toString();
  }

  toString(): string {
    return this.value;
  }

  toNumber(): number {
    return parseFloat(this.value);
  }

  add(other: Decimal | number): Decimal {
    const sum = this.toNumber() + (other instanceof Decimal ? other.toNumber() : other);
    return new Decimal(sum);
  }

  minus(other: Decimal | number): Decimal {
    const diff = this.toNumber() - (other instanceof Decimal ? other.toNumber() : other);
    return new Decimal(diff);
  }

  equals(other: Decimal | number): boolean {
    return this.toNumber() === (other instanceof Decimal ? other.toNumber() : other);
  }

  lessThan(other: Decimal | number): boolean {
    return this.toNumber() < (other instanceof Decimal ? other.toNumber() : other);
  }

  greaterThan(other: Decimal | number): boolean {
    return this.toNumber() > (other instanceof Decimal ? other.toNumber() : other);
  }

  abs(): Decimal {
    return new Decimal(Math.abs(this.toNumber()));
  }
}

// Re-export the correct Decimal if available
try {
  const { Decimal: PrismaDecimal } = require('@prisma/client/runtime/library');
  module.exports.Decimal = PrismaDecimal;
} catch (e) {
  // Use our temporary implementation during build
}
