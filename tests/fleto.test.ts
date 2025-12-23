import { describe, it, expect } from 'vitest';
import { flatten, deflatten } from '../src/flatten';

describe('The Fletó Special', () => {
  const ferencData = {
    name: "Ferenc",
    attributes: {
      nickname: "Fletó",
      skills: {
        dancing: true,
        cooking: false
      }
    }
  };

  const expectedFlat = {
    "name": "Ferenc",
    "attributes.nickname": "Fletó",
    "attributes.skills.dancing": true,
    "attributes.skills.cooking": false
  };

  it('should flatten Ferenc correctly', () => {
    const result = flatten(ferencData);
    expect(result).toEqual(expectedFlat);
  });

  it('should unflatten (deflatten) back to original Ferenc', () => {
    const result = deflatten(expectedFlat);
    expect(result).toEqual(ferencData);
  });
});
