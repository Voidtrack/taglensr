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
import { ApiResponse, ParsedPost } from './models/post';

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
  private readonly REQUEST_LIMIT = 12;

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
    this.tuServe.getTaggedPosts(this.tag, date).subscribe({
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
      return;
    }

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
            post.photos[0].alt_sizes[2].url,
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
      if (this.requestsMade < this.REQUEST_LIMIT * this.requestedPosts) {
        this.loadPosts(updatedDate);
        return;
      }
      this.displayErrorSnack(
        "We had to stop the search because it required too many requests. Please don't retry your search and drop us an issue!"
      );
      this.resetNav();
    }
    this.loading = false;
  }
}
