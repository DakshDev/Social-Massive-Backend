const _env = Object.freeze({
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET as string,
  NODE_ENV: process.env.NODE_ENV as "production" | "development",
});

export default _env;
