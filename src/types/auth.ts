export interface IAuthPayload {
  id: string;
  email: string;
  password: string;
}

export interface ILoginResponse {
  accessToken: string;
  user: IAuthPayload;
}

export interface IApiError {
  message: string;
}
