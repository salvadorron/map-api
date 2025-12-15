export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    fullname: string;
    username: string;
    email: string;
    role_id: string;
    institution_id?: string | null;
  };
}

