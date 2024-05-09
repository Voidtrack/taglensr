import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { TumblrService } from './services/tumblr.service';
import { ApiResponse, ParsedPost } from './models/post';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatSidenavContainer, MatCardModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  posts: ParsedPost[] = [];
  loading = false;
  selectedDate = new Date(2019, 7, 10);
  requestedPosts = 10;

  constructor(private tuServe: TumblrService) {}

  openPost(url: string) {
    window.open(url, '_blank');
  }

  private loadPosts(date: Date = this.selectedDate) {
    console.log(date.getTime());
    this.tuServe.getTaggedPosts('cats', date).subscribe({
      next: this.parsePosts.bind(this),
    });
  }

  private parsePosts(posts: ApiResponse) {
    if (posts.response.length === 0) {
      return;
    }
    console.log(posts.response);

    for (const post of posts.response) {
      // if (post.image_permalink) {
      //   parsedPost.photos.push(post.image_permalink);
      // } else
      let summary = post.summary;
      if (summary.length > 40) {
        summary = summary.substring(0, 40) + '...';
      }
      if (post.photos) {
        this.posts.push(
          new ParsedPost(
            post.post_url,
            post.photos[0].alt_sizes[3].url,
            summary
          )
        );
      } else {
        continue;
      }
      if (this.posts.length === this.requestedPosts) {
        break;
      }
    }
    if (this.posts.length < this.requestedPosts) {
      const updatedDate = new Date(posts.response.pop()!.timestamp);
      this.loadPosts(updatedDate);
    }
  }

  ngOnInit(): void {
    this.loading = true;
    this.loadPosts();
  }
}
