<script lang="ts">
  import { TAG_LABELS } from '$lib/constants/tags';
  import type { Tag } from '$lib/constants/tags';

  interface Props {
    selectedTags: Set<string>;
    onToggle: (tag: string) => void;
    onClear: () => void;
  }

  let { selectedTags, onToggle, onClear }: Props = $props();

  const filterOptions: Array<{ key: Tag | 'untagged'; label: string }> = [
    { key: 'food', label: TAG_LABELS.food },
    { key: 'test', label: TAG_LABELS.test },
    { key: 'question', label: TAG_LABELS.question },
    { key: 'untagged', label: TAG_LABELS.untagged }
  ];
</script>

<div class="filters-section">
  {#each filterOptions as option}
    <button
      class="tag-filter-button"
      class:active={selectedTags.has(option.key)}
      on:click={() => onToggle(option.key)}
    >
      {option.label}
    </button>
  {/each}
  {#if selectedTags.size > 0}
    <button class="clear-filters-button" on:click={onClear}>
      Сбросить ({selectedTags.size})
    </button>
  {/if}
</div>

<style>
  .filters-section {
    display: flex;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    flex-wrap: wrap;
    align-items: center;
    border-bottom: 1px solid #e2e8f0;
    background: white;
  }

  .tag-filter-button {
    padding: 0.375rem 0.875rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #475569;
    transition: all 0.15s ease;
  }

  .tag-filter-button:hover {
    border-color: #94a3b8;
    background: #f8fafc;
    color: #0f172a;
  }

  .tag-filter-button.active {
    border-color: #3b82f6;
    background: #dbeafe;
    color: #1e40af;
  }

  .clear-filters-button {
    padding: 0.375rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background: white;
    color: #64748b;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .clear-filters-button:hover {
    background: #f8fafc;
    border-color: #94a3b8;
    color: #0f172a;
  }
</style>
