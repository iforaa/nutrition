<script lang="ts">
  import { TAG_OPTIONS } from '$lib/constants/tags';
  import type { Tag } from '$lib/constants/tags';

  interface Props {
    value?: Tag | null;
    disabled?: boolean;
    onChange?: (value: Tag | null) => void;
    class?: string;
    id?: string;
  }

  let { value = null, disabled = false, onChange, class: className = '', id }: Props = $props();

  function handleChange(e: Event) {
    const target = e.currentTarget as HTMLSelectElement;
    const newValue = target.value || null;
    onChange?.(newValue as Tag | null);
  }
</script>

<select
  {id}
  value={value || ''}
  on:change={handleChange}
  {disabled}
  class={className}
>
  {#each TAG_OPTIONS as option}
    <option value={option.value}>{option.label}</option>
  {/each}
</select>
