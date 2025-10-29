export type Tag = 'food' | 'test' | 'question';

export interface TagOption {
  value: Tag | '';
  label: string;
}

export const TAG_OPTIONS: TagOption[] = [
  { value: '', label: 'Без тега' },
  { value: 'food', label: 'Еда' },
  { value: 'test', label: 'Анализ' },
  { value: 'question', label: 'Вопрос' }
];

export const TAG_LABELS: Record<Tag | 'untagged', string> = {
  food: 'Еда',
  test: 'Анализы',
  question: 'Вопросы',
  untagged: 'Без тега'
};
