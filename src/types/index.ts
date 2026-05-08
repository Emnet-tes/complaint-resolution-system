export type Role = 'SysAdmin' | 'OrgAdmin' | 'OrgHead' | 'DeptHead' | null;

export interface User {
	firstName?: string;
	lastName?: string;
	fullname: string;
	email: string;
	role: Role;
	profilePicture?: string;
}
