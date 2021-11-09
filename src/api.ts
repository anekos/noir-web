import { ApiEndPoint } from './config'
import { NoirSearchResult } from './search_result';
import { AppError } from './error';


export interface Alias {
  expression: string
  recursive: boolean
}

export interface SearchHistory {
  expression: string
  uses: number
}

export async function deleteAlias(name: string): Promise<boolean | null> {
  return fetch(`${ApiEndPoint}/alias/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  }).then(it => it.json());
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

export async function getFileTags(path: string): Promise<string[]> {
  return fetch(`${ApiEndPoint}/file/tags?path=${encodeURIComponent(path)}`, {
    method: 'GET',
  }).then(it => it.json())
  .then(it => it.sort());
}

export async function search(expression: string, record: boolean): Promise<NoirSearchResult | AppError> {
  return fetch(`${ApiEndPoint}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({expression, record}),
  }).then(it => {
    if (it.ok)
      return it.json()
    const code = it.status
    return it.text().then(message => ({error: {code, message}}))
  });
}

export async function replaceTag(expression: string, tag: string): Promise<string | null> {
  return fetch(`${ApiEndPoint}/expression/replace_tag`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({expression, tag}),
  }).then(it => it.json())
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
