
const _pluck = require('../common/_pluck');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'checkConte... Remove this comment to see the full error message
const checkContext = require('./check-context');

module.exports = function (...fieldNames: any[]) {
  return (context: any) => {
    checkContext(context, 'before', null, 'keepQuery');

    const query = (context.params || {}).query || {};
    context.params.query = _pluck(query, fieldNames);

    return context;
  };
};
