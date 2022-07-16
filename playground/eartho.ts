import { createEarthoOne } from '../src/index';

const defaultClientId = 'x5wNs5h7EiyhxzODBe1X';

const res = JSON.parse(localStorage.getItem('vue-playground-data'));
const client_id = res?.client_id || defaultClientId;

export const eartho = createEarthoOne({
  client_id,
  // useFormData: res?.useFormData || true,
  redirect_uri: window.location.origin
});
