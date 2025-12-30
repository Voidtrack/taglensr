import { Injectable } from '@angular/core';
import {
  ApiPost,
  ApiPostContent,
  InvalidPostTypeException,
  NoValidMediaBlockFoundException,
  ParsedPost,
  PostParserOutput,
  PostType,
  UnknownVideoBlockFoundException,
} from '../models/post';

@Injectable({
  providedIn: 'root',
})
export class ParserService {
  parsePosts(
    posts: ApiPost[],
    filterType: PostType,
    maxPostCount: number
  ): PostParserOutput {
    let parsedPosts: ParsedPost[] = [];
    for (const post of posts) {
      if (post.content.length === 0) {
        //Posts without content are reblogs
        const parsedPost = this.parsePost(
          {
            post_url: post.post_url,
            parent_post_url: '',
            original_type: post.original_type,
            summary: '🔁 ' + post.summary,
            timestamp: post.timestamp,
            content: post.trail[0].content,
            trail: [],
          },
          filterType
        );
        if (parsedPost) parsedPosts.push(parsedPost);
      } else {
        const parsedPost = this.parsePost(post, filterType);
        if (parsedPost) parsedPosts.push(parsedPost);
      }
    }
    return {
      posts:
        parsedPosts.length > maxPostCount
          ? parsedPosts.slice(0, maxPostCount)
          : parsedPosts,
      newTimestamp: posts[posts.length - 1].timestamp,
    };
  }

  private parsePost(post: ApiPost, filterType: PostType): ParsedPost | null {
    let summary = post.summary;
    if (summary.length > 40) {
      summary = summary.substring(0, 40) + '...';
    }
    if (filterType === PostType.all) {
      if (post.original_type === 'note') {
        filterType = PostType.answer;
      }
      if (post.content[0].type === 'image') {
        filterType = PostType.photo;
      } else {
        filterType = PostType[post.content[0].type as keyof typeof PostType];
      }
    }
    switch (filterType) {
      case PostType.video: {
        if (post.original_type !== 'note' && post.content[0].type === 'video') {
          return new ParsedPost(
            post.post_url,
            this.getPostThumbnail(post.content),
            summary
          );
        }
        return null;
      }
      case PostType.photo: {
        if (post.original_type !== 'note' && post.content[0].type === 'image') {
          return new ParsedPost(
            post.post_url,
            this.getPostThumbnail(post.content),
            summary
          );
        }
        return null;
      }
      case PostType.answer: {
        if (post.original_type === 'note') {
          return new ParsedPost(
            post.post_url,
            this.getPostThumbnail(post.content),
            summary
          );
        }
        return null;
      }
      case PostType.audio: {
        if (post.original_type !== 'note' && post.content[0].type === 'audio') {
          let thumbnailURL = 'assets/audio.svg';
          try {
            thumbnailURL = this.getPostThumbnail(post.content);
          } catch (_) {}
          return new ParsedPost(post.post_url, thumbnailURL, summary);
        }
        return null;
      }
      case PostType.quote:
        if (post.original_type !== 'note' && post.content[0].type === 'text') {
          let thumbnailURL = 'assets/quote.svg';
          try {
            thumbnailURL = this.getPostThumbnail(post.content);
          } catch (_) {}
          return new ParsedPost(post.post_url, thumbnailURL, summary);
        }
        return null;
      case PostType.text:
        if (post.original_type !== 'note' && post.content[0].type === 'text') {
          let thumbnailURL = 'assets/text.svg';
          try {
            thumbnailURL = this.getPostThumbnail(post.content);
          } catch (_) {}
          return new ParsedPost(post.post_url, thumbnailURL, summary);
        }
        return null;
      case PostType.link:
        if (post.original_type !== 'note' && post.content[0].type === 'link') {
          let thumbnailURL = 'assets/link.svg';
          try {
            thumbnailURL = this.getPostThumbnail(post.content);
          } catch (_) {}
          return new ParsedPost(post.post_url, thumbnailURL, summary);
        }
        return null;
      case PostType.poll:
        if (post.original_type !== 'note' && post.content[0].type === 'poll') {
          let thumbnailURL = 'assets/poll.svg';
          try {
            thumbnailURL = this.getPostThumbnail(post.content);
          } catch (_) {}
          return new ParsedPost(post.post_url, thumbnailURL, summary);
        }
        return null;
    }
    throw new InvalidPostTypeException();
  }

  private getPostThumbnail(content: ApiPostContent[]): string {
    const imageBlock = content.find((block) => block.type === 'image');
    const videoBlock = content.find((block) => block.type === 'video');
    if (imageBlock) {
      return imageBlock.media![0].url;
    }
    if (videoBlock) {
      return this.getVideoThumbnail(videoBlock);
    }
    throw new NoValidMediaBlockFoundException();
  }

  private getVideoThumbnail(videoBlock: ApiPostContent): string {
    switch (videoBlock.provider) {
      case 'youtube': {
        const id = videoBlock.metadata!.id;
        return `https://img.youtube.com/vi/${id}/0.jpg`;
      }
    }
    if (videoBlock.media) {
      return videoBlock.poster![0].url;
    }
    throw new UnknownVideoBlockFoundException();
  }
}
