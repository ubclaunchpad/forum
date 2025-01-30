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
