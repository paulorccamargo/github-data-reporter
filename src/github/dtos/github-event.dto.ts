export class GithubEventDto {
    id: string;
    type: string;
    repo: {
        name: string;
    };
    payload: any;
    created_at: string;
}
