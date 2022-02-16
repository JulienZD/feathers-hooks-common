
module.exports = function (msg: any, ...fieldNames: any[]) {
  return (context: any) => {
    console.log(`* ${msg || ''}\ntype:${context.type}, method: ${context.method}`);
    if (context.data) { console.log('data:', context.data); }
    if (context.params && context.params.query) { console.log('query:', context.params.query); }
    if (context.result) { console.log('result:', context.result); }

    const params = context.params || {};
    console.log('params props:', Object.keys(params).sort());

    fieldNames.forEach(name => {
      console.log(`params.${name}:`, params[name]);
    });

    if (context.error) { console.log('error', context.error); }
  };
};
