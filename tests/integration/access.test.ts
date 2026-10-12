import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canManage,
  canConfigureDelivery,
  type Actor,
  type Store,
} from '../../apps/api/src/access.ts';
const store: Store = {
  id: 'a',
  name: 'A',
  provinceId: '50',
  province: '',
  district: '',
  subdistrict: '',
  category: 'food',
  lat: 0,
  lng: 0,
};
const actor = (
  role: Actor['role'],
  storeIds: string[] = [],
  provinceIds: string[] = [],
): Actor => ({ id: 'u', name: 'U', role, storeIds, provinceIds });
test('user cannot inherit merchant rights through membership IDs', () =>
  assert.equal(canManage(actor('USER', ['a'], ['50']), store), false));
test('merchant can manage own store but cannot cross stores or configure delivery', () => {
  const a = actor('MERCHANT', ['a']);
  assert.equal(canManage(a, store), true);
  assert.equal(canManage(a, { ...store, id: 'b' }), false);
  assert.equal(canConfigureDelivery(a, store), false);
});
test('admin is restricted to assigned provinces', () => {
  const a = actor('ADMIN', [], ['50']);
  assert.equal(canManage(a, store), true);
  assert.equal(canManage(a, { ...store, provinceId: '75' }), false);
  assert.equal(canConfigureDelivery(a, { ...store, provinceId: '75' }), false);
});
test('even super admin cannot apply food delivery configuration to crafts', () => {
  const a = actor('SUPER_ADMIN');
  assert.equal(canManage(a, store), true);
  assert.equal(canConfigureDelivery(a, store), true);
  assert.equal(canConfigureDelivery(a, { ...store, category: 'craft' }), false);
});

import { sandboxPaymentsEnabled, ownsPayment } from '../../apps/api/src/payment-policy.ts';
test('sandbox payments fail closed outside explicitly opted-in development/test', () => {
  for (const NODE_ENV of [undefined, 'production', 'staging', 'preview']) {
    assert.equal(sandboxPaymentsEnabled({ NODE_ENV, ENABLE_SANDBOX_PAYMENTS: 'true' }), false);
  }
  for (const NODE_ENV of ['development', 'test']) {
    for (const ENABLE_SANDBOX_PAYMENTS of [undefined, 'false', '1', 'TRUE']) {
      assert.equal(sandboxPaymentsEnabled({ NODE_ENV, ENABLE_SANDBOX_PAYMENTS }), false);
    }
    assert.equal(sandboxPaymentsEnabled({ NODE_ENV, ENABLE_SANDBOX_PAYMENTS: 'true' }), true);
  }
});
test('payment ownership cannot be inferred from staff status', () => {
  assert.equal(ownsPayment('customer-a', 'customer-a'), true);
  assert.equal(ownsPayment('customer-b', 'customer-a'), false);
});

import { createHmac } from 'node:crypto';
test('webhook signature verifies HMAC-SHA256 correctly', () => {
  const secret = 'test-secret-key-123';
  const payload = JSON.stringify({ providerRef: 'TT-98765432', status: 'succeeded' });
  const validSignature = createHmac('sha256', secret).update(payload).digest('hex');
  const invalidSignature = createHmac('sha256', 'wrong-secret').update(payload).digest('hex');

  assert.equal(createHmac('sha256', secret).update(payload).digest('hex'), validSignature);
  assert.notEqual(validSignature, invalidSignature);
});
