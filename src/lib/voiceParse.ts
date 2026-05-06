import type { VoiceCommands } from '../types';

export type ParsedTranscript = {
  title: string;
  body: string;
  tagPhrase: string;
  saveTriggered: boolean;
  cancelTriggered: boolean;
};

export function parseTranscript(
  transcript: string,
  cmds: VoiceCommands,
): ParsedTranscript {
  let working = transcript.trim();
  let title = '';
  let tagPhrase = '';
  let saveTriggered = false;
  let cancelTriggered = false;

  const titleRegex = new RegExp(
    `${escapeRegex(cmds.setTitle)}[、,\\s]*([^。.！!？?]+)[。.！!？?]`,
  );
  const titleMatch = working.match(titleRegex);
  if (titleMatch) {
    title = titleMatch[1].trim();
    working = working.replace(titleMatch[0], '').trim();
  }

  const tagRegex = new RegExp(
    `${escapeRegex(cmds.setTag)}[、,\\s]*([^。.！!？?]+)[。.！!？?]`,
  );
  const tagMatch = working.match(tagRegex);
  if (tagMatch) {
    tagPhrase = tagMatch[1].trim();
    working = working.replace(tagMatch[0], '').trim();
  }

  const saveRegex = new RegExp(`${escapeRegex(cmds.save)}[。.！!]?\\s*$`);
  if (saveRegex.test(working)) {
    saveTriggered = true;
    working = working.replace(saveRegex, '').trim();
  }

  const cancelRegex = new RegExp(`${escapeRegex(cmds.cancel)}[。.！!]?\\s*$`);
  if (cancelRegex.test(working)) {
    cancelTriggered = true;
    working = working.replace(cancelRegex, '').trim();
  }

  return { title, body: working, tagPhrase, saveTriggered, cancelTriggered };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
