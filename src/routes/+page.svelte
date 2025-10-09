<script lang="ts">
  import type { PageData } from './$types';
  import Check from '$lib/components/icons/Check.svelte';
  import Clock from '$lib/components/icons/Clock.svelte';

  export let data: PageData;

  // Group posts by user
  const postsByUser = data.posts.reduce((acc, post) => {
    const email = post.user.email;
    if (!acc[email]) {
      acc[email] = {
        user: post.user,
        posts: []
      };
    }
    acc[email].posts.push(post);
    return acc;
  }, {} as Record<string, { user: any; posts: any[] }>);

  // Calculate stats
  const totalUsers = Object.keys(postsByUser).length;
  const postsNeedingReview = data.posts.filter(p => p.reviews.length === 0).length;
  const totalPosts = data.posts.length;
  const reviewedPosts = data.posts.filter(p => p.reviews.length > 0).length;
</script>

<svelte:head>
  <title>Admin Panel - Nutrition App</title>
</svelte:head>

<div class="admin-container">
  <!-- Header Stats -->
  <div class="header">
    <h1>Панель администратора</h1>
    <div class="stats-bar">
      <div class="stat">
        <span class="stat-value">{totalUsers}</span>
        <span class="stat-label">Пользователей</span>
      </div>
      <div class="stat">
        <span class="stat-value">{totalPosts}</span>
        <span class="stat-label">Всего постов</span>
      </div>
      <div class="stat warning">
        <span class="stat-value">{postsNeedingReview}</span>
        <span class="stat-label">Требуют проверки</span>
      </div>
      <div class="stat success">
        <span class="stat-value">{reviewedPosts}</span>
        <span class="stat-label">Проверено</span>
      </div>
    </div>
  </div>

  <!-- Users List -->
  <div class="users-list">
    {#each Object.values(postsByUser) as { user, posts }}
      <a href="/user/{user.id}" class="user-row">
        <div class="user-main">
          <h3>{user.name}</h3>
          <span class="user-email">{user.email}</span>
        </div>
        <div class="user-stats-row">
          <div class="stat-item">
            <span class="stat-value">{posts.length}</span>
            <span class="stat-label">Постов</span>
          </div>
          <div class="stat-item warning">
            <span class="stat-value">{posts.filter(p => p.reviews.length === 0).length}</span>
            <span class="stat-label">Требуют</span>
          </div>
          <div class="stat-item success">
            <span class="stat-value">{posts.filter(p => p.reviews.length > 0).length}</span>
            <span class="stat-label">Проверено</span>
          </div>
        </div>
      </a>
    {/each}

    {#if totalUsers === 0}
      <div class="empty-state">
        <p>Нет пользователей</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .admin-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    background: #f8f9fa;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }

  .header {
    background: white;
    padding: 1.5rem 1.5rem 1.25rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    border: 1px solid #e3e8ee;
  }

  .header h1 {
    margin: 0 0 1.25rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    letter-spacing: -0.01em;
  }

  .stats-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
  }

  .stat {
    background: #f8f9fa;
    padding: 0.875rem 1rem;
    border-radius: 6px;
    text-align: center;
    border: 1px solid #e3e8ee;
  }

  .stat.warning {
    background: #fff3cd;
    border-color: #ffc107;
  }

  .stat.success {
    background: #d4edda;
    border-color: #28a745;
  }

  .stat-value {
    display: block;
    font-size: 1.75rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.125rem;
    letter-spacing: -0.02em;
  }

  .stat-label {
    display: block;
    font-size: 0.8125rem;
    color: #6c757d;
    font-weight: 500;
  }

  .users-list {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e3e8ee;
  }

  .user-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e3e8ee;
    text-decoration: none;
    transition: background 0.15s ease;
  }

  .user-row:hover {
    background: #f8f9fa;
  }

  .user-row:last-child {
    border-bottom: none;
  }

  .user-main h3 {
    margin: 0 0 0.25rem 0;
    color: #2c3e50;
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .user-email {
    color: #6c757d;
    font-size: 0.8125rem;
    font-weight: 400;
  }

  .user-stats-row {
    display: flex;
    gap: 2rem;
  }

  .stat-item {
    text-align: center;
    min-width: 60px;
  }

  .stat-item .stat-value {
    display: block;
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.125rem;
    letter-spacing: -0.01em;
  }

  .stat-item .stat-label {
    display: block;
    font-size: 0.75rem;
    color: #6c757d;
    font-weight: 500;
  }

  .stat-item.warning .stat-value {
    color: #856404;
  }

  .stat-item.success .stat-value {
    color: #155724;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #6c757d;
    font-size: 0.9375rem;
  }
</style>
