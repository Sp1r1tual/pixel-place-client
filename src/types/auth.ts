export interface IAuthPayload {
  id: string;
  email: string;
  password: string;
}

export type IAuthPayloadWithoutId = Omit<IAuthPayload, "id">;

export interface ILoginResponse {
  accessToken: string;
  user: IUserPublic;
}

export interface IUserPublic {
  id: string;
  email: string;
}

export interface IApiError {
  message: string;
}
