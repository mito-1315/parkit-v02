import { AiAdapter } from './aiAdapter.interface';
import { mockAiAdapter } from './mockAiAdapter';

let adapter: AiAdapter = mockAiAdapter;

export function getAiAdapter(): AiAdapter {
  return adapter;
}

export function setAiAdapter(next: AiAdapter): void {
  adapter = next;
}
