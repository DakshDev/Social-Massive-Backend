function filterUser(userObj: any) {
  const { password, ...reset } = userObj;
  return reset;
}

export default filterUser;
