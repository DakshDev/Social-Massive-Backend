// Gender enum agar aapne define kiya hai
export enum UserGender {
  male = "male",
  female = "female",
  other = "other",
}

export type UserType = {
  name: string;
  username: string;
  email: string;
  password: string;
  birth: Date;
};

export type EditUserType = {
  name?: string;
  bio?: string;
  website?: string;
  avatar?: string;
  gender?: UserGender;
};

export type fullUserType = UserType & EditUserType;

// Post type
export type Post = {
  url: string;
  userId: number;
  id?: number;
  caption?: string;
  like?: number;
  save?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

// SavedPost type
export type SavedPost = {
  id?: number;
  url: string;
  userId: number;
};
