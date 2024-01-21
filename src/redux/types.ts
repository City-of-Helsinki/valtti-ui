type IPinCredentials = any; // from internal lib

interface User {
  id: string;
  phoneNumber: string;
  jwt: string;
  pinLogin: IPinCredentials;
  roleType: RoleType;
}

export type RoleType = "caregiver" | "relative" | "admin";

export type { User };
