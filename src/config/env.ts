const _env = Object.freeze({
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET as string,
  NODE_ENV: process.env.NODE_ENV as "production" | "development",
  // Cloudnary
  cloud_name: process.env.CLOUD_NAME as string,
  cloud_api_key: process.env.CLOUD_API_KEY as string,
  cloud_api_secret: process.env.CLOUD_SECRET_API_KEY as string,
});

export default _env;
