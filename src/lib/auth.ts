// This module re-exports Auth.js hooks from the updated role-based access configuration to keep global imports aligned.
export { auth, handlers, signIn, signOut } from "./auth/zakatAuthenticationRoleAccessConfiguration";

