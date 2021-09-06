import { ApiEndPoint } from './config'
import { NoirSearchResult } from './search_result';


export async function search(expression: string): Promise<NoirSearchResult> {
  return fetch(`${ApiEndPoint}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({expression}),
  }).then(it => it.json());
}
