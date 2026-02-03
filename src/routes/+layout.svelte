<script lang="ts">
  import "../app.css";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  const logoutUrl = `/oauth2/sign_out?rd=${page.url.protocol}%2F%2F${page.url.hostname}%2Flogout`;
</script>

<header>
  <a href={resolve("/")}>
    <img
      src="/search/BBMRI-ERIC-gateway-for-health.svg"
      alt="BBMRI"
      height="34px"
    />
  </a>
  <menu class="menu">
    <a href="https://www.bbmri-eric.eu/about/">About Us</a>
    <a href={resolve("/tutorial")}>Tutorial</a>
    <a href="mailto:locator@helpdesk.bbmri-eric.eu">Contact</a>
    <a href={logoutUrl} rel="external">Logout</a>
  </menu>
</header>

<slot />

<footer>
  <div>
    <img
      src="/search/german-cancer-research-center-dkfz-logo-vector.svg"
      alt="German Cancer Research Center"
      height="40"
    />
    <img src="/search/GBN_logo.svg" alt="German Biobank Node" height="45" />
    <img src="/search/logo_ce-en-rvb-lr.jpg" alt="EU" height="50" />
  </div>
  <div>
    <a href="https://www.bbmri-eric.eu/privacy-notice/">Privacy Policy</a>
    <lens-about></lens-about>
  </div>
</footer>
