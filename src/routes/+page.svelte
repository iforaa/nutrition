<script lang="ts">
    import type { PageData } from "./$types";
    import "$lib/styles/table.css";

    export let data: PageData;

    // Group posts by user
    const postsByUser = data.posts.reduce(
        (acc, post) => {
            const email = post.user.email;
            if (!acc[email]) {
                acc[email] = {
                    user: post.user,
                    posts: [],
                };
            }
            acc[email].posts.push(post);
            return acc;
        },
        {} as Record<string, { user: any; posts: any[] }>,
    );

    function formatDate(dateString: string | Date) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("ru-RU", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    }
</script>

<svelte:head>
    <title>Admin Panel - Nutrition App</title>
</svelte:head>

<div class="admin-container">
    <div class="page-header">
        <h1>Клиенты</h1>
    </div>

    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Постов</th>
                    <th>Требуют проверки</th>
                    <th>Проверено</th>
                    <th>Дата регистрации</th>
                </tr>
            </thead>
            <tbody>
                {#each Object.values(postsByUser) as { user, posts }}
                    <tr class="clickable-row">
                        <td class="cell-primary"
                            ><a href="/user/{user.id}" class="cell-link"
                                >{user.name}</a
                            ></td
                        >
                        <td class="cell-secondary"
                            ><a href="/user/{user.id}" class="cell-link"
                                >{user.email}</a
                            ></td
                        >
                        <td class="cell-number"
                            ><a href="/user/{user.id}" class="cell-link"
                                >{posts.length}</a
                            ></td
                        >
                        <td class="cell-number warning"
                            ><a href="/user/{user.id}" class="cell-link"
                                >{posts.filter((p) => p.reviews.length === 0)
                                    .length}</a
                            ></td
                        >
                        <td class="cell-number success"
                            ><a href="/user/{user.id}" class="cell-link"
                                >{posts.filter((p) => p.reviews.length > 0)
                                    .length}</a
                            ></td
                        >
                        <td class="cell-date"
                            ><a href="/user/{user.id}" class="cell-link"
                                >{formatDate(user.createdAt)}</a
                            ></td
                        >
                    </tr>
                {/each}
            </tbody>
        </table>

        {#if Object.keys(postsByUser).length === 0}
            <div class="table-empty-state">
                <p>Нет клиентов</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .admin-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
        background: #f8f9fa;
        min-height: 100vh;
        font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
    }

    .page-header {
        margin-bottom: 1.5rem;
    }

    .page-header h1 {
        font-size: 1.75rem;
        font-weight: 600;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.025em;
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .page-header h1 {
            font-size: 1.5rem;
        }
    }
</style>
