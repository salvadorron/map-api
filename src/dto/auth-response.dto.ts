export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    fullname: string;
    username: string;
    email: string;
    role: string;
    institution_id?: string | null;
  };
}

