async function filterUser(userObj: any) {
  const { password, id, ...reset } = userObj;
  return reset;
}

export default filterUser;
