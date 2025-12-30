import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TypeSelectComponent } from './components/type-select/type-select.component';
import {
  BlogApiResponse,
  ParsedPost,
  PostApiResponse,
  PostType,
} from './models/post';
import { ParserService } from './services/parser.service';
import { TumblrService } from './services/tumblr.service';

@Component({
  selector: 'app-root',
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
    TypeSelectComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  // Specify max requests per post
  readonly REQUEST_LIMIT = 5;

  private _snackBar = inject(MatSnackBar);

  posts: ParsedPost[] = [];
  loading = false;
  selectedDate = new Date().toISOString().split('T')[0];
  internalDate = this.selectedDate;
  requestedPostCount = 5;
  filterType = PostType.all;
  pendingSearch = true;
  target = '';
  requestsMade = 0;

  constructor(private tuServe: TumblrService, private parser: ParserService) {}

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
    if (this.target.length === 0) {
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
    if (this.requestsMade >= this.REQUEST_LIMIT * this.requestedPostCount) {
      this.displayErrorSnack(
        "We had to stop the search because it used too many requests. Please drop us an issue and don't try again!"
      );
      this.resetNav();
      this.loading = false;
    }
    if (this.target.includes('@')) {
      this.tuServe
        .getBlogPosts(this.target.replace('@', ''), this.filterType, date)
        .subscribe({
          next: this.parseBlogResponse.bind(this),
          error: (e) => {
            this.resetNav();
            this.displayErrorSnack(
              `We got an error from Tumblr's API when looking for posts! Code: ${Number(
                e.status
              )}. Please drop us an issue!`
            );
            console.error(e);
            this.loading = false;
          },
        });
    } else {
      if (!this.target.includes('#'))
        this.displayErrorSnack("Query doesn't have a # or @. Assuming #");
      this.tuServe
        .getTaggedPosts(this.target.replace('#', ''), date)
        .subscribe({
          next: this.parsePostResponse.bind(this),
          error: (e) => {
            this.resetNav();
            this.displayErrorSnack(
              `We got an error from Tumblr's API when looking for posts! Code: ${Number(
                e.status
              )}. Please drop us an issue!`
            );
            console.error(e);
            this.loading = false;
          },
        });
    }
  }

  private displayErrorSnack(errorText: string) {
    this._snackBar.open(errorText, 'Dismiss');
  }

  private parseBlogResponse(response: BlogApiResponse) {
    if (response.response.posts.length === 0) {
      this.displayErrorSnack('No more posts found');
      this.loading = false;
      this.resetNav();
      return;
    }
    const parsedPosts = this.parser.parsePosts(
      response.response.posts,
      this.filterType,
      this.requestedPostCount
    );
    this.posts.push(...parsedPosts.posts);
    const updatedTimestamp = this.updateLocalTimestamp(
      parsedPosts.newTimestamp
    );
    if (this.posts.length === this.requestedPostCount) {
      this.loading = false;
    } else {
      this.loadPosts(updatedTimestamp);
    }
  }

  private parsePostResponse(response: PostApiResponse) {
    if (response.response.length === 0) {
      this.displayErrorSnack('No more posts found');
      this.loading = false;
      this.resetNav();
      return;
    }
    const parsedPosts = this.parser.parsePosts(
      response.response,
      this.filterType,
      this.requestedPostCount
    );
    this.posts.push(...parsedPosts.posts);
    const updatedTimestamp = this.updateLocalTimestamp(
      parsedPosts.newTimestamp
    );
    if (this.posts.length === this.requestedPostCount) {
      this.loading = false;
    } else {
      this.loadPosts(updatedTimestamp);
    }
  }

  private updateLocalTimestamp(timestamp: number): Date {
    this.internalDate = new Date(timestamp * 1000).toISOString().split('T')[0];
    return new Date(timestamp);
  }
}
