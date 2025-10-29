<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/app.css';
	import Header from '$lib/components/Header.svelte';
	import type { PageData } from './$types';

	let { data, children }: { data: PageData; children: any } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Header user={data.user} />
{@render children?.()}
