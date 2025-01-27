export type Course = {
  id: string;
  c_group: string;
  code: string;
  section: string;
  name: string;
  config?: {
    theme_colour?: string;
    font?: string;
  };
};
