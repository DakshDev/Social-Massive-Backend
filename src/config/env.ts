const _envObj = {
  port: process.env.PORT,
  jwtSecrate: process.env.JWT_SECRATE as string,
  NODE_ENV: process.env.NODE_ENV as "production" | "development",
};

const _env = Object.freeze(_envObj);
export default _env;
