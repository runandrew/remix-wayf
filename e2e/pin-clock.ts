import { FIXED_TIME } from "./clock.ts";

const epoch = Date.parse(FIXED_TIME);
const RealDate = Date;

class FixedDate extends RealDate {
  constructor(...args: unknown[]) {
    if (args.length === 0) {
      super(epoch);
      return;
    }
    super(...(args as ConstructorParameters<typeof RealDate>));
  }

  static override now() {
    return epoch;
  }
}

FixedDate.parse = RealDate.parse;
FixedDate.UTC = RealDate.UTC;

globalThis.Date = FixedDate as DateConstructor;
