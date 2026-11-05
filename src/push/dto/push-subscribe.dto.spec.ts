import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PushSubscribeDto } from './push-subscribe.dto';

async function validateDto(payload: Record<string, unknown>) {
  const dto = plainToInstance(PushSubscribeDto, payload);
  return validate(dto);
}

describe('PushSubscribeDto', () => {
  const valid = {
    requestId: 'r1',
    appId: 'wx1',
    templateId: 'tpl_demo',
    openid: 'o1',
    data: { title: 'hello' },
  };

  it('passes with required fields', async () => {
    expect(await validateDto(valid)).toHaveLength(0);
  });

  it('fails when requestId is missing', async () => {
    const errors = await validateDto({ ...valid, requestId: undefined });
    expect(errors.some((error) => error.property === 'requestId')).toBe(true);
  });

  it('fails when data is not an object', async () => {
    const errors = await validateDto({ ...valid, data: 'not-object' });
    expect(errors.some((error) => error.property === 'data')).toBe(true);
  });

  it('fails on invalid miniprogramState', async () => {
    const errors = await validateDto({ ...valid, miniprogramState: 'bad' });
    expect(errors.some((error) => error.property === 'miniprogramState')).toBe(
      true,
    );
  });
});
