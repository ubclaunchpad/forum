export type Tag = {
  id: string;
  name: string;
  visibility: string;
  course_id: string;
  parent_tag_id: string | null;
  created_by: string;
  properties: object | null;
};
