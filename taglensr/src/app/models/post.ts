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

export interface ApiPost {
  post_url: string;
  summary: string;
  timestamp: number;
  content: ApiPostContent[];
}

export interface ApiResponse {
  response: ApiPost[];
}
