export class ParsedPost {
  link: string;
  photo: string;
  summary: string;

  constructor(link: string, photo: string, summary: string) {
    this.link = link;
    this.photo = photo;
    this.summary = summary;
  }
}

export interface ApiPostMedia {
  url: string;
  width: number;
  height: number;
}

export interface VideoMeta {
  id: string;
}

export interface ApiPostContent {
  type: string;
  provider: string | undefined;
  media: ApiPostMedia[] | undefined;
  metadata: VideoMeta | undefined;
  poster: ApiPostMedia[] | undefined;
}

export interface ApiPostTrail {
  content: ApiPostContent[];
}

export interface ApiPost {
  post_url: string;
  parent_post_url: string;
  summary: string;
  timestamp: number;
  content: ApiPostContent[];
  trail: ApiPostTrail[];
}

export interface ApiBlogDetails {
  name: string;
  title: string;
  url: string;
  total_posts: number;
}

export interface ApiBlog {
  blog: ApiBlogDetails;
  posts: ApiPost[];
  total_posts: number;
}

export interface PostApiResponse {
  response: ApiPost[];
}

export interface BlogApiResponse {
  response: ApiBlog;
}
