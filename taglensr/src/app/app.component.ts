import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { TumblrService } from './services/tumblr.service';
import { ApiResponse, ApiTumblrVideoMetadata, ParsedPost } from './models/post';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatSidenavContainer,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MatTooltipModule,
    FormsModule,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  // Specify max requests per post
  readonly REQUEST_LIMIT = 12;
  readonly YOUTUBE_REGEX = /(?<=youtube\.com\/embed\/).{11}/;
  readonly TUMBLR_REGEX = /(?<=npf='){.*}/;

  private _snackBar = inject(MatSnackBar);

  posts: ParsedPost[] = [];
  loading = false;
  selectedDate = new Date().toISOString().split('T')[0];
  internalDate = this.selectedDate;
  requestedPosts = 5;
  getVideo = false;
  pendingSearch = true;
  tag = '';
  requestsMade = 0;

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
    this.requestsMade = 0;
    this.loadPosts();
  }

  loadPosts(date: Date = new Date(this.selectedDate)) {
    this.requestsMade += 1;
    this.tuServe.getTaggedPosts(this.tag, date, this.getVideo).subscribe({
      next: this.parsePosts.bind(this),
      error: (e) => {
        this.resetNav();
        this.displayErrorSnack(
          `We got an error from Tumblr's API! Code: ${Number(
            e.status
          )}. Please drop us an issue!`
        );
        console.error(e);
        this.loading = false;
      },
    });
  }

  private displayErrorSnack(errorText: string) {
    this._snackBar.open(`⚠️ ${errorText}`, 'Dismiss');
  }

  private parsePosts(posts: ApiResponse) {
    if (posts.response.length === 0) {
      this.displayErrorSnack('No more posts found');
      this.loading = false;
      this.resetNav();
      return;
    }

    for (const post of posts.response) {
      let summary = post.summary;
      if (summary.length > 40) {
        summary = summary.substring(0, 40) + '...';
      }
      if (this.getVideo) {
        if (!post.body) continue;
        if (
          post.body.includes('figure') &&
          post.body.includes('youtube') &&
          post.body.search(this.YOUTUBE_REGEX) !== -1
        ) {
          const embedID = post.body.match(this.YOUTUBE_REGEX)![0];
          this.posts.push(
            new ParsedPost(
              post.post_url,
              `https://img.youtube.com/vi/${embedID}/0.jpg`,
              summary
            )
          );
        } else if (
          post.body.includes('figure') &&
          post.body.includes('</video>') &&
          post.body.search(this.TUMBLR_REGEX) !== -1
        ) {
          const metadata: ApiTumblrVideoMetadata = JSON.parse(
            post.body.match(this.TUMBLR_REGEX)![0]
          );
          new ParsedPost(post.post_url, metadata.poster[0].url, summary);
        }
      } else {
        if (post.photos) {
          this.posts.push(
            new ParsedPost(
              post.post_url,
              post.photos[0].alt_sizes[2].url,
              summary
            )
          );
        }
      }
      if (this.posts.length === this.requestedPosts) {
        break;
      }
    }
    const updatedDate = new Date(posts.response.pop()!.timestamp);
    this.internalDate = new Date(posts.response.pop()!.timestamp * 1000)
      .toISOString()
      .split('T')[0];
    if (this.posts.length < this.requestedPosts) {
      if (this.requestsMade < this.REQUEST_LIMIT * this.requestedPosts) {
        this.loadPosts(updatedDate);
        return;
      }
      this.displayErrorSnack(
        "We had to stop the search because it used too many requests. Please drop us an issue and don't try again!"
      );
      this.resetNav();
    }
    this.loading = false;
  }
}
