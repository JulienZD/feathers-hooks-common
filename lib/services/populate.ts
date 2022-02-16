// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getByDot'.
const getByDot = require('lodash/get');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'setByDot'.
const setByDot = require('lodash/set');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'errors'.
const errors = require('@feathersjs/errors');

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getItems'.
const getItems = require('./get-items');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'replaceIte... Remove this comment to see the full error message
const replaceItems = require('./replace-items');

module.exports = function (options: any, ...rest: any[]) {
  // options.schema is like { service: '...', permissions: '...', include: [ ... ] }
  options = options || {};

  const typeofSchema = typeof options.schema;
  if ((typeofSchema !== 'object' || options.schema === null) && typeofSchema !== 'function') {
    throw new Error('Options.schema is not an object. (populate)');
  }

  return function (context: any) {
    const optionsDefault = {
      schema: {},
      checkPermissions: () => true,
      profile: false
    };

    if (context.params._populate === 'skip') { // this service call made from another populate
      return context;
    }

    return Promise.resolve()
      .then(() => {
        // 'options.schema' resolves to { permissions: '...', include: [ ... ] }

        const items = getItems(context);
        const options1 = Object.assign({}, optionsDefault, options);
        const { schema, checkPermissions } = options1;
        const schema1 = typeof schema === 'function' ? schema(context, options1) : schema;
        const permissions = schema1.permissions || null;
        const baseService = schema1.service;
        const provider = ('provider' in schema1) ? schema1.provider : context.params.provider;

        if (typeof checkPermissions !== 'function') {
          throw new errors.BadRequest('Permissions param is not a function. (populate)');
        }

        if (baseService && context.path && baseService !== context.path) {
          throw new errors.BadRequest(`Schema is for ${baseService} not ${context.path}. (populate)`);
        }

        if (permissions && !checkPermissions(context, context.path, permissions, 0)) {
          throw new errors.BadRequest('Permissions do not allow this populate. (populate)');
        }

        if (typeof schema1 !== 'object') {
          throw new errors.BadRequest('Schema does not resolve to an object. (populate)');
        }

        const include = []
          .concat(schema1.include || [])
          .map(schema => {
            if ('provider' in schema) {
              return schema;
            } else {
              return Object.assign({}, schema, { provider });
            }
          });

        return !include.length ? items : populateItemArray(options1, context, items, include, 0);
      })
      .then(items => {
        replaceItems(context, items);
        return context;
      });
  };
};

// @ts-expect-error ts-migrate(7023) FIXME: 'populateItemArray' implicitly has return type 'an... Remove this comment to see the full error message
function populateItemArray (options: any, context: any, items: any, includeSchema: any, depth: any) {
  // 'items' is an item or an array of items
  // 'includeSchema' is like [ { nameAs: 'author', ... }, { nameAs: 'readers', ... } ]

  if (items.toJSON || items.toObject) {
    throw new errors.BadRequest('Populate requires results to be plain JavaScript objects. (populate)');
  }

  if (!Array.isArray(items)) {
    return populateItem(options, context, items, includeSchema, depth + 1);
  }

  return Promise.all(
    items.map(item => populateItem(options, context, item, includeSchema, depth + 1))
  );
}

// @ts-expect-error ts-migrate(7023) FIXME: 'populateItem' implicitly has return type 'any' be... Remove this comment to see the full error message
function populateItem (options: any, context: any, item: any, includeSchema: any, depth: any) {
  // 'item' is one item
  // 'includeSchema' is like [ { nameAs: 'author', ... }, { nameAs: 'readers', ... } ]

  const elapsed = {};
  const startAtAllIncludes = process.hrtime();
  const include = [].concat(includeSchema || []);
  if (!Object.prototype.hasOwnProperty.call(item, '_include')) item._include = [];

  return Promise.all(
    include.map(childSchema => {
      const { query, select, parentField } = childSchema;

      // A related column join is required if neither the query nor select options are provided.
      // That requires item[parentField] exist. (The DB handles child[childField] existence.)
      if (!query && !select && (!parentField || getByDot(item, parentField) === undefined)) {
        return undefined;
      }

      const startAtThisInclude = process.hrtime();
      return populateAddChild(options, context, item, childSchema, depth)
        .then((result: any) => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'nameAs' does not exist on type 'never'.
          const nameAs = childSchema.nameAs || childSchema.service;
          // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          elapsed[nameAs] = getElapsed(options, startAtThisInclude, depth);

          return result;
        });
    })
  )
    .then(children => {
      // 'children' is like
      //   [{ nameAs: 'authorInfo', items: {...} }, { nameAs: readersInfo, items: [{...}, {...}] }]
      if (options.profile !== false) {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'total' does not exist on type '{}'.
        elapsed.total = getElapsed(options, startAtAllIncludes, depth);
        item._elapsed = elapsed;
      }

      children.forEach(child => {
        if (child) {
          setByDot(item, child.nameAs, child.items);
        }
      });

      return item;
    });
}

// @ts-expect-error ts-migrate(7023) FIXME: 'populateAddChild' implicitly has return type 'any... Remove this comment to see the full error message
function populateAddChild (options: any, context: any, parentItem: any, childSchema: any, depth: any) {
  /*
  @params
    'parentItem' is the item we are adding children to
    'childSchema' is like
      { service: 'comments',
        permissions: '...',
        nameAs: 'comments',
        asArray: true,
        parentField: 'id',
        childField: 'postId',
        query: { $limit: 5, $select: ['title', 'content', 'postId'], $sort: { createdAt: -1 } },
        select: (context, parent, depth) => ({ something: { $exists: false }}),
        paginate: false,
        provider: context.provider,
        useInnerPopulate: false,
        include: [ ... ] }
  @returns { nameAs: string, items: array }
  */

  const {
    childField, paginate, parentField, permissions, query, select, service, useInnerPopulate, provider
  } = childSchema;

  if (!service) {
    throw new errors.BadRequest('Child schema is missing the service property. (populate)');
  }

  // A related column join is required if neither the query nor select options are provided.
  if (!query && !select && !(parentField && childField)) {
    throw new errors.BadRequest('Child schema is missing parentField or childField property. (populate)');
  }

  if (permissions && !options.checkPermissions(context, service, permissions, depth)) {
    throw new errors.BadRequest(
      `Permissions for ${service} do not allow include. (populate)`
    );
  }

  const nameAs = childSchema.nameAs || service;
  if (parentItem._include.indexOf(nameAs) === -1) parentItem._include.push(nameAs);

  return Promise.resolve()
    .then(() => (select ? select(context, parentItem, depth) : {}))
    .then(selectQuery => {
      let sqlQuery = {};

      if (parentField) {
        const parentVal = getByDot(parentItem, parentField); // will not be undefined
        sqlQuery = { [childField]: Array.isArray(parentVal) ? { $in: parentVal } : parentVal };
      }

      const queryObj = Object.assign({},
        query,
        sqlQuery,
        selectQuery // dynamic options override static ones
      );

      const serviceHandle = context.app.service(service);

      if (!serviceHandle) {
        throw new errors.BadRequest(`Service ${service} is not configured. (populate)`);
      }

      let paginateObj = { paginate: false };
      const paginateOption = paginate;
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'null' is not assignable to type '{ paginate:... Remove this comment to see the full error message
      if (paginateOption === true) { paginateObj = null; }
      if (typeof paginateOption === 'number') {
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ default: number; }' is not assignable to t... Remove this comment to see the full error message
        paginateObj = { paginate: { default: paginateOption } };
      }

      const params = Object.assign({},
        context.params,
        paginateObj,
        { query: queryObj },
        useInnerPopulate ? {} : { _populate: 'skip' },
        ('provider' in childSchema) ? { provider: childSchema.provider } : {}
      );

      return serviceHandle.find(params);
    })
    .then(result => {
      result = result.data || result;

      if (result.length === 0) {
        return childSchema.asArray ? [] : null;
      }

      if (result.length === 1 && !childSchema.asArray) {
        result = result[0];
      }

      const include = []
        .concat(childSchema.include || [])
        .map(schema => {
          if ('provider' in schema) {
            return schema;
          } else {
            return Object.assign({}, schema, { provider });
          }
        });

      return (childSchema.include && result)
        ? populateItemArray(options, context, result, include, depth)
        : result;
    })
    .then(items => ({ nameAs, items }));
}

// Helpers

function getElapsed (options: any, startHrtime: any, depth: any) {
  if (options.profile === true) {
    const elapsed = process.hrtime(startHrtime);
    return (elapsed[0] * 1e9) + elapsed[1];
  } else if (options.profile !== false) {
    return depth; // for testing _elapsed
  }
}
