import { ApiEndPoint } from './config'
import { NoirSearchResult } from './search_result';

export interface SearchHistory {
  expression: string
  uses: number
}

export async function getAliases(): Promise<string[]> {
  return fetch(`${ApiEndPoint}/aliases`, {
    method: 'GET',
  }).then(it => it.json());
}

export async function getHistory(): Promise<SearchHistory[]> {
  return fetch(`${ApiEndPoint}/history`, {
    method: 'GET',
  }).then(it => it.json());
}

export async function getTags(): Promise<string[]> {
  return fetch(`${ApiEndPoint}/tags`, {
    method: 'GET',
  }).then(it => it.json());
}

export async function search(expression: string, record: boolean): Promise<NoirSearchResult> {
  return fetch(`${ApiEndPoint}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({expression, record}),
  }).then(it => it.json());
}
