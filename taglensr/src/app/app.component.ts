import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { TumblrService } from './services/tumblr.service';
import { ApiResponse, ParsedPost } from './models/post';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    // RouterOutlet,
    MatSidenavContainer,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    FormsModule,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  posts: ParsedPost[] = [];
  loading = false;
  selectedDate = new Date().toISOString().split('T')[0];
  internalDate = this.selectedDate;
  requestedPosts = 5;
  getVideo = false;
  pendingSearch = true;
  tag = '';

  constructor(private tuServe: TumblrService) {}

  openPost(url: string) {
    window.open(url, '_blank');
  }

  resetNav() {
    this.pendingSearch = true;
  }

  backInTime() {
    this.selectedDate = this.internalDate;
    this.search();
  }

  search() {
    this.tag = this.tag.replace('#', '');
    if (this.tag.length === 0) {
      return;
    }
    this.posts = [];
    this.loading = true;
    this.pendingSearch = false;
    this.loadPosts();
  }

  loadPosts(date: Date = new Date(this.selectedDate)) {
    this.tuServe.getTaggedPosts(this.tag, date).subscribe({
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
      this.internalDate = new Date(posts.response.pop()!.timestamp * 1000)
        .toISOString()
        .split('T')[0];
      this.loadPosts(updatedDate);
      return;
    }
    this.loading = false;
  }
}
