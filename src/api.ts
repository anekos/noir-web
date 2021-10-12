import { ApiEndPoint } from './config'
import { NoirSearchResult } from './search_result';

export interface Alias {
  expression: string
  recursive: boolean
}

export interface SearchHistory {
  expression: string
  uses: number
}

export async function getAlias(name: string): Promise<Alias | null> {
  return fetch(`${ApiEndPoint}/alias/${encodeURIComponent(name)}`, {
    method: 'GET',
  }).then(it => it.json());
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

export async function updateAlias(name: string, alias: Alias): Promise<Alias | null> {
  return fetch(`${ApiEndPoint}/alias/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(alias),
  }).then(it => it.json());
}
