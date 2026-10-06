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
