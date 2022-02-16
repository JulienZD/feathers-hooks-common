
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'assert'.
const { assert } = require('chai');
const { ObjectID } = require('mongodb');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'mongoKeys'... Remove this comment to see the full error message
const { mongoKeys } = require('../../lib/services');

const s0 = '000000000000';
const s1 = '111111111111';
const s2 = '222222222222';
const s5 = '555555555555';
const s8 = '888888888888';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('services mongoKeys', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('{ a: s1, c: s0 }', () => {
    const newQuery = wrapper(
      ['a'],
      { a: s1, c: s0 }
    );

    assert.instanceOf(newQuery.a, ObjectID, '"a" not ObjectID');
    assert.isString(newQuery.c, '"c" not a string');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('{ a: { b: s0 }, c: s0 }', () => {
    const newQuery = wrapper(
      ['a'],
      { a: { b: s0 }, c: s0 }
    );

    assert.isString(newQuery.a.b, '"a.b" not a string');
    assert.isString(newQuery.c, '"c" not a string');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('{ a: { $in: [s1, s2] }, c: s0 }', () => {
    const newQuery = wrapper(
      ['a'],
      { a: { $in: [s1, s2] }, c: s0 }
    );

    assert.instanceOf(newQuery.a.$in[0], ObjectID, '"a.$in[0]" not ObjectID');
    assert.instanceOf(newQuery.a.$in[1], ObjectID, '"a.$in[1]" not ObjectID');
    assert.isString(newQuery.c, '"c" not a string');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('{ a: s1, b: \'111111111111\', c: s0 }', () => {
    const newQuery = wrapper(
      ['a', 'b'],
      { a: s1, b: s2, c: s0 }
    );

    assert.instanceOf(newQuery.a, ObjectID, '"a" not ObjectID');
    assert.instanceOf(newQuery.b, ObjectID, '"b" not ObjectID');
    assert.isString(newQuery.c, '"c" not a string');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('{ a: { x: s8 } }', () => {
    const newQuery = wrapper(
      ['a.x'],
      { a: { x: s8 } }
    );

    assert.instanceOf(newQuery.a.x, ObjectID, '"a.x" not ObjectID');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('{ $or: [{ a: { x: s8 } }, { b: s5 }, { c: s0 }], d: s0 }', () => {
    const newQuery = wrapper(
      ['a.x', 'b'],
      { $or: [{ a: { x: s8 } }, { b: s5 }, { c: s0 }], d: s0 }
    );

    assert.instanceOf(newQuery.$or[0].a.x, ObjectID, '"$or[0].a.x" not ObjectID');
    assert.instanceOf(newQuery.$or[1].b, ObjectID, '"$or[1].b" not ObjectID');
    assert.isString(newQuery.$or[2].c, '"$or[2].c" not a string');
    assert.isString(newQuery.d, '"d" not a string');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('{ $or: [{ a: { x: s8 } }, { a: s5 }] } - questionable', () => {
    const newQuery = wrapper(
      ['a', 'a.x'],
      { $or: [{ a: { x: s8 } }, { a: s5 }] }
    );

    assert.instanceOf(newQuery.$or[0].a.x, ObjectID, '"$or[0].a.x" not ObjectID');
    assert.instanceOf(newQuery.$or[1].a, ObjectID, '"$or[1].a" not ObjectID');
  });
});

function wrapper (keys: any, query: any) {
  const newContext = mongoKeys(ObjectID, keys)({ params: { query }, type: 'before', method: 'find' });
  return newContext.params.query;
}
