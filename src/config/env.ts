const _env = Object.freeze({
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET as string,
  NODE_ENV: process.env.NODE_ENV as "production" | "development",
  // Cloudnary
  cloud_name: process.env.CLOUD_NAME as string,
  cloud_api_key: process.env.CLOUD_API_KEY as string,
  cloud_api_secret: process.env.CLOUD_SECRET_API_KEY as string,
  // Domain
  cors_origin: process.env.ALLOW_ORIGIN as string,
  sub_domain: process.env.SUB_DOMAIN as string,
});

if (!_env.NODE_ENV) {
  console.error("NODE_ENV not defined");
  process.exit(1);
}
if (!_env.cloud_api_key) {
  console.error("cloud_api_key not defined");
  process.exit(1);
}
if (!_env.cloud_api_secret) {
  console.error("cloud_api_secret not defined");
  process.exit(1);
}
if (!_env.cloud_name) {
  console.error("cloud_name not defined");
  process.exit(1);
}
if (!_env.cors_origin) {
  console.error("cors_origin not defined");
  process.exit(1);
}
if (!_env.jwtSecret) {
  console.error("jwtSecret not defined");
  process.exit(1);
}
if (!_env.sub_domain) {
  console.error("sub_domain not defined");
  process.exit(1);
}

export default _env;
