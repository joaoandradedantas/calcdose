async function signUp() {
  return await sb.auth.signUp({
    email: "teste@calcdose.app",
    password: "123456",
  });
}

async function signIn() {
  return await sb.auth.signInWithPassword({
    email: "teste@calcdose.app",
    password: "123456",
  });
}

async function signOut() {
  await sb.auth.signOut();
  location.reload();
}

async function getCurrentUser() {
  const {
    data: { user },
  } = await sb.auth.getUser();

  return user;
}
