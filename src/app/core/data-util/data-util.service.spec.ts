import { TestBed } from '@angular/core/testing';

import { DataUtilService } from './data-util.service';

describe('DataUtilService', () => {
  let service: DataUtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataUtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
