import { TestBed } from '@angular/core/testing';

import { TumblrService } from './tumblr.service';

describe('TumblrService', () => {
  let service: TumblrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TumblrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
