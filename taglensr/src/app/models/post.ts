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

export interface ApiPostPhoto {
  url: string;
  width: number;
  height: number;
}

export interface ApiPostPhotos {
  original_size: ApiPostPhoto;
  alt_sizes: ApiPostPhoto[];
}

export interface ApiPost {
  post_url: string;
  summary: string;
  timestamp: number;
  image_permalink: string | undefined;
  photos: ApiPostPhotos[] | undefined;
}

export interface ApiResponse {
  response: ApiPost[];
}
