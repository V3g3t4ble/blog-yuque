export interface PostMeta {
  title: string;
  date?: Date;
  updated?: Date;
  description?: string;
  sort?: number;
  locked?: boolean;
}

export interface PostEntry {
  id: string;
  slug?: string;
  body?: string;
  data: PostMeta;
}

