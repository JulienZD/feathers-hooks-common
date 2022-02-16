
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'assert'.
const assert = require('assert').strict;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'configApp'... Remove this comment to see the full error message
const configApp = require('../helpers/config-app');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getInitDb'... Remove this comment to see the full error message
const getInitDb = require('../helpers/get-init-db');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'populate'.
const { populate } = require('../../lib/services/index');

['array', 'obj'].forEach(type => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe(`services populate - 1:1 & 1:m & m:1 - ${type}`, () => {
    let hookAfter: any;
    let hookAfterArray: any;
    let schema: any;

    let app: any;
    let recommendation;

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      app = configApp(['recommendation', 'posts', 'users', 'comments']);
      recommendation = clone(getInitDb('recommendation').store);

      hookAfter = {
        type: 'after',
        method: 'create',
        params: { provider: 'rest' },
        path: 'recommendations',
        result: recommendation['1']
      };
      hookAfterArray = {
        type: 'after',
        method: 'create',
        params: { provider: 'rest' },
        path: 'recommendations',
        result: [recommendation['1'], recommendation['2'], recommendation['3']]
      };

      schema = {
        permissions: '',
        include: makeInclude(type, {
          service: 'posts',
          nameAs: 'post',
          parentField: 'postId',
          childField: 'id',
          include: [
            { // 1:1
              service: 'users',
              permissions: '',
              nameAs: 'authorInfo',
              parentField: 'author',
              childField: 'id'
            },
            { // 1:m
              service: 'comments',
              permissions: '',
              nameAs: 'commentsInfo',
              parentField: 'id',
              childField: 'postId',
              // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'hook' implicitly has an 'any' type.
              select: (hook, parent) => ({
                $limit: 6
              }),
              asArray: true,
              query: {
                $limit: 5,
                $select: ['title', 'content', 'postId'],
                $sort: { createdAt: -1 }
              }
            },
            { // m:1
              service: 'users',
              permissions: '',
              nameAs: 'readersInfo',
              parentField: 'readers',
              childField: 'id'
            }
          ]
        })
      };
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('for one item', () => {
      const hook = clone(hookAfter);
      hook.app = app; // app is a func and wouldn't be cloned

      return populate({ schema, checkPermissions: () => true, profile: 'test' })(hook)
        .then((hook1: any) => {
          assert.deepEqual(hook1.result,
            {
              userId: 'as61389dadhga62343hads6712',
              postId: 1,
              updatedAt: 1480793101475,
              _include: ['post'],
              _elapsed: { post: 1, total: 1 },
              post:
              {
                id: 1,
                title: 'Post 1',
                content: 'Lorem ipsum dolor sit amet 4',
                author: 'as61389dadhga62343hads6712',
                readers: ['as61389dadhga62343hads6712', '167asdf3689348sdad7312131s'],
                createdAt: 1480793101559,
                _include: ['authorInfo', 'commentsInfo', 'readersInfo'],
                _elapsed: { authorInfo: 2, commentsInfo: 2, readersInfo: 2, total: 2 },
                authorInfo:
                {
                  id: 'as61389dadhga62343hads6712',
                  name: 'Author 1',
                  email: 'author1@posties.com',
                  password: '2347wjkadhad8y7t2eeiudhd98eu2rygr',
                  age: 55
                },
                commentsInfo:
                [{
                  title: 'Comment 1',
                  content: 'Lorem ipsum dolor sit amet 1',
                  postId: 1
                },
                {
                  title: 'Comment 3',
                  content: 'Lorem ipsum dolor sit amet 3',
                  postId: 1
                }],
                readersInfo:
                [{
                  id: 'as61389dadhga62343hads6712',
                  name: 'Author 1',
                  email: 'author1@posties.com',
                  password: '2347wjkadhad8y7t2eeiudhd98eu2rygr',
                  age: 55
                },
                {
                  id: '167asdf3689348sdad7312131s',
                  name: 'Author 2',
                  email: 'author2@posties.com',
                  password: '2347wjkadhad8y7t2eeiudhd98eu2rygr',
                  age: 16
                }]
              }
            }
          );
        });
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('for an item array', () => {
      const hook = clone(hookAfterArray);
      hook.app = app; // app is a func and wouldn't be cloned

      return populate({ schema, checkPermissions: () => true, profile: 'test' })(hook)
        .then((hook1: any) => {
          assert.deepEqual(hook1.result,
            [{
              userId: 'as61389dadhga62343hads6712',
              postId: 1,
              updatedAt: 1480793101475,
              _include: ['post'],
              _elapsed: { post: 1, total: 1 },
              post:
              {
                id: 1,
                title: 'Post 1',
                content: 'Lorem ipsum dolor sit amet 4',
                author: 'as61389dadhga62343hads6712',
                readers: ['as61389dadhga62343hads6712', '167asdf3689348sdad7312131s'],
                createdAt: 1480793101559,
                _include: ['authorInfo', 'commentsInfo', 'readersInfo'],
                _elapsed: { authorInfo: 2, commentsInfo: 2, readersInfo: 2, total: 2 },
                authorInfo:
                {
                  id: 'as61389dadhga62343hads6712',
                  name: 'Author 1',
                  email: 'author1@posties.com',
                  password: '2347wjkadhad8y7t2eeiudhd98eu2rygr',
                  age: 55
                },
                commentsInfo:
                [{
                  title: 'Comment 1',
                  content: 'Lorem ipsum dolor sit amet 1',
                  postId: 1
                },
                {
                  title: 'Comment 3',
                  content: 'Lorem ipsum dolor sit amet 3',
                  postId: 1
                }],
                readersInfo:
                [{
                  id: 'as61389dadhga62343hads6712',
                  name: 'Author 1',
                  email: 'author1@posties.com',
                  password: '2347wjkadhad8y7t2eeiudhd98eu2rygr',
                  age: 55
                },
                {
                  id: '167asdf3689348sdad7312131s',
                  name: 'Author 2',
                  email: 'author2@posties.com',
                  password: '2347wjkadhad8y7t2eeiudhd98eu2rygr',
                  age: 16
                }]
              }
            },
            {
              userId: 'as61389dadhga62343hads6712',
              postId: 2,
              updatedAt: 1480793101475,
              _include: ['post'],
              _elapsed: { post: 1, total: 1 },
              post:
              {
                id: 2,
                title: 'Post 2',
                content: 'Lorem ipsum dolor sit amet 5',
                author: '167asdf3689348sdad7312131s',
                readers: ['as61389dadhga62343hads6712', '167asdf3689348sdad7312131s'],
                createdAt: 1480793101559,
                _include: ['authorInfo', 'commentsInfo', 'readersInfo'],
                _elapsed: { authorInfo: 2, commentsInfo: 2, readersInfo: 2, total: 2 },
                authorInfo:
                {
                  id: '167asdf3689348sdad7312131s',
                  name: 'Author 2',
                  email: 'author2@posties.com',
                  password: '2347wjkadhad8y7t2eeiudhd98eu2rygr',
                  age: 16
                },
                commentsInfo:
                [{
                  title: 'Comment 2',
                  content: 'Lorem ipsum dolor sit amet 2',
                  postId: 2
                }],
                readersInfo:
                [{
                  id: 'as61389dadhga62343hads6712',
                  name: 'Author 1',
                  email: 'author1@posties.com',
                  password: '2347wjkadhad8y7t2eeiudhd98eu2rygr',
                  age: 55
                },
                {
                  id: '167asdf3689348sdad7312131s',
                  name: 'Author 2',
                  email: 'author2@posties.com',
                  password: '2347wjkadhad8y7t2eeiudhd98eu2rygr',
                  age: 16
                }]
              }
            },
            {
              userId: '167asdf3689348sdad7312131s',
              postId: 1,
              updatedAt: 1480793101475,
              _include: ['post'],
              _elapsed: { post: 1, total: 1 },
              post:
              {
                id: 1,
                title: 'Post 1',
                content: 'Lorem ipsum dolor sit amet 4',
                author: 'as61389dadhga62343hads6712',
                readers: ['as61389dadhga62343hads6712', '167asdf3689348sdad7312131s'],
                createdAt: 1480793101559,
                _include: ['authorInfo', 'commentsInfo', 'readersInfo'],
                _elapsed: { authorInfo: 2, commentsInfo: 2, readersInfo: 2, total: 2 },
                authorInfo:
                {
                  id: 'as61389dadhga62343hads6712',
                  name: 'Author 1',
                  email: 'author1@posties.com',
                  password: '2347wjkadhad8y7t2eeiudhd98eu2rygr',
                  age: 55
                },
                commentsInfo:
                [{
                  title: 'Comment 1',
                  content: 'Lorem ipsum dolor sit amet 1',
                  postId: 1
                },
                {
                  title: 'Comment 3',
                  content: 'Lorem ipsum dolor sit amet 3',
                  postId: 1
                }],
                readersInfo:
                [{
                  id: 'as61389dadhga62343hads6712',
                  name: 'Author 1',
                  email: 'author1@posties.com',
                  password: '2347wjkadhad8y7t2eeiudhd98eu2rygr',
                  age: 55
                },
                {
                  id: '167asdf3689348sdad7312131s',
                  name: 'Author 2',
                  email: 'author2@posties.com',
                  password: '2347wjkadhad8y7t2eeiudhd98eu2rygr',
                  age: 16
                }]
              }
            }]
          );
        });
    });
  });
});

// Helpers

function makeInclude (type: any, obj: any) {
  return type === 'obj' ? obj : [obj];
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'clone'.
function clone (obj: any) {
  return JSON.parse(JSON.stringify(obj));
}
