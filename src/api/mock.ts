import { useRequest } from 'vue-request'

export function testRequest() {
  const { data, loading, error } = useRequest(() => http.post('/mock/post'))
  return { data, loading, error }
}
