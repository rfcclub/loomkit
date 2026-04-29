export interface BrainstormIdea {
  id: string;
  title: string;
  description: string;
}

export interface BrainstormOutput {
  title: string;
  problem: string;
  constraints: string[];
  ideas: BrainstormIdea[];
  questions: string[];
}

export interface BrainstormValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function parseBrainstorm(markdown: string): BrainstormOutput {
  // Title
  const titleMatch = markdown.match(/^#\s+Brainstorm:\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Problem
  const problemMatch = markdown.match(/^##\s+Problem\s*\n([\s\S]*?)(?=\n##\s)/m);
  const problem = problemMatch ? problemMatch[1].trim() : '';

  // Constraints
  const constraints: string[] = [];
  const constraintMatch = markdown.match(/^##\s+Constraints\s*\n([\s\S]*?)(?=\n##\s)/m);
  if (constraintMatch) {
    const lines = constraintMatch[1].split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        constraints.push(trimmed.substring(2));
      }
    }
  }

  // Ideas
  const ideas: BrainstormIdea[] = [];
  const ideaParts = markdown.split(/^###\s+Idea\s+\d+:\s+/m).slice(1);
  for (const part of ideaParts) {
    const titleLine = part.split('\n')[0].trim();
    const desc = part.split('\n').slice(1).join('\n').trim();
    ideas.push({ id: slugify(titleLine), title: titleLine, description: desc });
  }

  // Questions
  const questions: string[] = [];
  const questionsMatch = markdown.match(/^##\s+Questions\s*\n([\s\S]*?)$/m);
  if (questionsMatch) {
    const lines = questionsMatch[1].split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        questions.push(trimmed.substring(2));
      }
    }
  }

  return { title, problem, constraints, ideas, questions };
}

export function validateBrainstorm(markdown: string): BrainstormValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!markdown.includes('## Problem')) {
    errors.push('brainstorm missing required section: Problem');
  }

  const parsed = parseBrainstorm(markdown);
  if (parsed.ideas.length < 2) {
    errors.push(`brainstorm needs at least 2 ideas, found ${parsed.ideas.length}`);
  }

  if (parsed.questions.length === 0) {
    warnings.push('no Questions section — consider adding open questions to explore');
  }

  return { valid: errors.length === 0, errors, warnings };
}
