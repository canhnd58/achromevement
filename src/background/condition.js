export const pass = (satisfy) => (...args) => satisfy(...args);
pass.any = (...conditions) => (...args) => conditions.some(satisfy => satisfy(...args));
pass.all = (...conditions) => (...args) => conditions.every(satisfy => satisfy(...args));

export const fail = (satisfy) => (...args) => !satisfy(...args);
fail.any = (...conditions) => (...args) => conditions.some(satisfy => !satisfy(...args));
fail.all = (...conditions) => (...args) => conditions.every(satisfy => !satisfy(...args));
