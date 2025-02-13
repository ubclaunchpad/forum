export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  joined_at?: string;
  display_name?: string;
  icon_url?: string;
  pronouns?: string;
  username?: string;
  timezone: string;
  bio?: string;
  socials?: SocialLinks;
  status?: string;
  roles: Role[];
  permissions: Omit<Permission, "id">[];
};

export type SocialLinks = {
  linkedin?: string;
  instagram?: string;
  github?: string;
  facebook?: string;
  X?: string;
  discord?: string;
  youtube?: string;
  website?: string;
  reddit?: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  permissions: Omit<Permission, "id">[];
};

export type Permission = {
  id: string;
  domain: string | null;
  subdomain: string | null;
  scope: string;
  resource: string;
  modifier: string;
  action: string;
};

export type InvitedUser = {
  referrer_id: string;
  referred_email: string;
  invited_at: string;
  joined_at: string;
};
