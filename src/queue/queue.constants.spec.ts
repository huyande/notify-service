import { buildJobId } from './queue.constants';

describe('buildJobId', () => {
  it('joins appId and requestId without forbidden colon', () => {
    const id = buildJobId('wx123', 'req-1');

    expect(id).toBe('wx123_req-1');
    expect(id).not.toContain(':');
  });

  it('is deterministic for the same input', () => {
    expect(buildJobId('wx123', 'req-1')).toBe(buildJobId('wx123', 'req-1'));
  });

  it('differs when appId or requestId differs', () => {
    expect(buildJobId('wx1', 'r1')).not.toBe(buildJobId('wx2', 'r1'));
    expect(buildJobId('wx1', 'r1')).not.toBe(buildJobId('wx1', 'r2'));
  });
});
