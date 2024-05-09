export class ParsedPost {
  link: string;
  photos: string[] = [];

  /**
   *
   */
  constructor(link: string) {
    this.link = link;
  }
}

export interface ApiPostPhoto {
  url: string;
}

export interface ApiPostPhotos {
  original_size: ApiPostPhoto;
  alt_sizes: ApiPostPhoto[];
}

export interface ApiPost {
  post_url: string;
  timestamp: number;
  image_permalink: string | undefined;
  photos: ApiPostPhotos[] | undefined;
}

export interface ApiResponse {
  response: ApiPost[];
}
