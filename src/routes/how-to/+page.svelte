<script lang="ts">
  import { onMount } from "svelte";
  import "../../app.css";
    import { resolve } from "$app/paths";

  onMount(() => {});

  let logoutUrl = `/oauth2/sign_out?rd=${window.location.protocol}%2F%2F${window.location.hostname}%2Flogout`;
</script>

<header class="header">
  <img
    src="/search/BBMRI-ERIC-gateway-for-health.svg"
    alt="BBMRI"
    height="34px"
  />
  <menu class="menu">
    <a href="https://www.bbmri-eric.eu/about/">About Us</a>
    <a href="{resolve(`/how-to`)}">Tutorial</a>
    <a href="mailto:locator@helpdesk.bbmri-eric.eu">Contact</a>
    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
    <a href={logoutUrl}>Logout</a>
  </menu>
</header>
<div class="banner">
  <h1>BBMRI-ERIC Locator</h1>
  <h2>Search for human biospecimens across European biobanks</h2>
</div>

<main>
  <h1>How to</h1>

  <div class="cta">
    <p style="font-weight:700;margin:0">Text Tutorials</p>
    <p>
      <a
        href="https://bbmrieric.sharepoint.com/:b:/s/BBMRI-ERICPublicDocuments/EVA1Tf3l17NAmnR5AWF7Y3oB4OFGKP1YALdLqZ3hsomTmg"
        >PDF-Tutorial</a
      >
    </p>
  </div>
  <div class="cta">
    <p style="font-weight:700;margin:0">Video Tutorials</p>
    <p>
      <a href="https://www.youtube.com/watch?v=sXcxRYXAZQQ">Youtube-Tutorial</a>
    </p>
    <p>
      <a
        href="https://drive.google.com/file/d/1D-RbGJikgags5ipuGUpGkQcNpE4QF8ub/view?pli=1"
        >Google Drive</a
      >
    </p>
  </div>

  <div class="cta">
    <div>
      <p style="font-weight:700;margin:0">You don’t see your biobank here?</p>
      <p style="margin:6px 0 0;color:var(--muted)">
        Checkout how to join the federated platform and make your resources
        discoverable.
      </p>
    </div>
    <div>
      <a
        class="btn"
        href="https://www.bbmri-eric.eu/federated-platform/"
        target="_blank"
        rel="noopener">How to join</a
      >
    </div>
  </div>
</main>

<style>
  :root {
    --accent: #E95713;
  }
  /* footer CTA */
  .cta {
    margin-top: 26px;
    padding: 20px;
    border-radius: 12px;
    background: linear-gradient(
      90deg,
      rgba(107, 63, 160, 0.06),
      rgba(107, 63, 160, 0.03)
    );
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .cta p {
    margin: 0;
  }
  /* link-style button */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    background: var(--accent);
    color: white;
    text-decoration: none;
    font-weight: 600;
  }
  .btn.secondary {
    background: transparent;
    color: var(--accent);
    border: 1px solid rgba(107, 63, 160, 0.12);
  }

  /* subtle link list */
  a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;
  }
</style>
