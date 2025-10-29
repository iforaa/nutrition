<script lang="ts">
    import { page } from "$app/stores";
    import type { User } from "$lib/database/schema";

    interface Props {
        user?: User | null;
    }

    let { user = null }: Props = $props();

    // Check if we're on auth pages to show different styling
    const isAuthPage = $derived($page.url.pathname.startsWith("/auth"));
</script>

<header class="header" class:auth-page={isAuthPage}>
    <div class="container">
        <div class="brand">
            <div class="brand-info">
                <h1 class="center-name">Центр питания</h1>
                <p class="specialist-name">Виктория Фалей</p>
            </div>
        </div>

        <div class="nav-right">
            {#if user}
                <div class="user-info">
                    <span class="user-name">{user.name}</span>
                    <a href="/auth/logout" class="logout-btn">Выйти</a>
                </div>
            {:else}
                <div class="contact-info">
                    <div class="specialty">Персональное питание и здоровье</div>
                </div>
            {/if}
        </div>
    </div>
</header>

<style>
    .header {
        background: linear-gradient(
            135deg,
            var(--gray-800) 0%,
            var(--gray-900) 100%
        );
        color: white;
        padding: 0.5rem 0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 100;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .header.auth-page {
        position: relative;
        background: linear-gradient(
            135deg,
            var(--gray-700) 0%,
            var(--gray-800) 100%
        );
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .brand {
        display: flex;
        align-items: center;
    }

    .brand-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
    }

    .center-name {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        letter-spacing: 0.3px;
        line-height: 1.2;
    }

    .specialist-name {
        font-size: 0.875rem;
        font-weight: 400;
        margin: 0;
        opacity: 0.75;
        font-style: italic;
        line-height: 1.2;
    }

    .nav-right {
        display: flex;
        align-items: center;
    }

    .contact-info {
        text-align: right;
    }

    .specialty {
        font-size: 0.875rem;
        font-weight: 400;
        opacity: 0.8;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .user-name {
        font-size: 0.875rem;
        font-weight: 500;
        opacity: 0.9;
    }

    .logout-btn {
        font-size: 0.875rem;
        font-weight: 500;
        color: white;
        background: rgba(255, 255, 255, 0.1);
        padding: 0.375rem 0.875rem;
        border-radius: 6px;
        transition: all 0.2s ease;
        text-decoration: none;
    }

    .logout-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .container {
            flex-direction: column;
            text-align: center;
            padding: 0 1rem;
        }

        .nav-right {
            width: 100%;
            justify-content: center;
        }

        .contact-info {
            text-align: center;
        }

        .user-info {
            justify-content: center;
        }

        .center-name {
            font-size: 1.125rem;
        }

        .specialist-name {
            font-size: 0.8rem;
        }

        .specialty {
            font-size: 0.8rem;
        }
    }

    @media (max-width: 480px) {
        .center-name {
            font-size: 1rem;
        }

        .header {
            padding: 0.4rem 0;
        }

        .user-info {
            flex-direction: column;
            gap: 0.5rem;
        }
    }
</style>
