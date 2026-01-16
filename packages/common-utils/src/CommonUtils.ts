import { timingSafeEqual } from "@std/crypto";
import { randomBytes, scryptSync } from "node:crypto";
import { Buffer } from "node:buffer";

/**
 * This module contains commonly used utility functions
 * @module
 */

/**
 * ```ts
 * import { CommonUtils } from "@justaos/utils";
 *
 * CommonUtils.underscoreToCamelCase("hello_world"); // Hello World
 * ```
 * */
export default class CommonUtils {
  static hasDuplicates(a: string[]): boolean {
    for (let i = 0; i <= a.length; i++) {
      for (let j = i; j <= a.length; j++) {
        if (i != j && a[i] == a[j]) return true;
      }
    }
    return false;
  }

  static findDuplicates(arr: string[]): string[] {
    const sortedArray = arr.slice().sort(); // You can define the comparing function here.
    // JS by default uses a crappy string compare.
    // (we use slice to clone the array so the
    // original array won't be modified)
    const results = new Map();
    for (let i = 0; i < sortedArray.length - 1; i++) {
      if (sortedArray[i + 1] === sortedArray[i]) {
        results.set(sortedArray[i], true);
      }
    }
    return Array.from(results.keys());
  }

  static flatToHierarchy(flat: any[]): any[] {
    const roots: any[] = []; // things without parent
    const all: any = {};

    flat.forEach((item: any) => {
      all[item.id] = item;
    });

    // connect children to its parent, and split roots apart
    for (const key of Object.keys(all)) {
      const item = all[key];
      if (!item.parent) {
        roots.push(item);
      } else if (item.parent in all) {
        const p = all[item.parent];
        if (!("children" in p)) p.children = [];
        p.children.push(item);
      }
    }

    // done!
    return roots;
  }

  static generateHash(data: string): string {
    // Any random string here (ideally should be at least 16 bytes)
    const salt = randomBytes(16).toString("hex");
    return `${salt}:${scryptSync(data, salt, 32).toString("hex")}`;
  }

  static validateHash(data: string, dataHash: string): boolean {
    const [salt, hash] = dataHash.split(":");
    const hashedData = scryptSync(data, salt, 32).toString("hex");
    return timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(hashedData, "hex"),
    );
  }
}
